import { AREA, CRIME, POPULATION } from "./Constants.js";
import Choropleth from "./ui/Choropleth.js";
import Heat from "./ui/Heat.js";
import MultiSlope from "./ui/MultiSlope.js";
import Simulate from "./ui/Simulate.js";
import Slope from "./ui/Slope.js";
import Tree from "./ui/Tree.js";
import { createSVG, pick, removeChildren, sum } from "./ui/Utilities.js";

const ELEMENTS = {
	tree: document.body.querySelector("#Types .tree"),

	district: document.body.querySelector("#Rates .district"),
	crime2010: document.body.querySelector("#Rates .crime-2010"),
	crime2015: document.body.querySelector("#Rates .crime-2015"),
	totalChange: document.body.querySelector("#Rates .total-change"),
	percentChange: document.body.querySelector("#Rates .percent-change"),
	ranking: document.body.querySelector("#Rates .ranking"),
	choropleth: document.body.querySelector("#Rates .choropleth"),
	multiSlope: document.body.querySelector("#Rates .line.multi"),
	linesContainer: document.body.querySelector("#Rates .lines-container"),

	simulate: document.body.querySelector("#Simulations .simulate"),

	heats: Array.from(document.body.querySelectorAll("#Comparison .heat")),
};

d3.csv("data/slopegraph.csv", csv => {
	let formattedChoropleth = {};
	let formattedLines = {};
	let formattedMultiSlope = {};
	let formattedSimulate = {};
	let maxTotalCrime = 0;

	for (let row of csv) {
		let area = parseInt(row["Area.ID"]);
		if (!(area in formattedChoropleth))
			formattedChoropleth[area] = {};
		if (!(area in formattedLines))
			formattedLines[area] = [];
		if (!(area in formattedMultiSlope))
			formattedMultiSlope[area] = [];

		let year = parseInt(row["Year"]);
		let formattedYear = d3.timeParse("%Y")(year);

		let crimes = {};
		for (let crime in row) {
			if (crime === "Area.ID" || crime === "Year")
				continue;

			crimes[CRIME[crime]] = parseInt(row[crime]);

			if (!(crime in formattedMultiSlope[area]))
				formattedMultiSlope[area][crime] = [];

			if (year !== 2016 && year !== 2017) {
				formattedMultiSlope[area][crime].push({
					key: formattedYear,
					value: crimes[CRIME[crime]],
				});
			}
		}

		if (year !== 2016 && year !== 2017) {
			let totalCrime = sum(crimes);

			formattedLines[area].push({
				key: formattedYear,
				value: totalCrime,
			});

			maxTotalCrime = Math.max(maxTotalCrime, totalCrime);

			if (year === 2010 || year === 2015) {
				formattedChoropleth[area][year] = totalCrime;

				if (year === 2010)
					formattedChoropleth[area].crimes = crimes;

				if (year === 2015) {
					for (let key in formattedChoropleth[area].crimes)
						formattedChoropleth[area].crimes[key] = (crimes[key] - formattedChoropleth[area].crimes[key]) / (formattedChoropleth[area].crimes[key] || crimes[key]);
				}
			}
		}

		if (year === 2017)
			formattedSimulate[area] = crimes;
	}

	for (let item of Object.values(formattedChoropleth)) {
		item.difference = item[2015] - item[2010];
		item.percentage = (item[2015] - item[2010]) / item[2010];
		item.crimes = Object.entries(item.crimes)
			.sort((a, b) => b[1] - a[1])
			.map(([crime, change]) => crime);
	}

	let selected = null;
	let choropleth = null;
	let slopes = null;
	let multiSlope = null;
	function updateSelected(key) {
		let multiSlopeData = formattedMultiSlope[key];
		let multiSlopeDomain = {
			x: [multiSlopeData[0][0].key, multiSlopeData[0][multiSlopeData[0].length - 1].key],
			y: [0, Math.max(...multiSlopeData.map(item => Math.max(...item.map(subitem => subitem.value))))],
			z: CRIME,
		};

		let choroplethData = formattedChoropleth[key];
		let crime2010 = choroplethData[2010];
		let crime2015 = choroplethData[2015];

		ELEMENTS.district.textContent = AREA[key];
		ELEMENTS.crime2010.textContent = crime2010;
		ELEMENTS.crime2015.textContent = crime2015;

		ELEMENTS.totalChange.textContent = choroplethData.difference;
		ELEMENTS.totalChange.style.setProperty("color", crime2015 > crime2010 ? "red" : "blue");

		ELEMENTS.percentChange.textContent = (choroplethData.percentage * 100).toFixed(2) + "%";
		ELEMENTS.percentChange.style.setProperty("color", crime2015 > crime2010 ? "red" : "blue");

		removeChildren(ELEMENTS.ranking);
		for (let crime of formattedChoropleth[key].crimes) {
			let listItemElement = ELEMENTS.ranking.appendChild(document.createElement("li"));
			listItemElement.textContent = crime;
		}

		if (!multiSlope) {
			multiSlope = new MultiSlope(multiSlopeData, {
				container: ELEMENTS.multiSlope,
				width: 500,
				height: 250,
				margin: {
					top: 10,
					right: 20,
					bottom: 25,
					left: 50,
				},
				axis: {
					x: true,
					y: true,
				},
				domain: multiSlopeDomain,
			});
		} else
			multiSlope.update(multiSlopeData, multiSlopeDomain);

		if (slopes[selected])
			slopes[selected].element.classList.remove("selected");
		selected = key;
		if (slopes[selected])
			slopes[selected].element.classList.add("selected");
	}

	d3.json("data/lapd-divisions.geojson", json => {
		let data = {
			deltas: formattedChoropleth,
			topojson: json,
		};
		choropleth = new Choropleth(data, {
			container: ELEMENTS.choropleth,
			width: 500,
			height: 350,
			handleClick(d) {
				updateSelected(d.properties.external_id);
			},
		});
	});

	slopes = Object.keys(formattedLines).reduce((accumulator, key) => {
		accumulator[key] = new Slope(formattedLines[key], {
			container: ELEMENTS.linesContainer.appendChild(createSVG("svg")),
			width: 150,
			height: 30,
			margin: {
				top: 5,
				right: 5,
				bottom: 5,
				left: 5,
			},
			axis: {
				x: true,
				y: true,
			},
			domain: {
				x: d3.extent(formattedLines[key], d => d.key),
				y: [0, maxTotalCrime],
			},
		});
		accumulator[key].element.appendChild(createSVG("title")).textContent = AREA[key];
		accumulator[key].element.addEventListener("mouseover", (event) => {
			if (choropleth)
				choropleth.highlight(key);
		});
		accumulator[key].element.addEventListener("mouseleave", (event) => {
			if (choropleth)
				choropleth.highlight();
		});
		accumulator[key].element.addEventListener("click", (event) => {
			updateSelected(key);
		});
		return accumulator;
	}, {});

	updateSelected(pick(Object.keys(formattedMultiSlope)));

	new Simulate(formattedSimulate, {
		container: ELEMENTS.simulate,
	});
});

d3.queue()
	.defer(d3.csv, "data/heatmap_2010.csv")
	.defer(d3.csv, "data/heatmap_2015.csv")
	.await((error, csv2010, csv2015) => {
		let formattedHeat = {};
		let areas = new Set;
		function parseCSV(csv, year) {
			formattedHeat[year] = Object.values(csv.reduce((accumulator, item) => {
				let area = item["Area.ID"];
				areas.add(area);
				if (!(area in accumulator))
					accumulator[area] = {};

				let key = item["Latitude"] + item["Longitude"];
				if (!(key in accumulator[area])) {
					let x = parseFloat(item["Latitude"]);
					let y = parseFloat(item["Longitude"]);
					accumulator[area][key] = {
						x,
						y,
						data: new Heat.Point(x, y),
					};
				}
				accumulator[area][key].data.add(item["Consolidated.Description"]);
				return accumulator;
			}, {}));
			for (let key in formattedHeat[year])
				formattedHeat[year][key] = Object.values(formattedHeat[year][key]);
		}
		parseCSV(csv2010, 2010);
		parseCSV(csv2015, 2015);

		function createHeat(container, {area, year}) {
			let heat = new Heat(formattedHeat, {
				container,
				zoom: 12,
				defaultArea: area,
				defaultYear: year,
			});
			heat.element.style.setProperty("height", heat.element.offsetWidth + "px");
		}

		let area = pick(Array.from(areas));
		createHeat(ELEMENTS.heats[0], {
			area,
			year: "2010",
		});
		createHeat(ELEMENTS.heats[1], {
			area,
			year: "2015",
		});
	});

d3.json("data/types.json", json => {
	new Tree(json, {
		container: ELEMENTS.tree,
		width: 800,
		height: 1165,
		margin: {
			top: 15,
			right: 90,
			bottom: 15,
			left: 135,
		},
	})
});

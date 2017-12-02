import { AREA, COLOR, CRIME, POPULATION } from "./Constants.js";
import Choropleth from "./ui/Choropleth.js";
import Heat from "./ui/Heat.js";
import MultiSlope from "./ui/MultiSlope.js";
import MultiStackedColumn from "./ui/MultiStackedColumn.js";
import Simulate from "./ui/Simulate.js";
import Slope from "./ui/Slope.js";
import Tree from "./ui/Tree.js";
import { createSVG, difference, gradientValue, pick, removeChildren, sum, scroll, scrollTop } from "./ui/Utilities.js";

const ELEMENTS = {
	gradient: document.body.querySelector("#Rates-gradient"),

	nav: document.body.querySelector("nav"),
	navLinks: Array.from(document.body.querySelectorAll("header > nav > a")),
	sections: new Map(Array.from(document.body.querySelectorAll("section")).map(section => ["#" + section.id, section])),

	tree: document.body.querySelector("#Types .tree"),

	district: document.body.querySelector("#Rates .district"),
	crime2010: document.body.querySelector("#Rates .crime-2010"),
	crime2015: document.body.querySelector("#Rates .crime-2015"),
	totalChange: document.body.querySelector("#Rates .total-change"),
	percentChange: document.body.querySelector("#Rates .percent-change"),
	ranking: document.body.querySelector("#Rates .ranking"),
	choropleth: document.body.querySelector("#Rates .choropleth"),
	choroplethLegend: document.body.querySelector("#Rates .choropleth + .legend"),
	multiSlope: document.body.querySelector("#Rates .line.multi"),
	linesContainer: document.body.querySelector("#Rates .lines-container"),

	simulate: document.body.querySelector("#Simulations .simulate"),

	heats: Array.from(document.body.querySelectorAll("#Comparison .heat")),

	multiStackedColumn: document.body.querySelector("#Time .column.stacked.multi"),
};

for (let link of ELEMENTS.navLinks) {
	link.addEventListener("click", event => {
		let section = ELEMENTS.sections.get(event.target.hash);
		if (!section)
			return;

		history.pushState({}, "", event.target.href);
		scroll(scrollTop(section), 400);
		event.preventDefault();
	});
}

let navScrollTop = scrollTop(ELEMENTS.nav);
function handleScroll(event) {
	ELEMENTS.nav.classList.toggle("scrolled", scrollTop() - 1 > navScrollTop);
}
window.addEventListener("scroll", handleScroll);
handleScroll();

d3.csv("data/slopegraph.csv", csv => {
	let formattedChoropleth = {};
	let formattedLines = {};
	let formattedMultiSlope = {};
	let formattedSimulate = {};

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

			if (year === 2010 || year === 2015) {
				formattedChoropleth[area][year] = totalCrime;

				if (year === 2010)
					formattedChoropleth[area].crimes = crimes;

				if (year === 2015) {
					for (let key in formattedChoropleth[area].crimes)
						formattedChoropleth[area].crimes[key] = difference(formattedChoropleth[area].crimes[key], crimes[key]);
				}
			}
		}

		if (year === 2017)
			formattedSimulate[area] = crimes;
	}

	let minPercentChange = Infinity;
	let maxPercentChange = 0;
	for (let item of Object.values(formattedChoropleth)) {
		item.difference = item[2015] - item[2010];
		item.percentage = difference(item[2010], item[2015]);
		item.crimes = Object.entries(item.crimes)
			.sort((a, b) => b[1] - a[1])
			.map(([crime, change]) => crime);

		minPercentChange = Math.min(minPercentChange, item.percentage);
		maxPercentChange = Math.max(maxPercentChange, item.percentage);
	}

	let minTotalChange = Infinity;
	let maxTotalChange = 0;
	for (let item of Object.values(formattedLines)) {
		for (let i = 0; i < item.length - 1; ++i) {
			item[i].key = item[i + 1].key;
			item[i].value = difference(item[i].value, item[i + 1].value) * 100;

			minTotalChange = Math.min(minTotalChange, item[i].value);
			maxTotalChange = Math.max(maxTotalChange, item[i].value);
		}
		item.length = item.length - 1;
	}

	let selected = null;
	let choropleth = null;
	let slopes = null;
	let multiSlope = null;
	function updateSelected(key) {
		let multiSlopeData = formattedMultiSlope[key];
		let multiSlopeDomain = {
			x: [multiSlopeData[0][0].key, multiSlopeData[0][multiSlopeData[0].length - 1].key],
			y: [0, Math.max(...multiSlopeData.map(item => Math.max(...item.map(subitem => subitem.value)))) * 1.05],
			color: Object.keys(CRIME),
		};
		let multiSlopeColor = d3.scaleOrdinal(COLOR);

		let choroplethData = formattedChoropleth[key];
		let crime2010 = choroplethData[2010];
		let crime2015 = choroplethData[2015];

		ELEMENTS.district.textContent = AREA[key];
		ELEMENTS.crime2010.textContent = crime2010;
		ELEMENTS.crime2015.textContent = crime2015;

		ELEMENTS.totalChange.textContent = choroplethData.difference;
		ELEMENTS.totalChange.style.setProperty("color", choroplethData.percentage < 0 ? gradientValue("color1") : gradientValue("color3"));

		ELEMENTS.percentChange.textContent = (choroplethData.percentage * 100).toFixed(2) + "%";
		ELEMENTS.percentChange.style.setProperty("color", choroplethData.percentage < 0 ? gradientValue("color1") : gradientValue("color3"));

		removeChildren(ELEMENTS.ranking);

		for (let crime of formattedChoropleth[key].crimes) {
			let listItemElement = ELEMENTS.ranking.appendChild(document.createElement("div"));
			listItemElement.textContent = crime;
			listItemElement.style.setProperty("background-color", COLOR[CRIME.indexOf(crime)]);
		}

		if (!multiSlope) {
			multiSlope = new MultiSlope(multiSlopeData, {
				container: ELEMENTS.multiSlope,
				width: 400,
				height: 150,
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
				color: multiSlopeColor,
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
			legend: true,
			domain: [minPercentChange, 0, maxPercentChange],
			range: [gradientValue("color1"), "hsl(0, 0%, 90%)", gradientValue("color3")],
			handleClick(d) {
				updateSelected(d.properties.external_id);
			},
		});

		function addLegendPoint(percentage) {
			ELEMENTS.choroplethLegend.appendChild(document.createElement("span")).textContent = (percentage * 100).toFixed(2) + "%";
		}
		addLegendPoint(maxPercentChange);
		addLegendPoint(maxPercentChange / 2);
		addLegendPoint(0);
		addLegendPoint(minPercentChange / 2);
		addLegendPoint(minPercentChange);
	});

	const slopeHeight = 30;
	const slopeMargin = {
		top: 5,
		right: 5,
		bottom: 5,
		left: 5,
	};
	ELEMENTS.gradient.setAttribute("y1", slopeHeight - slopeMargin.top - slopeMargin.bottom);
	ELEMENTS.gradient.setAttribute("y2", slopeMargin.bottom);
	Array.from(ELEMENTS.gradient.querySelectorAll("stop"), (stop, i) => {
		stop.setAttribute("offset", gradientValue("offset" + (i + 1)));
		stop.setAttribute("stop-color", gradientValue("color" + (i + 1)));
	});

	slopes = Object.keys(formattedLines).reduce((accumulator, key) => {
		accumulator[key] = new Slope(formattedLines[key], {
			container: ELEMENTS.linesContainer.appendChild(createSVG("svg")),
			width: 150,
			height: slopeHeight,
			margin: slopeMargin,
			axis: {
				x: true,
				y: true,
			},
			domain: {
				x: d3.extent(formattedLines[key], d => d.key),
				y: [minTotalChange, maxTotalChange],
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

		let multiStackedColumnGroupKeys = new Set;
		let multiStackedColumnSubgroupKeys = new Set;
		let multiStackedColumnValues = new Set;
		let formattedMultiStackedColumn = csv2015.reduce((accumulator, item) => {
			let month = parseInt(item["Mo"]);
			multiStackedColumnGroupKeys.add(month);
			if (!(month in accumulator))
				accumulator[month] = [];

			let day = parseInt(item["Day"]);
			multiStackedColumnSubgroupKeys.add(day);
			if (!(day in accumulator[month]))
				accumulator[month][day] = [];

			let hour = parseInt(item["Hour"]) || 0;
			multiStackedColumnValues.add(hour);
			if (!(hour in accumulator[month][day]))
				accumulator[month][day][hour] = [];

			let crime = parseInt(item["Consolidated.Description"]);
			if (!(crime in accumulator[month][day][hour]))
				accumulator[month][day][hour][crime] = 0;

			++accumulator[month][day][hour][crime];
			return accumulator;
		}, []);

		new MultiStackedColumn(formattedMultiStackedColumn, {
			container: ELEMENTS.multiStackedColumn,
			width: 960,
			height: 500,
			margin: {
				top: 10,
				right: 5,
				bottom: 20,
				left: 40,
			},
			axis: {
				x: true,
				y: true,
			},
			legend: true,
			domain: {
				x: {
					group: Array.from(multiStackedColumnGroupKeys).sort((a, b) => a - b),
					subgroup: Array.from(multiStackedColumnSubgroupKeys).sort((a, b) => a - b),
					values: Array.from(multiStackedColumnValues).sort((a, b) => a - b),
				},
			},
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

import { AREA, CRIME, POPULATION } from "./Constants.js";
import Heat from "./ui/Heat.js";
import Simulate from "./ui/Simulate.js";
import Slope from "./ui/Slope.js";
import Tree from "./ui/Tree.js";
import { sum } from "./ui/Utilities.js";
import SlopeGraphsViz from './ui/SlopeGraphsViz.js';

d3.csv("data/slopegraph.csv", csv => {
	let areas = csv.reduce((accumulator, row) => {
		let area = row["Area.ID"];
		let year = row["Year"];
		let crimes = {};
		for (let crime in row) {
			if (crime !== "Area.Name" && crime !== "Year")
				crimes[CRIME[crime]] = parseInt(row[crime]);
		}

		if (!(area in accumulator))
			accumulator[area] = [];

		crimes.year = parseInt(year);
		accumulator[+area].push(crimes);
		return accumulator;
	}, {});

	new SlopeGraphsViz(areas, {
		container: document.body,
		width: 1366,
		// height: 768,
		margin: {
			top: 10,
			right: 20,
			bottom: 25,
			left: 50
		}
	});

	for (let [area, data] of Object.entries(areas)) {
		let formattedSlope = data.map((item) => {
			let crimes = [];
			for (let key in item) {
				if (key !== "year")
					crimes.push(item[key]);
			}
			return {
				year: d3.timeParse("%Y")(item.year),
				rate: sum(crimes),
			}
		});
	}

	let formattedSimulate = Object.entries(areas).reduce((accumulator, [area, data]) => {
		accumulator[area] = {};
		for (let key in data[data.length - 1]) {
			if (CRIME.includes(key))
				accumulator[area][key] = data[data.length - 1][key];
		}
		return accumulator;
	}, {});
	new Simulate(formattedSimulate, {
		container: document.body,
	});
});

d3.csv("data/heatmap_2015.csv", csv => {
	let formattedHeat = Object.values(csv.reduce((accumulator, item) => {
		let key = item["Latitude"] + item["Longitude"];
		if (!(key in accumulator)) {
			let x = parseFloat(item["Latitude"]);
			let y = parseFloat(item["Longitude"]);
			accumulator[key] = {
				x,
				y,
				data: new Heat.Point(x, y, AREA[item["Area.ID"]]),
			};
		}
		accumulator[key].data.add(CRIME[item["Consolidated.Description"]]);
		return accumulator;
	}, {}));

	new Heat(formattedHeat, {
		container: document.body,
		width: 1200,
		height: 800,
		zoom: 11,
		center: {
			lat: sum(formattedHeat.map(item => item.x)) / formattedHeat.length,
			lng: sum(formattedHeat.map(item => item.y)) / formattedHeat.length,
		},
	});
});

d3.json("data/types.json", json => {
	new Tree(json, {
		container: document.body,
		width: 1200,
		height: 800,
		margin: {
			top: 15,
			right: 90,
			bottom: 15,
			left: 135,
		},
	})
});

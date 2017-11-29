import Heat from "./ui/Heat.js";
import Simulate from "./ui/Simulate.js";
import Slope from "./ui/Slope.js";
import Tree from "./ui/Tree.js";
import {sum} from "./ui/Utilities.js";
import SlopeGraphsViz from './ui/SlopeGraphsViz.js';

export const CRIME = [
	"Assault and Battery",
	"Destruction of Property",
	"Domestic Disturbance",
	"Fraud",
	"Homicide",
	"Human Trafficking",
	"Kidnapping",
	"Resisting Arrest",
	"Theft",
	"Other",
];

export const AREA = [
	undefined, // IDs start at 1
	"Central",
	"Rampart",
	"Southwest",
	"Hollenbeck",
	"Harbor",
	"Hollywood",
	"Wilshire",
	"West LA",
	"Van Nuys",
	"West Valley",
	"Northeast",
	"77th Street",
	"Newton",
	"Pacific",
	"N Hollywood",
	"Foothill",
	"Devonshire",
	"Southeast",
	"Mission",
	"Olympic",
	"Topanga",
];

// http://www.lapdonline.org/
const POPULATION = {
	"77th Street": 175000,
	"Central":      40000,
	"Devonshire":  219136,
	"Foothill":    182214,
	"Harbor":      171000,
	"Hollenbeck":  200000,
	"Hollywood":   300000,
	"Mission":     225849,
	"N Hollywood": 220000,
	"Newton":      150000,
	"Northeast":   250000,
	"Olympic":     200000,
	"Pacific":     200000,
	"Rampart":     164961,
	"Southeast":   150000,
	"Southwest":   165000,
	"Topanga":      57032,
	"Van Nuys":    325000,
	"West LA":     228000,
	"West Valley": 196840,
	"Wilshire":    251000
};

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

		// let formattedSimulate = data[data.length - 1];
		// delete formattedSimulate["year"];
		// new Simulate(formattedSimulate, {
		// 	size: 100,
		// 	population: POPULATION[area],
		// });
	}
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

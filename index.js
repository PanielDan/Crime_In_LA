import Heat from "./ui/Heat.js";
import MultiSlope from "./ui/MultiSlope.js"
import Simulate from "./ui/Simulate.js";
import Slope from "./ui/Slope.js";
import Tree from "./ui/Tree.js";
import {sum} from "./ui/Utilities.js";
import Chloropleht from './ui/Chloropleth.js';

const CRIME = [
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
		let area = row["Area.Name"];
		let year = row["Year"];
		let crimes = {};
		for (let crime in row) {
			if (crime !== "Area.Name" && crime !== "Year")
				crimes[CRIME[crime]] = parseInt(row[crime]);
		}

		if (!(area in accumulator))
			accumulator[area] = [];

		crimes.year = parseInt(year);
		accumulator[area].push(crimes);
		return accumulator;
	}, {});

	let district = MultiSlope.slice(areas["Central"]);
	new MultiSlope(district, {
		container: document.body,
		width: 960,
		height: 500,
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
		domain: {
			y: MultiSlope.max(district),
			z: CRIME
		},
	});
	let districtCrimeSums = [];
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
		districtCrimeSums.push((formattedSlope[0].rate - formattedSlope[6].rate)/formattedSlope[6].rate);
		new Slope(formattedSlope, {
			container: document.body,
			width: 960,
			height: 500,
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
			domain: {
				y: [0, Math.max(...formattedSlope.map(item => item.rate))],
			},
			key: {
				x: "year",
				y: "rate",
			},
		});

		let formattedSimulate = data[data.length - 1];
		delete formattedSimulate["year"];
		new Simulate(formattedSimulate, {
			size: 100,
			population: POPULATION[area],
		});
	}
	console.log(districtCrimeSums);
});

d3.csv("data/heatmap_2015.csv", csv => {
	let formattedHeat = Object.values(csv.reduce((accumulator, item) => {
		let key = item["Latitude"] + item["Longitude"];
		if (!(key in accumulator)) {
			accumulator[key] = {
				lat: parseFloat(item["Latitude"]),
				lng: parseFloat(item["Longitude"]),
				value: 0,
			};
		}
		++accumulator[key].value;
		return accumulator;
	}, {}));

	let heatData = {
		max: sum(formattedHeat.map(item => item.value)) / formattedHeat.length,
		data: formattedHeat,
	};

	new Heat(heatData, {
		container: document.body,
		width: 1200,
		height: 800,
		zoom: 11,
		center: {
			lat: sum(formattedHeat.map(item => item.lat)) / formattedHeat.length,
			lng: sum(formattedHeat.map(item => item.lng)) / formattedHeat.length,
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

import {sum} from "./utilities.js";
import {slope} from "./slope.js";
import {simulate} from "./simulate.js";

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
	"Wilshire":    251000,
};

d3.csv("slopegraph.csv", csv => {
	let areas = csv.reduce((accumulator, row) => {
		let {"Area.Name": area, "Year": year, ...crimes} = row;

		for (let crime in crimes) {
			crimes[CRIME[crime]] = parseInt(crimes[crime]);
			delete crimes[crime];
		}

		if (!(area in accumulator))
			accumulator[area] = [];

		accumulator[area].push({year, ...crimes});
		return accumulator;
	}, {});

	for (let [area, data] of Object.entries(areas)) {
		let formattedSlope = data.map(({year, ...crimes}) => {
			return {
				year: d3.timeParse("%Y")(year),
				rate: sum(crimes),
			}
		});

		slope(formattedSlope, {
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
		let simulation = simulate(formattedSimulate, {
			size: 100,
			population: POPULATION[area],
		});
		document.body.appendChild(document.createElement("pre")).textContent = JSON.stringify(simulation, null, 2);
	}
});

d3.csv("heatmap_2015.csv", csv => {
	let formattedHeat = csv.map(item => {
		return {
			crime: CRIME[parseInt(item["Consolidated.Description"]) - 1],
			latitude: parseFloat(item["Latitude"]),
			longitude: parseFloat(item["Longitude"]),
			hour: parseInt(item["Hour"]),
			day: parseInt(item["Day"]),
			month: parseInt(item["Mo"]),
		};
	});
	console.log(formattedHeat);
});

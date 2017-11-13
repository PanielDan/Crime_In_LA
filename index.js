(function() {

"use strict";

function drawLine(data, options = {}) {
	let scale = {
		x: d3.scaleTime().rangeRound([0, options.width - options.margin.right - options.margin.left]),
		y: d3.scaleLinear().rangeRound([options.height - options.margin.top - options.margin.bottom, 0]),
	};

	scale.x.domain(options.domain.x || d3.extent(data, d => d[options.key.x]));
	scale.y.domain(options.domain.y || d3.extent(data, d => d[options.key.y]));

	let line = d3.line()
		.x(d => scale.x(d[options.key.x]))
		.y(d => scale.y(d[options.key.y]));

	let container = d3.select(options.container || article);

	let svg = container.append("svg")
		.attr("viewBox", `0 0 ${options.width}, ${options.height}`)
		.attr("class", "line");

	if (options.axis.x) {
		svg.append("g")
			.attr("class", "axis x")
			.attr("transform", `translate(${options.margin.left}, ${options.height - options.margin.bottom})`)
			.call(d3.axisBottom(scale.x));
	}

	if (options.axis.y) {
		svg.append("g")
			.attr("class", "axis y")
			.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`)
			.call(d3.axisLeft(scale.y));
	}

	svg.append("g")
		.attr("class", "chart")
		.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`)
		.append("path")
			.datum(data)
			.attr("d", line);
}

d3.csv("slopegraph.csv", csv => {
	let areas = csv.reduce((accumulator, row) => {
		let {"Area.Name": area, "Year": year, ...crimes} = row;

		for (let crime in crimes)
			crimes[crime] = parseInt(crimes[crime]);

		if (!(area in accumulator))
			accumulator[area] = [];

		accumulator[area].push({year, ...crimes});
		return accumulator;
	}, {});

	for (let area in areas) {
		let formatted = areas[area].map(({year, ...crimes}) => {
			return {
				year: d3.timeParse("%Y")(year),
				rate: Object.values(crimes).reduce((accumulator, item) => accumulator + item, 0),
			}
		});

		drawLine(formatted, {
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
			domain: {},
			key: {
				x: "year",
				y: "rate",
			},
		});
	}
});

})();

export default class Slope {
	constructor(data, options = {}) {
		let scale = {
			x: d3.scaleTime().rangeRound([0, options.width - options.margin.right - options.margin.left]),
			y: d3.scaleLinear().rangeRound([options.height - options.margin.top - options.margin.bottom, 0]),
		};

		scale.x.domain(options.domain.x || d3.extent(data, d => d[options.key.x]));
		scale.y.domain(options.domain.y || d3.extent(data, d => d[options.key.y]));

		let line = d3.line()
			.x(d => scale.x(d[options.key.x]))
			.y(d => scale.y(d[options.key.y]));

		let container = d3.select(options.container || "body");

		let svg = container.append("svg")
			.attr("viewBox", `0 0 ${options.width}, ${options.height}`)
			.attr("height", options.height + 'px')
			.attr("width", options.width + 'px')
			.attr("class", "line");

		if (options.notext) {
			d3.svg.axis().tickSize(0);
		}

		if (options.axis.x) {
			svg.append("g")
				.attr("class", "axis x")
				.attr("transform", `translate(${options.margin.left}, ${options.height - options.margin.bottom})`)
				.call(d3.axisBottom(scale.x).tickValues([]));
		}

		if (options.axis.y) {
			svg.append("g")
				.attr("class", "axis y")
				.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`)
				.call(d3.axisLeft(scale.y).tickValues([]));
		}

		svg.append("g")
			.attr("class", "chart")
			.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`)
			.append("path")
				.datum(data)
				.attr("d", line)
				.style("stroke-width", 2);
	}
}

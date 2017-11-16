export function slope(data, options = {}) {
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

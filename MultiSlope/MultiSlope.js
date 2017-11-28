export default class MultiSlope {

	constructor(data, options = {}) {
		let scale = {
			x: d3.scaleTime().rangeRound([0, options.width - options.margin.right - options.margin.left]),
			y: d3.scaleLinear().rangeRound([options.height - options.margin.top - options.margin.bottom, 0]),
			z: d3.scaleOrdinal(d3.schemeCategory10)
		};

		scale.x.domain(options.domain.x || d3.extent([2010, 2011, 2012, 2013, 2014, 2015]));
		scale.y.domain(options.domain.y);
		scale.z.domain(options.domain.z || Object.keys(data[0]));
		console.log(data);
		let line = d3.line()
			.x(d => {
				console.log(d);
				return scale.x(d.year);}
			)
			.y(d => scale.y(d.value));

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
		let crimes = svg.selectAll(".city")
			.data(data)
			.enter().append("g")
			.attr("class", "city");

		crimes.append("path")
			.attr("class", "line")
			.attr("d",  d => line(d.data))
			.style("stroke", d => z(d.id));

		// svg.append("g")
		// 	.attr("class", "chart")
		// 	.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`)
		// 	.append("path")
		// 	.datum(data)
		// 	.attr("d", line);
	}
}

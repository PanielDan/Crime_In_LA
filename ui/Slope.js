export default class Slope {
	constructor(data, options = {}) {
		let scale = {
			x: d3.scaleTime().rangeRound([0, options.width - options.margin.right - options.margin.left]),
			y: d3.scaleLinear().rangeRound([options.height - options.margin.top - options.margin.bottom, 0]),
		};

		scale.x.domain(options.domain.x);
		scale.y.domain(options.domain.y);

		let line = d3.line()
			.x(d => scale.x(d.key))
			.y(d => scale.y(d.value));

		this._svg = d3.select(options.container)
			.attr("viewBox", `0 0 ${options.width} ${options.height}`)
			.attr("class", "line");

		if (options.axis.x) {
			let axis = d3.axisBottom(scale.x);
			if (!options.axis.text)
				axis.ticks(0);

			this._svg.append("g")
				.attr("class", "axis x")
				.attr("transform", `translate(${options.margin.left}, ${options.height - options.margin.bottom})`)
				.call(axis);
		}

		if (options.axis.y) {
			let axis = d3.axisLeft(scale.y);
			if (!options.axis.text)
				axis.ticks(0);

			let axisGroup = this._svg.append("g")
				.attr("class", "axis y")
				.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`);

			axisGroup.call(axis);

			axisGroup.append("line")
				.attr("class", "zero")
				.attr("x1", 0)
				.attr("y1", scale.y(0))
				.attr("x2", options.width - options.margin.right - options.margin.left)
				.attr("y2", scale.y(0));
		}

		this._svg.append("g")
			.attr("class", "chart")
			.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`)
			.append("path")
				.datum(data)
				.attr("d", line)
				.style("stroke-width", 2);
	}

	get element() { return this._svg.node(); }
}

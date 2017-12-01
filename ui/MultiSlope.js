export default class MultiSlope {
	constructor(data, options = {}) {
		this._scale = {
			x: d3.scaleTime().rangeRound([0, options.width - options.margin.right - options.margin.left]),
			y: d3.scaleLinear().rangeRound([options.height - options.margin.top - options.margin.bottom, 0]),
			color: options.color,
		};

		this._line = d3.line()
			.x(d => this._scale.x(d.key))
			.y(d => this._scale.y(d.value));

		this._svg = d3.select(options.container)
			.attr("viewBox", `0 0 ${options.width} ${options.height}`)
			.attr("class", "line multi");

		this._chart = this._svg.append("g")
			.attr("class", "chart")
			.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`);

		this._axis = {};
		if (options.axis.x) {
			this._axis.x = this._svg.append("g")
				.attr("class", "axis x")
				.attr("transform", `translate(${options.margin.left}, ${options.height - options.margin.bottom})`);
		}
		if (options.axis.y) {
			this._axis.y = this._svg.append("g")
				.attr("class", "axis y")
				.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`);
		}

		this.update(data, options.domain);
	}

	update(data, domain) {
		this._scale.x.domain(domain.x);
		this._scale.y.domain(domain.y);
		this._scale.color.domain(domain.color);

		let paths = this._chart.selectAll("path")
			.data(data);

		let pathsEnter = paths.enter()
			.append("path")
				.style("stroke", (d, i) => this._scale.color(i));

		pathsEnter.merge(paths)
			.transition()
				.attr("d", this._line);

		paths.exit()
			.remove();

		this._createAxis();
	}

	_createAxis() {
		if (this._axis.x) {
			this._axis.x.transition()
				.call(d3.axisBottom(this._scale.x));
		}

		if (this._axis.y) {
			this._axis.y.transition()
				.call(d3.axisLeft(this._scale.y).ticks(5));
		}
	}
}

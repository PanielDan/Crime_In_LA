export default class MultiSlope {
	constructor(data, options = {}) {
		let scale = {
			x: d3.scaleTime().rangeRound([0, options.width - options.margin.right - options.margin.left]),
			y: d3.scaleLinear().rangeRound([options.height - options.margin.top - options.margin.bottom, 0]),
			z: d3.scaleOrdinal(d3.schemePaired)
		};

		scale.x.domain(options.domain.x || d3.extent(data[0].data, d => d.year));
		scale.y.domain([0, options.domain.y]);
		scale.z.domain(options.domain.z || Object.keys(data[0]));

		let line = d3.line()
			.x(d =>  scale.x(d.year))
			.y(d => scale.y(d.value));

		let container = d3.select(options.container || "body");

		let svg = container.append("svg")
			.attr("viewBox", `0 0 ${options.width}, ${options.height}`)
			.attr("class", "line multi");

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
			.selectAll("path")
				.data(data)
				.enter()
				.append("path")
					.attr("d",  d => line(d.data))
					.style("stroke", d => scale.z(d.key))
					.style("stroke-width", 3);
	}

	static slice(data) {
		return Object.keys(data[0]).map(key => {
			return {
				key,
				data: data.map(item => {
					return {
						year: item.year,
						value: item[key],
					};
				}),
			}
		});
	}

	static max(slice) {
		return Math.max(...Object.values(slice).map(item => Math.max(...item.data.map(subitem => subitem.value))));
	}
}

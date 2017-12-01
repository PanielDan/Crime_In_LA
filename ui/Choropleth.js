import { AREA } from "../Constants.js";

export default class Choropleth {
	constructor(data, options = {}) {
		let color = d3.scaleLinear()
			.domain(options.domain)
			.range(options.range);

		let svg = d3.select(options.container)
			.attr("viewBox", `0 0 ${options.width} ${options.height}`)
			.attr("class", "choropleth");

		let chart = svg.append("g")
			.attr("class", "chart");

		let projection = d3.geoAlbers()
			.scale(1)
			.translate([0, 0]);

		let path = d3.geoPath()
			.projection(projection);

		let bounds = path.bounds(data.topojson);
		let scale = 0.90 / Math.max((bounds[1][0] - bounds[0][0]) / options.width, (bounds[1][1] - bounds[0][1]) / options.height);
		projection.scale(scale);
		projection.translate([
			(options.width - (scale * (bounds[1][0] + bounds[0][0]))) / 2,
			(options.height - (scale * (bounds[1][1] + bounds[0][1]))) / 2,
		]);

		this._features = chart.selectAll("path")
			.data(data.topojson.features)
			.enter()
			.append("path")
				.attr("d", path)
				.attr("fill", d => color(data.deltas[d.properties.external_id].percentage))
				.attr("stroke", "black");

		if (options.handleClick) {
			this._features.on("click", options.handleClick);
		}

		this._features.append("title")
			.text(d => AREA[d.properties.external_id]);
	}

	highlight(area) {
		this._features.transition()
			.attr("fill-opacity", d => area === undefined || d.properties.external_id === area ? 1 : 0);
	}
}

import { AREA } from "../Constants.js";

export default class Choropleth {
	constructor(data, options = {}) {
		let min = Math.min(...Object.values(data.deltas).map(item => item.percentage));
		let max = Math.max(...Object.values(data.deltas).map(item => item.percentage));
		let color = d3.scaleLinear()
			.domain([min, 0, max])
			.range(["steelblue", "hsl(0, 0%, 90%)", "hsl(0, 100%, 40%)"]);

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
			.attr("fill-opacity", d => area === undefined || d.properties.external_id === area ? 1 : 0)
			.attr("stroke", area === undefined ? "black" : "lightgrey");
	}
}

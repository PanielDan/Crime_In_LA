import { AREA } from "../Constants.js";
import { kebabCase } from "./Utilities.js";

export default class Choropleth {
    constructor(data, options = {}) {
        let min = Math.min(...data);
        let max = Math.max(...data);
        let color = d3.scaleLinear()
            .domain([min, 0, max])
            .range(['green','white','blue']);

        let container = d3.select(options.container || "body");

        let svg = container.append("svg")
            .attr("viewBox", `0 0 ${options.width}, ${options.height}`)
            .attr("height", options.height)
            .attr("width", options.width)
            .attr("class", "chloropleth");

        let render = (error, map) => {
            if (error) return console.warn(error);
            
            // Create a unit projection.
            const laProjection = d3.geoAlbers()
                .scale(1)
                .translate([0, 0]);

            // Create a path generator                              
            const path = d3.geoPath()
                .projection(laProjection);

            // Compute the bounds of a feature of interest, 
            // then derive scale & translate.
            const laBounds = path.bounds(map);
            const laScale = 0.90 / Math.max(
                (laBounds[1][0] - laBounds[0][0]) / options.width,
                (laBounds[1][1] - laBounds[0][1]) / options.height
            );
            const laTranslate = [
                (options.width - laScale * (laBounds[1][0] + laBounds[0][0])) / 2,
                (options.height - laScale * (laBounds[1][1] + laBounds[0][1])) / 2
            ];

            // Update the projection to use computed scale & translate.
            laProjection.scale(laScale)
                .translate(laTranslate);

            this._features = svg.selectAll("path")
                .data(map.features)
                .enter()
                .append("path")
                    .attr("d", path)
                    .attr("id", d => kebabCase(AREA[d.properties.external_id]))
                    .attr("fill", d => color(data[d.properties.external_id-1]))
                    .attr("stroke", "black");

            this._features.append("title")
                .text(d => AREA[d.properties.external_id]);
        };

        d3.queue()
            .defer(d3.json, "./data/lapd-divisions.geojson")
            .await(render)
    }

    highlight(area) {
        this._features.transition().duration(400)
            .attr("fill-opacity", d => area === undefined || d.properties.external_id === area ? 1 : 0)
            .attr("stroke", area === undefined ? "black" : "lightgrey");
    }
}
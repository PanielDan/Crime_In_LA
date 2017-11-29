import { AREAS } from "../index.js";
import { kebabCase } from "./Utilities.js";

export default class Choropleth {
    constructor(data, options = {}) {
        let min = Math.min(...data);
        let max = Math.max(...data);
        let color = d3.scaleLinear()
            .domain([min,0, max])
            // .range(d3.schemeRdYlGn[10]);
            .range(['green','white','red']);
        console.log(color(data[5]));

        let container = d3.select(options.container || "body");

        let svg = container.append("svg")
            .attr("viewBox", `0 0 ${options.width}, ${options.height}`)
            .attr("class", "chloropleth");

        d3.queue()
            .defer(d3.json, './data/lapd-divisions.geojson')
            .await(render)

        function render(error, map) {
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
            const laScale = 0.95 / Math.max(
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

            console.log(data);
            svg.selectAll('.chloropleth')
                .data(map.features)
                .enter()
                .append('path')
                    .attr('d', path)
                    .attr('id', d => kebabCase(AREAS[d.properties.external_id]))
                    .attr('fill', d => color(data[d.properties.external_id-1]))
                    .attr('stroke', 'black');
        }
    }
    interpolate(data)
    {

    }
}
export default class Chloropleth {
    constructor(data, options = {}) {
        let color = d3.scaleOrdinal(d3.schemeCategory20);
        let container = d3.select(options.container || "body");

        let svg = container.append("svg")
            .attr("viewBox", `0 0 ${options.width}, ${options.height}`)
            .attr("class", "chloropleth");

        d3.queue()
            .defer(d3.json, './data/lapd-divisions.geojson')
            .await(render)

        function render(error, la) {
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
            const laBounds = path.bounds(la);
            const laScale = 0.95 / Math.max(
                (laBounds[1][0] - laBounds[0][0]) / options.width,
                (laBounds[1][1] - laBounds[0][1]) / options.height
            );
            const laTranslate = [
                (options.width - laScale * (laBounds[1][0] + laBounds[0][0])) / 2,
                (options.height - laScale * (laBounds[1][1] + laBounds[0][1])) / 2
            ];

            // Update the projection to use computed scale & translate.
            console.log(laBounds);
            console.log(laScale, laTranslate)
            laProjection.scale(laScale)
                .translate(laTranslate);

            console.log(la.features);
            svg.selectAll('.chloropleth')
                .data(la.features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('fill', d => {
                    console.log(d.properties.external_id);
                    return color(d.properties.external_id);
                })
                .attr('stroke', 'black');

            // svg.selectAll("path")
            //     .data(data)
            //     .enter()
            //     .append("path")
            //     .attr("d", path)
            //     .attr("fill", "lightgrey");
        }
    }
}
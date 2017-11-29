import Choropleth from "./Choropleth.js";
import MultiSlope from "./MultiSlope.js";
import {sum} from "./Utilities.js";
import {CRIME} from '../index.js';

export default class SlopeGraphsViz {
    constructor (slopeData, options = {}) {
        d3.select(options.container || "body")
                     .append('div')
                        .attr('id', 'slope-graph-viz')
                        .style('width', options.width)
                        //.style('height', options.height)

        let districtCrimeSums = [];
        for (let [area, data] of Object.entries(slopeData)) {
            console.log(data);
            let formattedSlope = data.map((item) => {
                let crimes = [];
                for (let key in item) {
                    if (key !== "year")
                        crimes.push(item[key]);
                }
                return {
                    year: d3.timeParse("%Y")(item.year),
                    rate: sum(crimes),
                }
            });
            districtCrimeSums.push((formattedSlope[0].rate - formattedSlope[6].rate) / formattedSlope[6].rate);
        }
        
        new Choropleth(districtCrimeSums, {
            container: '#slope-graph-viz',
            width: 960,
            height: 500,
            margin: {
                top: 10,
                right: 20,
                bottom: 25,
                left: 50,
            }
        });

            let district = MultiSlope.slice(slopeData[1]);
        new MultiSlope(district, {
            container: '#slope-graph-viz',
            width: 960,
            height: 500,
            margin: {
                top: 10,
                right: 20,
                bottom: 25,
                left: 50,
            },
            axis: {
                x: true,
                y: true,
            },
            domain: {
                y: MultiSlope.max(district),
                z: CRIME
            },
        });
    }
}
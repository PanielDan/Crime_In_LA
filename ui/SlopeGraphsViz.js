import Choropleth from "./Choropleth.js";
import MultiSlope from "./MultiSlope.js";
import Slope from './Slope.js';
import {sum} from "./Utilities.js";
import {CRIME} from '../Constants.js';
import DistrictDetailsPanel from './DistrictDetailsPanel.js'

export default class SlopeGraphsViz {
    constructor (slopeData, options = {}) {
        let container = d3.select(options.container || "body")
                           .append('div')
                                .attr('id', 'slope-graph-viz')
                                .style('width', options.width + 'px')
                                .style('height', options.height + 'px')
                                .style('display', 'flex')
                                .style('flex-wrap', 'wrap');
                
        let districtCrimeSums = [];
        let formattedSlopes = [];
        let maxSum = 0;
        for (let [area, data] of Object.entries(slopeData)) {
            let formattedSlope = data.map((item) => {
                let crimes = [];
                for (let key in item) {
                    if (key !== "year")
                        crimes.push(item[key]);
                }
                return {
                    area: area,
                    year: d3.timeParse("%Y")(item.year),
                    rate: sum(crimes)
                }
            });
            formattedSlope = formattedSlope.filter(item => item.year < d3.timeParse("%Y")(2016));
            formattedSlopes.push(formattedSlope);
            maxSum = Math.max(maxSum ,Math.max(...formattedSlope.map(item => item.rate)));
            districtCrimeSums.push((formattedSlope[5].rate - formattedSlope[0].rate) / formattedSlope[0].rate);
        }
        
        let detailsPanel = new DistrictDetailsPanel(formattedSlopes[0], {
            container: '#slope-graph-viz',
            width: 500,
            height: 350,
            margin: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
            }
        });
        let choropleth = new Choropleth(districtCrimeSums, {
            container: '#slope-graph-viz',
            width: 500,
            height: 350,
            margin: {
                top: 20,
                right: 10,
                bottom: 10,
                left: 10,
            }
        });

        let district = MultiSlope.slice(slopeData[1]);
        let multiSlope = new MultiSlope(district, {
            container: '#slope-graph-viz',
            width: 500,
            height: 250,
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

        container.append('div')
                .attr('id', 'small-multiples')
                .style('width', '500px')
                .style('height', '250px')
                .style('padding', '10px');
        for ( let dataSet of formattedSlopes ) {
            new Slope(dataSet, {
                container: '#small-multiples',
                width: 150,
                height: 30,
                margin: {
                    top: 5,
                    right: 5,
                    bottom: 5,
                    left: 5,
                },
                axis: {
                    x: true,
                    y: true,
                    notext: true
                },
                domain: {
                    y: [0, maxSum],
                },
                key: {
                    x: "year",
                    y: "rate",
                },
            });
        }
    }
}
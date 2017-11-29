import Choropleth from "./Choropleth.js";
import { AREA, CRIME, POPULATION } from '../Constants.js';
import MultiSlope from "./MultiSlope.js";
import Slope from './Slope.js';
import { createSVG, sum } from "./Utilities.js";

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
        
        let detailsElement = container.node().appendChild(document.createElement("div"));

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
                .style('width', '500px');
        let slopes = new Map(formattedSlopes.map(dataSet => {
            let slope = new Slope(dataSet, {
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
            slope.element.appendChild(createSVG("title")).textContent = AREA[dataSet[0].area];
            slope.element.addEventListener("mouseover", (event) => {
                choropleth.highlight(dataSet[0].area);
            });
            slope.element.addEventListener("mouseleave", (event) => {
                choropleth.highlight();
            });
            slope.element.addEventListener("click", (event) => {
                updateDetails(dataSet[0].area);
            });

            return [dataSet[0].area, slope];
        }));

        let selected = null;
        function updateDetails(area) {
            let data = slopeData[area];
            let crime2010 = sum(data[0]) - data[0].year;
            let crime2015 = sum(data[5]) - data[5].year;

            detailsElement.innerHTML = `
<div>
    <h3>Los Angeles</h3>
    <h3>Crime Rates vs. State of the Economy</h3>
</div>
<br>
<br>
<h1>${AREA[area]}</h1>
<div class="displayframe">
    <div class="district details">
        <p>Population: ${POPULATION[AREA[area]]}<p>
        <p>Crimes in 2010: ${crime2010}</p>
        <p>Crimes in 2015: ${crime2015}</p>
        <p>Total Change: <span style="color:red">${crime2015 - crime2010}</span></p>
        <p>Precent Change: <span style="color:red">${(((crime2015 - crime2010) / crime2010) * 100).toFixed(2)}%</span></p>
    </div>
    <ol></ol>
</div>
`;

            let crimeDetailsElement = detailsElement.querySelector("ol");
            Object.entries(data[5])
                .filter(([key, value]) => CRIME.includes(key))
                .sort((a, b) => b[1] - a[1])
                .forEach((item, i) => {
                    crimeDetailsElement.appendChild(document.createElement("li")).textContent = item[0];
                });

            if (selected)
                selected.element.classList.remove("selected");
            selected = slopes.get(area);
            if (selected)
                selected.element.classList.add("selected");
        }
        updateDetails("1");
    }
}
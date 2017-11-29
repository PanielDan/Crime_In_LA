import { AREA, POPULATION, CRIME } from '../Constants.js'

export default class DistrictDetailsPanel
{
    constructor(district , options = {}){
        let container = d3.select(options.container || "body")
            .append('div')
                .attr('id', 'slope-viz-details')
                .style('width', '500px')
                .style('height', '350px')
                .style('margin', '30px');

        container = document.getElementById('slope-viz-details');
        container.innerHTML = `
        <div>
            <h3>Los Angeles</h3>
            <h3>Crime Rates vs. State of the Economy</h3>
        </div>
        <br>
        <br>
        <h1>Central</h1>
        <div class="displayframe">
            <div class="district details">
                <p>Population: ${POPULATION['Central']}<p>
                <p>Crimes in 2010: ${district[0].rate}</p>
                <p>Crimes in 2015: ${district[5].rate}</p>
                <p>Total Change: <span style="color:red">${district[5].rate - district[0].rate}</span></p>
                <p>Precent Change: <span style="color:red">${(((district[5].rate - district[0].rate) / district[0].rate) * 100).toFixed(2)}%</span></p>
            </div>
            <div class="crime details">
            </div>
        </div>
        `;

        d3.select('#slope-viz-details')
            .select('.crime')
                .selectAll('p')
                .data(CRIME)
                    .enter()
                    .append('p')
                        .text( (data,i) => i+1 + '. ' + data);


    }
}
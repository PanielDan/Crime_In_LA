import { CRIME, DAY, MONTH } from "../Constants.js";
import { sum } from "./Utilities.js";

export default class MultiStackedColumn {
	constructor(data, options = {}) {
		options.container.classList.add("column", "stacked", "multi");

		let optionsForm = options.container.appendChild(document.createElement("form"));
		optionsForm.addEventListener("submit", this._handleOptionsSubmit.bind(this));

		let crimeSelectContainer = optionsForm.appendChild(document.createElement("div"));
		crimeSelectContainer.appendChild(document.createElement("span")).textContent = "Crime";

		this._crimeSelectElement = crimeSelectContainer.appendChild(document.createElement("select"));
		this._crimeSelectElement.addEventListener("change", this._handleCrimeChange.bind(this));

		for (let crime of ["All"].concat(CRIME)) {
			let optionElement = this._crimeSelectElement.appendChild(document.createElement("option"));
			optionElement.textContent = crime;
		}

		const doubleAxisX = 12;
		if (options.axis.x)
			options.margin.bottom += doubleAxisX;

		const legendSize = (options.height - options.margin.top - options.margin.bottom) / options.domain.x.values.length;
		if (options.legend)
			options.margin.right += legendSize;

		this._scale = {
			x: {
				group: d3.scaleBand(),
				subgroup: d3.scaleBand(),
			},
			y: d3.scaleLinear().rangeRound([options.height - options.margin.top - options.margin.bottom, 0]),
			color: d3.scaleSequential(d3.interpolateSpectral),
		};
		this._scale.x.group
			.rangeRound([0, options.width - options.margin.right - options.margin.left])
				.padding(0.1)
			.domain(options.domain.x.group);
		this._scale.x.subgroup
			.rangeRound([0, this._scale.x.group.bandwidth()])
				.padding(0.25)
			.domain(options.domain.x.subgroup);
		this._scale.color
			.domain(d3.extent(options.domain.x.values).reverse());

		let svg = d3.select(options.container)
			.append("svg")
				.attr("viewBox", `0 0 ${options.width} ${options.height}`);

		if (options.axis.x) {
			let ticks = svg.append("g")
				.attr("class", "axis x group")
				.attr("transform", `translate(${options.margin.left}, ${options.height - options.margin.bottom + doubleAxisX})`)
				.call(d3.axisBottom(this._scale.x.group).tickFormat(d => MONTH[d]))
				.selectAll("g.tick");

			let edgeRight = this._scale.x.group.bandwidth() / 2;
			let edgeLeft = -1 * edgeRight;
			ticks.append("line")
				.attr("x1", edgeLeft)
				.attr("x2", edgeRight);
			ticks.append("line")
				.attr("x1", edgeLeft)
				.attr("x2", edgeLeft)
				.attr("y2", -6);
			ticks.append("line")
				.attr("x1", edgeRight)
				.attr("x2", edgeRight)
				.attr("y2", -6);
		}

		this._axisY = null;
		if (options.axis.y) {
			this._axisY = svg.append("g")
				.attr("class", "axis y")
				.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`);
		}

		this._stack = d3.stack()
			.keys(options.domain.x.values)
			.value((d, key) => this._value(d[key]));

		this._groups = svg.append("g")
			.attr("class", "chart")
			.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`)
			.selectAll("g")
				.data(data)
				.enter()
				.append("g")
					.attr("class", "multi")
					.attr("transform", (d, i) => `translate(${this._scale.x.group(i)}, 0)`);

		if (options.axis.x) {
			this._groups.append("g")
				.attr("class", "axis x subgroup")
				.attr("transform", `translate(0, ${options.height - options.margin.top - options.margin.bottom - 7})`)
				.call(d3.axisBottom(this._scale.x.subgroup).tickFormat(d => DAY[d]));
		}

		if (options.legend) {
			let legendGroup = svg.append("g")
				.attr("class", "legend")
				.selectAll("g")
					.data(options.domain.x.values.reverse())
					.enter()
						.append("g")
						.attr("transform", (d, i) => `translate(${options.width - options.margin.right}, ${options.height - options.margin.bottom - ((i + 1) * legendSize)})`);
			legendGroup.append("rect")
				.attr("width", legendSize)
				.attr("height", legendSize)
				.attr("fill", this._scale.color);
			legendGroup.append("text")
				.attr("x", legendSize / 2)
				.attr("y", legendSize / 2)
				.text(d => String(d).padStart(2, "0"));
		}

		this._redraw();
	}

	_redraw() {
		let max = Math.max(...this._groups.data().map(group => {
			return Math.max(...group.map(subgroup => {
				return sum(subgroup.map(item => this._value(item)));
			}));
		}));
		this._scale.y.domain([0, max]);

		if (this._axisY) {
			this._axisY.transition()
				.call(d3.axisLeft(this._scale.y));
		}

		let stackedGroups = this._groups.selectAll("g.stacked")
			.data(d => this._stack(d).reverse());

		let stackedGroupsEnter = stackedGroups.enter()
			.append("g")
				.attr("class", "stacked");

		let stackedGroupsUpdate = stackedGroupsEnter.merge(stackedGroups);
		stackedGroupsUpdate.transition()
			.attr("fill", (d, i) => this._scale.color(i));

		let rects = stackedGroupsUpdate.selectAll("rect")
			.data(d => d);

		let rectsEnter = rects.enter()
			.append("rect");
		rectsEnter.append("title");

		let rectUpdate = rectsEnter.merge(rects);
		rectUpdate.transition()
			.attr("x", (d, i) => this._scale.x.subgroup(i))
			.attr("y", d => this._scale.y(d[1]))
			.attr("width", this._scale.x.subgroup.bandwidth())
			.attr("height", d => this._scale.y(d[0]) - this._scale.y(d[1]));
		rectUpdate.select("title")
			.text(d => d[1] - d[0]);

		this._groups.selectAll("g.stacked rect")
	}

	_value(d) {
		let index = CRIME.indexOf(this._crimeSelectElement.value);
		if (index < 0)
			return sum(d);
		return d[index + 1] || 0;
	}

	_handleOptionsSubmit(event) {
		this._redraw();
	}

	_handleCrimeChange(event) {
		this._redraw();
	}
}

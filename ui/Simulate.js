import { AREA, POPULATION } from "../Constants.js";
import { removeChildren, sum, weightedRandom } from "./Utilities.js";

export default class Simulate {
	constructor(data, options = {}) {
		this._data = data;

		options.container.classList.add("simulate");

		let optionsForm = options.container.appendChild(document.createElement("form"));
		optionsForm.addEventListener("submit", this._handleOptionsSubmit.bind(this));

		let areaSelectContainer = optionsForm.appendChild(document.createElement("div"));
		areaSelectContainer.appendChild(document.createElement("span")).textContent = "District";

		this._areaSelectElement = areaSelectContainer.appendChild(document.createElement("select"));
		this._areaSelectElement.addEventListener("change", this._handleAreaChange.bind(this));

		for (let key in data) {
			let optionElement = this._areaSelectElement.appendChild(document.createElement("option"));
			optionElement.textContent = AREA[key];
			optionElement.value = key;
		}

		let typeSelectContainer = optionsForm.appendChild(document.createElement("div"));
		typeSelectContainer.appendChild(document.createElement("span")).textContent = "Type";

		this._typeSelectElement = typeSelectContainer.appendChild(document.createElement("select"));
		this._typeSelectElement.addEventListener("change", this._handleTypeChange.bind(this));

		for (let type of ["Population", "Crime Total"])
			this._typeSelectElement.appendChild(document.createElement("option")).textContent = type;

		let sizeInputContainer = optionsForm.appendChild(document.createElement("div"));
		sizeInputContainer.appendChild(document.createElement("span")).textContent = "Size";

		this._sizeInputElement = sizeInputContainer.appendChild(document.createElement("input"));
		this._sizeInputElement.type = "number";
		this._sizeInputElement.min = 1;
		this._sizeInputElement.value = this._sizeInputElement.placeholder = 100;
		this._sizeInputElement.addEventListener("input", this._handleSizeInput.bind(this));

		let redrawButton = optionsForm.appendChild(document.createElement("button"));
		redrawButton.textContent = "Simulate";

		this._chart = options.container.appendChild(document.createElement("div"));
		this._chart.classList.add("chart");

		this._redraw();
	}

	_redraw() {
		this._chart.style.setProperty("height", this._chart.offsetHeight + "px");

		removeChildren(this._chart);

		let area = this._areaSelectElement.value;
		let data = this._data[area];
		let size = Math.max(1, parseInt(this._sizeInputElement.value) || 100);
		let population = this._typeSelectElement.value === "Population" ? POPULATION[AREA[area]] : sum(data);
		let result = (new Array(size)).fill(0).map((item, i) => {
			if (Math.random() > sum(data) / population)
				return null;
			return weightedRandom(data);
		});

		for (let item of result) {
			let image = this._chart.appendChild(document.createElement("img"));
			image.src = `images/${item}.svg`;
			image.title = item || "No Crime";
		}

		window.requestAnimationFrame(() => {
			this._chart.style.removeProperty("height");
		});
	}

	_handleOptionsSubmit(event) {
		event.preventDefault();

		this._redraw();
	}

	_handleAreaChange(event) {
		this._redraw();
	}

	_handleTypeChange(event) {
		this._redraw();
	}

	_handleSizeInput(event) {
		this._redraw();
	}
}

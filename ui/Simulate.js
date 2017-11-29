import { AREA, POPULATION } from "../Constants.js";
import { sum, weightedRandom } from "./Utilities.js";

export default class Simulate {
	constructor(data, options = {}) {
		this._data = data;

		let wrapper = options.container.appendChild(document.createElement("div"));
		wrapper.classList.add("simulate");

		this._optionsForm = wrapper.appendChild(document.createElement("form"));
		this._optionsForm.addEventListener("submit", this._handleOptionsSubmit.bind(this));

		this._areaSelectElement = this._optionsForm.appendChild(document.createElement("select"));
		this._areaSelectElement.addEventListener("change", this._handleAreaChange.bind(this));

		for (let key in data) {
			let optionElement = this._areaSelectElement.appendChild(document.createElement("option"));
			optionElement.textContent = AREA[key];
			optionElement.value = key;
		}

		let createRadio = (value, text, checked = false) => {
			let labelElement = this._optionsForm.appendChild(document.createElement("label"));

			let radioElement = labelElement.appendChild(document.createElement("input"));
			radioElement.type = "radio";
			radioElement.name = "population";
			radioElement.value = value;
			radioElement.checked = checked;
			radioElement.addEventListener("change", this._handlePopulationChange.bind(this));

			labelElement.appendChild(document.createTextNode(text));
		};
		createRadio("total", "Population", true);
		createRadio("crime", "Crime Total");

		this._sampleInputElement = this._optionsForm.appendChild(document.createElement("input"));
		this._sampleInputElement.type = "number";
		this._sampleInputElement.min = 1;
		this._sampleInputElement.value = this._sampleInputElement.placeholder = 100;
		this._sampleInputElement.addEventListener("input", this._handleSampleInput.bind(this));

		let redrawButton = this._optionsForm.appendChild(document.createElement("button"));
		redrawButton.textContent = "Simulate";

		this._chart = wrapper.appendChild(document.createElement("div"));
		this._chart.classList.add("chart");

		this._redraw();
	}

	_redraw() {
		while (this._chart.firstChild)
			this._chart.firstChild.remove();

		let area = this._areaSelectElement.value;
		let data = this._data[area];
		let sample = Math.max(1, parseInt(this._sampleInputElement.value) || 100);
		let population = this._optionsForm.elements["population"].value === "crime" ? sum(data) : POPULATION[AREA[area]];
		let result = (new Array(sample)).fill(0).map((item, i) => {
			if (Math.random() > sum(data) / population)
				return null;
			return weightedRandom(data);
		});

		for (let item of result) {
			let image = this._chart.appendChild(document.createElement("img"));
			image.src = `images/${item}.svg`;
			image.title = item || "No Crime";
		}
	}

	_handleOptionsSubmit(event) {
		event.preventDefault();

		this._redraw();
	}

	_handleAreaChange(event) {
		this._redraw();
	}

	_handlePopulationChange(event) {
		this._redraw();
	}

	_handleSampleInput(event) {
		this._redraw();
	}
}

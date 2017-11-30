import { AREA, CRIME } from "../Constants.js";
import { pick, removeChildren, sum } from "./Utilities.js";

export default class Heat {
	constructor(data, options = {}) {
		this._data = data;
		this._defaultZoom = options.zoom;

		options.container.classList.add("heat");

		let optionsForm = options.container.appendChild(document.createElement("form"));
		optionsForm.addEventListener("submit", this._handleOptionsSubmit.bind(this));

		let yearSelectContainer = optionsForm.appendChild(document.createElement("div"));
		yearSelectContainer.appendChild(document.createElement("span")).textContent = "Year";

		this._yearSelectElement = yearSelectContainer.appendChild(document.createElement("select"));
		this._yearSelectElement.addEventListener("change", this._handleYearChange.bind(this));

		for (let key in data) {
			let optionElement = this._yearSelectElement.appendChild(document.createElement("option"));
			optionElement.selected = key === options.defaultYear;
			optionElement.textContent = key;
		}

		let areaSelectContainer = optionsForm.appendChild(document.createElement("div"));
		areaSelectContainer.appendChild(document.createElement("span")).textContent = "District";

		this._areaSelectElement = areaSelectContainer.appendChild(document.createElement("select"));
		this._areaSelectElement.addEventListener("change", this._handleAreaChange.bind(this));

		for (let key in data[this._yearSelectElement.value]) {
			let optionElement = this._areaSelectElement.appendChild(document.createElement("option"));
			optionElement.selected = key === options.defaultArea;
			optionElement.value = key;
			optionElement.textContent = AREA[parseInt(key) + 1];
		}

		let map = new google.maps.Map(options.container.appendChild(document.createElement("div")), {
			zoom: this._defaultZoom,
			center: this._generatePosition(),
		});
		google.maps.event.addListener(map, "bounds_changed", this._handleBoundsChanged.bind(this));

		this._chart = new HeatmapOverlay(map, {
			radius: 5,
			minOpacity: 0.25,
			maxOpacity: 1,
			latField: "x",
			lngField: "y",
			valueField: "data",
		});

		options.container.appendChild(document.createElement("p")).textContent = "Top Crimes Committed";

		this._detailsElement = options.container.appendChild(document.createElement("ol"));

		this._redraw();
		this._displayVisibleDetails();
	}

	get element() { return this._chart.map.getDiv(); }

	get _selectedData() {
		return this._data[this._yearSelectElement.value][this._areaSelectElement.value];
	}

	_redraw() {
		this._chart.setData({
			max: sum(this._selectedData.map(item => item.data.count)) / this._selectedData.length,
			data: this._selectedData,
		});

		this._chart.map.setZoom(this._defaultZoom);

		let position = this._generatePosition();
		this._chart.map.panTo(new google.maps.LatLng(position.lat, position.lng));
	}

	_generatePosition() {
		return {
			lat: sum(this._selectedData.map(item => item.x)) / this._selectedData.length,
			lng: sum(this._selectedData.map(item => item.y)) / this._selectedData.length,
		};
	}

	_displayVisibleDetails(visible) {
		removeChildren(this._detailsElement);

		if (!visible || !visible.length)
			visible = this._selectedData.map(item => item.data);

		let values = visible.reduce((accumulator, item) => {
			for (let key in item.values) {
				if (!(key in accumulator))
					accumulator[key] = 0;

				accumulator[key] += item.values[key];
			}
			return accumulator;
		}, {});
		for (let [key, value] of Object.entries(values).sort((a, b) => b[1] - a[1]).slice(0, 5)) {
			let listItemElement = this._detailsElement.appendChild(document.createElement("li"));
			listItemElement.textContent = `${CRIME[parseInt(key) - 1]} (${value})`;
		}
	}

	_handleOptionsSubmit(event) {
		this._redraw();
	}

	_handleYearChange(event) {
		this._redraw();
	}

	_handleAreaChange(event) {
		this._redraw();
	}

	_handleBoundsChanged(event) {
		if (!this._chart.heatmap)
			return;

		this._displayVisibleDetails(this._chart.heatmap.getData().data.map(item => item.value).filter(item => item instanceof Heat.Point));
	}
}

Heat.Point = class Point {
	constructor(x, y) {
		this._x = x;
		this._y = y;
		this._values = {};
	}

	get x() { return this._x; }
	get y() { return this._y; }
	get values() { return this._values; }

	get count() {
		return sum(Object.values(this._values));
	}

	add(key) {
		if (!(key in this._values))
			this._values[key] = 0;

		++this._values[key];
	}

	valueOf() {
		return this._count;
	}
};

import { sum } from "./Utilities.js";

export default class Heat {
	constructor(data, options = {}) {
		options.container.classList.add("heat");

		let map = new google.maps.Map(options.container, {
			zoom: options.zoom,
			center: options.center,
		});

		this._chart = new HeatmapOverlay(map, {
			radius: 5,
			minOpacity: 0.25,
			maxOpacity: 1,
			latField: "x",
			lngField: "y",
			valueField: "data",
		});
		this._chart.setData({
			max: sum(data.map(item => item.data.count)) / data.length,
			data,
		});

		google.maps.event.addListener(this._chart.map, "bounds_changed", this._handleBoundsChanged.bind(this));
	}

	get element() { return this._chart.map.getDiv(); }

	_handleBoundsChanged(event) {
		let visible = this._chart.heatmap.getData().data.map(item => item.value);
	}
}

Heat.Point = class Point {
	constructor(x, y, area) {
		this._x = x;
		this._y = y;
		this._area = area;
		this._count = 0;
		this._crimes = new Set;
	}

	get x() { return this._x; }
	get y() { return this._y; }
	get area() { return this._area; }
	get count() { return this._count; }
	get crimes() { return this._crimes; }

	add(crime) {
		++this._count;
		this._crimes.add(crime);
	}

	valueOf() {
		return this._count;
	}
};

export default class Heat {
	constructor(data, options = {}) {
		let element = options.container.appendChild(document.createElement("div"));
		element.classList.add("heat");
		if (options.width)
			element.style.setProperty("width", options.width + "px");
		if (options.height)
			element.style.setProperty("height", options.height + "px");

		let map = new google.maps.Map(element, {
			zoom: options.zoom,
			center: options.center,
		});

		let chart = new HeatmapOverlay(map, {
			radius: 5,
			minOpacity: 0.25,
			maxOpacity: 1,
		});
		chart.setData(data);
	}
}

export function createSVG(tag) {
	return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

export function diagonal(a, b) {
	return `M ${a.y} ${a.x} C ${(a.y + b.y) / 2} ${a.x}, ${(a.y + b.y) / 2} ${b.x}, ${b.y} ${b.x}`;
}

export function normalize(object, sigma) {
	return Object.entries(object).reduce((accumulator, [key, value]) => {
		accumulator[key] = value / sigma;
		return accumulator;
	}, Array.isArray(object) ? [] : {});
}

export function removeChildren(element) {
	while (element.firstChild)
		element.firstChild.remove();
}

export function sum(object, initialValue = 0) {
	return Object.values(object).reduce((accumulator, item) => accumulator + item, initialValue);
}

export function weightedRandom(weights) {
	let random = Math.random();
	let normalized = normalize(weights, sum(weights));
	for (let key in normalized) {
		random -= normalized[key];
		if (random <= 0)
			return Array.isArray(weights) ? parseInt(key) : key;
	}
}

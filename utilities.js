export function sum(object, initialValue = 0) {
	return Object.values(object).reduce((accumulator, item) => accumulator + item, initialValue);
}

export function normalize(object, sigma) {
	return Object.entries(object).reduce((accumulator, [key, value]) => {
		accumulator[key] = value / sigma;
		return accumulator;
	}, Array.isArray(object) ? [] : {});
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

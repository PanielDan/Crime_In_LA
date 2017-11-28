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

export function diagonal(a, b) {
	return `M ${a.y} ${a.x} C ${(a.y + b.y) / 2} ${a.x}, ${(a.y + b.y) / 2} ${b.x}, ${b.y} ${b.x}`;
}

// Slices area data variable to only return the specified district w/ years [2010,2015]
// Formats for MultiSlope
export function SliceDistrict(data, district) {
	let slice = data[district].slice()
				.filter(dataRow => dataRow.year < 2016);
	let districtData = {};
	let keys = Object.keys(slice[0]);
	for (let i in keys) {
		districtData[keys[i]] = {
			key: keys[i],
			data: slice.map(item => {
				let row = {
					year: item.year,
					value: item[keys[i]]
				}
				return row;
			})
		}
	}
	return districtData;
}

export function MaxOfSliceDistrict(slice) {
	let max = 0;
	for (let key in slice) {
		max = Math.max(max, slice[key].data.reduce((Max, val) => Math.max(Max, val.value), 0));
	}
	return max;
}
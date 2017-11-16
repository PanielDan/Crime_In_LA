import {sum, weightedRandom} from "./utilities.js";

export function simulate(data, options = {}) {
	return (new Array(options.size)).fill(0).map((item, i) => {
		if (Math.random() > sum(data) / options.population)
			return null;
		return weightedRandom(data);
	});
}

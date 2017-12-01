export function animate(func, duration) {
	let start = null;
	loop(function(timestamp) {
		if (!start)
			start = timestamp;

		if (timestamp - start < duration) {
			func(timestamp - start);
			return true;
		}

		return false;
	});
}

export function createSVG(tag) {
	return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

export function diagonal(a, b) {
	return `M ${a.y} ${a.x} C ${(a.y + b.y) / 2} ${a.x}, ${(a.y + b.y) / 2} ${b.x}, ${b.y} ${b.x}`;
}

export function difference(a, b) {
	return (b - a) / (a || b);
}

export function easeInOutQuad(progress, start, delta, duration) {
	progress /= duration / 2;
	if (progress < 1)
		return (progress * progress * (delta / 2)) + start;
	--progress;
	return (((progress * (progress - 2)) - 1) * (-delta / 2)) + start;
}

export function normalize(object, sigma) {
	return Object.entries(object).reduce((accumulator, [key, value]) => {
		accumulator[key] = value / sigma;
		return accumulator;
	}, Array.isArray(object) ? [] : {});
}

export function loop(func) {
	window.requestAnimationFrame(function frame(timestamp) {
		if (func(timestamp))
			window.requestAnimationFrame(frame);
	});
}

export function pick(array) {
	return array[Math.floor(Math.random() * array.length)];
}

export function removeChildren(element) {
	while (element.firstChild)
		element.firstChild.remove();
}

export function scroll(target, duration) {
	let start = scrollTop();
	animate(progress => {
		let y = easeInOutQuad(progress, start, target - start, duration);
		window.scroll(0, Math.round(y));
	}, duration);
}

export function scrollTop(element) {
	if (!element)
		return window.pageYOffset;

	let y = 0;
	while (element) {
		y += element.offsetTop - element.scrollTop;
		element = element.offsetParent;
	}
	return y;
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

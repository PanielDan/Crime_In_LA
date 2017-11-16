import {diagonal} from "./Utilities.js";

export default class Tree {
	constructor(data, options = {}) {
		let container = d3.select(options.container || "body");

		let svg = container.append("svg")
			.attr("viewBox", `0 0 ${options.width} ${options.height}`)
			.attr("class", "tree");

		this._group = svg.append("g")
			.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`);

		let width = options.width - options.margin.right - options.margin.left;
		let height = options.height - options.margin.top - options.margin.bottom;

		let hierarchy = d3.hierarchy(data, d => d.children);
		hierarchy.x0 = height / 2;
		hierarchy.y0 = 0;

		this._tree = d3.tree().size([height, width])(hierarchy);

		this._update(hierarchy);
	}

	_update(node) {
		const duration = 400;

		let descendants = this._tree.descendants();
		let links = descendants.slice(1);

		descendants.forEach(d => d.y = d.depth * 180);

		let nodeGroups = this._group.selectAll("g.node")
			.data(descendants, (d, i) => d.id || (d.id = i));

		let nodeGroupsEnter = nodeGroups.enter()
			.append("g")
				.attr("class", "node")
				.attr("transform", d => `translate(${node.y0}, ${node.x0})`)
				.attr("opacity", 0)
				.on("click", this._handleClick.bind(this));
		nodeGroupsEnter.append("circle")
			.attr("r", 1e-6)
			.style("fill", d =>  d._children ? "darkred" : "#fff");
		nodeGroupsEnter.append("text")
			.attr("dy", "0.35em")
			.attr("x", d =>  (d.children || d._children) ? -13 : 13)
			.attr("text-anchor", d => (d.children || d._children) ? "end" : "start")
			.text(d => d.data.name);

		let nodeGroupsUpdate = nodeGroupsEnter.merge(nodeGroups);
		nodeGroupsUpdate.transition().duration(duration)
			.attr("transform", d => `translate(${d.y}, ${d.x})`)
			.attr("opacity", 1)
			.select("circle")
				.attr("r", 8);
		nodeGroupsUpdate.select("circle")
			.style("fill", d => d._children ? "darkred" : "#fff")
			.attr("cursor", "pointer");

		let nodeGroupsExit = nodeGroups.exit()
			.transition().duration(duration)
				.attr("transform", d => `translate(${node.y}, ${node.x})`)
				.attr("opacity", 0)
				.remove();
		nodeGroupsExit.select("circle")
			.attr("r", 1e-6);

		let linkPaths = this._group.selectAll("path.link")
			.data(links, d => d.id);

		let linkPathsEnter = linkPaths.enter()
			.insert("path", "g")
				.attr("class", "link")
				.attr("d", d => {
					let o = {
						x: node.x0,
						y: node.y0,
					};
					return diagonal(o, o);
				});

		let linkPathsUpdate = linkPathsEnter.merge(linkPaths);
		linkPathsUpdate.transition().duration(duration)
			.attr("d", d => diagonal(d, d.parent));

		let linkPathsExit = linkPaths.exit()
			.transition().duration(duration)
				.attr("d", d => {
					let o = {
						x: node.x,
						y: node.y,
					};
					return diagonal(o, o);
				})
				.remove();

		descendants.forEach(d => {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}

	_collapse(d) {
		if (!d.children)
			return;

		d._children = d.children
		d._children.forEach(this._collapse)
		d.children = null
	}

	_handleClick(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}

		this._update(d);
	}
}

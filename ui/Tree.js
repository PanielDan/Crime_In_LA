import { diagonal } from "./Utilities.js";

export default class Tree {
	constructor(data, options = {}) {
		this._boundCollapse = this._collapse.bind(this);
		this._boundHandleClick = this._handleClick.bind(this);

		this._chart = d3.select(options.container)
			.attr("viewBox", `0 0 ${options.width} ${options.height}`)
			.attr("class", "tree")
			.append("g")
				.attr("class", "chart")
				.attr("transform", `translate(${options.margin.left}, ${options.margin.top})`);

		let width = options.width - options.margin.right - options.margin.left;
		let height = options.height - options.margin.top - options.margin.bottom;

		this._hierarchy = d3.hierarchy(data, d => d.children);
		this._hierarchy.x0 = height / 2;
		this._hierarchy.y0 = 0;
		this._tree = d3.tree().size([height, width]);

		this._update(this._tree(this._hierarchy));

		this._hierarchy.children.forEach(this._boundCollapse);
		this._update(this._tree(this._hierarchy));
	}

	_update(node) {
		const duration = 400;

		let tree = this._tree(this._hierarchy);
		let descendants = tree.descendants();
		let links = descendants.slice(1);

		descendants.forEach(d => d.y = d.depth * 180);

		let nodeGroups = this._chart.selectAll("g.node")
			.data(descendants, (d, i) => d.id || (d.id = i));

		let nodeGroupsEnter = nodeGroups.enter()
			.append("g")
				.attr("class", "node")
				.attr("transform", d => `translate(${node.y0}, ${node.x0})`)
				.attr("opacity", 0)
				.on("click", this._boundHandleClick);
		nodeGroupsEnter.each(function(d) {
			if (!d.children && !d.__savedChildren)
				return;

			d3.select(this).append("circle")
				.attr("r", 1e-6)
				.style("fill", d =>  d.__savedChildren ? "darkred" : "white")
		});
		nodeGroupsEnter.append("text")
			.attr("dy", "0.35em")
			.attr("x", d =>  (d.children || d.__savedChildren) ? -13 : 2)
			.attr("text-anchor", d => (d.children || d.__savedChildren) ? "end" : "start")
			.text(d => d.data.name);

		let nodeGroupsUpdate = nodeGroupsEnter.merge(nodeGroups);
		nodeGroupsUpdate.transition().duration(duration)
			.attr("transform", d => `translate(${d.y}, ${d.x})`)
			.attr("opacity", 1)
			.select("circle")
				.attr("r", 8);
		nodeGroupsUpdate.select("circle")
			.style("fill", d => d.__savedChildren ? "darkred" : "white");

		let nodeGroupsExit = nodeGroups.exit()
			.transition().duration(duration)
				.attr("transform", d => `translate(${node.y}, ${node.x})`)
				.attr("opacity", 0)
				.remove();
		nodeGroupsExit.select("circle")
			.attr("r", 1e-6);

		let linkPaths = this._chart.selectAll("path.link")
			.data(links, (d, i) => d.id || (d.id = i));

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

		d.__savedChildren = d.children;
		d.__savedChildren.forEach(this._boundCollapse);
		d.children = null;
	}

	_handleClick(d) {
		if (d.children) {
			d.__savedChildren = d.children;
			d.children = null;
		} else {
			d.children = d.__savedChildren;
			d.__savedChildren = null;
		}

		this._update(d);
	}
}

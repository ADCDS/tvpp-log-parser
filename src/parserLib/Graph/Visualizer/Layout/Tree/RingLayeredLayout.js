// @flow
import TreeFilterResult from "../../../Filter/Results/TreeFilterResult";
import TreeFilter from "../../../Filter/Tree/TreeFilter";
import TreeLayout from "./TreeLayout";
import Machine from "../../../../Machine";
import UserOption from "../../../../UserOption";

class RingLayeredLayout extends TreeLayout {
	constructor(filterResult: TreeFilterResult, machines: Map<string, Machine>, options: { [string]: any }) {
		const defaultOptions = {
			radius: 100,
			drawUndefinedNodes: false
		};

		options = Object.assign(defaultOptions, options);
		super(filterResult, machines, options);
	}

	updatePositions(): void {
		super.updatePositions();

		// Distances preprocessor
		const numberOfNodesAtRing = { "0": 1 };
		const iterNumRing = { "0": 0 };

		let nodes = Object.keys(this.filterResult.distancesFromSource);
		const highestSourceDistance = nodes
			.map<number>(value => this.filterResult.distancesFromSource[value])
			.filter(value => value !== Infinity)
			.reduce((previousValue, currentValue) => {
				if (currentValue >= previousValue) {
					return currentValue;
				}
				return previousValue;
			});

		if (!this.options.drawUndefinedNodes) {
			nodes = nodes.filter(value => {
				if (this.filterResult.distancesFromSource[value] === Infinity) {
					this.nodeHolder.delete(value);
					return false;
				}
				return true;
			});
		}

		nodes.forEach(el => {
			// Treat vertices that are not connected to the source node
			let distanceFromSourceEl = Math.round(this.filterResult.distancesFromSource[el]);
			if (distanceFromSourceEl === Infinity) {
				this.filterResult.distancesFromSource[el] = highestSourceDistance + 1;
				distanceFromSourceEl = this.filterResult.distancesFromSource[el];
			}
			if (Object.prototype.hasOwnProperty.call(numberOfNodesAtRing, distanceFromSourceEl)) {
				numberOfNodesAtRing[distanceFromSourceEl]++;
			} else {
				numberOfNodesAtRing[distanceFromSourceEl] = 1;
				iterNumRing[distanceFromSourceEl] = 0;
			}
		});

		nodes.forEach(machineKey => {
			const node = this.nodeHolder.get(machineKey);
			if (!node) throw new Error(`${machineKey} not found`);
			const distancesFromSourceElement = this.filterResult.distancesFromSource[machineKey];
			node.x =
				this.options.radius *
				distancesFromSourceElement *
				Math.cos((2 * iterNumRing[Math.round(distancesFromSourceElement)] * Math.PI) / numberOfNodesAtRing[Math.round(distancesFromSourceElement)]);
			node.y =
				this.options.radius *
				distancesFromSourceElement *
				Math.sin((2 * iterNumRing[Math.round(distancesFromSourceElement)] * Math.PI) / numberOfNodesAtRing[Math.round(distancesFromSourceElement)]);
			iterNumRing[Math.round(distancesFromSourceElement)]++;
		});
	}

	static getOptions(): { [string]: UserOption<any> } {
		let options = super.getOptions();
		options = Object.assign(options, {
			radius: new UserOption<Number>("Radius", Number, 100),
			drawUndefinedNodes: new UserOption<Boolean>("Draw undefined nodes", Boolean, false),
			filter: new UserOption<TreeFilter>("Filter", TreeFilter)
		});
		return options;
	}
}

export default RingLayeredLayout;

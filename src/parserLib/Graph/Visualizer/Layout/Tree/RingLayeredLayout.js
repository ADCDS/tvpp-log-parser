// @flow
import Layout from "../Layout";
import TreeFilterResult from "../../../Filter/Results/TreeFilterResult";
import TreeFilter from "../../../Filter/Tree/TreeFilter";
import TreeLayout from "./TreeLayout";
import Machine from "../../../../Machine";

class RingLayeredLayout extends TreeLayout {
	constructor(
		filterResult: TreeFilterResult,
		machines: Map<string, Machine>,
		options: { [string]: any }
	) {
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
		const numberOfNodesAtRing = { 0: 1 };
		const iterNumRing = { 0: 0 };

		/**
		 * Lets pull all infinity nodes to the beginning of the list
		 * In order to be able to get the highest distance from the 'source' node,
		 * and draw the nodes that are not connected to the 'source' node at the outer ring
		 *
		 * I believe that this can be optimized
		 */
		for (let el of this.filterResult.distancesFromSource.value()) {
			if (el === Infinity) el = -Infinity;
		}
		const nodes = this.filterResult.distancesFromSource
			.keys()
			.sort((e1, e2) => {
				return (
					this.filterResult.distancesFromSource[e1] -
					this.filterResult.distancesFromSource[e2]
				);
			});

		const highestSourceDistance = this.filterResult.distancesFromSource.get(
			nodes[nodes.length - 1]
		);

		nodes.forEach(el => {
			// Treat vertices that are not connected to the source node
			const distanceFromSourceEl = this.filterResult.distancesFromSource.get(
				el
			);
			if (distanceFromSourceEl === -Infinity)
				this.filterResult.distancesFromSource.set(
					el,
					highestSourceDistance + 1
				);
			if (
				Object.prototype.hasOwnProperty.call(
					numberOfNodesAtRing,
					distanceFromSourceEl
				)
			) {
				numberOfNodesAtRing[distanceFromSourceEl]++;
			} else {
				numberOfNodesAtRing[distanceFromSourceEl] = 1;
				iterNumRing[distanceFromSourceEl] = 0;
			}
		});

		nodes.forEach(machineKey => {
			const node = this.nodeHolder.get(machineKey);

			const distancesFromSourceElement = this.filterResult
				.distancesFromSource[machineKey];
			node.x =
				this.options.radius *
				distancesFromSourceElement *
				Math.cos(
					(2 * iterNumRing[distancesFromSourceElement] * Math.PI) /
						numberOfNodesAtRing[distancesFromSourceElement]
				);
			node.y =
				this.options.radius *
				distancesFromSourceElement *
				Math.sin(
					(2 * iterNumRing[distancesFromSourceElement] * Math.PI) /
						numberOfNodesAtRing[distancesFromSourceElement]
				);
			iterNumRing[distancesFromSourceElement]++;
		});
	}

	static getOptions(): {} {
		let options = super.getOptions();
		options = Object.assign(options, {
			radius: {
				name: "Radius",
				type: Number,
				default: 100
			},
			source: {
				name: "Source",
				type: String,
				default: "::src"
			},
			drawUndefinedNodes: {
				name: "Draw undefined nodes",
				type: Boolean,
				default: false
			},
			filter: {
				name: "Filter",
				type: TreeFilter
			}
		});
		return options;
	}
}

export default RingLayeredLayout;

// @flow
import Layout from "./Layout";
import FilterResult from "../../Filter/Results/FilterResult";
import Machine from "../../../Machine";
import Option from "../../../Option";

class SpringLayout extends Layout {
	constructor(filterResult: FilterResult, machines: Map<string, Machine>, options: { [string]: any }) {
		const defaultOptions = {
			c1: 2,
			c2: 1,
			c3: 1,
			c4: 0.1,
			drawUndefinedNodes: false
		};

		options = Object.assign(defaultOptions, options);

		super(filterResult, machines, options);
	}

	calculateForcesOnNode(machineKey: string): void {
		const nodeHolderElement = this.nodeHolder.get(machineKey);

		const resultantForce = { x: 0, y: 0 };
		const edges = this.graphHolder.getEdges(machineKey);

		const adjacentVertices = new Set(
			Object.keys(edges)
				.filter(el => {
					return edges[el];
				})
				.concat(this.graphHolder.getNodesThatPointTo(machineKey))
		);

		for (const adjacentMachine of adjacentVertices) {
			const adjacentNodeHolderElement = this.nodeHolder.get(adjacentMachine);
			if (!adjacentNodeHolderElement) continue;

			const d = Math.sqrt(Math.pow(nodeHolderElement.x - adjacentNodeHolderElement.x, 2) + Math.pow(nodeHolderElement.y - adjacentNodeHolderElement.y, 2));
			if (d === 0) continue;

			const force = this.options.c1 * Math.log(d / this.options.c2);

			// get the direction where the force is applied
			const dir = {
				x: (adjacentNodeHolderElement.x - nodeHolderElement.x) / d,
				y: (adjacentNodeHolderElement.y - nodeHolderElement.y) / d
			};

			// apply the force in the normalized vector
			dir.x *= force;
			dir.y *= force;

			resultantForce.x += dir.x;
			resultantForce.y += dir.y;
		}

		// Forces that repel
		const nonAdjacentVertices = Object.keys(this.filterResult.graphHolder.graph).filter(value => !adjacentVertices.has(value));

		for (const nonAdjacentMachine of nonAdjacentVertices) {
			const nonAdjacentNodeHolderElement = this.nodeHolder.get(nonAdjacentMachine);
			if (!nonAdjacentNodeHolderElement) continue;

			const d = Math.sqrt(Math.pow(nodeHolderElement.x - nonAdjacentNodeHolderElement.x, 2) + Math.pow(nodeHolderElement.y - nonAdjacentNodeHolderElement.y, 2));
			if (d === 0) continue;

			const force = this.options.c3 / Math.pow(d, 2);

			// get the direction where the force is applied
			const dir = {
				x: (nodeHolderElement.x - nonAdjacentNodeHolderElement.x) / d,
				y: (nodeHolderElement.y - nonAdjacentNodeHolderElement.y) / d
			};

			// apply the force in the normalized vector
			dir.x *= force;
			dir.y *= force;

			resultantForce.x += dir.x;
			resultantForce.y += dir.y;
		}

		resultantForce.x *= this.options.c4;
		resultantForce.y *= this.options.c4;

		nodeHolderElement.ResX = nodeHolderElement.x + resultantForce.x;
		nodeHolderElement.ResY = nodeHolderElement.y + resultantForce.y;

		console.log(`SpringLayout: ${machineKey}: OLD {x: ${nodeHolderElement.x}, y: ${nodeHolderElement.y}}, NEW {x: ${resultantForce.x}, y: ${resultantForce.y}}`);
	}

	updatePositions(): void {
		super.updatePositions();
		let i = 0;

		// Put nodes at random positions, initially
		if (this.options.drawUndefinedNodes) {
			for (const node of this.nodeHolder.values()) {
				node.x = Math.floor(Math.random() * 2000);
				node.y = Math.floor(Math.random() * 2000);
			}
		} else {
			for (const node of this.nodeHolder.values()) {
				if (this.filterResult.graphHolder.isConnected(node.id)) {
					node.x = Math.floor(Math.random() * 2000);
					node.y = Math.floor(Math.random() * 2000);
				} else {
					if (this.filterResult.graphHolder.isConnected(node.id)) {
						this.nodeHolder.delete(node.id);
					}
				}
			}
		}

		while (i++ < this.options.iterNum) {
			for (const machineKey of this.nodeHolder.keys()) {
				this.calculateForcesOnNode(machineKey);
			}

			for (const node of this.nodeHolder.values()) {
				node.x = node.ResX;
				node.y = node.ResY;
			}
		}
	}

	static getOptions(): {
		[string]: any
	} {
		let options = super.getOptions();
		options = Object.assign(options, {
			c1: new Option("C1", Number, 2),
			c2: new Option("C2", Number, 1),
			c3: new Option("C3", Number, 1),
			c4: new Option("C4", Number, 0.1),
			iterNum: new Option("Iteration Number", Number, 100),
			drawUndefinedNodes: new Option("Draw undefined nodes", Boolean, false)
		});
		return options;
	}
}

export default SpringLayout;

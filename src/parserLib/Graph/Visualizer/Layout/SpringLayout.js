// @flow
import Layout from "./Layout";
import FilterResult from "../../Filter/Results/FilterResult";
import Machine from "../../../Machine";
import UserOption from "../../../UserOption";

class SpringLayout extends Layout {
	constructor(filterResult: FilterResult, machines: Map<string, Machine>, options: { [string]: any }) {
		const defaultOptions = {
			c1: 2,
			c2: 1,
			c3: 1,
			c4: 0.1,
			drawUndefinedNodes: false,
			fixAt00: ""
		};

		options = Object.assign(defaultOptions, options);

		super(filterResult, machines, options);
	}

	static getOptions(): { [string]: UserOption<any> } {
		let options = super.getOptions();
		options = Object.assign(options, {
			c1: new UserOption<Number>("C1", Number, 2),
			c2: new UserOption<Number>("C2", Number, 1),
			c3: new UserOption<Number>("C3", Number, 1),
			c4: new UserOption<Number>("C4", Number, 0.1),
			iterNum: new UserOption<Number>("Iteration Number", Number, 100),
			drawUndefinedNodes: new UserOption<Boolean>("Draw undefined nodes", Boolean, false),
			fixAt00: new UserOption<String>("Fix node at (0,0)", String, "::src")
		});
		return options;
	}

	calculateForcesOnNode(machineKey: string): { x: number, y: number } {
		const fixedServer = machineKey === this.options.fixAt00;
		const nodeHolderElement = this.nodeHolder.get(machineKey);
		if (!nodeHolderElement) throw new Error(`${machineKey} wansn't found on nodeHolder`);
		const resultantForce = {x: 0, y: 0};
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

			// eslint-disable-next-line flowtype-errors/show-errors
			const d = Math.sqrt(Math.pow(nodeHolderElement.x - adjacentNodeHolderElement.x, 2) + Math.pow(nodeHolderElement.y - adjacentNodeHolderElement.y, 2));
			if (d === 0) continue;

			const force = this.options.c1 * Math.log(d / this.options.c2);

			// get the direction where the force is applied
			const dir = {
				// eslint-disable-next-line flowtype-errors/show-errors
				x: (adjacentNodeHolderElement.x - nodeHolderElement.x) / d,
				// eslint-disable-next-line flowtype-errors/show-errors
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

		// Fixed node cannot be repelled
		if(!fixedServer) {
			for (const nonAdjacentMachine of nonAdjacentVertices) {
				const nonAdjacentNodeHolderElement = this.nodeHolder.get(nonAdjacentMachine);
				if (!nonAdjacentNodeHolderElement) continue;

				// eslint-disable-next-line flowtype-errors/show-errors
				const d = Math.sqrt(Math.pow(nodeHolderElement.x - nonAdjacentNodeHolderElement.x, 2) + Math.pow(nodeHolderElement.y - nonAdjacentNodeHolderElement.y, 2));
				if (d === 0) continue;

				const force = this.options.c3 / Math.pow(d, 2);

				// get the direction where the force is applied
				const dir = {
					// eslint-disable-next-line flowtype-errors/show-errors
					x: -(nonAdjacentNodeHolderElement.x - nodeHolderElement.x) / d,
					// eslint-disable-next-line flowtype-errors/show-errors
					y: -(nonAdjacentNodeHolderElement.y - nodeHolderElement.y) / d
				};

				// apply the force in the normalized vector
				dir.x *= force;
				dir.y *= force;

				resultantForce.x += dir.x;
				resultantForce.y += dir.y;
			}
		}

		resultantForce.x *= this.options.c4;
		resultantForce.y *= this.options.c4;

		return {x: resultantForce.x, y: resultantForce.y};
	}

	updatePositions(): void {
		super.updatePositions();
		let i = 0;

		// Put nodes at random positions, initially
		if (this.options.drawUndefinedNodes) {
			for (const node of this.nodeHolder.values()) {
				node.x = Math.floor(Math.random() * 1000);
				node.y = Math.floor(Math.random() * 1000);
			}
		} else {
			for (const node of this.nodeHolder.values()) {
				if (this.filterResult.graphHolder.isConnected(node.id)) {
					node.x = Math.floor(Math.random() * 2000);
					node.y = Math.floor(Math.random() * 2000);
				} else {
					this.nodeHolder.delete(node.id);
				}
			}
		}

		if (this.options.fixAt00 !== "") {
			const fixedNode = this.nodeHolder.get(this.options.fixAt00);
			if (fixedNode) {
				fixedNode.x = 0;
				fixedNode.y = 0;
			}
		}

		const forces = {};
		while (i++ < this.options.iterNum) {
			for (const machineKey of this.nodeHolder.keys()) {
				forces[machineKey] = this.calculateForcesOnNode(machineKey);
			}

			for (const node of this.nodeHolder.values()) {
				node.x += forces[node.id].x;
				node.y += forces[node.id].y;
			}
		}
	}
}

export default SpringLayout;

// @flow
// TODO: Define position of each node (address)

import Node from "../Node";
import Edge from "../Edge";
import Filter from "../../Filter/Filter";
import FilterResult from "../../Filter/Results/FilterResult";
import GraphHolder from "../../GraphHolder";
import Machine from "../../../Machine";
import UserOption from "../../../UserOption";

class Layout {
	+filterResult: FilterResult;
	graphHolder: GraphHolder;
	machines: Map<string, Machine>;
	nodeHolder: Map<string, Node>;
	edgesOverride: Map<string, Map<string, Edge>>;
	options: { [string]: any };

	constructor(filterResult: FilterResult, machines: Map<string, Machine>, options: { [string]: any }) {
		this.filterResult = filterResult;
		this.graphHolder = filterResult.graphHolder;
		this.machines = machines;
		this.nodeHolder = new Map<string, Node>();
		this.edgesOverride = new Map<string, Map<string, Edge>>();

		/**
		 * colorMap defines a color for each bandwidth category
		 * colorMap[0] is the color of the server
		 * colorMap[1] is the color of the freerider
		 * colorMap[N] is the color of a node that isnt a freerider and isnt a server, sorted by ascending bandwidth
		 * @type {{filter: null, colorMap: [string, string, string, string, string]}}
		 */
		const defaultOptions = {
			filter: null,
			colorMap: [
				"#ff0000",
				"#0000ff",
				"#64ff00",
				"#fff400",
				"#ff7b00",
				"#ff0051",
				"#ff00dc",
				"#e100ff",
			]
		};

		this.options = Object.assign(defaultOptions, options);

		// Setup node holders
		for (const machineKey of machines.keys()) {
			const machine = this.machines.get(machineKey);
			if (machine && Object.prototype.hasOwnProperty.call(machine, "bandwidthClassification")) {
				const node = new Node(machineKey, machineKey, undefined, undefined, "#000", 1);
				node.color = this.options.colorMap[machine.bandwidthClassification];
				node.size = 5;

				this.nodeHolder.set(machineKey, node);
			} else {
				throw new Error(`Node ${machineKey} exists on overlay log, but it doesnt exists in performance log`);
			}
		}
	}

	updateNodeColors(): void {
		for (const [machineKey, machine] of this.machines.entries()) {
			if (Object.prototype.hasOwnProperty.call(machine, "bandwidthClassification")) {
				const node = this.nodeHolder.get(machineKey);
				if (node) {
					node.color = this.options.colorMap[machine.bandwidthClassification];
				}
			} else {
				throw new Error(`Node ${machineKey} exists on overlay log, but it doesnt exists in performance log`);
			}
		}
	}

	setMachines(machines: Map<string, Machine>): void {
		this.machines = machines;
	}

	setGraphHolder(graphHolder: GraphHolder): void {
		this.graphHolder = graphHolder;
	}

	updatePositions(): void {}

	static getOptions(): { [string]: UserOption<any> } {
		return {
			filter: new UserOption<Filter>("Filter", Filter)
		};
	}

	cloneNodeHolder(): Map<string, Node> {
		const resObj = new Map<string, Node>();
		for (const [index, node] of this.nodeHolder.entries()) {
			resObj.set(index, ((Object.assign(Object.create(Node), node): any): Node));
		}
		return resObj;
	}
}

export default Layout;

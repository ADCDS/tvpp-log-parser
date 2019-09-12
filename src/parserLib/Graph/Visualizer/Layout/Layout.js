// @flow
// TODO: Define position of each node (address)

import Node from "../Node";
import Edge from "../Edge";
import Filter from "../../Filter/Filter";
import FilterResult from "../../Filter/Results/FilterResult";
import GraphHolder from "../../GraphHolder";
import Machine from "../../../Machine";

class Layout {
	filterResult: FilterResult;
	graphHolder: GraphHolder;
	machines: Map<string, Machine>;
	nodeHolder: Map<string, Node>;
	edgesOverride: Map<string, Map<string, Edge>>;
	options: { [string]: any };

	constructor(
		filterResult: FilterResult,
		machines: Map<string, Machine>,
		options: { [string]: any }
	) {
		this.filterResult = filterResult;
		this.graphHolder = filterResult.graphHolder;
		this.machines = machines;
		this.nodeHolder = new Map<string, Node>();
		this.edgesOverride = new Map<string, Map<string, Edge>>();

		const defaultOptions = {
			filter: null,
			colorMap: {
				"0": "#ff0000",
				"1": "#0000ff",
				"2": "#ff7b00",
				"3": "#fff400",
				"4": "#64ff00"
			}
		};

		this.options = Object.assign(defaultOptions, options);

		this.bandwidths = {};

		// Setup node holders
		for (let machineKey of machines.keys()) {
			if (
				Object.prototype.hasOwnProperty.call(
					this.machines.get(machineKey),
					"bandwidthClassification"
				)
			) {
				const node = new Node(machineKey, machineKey);
				node.color = this.options.colorMap[
					this.machines.get(machineKey).bandwidthClassification
				];
				node.size = 5;

				this.nodeHolder.set(machineKey, node);
			} else {
				throw new Error(
					`Node ${machineKey} exists on overlay log, but it doesnt exists in performance log`
				);
			}
		}
	}

	updateNodeColors(): void {
		for (let machineKey of this.machines.keys()) {
			if (
				Object.prototype.hasOwnProperty.call(
					this.machines[machineKey],
					"bandwidthClassification"
				)
			) {
				this.nodeHolder[machineKey].color = this.options.colorMap[
					this.machines[machineKey].bandwidthClassification
				];
			} else {
				throw new Error(
					`Node ${machineKey} exists on overlay log, but it doesnt exists in performance log`
				);
			}
		}
	}

	setMachines(machines: Map<string, Machine>): void {
		this.machines = machines;
	}

	setGraphHolder(graphHolder) {
		this.graphHolder = graphHolder;
	}

	updatePositions(): void {}

	static getOptions(): {} {
		return {
			filter: {
				name: "Filter",
				type: Filter
			}
		};
	}

	cloneNodeHolder(): Map<string, Node> {
		const resObj = new Map<string, Node>();
		Object.keys(this.nodeHolder).forEach(index => {
			const node = this.nodeHolder[index]; // Node
			resObj.set(index, { ...node });
		});

		return resObj;
	}
}

export default Layout;

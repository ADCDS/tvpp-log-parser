// @flow
import Layout from "./Layout";
import FilterResult from "../../Filter/Results/FilterResult";
import GraphHolder from "../../GraphHolder";
import Machine from "../../../Machine";
import Edge from "../Edge";
import UserOption from "../../../UserOption";

class ComparisionLayout extends Layout {
	mainGraphHolder: GraphHolder;
	secondaryGraphHolder: GraphHolder;

	constructor(filterResultMain: FilterResult, filterResultSec: FilterResult, machines: Map<string, Machine>, options: { [string]: any }) {
		super(filterResultMain, machines, options);

		this.mainGraphHolder = filterResultMain.graphHolder;
		this.secondaryGraphHolder = filterResultSec.graphHolder;
	}

	updatePositions(): void {
		const comparisionGraph = this.mainGraphHolder.compareWith(this.secondaryGraphHolder);

		for (const machineKey of this.nodeHolder.keys()) {
			const node = this.nodeHolder.get(machineKey);
			if (node) node.color = "#484848";
		}
		for (const machineKey of this.nodeHolder.keys()) {
			const adjacentEdges = comparisionGraph.getEdges(machineKey);
			const machineFrom = this.machines.get(machineKey);
			if (!machineFrom) {
				throw new Error(`Machine ${machineKey} not found `);
			}

			Object.keys(adjacentEdges).forEach(machineKeyTo => {
				const value = adjacentEdges[machineKeyTo];
				if (value) {
					// We have a graph modification here, lets paint destination node and the edgeMap itself
					// this.nodeHolder[machineKey].color = this.options.colorMap[this.machines[machineKey].bandwidthClassification];

					let edgeMap = this.edgesOverride.get(machineKey);
					if (!edgeMap) {
						const map = new Map<string, Edge>();
						this.edgesOverride.set(machineKey, map);
						edgeMap = map;
					}

					const machineTo = this.machines.get(machineKeyTo);
					if (!machineTo) {
						throw new Error(`Machine ${machineKey} not found `);
					}

					const edgeObj = new Edge(this.options.colorMap[machineFrom.bandwidthClassification]);
					edgeMap.set(machineKeyTo, edgeObj);

					const nodeHolderElement = this.nodeHolder.get(machineKeyTo);
					if (nodeHolderElement) {
						nodeHolderElement.color = this.options.colorMap[machineTo.bandwidthClassification];
					}
				}
			});
		}
	}

	static getOptions(): { [string]: UserOption<any> } {
		return {};
	}
}

export default ComparisionLayout;

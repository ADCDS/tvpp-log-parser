// @flow
import Layout from "./Layout";
import FilterResult from "../../Filter/Results/FilterResult";
import GraphHolder from "../../GraphHolder";
import Machine from "../../../Machine";
import Filter from "../../Filter/Filter";
import Edge from "../Edge";

class ComparisionLayout extends Layout {
	mainGraphHolder: GraphHolder;
	secondaryGraphHolder: GraphHolder;

	constructor(filterResultMain: FilterResult<Filter>, filterResultSec: FilterResult<Filter>, machines: Map<string, Machine>, options: { [string]: any }) {
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
			Object.keys(adjacentEdges).forEach(to => {
				const value = adjacentEdges[to];
				if (value) {
					// We have a graph modification here, lets paint destination node and the edgeMap itself
					// this.nodeHolder[machineKey].color = this.options.colorMap[this.machines[machineKey].bandwidthClassification];

					let edgeMap = this.edgesOverride.get(machineKey);
					if (!edgeMap) {
						const map = new Map<string, Edge>();
						this.edgesOverride.set(machineKey, map);
						edgeMap = map;
					}

					const machine = this.machines.get(machineKey);
					if (!machine) {
						throw new Error(`Machine ${machineKey} not found `);
					}

					const edgeObj = new Edge(this.options.colorMap[machine.bandwidthClassification]);
					edgeMap.set(to, edgeObj);

					const nodeHolderElement = this.nodeHolder.get(to);
					if (nodeHolderElement) {
						nodeHolderElement.color = this.options.colorMap[machine.bandwidthClassification];
					}
				}
			});
		}
	}

	static getOptions(): { [string]: any } {}
}

export default ComparisionLayout;

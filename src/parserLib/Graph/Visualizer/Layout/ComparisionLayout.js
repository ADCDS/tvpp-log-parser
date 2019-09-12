// @flow
import Layout from "./Layout";
import FilterResult from "../../Filter/Results/FilterResult";
import GraphHolder from "../../GraphHolder";
import Machine from "../../../Machine";

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

		const nodeKeys = Object.keys(this.nodeHolder);
		nodeKeys.forEach(machineKey => {
			this.nodeHolder[machineKey].color = "#484848";
		});
		nodeKeys.forEach(machineKey => {
			const adjacentEdges = comparisionGraph.getEdges(machineKey);
			Object.keys(adjacentEdges).forEach(to => {
				const value = adjacentEdges[to];
				if (value) {
					if (!this.edgesOverride[machineKey]) {
						this.edgesOverride[machineKey] = {};
					}
					this.edgesOverride[machineKey][to] = {
						color: this.options.colorMap[this.machines[machineKey].bandwidthClassification]
					};

					// We have a graph modification here, lets paint destination node and the edge itself
					// this.nodeHolder[machineKey].color = this.options.colorMap[this.machines[machineKey].bandwidthClassification];

					if (this.nodeHolder[to]) this.nodeHolder[to].color = this.options.colorMap[this.machines[to].bandwidthClassification];
				}
			});
		});
	}

	static getOptions() {}
}

export default ComparisionLayout;

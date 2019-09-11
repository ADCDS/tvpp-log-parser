import Layout from "./Layout";
import TreeFilter from "../../Filter/Tree/TreeFilter";

class ComparisionLayout extends Layout {
  constructor(filterResultMain, filterResultSec, machines, options) {
    super(filterResultMain, machines, options);

    this.mainGraphHolder = filterResultMain.graphHolder;
    this.secondaryGraphHolder = filterResultSec.graphHolder;

    // console.log("ComparisionLayout initialized", this.mainGraphHolder, this.secondaryGraphHolder);
  }

  updatePositions() {
    const comparisionGraph = this.mainGraphHolder.compareWith(
      this.secondaryGraphHolder
    );

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
            color: this.options.colorMap[
              this.machines[machineKey].bandwidthClassification
            ]
          };

          // We have a graph modification here, lets paint destination node and the edge itself
          // this.nodeHolder[machineKey].color = this.options.colorMap[this.machines[machineKey].bandwidthClassification];

          if (this.nodeHolder[to])
            this.nodeHolder[to].color = this.options.colorMap[
              this.machines[to].bandwidthClassification
            ];
        }
      });
    });
  }

  static getOptions() {}
}

export default ComparisionLayout;

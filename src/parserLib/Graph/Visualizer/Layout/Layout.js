// TODO: Define position of each node (machine)

import Node from "../Node";
import Filter from "../../Filter/Filter";

class Layout {
  constructor(filterResult, machines, options) {
    this.filterResult = filterResult;
    this.graphHolder = filterResult.graphHolder;
    this.machines = machines;
    this.nodeHolder = {};
    this.edgesOverride = {};

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
    Object.keys(machines).forEach(machineKey => {
      if (this.machines[machineKey].hasOwnProperty("bandwidthClassification")) {
        this.nodeHolder[machineKey] = new Node(machineKey, machineKey);
        this.nodeHolder[machineKey].color = this.options.colorMap[
          this.machines[machineKey].bandwidthClassification
          ];
        this.nodeHolder[machineKey].size = 5;
      } else {
        throw `Node ${machineKey} exists on overlay log, but it doesnt exists in performance log`;
      }
    });
  }

  updateNodeColors() {
    Object.keys(this.machines).forEach(machineKey => {
      if (this.machines[machineKey].hasOwnProperty("bandwidthClassification")) {
        this.nodeHolder[machineKey].color = this.options.colorMap[
          this.machines[machineKey].bandwidthClassification
          ];
      } else {
        throw `Node ${machineKey} exists on overlay log, but it doesnt exists in performance log`;
      }
    });
  }

  setMachines(machines) {
    this.machines = machines;
  }

  setGraphHolder(graphHolder) {
    this.graphHolder = graphHolder;
  }

  updatePositions() {
  }

  static getOptions() {
    return {
      filter: {
        name: "Filter",
        type: Filter
      }
    };
  }

  cloneNodeHolder() {
    let resObj = {};
    Object.keys(this.nodeHolder).forEach(index => {
      const node = this.nodeHolder[index]; // Node
      resObj[index] = {...node};
    });

    return resObj;
  }
}

export default Layout;

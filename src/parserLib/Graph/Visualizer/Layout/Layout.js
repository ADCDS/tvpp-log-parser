// TODO: Define position of each node (machine)

import Node from "../Node";
import Filter from "../../Filter/Filter";

class Layout {
  constructor(graphHolder, machines, options) {
    this.graphHolder = graphHolder;
    this.machines = machines;
    this.nodeHolder = {};

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

    // Check if we need to apply filter
    if (this.options.filter !== null) {
      if (
        !(this.options.filter instanceof this.graphHolder.generatedByFilter)
      ) {
        // We need to apply our filter
        this.options.filter = new this.options.filter.prototype(
          graphHolder,
          options
        );
        this.graphHolder = this.options.filter.applyFilter();
      }
    }

    // Setup node holders
    Object.keys(machines).forEach(machineKey => {
      if (this.machines[machineKey].hasOwnProperty("bandwidthClassification")) {
        this.nodeHolder[machineKey] = new Node(machineKey);
        this.nodeHolder[machineKey].color = this.options.colorMap[
          this.machines[machineKey].bandwidthClassification
        ];
        this.nodeHolder[machineKey].size = 5;
      } else {
        throw `Node ${machineKey} exists on overlay log, but it doesnt exists in performance log`;
      }
    });
  }

  updateNodeColors(timestamp) {
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
    this.updateNodeColors(this.graphHolder.timestamp);
  }

  synchronizeSigma(sigma) {
    sigma.graph.clear();

    // Add nodes
    Object.keys(this.nodeHolder).forEach(machineKey => {
      const node = { ...this.nodeHolder[machineKey] };
      node.id = machineKey;
      sigma.graph.addNode(node);
    });

    // Add edges
    Object.keys(this.nodeHolder).forEach(machineKey => {
      const edgesTo = this.graphHolder.getOutgoingEdges(machineKey);
      edgesTo.forEach(machineDest => {
        try {
          sigma.graph.addEdge({
            id: `${machineKey}_>_${machineDest}`,
            source: machineKey,
            target: machineDest,
            size: 2,
            type: "arrow"
          });
        } catch (e) {
          console.log("Something bad happnd");
        }
      });
    });
  }

  getOptions() {
    return {
      filter: {
        name: "Filter",
        type: Filter
      }
    };
  }
}

export default Layout;

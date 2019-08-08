// TODO: Define position of each node (machine)

import Node from "../Node";

class Topology {
  constructor(graphHolder, machines) {
    this.graphHolder = graphHolder;
    this.machines = machines;
    this.nodeHolder = {};
    Object.keys(machines).forEach(machineKey => {
      this.nodeHolder[machineKey] = new Node(machineKey);
      this.nodeHolder[machineKey].color = "#000000";
      this.nodeHolder[machineKey].size = 3;
    });
  }

  setMachines(machines) {
    this.machines = machines;
  }

  setGraphHolder(graphHolder) {
    this.graphHolder = graphHolder;
  }

  updatePositions() {}
}

export default Topology;

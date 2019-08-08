import Topology from "./Topology";

class RingTopology extends Topology {
  constructor(graphHolder, machines, radius) {
    super(graphHolder, machines);
    this.radius = radius || 100;
  }

  updatePositions() {
    const nodeKeys = Object.keys(this.nodeHolder);
    const machineLength = nodeKeys.length;
    let iterNum = 0;
    nodeKeys.forEach(machineKey => {
      const node = this.nodeHolder[machineKey];
      node.x = this.radius * Math.cos((2 * iterNum * Math.PI) / machineLength);
      node.y = this.radius * Math.sin((2 * iterNum * Math.PI) / machineLength);
      iterNum++;
    });
  }
}

export default RingTopology;

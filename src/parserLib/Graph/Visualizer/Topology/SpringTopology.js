import Topology from "./Topology";

class SpringTopology extends Topology {
  constructor(graphHolder, machines, options) {
    super(graphHolder, machines, options);
    this.options = options || {};
    this.c1 = this.options.c1 || 2;
    this.c2 = this.options.c2 || 20;
    this.c3 = this.options.c3 || 1;
    this.c4 = this.options.c4 || 0.1;
    this.iterNum = this.options.iterNum || 100;
  }

  calculateForcesOnNode(machineKey) {
    let resultantForce = {x: 0, y:0};
    const edges = this.graphHolder.getEdges(machineKey);


    let adjacentVertices = Object.keys(edges).filter(el => {
      return edges[el];
    });

    adjacentVertices.forEach(adjacentMachine => {
      const xDist = Math.abs(this.nodeHolder[machineKey].x - this.nodeHolder[adjacentMachine].x);
      const yDist = Math.abs(this.nodeHolder[machineKey].y - this.nodeHolder[adjacentMachine].y);

      resultantForce.x -= xDist !== 0 ? this.c1 * Math.log(Math.abs(xDist) / this.c2) : 0;
      resultantForce.y -= yDist !== 0 ? this.c1 * Math.log(Math.abs(yDist) / this.c2) : 0;
    });

    // Forces that repel
    let nonAdjacentVertices = Object.keys(edges).filter(el => {
      return !edges[el];
    });
    nonAdjacentVertices.forEach(nonAdjacentMachine => {
      const xDist = Math.abs(this.nodeHolder[machineKey].x - this.nodeHolder[nonAdjacentMachine].x);
      const yDist = Math.abs(this.nodeHolder[machineKey].y - this.nodeHolder[nonAdjacentMachine].y);

      resultantForce.x += xDist !== 0 ? this.c3 / Math.pow(xDist, 2) : 0;
      resultantForce.y += yDist !== 0 ? this.c3 / Math.pow(yDist, 2) : 0;
    });

    let oldX = this.nodeHolder[machineKey].x;
    let oldY = this.nodeHolder[machineKey].y;

    resultantForce.x *= this.c4;
    resultantForce.y *= this.c4;

    this.nodeHolder[machineKey].x += resultantForce.x;
    this.nodeHolder[machineKey].y += resultantForce.y;

    let newX = this.nodeHolder[machineKey].x;
    let newY = this.nodeHolder[machineKey].y;


    console.log("SprintTopology: " + machineKey + ": OLD {x: " + oldX + ", y: " + oldY + "}, NEW {x: " + newX + ", y: " + newY + "}");
  }

  updatePositions() {
    super.updatePositions();
    let i = 0;

    // Put nodes at random positions, initially
    Object.keys(this.nodeHolder).forEach(machineKey => {
      this.nodeHolder[machineKey].x = Math.floor(Math.random() * 300);
      this.nodeHolder[machineKey].y = Math.floor(Math.random() * 300);
    });
    while (i++ < this.iterNum) {
      Object.keys(this.nodeHolder).forEach(machineKey => {
        this.calculateForcesOnNode(machineKey);
      });
    }
  }
}

export default SpringTopology;

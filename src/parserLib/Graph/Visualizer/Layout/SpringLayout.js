import Layout from "./Layout";

class SpringLayout extends Layout {
  constructor(graphHolder, machines, options) {
    super(graphHolder, machines, options);
    this.options = options || {};
    this.c1 = this.options.c1 || 2;
    this.c2 = this.options.c2 || 10;
    this.c3 = this.options.c3 || 1;
    this.c4 = this.options.c4 || 0.1;
    this.iterNum = this.options.iterNum || 100;
  }

  calculateForcesOnNode(machineKey) {
    let resultantForce = {x: 0, y: 0};
    const edges = this.graphHolder.getEdges(machineKey);


    let adjacentVertices = Object.keys(edges).filter(el => {
      return edges[el];
    });

    adjacentVertices.forEach(adjacentMachine => {
      const d = Math.sqrt(Math.pow(this.nodeHolder[machineKey].x - this.nodeHolder[adjacentMachine].x, 2) + Math.pow(this.nodeHolder[machineKey].y - this.nodeHolder[adjacentMachine].y, 2));
      if(d === 0)
        return;

      const force = this.c1 * Math.log(d / this.c2);

      // get the direction where the force is applied
      const dir = {
        x: (this.nodeHolder[adjacentMachine].x - this.nodeHolder[machineKey].x) / d,
        y: (this.nodeHolder[adjacentMachine].y - this.nodeHolder[machineKey].y) / d
      };

      // apply the force in the normalized vector
      dir.x *= force;
      dir.y *= force;

      resultantForce.x += dir.x;
      resultantForce.y += dir.y;
    });

    // Forces that repel
    let nonAdjacentVertices = Object.keys(edges).filter(el => {
      return !edges[el];
    });
    nonAdjacentVertices.forEach(nonAdjacentMachine => {
      const d = Math.sqrt(Math.pow(this.nodeHolder[machineKey].x - this.nodeHolder[nonAdjacentMachine].x, 2) + Math.pow(this.nodeHolder[machineKey].y - this.nodeHolder[nonAdjacentMachine].y, 2));
      if(d === 0)
        return;

      const force = this.c3 / Math.pow(d, 2);

      // get the direction where the force is applied
      const dir = {
        x: (this.nodeHolder[machineKey].x - this.nodeHolder[nonAdjacentMachine].x) / d,
        y: (this.nodeHolder[machineKey].y - this.nodeHolder[nonAdjacentMachine].y) / d
      };

      // apply the force in the normalized vector
      dir.x *= force;
      dir.y *= force;

      resultantForce.x += dir.x;
      resultantForce.y += dir.y;
    });

    let oldX = this.nodeHolder[machineKey].x;
    let oldY = this.nodeHolder[machineKey].y;

    resultantForce.x *= this.c4;
    resultantForce.y *= this.c4;

    this.nodeHolder[machineKey].ResX = this.nodeHolder[machineKey].x + resultantForce.x;
    this.nodeHolder[machineKey].ResY = this.nodeHolder[machineKey].y + resultantForce.y;

    let newX = this.nodeHolder[machineKey].x;
    let newY = this.nodeHolder[machineKey].y;


    console.log("SpringLayout: " + machineKey + ": OLD {x: " + oldX + ", y: " + oldY + "}, NEW {x: " + newX + ", y: " + newY + "}");
  }

  updatePositions() {
    super.updatePositions();
    let i = 0;

    // Put nodes at random positions, initially
    Object.keys(this.nodeHolder).forEach(machineKey => {
      this.nodeHolder[machineKey].x = Math.floor(Math.random() * 1000);
      this.nodeHolder[machineKey].y = Math.floor(Math.random() * 1000);
    });
    while (i++ < this.iterNum) {
      Object.keys(this.nodeHolder).forEach(machineKey => {
        this.calculateForcesOnNode(machineKey);
      });
      Object.keys(this.nodeHolder).forEach(machineKey => {
        this.nodeHolder[machineKey].x = this.nodeHolder[machineKey].ResX;
        this.nodeHolder[machineKey].y = this.nodeHolder[machineKey].ResY;
      });
    }
  }
}

export default SpringLayout;

import Layout from "./Layout";

class SpringLayout extends Layout {
  constructor(filterResult, machines, options) {
    const defaultOptions = {
      c1: 2,
      c2: 1,
      c3: 1,
      c4: 0.1,
      drawUndefinedNodes: false
    };

    options = Object.assign(defaultOptions, options);

    super(filterResult, machines, options);
  }

  calculateForcesOnNode(machineKey) {
    const resultantForce = { x: 0, y: 0 };
    const edges = this.graphHolder.getEdges(machineKey);

    const adjacentVertices = Object.keys(edges).filter(el => {
      return edges[el];
    });

    adjacentVertices.forEach(adjacentMachine => {
      const d = Math.sqrt(
        Math.pow(
          this.nodeHolder[machineKey].x - this.nodeHolder[adjacentMachine].x,
          2
        ) +
          Math.pow(
            this.nodeHolder[machineKey].y - this.nodeHolder[adjacentMachine].y,
            2
          )
      );
      if (d === 0) return;

      const force = this.options.c1 * Math.log(d / this.options.c2);

      // get the direction where the force is applied
      const dir = {
        x:
          (this.nodeHolder[adjacentMachine].x - this.nodeHolder[machineKey].x) /
          d,
        y:
          (this.nodeHolder[adjacentMachine].y - this.nodeHolder[machineKey].y) /
          d
      };

      // apply the force in the normalized vector
      dir.x *= force;
      dir.y *= force;

      resultantForce.x += dir.x;
      resultantForce.y += dir.y;
    });

    // Forces that repel
    const nonAdjacentVertices = Object.keys(edges).filter(el => {
      return !edges[el];
    });
    nonAdjacentVertices.forEach(nonAdjacentMachine => {
      const d = Math.sqrt(
        Math.pow(
          this.nodeHolder[machineKey].x - this.nodeHolder[nonAdjacentMachine].x,
          2
        ) +
          Math.pow(
            this.nodeHolder[machineKey].y -
              this.nodeHolder[nonAdjacentMachine].y,
            2
          )
      );
      if (d === 0) return;

      const force = this.options.c3 / Math.pow(d, 2);

      // get the direction where the force is applied
      const dir = {
        x:
          (this.nodeHolder[machineKey].x -
            this.nodeHolder[nonAdjacentMachine].x) /
          d,
        y:
          (this.nodeHolder[machineKey].y -
            this.nodeHolder[nonAdjacentMachine].y) /
          d
      };

      // apply the force in the normalized vector
      dir.x *= force;
      dir.y *= force;

      resultantForce.x += dir.x;
      resultantForce.y += dir.y;
    });

    const oldX = this.nodeHolder[machineKey].x;
    const oldY = this.nodeHolder[machineKey].y;

    resultantForce.x *= this.options.c4;
    resultantForce.y *= this.options.c4;

    this.nodeHolder[machineKey].ResX =
      this.nodeHolder[machineKey].x + resultantForce.x;
    this.nodeHolder[machineKey].ResY =
      this.nodeHolder[machineKey].y + resultantForce.y;

    const newX = this.nodeHolder[machineKey].x;
    const newY = this.nodeHolder[machineKey].y;

    console.log(
      `SpringLayout: ${machineKey}: OLD {x: ${oldX}, y: ${oldY}}, NEW {x: ${newX}, y: ${newY}}`
    );
  }

  updatePositions() {
    super.updatePositions();
    let i = 0;

    // Put nodes at random positions, initially
    Object.keys(this.nodeHolder).forEach(machineKey => {
      this.nodeHolder[machineKey].x = Math.floor(Math.random() * 1000);
      this.nodeHolder[machineKey].y = Math.floor(Math.random() * 1000);
    });
    while (i++ < this.options.iterNum) {
      Object.keys(this.nodeHolder).forEach(machineKey => {
        this.calculateForcesOnNode(machineKey);
      });
      Object.keys(this.nodeHolder).forEach(machineKey => {
        this.nodeHolder[machineKey].x = this.nodeHolder[machineKey].ResX;
        this.nodeHolder[machineKey].y = this.nodeHolder[machineKey].ResY;
      });
    }
  }

  static getOptions() {
    let options = super.getOptions();
    options = Object.assign(options, {
      c1: {
        name: "C1",
        type: Number,
        default: 2
      },
      c2: {
        name: "C2",
        type: Number,
        default: 1
      },
      c3: {
        name: "C3",
        type: Number,
        default: 1
      },
      c4: {
        name: "C4",
        type: Number,
        default: 0.1
      },
      iterNum: {
        name: "Iteration Number",
        type: Number,
        default: 100
      },
      drawUndefinedNodes: {
        name: "Draw undefined nodes",
        type: Boolean,
        default: false
      }
    });
    return options;
  }
}

export default SpringLayout;

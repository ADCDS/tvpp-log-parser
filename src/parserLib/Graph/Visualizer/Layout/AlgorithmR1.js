import Layout from "./Layout";
import TreeFilter from "../../Filter/Tree/TreeFilter";
import TreeFilterResult from "../../Filter/Results/TreeFilterResult";

// TODO add dynamicRadius
class AlgorithmR1 extends Layout {
  constructor(filterResult, machines, options) {
    const defaultOptions = {
      gamma: 200,
      drawUndefinedNodes: false,
      dynamicRadius: false
    };

    options = Object.assign(defaultOptions, options);
    super(filterResult, machines, options);

    if (this.options.source === null) {
      throw "Algorithm R1 initialized without a source";
    }

    if (!(filterResult instanceof TreeFilterResult)) {
      throw "Algorithm R1 initialized without a tree";
    }
  }

  static degreeToRadian(degree) {
    return (degree * Math.PI) / 180;
  }

  tAngle(p) {
    return 2 * Math.acos(p / (p + this.options.gamma));
  }

  heightOf(nodeName) {
    // children
    const edges = this.graphHolder.getEdges(nodeName);
    const childrenNodes = Object.keys(edges).filter(edgeMachine => {
      return edges[edgeMachine];
    });

    let highestHeight = 0;
    childrenNodes.forEach(node => {
      if (this.heightOf(node) > highestHeight) {
        highestHeight = this.heightOf(node);
      }
    });
    return 1 + highestHeight;
  }

  widthOf(nodeName) {
    // children
    let res = 0;
    const edges = this.graphHolder.getEdges(nodeName);
    const childrenNodes = Object.keys(edges).filter(edgeMachine => {
      return edges[edgeMachine];
    });
    // console.log(nodeName, childrenNodes.length, childrenNodes);
    if (childrenNodes.length === 0) return 1;
    childrenNodes.forEach(node => {
      res += this.widthOf(node);
    });
    return res;
  }

  drawSubTree1(machineName, p, alpha1, alpha2) {
    const v = this.nodeHolder[machineName];
    v.setPolarCoordinate(p, (alpha1 + alpha2) / 2);
    // console.log("Polar: ", p, (alpha1 + alpha2) / 2, "Cartesian: ", v.x, v.y);

    let alphaRes;
    let s;
    if (this.tAngle(p) < alpha1 - alpha2) {
      s = this.tAngle(p) / this.widthOf(machineName);
      alphaRes = (alpha1 + alpha2 - this.tAngle(p)) / 2;
    } else {
      s = (alpha2 - alpha1) / this.widthOf(machineName);
      alphaRes = alpha1;
    }

    // Get children nodes;
    const edges = this.graphHolder.getEdges(machineName);
    const childrenNodes = Object.keys(edges).filter(edgeMachine => {
      return edges[edgeMachine];
    });

    childrenNodes.forEach(node => {
      this.drawSubTree1(
        node,
        p + this.options.gamma,
        alphaRes,
        alphaRes + s * this.widthOf(node)
      );
      alphaRes += s * this.widthOf(node);
    });
  }

  calculateNumberOfNodesAtRing(ringIndex) {
    if (ringIndex === 0) return 1;
  }

  updatePositions() {
    super.updatePositions();
    this.drawSubTree1(this.source, 0, 0, AlgorithmR1.degreeToRadian(360));

    const undefinedNodes = [];
    if (!this.options.drawUndefinedNodes) {
      Object.keys(this.nodeHolder).forEach(nodeName => {
        if (
          this.nodeHolder[nodeName].x === undefined ||
          this.nodeHolder[nodeName].y === undefined
        ) {
          delete this.nodeHolder[nodeName];
        }
      });
    } else {
      Object.keys(this.nodeHolder).forEach(nodeName => {
        const node = this.nodeHolder[nodeName];

        if (node.x === undefined || node.y === undefined) {
          undefinedNodes.push(node);
        }
      });

      let iterNum = 0;
      undefinedNodes.forEach(node => {
        const heightOfSource = this.heightOf(this.source);

        node.x =
          this.options.gamma *
          heightOfSource *
          Math.cos((2 * iterNum * Math.PI) / undefinedNodes.length);
        node.y =
          this.options.gamma *
          heightOfSource *
          Math.sin((2 * iterNum * Math.PI) / undefinedNodes.length);
        iterNum++;
      });
    }
    console.log("Done AlgorithmR1");
  }

  getOptions() {
    let options = super.getOptions();
    options = Object.assign(options, {
      gamma: {
        name: "Gamma",
        type: Number,
        default: 200
      },
      source: {
        name: "Source",
        type: String,
        default: "::src"
      },
      drawUndefinedNodes: {
        name: "Draw undefined nodes",
        type: Boolean,
        default: false
      },
      filter: {
        name: "Filter",
        type: TreeFilter
      }
    });
    return options;
  }
}

export default AlgorithmR1;

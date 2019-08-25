import Topology from "./Topology";

class AlgorithmR1 extends Topology {
  constructor(graphHolder, machines, options) {
    super(graphHolder, machines, options);
    this.options = options || {};
    this.gamma = this.options.gamma || 700;
    this.source = this.options.source;
    this.height = 1;

    if (this.source === null) {
      throw "Algorithm R1 initialized without a source";
    }
  }

  static degreeToRadian(degree) {
    return (degree * Math.PI) / 180;
  }

  tAngle(p) {
    return 2 * Math.acos(p / (p + this.gamma));
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
    console.log("Polar: ", p, (alpha1 + alpha2) / 2, "Cartesian: ", v.x, v.y);

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
        p + this.gamma,
        alphaRes,
        alphaRes + s * this.widthOf(node)
      );
      alphaRes += s * this.widthOf(node);
    });
  }

  updatePositions() {
    super.updatePositions();
    this.drawSubTree1(this.source, 0, 0, AlgorithmR1.degreeToRadian(360));

    const undefinedNodes = [];
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
        this.gamma *
        heightOfSource *
        Math.cos((2 * iterNum * Math.PI) / undefinedNodes.length);
      node.y =
        this.gamma *
        heightOfSource *
        Math.sin((2 * iterNum * Math.PI) / undefinedNodes.length);
      iterNum++;
    });

    console.log("Done AlgorithmR1");
  }
}

export default AlgorithmR1;

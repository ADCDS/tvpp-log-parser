import Topology from "./Topology";

class AlgorithmR1 extends Topology {
  constructor(graphHolder, machines, options) {
    super(graphHolder, machines, options);
    this.options = options || {};
    this.gamma = this.options.gamma || 300;
    this.source = this.options.source;

    if(this.source === null){
      throw "Algorithm R1 initialized without a source";
    }
  }

  static degreeToRadian(degree){
    return degree * Math.PI / 180;
  }

  tAngle(p) {
    return 2 * Math.acos(p / (p + this.gamma));
  }

  widthOf(nodeName) {
    //children
    let res = 0;
    let edges = this.graphHolder.getEdges(nodeName);
    let childrenNodes = Object.keys(edges).filter(edgeMachine => {
      return edges[edgeMachine];
    });
    console.log(nodeName, childrenNodes.length, childrenNodes);
    if(childrenNodes.length === 0)
      return 1;
    childrenNodes.forEach(node => {
      res += this.widthOf(node);
    });
    return res;
  }

  drawSubTree1(machineName, p, alpha1, alpha2) {
    let v = this.nodeHolder[machineName];
    v.setPolarCoordinate(p,(alpha1 + alpha2) / 2);
    console.log("Polar: ", p,(alpha1 + alpha2) / 2);
    console.log("Cartesian: ", v.x, v.y);

    let alphaRes, s;
    if (this.tAngle(p) < alpha1 - alpha2) {
      s = this.tAngle(p) / this.widthOf(machineName);
      alphaRes = (alpha1 + alpha2 - this.tAngle(p))/2;
    } else {
      s = (alpha2 - alpha1) / this.widthOf(machineName);
      alphaRes = alpha1;
    }

    // Get children nodes;
    let edges = this.graphHolder.getEdges(machineName);
    let childrenNodes = Object.keys(edges).filter(edgeMachine => {
      return edges[edgeMachine];
    });

    childrenNodes.forEach(node => {
      this.drawSubTree1(node, p + this.gamma, alphaRes, alphaRes + (s * this.widthOf(node)));
      alphaRes = alphaRes + (s * this.widthOf(node))
    })
  }

  updatePositions() {
    super.updatePositions();
    this.drawSubTree1(this.source, 0,0, AlgorithmR1.degreeToRadian(360))
  }
}

export default AlgorithmR1;

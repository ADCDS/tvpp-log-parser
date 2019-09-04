import Layout from "./Layout";
import TreeFilter from "../../Filter/Tree/TreeFilter";

class RingLayout extends Layout {
  constructor(filterResult, machines, options) {
    const defaultOptions = {
      radius: 100,
      drawUndefinedNodes: false
    };

    options = Object.assign(defaultOptions, options);
    super(filterResult, machines, options);
  }

  updatePositions() {
    super.updatePositions();
    const nodeKeys = Object.keys(this.nodeHolder);
    const machineLength = nodeKeys.length;
    let iterNum = 0;
    nodeKeys.forEach(machineKey => {
      const node = this.nodeHolder[machineKey];
      node.x =
        this.options.radius * Math.cos((2 * iterNum * Math.PI) / machineLength);
      node.y =
        this.options.radius * Math.sin((2 * iterNum * Math.PI) / machineLength);
      iterNum++;
    });
  }

  static getOptions() {
    let options = super.getOptions();
    options = Object.assign(options, {
      radius: {
        name: "Radius",
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

export default RingLayout;

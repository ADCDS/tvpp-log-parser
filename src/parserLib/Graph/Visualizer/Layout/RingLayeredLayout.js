import Layout from "./Layout";
import DijkstraFilter from "../../Filter/Tree/DijkstraFilter";
import TreeFilterResult from "../../Filter/Results/TreeFilterResult";
import TreeFilter from "../../Filter/Tree/TreeFilter";

class RingLayeredLayout extends Layout {
  constructor(filterResult, machines, options) {
    const defaultOptions = {
      radius: 100,
      drawUndefinedNodes: false
    };

    options = Object.assign(defaultOptions, options);
    super(filterResult, machines, options);

    if (this.options.source === null) {
      throw "RingLayeredLayout initialized without a source";
    }

    if (!(filterResult instanceof TreeFilterResult)) {
      throw "RingLayeredLayout initialized without a tree";
    }
  }

  updatePositions() {
    super.updatePositions();
    const nodeKeys = Object.keys(this.nodeHolder);
    const machineLength = nodeKeys.length;
    const iterNum = 0;

    // Distances preprocessor
    const numberOfNodesAtRing = { 0: 1 };
    const iterNumRing = { 0: 0 };

    /**
     * Lets pull all infinity nodes to the beginning of the list
     * In order to be able to get the highest distance from the 'source' node,
     * and draw the nodes that are not connected to the 'source' node at the outer ring
     *
     * I believe that this can be optimized
     */
    Object.keys(this.filterResult.distancesFromSource).forEach(el => {
      if (this.filterResult.distancesFromSource[el] === Infinity)
        this.filterResult.distancesFromSource[el] = -Infinity;
    });
    const nodes = Object.keys(this.filterResult.distancesFromSource).sort(
      (e1, e2) => {
        return (
          this.filterResult.distancesFromSource[e1] -
          this.filterResult.distancesFromSource[e2]
        );
      }
    );

    const highestSourceDistance = this.filterResult.distancesFromSource[
      nodes[nodes.length - 1]
    ];

    nodes.forEach(el => {
      // Treat vertices that are not connected to the source node
      if (this.filterResult.distancesFromSource[el] === -Infinity)
        this.filterResult.distancesFromSource[el] = highestSourceDistance + 1;
      if (
        numberOfNodesAtRing.hasOwnProperty(
          this.filterResult.distancesFromSource[el]
        )
      ) {
        numberOfNodesAtRing[this.filterResult.distancesFromSource[el]]++;
      } else {
        numberOfNodesAtRing[this.filterResult.distancesFromSource[el]] = 1;
        iterNumRing[this.filterResult.distancesFromSource[el]] = 0;
      }
    });

    nodes.forEach(machineKey => {
      const node = this.nodeHolder[machineKey];
      const nodeFather = this.nodeHolder[this.filterResult.fathers[machineKey]];
      let nodeFatherOffset = { x: 0, y: 0 };
      if (nodeFather != null)
        nodeFatherOffset = { x: nodeFather.x, y: nodeFather.y };

      const distancesFromSourceElement = this.filterResult.distancesFromSource[
        machineKey
      ];
      node.x =
        /* nodeFatherOffset.x + */ this.options.radius *
        distancesFromSourceElement *
        Math.cos(
          (2 * iterNumRing[distancesFromSourceElement] * Math.PI) /
            numberOfNodesAtRing[distancesFromSourceElement]
        );
      node.y =
        /* nodeFatherOffset.y + */ this.options.radius *
        distancesFromSourceElement *
        Math.sin(
          (2 * iterNumRing[distancesFromSourceElement] * Math.PI) /
            numberOfNodesAtRing[distancesFromSourceElement]
        );
      iterNumRing[distancesFromSourceElement]++;
    });

    console.log("Done");
  }

  getOptions() {
    let options = super.getOptions();
    options = Object.assign(options, {
      radius: {
        name: "Radius",
        type: Number,
        default: 100
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

export default RingLayeredLayout;

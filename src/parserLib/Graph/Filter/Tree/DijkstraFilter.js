import {FibonacciHeap} from "@tyriar/fibonacci-heap";
import TreeFilter from "./TreeFilter";
import TreeFilterResult from "../Results/TreeFilterResult";

class DijkstraFilter extends TreeFilter {
  constructor(options) {
    super(options);
    if (!this.options.source) {
      throw "Invoked DijkstraFilter without 'source' option";
    }
  }

  dijkstraShortestPath = function (graph, vertices) {
    const dist = {};
    const prev = {};
    const heap = new FibonacciHeap();
    const queue = {};

    const decreaseDist = function (node, newValue) {
      dist[node] = newValue;
      heap.decreaseKey(queue[node], newValue);
    };

    vertices.forEach(machine => {
      prev[machine] = null;
      dist[machine] = Infinity;
      queue[machine] = heap.insert(Infinity, machine);
    });

    decreaseDist(this.options.source, 0);

    while (!heap.isEmpty()) {
      const currNode = heap.extractMinimum();
      const currNodeKey = currNode.value;
      const neighbors = Object.keys(graph[currNodeKey]);
      neighbors.forEach(destMachine => {
        if (!graph[currNodeKey][destMachine]) return;

        const newDist = dist[currNodeKey] + 1;
        if (newDist < dist[destMachine]) {
          // Relax
          decreaseDist(destMachine, newDist);
          prev[destMachine] = currNodeKey;
        }
      });
    }

    return {
      distancesFromSource: dist,
      fathers: prev
    };
  };

  applyFilter(graphHolder) {

    const newGraphHolder = graphHolder.clone();
    const vertices = Object.keys(newGraphHolder.graph);

    const {graph} = newGraphHolder;
    const dijkstraResults = this.dijkstraShortestPath(graph, vertices);
    const {fathers} = dijkstraResults;
    vertices.forEach(node => {
      vertices.forEach(node2 => {
        graph[node2][node] = false;
      });

      if (fathers[node] != null) graph[fathers[node]][node] = true;
    });

    return new TreeFilterResult(
      newGraphHolder,
      DijkstraFilter,
      dijkstraResults.distancesFromSource,
      dijkstraResults.fathers
    );
  }

  static getOptions() {
    return {
      source: {
        name: "Source",
        type: String,
        default: "::src"
      }
    }
  }
}

export default DijkstraFilter;
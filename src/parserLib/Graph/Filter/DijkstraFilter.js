import { FibonacciHeap } from "@tyriar/fibonacci-heap";
import Filter from "./Filter";

class DijkstraFilter extends Filter {
  constructor(graphHolder, options) {
    if (!options.hasOwnProperty("source")) {
      throw "Invoked DijkstraFilter without 'source' option";
    }

    super(graphHolder, options);
    this.vertices = Object.keys(this.graphHolder.graph);
    this.distancesFromSource = {};
    this.fathers = {};
  }

  dijkstraShortestPath = function(graph, source) {
    const dist = {};
    const prev = {};
    const heap = new FibonacciHeap();
    const queue = {};

    const decreaseDist = function(node, newValue) {
      dist[node] = newValue;
      heap.decreaseKey(queue[node], newValue);
    };

    this.vertices.forEach(machine => {
      prev[machine] = null;
      dist[machine] = Infinity;
      queue[machine] = heap.insert(Infinity, machine);
    });

    decreaseDist(source, 0);

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
    console.log("Done");

    this.distancesFromSource = dist;
    this.fathers = prev;
    return prev;
  };

  applyFilter() {
    const { graph } = this.graphHolder;
    const fathers = this.dijkstraShortestPath(graph, this.options.source);
    this.vertices.forEach(node => {
      const neighbors = Object.keys(graph[node]);
      neighbors.forEach(neighbor => {
        graph[node][neighbor] = false;
      });
      if (fathers[node] != null) graph[fathers[node]][node] = true;
    });

    console.log("Done");
  }
}

export default DijkstraFilter;

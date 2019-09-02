import TreeFilter from "./Filter/Tree/TreeFilter";

class GraphHolder {
  constructor(machines) {
    // Preallocate graph
    const machinesObj = {};
    machines.forEach(el => {
      machinesObj[el] = null;
    });

    this.graph = { ...machinesObj };
    machines.forEach(el => {
      this.graph[el] = { ...machinesObj };
    });

    this.generatedByFilter = null;
  }

  isTree() {
    return (
      this.generatedByFilter !== null &&
      this.generatedByFilter.prototype instanceof TreeFilter
    );
  }

  hasNode(machine) {
    return this.graph.hasOwnProperty(machine);
  }

  insertNode(machine) {
    if (this.hasNode(machine)) throw `Graph already has node ${machine}`;

    this.graph[machine] = {};
    Object.keys(this.graph).forEach(machineKey => {
      this.graph[machine][machineKey] = null;
    });
  }

  addEdge(from, to) {
    this.graph[from][to] = true;
  }

  forceAddEdge(from, to) {
    this.insertNode(from);
    this.graph[from][to] = true;
  }

  forceRemoveEdge(from, to) {
    this.insertNode(from);
    this.graph[from][to] = false;
  }

  removeEdge(from, to) {
    this.graph[from][to] = null;
  }

  getOutgoingEdges(machine) {
    const ret = [];
    Object.keys(this.graph[machine]).forEach(machineDest => {
      if (this.graph[machine][machineDest]) {
        ret.push(machineDest);
      }
    });

    return ret;
  }

  getEdges(machine) {
    return this.graph[machine];
  }

  clone() {
    return JSON.parse(JSON.stringify(this));
  }
}

export default GraphHolder;

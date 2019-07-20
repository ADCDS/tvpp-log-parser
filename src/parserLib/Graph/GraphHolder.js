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
  }

  addEdge(from, to) {
    this.graph[from][to] = true;
  }

  removeEdge(from, to) {
    this.graph[from][to] = null;
  }
}

export default GraphHolder;

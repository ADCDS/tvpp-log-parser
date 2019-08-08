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

  getOutgoingEdges(machine){
    let ret = [];
    Object.keys(this.graph[machine]).forEach(machineDest => {
      if(this.graph[machine][machineDest]){
        ret.push(machineDest);
      }
    });
    return ret;
  }
}

export default GraphHolder;

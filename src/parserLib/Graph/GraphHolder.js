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

  getMachinesThatPointTo(node){
    const ret = [];
    Object.keys(this.graph).forEach(index => {
        if(this.graph[index][node])
          ret.push(index);
    });
    return ret;
  }

  getEdges(machine) {
    return this.graph[machine];
  }

  clone() {
    const newObj = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this
    );
    newObj.graph = JSON.parse(JSON.stringify(this.graph));
    return newObj;
  }

  compareWith(anotherGraph){
    const newGraph = new GraphHolder(Object.keys(this.graph));
    Object.keys(this.graph).forEach(from => {
        const fromRes = this.graph[from];
        Object.keys(fromRes).forEach(to => {
            const value = fromRes[to]; // Boolean
            newGraph.graph[from][to] = (value !== anotherGraph.graph[from][to]);
        });
    });

    return newGraph;
  }
}

export default GraphHolder;

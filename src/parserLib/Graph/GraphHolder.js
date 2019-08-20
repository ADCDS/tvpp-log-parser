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

		this.timestamp = 0;
	}

	addEdge(from, to) {
		this.graph[from][to] = true;
	}

  forceAddEdge(from, to) {
	  if(!this.graph.hasOwnProperty(from)){
      this.graph[from] = {};
	    Object.keys(this.graph).forEach(machineKey => {
	      this.graph[from][machineKey] = null;
      });
    }

    this.graph[from][to] = true;
  }

  forceRemoveEdge(from, to) {
    if(!this.graph.hasOwnProperty(from)){
      this.graph[from] = {};
      Object.keys(this.graph).forEach(machineKey => {
        this.graph[from][machineKey] = null;
      });
    }

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

	getEdges(machine){
    return this.graph[machine];
  }

  clone(){
	  return JSON.parse(JSON.stringify(this));
  }
}

export default GraphHolder;

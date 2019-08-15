// TODO: Define position of each node (machine)

import Node from "../Node";

class Topology {
	constructor(graphHolder, machines, options) {
		this.graphHolder = graphHolder;
		this.machines = machines;
		this.nodeHolder = {};
		this.options = options;

		this.colorMap = options.colorMap || {
				"0": "#ff0000",
				"1": "#0000ff",
				"2": "#ff7b00",
				"3": "#fff400",
				"4": "#64ff00",
			};

		this.bandwidths = {};

		Object.keys(machines).forEach(machineKey => {
			this.nodeHolder[machineKey] = new Node(machineKey);
			this.nodeHolder[machineKey].color = this.colorMap[machines[machineKey].bandwidthClassification];
			this.nodeHolder[machineKey].size = 3;
		});
	}

	setMachines(machines) {
		this.machines = machines;
	}

	setGraphHolder(graphHolder) {
		this.graphHolder = graphHolder;
	}

	updatePositions() {}

	synchronizeSigma(sigma) {
		sigma.graph.clear();

		// Add nodes
		Object.keys(this.nodeHolder).forEach(machineKey => {
			const node = { ...this.nodeHolder[machineKey] };
			node.id = machineKey;
			sigma.graph.addNode(node);
		});

		// Add edges
		Object.keys(this.nodeHolder).forEach(machineKey => {
			const edgesTo = this.graphHolder.getOutgoingEdges(machineKey);
			edgesTo.forEach(machineDest => {
				try {
					sigma.graph.addEdge({
						id: `${machineKey}_>_${machineDest}`,
						source: machineKey,
						target: machineDest,
						size: 2,
						type: "arrow"
					});
				} catch (e) {
					console.log("Something bad happnd");
				}
			});
		});
	}
}

export default Topology;

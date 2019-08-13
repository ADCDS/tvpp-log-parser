import Topology from "./Topology";
import DijkstraFilter from "../../Filter/DijkstraFilter";

class StarTopology extends Topology {
	constructor(graphHolder, machines, options) {
		super(graphHolder, machines, options);
		this.radius = options.radius || 30;
		this.distancesFromSource = options.distancesFromSource;
		this.fathers = options.fathers;
		this.source = options.source;

		if (this.distancesFromSource == null || this.fathers == null) {
			if(this.source == null){
				throw "Invoked StarTopology without dijkstra data and source";
			}

			// I dont have the distances, need to calculate it using dijkstra
			const dijkstraFilter = new DijkstraFilter(graphHolder, {
				source: this.source
			});
			dijkstraFilter.applyFilter();
			this.distancesFromSource = dijkstraFilter.distancesFromSource;
			this.fathers = dijkstraFilter.fathers;
		}
	}

	updatePositions() {
		const nodeKeys = Object.keys(this.nodeHolder);
		const machineLength = nodeKeys.length;
		let iterNum = 0;

		//Distances preprocessor
		let numberOfNodesAtRing = {0: 1};
		let iterNumRing = {0: 0};
		let nodes = Object.keys(this.distancesFromSource).sort(
			(e1, e2) => {
				return this.distancesFromSource[e1] - this.distancesFromSource[e2];
			}
		);
		nodes.forEach(el => {
			if (numberOfNodesAtRing.hasOwnProperty(this.distancesFromSource[el])) {
				numberOfNodesAtRing[this.distancesFromSource[el]]++;
			} else {
				numberOfNodesAtRing[this.distancesFromSource[el]] = 1;
				iterNumRing[this.distancesFromSource[el]] = 0;
			}
		});

		nodes.forEach(machineKey => {
			const node = this.nodeHolder[machineKey];
			const nodeFather = this.nodeHolder[this.fathers[machineKey]];
			let nodeFatherOffset = {x: 0, y: 0};
			if(nodeFather != null)
				nodeFatherOffset = {x: nodeFather.x, y: nodeFather.y};

			node.x = /*nodeFatherOffset.x + */this.radius * this.distancesFromSource[machineKey] * Math.cos((2 * iterNumRing[this.distancesFromSource[machineKey]] * Math.PI) / numberOfNodesAtRing[this.distancesFromSource[machineKey]]);
			node.y = /*nodeFatherOffset.y + */this.radius * this.distancesFromSource[machineKey] * Math.sin((2 * iterNumRing[this.distancesFromSource[machineKey]] * Math.PI) / numberOfNodesAtRing[this.distancesFromSource[machineKey]]);
			iterNumRing[this.distancesFromSource[machineKey]]++;
		});

		console.log("Done");
	}
}

export default StarTopology;

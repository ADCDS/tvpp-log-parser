import Topology from "./Topology";
import DijkstraFilter from "../../Filter/DijkstraFilter";

class StarTopology extends Topology {
	constructor(graphHolder, machines, options, distanceFromSource, fathers) {
		super(graphHolder, machines, options);
		this.options = options || {
			radius: 30
		};
		if (this.distanceFromSource == null || this.fathers == null) {
			// I dont have the distances, need to calculate using dijkstra
			const dijkstraFilter = new DijkstraFilter(graphHolder);
			dijkstraFilter.applyFilter();
			this.distanceFromSource = dijkstraFilter.distancesFromSource;
			this.fathers = dijkstraFilter.fathers;
		}
		this.distanceFromSource = distanceFromSource;
	}

	updatePositions() {
		const nodeKeys = Object.keys(this.nodeHolder);
		const machineLength = nodeKeys.length;
		let iterNum = 0;

		//Distances preprocessor
		let numberOfNodesAtRing = {0: 1};
		let nodes = Object.keys(this.distanceFromSource).sort(
			(e1, e2) => {
				return this.distanceFromSource[e1] - this.distanceFromSource[e2];
			}
		);
		nodes.forEach(el => {
			if (numberOfNodesAtRing.hasOwnProperty(this.distanceFromSource[el])) {
				this.distanceFromSource[el]++;
			} else {
				this.distanceFromSource[el] = 1;
			}
		});
		nodes.forEach(machineKey => {
			const node = this.nodeHolder[machineKey];
			node.x = this.radius * this.distanceFromSource[machineKey] * Math.cos((2 * iterNum * Math.PI) / machineLength);
			node.y = this.radius * this.distanceFromSource[machineKey] * Math.sin((2 * iterNum * Math.PI) / machineLength);
			iterNum++;
		});
	}
}

export default StarTopology;

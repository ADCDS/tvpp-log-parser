import Layout from "./Layout";
import DijkstraFilter from "../../Filter/DijkstraFilter";

class StarLayout extends Layout {
	constructor(graphHolder, machines, options) {
		super(graphHolder, machines, options);
		this.radius = options.radius || 100;
		this.distancesFromSource = options.distancesFromSource;
		this.fathers = options.fathers;
		this.source = options.source;

		if (this.distancesFromSource == null || this.fathers == null) {
			if (this.source == null) {
				throw "Invoked StarLayout without dijkstra data and source";
			}

			// I dont have the distances, need to calculate it using dijkstra
			const dijkstraFilter = new DijkstraFilter(graphHolder.clone(), {
				source: this.source
			});
			dijkstraFilter.applyFilter();
			this.distancesFromSource = dijkstraFilter.distancesFromSource;
			this.fathers = dijkstraFilter.fathers;
		}
	}

	updatePositions() {
		super.updatePositions();
		const nodeKeys = Object.keys(this.nodeHolder);
		const machineLength = nodeKeys.length;
		let iterNum = 0;

		//Distances preprocessor
		let numberOfNodesAtRing = {0: 1};
		let iterNumRing = {0: 0};

		/**
		 * Lets pull all infinity nodes to the beginning of the list
		 * In order to be able to get the highest distance from the 'source' node,
		 * and draw the nodes that are not connected to the 'source' node at the outer ring
		 *
		 * I believe that this can be optimized
		 */
		Object.keys(this.distancesFromSource).forEach(el => {
			if (this.distancesFromSource[el] === Infinity)
				this.distancesFromSource[el] = -Infinity
		});
		let nodes = Object.keys(this.distancesFromSource).sort(
			(e1, e2) => {
				return this.distancesFromSource[e1] - this.distancesFromSource[e2];
			}
		);

		const highestSourceDistance = this.distancesFromSource[nodes[nodes.length - 1]];

		nodes.forEach(el => {
			// Treat vertices that are not connected to the source node
			if (this.distancesFromSource[el] === -Infinity) this.distancesFromSource[el] = highestSourceDistance + 1;
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
			if (nodeFather != null)
				nodeFatherOffset = {x: nodeFather.x, y: nodeFather.y};

			const distancesFromSourceElement = this.distancesFromSource[machineKey];
			node.x = /*nodeFatherOffset.x + */this.radius * distancesFromSourceElement * Math.cos((2 * iterNumRing[distancesFromSourceElement] * Math.PI) / numberOfNodesAtRing[distancesFromSourceElement]);
			node.y = /*nodeFatherOffset.y + */this.radius * distancesFromSourceElement * Math.sin((2 * iterNumRing[distancesFromSourceElement] * Math.PI) / numberOfNodesAtRing[distancesFromSourceElement]);
			iterNumRing[distancesFromSourceElement]++;
		});

		console.log("Done");
	}
}

export default StarLayout;

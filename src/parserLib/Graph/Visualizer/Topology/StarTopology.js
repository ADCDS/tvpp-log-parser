import Topology from "./Topology";

class StarTopology extends Topology {
	constructor(graphHolder, machines, distanceToSource) {
		super(graphHolder, machines);
	}

	updatePositions() {
		const nodeKeys = Object.keys(this.nodeHolder);
		const machineLength = nodeKeys.length;
		let iterNum = 0;
		nodeKeys.forEach(machineKey => {
			const node = this.nodeHolder[machineKey];
			node.x = this.radius * Math.cos((2 * iterNum * Math.PI) / machineLength);
			node.y = this.radius * Math.sin((2 * iterNum * Math.PI) / machineLength);
			iterNum++;
		});
	}
}

export default StarTopology;

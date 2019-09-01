import Layout from "./Layout";

class RingLayout extends Layout {
	constructor(graphHolder, machines, options) {
		super(graphHolder, machines, options);
		this.options = options || {
			radius: 100
		};
	}

	updatePositions() {
		super.updatePositions();
		const nodeKeys = Object.keys(this.nodeHolder);
		const machineLength = nodeKeys.length;
		let iterNum = 0;
		nodeKeys.forEach(machineKey => {
			const node = this.nodeHolder[machineKey];
			node.x =
				this.options.radius * Math.cos((2 * iterNum * Math.PI) / machineLength);
			node.y =
				this.options.radius * Math.sin((2 * iterNum * Math.PI) / machineLength);
			iterNum++;
		});
	}
}

export default RingLayout;

import Topology from "./Topology";

class SpringTopology extends Topology {
	constructor(graphHolder, machines, options) {
		super(graphHolder, machines, options);
		this.options = options || {
			c1: 2,
			c2: 1,
			c3: 3,
			c4: 0.1
		};
	}

	updatePositions() {

	}
}

export default SpringTopology;

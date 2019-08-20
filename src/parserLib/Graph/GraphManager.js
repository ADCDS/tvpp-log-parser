import GraphHolder from "./GraphHolder";

class GraphManager {
	constructor(logEntity) {
		this.logEntity = logEntity;
		this.currentState = 0;
		this.graphHolder = new GraphHolder(Object.keys(this.logEntity.machines));
	}

	syncMachines() {
		this.graphHolder = new GraphHolder(Object.keys(this.logEntity.machines));
	}

	// TODO THIS
	prevState() {
		if (this.currentState === 0) return;
		this.currentState -= 1;
	}

	nextState() {
		const currState = this.logEntity.eventList[this.currentState];
		if (this.currentState >= this.logEntity.eventList.length) return;
		this.currentState += 1;

		const currentMachine =
			currState.machine +
			(this.logEntity.options.discriminateByPort ? `:${currState.port}` : "");

		this.graphHolder.timestamp = currState.timestamp;

		// Outgoing edges
    if (currState.added["out"].length > 0) {
      currState.added["out"].forEach(targetMachine => {
        this.graphHolder.addEdge(currentMachine, targetMachine);
      });
    }
    if (currState.removed["out"].length > 0) {
      currState.removed["out"].forEach(targetMachine => {
        this.graphHolder.removeEdge(currentMachine, targetMachine);
      });
    }

    // Incoming edges
    if (currState.added["in"].length > 0) {
      currState.added["in"].forEach(targetMachine => {
        this.graphHolder.addEdge(targetMachine, currentMachine);
      });
    }
    if (currState.removed["in"].length > 0) {
      currState.removed["in"].forEach(targetMachine => {
        this.graphHolder.removeEdge(targetMachine, currentMachine);
      });
    }
	}

	goToAbsoluteState(statePos) {
		if (this.currentState >= this.logEntity.eventList.length) {
			// Requested position is beyond log size
			statePos = this.logEntity.eventList.length - 1;
		}
		if (statePos < 0) statePos = 0;

		if (statePos < this.currentState) {
			while (this.currentState !== statePos) {
				this.prevState();
			}
		} else if (statePos > this.currentState) {
			while (this.currentState !== statePos) {
				this.nextState();
			}
		}
	}

	goToLastState() {
		while (this.currentState < this.logEntity.eventList.length)
			this.nextState();
	}

	getMachines() {
		return this.logEntity.machines;
	}

	getGraphHolder() {
		return this.graphHolder;
	}
}

export default GraphManager;

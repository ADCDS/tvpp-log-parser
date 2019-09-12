// @flow
import GraphHolder from "./GraphHolder";
import TVPPLog from "../TVPPLog";
import Machine from "../Machine";

class GraphManager {
	logEntity: TVPPLog;
	currentEventIndex: number;
	currentSourceIndex: number;
	graphHolder: GraphHolder;

	constructor(logEntity: TVPPLog) {
		this.logEntity = logEntity;
		this.currentEventIndex = 0;
		this.currentSourceIndex = 0;
		this.graphHolder = new GraphHolder(Object.keys(this.logEntity.machines));
	}

	syncMachines(): void {
		this.graphHolder = new GraphHolder(Array.from(this.logEntity.machines.keys()));
	}

	goToNextState(): void {
		if (this.logEntity.options.iterateTroughServerApparition) {
			this.goToNextServerApparition();
		} else {
			this.goToNextEvent();
		}
	}

	goToPrevState(): void {
		if (this.logEntity.options.iterateTroughServerApparition) {
			this.goToPrevServerApparition();
		} else {
			this.goToPrevEvent();
		}
	}

	goToAbsoluteServerApparition(index: number): void {
		if (this.currentSourceIndex >= this.logEntity.sourceApparitionLocations.length)
			throw new Error(`goToNextServerApparition Invalid index: ${this.currentSourceIndex}`);

		this.syncMachines();
		this.currentSourceIndex = index;

		// TODO improve this
		if (index !== 0) {
			this.currentEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex - 1];
			const nextEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex];
			this.goToAbsoluteEventState(nextEventIndex);
		} else {
			const nextEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex];
			this.goToAbsoluteEventState(nextEventIndex);
		}
	}

	goToNextServerApparition(): void {
		if (this.currentSourceIndex >= this.logEntity.sourceApparitionLocations.length)
			throw new Error(`goToNextServerApparition Invalid index: ${this.currentSourceIndex}`);

		this.syncMachines();
		this.currentEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex++];
		const nextEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex];
		this.goToAbsoluteEventState(nextEventIndex);
	}

	goToPrevServerApparition(): void {
		if (this.currentSourceIndex <= 0) throw new Error(`goToPrevServerApparition Invalid index: ${this.currentSourceIndex}`);

		this.syncMachines();
		const nextEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex--];
		this.currentEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex];
		this.goToAbsoluteEventState(nextEventIndex);
	}

	goToNextEvent(): void {
		const overlayEntry = this.logEntity.overlayEntryList[this.currentEventIndex];
		if (this.currentEventIndex >= this.logEntity.overlayEntryList.length) return;
		this.currentEventIndex += 1;

		const currentMachine = overlayEntry.machineId;

		// Outgoing edges
		overlayEntry.partnersOut.forEach(targetMachine => {
			if (this.graphHolder.hasNode(targetMachine)) {
				this.graphHolder.addEdge(currentMachine, targetMachine);
			} else if (this.logEntity.options.forceAddGhostNodes) {
				// One of the machines is mentioned by another, but it doesn't have a single log of its own
				console.log(`Log ID: ${this.currentEventIndex}: Node ${targetMachine} doesn't exists. Forcefully adding it...`);
				this.graphHolder.insertNode(targetMachine);
				this.graphHolder.addEdge(currentMachine, targetMachine);
				this.logEntity.addRawMachine(targetMachine, [], []);
			}
		});

		// Incoming edges
		overlayEntry.partnersIn.forEach(targetMachine => {
			if (this.graphHolder.hasNode(targetMachine)) {
				this.graphHolder.addEdge(targetMachine, currentMachine);
			} else if (this.logEntity.options.forceAddGhostNodes) {
				// One of the machines is mentioned by another, but it doesn't have a single log of its own
				console.log(`Log ID: ${this.currentEventIndex}: Node ${targetMachine} doesn't exists. Forcefully adding it...`);
				this.graphHolder.insertNode(targetMachine);
				this.graphHolder.addEdge(targetMachine, currentMachine);
				this.logEntity.addRawMachine(targetMachine, [], []);
			}
		});
	}

	goToAbsoluteEventState(statePos: number): void {
		if (this.currentEventIndex >= this.logEntity.overlayEntryList.length) {
			// Requested position is beyond log size
			statePos = this.logEntity.overlayEntryList.length - 1;
		}
		if (statePos < 0) statePos = 0;

		if (statePos < this.currentEventIndex) {
			while (this.currentEventIndex !== statePos) {
				this.goToPrevEvent();
			}
		} else if (statePos > this.currentEventIndex) {
			while (this.currentEventIndex !== statePos) {
				this.goToNextEvent();
			}
		}
	}

	goToLastEventState(): void {
		while (this.currentEventIndex < this.logEntity.overlayEntryList.length) this.goToNextEvent();
	}

	getMachines(): Map<string, Machine> {
		return this.logEntity.machines;
	}

	getGraphHolder(): GraphHolder {
		return this.graphHolder;
	}
}

export default GraphManager;

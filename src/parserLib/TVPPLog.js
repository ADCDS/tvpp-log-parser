// @flow
import Machine from "./Machine";
import LogEntryOverlay from "./Log/Overlay/LogEntryOverlay";
import LogEntryPerformance from "./Log/Performance/LogEntryPerformance";
import OverlayState from "./Log/Overlay/OverlayState";
import PerformanceState from "./Log/Performance/PerformanceState";

class TVPPLog {
	options: { [string]: any };
	machines: Map<string, Machine>;
	overlayEntryList: Array<LogEntryOverlay>;
	performanceEntryList: Array<LogEntryPerformance>;

	sourceMachineKey: string;
	sourceApparitionLocations: Array<number>;

	constructor(options: { [string]: any }) {
		const defaultOptions = {
			forceAddGhostNodes: false,
			iterateTroughServerApparition: true
		};

		this.options = Object.assign(defaultOptions, options);
		this.machines = new Map<string, Machine>();
		this.overlayEntryList = [];
		this.performanceEntryList = [];
		this.sourceMachineKey = "";
		this.sourceApparitionLocations = [];
	}

	addOverlayEntries(entries: Array<LogEntryOverlay>) {
		this.sourceMachineKey = entries[0].machineId;

		let iterNum = 0;
		entries.forEach(logEntry => {
			this.overlayEntryList.push(logEntry);
			const currMachineName = logEntry.machineId;

			if (currMachineName === this.sourceMachineKey) {
				this.sourceApparitionLocations.push(iterNum);
			}

			const currEvent = logEntry.toOverlayState();

			if (this.hasMachine(logEntry.machineId)) {
				const machineRef = this.getMachine(logEntry.machineId);
				if (machineRef) machineRef.addOverlayStatus(currEvent);
			} else {
				// Create the address reference with the first overlay status
				this.addMachine(logEntry.machineId, [currEvent], []);
			}
			iterNum++;
		});
	}

	addRawMachine(machineId: string, overlayStatus: Array<OverlayState>, performanceStatus: Array<PerformanceState>) {
		this.machines.set(machineId, new Machine(machineId, overlayStatus, performanceStatus));
	}

	hasRawMachine(machineId: string) {
		return Object.prototype.hasOwnProperty.call(this.machines, machineId);
	}

	getRawMachine(machineId: string) {
		return this.machines.get(machineId);
	}

	addMachine(machineId: string, overlayStates: Array<OverlayState>, performanceStatus: Array<PerformanceState>) {
		this.machines.set(machineId, new Machine(machineId, overlayStates, performanceStatus));
	}

	hasMachine(machineId: string): boolean {
		return this.machines.has(machineId);
	}

	getMachine(machineId: string): Machine | void {
		return this.machines.get(machineId);
	}

	addPerformanceEntries(entries: Array<LogEntryPerformance>) {
		const foundBandwidths = {};
		entries.forEach(logEntry => {
			const performanceState = logEntry.toState();

			if (!this.hasMachine(logEntry.machineId)) {
				this.addMachine(logEntry.machineId, [], [performanceState]);
			}

			const machineObj = this.getMachine(logEntry.machineId);

			if (!machineObj) return;

			machineObj.addPerformanceStatus(performanceState);

			if (Object.prototype.hasOwnProperty.call(logEntry, "bandwidth")) {
				foundBandwidths[logEntry.bandwidth] = true;
				if (
					Object.prototype.hasOwnProperty.call(machineObj, "bandwidth") &&
					machineObj.bandwidth !== -1 &&
					machineObj.bandwidth !== logEntry.bandwidth
				) {
					throw new Error(
						`Machine ${machineObj.address} bandwidth from ${machineObj.bandwidth} to ${logEntry.bandwidth} changed at line ${logEntry.logId}`
					);
				}
				machineObj.bandwidth = logEntry.bandwidth;
			}
		});
		const bandwidths = Object.keys(foundBandwidths)
			.sort()
			.map(Number);

		for (const machine of this.machines.values()) {
			machine.bandwidthClassification = bandwidths.indexOf(machine.bandwidth);
		}
	}
}

export default TVPPLog;

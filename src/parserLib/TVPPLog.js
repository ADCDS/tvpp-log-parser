// @flow
import Machine from "./Machine";
import LogEntryOverlay from "./Log/Overlay/LogEntryOverlay";
import LogEntryPerformance from "./Log/Performance/LogEntryPerformance";
import OverlayState from "./Log/Overlay/OverlayState";
import PerformanceState from "./Log/Performance/PerformanceState";

class TVPPLog {
	overlayFileName: string;
	performanceFileName: string;

	options: { [string]: any };
	machines: Map<string, Machine>;
	overlayEntryList: Array<LogEntryOverlay>;
	performanceEntryList: Array<LogEntryPerformance>;

	initialTimestamp: number;
	eventTimestampMap: Map<number, number>;

	sourceMachineKey: string;
	sourceApparitionLocations: Array<number>;
	bandwidths: Array<number>;
	bandwidthClassifications: Array<String> = [
		"sizePeerOut_0_sizePeerOutFREE_0",
		"sizePeerOut_1_sizePeerOutFREE_38",
		"sizePeerOut_18_sizePeerOutFREE_22",
		"sizePeerOut_46_sizePeerOutFREE_0",
		"sizePeerOut_20_sizePeerOutFREE_0"
	];

	constructor(options: ?{ [string]: any }) {
		const defaultOptions = {
			forceAddGhostNodes: false
		};

		this.options = Object.assign(defaultOptions, options);
		this.machines = new Map<string, Machine>();
		this.overlayEntryList = [];
		this.performanceEntryList = [];
		this.sourceMachineKey = "";
		this.sourceApparitionLocations = [];
		this.eventTimestampMap = new Map<number, number>();
	}

	addOverlayEntries(entries: Array<LogEntryOverlay>) {
		this.sourceMachineKey = entries[0].machineId;
		this.initialTimestamp = entries[0].timestamp;

		let iterNum = 0;
		entries.forEach(logEntry => {
			this.overlayEntryList.push(logEntry);
			this.eventTimestampMap.set(logEntry.timestamp - this.initialTimestamp, iterNum);

			const currMachineName = logEntry.machineId;

			if (currMachineName === this.sourceMachineKey) {
				this.sourceApparitionLocations.push(iterNum);
			}

			// const currEvent = logEntry.toOverlayState();

			if (!this.hasMachine(logEntry.machineId)) {
				this.addMachine(logEntry.machineId, [], []);
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
				if (machineObj.bandwidth && machineObj.bandwidth !== logEntry.bandwidth) {
					throw new Error(
						`Machine ${machineObj.address} bandwidth from ${machineObj.bandwidth.toString()} to ${logEntry.bandwidth.toString()} changed at line ${
							logEntry.logId
						}`
					);
				}
				machineObj.bandwidth = logEntry.bandwidth;
			}
		});
		const bandwidths = Object.keys(foundBandwidths)
			.map(Number)
			.sort();

		for (const machine of this.machines.values()) {
			if (machine.bandwidth !== undefined) machine.bandwidthClassification = bandwidths.indexOf(machine.bandwidth);
		}
		this.bandwidths = bandwidths;
	}

	getMachinesByBandwidthClassification(): Map<number, Array<Machine>> {
		const returnMap = new Map<number, Array<Machine>>();
		for (const bandwitdth of this.bandwidths) {
			returnMap.set(bandwitdth, []);
		}
		for (const machine of this.machines.values()) {
			if (machine && machine.bandwidth !== undefined && machine.bandwidth !== null) {
				const machineArray = returnMap.get(machine.bandwidth);

				if (!machineArray) {
					throw new Error(`Machine ${machine.address} with an invalid bandwidth`);
				}

				machineArray.push(machine);
			}
		}

		return returnMap;
	}
}

export default TVPPLog;

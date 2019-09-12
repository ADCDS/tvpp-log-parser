// @flow
import Machine from "./Machine";
import LogEntryOverlay from "./Log/Overlay/LogEntryOverlay";
import LogEntryPerformance from "./Log/Performance/LogEntryPerformance";

class TVPPLog {
	options: { [string]: any };
	machines: Map<string, Machine>;
	eventList: Array<Event>;
	sourceMachineKey: string;
	sourceApparitionLocations: Array<number>;

	constructor(options) {
		const defaultOptions = {
			discriminateByPort: false,
			forceAddGhostNodes: false,
			iterateTroughServerApparition: true
		};

		this.options = Object.assign(defaultOptions, options);

		this.eventList = [];
		this.machines = new Map<string, Machine>();

		this.sourceMachineKey = null;
		this.sourceApparitionLocations = [];
	}

	addOverlayEntries(entries: Array<LogEntryOverlay>) {
		this.sourceMachineKey = this.getMachineName(
			entries[0].machine,
			entries[0].port
		);

		let iterNum = 0;
		entries.forEach(logEntry => {
			const currMachineName = this.getMachineName(
				logEntry.machine,
				logEntry.port
			);
			if (currMachineName === this.sourceMachineKey)
				this.sourceApparitionLocations.push(iterNum);

			const currEvent = logEntry.toEvent();

			// Rename address based on the configuration of TVPPLog
			["in", "out"].forEach(type => {
				currEvent.state[type] = currEvent.state[type].map(el => {
					return this.getMachineName(el.address, el.port);
				});
			});

			if (this.hasMachine(logEntry.machine, logEntry.port)) {
				// If it exists, we need to check its latest state
				const machineRef = this.getMachine(
					logEntry.machine,
					logEntry.port
				);

				// If we do, lets check the latest event state
				const latestEvent =
					machineRef.events[machineRef.events.length - 1];
				// currEvent.compareWithOldEvent(latestEvent);
				machineRef.addEvent(currEvent);
			} else {
				// No entry, this the first time we are seeing this address on the logs
				// This is the first event, no need to remove nodes
				currEvent.added = {
					in: currEvent.state.in,
					out: currEvent.state.out
				};

				// Create the address reference with the first event
				this.addMachine(logEntry.machine, logEntry.port, [currEvent]);
			}
			this.eventList.push(currEvent);
			iterNum++;
		});
	}

	addRawMachine(machineName: string, events: Array<Event>) {
		this.machines.set(machineName, new Machine(machineName, events));
	}

	hasRawMachine(machineName: string) {
		return Object.prototype.hasOwnProperty.call(this.machines, machineName);
	}

	getRawMachine(machineName: string) {
		return this.machines.get(machineName);
	}

	addMachine(address: string, port: number, events: Array<Event>) {
		const machineName = this.getMachineName(address, port);
		this.machines.set(machineName, new Machine(machineName, events));
	}

	getMachineName(address: string, port: number) {
		return address + (this.options.discriminateByPort ? `:${port}` : "");
	}

	hasMachine(address: string, port: number) {
		const machineName = this.getMachineName(address, port);
		return this.machines.has(machineName)
	}

	getMachine(address: string, port: number) {
		const machineName = this.getMachineName(address, port);
		return this.machines.get(machineName);
	}

	addPerformanceEntries(entries: Array<LogEntryPerformance>) {
		const foundBandwidths = {};
		entries.forEach(logEntry => {
			if (!this.hasMachine(logEntry.machine, logEntry.port)) {
				this.addMachine(logEntry.machine, logEntry.port);
			}

			const machineObj = this.getMachine(logEntry.machine, logEntry.port);
			machineObj.addStatus(logEntry);

			if (Object.prototype.hasOwnProperty.call(logEntry, "bandwidth")) {
				foundBandwidths[logEntry.bandwidth] = true;
				if (
					Object.prototype.hasOwnProperty.call(
						machineObj,
						"bandwidth"
					) &&
					machineObj.bandwidth !== null &&
					machineObj.bandwidth !== logEntry.bandwidth
				) {
					throw new `Machine ${machineObj.address} bandwidth from ${machineObj.bandwidth} to ${logEntry.bandwidth} changed at line ${logEntry.logId}`();
				}
				machineObj.bandwidth = logEntry.bandwidth;
			}
		});
		const bandwidths = Object.keys(foundBandwidths)
			.sort()
			.map(Number);

		for(let machine of this.machines.values()){
			machine.bandwidthClassification = bandwidths.indexOf(
				machine.bandwidth
			);
		}
	}
}

export default TVPPLog;

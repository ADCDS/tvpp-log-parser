// @flow
import OverlayState from "./OverlayState";

class LogEntryOverlay {
	machineId: string;
	machine: string;
	port: number;
	timestamp: number;
	partnersIn: Array<string>;
	partnersOut: Array<string>;

	constructor(machine: string, port: number, timestamp: number, partnersIn: Array<string>, partnersOut: Array<string>) {
		this.machineId = `${machine}:${port}`;
		this.machine = machine;
		this.port = port;
		this.timestamp = timestamp;
		this.partnersIn = partnersIn || [];
		this.partnersOut = partnersOut || [];
	}

	toOverlayState(): OverlayState {
		return new OverlayState(this.timestamp, {
			in: this.partnersIn,
			out: this.partnersOut
		});
	}
}

export default LogEntryOverlay;

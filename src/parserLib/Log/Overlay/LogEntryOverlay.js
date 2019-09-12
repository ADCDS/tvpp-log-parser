// @flow
import Event from "../../Event";

class LogEntryOverlay {
	machine: string;
	port: number;
	timestamp: number;
	partnersIn: Array<string>;
	partnersOut: Array<string>;

	constructor(
		machine: string,
		port: number,
		timestamp: number,
		partnersIn: Array<string>,
		partnersOut: Array<string>
	) {
		this.machine = machine;
		this.port = port;
		this.timestamp = timestamp;
		this.partnersIn = partnersIn || [];
		this.partnersOut = partnersOut || [];
	}

	toEvent(): Event {
		return new Event(this.machine, this.timestamp, this.port, {
			in: this.partnersIn,
			out: this.partnersOut
		});
	}
}

export default LogEntryOverlay;

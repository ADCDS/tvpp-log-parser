// @flow

import type { StateType } from "../types";

class Event {
	address: string;
	timestamp: number;
	port: number;
	state: StateType;

	constructor(
		address: string,
		timestamp: number,
		port: number,
		state: StateType
	) {
		this.address = address;
		this.port = port;
		this.timestamp = Number(timestamp);
		this.state = state || { in: [], out: [] };
	}
}

export default Event;

// @flow

import type { PartnersType } from "../../../types";

class OverlayState {
	timestamp: number;
	state: PartnersType;

	constructor(timestamp: number, state: PartnersType) {
		this.timestamp = Number(timestamp);
		this.state = state || { in: [], out: [] };
	}
}

export default OverlayState;

// @flow
import OverlayState from "./Log/Overlay/OverlayState";
import PerformanceState from "./Log/Performance/PerformanceState";

class Machine {
	address: string;
	overlayStatus: Array<OverlayState>;
	performanceStatus: Array<PerformanceState>;
	bandwidth: number;
	bandwidthClassification: number;


	constructor(address: string, overlayStatus: Array<OverlayState>, performanceStatus: Array<PerformanceState>) {
		this.address = address;
		this.overlayStatus = overlayStatus || [];
		this.performanceStatus = performanceStatus || [];

		this.bandwidth = null;
		this.bandwidthClassification = null;
	}

	/**
	 * Adds an event to address's event list
	 * @param {OverlayState} event
	 */
	addOverlayStatus(event) {
		this.overlayStatus.push(event);
	}

	addPerformanceStatus(status) {
		this.performanceStatus.push(status);
	}
}

export default Machine;

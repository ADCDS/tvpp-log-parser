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

		this.bandwidth = -1;
		this.bandwidthClassification = -1;
	}

	addOverlayStatus(event: OverlayState): void {
		this.overlayStatus.push(event);
	}

	addPerformanceStatus(status: PerformanceState): void {
		this.performanceStatus.push(status);
	}
}

export default Machine;

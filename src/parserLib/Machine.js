// @flow
import OverlayState from "./Log/Overlay/OverlayState";
import PerformanceState from "./Log/Performance/PerformanceState";

class Machine {
	address: string;
	overlayStatus: Array<OverlayState>;
	performanceStatus: Array<PerformanceState>;
	bandwidth: ?number;
	bandwidthClassification: ?number;

	constructor(address: string, overlayStatus: Array<OverlayState>, performanceStatus: Array<PerformanceState>) {
		this.address = address;
		this.overlayStatus = overlayStatus || [];
		this.performanceStatus = performanceStatus || [];

		this.bandwidth = undefined;
		this.bandwidthClassification = undefined;
	}

	addOverlayStatus(event: OverlayState): void {
		this.overlayStatus.push(event);
	}

	addPerformanceStatus(status: PerformanceState): void {
		this.performanceStatus.push(status);
	}

	findPerformanceLogByTimestamp(timestamp: number): PerformanceState {
		return this.performanceStatus.reduce((prev, curr) => (Math.abs(curr.bootTime - timestamp) < Math.abs(prev.bootTime - timestamp) ? curr : prev));
	}

	getPeerClassificationStringAt(timestamp: number): string {
		const perf = this.findPerformanceLogByTimestamp(timestamp);
		return `sizePeerOut_${perf.sizePeerOut}_sizePeerOutFREE_${perf.sizePeerOutFREE}`;
	}
}

export default Machine;

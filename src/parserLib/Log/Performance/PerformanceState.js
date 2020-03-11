// @flow

class PerformanceState {
	bootTime: number;
	bandwidth: number;
	sizePeerOut: number;
	sizePeerOutFREE: number;

	constructor(bootTime: number, bandwidth: number, sizePeerOut: number, sizePeerOutFREE: number) {
		this.bootTime = bootTime;
		this.bandwidth = bandwidth;
		this.sizePeerOut = sizePeerOut;
		this.sizePeerOutFREE = sizePeerOutFREE;
	}
}

export default PerformanceState;

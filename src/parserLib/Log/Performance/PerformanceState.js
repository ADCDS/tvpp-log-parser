// @flow

class PerformanceState {
	bootTime: number;
	bandwidth: number;
	sizePeerOut: number;
	sizePeerOutFREE: number;
	pkGen: number;
	pkSent: number;
	pkRecv: number;
	pkOver: number;
	pkMissed: number;
	pkExpected: number;
	media1: number;
	media2: number;

	constructor(
		bootTime: number,
		bandwidth: number,
		sizePeerOut: number,
		sizePeerOutFREE: number,
		pkGen: number,
		pkSent: number,
		pkRecv: number,
		pkOver: number,
		pkMissed: number,
		pkExpected: number,
		media1: number,
		media2: number
	) {
		this.bootTime = bootTime;
		this.bandwidth = bandwidth;
		this.sizePeerOut = sizePeerOut;
		this.sizePeerOutFREE = sizePeerOutFREE;

		this.pkGen = pkGen;
		this.pkSent = pkSent;
		this.pkRecv = pkRecv;
		this.pkOver = pkOver;
		this.pkMissed = pkMissed;
		this.pkExpected = pkExpected;
		this.media1 = media1;
		this.media2 = media2;

	}
}

export default PerformanceState;

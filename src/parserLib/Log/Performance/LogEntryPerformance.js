// @flow
import PerformanceState from "./PerformanceState";

class LogEntryPerformance {
	logId: number;
	machineId: string;
	machine: string;
	port: number;
	pkGen: number;
	pkSent: number;
	pkRecv: number;
	pkOver: number;
	requestSent: number;
	requestRecv: number;
	requestRetries: number;
	pkMissed: number;
	pkExpected: number;
	hopMedio: number;
	triesMedio: number;
	triesPerRequestMedio: number;
	media1: string;
	media2: string;
	mediaHop: number;
	mediaTries: number;
	mediaTime: number;
	msgTime: number;
	bootTime: number;
	partnerIn: number;
	partnerOut: number;
	partnerOutFREE: number;
	sizePeerOut: number;
	sizePeerOutFREE: number;
	bandwidth: number;
	ingressRequest: number;

	constructor(
		logId: number,
		machine: string,
		port: number,
		pkGen: number,
		pkSent: number,
		pkRecv: number,
		pkOver: number,
		requestSent: number,
		requestRecv: number,
		requestRetries: number,
		pkMissed: number,
		pkExpected: number,
		hopMedio: number,
		triesMedio: number,
		triesPerRequestMedio: number,
		media1: string,
		media2: string,
		mediaHop: number,
		mediaTries: number,
		mediaTime: number,
		msgTime: number,
		bootTime: number,
		partnerIn: number,
		partnerOut: number,
		partnerOutFREE: number,
		sizePeerOut: number,
		sizePeerOutFREE: number,
		bandwidth: number,
		ingressRequest: number
	) {
		this.logId = logId;
		this.machineId = `${machine}:${port}`;
		this.machine = machine;
		this.port = port;
		this.pkGen = pkGen;
		this.pkSent = pkSent;
		this.pkRecv = pkRecv;
		this.pkOver = pkOver;
		this.requestSent = requestSent;
		this.requestRecv = requestRecv;
		this.requestRetries = requestRetries;
		this.pkMissed = pkMissed;
		this.pkExpected = pkExpected;
		this.hopMedio = hopMedio;
		this.triesMedio = triesMedio;
		this.triesPerRequestMedio = triesPerRequestMedio;
		this.media1 = media1;
		this.media2 = media2;
		this.mediaHop = mediaHop;
		this.mediaTries = mediaTries;
		this.mediaTime = mediaTime;
		this.msgTime = msgTime;
		this.bootTime = bootTime;
		this.partnerIn = partnerIn;
		this.partnerOut = partnerOut;
		this.partnerOutFREE = partnerOutFREE;
		this.sizePeerOut = sizePeerOut;
		this.sizePeerOutFREE = sizePeerOutFREE;
		this.bandwidth = bandwidth;
		this.ingressRequest = ingressRequest;
	}

	toState(): PerformanceState {
		return new PerformanceState(this.bootTime, this.bandwidth, this.sizePeerOut, this.sizePeerOutFREE);
	}
}

export default LogEntryPerformance;

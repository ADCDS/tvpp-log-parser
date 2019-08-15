class LogEntryPerformance {
  constructor(
  	logId,
    machine,
    port,
    pkGen,
    pkSent,
    pkRecv,
    pkOver,
    requestSent,
    requestRecv,
    requestRetries,
    pkMissed,
    pkExpected,
    hopMedio,
    triesMedio,
    triesPerRequestMedio,
    media1,
    media2,
    mediaHop,
    mediaTries,
    mediaTime,
    msgTime,
    bootTime,
    partnerIn,
    partnerOut,
    partnerOutFREE,
    sizePeerOut,
    sizePeerOutFREE,
    bandwidth,
    ingressRequest
  ) {
    this.logId = logId;
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
    this.bandwidth = Number(bandwidth);
    this.ingressRequest = ingressRequest;
  }
}

export default LogEntryPerformance;

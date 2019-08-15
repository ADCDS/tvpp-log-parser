import Machine from "./Machine";

class TVPPLog {
  constructor(options) {
    const defaultOptions = {
      discriminateByPort: false
    };

    this.options = options || defaultOptions;

    this.eventList = [];
    this.machines = {};
  }

  /**
   *
   * @param entries
   */
  addOverlayEntries(entries) {
    entries.forEach(logEntry => {
      // Check if machine already exists in this log
      const currEvent = logEntry.toEvent();
      const machineName =
        logEntry.machine +
        (this.options.discriminateByPort ? `:${logEntry.port}` : "");
      if (Object.prototype.hasOwnProperty.call(this.machines, machineName)) {
        // If it exists, we need to check its latest state
        const machineRef = this.machines[machineName];

        // If we do, lets check the latest event state
        const latestEvent = machineRef.events[machineRef.events.length - 1];
        currEvent.compareWithOldEvent(latestEvent);
        machineRef.addEvent(currEvent);
      } else {
        // No entry, this the first time we are seeing this machine on the logs
        // This is the first event, no need to remove nodes
        currEvent.added = {
          in: logEntry.partnersIn,
          out: logEntry.partnersOut
        };

        // Create the machine reference with the first event
        this.machines[machineName] = new Machine(machineName, [currEvent]);
      }
      this.eventList.push(currEvent);
    });
  }

  addPerfomanceEntries(entries) {
  	let foundBandwidths = {};
    entries.forEach(logEntry => {
      const machineName =
        logEntry.machine +
        (this.options.discriminateByPort ? `:${logEntry.port}` : "");
      if (!Object.prototype.hasOwnProperty.call(this.machines, machineName)) {
        this.machines[machineName] = new Machine(machineName);
      }

      const machineObj = this.machines[machineName];
      machineObj.addStatus(logEntry);

      if(logEntry.hasOwnProperty('bandwidth')){
	      foundBandwidths[logEntry.bandwidth] = true;
	      /*if(machineObj.hasOwnProperty('bandwidth') && machineObj.bandwidth !== logEntry.bandwidth){
	      	throw "Machine " + machineObj.address +" bandwidth from " + machineObj.bandwidth + " to " + logEntry.bandwidth + " changed at line " + logEntry.logId;
	      }*/
	      machineObj.addBandwidth(logEntry.msgTime, logEntry.bandwidth);
      }
    });
    let bandwidths = Object.keys(foundBandwidths).sort().map(Number);
    Object.keys(this.machines).forEach(machineKey => {
    	Object.keys(this.machines[machineKey].bandwidths).forEach(machineBandwidths => {
    		let bandwidthObj = this.machines[machineKey].bandwidths[machineBandwidths];
    	    bandwidthObj.classification = bandwidths.indexOf(bandwidthObj.value);
	    });
    });
  }
}

export default TVPPLog;

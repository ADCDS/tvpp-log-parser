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

      // Rename machine based on the configuration of TVPPLog
      ["in", "out"].forEach(type => {
        currEvent.state[type] = currEvent.state[type].map(el => {
          return this.getMachineName(el.address, el.port);
        });
      });

      if (this.hasMachine(logEntry.machine, logEntry.port)) {
        // If it exists, we need to check its latest state
        const machineRef = this.getMachine(logEntry.machine, logEntry.port);

        // If we do, lets check the latest event state
        const latestEvent = machineRef.events[machineRef.events.length - 1];
        currEvent.compareWithOldEvent(latestEvent);
        machineRef.addEvent(currEvent);
      } else {
        // No entry, this the first time we are seeing this machine on the logs
        // This is the first event, no need to remove nodes
        currEvent.added = {
          in: currEvent.state.in,
          out: currEvent.state.out
        };

        // Create the machine reference with the first event
        this.addMachine(logEntry.machine, logEntry.port, [currEvent]);
      }
      this.eventList.push(currEvent);
    });
  }

  addRawMachine(machineName, events){
    this.machines[machineName] = new Machine(machineName, events);
  }

  hasRawMachine(machineName){
    return Object.prototype.hasOwnProperty.call(this.machines, machineName)
  }

  getRawMachine(machineName){
    return this.machines[machineName];
  }

  addMachine(address, port, events){
    const machineName = this.getMachineName(address, port);
    this.machines[machineName] = new Machine(machineName, events);
  }

  getMachineName(address, port) {
    return address +
      (this.options.discriminateByPort ? `:${port}` : "");;
  }

  hasMachine(address, port){
    const machineName = this.getMachineName(address, port);
    return Object.prototype.hasOwnProperty.call(this.machines, machineName)
  }

  getMachine(address, port){
    const machineName = this.getMachineName(address, port);
    return this.machines[machineName];
  }

  addPerfomanceEntries(entries) {
  	let foundBandwidths = {};
    entries.forEach(logEntry => {
      if (!this.hasMachine(logEntry.machine, logEntry.port)) {
        this.addMachine(logEntry.machine, logEntry.port);
      }

      const machineObj = this.getMachine(logEntry.machine, logEntry.port);
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

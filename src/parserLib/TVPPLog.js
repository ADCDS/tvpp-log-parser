import Machine from "./Machine";

class TVPPLog {
  constructor(options) {
    let defaultOptions = {
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
      let machineName = logEntry.machine + (this.options.discriminateByPort ? ":" + logEntry.port : "");
      if (Object.prototype.hasOwnProperty.call(this.machines, machineName)) {
        // If it exists, we need to check its latest state
        const machineRef = this.machines[
          machineName
          ];

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
        this.machines[machineName] = new Machine(
          machineName,
          [currEvent]
        );
      }
      this.eventList.push(currEvent);
    });
  }

  addPerfomanceEntries(entries) {
    entries.forEach(logEntry => {
      let machineName = logEntry.machine + (this.options.discriminateByPort ? ":" + logEntry.port : "");
      if (
        !Object.prototype.hasOwnProperty.call(
          this.machines,
          machineName
        )
      ) {
        this.machines[machineName] = new Machine(
          machineName
        );
      }

      const machineObj = this.machines[machineName];
      machineObj.addStatus(logEntry);
    });
  }
}

export default TVPPLog;

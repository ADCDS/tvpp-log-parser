class TVPPLog {
  constructor() {
    this.eventList = [];
    this.machines = {};
  }

  /**
   *
   * @param entries
   */
  addEntries(entries) {
    entries.forEach(logEntry => {
      // Check if machine already exists in this log
      const currEvent = logEntry.toEvent();
      if (
        Object.prototype.hasOwnProperty.call(this.machines, logEntry.machine)
      ) {
        // If it exists, we need to check its latest state
        const machineRef = this.machines[logEntry.machine];

        // If we do, lets check the latest event state
        const latestEvent = machineRef[machineRef.length - 1];
        currEvent.compareWithOldEvent(latestEvent);
        machineRef.push(currEvent);
      } else {
        // No entry, this the first time we are seeing this machine on the logs
        // This is the first event, no need to remove nodes
        currEvent.added = {
          in: logEntry.partnersIn,
          out: logEntry.partnersOut
        };

        // Create the machine reference with the first event
        this.machines[`${logEntry.machine}:${logEntry.port}`] = [currEvent];
      }
      this.eventList.push(currEvent);
    });
  }
}

export default TVPPLog;

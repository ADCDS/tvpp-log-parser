import Machine from "./Machine";

class TVPPLog {
  constructor() {
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
      if (
        Object.prototype.hasOwnProperty.call(
          this.machines,
          `${logEntry.machine}:${logEntry.port}`
        )
      ) {
        // If it exists, we need to check its latest state
        const machineRef = this.machines[
          `${logEntry.machine}:${logEntry.port}`
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
        this.machines[`${logEntry.machine}:${logEntry.port}`] = new Machine(
          `${logEntry.machine}:${logEntry.port}`,
          currEvent
        );
      }
      this.eventList.push(currEvent);
    });
  }

  addPerfomanceEntries(entries) {
    entries.forEach(logEntry => {
      if (
        !Object.prototype.hasOwnProperty.call(
          this.machines,
          `${logEntry.machine}:${logEntry.port}`
        )
      ) {
        this.machines[`${logEntry.machine}:${logEntry.port}`] = new Machine(
          `${logEntry.machine}:${logEntry.port}`
        );
      }

      const machineObj = this.machines[`${logEntry.machine}:${logEntry.port}`];
      machineObj.addStatus(logEntry);
    });
  }
}

export default TVPPLog;

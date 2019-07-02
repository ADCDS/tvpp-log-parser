import LogEntry from "./LogEntry";

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
      //Check if machine already exists in this log
      let currEvent = logEntry.toEvent();
      if (this.machines.hasOwnProperty(logEntry.machine)) {

        //If it exists, we need to check its latest state
        let machineRef = this.machines[logEntry.machine];

        //If we do, lets check the latest event state
        let latestEvent = machineRef[machineRef.length - 1];
        currEvent.compareWithOldEvent(latestEvent);
        machineRef.push(currEvent)


      } else {//No entry, this the first time we are seeing this machine on the logs]
        //This is the first event, no need to remove nodes
        currEvent.added = logEntry.adjacentMachines;

        //Create the machine reference with the first event
        this.machines[logEntry.machine] = [currEvent];
      }
      this.eventList.push(currEvent);

    });
  }
}

export default TVPPLog;

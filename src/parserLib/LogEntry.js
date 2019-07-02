import Event from "./Event";

class LogEntry {
  constructor(machine, port, timestamp, adjacentMachines){
    this.machine = machine;
    this.port = port;
    this.timestamp =  timestamp;
    this.adjacentMachines = adjacentMachines || [];
  }

  toEvent(){
    return new Event(this.machine, this.port, this.adjacentMachines);
  }
}

export default LogEntry;

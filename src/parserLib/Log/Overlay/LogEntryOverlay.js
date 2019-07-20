import Event from "../../Event";

class LogEntryOverlay {
  constructor(machine, port, timestamp, partnersIn, partnersOut) {
    this.machine = machine;
    this.port = port;
    this.timestamp = timestamp;
    this.partnersIn = partnersIn || [];
    this.partnersOut = partnersOut || [];
  }

  toEvent() {
    return new Event(this.machine, this.port, {
      in: this.partnersIn,
      out: this.partnersOut
    });
  }
}

export default LogEntryOverlay;

import GraphHolder from "./GraphHolder";

class GraphManager {
  constructor(logEntity) {
    this.logEntity = logEntity;
    this.currentState = 0;
    this.graphHolder = new GraphHolder(Object.keys(this.logEntity.machines));
  }

  syncMachines() {
    this.graphHolder = new GraphHolder(Object.keys(this.logEntity.machines));
  }

  // TODO THIS
  prevState() {
    if (this.currentState === 0) return;
    this.currentState -= 1;
  }

  nextState() {
    const currentEvent = this.logEntity.eventList[this.currentState];
    if (this.currentState >= this.logEntity.eventList.length) return;
    this.currentState += 1;

    const currentMachine = this.logEntity.getMachineName(currentEvent.machine, currentEvent.port);

    this.graphHolder.timestamp = currentEvent.timestamp;

    // Outgoing edges
    if (currentEvent.added["out"].length > 0) {
      currentEvent.added["out"].forEach(targetMachine => {
        try {
          this.graphHolder.addEdge(currentMachine, targetMachine);
        } catch (e) {
          // One of the machines is mentioned by another, but it doesn't have a single log of its own
          console.log("Log ID: " + this.currentState + ": Couldn't add edge " + currentMachine + " -> " + targetMachine + ". Forcefully adding it...");
          this.graphHolder.forceAddEdge(currentMachine, targetMachine);
          this.logEntity.addRawMachine(currentMachine);
        }
      });
    }
    if (currentEvent.removed["out"].length > 0) {
      currentEvent.removed["out"].forEach(targetMachine => {
        try {
          this.graphHolder.removeEdge(currentMachine, targetMachine);
        } catch (e) {
          // One of the machines is mentioned by another, but it doesn't have a single log of its own
          console.log("Log ID: " + this.currentState + ": Couldn't add edge " + currentMachine + " -> " + targetMachine + ". Forcefully removing it...");
          this.graphHolder.forceRemoveEdge(currentMachine, targetMachine);
          this.logEntity.addRawMachine(currentMachine);
        }
      });
    }

    // Incoming edges
    if (currentEvent.added["in"].length > 0) {
      currentEvent.added["in"].forEach(targetMachine => {
        try {
          this.graphHolder.addEdge(targetMachine, currentMachine);
        } catch (e) {
          // One of the machines is mentioned by another, but it doesn't have a single log of its own
          console.log("Log ID: " + this.currentState + ": Couldn't add edge " + targetMachine + " -> " + currentMachine + ". Forcefully adding it...");
          this.graphHolder.forceAddEdge(targetMachine, currentMachine);
          this.logEntity.addRawMachine(targetMachine);
        }

      });
    }
    if (currentEvent.removed["in"].length > 0) {
      currentEvent.removed["in"].forEach(targetMachine => {
        try {
          this.graphHolder.removeEdge(targetMachine, currentMachine);
        } catch (e) {
          // One of the machines is mentioned by another, but it doesn't have a single log of its own
          console.log("Log ID: " + this.currentState + ": Couldn't add edge " + targetMachine + " -> " + currentMachine + ". Forcefully removing it...");
          this.graphHolder.forceRemoveEdge(targetMachine, currentMachine);
          this.logEntity.addRawMachine(targetMachine);
        }
      });
    }
  }

  goToAbsoluteState(statePos) {
    if (this.currentState >= this.logEntity.eventList.length) {
      // Requested position is beyond log size
      statePos = this.logEntity.eventList.length - 1;
    }
    if (statePos < 0) statePos = 0;

    if (statePos < this.currentState) {
      while (this.currentState !== statePos) {
        this.prevState();
      }
    } else if (statePos > this.currentState) {
      while (this.currentState !== statePos) {
        this.nextState();
      }
    }
  }

  goToLastState() {
    while (this.currentState < this.logEntity.eventList.length)
      this.nextState();
  }

  getMachines() {
    return this.logEntity.machines;
  }

  getGraphHolder() {
    return this.graphHolder;
  }
}

export default GraphManager;

import GraphHolder from "./GraphHolder";

class GraphManager {
  constructor(logEntity) {
    this.logEntity = logEntity;
    this.currentEventIndex = 0;
    this.currentSourceIndex = 0;
    this.graphHolder = new GraphHolder(Object.keys(this.logEntity.machines));
  }

  syncMachines() {
    this.graphHolder = new GraphHolder(Object.keys(this.logEntity.machines));
  }

  goToNextState(){
    if(this.logEntity.options.iterateTroughServerApparition){
      this.goToNextServerApparition();
    }else{
      this.goToNextEvent();
    }
  }

  goToPrevState(){
    if(this.logEntity.options.iterateTroughServerApparition){
      this.goToPrevServerApparition();
    }else{
      this.goToPrevEvent();
    }
  }

  goToAbsoluteServerApparition(index){
    if(this.currentSourceIndex >= this.logEntity.sourceApparitionLocations.length)
      throw "goToNextServerApparition Invalid index: " + this.currentSourceIndex;

    this.syncMachines();
    this.currentSourceIndex = index;
    this.currentEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex-1];
    const nextEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex];
    this.goToAbsoluteEventState(nextEventIndex);
  }

  goToNextServerApparition(){
    if(this.currentSourceIndex >= this.logEntity.sourceApparitionLocations.length)
      throw "goToNextServerApparition Invalid index: " + this.currentSourceIndex;

    this.syncMachines();
    this.currentEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex++];
    const nextEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex];
    this.goToAbsoluteEventState(nextEventIndex);
  }

  goToPrevServerApparition(){
    if(this.currentSourceIndex <= 0)
      throw "goToPrevServerApparition Invalid index: " + this.currentSourceIndex;

    this.syncMachines();
    const nextEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex--];
    this.currentEventIndex = this.logEntity.sourceApparitionLocations[this.currentSourceIndex];
    this.goToAbsoluteEventState(nextEventIndex);
  }

  goToNextEvent() {
    const currentEvent = this.logEntity.eventList[this.currentEventIndex];
    if (this.currentEventIndex >= this.logEntity.eventList.length) return;
    this.currentEventIndex += 1;

    const currentMachine = this.logEntity.getMachineName(
      currentEvent.machine,
      currentEvent.port
    );

    // Outgoing edges
    if (currentEvent.added.out.length > 0) {
      currentEvent.added.out.forEach(targetMachine => {
        if (this.graphHolder.hasNode(targetMachine)) {
          this.graphHolder.addEdge(currentMachine, targetMachine);
        } else {
          if (this.logEntity.options.forceAddGhostNodes) {
            // One of the machines is mentioned by another, but it doesn't have a single log of its own
            console.log(
              `Log ID: ${this.currentEventIndex}: Node ${targetMachine} doesn't exists. Forcefully adding it...`
            );
            this.graphHolder.insertNode(targetMachine);
            this.graphHolder.addEdge(currentMachine, targetMachine);
            this.logEntity.addRawMachine(targetMachine);
          }
        }
      });
    }
    if (currentEvent.removed.out.length > 0) {
      currentEvent.removed.out.forEach(targetMachine => {
        if (this.graphHolder.hasNode(targetMachine)) {
          this.graphHolder.removeEdge(currentMachine, targetMachine);
        } else {
          if (this.logEntity.options.forceAddGhostNodes) {
            // One of the machines is mentioned by another, but it doesn't have a single log of its own
            console.log(
              `Log ID: ${this.currentEventIndex}: Node ${targetMachine} doesn't exists. Forcefully adding it...`
            );
            this.graphHolder.insertNode(targetMachine);
            this.graphHolder.removeEdge(currentMachine, targetMachine);
            this.logEntity.addRawMachine(targetMachine);
          }
        }
      });
    }

    // Incoming edges
    if (currentEvent.added.in.length > 0) {
      currentEvent.added.in.forEach(targetMachine => {
        if (this.graphHolder.hasNode(targetMachine)) {
          this.graphHolder.addEdge(targetMachine, currentMachine);
        } else {
          if (this.logEntity.options.forceAddGhostNodes) {
            // One of the machines is mentioned by another, but it doesn't have a single log of its own
            console.log(
              `Log ID: ${this.currentEventIndex}: Node ${targetMachine} doesn't exists. Forcefully adding it...`
            );
            this.graphHolder.insertNode(targetMachine);
            this.graphHolder.addEdge(targetMachine, currentMachine);
            this.logEntity.addRawMachine(targetMachine);
          }
        }
      });
    }
    if (currentEvent.removed.in.length > 0) {
      currentEvent.removed.in.forEach(targetMachine => {
        if (this.graphHolder.hasNode(targetMachine)) {
          this.graphHolder.removeEdge(targetMachine, currentMachine);
        } else {
          if (this.logEntity.options.forceAddGhostNodes) {
            // One of the machines is mentioned by another, but it doesn't have a single log of its own
            console.log(
              `Log ID: ${this.currentEventIndex}: Node ${targetMachine} doesn't exists. Forcefully adding it...`
            );
            this.graphHolder.insertNode(targetMachine);
            this.graphHolder.removeEdge(targetMachine, currentMachine);
            this.logEntity.addRawMachine(targetMachine);
          }
        }
      });
    }
  }

  // TODO THIS
  goToPrevEvent() {
    if (this.currentEventIndex === 0) return;
    this.currentEventIndex -= 1;
  }

  goToAbsoluteEventState(statePos) {
    if (this.currentEventIndex >= this.logEntity.eventList.length) {
      // Requested position is beyond log size
      statePos = this.logEntity.eventList.length - 1;
    }
    if (statePos < 0) statePos = 0;

    if (statePos < this.currentEventIndex) {
      while (this.currentEventIndex !== statePos) {
        this.goToPrevEvent();
      }
    } else if (statePos > this.currentEventIndex) {
      while (this.currentEventIndex !== statePos) {
        this.goToNextEvent();
      }
    }
  }

  goToLastEventState() {
    while (this.currentEventIndex < this.logEntity.eventList.length)
      this.goToNextEvent();
  }

  getMachines() {
    return this.logEntity.machines;
  }

  getGraphHolder() {
    return this.graphHolder;
  }
}

export default GraphManager;

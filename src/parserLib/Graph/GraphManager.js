import GraphHolder from "./GraphHolder";

class GraphManager {
  constructor(logEntity) {
    this.logEntity = logEntity;
    this.currentState = 0;
    this.graphHolder = new GraphHolder(Object.keys(this.logEntity.machines));
  }

  prevState() {
    if (this.currentState === 0) return;
    this.currentState -= 1;
  }

  nextState() {
    const currState = this.logEntity.eventList[this.currentState];
    if (this.currentState >= this.logEntity.eventList.length) return;
    this.currentState += 1;

    const currentMachine = `${currState.machine}:${currState.port}`;

    ["in", "out"].forEach(type => {
      if (currState.added[type].length > 0) {
        currState.added[type].forEach(targetMachine => {
          this.graphHolder.addEdge(currentMachine, targetMachine);
        });
      }
      if (currState.removed[type].length > 0) {
        currState.removed[type].forEach(targetMachine => {
          this.graphHolder.removeEdge(currentMachine, targetMachine);
        });
      }
    });
  }
}

export default GraphManager;

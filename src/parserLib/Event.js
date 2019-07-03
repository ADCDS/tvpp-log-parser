class Event {
  constructor(machine, port, state, added, removed) {
    this.machine = machine;
    this.port = port;
    this.state = state || [];
    this.added = added || [];
    this.removed = removed || [];
  }

  /**
   * Takes an predecessor event and calculates the difference
   * It generates the added and removed fields
   * @param event Event
   */
  compareWithOldEvent(event) {
    // Calculates the intersection between event states
    event.state.forEach(value => {
      if (!this.state.includes(value)) {
        /**
         * If the new states doesn't have an node that was present on the last event,
         * we should add it to the removed array
         */
        this.removed.push(value);
      }
    });

    this.state.forEach(value => {
      if (!event.state.includes(value)) {
        /**
         * If the new states have an node that wasn't present on the last event,
         * we should add it to the added array
         */
        this.added.push(value);
      }
    });
  }
}

export default Event;

class Event {
	constructor(machine, port, state, added, removed) {
		this.machine = machine;
		this.port = port;
		this.state = state || { in: [], out: [] };
		this.added = added || { in: [], out: [] };
		this.removed = removed || { in: [], out: [] };
	}

	/**
	 * Takes an predecessor event and calculates the difference
	 * It generates the added and removed fields
	 * @param event Event
	 */
	compareWithOldEvent(event) {
		// Calculates the intersection between event states

		["in", "out"].forEach(el => {
			event.state[el].forEach(value => {
				if (!this.state[el].includes(value)) {
					/**
					 * If the new states doesn't have an node that was present on the last event,
					 * we should add it to the removed array
					 */
					this.removed[el].push(value);
				}
			});

			this.state[el].forEach(value => {
				if (!event.state[el].includes(value)) {
					/**
					 * If the new states have an node that wasn't present on the last event,
					 * we should add it to the added array
					 */
					this.added[el].push(value);
				}
			});
		});
	}
}

export default Event;

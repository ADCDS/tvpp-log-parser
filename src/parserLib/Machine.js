// @flow
function sortStatuses(by, statuses) {
	return statuses.sort((e1, e2) => {
		return e1[by] - e2[by];
	});
}

/**
 *  A Machine object
 *  It represents a address that appeared on the logs
 *  @param {string}   address
 *  @param {[Event]}    events
 *  @param {array}    statuses
 */
class Machine {
	constructor(address, events, statuses) {
		this.address = address;
		this.events = events || [];
		this.statuses = statuses || [];

		this.bandwidth = null;
		this.bandwidthClassification = null;
	}

	/**
	 * Adds an event to address's event list
	 * @param {Event} event
	 */
	addEvent(event) {
		this.events.push(event);
	}

	addStatus(status) {
		this.statuses.push(status);

		/* Object.keys(this.statusesOrdered).forEach(key => {
			  this.statusesOrdered[key].push(status);
			  this.statusesOrdered[key] = sortStatuses(key, this.statusesOrdered[key]);
			}); */
	}
}

export default Machine;

function sortStatuses(by, statuses) {
  return statuses.sort((e1, e2) => {
    return e1[by] - e2[by];
  });
}

class Machine {
  constructor(address, events, statuses) {
    this.address = address;
    this.events = events || [];
    this.statuses = statuses || [];

    this.bandwidths = {};
    this.lastBandwidth = null;

    // Not used yet
    this.statusesOrdered = {
      mediaTime: sortStatuses("mediaTime", this.statuses),
      msgTime: sortStatuses("msgTime", this.statuses),
      bootTime: sortStatuses("bootTime", this.statuses)
    };
  }

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

  addBandwidth(timestamp, value){
	if(value !== this.lastBandwidth) {
		this.bandwidths[timestamp] = {
			value: value,
			classification: null
		};
		this.lastBandwidth = value;
	}
  }

  getBandwidthClassificationAt(timestamp){
  	const bandwidthsTimestamps = Object.keys(this.bandwidths).map(Number);
  	let ret = this.bandwidths[bandwidthsTimestamps[0]];
  	let iter = 1;
  	while(timestamp <= bandwidthsTimestamps[iter]){
  		timestamp = bandwidthsTimestamps[iter];
  		ret = this.bandwidths[timestamp];
  		iter++;
    }
    return ret;
  }
}

export default Machine;

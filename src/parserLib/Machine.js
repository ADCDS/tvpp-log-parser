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
}

export default Machine;

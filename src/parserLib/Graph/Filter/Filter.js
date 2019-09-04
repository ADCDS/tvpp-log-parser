import GraphHolder from "../GraphHolder";

class Filter {
  constructor(options) {
    this.options = options || {};
  }

  applyFilter(graphHolder) {}

  static getOptions() {}
}

export default Filter;

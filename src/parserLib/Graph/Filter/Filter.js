import GraphHolder from "../GraphHolder";

class Filter {
  constructor(graphHolder, options) {
    this.graphHolder = graphHolder;
    this.options = options || {};
  }

  applyFilter() {
    return this.graphHolder.clone();
  }
}

export default Filter;

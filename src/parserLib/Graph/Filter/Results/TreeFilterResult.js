import FilterResult from "./FilterResult";

class TreeFilterResult extends FilterResult {
  constructor(graphHolder, filterUsed, distancesFromSource, fathers) {
    super(graphHolder, filterUsed);
    this.distancesFromSource = distancesFromSource || {};
    this.fathers = fathers || {};
  }
}

export default TreeFilterResult;

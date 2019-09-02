import Filter from "../Filter";

// Todo: create result filter object
class TreeFilter extends Filter {
  constructor(graphHolder, options) {
    if (!options.hasOwnProperty("source")) {
      throw "Invoked TreeFilter without 'source' option";
    }

    super(graphHolder, options);
    this.distancesFromSource = {};
    this.fathers = {};
  }

  applyFilter() {
    const graphHolder = super.applyFilter();
    graphHolder.isTree = true;
    return graphHolder;
  }
}

export default TreeFilter;

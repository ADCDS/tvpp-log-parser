import Filter from "../Filter";

// Todo: create result filter object
class TreeFilter extends Filter {
  constructor(options) {
    if (!options.hasOwnProperty("source")) {
      throw "Invoked TreeFilter without 'source' option";
    }

    super(options);

  }

  applyFilter(graphHolder) {
  }
}

export default TreeFilter;

import Filter from "./Filter";
import FilterResult from "./Results/FilterResult";

class EmptyFilter extends Filter {
  constructor(options) {
    super(options);
  }

  applyFilter(graphHolder) {
    return new FilterResult(graphHolder, EmptyFilter);
  }
}

export default EmptyFilter;

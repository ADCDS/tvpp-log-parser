// @flow
import Filter from "./Filter";
import FilterResult from "./Results/FilterResult";
import GraphHolder from "../GraphHolder";

class EmptyFilter extends Filter {
	applyFilter(graphHolder: GraphHolder): FilterResult<Filter> {
		return new FilterResult(graphHolder);
	}
}

export default EmptyFilter;

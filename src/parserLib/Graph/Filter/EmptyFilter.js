// @flow
import Filter from "./Filter";
import FilterResult from "./Results/FilterResult";
import GraphHolder from "../GraphHolder";

class EmptyFilter extends Filter {
	async applyFilter(graphHolder: GraphHolder): Promise<FilterResult> {
		return new FilterResult(graphHolder);
	}
}

export default EmptyFilter;

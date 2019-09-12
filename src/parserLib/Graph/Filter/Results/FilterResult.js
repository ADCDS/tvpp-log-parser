// @flow

import GraphHolder from "../../GraphHolder";

class FilterResult<FilterType> {
	graphHolder: GraphHolder;

	constructor(graphHolder: GraphHolder) {
		this.graphHolder = graphHolder;
	}
}

export default FilterResult;

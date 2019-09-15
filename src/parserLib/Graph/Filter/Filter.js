// @flow
import GraphHolder from "../GraphHolder";
import FilterResult from "./Results/FilterResult";

// Avoid dependency cycle
class Option {}

class Filter {
	options: { [string]: any };

	constructor(options: { [string]: any }) {
		this.options = options || {};
	}

	applyFilter(graphHolder: GraphHolder): FilterResult<Filter> {
		return new FilterResult<Filter>(graphHolder);
	}

	static getOptions(): { [string]: Option } {
		return {};
	}
}

export default Filter;

// @flow
import GraphHolder from "../GraphHolder";
import FilterResult from "./Results/FilterResult";

class Filter {
	options: { [string]: any };

	constructor(options: { [string]: any }) {
		this.options = options || {};
	}

	applyFilter(graphHolder: GraphHolder): FilterResult<Filter> {
		return new FilterResult<Filter>(graphHolder);
	}

	static getOptions(): { [string]: any } {
		return {};
	}
}

export default Filter;

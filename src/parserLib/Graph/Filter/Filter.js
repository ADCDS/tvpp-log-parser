// @flow
import GraphHolder from "../GraphHolder";
import FilterResult from "./Results/FilterResult";

class Filter {
	options: { [string]: any };

	constructor(options: { [string]: any }) {
		this.options = options || {};
	}

	static getOptions(): { [string]: any } {
		return {};
	}

	async applyFilter(graphHolder: GraphHolder): Promise<FilterResult> {
		return new FilterResult(graphHolder);
	}
}

export default Filter;

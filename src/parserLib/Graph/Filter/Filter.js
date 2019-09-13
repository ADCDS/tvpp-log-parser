// @flow
import GraphHolder from "../GraphHolder";
import FilterResult from "./Results/FilterResult";
import Option from "../../Option";

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

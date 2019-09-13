// @flow
import Filter from "../Filter";
import GraphHolder from "../../GraphHolder";
import TreeFilterResult from "../Results/TreeFilterResult";
import Option from "../../../Option";

class TreeFilter extends Filter {
	constructor(options: Map<string, string>) {
		if (!options.source) {
			throw new Error("Invoked DijkstraFilter without 'source' option");
		}
		super(options);
	}

	applyFilter(graphHolder: GraphHolder): TreeFilterResult<TreeFilter> {
		return new TreeFilterResult<TreeFilter>(graphHolder);
	}

	static getOptions(): {[string]: Option} {
		return {
			source: new Option("Source", String, "::src")
		};
	}
}

export default TreeFilter;

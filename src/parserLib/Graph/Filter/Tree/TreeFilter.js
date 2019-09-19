// @flow
import Filter from "../Filter";
import GraphHolder from "../../GraphHolder";
import TreeFilterResult from "../Results/TreeFilterResult";
import UserOption from "../../../UserOption";

class TreeFilter extends Filter {
	constructor(options: { [string]: any }) {
		if (!options.source) {
			throw new Error("Invoked DijkstraFilter without 'source' option");
		}
		super(options);
	}

	static getOptions(): { [string]: UserOption<any> } {
		return {
			source: new UserOption<String>("Source", String, "::src")
		};
	}

	applyFilter(graphHolder: GraphHolder): TreeFilterResult {
		return new TreeFilterResult(graphHolder, {}, {});
	}
}

export default TreeFilter;

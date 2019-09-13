// @flow
import Layout from "../Layout";
import TreeFilterResult from "../../../Filter/Results/TreeFilterResult";
import Machine from "../../../../Machine";
import TreeFilter from "../../../Filter/Tree/TreeFilter";

class TreeLayout extends Layout {
	filterResult: TreeFilterResult<TreeFilter>; // Field override doesn't work?

	constructor(filterResult: TreeFilterResult<TreeFilter>, machines: Map<string, Machine>, options: { [p: string]: * }) {
		if (options.source === null) {
			throw new Error("TreeLayout initialized without a source");
		}

		super(filterResult, machines, options);
		this.filterResult = filterResult; // This is necessary, because this.filterResult becomes undefined at this point
	}
}

export default TreeLayout;

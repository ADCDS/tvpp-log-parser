import Layout from "../Layout";
import TreeFilterResult from "../../../Filter/Results/TreeFilterResult";
import Machine from "../../../../Machine";

class TreeLayout extends Layout{
	filterResult: TreeFilterResult;

	constructor(filterResult: TreeFilterResult, machines: Map<string, Machine>, options: { [p: string]: * }) {
		if (options.source === null) {
			throw new Error("TreeLayout initialized without a source");
		}

		super(filterResult, machines, options);
	}
}

export default TreeLayout;
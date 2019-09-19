// @flow
import Layout from "../Layout";
import TreeFilterResult from "../../../Filter/Results/TreeFilterResult";
import Machine from "../../../../Machine";
import TreeFilter from "../../../Filter/Tree/TreeFilter";
import UserOption from "../../../../UserOption";

class TreeLayout extends Layout {
	filterResult: TreeFilterResult; // Field override doesn't work?

	constructor(filterResult: TreeFilterResult, machines: Map<string, Machine>, options: { [p: string]: * }) {
		if (options.source === null) {
			throw new Error("TreeLayout initialized without a source");
		}

		super(filterResult, machines, options);
		this.filterResult = filterResult; // This is necessary, because this.filterResult becomes undefined at this point
	}

	static getOptions(): { [string]: UserOption<any> } {
		const options = super.getOptions();
		Object.assign(options, {
			source: new UserOption<String>("Source", String, "::src"),
			filter: new UserOption<TreeFilter>("Filter", TreeFilter)
		});
		return options;
	}
}

export default TreeLayout;

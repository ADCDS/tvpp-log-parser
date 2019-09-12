// @flow
import FilterResult from "./FilterResult";
import GraphHolder from "../../GraphHolder";

class TreeFilterResult<FilterType> extends FilterResult<FilterType> {
	distancesFromSource: Map<string, number>;
	fathers: Map<string, string>;

	constructor(
		graphHolder: GraphHolder,
		distancesFromSource: Map<string, number>,
		fathers: Map<string, string>
	) {
		super(graphHolder);
		this.distancesFromSource = distancesFromSource || new Map<string, number>();
		this.fathers = fathers || new Map<string, string>();
	}
}

export default TreeFilterResult;

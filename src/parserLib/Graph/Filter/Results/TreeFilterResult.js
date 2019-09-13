// @flow
import FilterResult from "./FilterResult";
import GraphHolder from "../../GraphHolder";

class TreeFilterResult<FilterType> extends FilterResult<FilterType> {
	distancesFromSource: { [string]: number };
	fathers: { [string]: string };

	constructor(graphHolder: GraphHolder, distancesFromSource: { [string]: number }, fathers: { [string]: string }) {
		super(graphHolder);
		this.distancesFromSource = distancesFromSource || {};
		this.fathers = fathers || {};
	}
}

export default TreeFilterResult;

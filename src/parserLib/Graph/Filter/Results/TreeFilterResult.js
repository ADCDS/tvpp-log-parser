// @flow
import FilterResult from "./FilterResult";
import GraphHolder from "../../GraphHolder";

class TreeFilterResult extends FilterResult {
	distancesFromSource: { [string]: number };
	fathers: { [string]: string };
	multiLayerPeers: boolean;

	constructor(graphHolder: GraphHolder, distancesFromSource: { [string]: number }, fathers: { [string]: string }) {
		super(graphHolder);
		this.distancesFromSource = distancesFromSource || {};
		this.fathers = fathers || {};
	}
}

export default TreeFilterResult;

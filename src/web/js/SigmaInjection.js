// @flow

import GraphHolder from "../../parserLib/Graph/GraphHolder";
import Node from "../../parserLib/Graph/Visualizer/Node";
import Edge from "../../parserLib/Graph/Visualizer/Edge";
import FilterResult from "../../parserLib/Graph/Filter/Results/FilterResult";
import Layout from "../../parserLib/Graph/Visualizer/Layout/Layout";

class SigmaInjection {
	graphHolder: { filtered: GraphHolder, original: GraphHolder };
	unfilteredGraphHolder: GraphHolder;
	nodeHolder: Map<string, Node>;
	edgesHolder: Map<string, Map<string, Edge>>;
	byPassInNodes: Array<string>;
	byPassOutNodes: Array<string>;
	managedButtons: Array<HTMLButtonElement>;
	layoutSubFilter: FilterResult;
	usedLayout: Layout;
}

export default SigmaInjection;

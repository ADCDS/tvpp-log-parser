// @flow

import GraphHolder from "../../parserLib/Graph/GraphHolder";
import Node from "../../parserLib/Graph/Visualizer/Node";
import Edge from "../../parserLib/Graph/Visualizer/Edge";

class SigmaInjection {
	graphHolder: { filtered: GraphHolder, original: GraphHolder };
	unfilteredGraphHolder: GraphHolder;
	nodeHolder: Map<string, Node>;
	edgesHolder: Map<string, Map<string, Edge>>;
	byPassInNodes: Array<string>;
	byPassOutNodes: Array<string>;
	managedButtons: Array<HTMLInputElement>;
}

export default SigmaInjection;

// @flow
import type { FilterDefType, LayoutDefType, Sigma } from "../../../types";
import Node from "../../../parserLib/Graph/Visualizer/Node";

class Variables {
	static sourceOptions = {
		filterOptions: [],
		layoutOptions: [],
		subFilterOptions: []
	};

	static selectedFilter: ?FilterDefType;

	static selectedLayout: ?LayoutDefType;

	static selectedLayoutFilter: ?FilterDefType;

	static selectedNode: ?Node;

	static selectedSigma: Sigma;

	static layoutPreservation = false;

	static disableEdges = true;

	static isFirstIteration = true;

	static autoNext = false;

	static saveOutput = false;

	static overlayLogLines: Array<string>;

	static outputGroupChartData: {[number]: Array<{ name: string, [string]: number }>} = {};
}

export default Variables;

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

	// GLChart Variables
	static layersFound: Set<string> = new Set<string>();

	static outputGroupChartData: { [number]: { metatada: { timestamp: number }, layerArray: Array<{ metadata: { name: string }, [string]: number }> } } = {};

	static colorMap: { [number]: string } = {};
}

export default Variables;

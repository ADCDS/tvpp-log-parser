// @flow
import type {FilterDefType, LayoutDefType} from "../../../types";
import SigmaInjection from "../SigmaInjection";

class Variables {
	static sourceOptions = {
		filterOptions: [],
		layoutOptions: [],
		subFilterOptions: []
	};

	static selectedFilter: ?FilterDefType;

	static selectedLayout: ?LayoutDefType;

	static selectedLayoutFilter: ?FilterDefType;

	static selectedNode = null;

	static selectedSigma: { helperHolder: SigmaInjection, [string]: any };

	static layoutPreservation = false;

	static disableEdges = true;

	static isFirstIteration = true;
}

export default Variables;

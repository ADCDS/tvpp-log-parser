import DijkstraFilter from "./DijkstraFilter";
import GraphHolder from "../../../GraphHolder";
import TreeFilterResult from "../../Results/TreeFilterResult";
import Option from "../../../../Option";

class DijkstraMedianFilter extends DijkstraFilter {
	constructor(options: Map<string, string>) {
		const defaultOptions = {
			discretize: false
		};

		options = Object.assign(defaultOptions, options);
		super(options);
	}

	applyFilter(graphHolder: GraphHolder): TreeFilterResult<DijkstraFilter> {
		const filterRes = super.applyFilter(graphHolder);

		/**
		 * For each node, lets see who points to it and get the median value of de min distances
		 */
		const nodes = Object.keys(graphHolder.graph);
		const medians = {};
		for (const node of nodes) {
			const edgesToNode = graphHolder.getNodesThatPointTo(node).map(value => filterRes.distancesFromSource[value]).filter(value => value !== Infinity).sort();
			if (edgesToNode.length === 0) {
				medians[node] = Infinity;
				continue;
			}

			// Get the median of the minimum distance to source of these adjacent nodes
			if (edgesToNode.length % 2 === 0) {
				// Even
				const n = (edgesToNode.length + 1) / 2;
				const pos1 = Math.floor(n) - 1;
				const pos2 = pos1 + 1;
				medians[node] = ((edgesToNode[pos1] + edgesToNode[pos2]) / 2) + 1;
				if(this.options.discretize){
					medians[node] = Math.round(medians[node]);
				}
			} else {
				//Odd
				const pos = (edgesToNode.length + 1) / 2;
				medians[node] = edgesToNode[pos - 1] + 1;
			}

			console.log("Node: " + node + ", adjacent values " + edgesToNode + ", median " + medians[node]);
		}

		medians[this.options.source] = 0;
		filterRes.distancesFromSource = medians;

		return filterRes;
	}

	static getOptions(): { [string]: Option } {
		let options = super.getOptions();
		options = Object.assign(options, {
			discretize: new Option("Discretize medians (round)", Boolean, false)
		});
		return options;
	}
}

export default DijkstraMedianFilter;

import DijkstraFilter from "./DijkstraFilter";
import GraphHolder from "../../../GraphHolder";
import TreeFilterResult from "../../Results/TreeFilterResult";
import Option from "../../../../Option";

class DijkstraMeanFilter extends DijkstraFilter {
	constructor(options: Map<string, string>) {
		const defaultOptions = {
			discretize: false,
		};

		options = Object.assign(defaultOptions, options);
		super(options);
	}

	applyFilter(graphHolder: GraphHolder): TreeFilterResult<DijkstraFilter> {
		const filterRes = super.applyFilter(graphHolder);

		/**
		 * For each node, lets see who points to it and calculate the mean of de min distances
		 */
		const nodes = Object.keys(graphHolder.graph);
		const means = {};
		for (const node of nodes) {
			const edgesToNode = graphHolder.getNodesThatPointTo(node).map(value => filterRes.distancesFromSource[value]).filter(value => value !== Infinity);

			if (edgesToNode.length === 0){
				means[node] = Infinity;
				continue;
			}

			// Calculate the mean of the minimum distance to source of these adjacent nodes
			let sum = 0;
			for (const adjacentNodeDistance of edgesToNode) {
				sum += adjacentNodeDistance;
			}
			means[node] = (sum / edgesToNode.length) + 1;
			console.log("Node: " + node + ", adjacent values " + edgesToNode + ", mean " + ((sum / edgesToNode.length) + 1));
		}

		if(this.options.discretize){
			Object.keys(means).forEach(index => {
			    means[index] = Math.round(means[index]);
			});

		}

		means[this.options.source] = 0;
		filterRes.distancesFromSource = means;

		return filterRes;
	}

	static getOptions(): {[string]: Option} {
		let options = super.getOptions();
		options = Object.assign(options, {
			discretize: new Option("Discretize means (round)", Boolean, false)
		});
		return options;
	}

}

export default DijkstraMeanFilter;

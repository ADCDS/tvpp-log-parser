import DijkstraFilter from "./DijkstraFilter";
import GraphHolder from "../../../GraphHolder";
import TreeFilterResult from "../../Results/TreeFilterResult";
import Option from "../../../../Option";

class DijkstraMaxFilter extends DijkstraFilter {

	applyFilter(graphHolder: GraphHolder): TreeFilterResult<DijkstraFilter> {
		const filterRes = super.applyFilter(graphHolder);

		/**
		 * For each node, lets see who points to it and get the max value of de min distances
		 */
		const nodes = Object.keys(graphHolder.graph);
		const maxes = {};
		for (const node of nodes) {
			const edgesToNode = graphHolder.getNodesThatPointTo(node).map(value => filterRes.distancesFromSource[value]).filter(value => value !== Infinity);
			if (edgesToNode.length === 0){
				maxes[node] = Infinity;
				continue;
			}

			// Get the max of the minimum distance to source of these adjacent nodes
			let max = 0;
			for (const adjacentDistance of edgesToNode) {
				if(adjacentDistance > max)
					max = adjacentDistance;
			}
			maxes[node] = max + 1;
			console.log("Node: " + node + ", adjacent values " + edgesToNode + ", max " + (max + 1));
		}

		maxes[this.options.source] = 0;
		filterRes.distancesFromSource = maxes;

		return filterRes;
	}

}

export default DijkstraMaxFilter;

// @flow
import TreeFilter from "../TreeFilter";
import GraphHolder from "../../../GraphHolder";
import TreeFilterResult from "../../Results/TreeFilterResult";
import DijkstraFilter from "../Dijkstra/DijkstraFilter";

class YenKSP extends TreeFilter {
	static yenKShortestPath(graph: GraphHolder, source: string, sink: string, K: number, vertices: Array<string>): Array<Array<string>> {
		// Determine the shortest path from the source to the sink.
		const A = [DijkstraFilter.singleDijkstraShortestPath(graph.graph, source, sink, vertices)];
		// Initialize the set to store the potential kth shortest path.
		let B = [];

		for (let k = 1; k < K; k++) {
			// The spur node ranges from the first node to the next to last node in the previous k-shortest path.
			for (let i = 0; i < A[k - 1].length; i++) {
				let recoverStructure: { [string]: { incoming: Array<string>, outgoing: Array<string> } };
				// Spur node is retrieved from the previous k-shortest path, k − 1.
				const spurNode = A[k - 1][i];

				// The sequence of nodes from the source to the spur node of the previous k-shortest path.
				const rootPath = A[k - 1].slice(0, i);

				A.forEach(path => {
					if (rootPath === path.slice(0, i)) {
						// Remove the links that are part of the previous shortest paths which share the same root path.
						graph.removeEdge(path[i], path[i + 1]);
					}
				});

				rootPath.forEach(node => {
					recoverStructure[node] = {incoming: graph.getIncomingEdgesOn(node), outgoing: graph.getOutgoingEdges(node)};
					graph.removeNode(node);
				});

				// Calculate the spur path from the spur node to the sink.
				const spurPath = DijkstraFilter.singleDijkstraShortestPath(graph.graph, spurNode, sink, vertices);

				// Entire path is made up of the root path and spur path.
				const totalPath = rootPath.concat(spurPath);
				B.push(totalPath);

				// Add back the edges and nodes that were removed from the graph.
				Object.keys(recoverStructure).forEach(recoverNodeKey => {
					graph.addNode(recoverNodeKey, recoverStructure[recoverNodeKey].incoming, recoverStructure[recoverNodeKey].outgoing);
				});
			}

			if (B.length === 0) {
				// This handles the case of there being no spur paths, or no spur paths left.
				// This could happen if the spur paths have already been exhausted (added to A),
				// or there are no spur paths at all - such as when both the source and sink vertices
				// lie along a "dead end".
				break;
			}

			// Sort the potential k-shortest paths by cost.
			B = B.sort();
			A[k] = B[0];
			B.pop();
		}

		return A;
	}

	applyFilter(graphHolder: GraphHolder): TreeFilterResult {
		throw new Error("Not implemented yet");
	}
}

export default YenKSP;

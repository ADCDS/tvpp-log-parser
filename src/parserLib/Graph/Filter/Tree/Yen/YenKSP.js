// @flow
import FastPriorityQueue from "fastpriorityqueue";
import TreeFilter from "../TreeFilter";
import GraphHolder from "../../../GraphHolder";
import TreeFilterResult from "../../Results/TreeFilterResult";
import DijkstraFilter from "../Dijkstra/DijkstraFilter";
import UserOption from "../../../../UserOption";


function arraysEqual(arr1, arr2) {
	if (arr1.length !== arr2.length)
		return false;
	for (var i = arr1.length; i--;) {
		if (arr1[i] !== arr2[i])
			return false;
	}

	return true;
}

function containsPath(A: Array<Array<string>>, arr2: Array<string>) {
	for (let arr1 of A) {
		if (arraysEqual(arr1, arr2)) {
			return true;
		}
	}
	return false;
}

class YenKSP extends TreeFilter {
	static yenKShortestPath(graph: GraphHolder, source: string, sink: string, K: number, vertices: Array<string>): Array<Array<string>> {
		// Determine the shortest path from the source to the sink.
		const A = [DijkstraFilter.singleDijkstraShortestPath(graph.graph, source, sink, vertices)];
		// Initialize the set to store the potential kth shortest path.
		const B = new FastPriorityQueue(function (a, b) {
			return b.length > a.length;
		});

		for (let k = 1; k < K; k++) {
			// The spur node ranges from the first node to the next to last node in the previous k-shortest path.
			for (let i = 0; i < A[k - 1].length - 1; i++) {
				const recoverStructure: { [string]: { incoming: Array<string>, outgoing: Array<string> } } = {};
				const recoverEdges: Array<[string, string]> = [];
				// Spur node is retrieved from the previous k-shortest path, k − 1.
				const spurNode = A[k - 1][i];

				// The sequence of nodes from the source to the spur node of the previous k-shortest path.
				const rootPath = A[k - 1].slice(0, i);
				for (const path of A) {
					if (rootPath.every(value => path.slice(0, i).includes(value))) {
						// Remove the links that are part of the previous shortest paths which share the same root path.
						graph.removeEdge(path[i], path[i + 1]);

						recoverEdges.push([path[i], path[i + 1]]);
					}
				}

				for (const node of rootPath) {
					recoverStructure[node] = {
						incoming: graph.getIncomingEdgesOn(node),
						outgoing: graph.getOutgoingEdges(node)
					};
					graph.removeNode(node);
				}

				// Calculate the spur path from the spur node to the sink.
				try {
					const spurPath = DijkstraFilter.singleDijkstraShortestPath(graph.graph, spurNode, sink, vertices);

					// Entire path is made up of the root path and spur path.
					const totalPath = rootPath.concat(spurPath);

					B.add(totalPath);

				} catch (e) {
					// Silence is gold
				}

				// Add back the edges and nodes that were removed from the graph.
				Object.keys(recoverStructure).forEach(recoverNodeKey => {
					graph.addNode(recoverNodeKey, recoverStructure[recoverNodeKey].incoming, recoverStructure[recoverNodeKey].outgoing);
				});

				for (const value of recoverEdges) {
					graph.addEdge(value[0], value[1]);
				}
			}

			if (B.isEmpty()) {
				// This handles the case of there being no spur paths, or no spur paths left.
				// This could happen if the spur paths have already been exhausted (added to A),
				// or there are no spur paths at all - such as when both the source and sink vertices
				// lie along a "dead end".
				break;
			}

			let poll = B.poll();
			while (containsPath(A, poll)) {
				poll = B.poll();
			}
			A[k] = poll;
		}

		return A;
	}

	static getOptions(): { [string]: UserOption<any> } {
		return super.getOptions();
	}

	applyFilter(graphHolder: GraphHolder): TreeFilterResult {
		const newGraphHolder = graphHolder.clone();
		const vertices = Object.keys(newGraphHolder.graph);
		const {graph} = newGraphHolder;

		vertices.forEach(node => {
			const paths = YenKSP.yenKShortestPath(newGraphHolder, this.options.source, node, 20, vertices).map(value => value.length);
			console.log(node, paths);
		});

		return new TreeFilterResult(newGraphHolder, null, null);
	}
}

export default YenKSP;

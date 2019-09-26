// @flow
import FastPriorityQueue from "fastpriorityqueue";
import TreeFilter from "../TreeFilter";
import GraphHolder from "../../../GraphHolder";
import TreeFilterResult from "../../Results/TreeFilterResult";
import DijkstraFilter from "../Dijkstra/DijkstraFilter";
import UserOption from "../../../../UserOption";
import type {YensKSPTask, YensKSPWorkerResult} from "../../../../../types";

function arraysEqual<T>(arr1: Array<T>, arr2: Array<T>): boolean {
	if (arr1.length !== arr2.length) return false;
	for (let i = arr1.length; i--; ) {
		if (arr1[i] !== arr2[i]) return false;
	}
	return true;
}

function findDuplicates(paths: Array<Array<string>>) {
	const duplicates = [];
	for (let i = 0; i < paths.length; i++) {
		for (let j = 0; j < paths.length; j++) {
			if (i !== j) {
				if (arraysEqual(paths[i], paths[j])) {
					duplicates.push(paths[i]);
				}
			}
		}
	}

	return duplicates;
}

function chunkify<T>(a: Array<T>, n: number, balanced: boolean): Array<Array<T>> {
	if (n < 2) return [a];

	const len = a.length;
	const out = [];
	let i = 0;
	let size;

	if (len % n === 0) {
		size = Math.floor(len / n);
		while (i < len) {
			out.push(a.slice(i, (i += size)));
		}
	} else if (balanced) {
		while (i < len) {
			size = Math.ceil((len - i) / n--);
			out.push(a.slice(i, (i += size)));
		}
	} else {
		n--;
		size = Math.floor(len / n);
		if (len % size === 0) size--;
		while (i < size * n) {
			out.push(a.slice(i, (i += size)));
		}
		out.push(a.slice(size * n));
	}

	return out;
}

class YenKSP extends TreeFilter {
	static yenKShortestPath(graph: GraphHolder, source: string, sink: string, K: number, vertices: Array<string>): Array<Array<string>> {
		// Determine the shortest path from the source to the sink.
		const A = [];
		try {
			A[0] = DijkstraFilter.singleDijkstraShortestPath(graph.graph, source, sink, vertices);
		} catch (e) {
			return [];
		}
		// Initialize the set to store the potential kth shortest path.
		const B = new FastPriorityQueue((a, b) => {
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

					let alreadyHas = false;
					B.array.forEach(value => {
						if (arraysEqual(value, totalPath)) {
							alreadyHas = true;
						}
					});
					if (!alreadyHas) {
						B.add(totalPath);
					}
				} catch (e) {
					// Silence is gold
				}

				// Add back the edges and nodes that were removed from the graph.
				Object.keys(recoverStructure).forEach(recoverNodeKey => {
					graph.addNode(recoverNodeKey, recoverStructure[recoverNodeKey].incoming, recoverStructure[recoverNodeKey].outgoing, Object.keys(recoverStructure));
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

			A[k] = B.poll();
		}

		return A;
	}

	static getOptions(): { [string]: UserOption<any> } {
		let options = super.getOptions();
		options = Object.assign(options, {
			threadNum: new UserOption<Number>("Thread Num", Number, 1),
			numberOfPaths: new UserOption<Number>("Number of paths", Number, 20)
		});
		return options;
	}

	static calculateValue(newGraphHolder: GraphHolder, source: string, node: string, K: number, vertices: Array<string>) {
		const paths = YenKSP.yenKShortestPath(newGraphHolder, source, node, K, vertices);
		// console.log("Duplicates: ", findDuplicates(paths));

		let medianIndex = -1;
		if (paths.length === 0) {
			console.log("No route from ", source, " to ", node);
			return Infinity;
		}

		if (paths.length % 2 === 0) {
			// Even
			medianIndex += Math.round(paths.length / 2);
		} else {
			medianIndex += (paths.length + 1) / 2;
		}
		// const medianPath = paths[medianIndex];
		console.log(`${K} shortests paths, ${source} -> ${node}`);
		paths.forEach(value => {
			console.log(value);
		});

		return paths[medianIndex].length;
	}

	async applyFilter(graphHolder: GraphHolder): Promise<TreeFilterResult> {
		const newGraphHolder = graphHolder.clone();
		const vertices = Object.keys(newGraphHolder.graph);
		const distancesFromSource: { [string]: number } = {};
		distancesFromSource[this.options.source] = 0;

		let i = 1;
		if (this.options.threadNum === 1) {
			vertices.forEach(node => {
				console.log(`${i++}/${vertices.length}`);
				distancesFromSource[node] = YenKSP.calculateValue(newGraphHolder, this.options.source, node, this.options.numberOfPaths, vertices);
			});
		} else {
			const chunks = chunkify<string>(vertices, this.options.threadNum, true);
			await Promise.all(
				chunks.map(chunk => {
					return new Promise(resolve => {
						const ykspTask: YensKSPTask = {
							newGraphHolder,
							source: this.options.source,
							sinks: chunk,
							k: this.options.numberOfPaths,
							vertices
						};
						const myWorker = new Worker("js/yenskst_worker.dist.js");
						myWorker.onmessage = e => {
							const result = ((e.data: any): YensKSPWorkerResult);
							myWorker.terminate();
							result.forEach(value => {
								console.log(`${i++}/${vertices.length}`);
								distancesFromSource[value[0]] = value[1];
							});
							resolve(distancesFromSource);
						};
						myWorker.postMessage(ykspTask);
						console.log("Message posted to worker");
					});
				})
			);
			console.log("Done map");
		}

		console.log(distancesFromSource);

		return new TreeFilterResult(newGraphHolder, distancesFromSource, {});
	}
}

export default YenKSP;

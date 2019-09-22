// @flow
import type {Graph} from "../../types";

class GraphHolder {
	graph: Graph;

	constructor(nodes: Array<string>) {
		// Preallocate graph
		const graph = {};
		const nodesObj = {};
		nodes.forEach(el => {
			nodesObj[el] = null;
		});
		nodes.forEach(el => {
			graph[el] = { ...nodesObj };
		});

		this.graph = graph;
	}

	hasNode(node: string): boolean {
		return Object.prototype.hasOwnProperty.call(this.graph, node);
	}

	insertNode(node: string): void {
		if (this.hasNode(node)) {
			throw new Error(`Graph already has node ${node}`);
		}

		this.graph[node] = {};
		Object.keys(this.graph).forEach(nodeKey => {
			this.graph[node][nodeKey] = null;
		});
	}

	addEdge(from: string, to: string): void {
		this.graph[from][to] = true;
	}

	getEdge(from: string, to: string): void {
		return !!this.graph[from][to];
	}

	forceAddEdge(from: string, to: string): void {
		this.insertNode(from);
		this.graph[from][to] = true;
	}

	forceRemoveEdge(from: string, to: string): void {
		this.insertNode(from);
		this.graph[from][to] = false;
	}

	removeEdge(from: string, to: string): void {
		this.graph[from][to] = null;
	}

	addNode(node: string, incomingEdges: Array<string>, outgoingEdges: Array<string>): void {
		this.graph[node] = {};
		Object.keys(this.graph).forEach(value => {
			this.graph[node][value] = false;
		});
		incomingEdges.forEach(value => {
			this.graph[value][node] = true;
		});
		outgoingEdges.forEach(value => {
			this.graph[node][value] = true;
		});
	}

	removeNode(node: string): void {
		delete this.graph[node];
		Object.keys(this.graph).forEach(value => {
			this.graph[value][node] = false;
		});
	}

	getIncomingEdgesOn(node: string): Array<string> {
		const ret = [];
		Object.keys(this.graph).forEach(neighboor => {
			if (this.graph[neighboor][node]) {
				ret.push(neighboor);
			}
		});
		return ret;
	}

	getOutgoingEdges(node: string): Array<string> {
		const ret = [];
		Object.keys(this.graph[node]).forEach(nodeDest => {
			if (this.graph[node][nodeDest]) {
				ret.push(nodeDest);
			}
		});

		return ret;
	}

	getNodesThatPointTo(node: string): Array<string> {
		const ret = [];
		Object.keys(this.graph).forEach(index => {
			if (this.graph[index][node]) ret.push(index);
		});
		return ret;
	}

	getEdges(node: string): { [string]: boolean } {
		return this.graph[node];
	}

	isConnected(node: string): boolean {
		const edgesTo = this.getEdges(node);
		for (const index of Object.keys(edgesTo)) {
			if (edgesTo[index]) {
				return true;
			}
		}
		for (const index of Object.keys(this.graph)) {
			const value = this.graph[index];
			if (Object.prototype.hasOwnProperty.call(value, node) && value[node]) {
				return true;
			}
		}
		return false;
	}

	clone(): GraphHolder {
		const newObj = Object.assign((Object.create(this): any), this);
		newObj.graph = JSON.parse(JSON.stringify(this.graph));
		return newObj;
	}

	compareWith(anotherGraph: GraphHolder): GraphHolder {
		const newGraph = new GraphHolder(Object.keys(this.graph));
		Object.keys(this.graph).forEach(from => {
			const fromRes = this.graph[from];
			Object.keys(fromRes).forEach(to => {
				const value = fromRes[to]; // Boolean
				newGraph.graph[from][to] = value && value !== anotherGraph.graph[from][to];
			});
		});

		return newGraph;
	}
}

export default GraphHolder;

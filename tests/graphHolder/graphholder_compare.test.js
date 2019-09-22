// @flow
import GraphHolder from "../../src/parserLib/Graph/GraphHolder";

test("graphHolderTest", async () => {
	const testMachines = ["127.0.0.1:4950", "127.0.0.2:4950", "127.0.0.3:4950"];
	const graphHolder1 = new GraphHolder(testMachines);
	const graphHolder2 = new GraphHolder(testMachines);
	graphHolder1.addEdge(testMachines[0], testMachines[2]);

	const graphDifference = graphHolder1.compareWith(graphHolder2);

	const edges = graphDifference.getEdges(testMachines[0]);
	expect(Object.prototype.hasOwnProperty.call(edges, testMachines[2]) && edges[testMachines[2]]).toBe(true);
});

test("incomingOutgoingEdges", () => {
	const nodes = ["C", "D", "F", "E", "G", "H"];
	const graphHolder = new GraphHolder(nodes);
	graphHolder.addEdge("C", "D");
	graphHolder.addEdge("C", "E");
	graphHolder.addEdge("D", "F");
	graphHolder.addEdge("E", "F");
	graphHolder.addEdge("E", "G");
	graphHolder.addEdge("E", "D");
	graphHolder.addEdge("F", "H");
	graphHolder.addEdge("F", "G");
	graphHolder.addEdge("G", "H");

	const incomingEdges = graphHolder.getIncomingEdgesOn("E");
	const outgoingEdges = graphHolder.getOutgoingEdges("E");

	expect(incomingEdges).toEqual(["C"]);
	expect(outgoingEdges).toEqual(["D", "F", "G"]);
});

test("removeNode", () => {
	const nodes = ["C", "D", "F", "E", "G", "H"];
	const graphHolder = new GraphHolder(nodes);
	graphHolder.addEdge("C", "D");
	graphHolder.addEdge("C", "E");
	graphHolder.addEdge("D", "F");
	graphHolder.addEdge("E", "F");
	graphHolder.addEdge("E", "G");
	graphHolder.addEdge("E", "D");
	graphHolder.addEdge("F", "H");
	graphHolder.addEdge("F", "G");
	graphHolder.addEdge("G", "H");

	graphHolder.removeNode("G");
	expect(graphHolder.graph.F.G).toBe(false);
	expect(graphHolder.graph.E.G).toBe(false);
});

test("addNode", () => {
	const nodes = ["C", "D", "F", "E", "G", "H"];
	const graphHolder = new GraphHolder(nodes);
	graphHolder.addEdge("C", "D");
	graphHolder.addEdge("C", "E");
	graphHolder.addEdge("D", "F");
	graphHolder.addEdge("E", "F");
	graphHolder.addEdge("E", "G");
	graphHolder.addEdge("E", "D");
	graphHolder.addEdge("F", "H");
	graphHolder.addEdge("F", "G");
	graphHolder.addEdge("G", "H");
	const originalGraphHolder = graphHolder.clone();

	const incomingEdges = graphHolder.getIncomingEdgesOn("G");
	const outgoingEdges = graphHolder.getOutgoingEdges("G");
	graphHolder.removeNode("G");
	graphHolder.addNode("G", incomingEdges, outgoingEdges);

	nodes.forEach(n1 => {
		nodes.forEach(n2 => {
			expect(graphHolder.getEdge(n1, n2)).toBe(originalGraphHolder.getEdge(n1, n2));
		});
	});
});

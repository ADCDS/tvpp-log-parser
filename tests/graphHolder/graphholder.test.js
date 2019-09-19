// @flow
import GraphHolder from "../../src/parserLib/Graph/GraphHolder";

test("graphHolderTest", async () => {
	const testMachines = ["127.0.0.1:4950", "127.0.0.2:4950", "127.0.0.3:4950"];
	const graphHolder = new GraphHolder(testMachines);

	graphHolder.addEdge(testMachines[0], testMachines[2]);

	const edges = graphHolder.getEdges(testMachines[0]);
	expect(Object.prototype.hasOwnProperty.call(edges, testMachines[2]) && edges[testMachines[2]]).toBe(true);

	expect(graphHolder.isConnected(testMachines[2])).toBe(true);

	const unconnectedNode = "8.8.8.8:7171";
	graphHolder.insertNode(unconnectedNode);
	expect(graphHolder.isConnected(unconnectedNode)).toBe(false);
});

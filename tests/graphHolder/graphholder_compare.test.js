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

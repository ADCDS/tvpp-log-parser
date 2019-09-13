import GraphHolder from "../../src/parserLib/Graph/GraphHolder";

test("graphHolderTest", async () => {
  const testMachines = ["127.0.0.1:4950", "127.0.0.2:4950", "127.0.0.3:4950"];
  const graphHolder = new GraphHolder(testMachines);

  graphHolder.addEdge(testMachines[0], testMachines[2]);

  let edges = graphHolder.getEdges(testMachines[0]);
  expect(edges.hasOwnProperty(testMachines[2]) && edges[testMachines[2]]).toBe(true);
});

// @flow
import GraphHolder from "../../src/parserLib/Graph/GraphHolder";
import YenKSP from "../../src/parserLib/Graph/Filter/Tree/Yen/YenKSP";

test("singleKSP", () => {
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

	const singleDijkstra = YenKSP.yenKShortestPath(graphHolder, "C", "H", 3, nodes);
	expect(singleDijkstra).toEqual(["C", "D", "F", "H"]);
});

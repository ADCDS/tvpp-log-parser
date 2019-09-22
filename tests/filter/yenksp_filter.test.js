// @flow
import GraphHolder from "../../src/parserLib/Graph/GraphHolder";
import YenKSP from "../../src/parserLib/Graph/Filter/Tree/Yen/YenKSP";

/**
 * C ---> D ---> F---------------> H
 * |      ^      ^      |          ^
 * |      |      |      |          |
 * v      |      |      v          |
 * E------------------->G----------|
 */
describe("graph1", () => {
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

	test("singleKSP1", () => {
		const yenKShortestPath1 = YenKSP.yenKShortestPath(graphHolder, "C", "H", 3, nodes);
		expect(yenKShortestPath1).toEqual(expect.arrayContaining([["C", "D", "F", "H"], ["C", "E", "G", "H"], ["C", "E", "F", "H"]]));
	});
	test("singleKSP2", () => {
		const yenKShortestPath2 = YenKSP.yenKShortestPath(graphHolder, "C", "G", 3, nodes);
		expect(yenKShortestPath2).toEqual(expect.arrayContaining([["C", "E", "G"], ["C", "E", "F", "G"], ["C", "D", "F", "G"]]));
	});
	test("singleKSP3", () => {
		const yenKShortestPath2 = YenKSP.yenKShortestPath(graphHolder, "C", "G", 4, nodes);
		expect(yenKShortestPath2).toEqual(expect.arrayContaining([["C", "E", "G"], ["C", "E", "F", "G"], ["C", "D", "F", "G"]]));
	});
	test("singleKSP4", () => {
		const yenKShortestPath2 = YenKSP.yenKShortestPath(graphHolder, "C", "D", 1, nodes); // D OMEGALUL C
		expect(yenKShortestPath2).toEqual(expect.arrayContaining([["C", "D"]]));
	});
	test("singleKSP5", () => {
		const yenKShortestPath2 = YenKSP.yenKShortestPath(graphHolder, "C", "D", 5, nodes);
		expect(yenKShortestPath2).toEqual(expect.arrayContaining([["C", "D"], ["C", "E", "D"]]));
	});
	test("singleKSP6", () => {
		const yenKShortestPath2 = YenKSP.yenKShortestPath(graphHolder, "E", "H", 5, nodes);
		expect(yenKShortestPath2).toEqual(expect.arrayContaining([["E", "F", "H"], ["E", "G", "H"], ["E", "F", "G", "H"], ["E", "D", "F", "H"], ["E", "D", "F", "G", "H"]]));
	});
});

/**
 * A <---> B ---> C
 * |       ^
 * |       |
 * |-----> D
 */

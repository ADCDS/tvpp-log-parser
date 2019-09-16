// @flow
import LogParserOverlay from "../../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../../src/parserLib/TVPPLog";
import GraphManager from "../../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../../src/parserLib/Log/Performance/LogParserPerformance";
import AlgorithmR1 from "../../src/parserLib/Graph/Visualizer/Layout/Tree/AlgorithmR1";
import DijkstraFilter from "../../src/parserLib/Graph/Filter/Tree/Dijkstra/DijkstraFilter";
import Utils from "../../src/utils";

test("algorithmR1LayoutTest", async () => {
	const logOverlay = await Utils.readLog("./logs/test1_overlay.txt");
	const logPerformance = await Utils.readLog("./logs/test1_perf.txt");
	const overlayEntryArray = await LogParserOverlay.parse(logOverlay);

	console.log(`Parsed ${overlayEntryArray.length} overlay lines`);
	const performanceEntryArray = await LogParserPerformance.parse(logPerformance);
	console.log(`Parsed ${performanceEntryArray.length} performance lines`);
	const logEntity = new TVPPLog({
		discriminateByPort: true
	});

	logEntity.addOverlayEntries(overlayEntryArray);
	logEntity.addPerformanceEntries(performanceEntryArray);

	const sourceMachineName = logEntity.overlayEntryList[0].machineId;

	const graphManager = new GraphManager(logEntity);
	graphManager.goToAbsoluteEventState(100);

	const dijkstraFilter = new DijkstraFilter({
		source: sourceMachineName
	});
	const filterResult = dijkstraFilter.applyFilter(graphManager.getGraphHolder());

	const algorithmR1 = new AlgorithmR1(filterResult, graphManager.getMachines(), {
		source: sourceMachineName,
		gamma: 30
	});
	algorithmR1.updatePositions();

	expect(true).toBe(true);
});

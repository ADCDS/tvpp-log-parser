// @flow
import LogParserOverlay from "../../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../../src/parserLib/TVPPLog";
import GraphManager from "../../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../../src/parserLib/Log/Performance/LogParserPerformance";
import DijkstraFilter from "../../src/parserLib/Graph/Filter/Tree/Dijkstra/DijkstraFilter";
import Utils from "../../src/utils";

test("dijkstraFilterTest", async () => {
	const dataOverlay = await Utils.readLog("./logs/test1_overlay.txt");
	const dataPerformance = await Utils.readLog("./logs/test1_perf.txt");
	const overlayEntryArray = await LogParserOverlay.parse(dataOverlay);
	const performanceEntryArray = await LogParserPerformance.parse(dataPerformance);

	const logEntity = new TVPPLog();
	logEntity.addOverlayEntries(overlayEntryArray);
	logEntity.addPerformanceEntries(performanceEntryArray);
	const graphManager = new GraphManager(logEntity);
	// graphManager.goToLastEventState();
	graphManager.goToAbsoluteEventState(100);
	const dijkstraFilter = new DijkstraFilter({
		source: "150.164.3.36:4951"
	});
	dijkstraFilter.applyFilter(graphManager.getGraphHolder());

	expect(true).toBe(true);
});

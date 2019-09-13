// @flow
import LogParserOverlay from "../../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../../src/parserLib/TVPPLog";
import GraphManager from "../../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../../src/parserLib/Log/Performance/LogParserPerformance";
import RingLayout from "../../src/parserLib/Graph/Visualizer/Layout/RingLayout";
import RingLayeredLayout from "../../src/parserLib/Graph/Visualizer/Layout/Tree/RingLayeredLayout";
import DijkstraFilter from "../../src/parserLib/Graph/Filter/Tree/DijkstraFilter";
import Utils from "../../src/utils";

test("ringLayeredLayoutTest", async () => {
	const dataOverlay = await Utils.readLog("./logs/test1_overlay.txt");
	const dataPerformance = await Utils.readLog("./logs/test1_perf.txt");
	const overlayEntryArray = await LogParserOverlay.parse(dataOverlay);
	const performanceEntryArray = await LogParserPerformance.parse(dataPerformance);
	console.log(`Parsed ${performanceEntryArray.length} performance lines`);
	const logEntity = new TVPPLog({
		discriminateByPort: true
	});
	logEntity.addOverlayEntries(overlayEntryArray);
	logEntity.addPerformanceEntries(performanceEntryArray);
	const graphManager = new GraphManager(logEntity);
	graphManager.goToAbsoluteEventState(100);

	const sourceMachineName = logEntity.overlayEntryList[0].machineId;

	const dijkstraFilter = new DijkstraFilter({
		source: sourceMachineName
	});
	const filterResult = dijkstraFilter.applyFilter(graphManager.getGraphHolder());

	const ringLayeredLayout = new RingLayeredLayout(filterResult, graphManager.getMachines(), {
		source: logEntity.overlayEntryList[0].machineId,
		radius: 30
	});
	ringLayeredLayout.updatePositions();

	expect(true).toBe(true);
});

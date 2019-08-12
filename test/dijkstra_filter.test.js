import LogParserOverlay from "../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../src/parserLib/TVPPLog";
import GraphManager from "../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../src/parserLib/Log/Performance/LogParserPerformance";
import RingTopology from "../src/parserLib/Graph/Visualizer/Topology/RingTopology";
import DijkstraFilter from "../src/parserLib/Graph/Filter/DijkstraFilter";

test("dijkstraFilterTest", () => {
	const logOverlay = LogParserOverlay.readLog(
		"./logs/test1_overlay.txt"
	);
	const logPerformance = LogParserPerformance.readLog("./logs/test1_perf.txt");
	logOverlay.then(
		dataOverlay => {
			LogParserOverlay.parse(dataOverlay).then(overlayEntryArray => {
				console.log(`Parsed ${overlayEntryArray.length} overlay lines`);
				logPerformance.then(dataPerformance => {
					LogParserPerformance.parse(dataPerformance).then(
						performanceEntryArray => {
							console.log(
								`Parsed ${performanceEntryArray.length} performance lines`
							);
							const logEntity = new TVPPLog();
							logEntity.addOverlayEntries(overlayEntryArray);
							logEntity.addPerfomanceEntries(performanceEntryArray);
							const graphHolder = new GraphManager(logEntity);
							// graphHolder.goToLastState();
							graphHolder.goToAbsoluteState(100);
							const dijkstraFilter = new DijkstraFilter(
								graphHolder.getGraphHolder(),
								{
									source: "150.164.3.36"
								}
							);
							dijkstraFilter.applyFilter();
							console.log("Done");
						}
					);
				});
			});
		},
		reason => {
			console.log(reason);
		}
	);
});

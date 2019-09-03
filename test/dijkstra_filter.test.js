import LogParserOverlay from "../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../src/parserLib/TVPPLog";
import GraphManager from "../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../src/parserLib/Log/Performance/LogParserPerformance";
import RingLayout from "../src/parserLib/Graph/Visualizer/Layout/RingLayout";
import DijkstraFilter from "../src/parserLib/Graph/Filter/Tree/DijkstraFilter";

test("dijkstraFilterTest", async () => {
  const dataOverlay = await LogParserOverlay.readLog(
    "./logs/test1_overlay.txt"
  );
  const dataPerformance = await LogParserPerformance.readLog(
    "./logs/test1_perf.txt"
  );
  const overlayEntryArray = await LogParserOverlay.parse(dataOverlay);
  const performanceEntryArray = await LogParserPerformance.parse(
    dataPerformance
  );

  const logEntity = new TVPPLog();
  logEntity.addOverlayEntries(overlayEntryArray);
  logEntity.addPerformanceEntries(performanceEntryArray);
  const graphManager = new GraphManager(logEntity);
  // graphManager.goToLastEventState();
  graphManager.goToAbsoluteEventState(100);
  const dijkstraFilter = new DijkstraFilter();
  const filterResult = dijkstraFilter.applyFilter(
    graphManager.getGraphHolder(),
    "150.164.3.36"
  );
  console.log("Done");
});

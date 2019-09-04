import LogParserOverlay from "../../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../../src/parserLib/TVPPLog";
import GraphManager from "../../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../../src/parserLib/Log/Performance/LogParserPerformance";
import RingLayout from "../../src/parserLib/Graph/Visualizer/Layout/RingLayout";
import EmptyFilter from "../../src/parserLib/Graph/Filter/EmptyFilter";

test("ringLayoutTest", async () => {
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

  const logEntity = new TVPPLog({
    discriminateByPort: true
  });
  logEntity.addOverlayEntries(overlayEntryArray);
  logEntity.addPerformanceEntries(performanceEntryArray);
  const graphManager = new GraphManager(logEntity);
  graphManager.goToLastEventState();
  const filter = new EmptyFilter({});
  const filterResult = filter.applyFilter(graphManager.getGraphHolder());

  const ringLayout = new RingLayout(
    filterResult,
    graphManager.getMachines(),
    100
  );

  ringLayout.updatePositions();
  console.log("Done");
});

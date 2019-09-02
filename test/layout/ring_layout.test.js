import LogParserOverlay from "../../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../../src/parserLib/TVPPLog";
import GraphManager from "../../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../../src/parserLib/Log/Performance/LogParserPerformance";
import RingLayout from "../../src/parserLib/Graph/Visualizer/Layout/RingLayout";

test("ringLayoutTest", async () => {
  const dataOverlay = await LogParserOverlay.readLog("./logs/test1_overlay.txt");
  const dataPerformance = await LogParserPerformance.readLog("./logs/test1_perf.txt");
  const overlayEntryArray = await LogParserOverlay.parse(dataOverlay);
  const performanceEntryArray = await LogParserPerformance.parse(dataPerformance);

  const logEntity = new TVPPLog({
    discriminateByPort: true
  });
  logEntity.addOverlayEntries(overlayEntryArray);
  logEntity.addPerformanceEntries(performanceEntryArray);
  const graphHolder = new GraphManager(logEntity);
  graphHolder.goToLastEventState();
  const ringLayout = new RingLayout(
    graphHolder.getGraphHolder(),
    graphHolder.getMachines(),
    100
  );
  ringLayout.updatePositions();
  console.log("Done");
});

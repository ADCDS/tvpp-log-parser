import LogParserOverlay from "../../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../../src/parserLib/TVPPLog";
import GraphManager from "../../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../../src/parserLib/Log/Performance/LogParserPerformance";
import RingLayout from "../../src/parserLib/Graph/Visualizer/Layout/RingLayout";
import RingLayeredLayout from "../../src/parserLib/Graph/Visualizer/Layout/RingLayeredLayout";
import DijkstraFilter from "../../src/parserLib/Graph/Filter/Tree/DijkstraFilter";

test("starLayoutTest", async () => {
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
  console.log(`Parsed ${performanceEntryArray.length} performance lines`);
  const logEntity = new TVPPLog({
    discriminateByPort: true
  });
  logEntity.addOverlayEntries(overlayEntryArray);
  logEntity.addPerformanceEntries(performanceEntryArray);
  const graphManager = new GraphManager(logEntity);
  graphManager.goToAbsoluteEventState(100);

  const sourceMachineName = logEntity.getMachineName(
    logEntity.eventList[0].machine,
    logEntity.eventList[0].port
  );

  const dijkstraFilter = new DijkstraFilter();
  const filterResult = dijkstraFilter.applyFilter(
    graphManager.getGraphHolder(),
    sourceMachineName
  );

  const starLayout = new RingLayeredLayout(
    filterResult,
    graphManager.getMachines(),
    {
      source: logEntity.getMachineName(
        logEntity.eventList[0].machine,
        logEntity.eventList[0].port
      ),
      radius: 30
    }
  );
  starLayout.updatePositions();
  console.log("Done");
});

import LogParserOverlay from "../../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../../src/parserLib/TVPPLog";
import GraphManager from "../../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../../src/parserLib/Log/Performance/LogParserPerformance";
import RingLayout from "../../src/parserLib/Graph/Visualizer/Layout/RingLayout";
import RingLayeredLayout from "../../src/parserLib/Graph/Visualizer/Layout/RingLayeredLayout";
import SpringLayout from "../../src/parserLib/Graph/Visualizer/Layout/SpringLayout";
import AlgorithmR1 from "../../src/parserLib/Graph/Visualizer/Layout/AlgorithmR1";
import DijkstraFilter from "../../src/parserLib/Graph/Filter/Tree/DijkstraFilter";

test("algorithmR1LayoutTest", async () => {
  const logOverlay = await LogParserOverlay.readLog("./logs/test1_overlay.txt");
  const logPerformance = await LogParserPerformance.readLog(
    "./logs/test1_perf.txt"
  );
  const overlayEntryArray = await LogParserOverlay.parse(logOverlay);

  console.log(`Parsed ${overlayEntryArray.length} overlay lines`);
  const performanceEntryArray = await LogParserPerformance.parse(
    logPerformance
  );
  console.log(`Parsed ${performanceEntryArray.length} performance lines`);
  const logEntity = new TVPPLog({
    discriminateByPort: true
  });

  logEntity.addOverlayEntries(overlayEntryArray);
  logEntity.addPerformanceEntries(performanceEntryArray);

  const sourceMachineName = logEntity.getMachineName(
    logEntity.eventList[0].machine,
    logEntity.eventList[0].port
  );

  const graphManager = new GraphManager(logEntity);
  graphManager.goToAbsoluteEventState(100);

  const dijkstraFilter = new DijkstraFilter();
  const filterResult = dijkstraFilter.applyFilter(
    graphManager.getGraphHolder(),
    sourceMachineName
  );

  const algorithmR1 = new AlgorithmR1(
    filterResult,
    graphManager.getMachines(),
    {
      source: sourceMachineName,
      gamma: 30
    }
  );
  algorithmR1.updatePositions();
  console.log("Done");
});

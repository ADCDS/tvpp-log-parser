import LogParserOverlay from "../../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../../src/parserLib/TVPPLog";
import GraphManager from "../../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../../src/parserLib/Log/Performance/LogParserPerformance";
import RingLayout from "../../src/parserLib/Graph/Visualizer/Layout/RingLayout";
import StarLayout from "../../src/parserLib/Graph/Visualizer/Layout/StarLayout";
import SpringLayout from "../../src/parserLib/Graph/Visualizer/Layout/SpringLayout";
import AlgorithmR1 from "../../src/parserLib/Graph/Visualizer/Layout/AlgorithmR1";
import DijkstraFilter from "../../src/parserLib/Graph/Filter/DijkstraFilter";

test("algorithmR1TopologyTest", async () => {
  const logOverlay = await LogParserOverlay.readLog("./logs/test1_overlay.txt");
  const logPerformance = await LogParserPerformance.readLog("./logs/test1_perf.txt");
  const overlayEntryArray = await LogParserOverlay.parse(logOverlay);

  console.log(`Parsed ${overlayEntryArray.length} overlay lines`);
  const performanceEntryArray = await LogParserPerformance.parse(logPerformance);
  console.log(
    `Parsed ${performanceEntryArray.length} performance lines`
  );
  const logEntity = new TVPPLog({
    discriminateByPort: true
  });

  logEntity.addOverlayEntries(overlayEntryArray);
  logEntity.addPerfomanceEntries(performanceEntryArray);

  let sourceMachineName = logEntity.getMachineName(logEntity.eventList[0].machine, logEntity.eventList[0].port);

  const graphHolder = new GraphManager(logEntity);
  graphHolder.goToAbsoluteState(100);

  const dijkstraFilter = new DijkstraFilter(
    graphHolder.getGraphHolder(),
    {
      source: sourceMachineName
    }
  );
  dijkstraFilter.applyFilter();

  const algorithmR1 = new AlgorithmR1(
    graphHolder.getGraphHolder(),
    graphHolder.getMachines(),
    {
      source: sourceMachineName,
      gamma: 30
    }
  );
  algorithmR1.updatePositions();
  console.log("Done");
});
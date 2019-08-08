import LogParserOverlay from "../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../src/parserLib/TVPPLog";
import GraphManager from "../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../src/parserLib/Log/Performance/LogParserPerformance";
import RingTopology from "../src/parserLib/Graph/Visualizer/Topology/RingTopology";

test("ringTopologyTest", () => {
  const logOverlay = LogParserOverlay.readLog("./logs/test1_overlay.txt");
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
              graphHolder.goToLastState();
              const ringTopology = new RingTopology(
                graphHolder.getGraphHolder(),
                graphHolder.getMachines(),
                100
              );
              ringTopology.updatePositions();
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

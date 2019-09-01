import LogParserOverlay from "../../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../../src/parserLib/TVPPLog";
import GraphManager from "../../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../../src/parserLib/Log/Performance/LogParserPerformance";
import RingLayout from "../../src/parserLib/Graph/Visualizer/Layout/RingLayout";
import RingLayeredLayout from "../../src/parserLib/Graph/Visualizer/Layout/RingLayeredLayout";
import SpringLayout from "../../src/parserLib/Graph/Visualizer/Layout/SpringLayout";

test("springLayoutTest", () => {
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
              const logEntity = new TVPPLog({
                discriminateByPort: true
              });
              logEntity.addOverlayEntries(overlayEntryArray);
              logEntity.addPerformanceEntries(performanceEntryArray);
              const graphHolder = new GraphManager(logEntity);
              graphHolder.goToAbsoluteEventState(100);
              const starLayout = new SpringLayout(
                graphHolder.getGraphHolder(),
                graphHolder.getMachines(),
	              {
                  source: logEntity.getMachineName(logEntity.eventList[0].machine, logEntity.eventList[0].port),
		              radius: 30
	              }
              );
              starLayout.updatePositions();
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

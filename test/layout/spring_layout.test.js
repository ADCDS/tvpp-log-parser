import LogParserOverlay from "../../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../../src/parserLib/TVPPLog";
import GraphManager from "../../src/parserLib/Graph/GraphManager";
import LogParserPerformance from "../../src/parserLib/Log/Performance/LogParserPerformance";
import RingLayout from "../../src/parserLib/Graph/Visualizer/Layout/RingLayout";
import RingLayeredLayout from "../../src/parserLib/Graph/Visualizer/Layout/RingLayeredLayout";
import SpringLayout from "../../src/parserLib/Graph/Visualizer/Layout/SpringLayout";
import EmptyFilter from "../../src/parserLib/Graph/Filter/EmptyFilter";

test("springLayoutTest", async () => {
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

  const filter = new EmptyFilter({});
  const filterResult = filter.applyFilter(graphManager.getGraphHolder());

  const sprintLayout = new SpringLayout(
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
  sprintLayout.updatePositions();
  console.log("Done");
});

import LogParserOverlay from "../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../src/parserLib/TVPPLog";
import GraphManager from "../src/parserLib/Graph/GraphManager";

test("graphManagerTest", async () => {
  const data = await LogParserOverlay.readLog("./logs/test1_overlay.txt");
  const entryArray = await LogParserOverlay.parse(data);

  console.log(`Parsed ${entryArray.length} lines`);
  const logEntity = new TVPPLog({
    discriminateByPort: true
  });
  logEntity.addOverlayEntries(entryArray);
  const graphHolder = new GraphManager(logEntity);
  for (let i = 0; i < 3; i += 1) {
    graphHolder.goToNextState();
  }
});

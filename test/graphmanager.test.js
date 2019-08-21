import LogParserOverlay from "../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../src/parserLib/TVPPLog";
import GraphManager from "../src/parserLib/Graph/GraphManager";

test("graphManagerTest", () => {
  const log = LogParserOverlay.readLog("./logs/test1_overlay.txt");
  log.then(
    data => {
      LogParserOverlay.parse(data).then(entryArray => {
        console.log(`Parsed ${entryArray.length} lines`);
        const logEntity = new TVPPLog({
          discriminateByPort: true
        });
        logEntity.addOverlayEntries(entryArray);
        const graphHolder = new GraphManager(logEntity);
        for (let i = 0; i < 160; i += 1) {
          graphHolder.nextState();
        }
      });
    },
    reason => {
      console.log(reason);
    }
  );
});

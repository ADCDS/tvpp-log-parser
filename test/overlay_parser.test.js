import LogParserOverlay from "../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../src/parserLib/TVPPLog";

test("syncParseTest", () => {
  const log = LogParserOverlay.readLog("./logs/test1_overlay.txt");
  log.then(
    data => {
      LogParserOverlay.parse(data).then(entryArray => {
        console.log(`Parsed ${entryArray.length} lines`);
        const logEntity = new TVPPLog();
        logEntity.addOverlayEntries(entryArray);
        console.log("Done");
      });
    },
    reason => {
      console.log(reason);
    }
  );
});

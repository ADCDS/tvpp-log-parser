import LogParserOverlay from "../src/parserLib/overlay/LogParserOverlay";
import TVPPLog from "../src/parserLib/TVPPLog";

test("syncParseTest", () => {
  const log = LogParserOverlay.readLog("./logs/test1_overlay.txt");
  log.then(
    data => {
      LogParserOverlay.parse(data).then(entryArray => {
        console.log(`Parsed ${entryArray.length} lines`);
        const logEntity = new TVPPLog();
        logEntity.addEntries(entryArray);
      });
    },
    reason => {
      console.log(reason);
    }
  );
});

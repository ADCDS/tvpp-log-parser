import LogParserPerformance from "../src/parserLib/Log/Performance/LogParserPerformance";
import TVPPLog from "../src/parserLib/TVPPLog";

test("performanceParseTest", () => {
  const log = LogParserPerformance.readLog("./logs/test1_perf.txt");
  log.then(
    data => {
      LogParserPerformance.parse(data).then(entryArray => {
        console.log(`Parsed ${entryArray.length} lines`);
        const logEntity = new TVPPLog();
        logEntity.addOverlayEntries(entryArray);
      });
    },
    reason => {
      console.log(reason);
    }
  );
});

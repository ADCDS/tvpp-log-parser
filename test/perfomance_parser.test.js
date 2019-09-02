import LogParserPerformance from "../src/parserLib/Log/Performance/LogParserPerformance";
import TVPPLog from "../src/parserLib/TVPPLog";

test("performanceParseTest", async () => {
  const data = await LogParserPerformance.readLog("./logs/test1_perf.txt");
  const entryArray = await LogParserPerformance.parse(data);

  console.log(`Parsed ${entryArray.length} lines`);
  const logEntity = new TVPPLog();
  logEntity.addPerformanceEntries(entryArray);
  console.log("Done");
});

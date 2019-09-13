import LogParserPerformance from "../src/parserLib/Log/Performance/LogParserPerformance";
import TVPPLog from "../src/parserLib/TVPPLog";
import Utils from "../src/utils";

test("performanceParseTest", async () => {
	const data = await Utils.readLog("./logs/test1_perf.txt");
	const entryArray = await LogParserPerformance.parse(data);

	console.log(`Parsed ${entryArray.length} lines`);
	const logEntity = new TVPPLog();
	logEntity.addPerformanceEntries(entryArray);

	expect(true).toBe(true);
});

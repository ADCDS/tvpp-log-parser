import Utils from "../src/utils";
import LogParserOverlay from "../src/parserLib/Log/Overlay/LogParserOverlay";
import LogParserPerformance from "../src/parserLib/Log/Performance/LogParserPerformance";
import TVPPLog from "../src/parserLib/TVPPLog";

test("tvppTest1", async () => {
	const dataOverlay = await Utils.readLog("./logs/test1_overlay.txt");
	const dataPerformance = await Utils.readLog("./logs/test1_perf.txt");
	const overlayEntryArray = await LogParserOverlay.parse(dataOverlay);
	const performanceEntryArray = await LogParserPerformance.parse(dataPerformance);
	console.log(`Parsed ${performanceEntryArray.length} performance lines`);

	const logEntity = new TVPPLog();
	logEntity.addOverlayEntries(overlayEntryArray);
	logEntity.addPerformanceEntries(performanceEntryArray);
	const machinesByBandwidth = logEntity.getMachinesByBandwidthClassification();
	expect(true).toBe(true);
});

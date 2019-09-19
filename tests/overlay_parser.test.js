// @flow
import LogParserOverlay from "../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../src/parserLib/TVPPLog";
import Utils from "../src/utils";

test("syncParseTest", async () => {
	const data = await Utils.readLog("./logs/test1_overlay.txt");
	const entryArray = await LogParserOverlay.parse(data);

	const logEntity = new TVPPLog({
		discriminateByPort: true
	});
	logEntity.addOverlayEntries(entryArray);

	expect(true).toBe(true);
});

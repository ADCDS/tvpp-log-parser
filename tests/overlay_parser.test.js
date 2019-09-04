import LogParserOverlay from "../src/parserLib/Log/Overlay/LogParserOverlay";
import TVPPLog from "../src/parserLib/TVPPLog";

test("syncParseTest", async () => {
  const data = await LogParserOverlay.readLog("./logs/test1_overlay.txt");
  const entryArray = await LogParserOverlay.parse(data);

  const logEntity = new TVPPLog({
    discriminateByPort: true
  });
  logEntity.addOverlayEntries(entryArray);
});

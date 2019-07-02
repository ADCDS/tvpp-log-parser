import LogParser from "../src/parserLib/LogParser";
import TVPPLog from "../src/parserLib/TVPPLog";

test("syncParseTest", () => {
  let log = LogParser.readLog('./logs/test1.txt');
  log.then(data => {
    LogParser.parse(data).then(entryArray => {
      console.log('Parsed ' + entryArray.length + ' lines');
      let logEntity = new TVPPLog();
      logEntity.addEntries(entryArray);

    });
  }, reason => {
    console.log(reason);
  });
});

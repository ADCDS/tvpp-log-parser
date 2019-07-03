import LogEntry from "./LogEntry";

const fs = require("fs");

class LogParser {
  static async readLog(filePath) {
    // Lets read the entire file at first, todo read chunk by chunk
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, fd) => {
        if (err) {
          if (err.code === "ENOENT") {
            console.error("myfile does not exist");
            return;
          }

          reject(err);
        }

        resolve(fd.toString("utf8").split("\n"));
      });
    });
  }

  static async parse(lineArray) {
    const ret = [];
    for (let i = 1; i < lineArray.length; i += 1) {
      ret.push(this.lineToEntry(lineArray[i]));
    }
    return ret;
  }

  static lineToEntry(line) {
    let pieces = line.split(" ");
    const hostAddress = pieces[0].split(":");
    const timestamp = pieces[1];
    pieces.splice(0, 2);

    pieces = pieces.filter(value => {
      return !(value === "0.0.0.0:0" || value === "" || value === "\r");
    });
    return new LogEntry(hostAddress[0], hostAddress[1], timestamp, pieces);
  }
}

export default LogParser;

// @flow
import LogEntryPerformance from "./LogEntryPerformance";

const fs = require("fs");

class LogParserPerformance {
	static async readLog(filePath) {
		// Lets read the entire file at first, todo read chunk by chunk
		return new Promise((resolve, reject) => {
			fs.readFile(filePath, (err, fd) => {
				if (err) {
					if (err.code === "ENOENT") {
						console.error("file doesnt exists");
						return;
					}

					reject(err);
				}

				resolve(fd.toString("utf8").split("\n"));
			});
		});
	}

	static async parse(lineArray, discriminateByPort) {
		const ret = [];
		for (let i = 0; i < lineArray.length; i += 1) {
			if (lineArray[i] !== "")
				ret.push(this.lineToEntry(i, lineArray[i], discriminateByPort));
		}
		return ret;
	}

	static lineToEntry(lineId, line, discriminateByPort) {
		if (discriminateByPort == null) {
			discriminateByPort = false;
		}

		const pieces = line.split(" ");
		const machine = pieces[0];
		const split = machine.split(":");

		return new LogEntryPerformance(
			lineId,
			split[0],
			split[1],
			pieces[1],
			pieces[2],
			pieces[3],
			pieces[4],
			pieces[5],
			pieces[6],
			pieces[7],
			pieces[8],
			pieces[9],
			pieces[10],
			pieces[11],
			pieces[12],
			pieces[13],
			pieces[14],
			pieces[15],
			pieces[16],
			pieces[17],
			pieces[18],
			pieces[19],
			pieces[20],
			pieces[21],
			pieces[22],
			pieces[23],
			pieces[24],
			pieces[25]
		);
	}
}

export default LogParserPerformance;

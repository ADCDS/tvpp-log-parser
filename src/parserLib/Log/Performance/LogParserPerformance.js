// @flow
import LogEntryPerformance from "./LogEntryPerformance";

class LogParserPerformance {
	static async parse(lineArray, discriminateByPort) {
		const ret = [];
		for (let i = 0; i < lineArray.length; i += 1) {
			if (lineArray[i] !== "") ret.push(this.lineToEntry(i, lineArray[i], discriminateByPort));
		}
		return ret;
	}

	static lineToEntry(lineId, line) {
		const pieces = line.split(" ");
		const machine = pieces[0];
		const split = machine.split(":");

		return new LogEntryPerformance(
			Number(lineId),
			split[0],
			Number(split[1]),
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
			Number(pieces[24]),
			Number(pieces[25])
		);
	}
}

export default LogParserPerformance;

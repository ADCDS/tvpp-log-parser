// @flow
import LogEntryPerformance from "./LogEntryPerformance";

class LogParserPerformance {
	static async parse(lineArray: Array<string>) {
		const ret = [];
		for (let i = 0; i < lineArray.length; i += 1) {
			if (lineArray[i] !== "") ret.push(this.lineToEntry(i, lineArray[i]));
		}
		return ret;
	}

	static lineToEntry(lineId: number, line: string): LogEntryPerformance {
		const pieces = line.split(" ");
		const machine = pieces[0];
		const split = machine.split(":");

		return new LogEntryPerformance(
			lineId,
			split[0],
			Number(split[1]),
			Number(pieces[1]),
			Number(pieces[2]),
			Number(pieces[3]),
			Number(pieces[4]),
			Number(pieces[5]),
			Number(pieces[6]),
			Number(pieces[7]),
			Number(pieces[8]),
			Number(pieces[9]),
			Number(pieces[10]),
			Number(pieces[11]),
			Number(pieces[12]),
			pieces[13],
			pieces[14],
			Number(pieces[15]),
			Number(pieces[16]),
			Number(pieces[17]),
			Number(pieces[18]),
			Number(pieces[19]),
			Number(pieces[20]),
			Number(pieces[21]),
			Number(pieces[22]),
			Number(pieces[23]),
			Number(pieces[24]),
			Number(pieces[25]),
			Number(pieces[26])
		);
	}
}

export default LogParserPerformance;

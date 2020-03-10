// @flow
import LogEntryOverlay from "./LogEntryOverlay";

class LogParserOverlay {
	static async parse(lineArray: Array<string>) {
		const ret = [];
		for (let i = 0; i < lineArray.length; i += 1) {
			if (lineArray[i] !== "") ret.push(this.lineToEntry(lineArray[i]));
		}
		return ret;
	}

	static lineToEntry(line: string): LogEntryOverlay {
		/**
		 *  0.0.0.0:0 works as an separator,
		 *  to the left are the servers which 'hostAddress' receives packets from.
		 *  to the right are the servers which our 'hostAddress' sends chunks to,
		 */

		const pieces = line.split("0.0.0.0:0");
		const firstHalf = pieces[0].split(" ");
		const secondHalf = pieces[1].split(" ");
		const hostAddress = firstHalf[0].split(":");
		const timestamp = firstHalf[1];
		firstHalf.splice(0, 2);

		// We are not going to consider IN partners
		const partnersIn = [];
		/* const partnersIn = firstHalf
			.filter(value => {
				return !(value === "" || value === "\r");
			})
			.map(str => {
				return str.trim();
			}); */

		const partnersOut = secondHalf
			.filter(value => {
				return !(value === "" || value === "\r");
			})
			.map(str => {
				return str.trim();
			});

		return new LogEntryOverlay(hostAddress[0], Number(hostAddress[1]), Number(timestamp), partnersIn, partnersOut);
	}
}

export default LogParserOverlay;

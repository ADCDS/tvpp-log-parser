// @flow
import LogEntryOverlay from "./LogEntryOverlay";

class LogParserOverlay {
	static async parse(lineArray) {
		const ret = [];
		for (let i = 0; i < lineArray.length; i += 1) {
			if (lineArray[i] !== "") ret.push(this.lineToEntry(lineArray[i]));
		}
		return ret;
	}

	static lineToEntry(line) {
		/**
		 *  0.0.0.0:0 works as an separator,
		 *  to the right are the servers which our 'hostAddress' sends chunks to,
		 *  to the left are the servers which 'hostAddress' receives packets from.
		 */

		const pieces = line.split("0.0.0.0:0");
		const firstHalf = pieces[0].split(" ");
		const secondHalf = pieces[1].split(" ");
		const hostAddress = firstHalf[0].split(":");
		const timestamp = firstHalf[1];
		firstHalf.splice(0, 2);

		let partnersIn = firstHalf.filter(value => {
			return !(value === "" || value === "\r");
		});

		let partnersOut = secondHalf.filter(value => {
			return !(value === "" || value === "\r");
		});

		partnersIn = partnersIn.map(el => {
			const addressPort = el.split(":");
			return { address: addressPort[0], port: addressPort[1] };
		});

		partnersOut = partnersOut.map(el => {
			const addressPort = el.split(":");
			return { address: addressPort[0], port: addressPort[1] };
		});

		return new LogEntryOverlay(hostAddress[0], hostAddress[1], timestamp, partnersIn, partnersOut);
	}
}

export default LogParserOverlay;

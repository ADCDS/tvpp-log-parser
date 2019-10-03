// @flow
import Chart from "./Chart";
import ChartManager from "../../../web/js/DOM/ChartManager";
import type { Sigma } from "../../../types";

type OutputChart = Array<{ name: string, value: string | number }>;

class GenericOutputText extends Chart {
	static drawFunction = ChartManager.drawTexts;

	static generateGraphInput(input: { [string]: any }): OutputChart {
		const currentSourceIndex = window.graphManager.currentSourceIndex;
		const initialEventId = window.logEntity.sourceApparitionLocations[currentSourceIndex - 1];
		const lastEventId = window.graphManager.currentEventIndex - 1;

		const initialEvent = window.logEntity.overlayEntryList[initialEventId];
		const lastEvent = window.logEntity.overlayEntryList[lastEventId];

		// console.log(initialEventId, initialEvent, lastEventId, lastEvent);

		const data = [];
		data.push({ name: "Overlay File Name", value: window.logEntity.overlayFileName });
		data.push({ name: "Performance File Name", value: window.logEntity.performanceFileName });
		data.push({ name: "Server window index", value: currentSourceIndex });
		data.push({ name: "Evaluated Overlay Lines", value: `[${initialEventId + 1}-${lastEventId + 1}]` });
		data.push({ name: "First Event Evaluated Timestamp", value: new Date(initialEvent.timestamp * 1000).toString() });
		data.push({ name: "Last Event Evaluated Timestamp", value: new Date(lastEvent.timestamp * 1000).toString() });
		data.push({ name: "Elapsed time", value: `${window.graphManager.getCurrentElapsedTime()}s` });

		const graphHolder = window.graphManager.graphHolder;
		const keys = Object.keys(graphHolder.graph);
		const numberOfNodes = keys.length;
		const numberOfConnectedNodes = keys.filter(node => graphHolder.isConnected(node)).length;
		const numberOfUnconnectedNodes = keys.filter(node => !graphHolder.isConnected(node)).length;

		data.push({ name: "Number of Nodes", value: numberOfNodes });
		data.push({ name: "Number of Connected Nodes", value: numberOfConnectedNodes });
		data.push({ name: "Number of Unconnected Nodes", value: numberOfUnconnectedNodes });
		return data;
	}
}

export default GenericOutputText;

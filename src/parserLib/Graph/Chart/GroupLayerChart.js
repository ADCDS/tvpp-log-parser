// @flow
import Chart from "./Chart";
import ChartManager from "../../../web/js/DOM/ChartManager";
import type { Sigma } from "../../../types";
import TreeFilterResult from "../Filter/Results/TreeFilterResult";
import Variables from "../../../web/js/DOM/Variables";

type OutputChart = {
	data: {
		metadata: {
			timestamp: number
		},
		layerArray: Array<{ name: {name: string }, [string]: number }>
	},
	colorMap: { [number]: string }
};

class GroupLayerChart extends Chart {
	static drawFunction = ChartManager.drawGroupedBarChart;

	static generateGraphInput(input: { sigma: Sigma, [string]: any }): OutputChart {
		// Draw graphics for the current graph
		const layoutSubFilter = ((input.sigma.helperHolder.layoutSubFilter: any): TreeFilterResult);
		const currIndex = window.graphManager.currentSourceIndex;
		const currTimestamp = window.graphManager.getCurrentTimestamp();
		const usedLayout = input.sigma.helperHolder.usedLayout;
		const logEntity = window.logEntity;
		const layers = Array.from(new Set(Object.values(layoutSubFilter.distancesFromSource))).sort();
		const layerDistanceMap = {};
		const colorMap = {};
		const bandwidthsTemplate = {};

		for (let i = 0; i < logEntity.bandwidthClassifications.length; i++) {
			const bandwidth = logEntity.bandwidthClassifications[i];
			bandwidthsTemplate[bandwidth] = 0;
			colorMap[bandwidth] = usedLayout.options.colorMap[i];
		}

		const output: {
			metadata: {
				timestamp: number
			},
			layerArray: Array<{
				metadata: {
					name: string,
					lastLayer: boolean
				},
				[string]: number
			}>
		} = {metadata: {timestamp: currTimestamp}, layerArray: []};
		const outputArray = output.layerArray;

		// Populate output array

		for (let j = 0; j < layers.length; j++) {
			const layerName = `Layer ${j}`;
			const objectToInsert = { metadata: {name: layerName, lastLayer: j === (layers.length - 1)}, ...bandwidthsTemplate };

			outputArray.push(objectToInsert);
			layerDistanceMap[layers[j]] = j;
			Variables.layersFound.add(layerName);
		}

		for (const machine of logEntity.machines.values()) {
			// In which layer are this machine at?
			const distance = layoutSubFilter.distancesFromSource[machine.address];
			const currentTimestamp = window.logEntity.overlayEntryList[window.graphManager.currentEventIndex].timestamp;
			const bandwidth = machine.getPeerClassificationStringAt(currentTimestamp);
			// if (bandwidth === undefined) continue;

			const layerIndex = layerDistanceMap[distance];
			outputArray[layerIndex][bandwidth]++;
		}

		Variables.outputGroupChartData[currIndex] = output;
		Variables.colorMap = colorMap;

		return {
			data: output,
			colorMap
		};
	}
}

export default GroupLayerChart;

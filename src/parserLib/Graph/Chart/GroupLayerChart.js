// @flow
import Chart from "./Chart";
import ChartManager from "../../../web/js/DOM/ChartManager";
import type {Sigma} from "../../../types";
import TreeFilterResult from "../Filter/Results/TreeFilterResult";

type OutputChart = {
	data: Array<{ name: string, [string]: number }>,
	colorMap: { [number]: string }
};

class GroupLayerChart extends Chart {
	static drawFunction = ChartManager.drawGroupedBarChart;

	static generateGraphInput(input: { sigma: Sigma, [string]: any }): OutputChart {
		// Draw graphics for the current graph
		const layoutSubFilter = (input.sigma.helperHolder.layoutSubFilter: TreeFilterResult);

		const usedLayout = input.sigma.helperHolder.usedLayout;
		const logEntity = window.logEntity;
		const layers = Array.from(new Set(Object.values(layoutSubFilter.distancesFromSource))).sort();
		const colorMap = {};
		const bandwidthsTemplate = {};

		for (let i = 0; i < logEntity.bandwidths.length; i++) {
			const bandwidth = logEntity.bandwidths[i];
			bandwidthsTemplate[bandwidth] = 0;
			colorMap[bandwidth] = usedLayout.options.colorMap[i];
		}

		const outputArray: Array<{ name: string, [string]: number }> = [];

		// Populate output array

		for (let j = 0; j < layers.length; j++) {
			const objectToInsert = {name: `Layer ${j}`, ...bandwidthsTemplate};

			outputArray.push(objectToInsert);
		}

		for (const machine of logEntity.machines.values()) {
			// In which layer are this machine at?
			const distance = layoutSubFilter.distancesFromSource[machine.address];
			const bandwidth = machine.bandwidth;
			if (bandwidth === undefined) continue;

			let layerIndex;
			if (distance !== Infinity) {
				layerIndex = distance;
			} else {
				// This is an unconnected node, its layer index is the last one
				layerIndex = layers.length - 1;
			}
			outputArray[layerIndex][bandwidth]++;
		}

		return {
			data: outputArray,
			colorMap: colorMap
		};
	}
}

export default GroupLayerChart;

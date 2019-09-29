// @flow
import * as d3 from "d3";
import DOMUtils from "./Utils";

class ChartManager {
	static drawCharts() {
		// Draw graphics for the current graph

		const layoutSubFilter = window.sigmaCurrent.helperHolder.layoutSubFilter;
		const usedLayout = window.sigmaCurrent.helperHolder.usedLayout;
		const logEntity = window.logEntity;
		const layers = Array.from(new Set(Object.values(layoutSubFilter.distancesFromSource))).sort();

		// The number of samples is the number of layers in our network
		const samplesNum = layers.length; //

		const colorMap = {};

		// The number of series is the number of different bandwidths
		const seriesNum = logEntity.bandwidths.length;

		const bandwidthsTemplate = {};
		let i = 0;
		for (const bandwidth of logEntity.bandwidths) {
			bandwidthsTemplate[bandwidth] = 0;
			colorMap[bandwidth] = usedLayout.options.colorMap[i++];
		}

		const outputArray: Array<{ name: string, [string]: number }> = [];

		// Populate output array

		for (let j = 0; j < layers.length; j++) {
			const objectToInsert = { name: `Layer ${j}`, ...bandwidthsTemplate };

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

		console.log(outputArray);
		DOMUtils.getElementById("currentGraphic").innerHTML = "";
		ChartManager.drawGroupedBarChart("#currentGraphic", samplesNum, seriesNum, outputArray, colorMap);
	}

	static drawGroupedBarChart(
		DOMLocation: string,
		samplesNum: number,
		seriesNum: number,
		data: Array<{ name: string, [string]: number }>,
		colorMap: { [number]: string }
	) {
		const margin = { top: 10, right: 30, bottom: 30, left: 40 };
		const width = 600 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		const svg = d3
			.select(DOMLocation)
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);
		const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

		const keys = Object.keys(data[0])
			.filter(value => value !== "name")
			.reverse();

		// The scale spacing the groups:
		const x0 = d3
			.scaleBand()
			.rangeRound([0, 470])
			.paddingInner(0.1);

		// The scale for spacing each group's bar:
		const x1 = d3.scaleBand().padding(0.05);

		const y = d3.scaleLinear().rangeRound([height, 0]);

		let highestYValue = 0;
		for (const layer of data) {
			// eslint-disable-next-line flowtype-errors/show-errors
			const max = Math.max(...Object.values(layer).filter(value => !Number.isNaN(Number(value))));
			if (max > highestYValue) {
				highestYValue = max;
			}
		}

		x0.domain(
			data.map((d: { name: * }) => {
				return d.name;
			})
		);
		x1.domain(keys).rangeRound([0, x0.bandwidth()]);
		y.domain([0, highestYValue]).nice();

		g.append("g")
			.selectAll("g")
			.data(data)
			.enter()
			.append("g")
			.attr("class", "bar")
			.attr("transform", (d: { name: * }) => {
				return `translate(${x0(d.name)},0)`;
			})
			.selectAll("rect")
			.data(d => {
				return keys.map((key: string) => {
					return { key, value: d[key] };
				});
			})
			.enter()
			.append("rect")
			.attr("x", (d: { key: * }) => {
				return x1(d.key);
			})
			.attr("y", (d: { value: * }) => {
				return y(d.value);
			})
			.attr("width", x1.bandwidth())
			.attr("height", (d: { value: * }) => {
				return height - y(d.value);
			})
			.attr("fill", (d: { key: string }) => {
				return colorMap[Number(d.key)];
			});

		g.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(0,${height})`)
			.call(d3.axisBottom(x0));

		g.append("g")
			.attr("class", "y axis")
			.call(d3.axisLeft(y).ticks(null, "s"))
			.append("text")
			.attr("x", 2)
			.attr("y", y(y.ticks().pop()) + 0.5)
			.attr("dy", "0.32em")
			.attr("fill", "#000")
			.attr("font-weight", "bold")
			.attr("text-anchor", "start")
			.text("Population");

		const legend = g
			.append("g")
			.attr("font-family", "sans-serif")
			.attr("font-size", 10)
			.attr("text-anchor", "end")
			.selectAll("g")
			.data(keys)
			.enter()
			.append("g")
			.attr("transform", (d: {}, i: number) => {
				return `translate(0,${i * 20})`;
			});

		legend
			.append("rect")
			.attr("x", width - 17)
			.attr("width", 15)
			.attr("height", 15)
			.attr("fill", (d: number) => {
				return colorMap[Number(d)];
			})
			.attr("stroke", (d: number) => {
				return colorMap[Number(d)];
			})
			.attr("stroke-width", 2);

		legend
			.append("text")
			.attr("x", width - 24)
			.attr("y", 9.5)
			.attr("dy", "0.32em")
			.text((d: {}) => {
				return d;
			});
	}
}

export default ChartManager;

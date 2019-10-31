// @flow

import * as d3 from "d3";
import Utils from "../../utils";
import DOMUtils from "../../web/js/DOM/Utils";
import type { GLChartOutputType } from "../../types";

type GLChartPrepDataType = Array<{ timestamp: number, bandwidth: number, nodeCount: number }>;

class GLCharts {
	static generateGraphics(input: GLChartOutputType) {
		console.log("GLChart input", input);
		const bandwidths = Object.keys(input.colorMap).map(Number);
		let layerIndex = 0;
		const initialTimestamp = input.data["1"].metadata.timestamp;

		// Just to make possible to spot gaps in timestamp reports
		const timestampsSet = new Set();
		let lastTimestamp = 0;

		console.log(bandwidths);

		// We are going to generate a chart for each layer, X is the time, Y is the number of nodes for each type
		for (const layer of input.layers) {
			let highestNodeCount = 0;

			const preparedData: Array<{ bandwidth: number, datapoints: { timestamp: number, nodeCount: number } }> = [];
			const objHolder: { [number]: Array<{ timestamp: number, nodeCount: number }> } = {};
			bandwidths.map(value => {
				objHolder[value] = [];
			});

			// Iterate through all events
			for (const eventIndex in input.data) {
				const event = input.data[eventIndex];

				const eventTimestamp = event.metadata.timestamp;
				timestampsSet.add(eventTimestamp - initialTimestamp);

				const targetLayer = event.layerArray[layerIndex];

				if (!targetLayer) {
					// Current event doesn't have the layer we are searching for
					continue;
				}

				// Discard last layer (unconnected nodes)
				if (targetLayer.metadata.lastLayer) continue;

				// Collect the number of nodes of each type in this layer
				for (const bandwidthStr of bandwidths) {
					const bandwidthNodeCount = targetLayer[bandwidthStr];

					// Push datapoint
					const timestamp = eventTimestamp - initialTimestamp;

					objHolder[bandwidthStr].push({ timestamp, nodeCount: bandwidthNodeCount });
					if (bandwidthNodeCount > highestNodeCount) {
						highestNodeCount = bandwidthNodeCount;
					}
					if (timestamp > lastTimestamp) {
						lastTimestamp = timestamp;
					}
				}
			}
			for (const bandwidthStr of bandwidths) {
				preparedData.push({ bandwidth: bandwidthStr, datapoints: objHolder[bandwidthStr] });
			}

			GLCharts.generateChartForLayer(layer, bandwidths, input.colorMap, highestNodeCount, lastTimestamp, preparedData);

			layerIndex++;
		}

		console.log(timestampsSet);
	}

	static generateChartForLayer(
		layer: string,
		bandwidths: Array<number>,
		colorMap: { [number]: string },
		highestNodeCount: number,
		lastTimestamp: number,
		data: GLChartPrepDataType
	) {
		console.log(layer, data);

		const chartName = `glChart_${layer.replace(" ", "_")}`;
		document.getElementById(chartName).innerHTML = "";

		const margin = { top: 10, right: 30, bottom: 30, left: 60 };
		const width = 1600 - margin.left - margin.right;
		const height = 1000 - margin.top - margin.bottom;

		// Define scales
		const xScale = d3.scaleLinear().range([0, width]);
		const yScale = d3.scaleLinear().range([height, 0]);

		// Define axes
		const xAxis = d3.axisBottom().scale(xScale);
		const yAxis = d3.axisLeft().scale(yScale);

		// Define lines
		const line = d3
			.line()
			.curve(d3.curveLinear)
			.x(function(d) {
				return xScale(d.timestamp);
			})
			.y(function(d) {
				return yScale(d.nodeCount);
			});

		// Define svg canvas
		const svg = d3
			.select(`#${chartName}`)
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		// Set the domain of the axes
		xScale.domain([0, lastTimestamp]);

		yScale.domain([0, highestNodeCount]);

		// Place the axes on the chart
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0,${height})`)
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("class", "label")
			.attr("y", 6)
			.attr("dy", ".71em")
			.attr("dx", ".71em")
			.style("text-anchor", "beginning")
			.text("Product Concentration");

		const products = svg
			.selectAll(".bandwitdh")
			.data(data)
			.enter()
			.append("g")
			.attr("class", "bandwitdh");

		products
			.append("path")
			.attr("class", "line")
			.attr("d", function(d) {
				return line(d.datapoints);
			})
			.style("stroke", function(d) {
				return colorMap[d.bandwidth];
			});

		svg
			// First we need to enter in a group
			.selectAll("myDots")
			.data(data)
			.enter()
			.append("g")
			.style("fill", function(d) {
				return colorMap[d.bandwidth];
			})
			// Second we need to enter in the 'values' part of this group
			.selectAll("myPoints")
			.data(function(d) {
				return d.datapoints;
			})
			.enter()
			.append("circle")
			.attr("cx", function(d) {
				return xScale(d.timestamp);
			})
			.attr("cy", function(d) {
				return yScale(d.nodeCount);
			})
			.attr("r", 5)
			.attr("stroke", "white");

		// console.log(JSON.stringify(d3.values(concentrations), null, 2)) // to view the structure
		console.log(d3.values(data)); // to view the structure
		console.log(data);
		// console.log(concentrations.map(function()))

		// Define responsive behavior
		function resize() {
			const width = parseInt(d3.select(`#${chartName}`).style("width")) - margin.left - margin.right;
			const height = parseInt(d3.select(`#${chartName}`).style("height")) - margin.top - margin.bottom;

			// Update the range of the scale with new width/height
			xScale.range([0, width]);
			yScale.range([height, 0]);

			// Update the axis and text with the new scale
			svg.select(".x.axis")
				.attr("transform", `translate(0,${height})`)
				.call(xAxis);

			svg.select(".y.axis").call(yAxis);

			// Force D3 to recalculate and update the line
			svg.selectAll(".line").attr("d", function(d) {
				return line(d.datapoints);
			});

			// Update the tick marks
			xAxis.ticks(Math.max(width / 75, 2));
			yAxis.ticks(Math.max(height / 50, 2));
		}

		// Call the resize function whenever a resize event occurs
		d3.select(window).on("resize", resize);

		// Call the resize function
		resize();
	}
}

export default GLCharts;

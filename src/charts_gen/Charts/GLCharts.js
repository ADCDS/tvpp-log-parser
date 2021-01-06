// @flow

import * as d3 from "d3";
import DOMUtils from "../../web/js/DOM/Utils";
import type {GLChartOutputType} from "../../types";
import Utils from "../../utils";

class GLCharts {
	static postProcessedData = {};
	static peerClassificationName: { [string]: string } = {
		sizePeerOut_0_sizePeerOutFREE_0: "Free rider",
		sizePeerOut_1_sizePeerOutFREE_38: "Cold",
		sizePeerOut_18_sizePeerOutFREE_22: "Warm",
		sizePeerOut_46_sizePeerOutFREE_0: "Hot",
		sizePeerOut_40_sizePeerOutFREE_0: "Hot2",
		sizePeerOut_20_sizePeerOutFREE_0: "Server"
	};

	static generateGraphics(inputArray: Array<GLChartOutputType>) {
		console.log("GLChart input", inputArray);

		const layerChartDataObj: { [string]: any } = {};
		let inputCnt = 0;

		for (const input of inputArray) {
			const inputId = inputCnt++;

			const bandwidths = Object.keys(input.colorMap);
			let layerIndex = 0;
			const initialTimestamp = input.data["1"].metadata.timestamp;

			// Just to make possible to spot gaps in timestamp reports
			const timestampsSet = new Set();
			let lastTimestamp = 0;

			console.log(bandwidths);
			DOMUtils.getElementById('chartContainer').innerHTML = "";

			// We are going to generate a chart for each layer, X is the time, Y is the number of nodes for each type
			for (let layer of input.layers) {
				let highestNodeCount = 0;

				const preparedData: Array<{ bandwidth: number, datapoints: Array<{ timestamp: number, nodeCount: number }> }> = [];
				const objHolder: { [number]: Array<{ timestamp: number, nodeCount: number }> } = {};
				const bandwidthsTmp = bandwidths.slice();
				bandwidthsTmp.map(value => {
					objHolder[value] = [];
				});

				// Iterate through all events
				for (const eventIndex in input.data) {
					const event = input.data[eventIndex];

					const eventTimestamp = event.metadata.timestamp;
					timestampsSet.add(eventTimestamp - initialTimestamp);

					const targetLayer = event.layerArray[layerIndex];

					if (!targetLayer) {
						console.log("Current event doesn't have the layer we are searching for. Event: " + eventIndex + ", Layer: " + layer + ", Layer Index: " + layerIndex);
						// Current event doesn't have the layer we are searching for
						continue;
					}

					// Discard last layer (unconnected nodes)
					if (targetLayer.metadata.lastLayer) {
						continue;
					}

					// Collect the number of nodes of each type in this layer
					for (const bandwidthStr of bandwidthsTmp) {
						const bandwidthNodeCount = targetLayer[bandwidthStr];

						// Push datapoint
						const timestamp = eventTimestamp - initialTimestamp;

						objHolder[bandwidthStr].push({timestamp: timestamp, nodeCount: bandwidthNodeCount});
						if (bandwidthNodeCount > highestNodeCount) {
							highestNodeCount = bandwidthNodeCount;
						}
						if (timestamp > lastTimestamp) {
							lastTimestamp = timestamp;
						}
					}
				}
				for (const bandwidthStr of bandwidthsTmp) {
					preparedData.push({bandwidth: bandwidthStr, datapoints: objHolder[bandwidthStr]});
				}

				if (!layerChartDataObj.hasOwnProperty(inputId)) {
					layerChartDataObj[inputId] = {};
				}
				layerChartDataObj[inputId][layer] = {
					bandwidthsTmp: bandwidthsTmp,
					highestNodeCount: highestNodeCount,
					lastTimestamp: lastTimestamp,
					preparedData: preparedData
				};

				layerIndex++;
			}

			// Generate unconnected nodes layer (last layer)
			{
				layerIndex = 0;
				let highestNodeCount = 0;

				const preparedData: Array<{ bandwidth: number, datapoints: Array<{ timestamp: number, nodeCount: number }> }> = [];
				const objHolder: { [number]: Array<{ timestamp: number, nodeCount: number }> } = {};
				const bandwidthsTmp = bandwidths.slice();
				bandwidthsTmp.map(value => {
					objHolder[value] = [];
				});


				// Iterate through all events
				for (const eventIndex in input.data) {
					const event = input.data[eventIndex];

					const eventTimestamp = event.metadata.timestamp;
					timestampsSet.add(eventTimestamp - initialTimestamp);

					const targetLayer = event.layerArray[event.layerArray.length - 1];

					// Collect the number of nodes of each type in this layer
					for (const bandwidthStr of bandwidthsTmp) {
						const bandwidthNodeCount = targetLayer[bandwidthStr];

						// Push datapoint
						const timestamp = eventTimestamp - initialTimestamp;

						objHolder[bandwidthStr].push({timestamp: timestamp, nodeCount: bandwidthNodeCount});
						if (bandwidthNodeCount > highestNodeCount) {
							highestNodeCount = bandwidthNodeCount;
						}
						if (timestamp > lastTimestamp) {
							lastTimestamp = timestamp;
						}
					}
				}
				for (const bandwidthStr of bandwidthsTmp) {
					preparedData.push({bandwidth: bandwidthStr, datapoints: objHolder[bandwidthStr]});
				}

				if (!layerChartDataObj.hasOwnProperty(inputId)) {
					layerChartDataObj[inputId] = {};
				}
				layerChartDataObj[inputId]["Unconnected nodes"] = {
					bandwidthsTmp: bandwidthsTmp,
					highestNodeCount: highestNodeCount,
					lastTimestamp: lastTimestamp,
					preparedData: preparedData
				};
			}

			console.log(timestampsSet);
		}

		console.log(layerChartDataObj);
		// Lets take the average results
		const layerHolder = {};
		const inputLength = Object.keys(layerChartDataObj).length;
		for (const [inputId, layerChartObj] of Object.entries(layerChartDataObj)) {
			for (const [layer, layerChartData] of Object.entries(layerChartObj)) {
				if (!layerHolder.hasOwnProperty(layer)) layerHolder[layer] = [];
				layerHolder[layer].push(layerChartData);
				console.log(layer, layerChartData);
				//GLCharts.generateChartForLayer(layer, layerChartData.bandwidthsTmp, input[0].colorMap, layerChartData.highestNodeCount, layerChartData.lastTimestamp, layerChartData.preparedData);
			}
		}

		console.log(layerChartDataObj);
		for (const [layer, layerChartDataArray] of Object.entries(layerHolder)) {
			console.log("layerHolder", layerHolder);
			// Get the longest experiment in the set
			let index = 0;
			let selectedIndex = 0;
			let highest = 0;

			// Get the longest experiment as base
			for (const layerChartData of layerChartDataArray) {
				for (const chartLine of layerChartData.preparedData) {
					if (chartLine.datapoints.length > highest) {
						highest = chartLine.datapoints.length;
						selectedIndex = index;
					}
				}
				index++;
			}
			const tmpTotalObject = layerChartDataArray[selectedIndex];
			layerChartDataArray.splice(selectedIndex, 1);
			for (const layerChartData of layerChartDataArray) {
				if (layerChartData.highestNodeCount > tmpTotalObject.highestNodeCount) tmpTotalObject.highestNodeCount = layerChartData.highestNodeCount;
				let i = 0;
				for (const chartLine of layerChartData.preparedData) {
					const {bandwidth, datapoints} = chartLine;
					let j = 0;
					for (const {timestamp, nodeCount} of datapoints) {
						tmpTotalObject.preparedData[i].datapoints[j++].nodeCount += nodeCount;
					}
					i++;
				}
			}

			for (const chartLine of tmpTotalObject.preparedData) {
				for (let obj of chartLine.datapoints) {
					obj.nodeCount /= inputLength;
				}
			}

			GLCharts.generateChartForLayer(layer, tmpTotalObject.bandwidthsTmp, inputArray[0].colorMap, tmpTotalObject.highestNodeCount, tmpTotalObject.lastTimestamp, tmpTotalObject.preparedData);

			this.postProcessedData[layer] = {};

			// Simplify output
			for (const bandwidthData of tmpTotalObject.preparedData) {
				this.postProcessedData[layer][this.peerClassificationName[bandwidthData.bandwidth]] = bandwidthData.datapoints;
			}
		}
		Utils.saveStringAsFile(JSON.stringify(this.postProcessedData), "layer.pp.output.json", "text/json");
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
		// Create holding div
		const div = document.createElement("div");
		div.setAttribute("id", chartName);

		const p = document.createElement("p");
		p.innerHTML = layer;
		div.append(p);
		DOMUtils.getElementById("chartContainer").append(div);


		const margin = {top: 10, right: 30, bottom: 30, left: 60};
		const width = 1100 - margin.left - margin.right;
		const height = 700 - margin.top - margin.bottom;

		// Define scales
		const xScale = d3.scaleLinear().range([0, width]);
		const yScale = d3.scaleLinear().range([height, 0]);

		// Define axes
		const xAxis = d3.axisBottom().scale(xScale);
		const yAxis = d3.axisLeft().scale(yScale);

		// Define lines
		const line = d3
			.line()
			.curve(d3.curveBasis)
			.x(function (d) {
				return xScale(d.timestamp);
			})
			.y(function (d) {
				return yScale(d.nodeCount);
			});

		// Define svg canvas
		const svg = d3
			.select(`#${chartName}`)
			.append("svg")
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

		const aux = svg
			.selectAll(".bandwitdh")
			.data(data)
			.enter()
			.append("g")
			.attr("class", "bandwitdh");

		aux
			.append("path")
			.attr("class", "line")
			.attr("d", function (d) {
				return line(d.datapoints);
			})
			.style("stroke", function (d) {
				return colorMap[d.bandwidth];
			});
	}
}

export default GLCharts;

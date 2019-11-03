import type { PartnerOutputLog } from "../../types";
import DOMUtils from "../../web/js/DOM/Utils";
import * as d3 from "d3";

type PChartPreparedData = { bandwidth: number, datapoints: Array<{ timestamp: number, nodeCount: number }> };

class PartnerCharts {
	static generateGraphics(input: PartnerOutputLog) {
		// The last databender...

		// Fix timestamp
		const initialTimestamp = input.data["0"].metadata.timestamp;
		for (let obj of Object.values(input.data)){
			obj.metadata.timestamp -= initialTimestamp;
		}

		const lastEventIndex = Math.max(...Object.keys(input.data).map(Number));
		const lastTimestamp = input.data[lastEventIndex].metadata.timestamp;

		function generateHolderDiv(bandwidth, type) {
			const divHolder = document.createElement("div");
			divHolder.setAttribute("id", "chart_" + bandwidth + "_" + type);
			const p = document.createElement("p");
			p.innerHTML = "Bandwidth " + bandwidth + " " + type + " partners";
			divHolder.append(p);
			DOMUtils.getElementById("chartContainer").append(divHolder);
			return divHolder;
		}

		// For each bandwidth, draw its chart
		for (const bandwidth of input.bandwidths) {
			const prepDataIncoming: Array<PChartPreparedData> = [];
			const prepDataOutgoing: Array<PChartPreparedData> = [];
			let highestIncomingCountValue = 0;
			let highestOutgoingCountValue = 0;
			for (const itBandwidth of input.bandwidths) {
				const appendableIncomingObj: PChartPreparedData = { bandwidth: itBandwidth, datapoints: [] };
				const appendableOutgoingObj: PChartPreparedData = { bandwidth: itBandwidth, datapoints: [] };
				for (const event of Object.values(input.data)) {
					const currTimestamp = event.metadata.timestamp;
					const countIncoming = event.bandwidths[bandwidth].incoming[itBandwidth];
					const countOutgoing = event.bandwidths[bandwidth].outgoing[itBandwidth];

					appendableIncomingObj.datapoints.push({timestamp: currTimestamp, nodeCount: countIncoming});
					appendableOutgoingObj.datapoints.push({timestamp: currTimestamp, nodeCount: countOutgoing});
					if(countIncoming > highestIncomingCountValue)
						highestIncomingCountValue = countIncoming;

					if(countOutgoing > highestOutgoingCountValue)
						highestOutgoingCountValue = countOutgoing;
				}
				prepDataIncoming.push(appendableIncomingObj);
				prepDataOutgoing.push(appendableOutgoingObj)
			}

			this.drawChartForBandwidth(bandwidth, input.colorMap, lastTimestamp, "incoming", generateHolderDiv(bandwidth, "incoming"), highestIncomingCountValue, prepDataIncoming);
			this.drawChartForBandwidth(bandwidth, input.colorMap, lastTimestamp, "outgoing", generateHolderDiv(bandwidth, "outgoing"), highestOutgoingCountValue, prepDataOutgoing);
		}
	}

	static drawChartForBandwidth(
		bandwidth: number,
		colorMap: { [number]: string },
		lastTimestamp: number,
		type: "incoming" | "outgoing",
		elHolder: HTMLElement,
		highestYValue: number,
		data: PChartPreparedData
	) {
		console.log(type, bandwidth, data);

		const margin = { top: 10, right: 30, bottom: 30, left: 60 };
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
			.curve(d3.curveLinear)
			.x(function(d) {
				return xScale(d.timestamp);
			})
			.y(function(d) {
				return yScale(d.nodeCount);
			});

		// Define svg canvas
		const svg = d3
			.select(`#${elHolder.getAttribute("id")}`)
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		// Set the domain of the axes
		xScale.domain([0, lastTimestamp]);

		yScale.domain([0, highestYValue]);

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
			.attr("d", function(d) {
				return line(d.datapoints);
			})
			.style("stroke", function(d) {
				return colorMap[d.bandwidth];
			});
	}
}

export default PartnerCharts;

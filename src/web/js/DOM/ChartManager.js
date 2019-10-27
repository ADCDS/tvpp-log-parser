// @flow
import * as d3 from "d3";
import Variables from "./Variables";
import type { ChartDefType } from "../../../types";
import DOMUtils from "./Utils";

class ChartManager {
	static async drawCharts(charts: Array<ChartDefType>) {
		return new Promise(resolve => {
			const chartHolderEl = DOMUtils.getElementById("chartsHolder");
			chartHolderEl.innerHTML = "";
			let i = 0;
			for (const chart of charts) {
				const chartHolder = document.createElement("div");
				chartHolder.id = `chart_${i++}`;
				chartHolderEl.appendChild(chartHolder);
				const cbFunc = chart.class.drawFunction;
				cbFunc(chartHolder, chart.name, chart.class.generateGraphInput({ sigma: Variables.selectedSigma }));
			}
			resolve();
		});
	}

	static async drawTexts(element: HTMLElement, chartName: string, data: Array<{ name: string, value: string }>) {
		element.innerHTML = "";
		for (const val of data.values()) {
			const p = document.createElement("p");
			const small = document.createElement("small");
			const b = document.createElement("b");
			b.innerHTML = `${val.name}: `;
			const span2 = document.createElement("span");
			span2.innerHTML = val.value;

			small.appendChild(b);
			small.appendChild(span2);
			p.appendChild(small);

			element.appendChild(p);
		}
	}

	static async drawGroupedBarChart(
		element: HTMLElement,
		chartName: string,
		input: {
			data: {
				metadata: {
					timestamp: number
				},
				layerArray: Array<{
					metadata: {
						name: string
					},
					[string]: number
				}>
			},
			colorMap: {
				[number]: string
			}
		}
	) {
		element.innerHTML = "";
		const margin = { top: 20, right: 30, bottom: 30, left: 40 };
		const width = 600 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		const svg = d3
			.select(`#${element.id}`)
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);
		const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);


		const inputData = input.data.layerArray;
		const keys = Object.keys(inputData[0])
			.filter(value => value !== "metadata")
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
		for (const layer of inputData) {
			// eslint-disable-next-line flowtype-errors/show-errors
			const max = Math.max(...Object.values(layer).filter(value => !Number.isNaN(Number(value))));
			if (max > highestYValue) {
				highestYValue = max;
			}
		}

		x0.domain(
			inputData.map((d: { metadata: {name: string } }) => {
				return d.metadata.name;
			})
		);
		x1.domain(keys).rangeRound([0, x0.bandwidth()]);
		y.domain([0, highestYValue]).nice();

		g.append("g")
			.selectAll("g")
			.data(inputData)
			.enter()
			.append("g")
			.attr("class", "bar-group")
			.attr("transform", (d: { metadata: {name: string } }) => {
				return `translate(${x0(d.metadata.name)},0)`;
			})
			.selectAll("rect")
			.data(d => {
				return keys.map((key: string) => {
					return { key, value: d[key] };
				});
			})
			.enter()
			.append("rect")
			.attr("class", "bar")
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
				return input.colorMap[Number(d.key)];
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
			.text(chartName);

		g.append("g")
			.selectAll(".bar-group")
			.data(inputData)
			.enter()
			.append("g")
			.attr("class", "bar-group")
			.attr("transform", (d: { metadata: {name: string } }) => {
				return `translate(${x0(d.metadata.name)},0)`;
			})
			.selectAll("text.bar")
			.data(d => {
				return keys.map((key: string) => {
					return { key, value: d[key] };
				});
			})
			.enter()
			.append("text")
			.attr("class", "text-bar")
			.attr("font-family", "sans-serif")
			.attr("font-size", 10)
			.attr("text-anchor", "middle")
			.attr("dy", "0.1em")
			.attr("x", (d: { key: * }) => {
				return x1(d.key) + x1.bandwidth() / 2;
			})
			.attr("y", (d: { value: * }) => {
				return y(d.value) - 5;
			})
			.text((d: { value: * }) => {
				return d.value;
			});

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
				return input.colorMap[Number(d)];
			})
			.attr("stroke", (d: number) => {
				return input.colorMap[Number(d)];
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

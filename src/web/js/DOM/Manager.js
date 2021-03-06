// @flow
import Utils from "../../../utils";
import Filter from "../../../parserLib/Graph/Filter/Filter";
import LogParserOverlay from "../../../parserLib/Log/Overlay/LogParserOverlay";
import LogParserPerformance from "../../../parserLib/Log/Performance/LogParserPerformance";
import ComparisionLayout from "../../../parserLib/Graph/Visualizer/Layout/ComparisionLayout";
import UserOption from "../../../parserLib/UserOption";
import Node from "../../../parserLib/Graph/Visualizer/Node";
import DOMUtils from "./Utils";
import Variables from "./Variables";
import SigmaInjection from "../SigmaInjection";
import type {ChartDefType, FilterLayoutOptions, GLChartOutputType, Sigma} from "../../../types";
import HandleHolder from "./HandleHolder";
import TreeFilterResult from "../../../parserLib/Graph/Filter/Results/TreeFilterResult";

type OptionValueTypes = Class<String> | Class<Number> | Class<Boolean>;

class Manager {
	static init(): void {
		// Show starting options

		// Get available layouts and filters
		const availableFilters = Utils.filters;
		const availableLayouts = Utils.layouts;

		const filterTypeDOM = DOMUtils.getGenericElementById<HTMLSelectElement>("filterType");
		const layoutTypeDOM = DOMUtils.getGenericElementById<HTMLSelectElement>("layoutType");

		const availableFiltersKeys = Object.keys(availableFilters);
		availableFiltersKeys.forEach(el => {
			const value = availableFilters[el];
			const optionEl = document.createElement("option");
			optionEl.text = value.name;
			optionEl.value = value.id;

			filterTypeDOM.add(optionEl);
		});

		const availableLayoutsKeys = Object.keys(availableLayouts);
		availableLayoutsKeys.forEach(index => {
			const value = availableLayouts[index];
			const optionEl = document.createElement("option");
			optionEl.text = value.name;
			optionEl.value = value.id;

			layoutTypeDOM.add(optionEl);
		});

		// Select default elements
		filterTypeDOM.value = availableFilters[availableFiltersKeys[0]].id;
		filterTypeDOM.dispatchEvent(new Event("change"));

		layoutTypeDOM.value = availableLayouts[availableLayoutsKeys[0]].id;
		layoutTypeDOM.dispatchEvent(new Event("change"));

		DOMUtils.getElementById("btnCurrentState").dispatchEvent(new Event("click"));
		DOMUtils.getElementById("disableEdges").click();
	}

	static getInputFromOption(inputId: string, option: UserOption<any>): string {
		if (!option.isFilter()) {
			// If we are not dealing with a filter
			const inputType = Manager.getInputType((option.type: OptionValueTypes));

			return `<label for='${inputId}'>${option.name}</label><input id ='${inputId}' type='${inputType}' ${Manager.getDefaultAttr(option.type, option.default)}>`;
		}
		// If we area dealing with a filter option

		// Get all filters that we can use
		const availableFilters = Utils.getFiltersByType(option.type);
		let res = "<div class='layoutSubFilter'>";
		res += `<label for='${inputId}'>Edge Sub Filter</label><select id='${inputId}'>`;
		availableFilters.forEach(value => {
			res += `<option value='${value.id}'>${value.name}</option>`;
		});
		res += "</select>";

		// Generate sub filter config option
		// Default filter
		Variables.selectedLayoutFilter = availableFilters[0];
		const filter = Variables.selectedLayoutFilter;
		res += "<div id='subFilterOptionsHolder'>";
		res += Manager.generateOptionsForm("subFilterOptions", filter.class.getOptions());
		res += "</div></div>";
		return res;
	}

	static parseInputValue(configType: OptionValueTypes, element: HTMLInputElement): string | number | boolean {
		const {value} = element;
		if (configType === String) return String(value);
		if (configType === Number) return Number(value);
		if (configType === Boolean) return element.checked;
		if (configType === File) return Utils.readJsonFile(element.files[0]);

		// eslint-disable-next-line flowtype-errors/show-errors
		if (configType.prototype instanceof Filter || configType === Filter) {
			const layoutFilterFormHolderId = "subFilterOptions";
			// eslint-disable-next-line flowtype-errors/show-errors
			return Manager.getOptions(layoutFilterFormHolderId, Variables.selectedLayoutFilter.class.getOptions());
		}
		throw new Error(`Invalid configType`);
	}

	static getInputType(configType: OptionValueTypes): string {
		if (configType === String) return "text";
		if (configType === Number) return "number";
		if (configType === Boolean) return "checkbox";
		if (configType === File) return "file";

		throw new Error(`Invalid configType`);
	}

	static getDefaultAttr(configType: OptionValueTypes, defaultValue: any): string {
		if (configType === Boolean) {
			if (defaultValue === true) {
				return "checked = 'checked'";
			}
			return "";
		}
		if (configType === String || configType === Number) {
			return `value = '${defaultValue}'`;
		}
		if(configType === File){
			return "";
		}
		throw new Error(`Invalid configType`);
	}

	static generateOptionsForm(formHolderId: string, options: { [string]: UserOption<any> }): string {
		Variables.sourceOptions[formHolderId] = [];

		let resHTML = "";
		Object.keys(options).forEach(el => {
			const option = options[el];

			const inputId = `_main${formHolderId}_${el}`;
			if (option.default === "::src") {
				Variables.sourceOptions[formHolderId].push(inputId);
			}
			resHTML += Manager.getInputFromOption(inputId, option);
		});
		return resHTML;
	}

	static syncMachinesList(): void {
		let resHTML = "";
		DOMUtils.getElementById("machineListTable").innerHTML = "";
		let i = 1;
		for (const value of window.logEntity.machines.values()) {
			resHTML += `<tr id="machRow_${value.address}" data-addr="${value.address}"><td>${i++}</td><td>${value.address}</td><td id="machClassification_${
				value.address
			}">${value.bandwidthClassification}</td><td>
<button data-type="in">In</button>
<button data-type="out">Out</button>
</td></tr>`;
		}
		DOMUtils.getElementById("machineListTable").innerHTML = resHTML;
	}

	static updateClassifications(): void {
		for (const value of window.logEntity.machines.values()) {
			try {
				const element = DOMUtils.getElementById(`machClassification_${value.address}`);
				element.innerHTML = value.bandwidthClassification;
			} catch (e) {
				console.log(`Machine ${value.address} appears on Perfomance Log but doesn't appear mainly at Overlay Log, removing it from the map`);
				// Removing it from the machines map
				window.logEntity.machines.delete(value.address);
			}
		}
	}

	static updateDefaultsOptionValues(): void {
		["filterOptions", "layoutOptions", "subFilterOptions"].forEach(optionType => {
			Variables.sourceOptions[optionType].forEach((value, index) => {
				const el = DOMUtils.getGenericElementById<HTMLInputElement>(value);
				if (!el) {
					Variables.sourceOptions[optionType].splice(index, 1);
					return;
				}
				if (window.logEntity.sourceMachineKey !== "" && el.value === "::src") {
					el.value = window.logEntity.sourceMachineKey;
				}
			});
		});
	}

	static async parseOverlayLog(e: Event, filename: string) {
		if (!(e.currentTarget instanceof FileReader) || !(typeof e.currentTarget.result === "string")) throw new Error("Invalid type");

		Variables.overlayLogLines = e.currentTarget.result.split("\n");
		const entryArray = await LogParserOverlay.parse(Variables.overlayLogLines);
		console.log(`Parsed ${entryArray.length} lines from overlay log`);
		window.logEntity.addOverlayEntries(entryArray);
		window.logEntity.overlayFileName = filename;

		window.graphManager.syncMachines();
		DOMUtils.getGenericElementById<HTMLInputElement>("numberOfEvents").value = window.logEntity.sourceApparitionLocations.length;
		DOMUtils.getGenericElementById<HTMLInputElement>("numberOfNodes").value = Object.keys(window.logEntity.machines).length.toString();
		Manager.syncMachinesList();

		// Update defaults ::src
		Manager.updateDefaultsOptionValues();
	}

	static async parsePerformanceLog(e: Event, filename: string) {
		console.log("Performance log read.");
		if (!(e.currentTarget instanceof FileReader) || !(typeof e.currentTarget.result === "string")) throw new Error("Invalid type");
		const entryArray = await LogParserPerformance.parse(e.currentTarget.result.split("\n"));
		console.log(`Parsed ${entryArray.length} lines from performance log`);
		window.logEntity.addPerformanceEntries(entryArray);
		window.logEntity.performanceFileName = filename;

		Manager.updateClassifications();
	}

	static getOptions(formHolderId: string, options: { [string]: UserOption<any> }): FilterLayoutOptions {
		const resObj = {};
		Object.keys(options).forEach(el => {
			const option = options[el];
			const inputId = `_main${formHolderId}_${el}`;
			const element = DOMUtils.getGenericElementById<HTMLInputElement>(inputId);
			resObj[el] = Manager.parseInputValue(option.type, element);
		});
		return resObj;
	}

	static synchronizeSigma(sigma: { [string]: any, helperHolder: SigmaInjection }): void {
		const graphHolder = sigma.helperHolder.graphHolder.filtered;
		const unfilteredGraphHolder = sigma.helperHolder.graphHolder.original;
		const {nodeHolder} = sigma.helperHolder;
		const {edgesHolder} = sigma.helperHolder;
		const {byPassInNodes} = sigma.helperHolder;
		const {byPassOutNodes} = sigma.helperHolder;

		sigma.graph.clear();

		// Add nodes
		for (const node of nodeHolder.values()) {
			sigma.graph.addNode(node);
		}

		// Add edges
		if (!Variables.disableEdges) {
			for (const machineKey of nodeHolder.keys()) {
				const edgesTo = graphHolder.getOutgoingEdges(machineKey);
				edgesTo.forEach(machineDest => {
					// const sourceNodeColor = DOMUtils.hexToRgbA(nodeHolder.get(machineKey).color);
					// console.log(sourceNodeColor + " snc");
					const edge: { color?: ?string } = {
						id: `${machineKey}_>_${machineDest}`,
						source: machineKey,
						target: machineDest,
						size: 1,
						type: "arrow",
						color: "black"
					};
					const edgesFrom = edgesHolder.get(machineKey);
					if (edgesFrom) {
						const edgeObj = edgesFrom.get(machineDest);
						if (edgeObj) {
							Object.assign(edge, edgeObj.toObject());
						}
					}
					try {
						sigma.graph.addEdge(edge);
					} catch (e) {
						console.log(`Sigma exception: ${e}`);
					}
				});
			}
		}

		// Update bypasses
		byPassOutNodes.forEach(machineKey => {
			const edgesTo = unfilteredGraphHolder.getOutgoingEdges(machineKey);
			edgesTo.forEach(machineDest => {
				const edge: { color?: ?string } = {
					id: `${machineKey}_>_${machineDest}`,
					source: machineKey,
					target: machineDest,
					size: 2,
					type: "arrow"
				};
				const edgeFrom = edgesHolder.get(machineKey);

				if (edgeFrom) {
					const edgeFinal = edgeFrom.get(machineDest);
					if (edgeFinal) {
						Object.assign(edge, edgeFinal.toObject());
					}
				}
				try {
					sigma.graph.addEdge(edge);
				} catch (e) {
					console.log(`Sigma exception: ${e}`);
				}
			});
		});

		// Update bypasses
		byPassInNodes.forEach(machineTo => {
			// Get the edges that point to me
			const edgesTo = unfilteredGraphHolder.getNodesThatPointTo(machineTo);
			edgesTo.forEach(machineFrom => {
				const edge: { color?: ?string } = {
					id: `${machineFrom}_>_${machineTo}`,
					source: machineFrom,
					target: machineTo,
					size: 2,
					type: "arrow"
				};

				const edgeFrom = edgesHolder.get(machineFrom);
				if (edgeFrom) {
					const edgeFinal = edgeFrom.get(machineTo);
					if (edgeFinal) {
						Object.assign(edge, edgeFinal.toObject());
					}
				}
				try {
					sigma.graph.addEdge(edge);
				} catch (e) {
					console.log(`Sigma exception: ${e}`);
				}
			});
		});

		sigma.refresh();
	}

	static extractOptions(): { filter: FilterLayoutOptions, layout: FilterLayoutOptions, charts: Array<ChartDefType> } {
		const filterFormHolderId = "filterOptions";
		const selectedFilter = Variables.selectedFilter;
		const selectedLayout = Variables.selectedLayout;

		if (!selectedFilter) throw new Error("No filter was selected");

		if (!selectedLayout) throw new Error("No layout was selected");

		const filterOptions = Manager.getOptions(filterFormHolderId, selectedFilter.class.getOptions());
		const layoutFormHolderId = "layoutOptions";
		const layoutOptions = Manager.getOptions(layoutFormHolderId, selectedLayout.class.getOptions());

		const selectedCharts = [];

		if (!Variables.selectedLayoutFilter) throw new Error("Layout filter not selected");
		const availableCharts = Utils.getChartsByFilterConstraintType(Variables.selectedLayoutFilter.type);
		for (const chartsDef of availableCharts) {
			const optEl = DOMUtils.getGenericElementById<HTMLInputElement>(chartsDef.id);

			if (optEl.checked) {
				selectedCharts.push(chartsDef);
			}
		}

		return {
			filter: filterOptions,
			layout: layoutOptions,
			charts: selectedCharts
		};
	}

	static synchronizeMachineListButtons(oldSigma: Sigma, newSigma: Sigma): void {
		const oldButtons = oldSigma.helperHolder.managedButtons;
		oldButtons.forEach(button => {
			button.style.borderStyle = "";
		});

		const newButtons = newSigma.helperHolder.managedButtons;
		newButtons.forEach(button => {
			button.style.borderStyle = "inset";
		});
	}

	static changeSelectedNode(node: Node): void {
		if (Variables.selectedNode) {
			DOMUtils.getElementById(`machRow_${Variables.selectedNode.id}`).classList.remove("active");
		}
		Variables.selectedNode = node;
		const elementById = DOMUtils.getElementById(`machRow_${node.id}`);
		elementById.scrollIntoView({block: "nearest", inline: "start"});
		elementById.classList.add("active");
	}

	static async drawGraph(filterOptions: FilterLayoutOptions, layoutOptions: FilterLayoutOptions, goToState: Number, byTimestamp: boolean = false) {
		if (!Variables.selectedFilter) throw new Error("Filter not selected");
		if (!Variables.selectedLayout) throw new Error("Layout not selected");
		if (!Variables.selectedLayoutFilter) throw new Error("Layout subfilter not selected not selected");
		if (!Variables.selectedLayoutFilter) throw new Error("Layout Options missing subfilter");

		const FilterClass = Variables.selectedFilter.class;
		const LayoutClass = Variables.selectedLayout.class;
		const LayoutFilterClass = Variables.selectedLayoutFilter.class;

		const {graphManager} = window;

		const lastEventIndex = graphManager.currentEventIndex;
		// We should store the last state on 'Previous Graph'

		DOMUtils.getGenericElementById<HTMLInputElement>("previousEvent").value = lastEventIndex;
		DOMUtils.getElementById("previousStateEventId").innerHTML = `(${lastEventIndex})`;

		if (!Variables.isFirstIteration) {
			window.sigmaPrevious.helperHolder.nodeHolder = window.sigmaCurrent.helperHolder.nodeHolder;
			window.sigmaPrevious.helperHolder.edgesHolder = window.sigmaCurrent.helperHolder.edgesHolder;
			window.sigmaPrevious.helperHolder.graphHolder = {
				...window.sigmaCurrent.helperHolder.graphHolder
			};
			window.sigmaPrevious.helperHolder.layoutSubFilter = window.sigmaCurrent.helperHolder.layoutSubFilter;
			window.sigmaPrevious.helperHolder.usedLayout = window.sigmaCurrent.helperHolder.usedLayout;
			if (!Variables.layoutPreservation) {
				Manager.synchronizeSigma(window.sigmaPrevious);
			}
			DOMUtils.getGenericElementById<HTMLInputElement>("previousEventTime").value = new Date(graphManager.getCurrentTimestamp() * 1000).toString();
			DOMUtils.getGenericElementById<HTMLInputElement>("previousEventElapsedTime").value = graphManager.getCurrentElapsedTime();
		}

		if (!byTimestamp) {
			graphManager.goToAbsoluteServerApparition(goToState);
		} else {
			graphManager.goToClosestTimeElapsedServerApparition(goToState);
		}
		const graphHolder = graphManager.getGraphHolder();
		if (!window.sigmaCurrent.helperHolder.graphHolder) {
			window.sigmaCurrent.helperHolder.graphHolder = {
				original: graphHolder,
				filtered: null
			};
		} else {
			window.sigmaCurrent.helperHolder.graphHolder.original = graphHolder;
		}

		// Apply layout filter
		const subFilterObj = new LayoutFilterClass(layoutOptions.filter);
		const subFilterResult = await subFilterObj.applyFilter(graphHolder);
		const layoutObj = new LayoutClass(subFilterResult, graphManager.getMachines(), layoutOptions);
		layoutObj.updateNodeColors();
		layoutObj.updatePositions();
		window.sigmaCurrent.helperHolder.edgesHolder = layoutObj.edgesOverride;
		window.sigmaCurrent.helperHolder.layoutSubFilter = subFilterResult;
		window.sigmaCurrent.helperHolder.usedLayout = layoutObj;

		if (!Variables.isFirstIteration && Variables.layoutPreservation) {
			// Previous Sigma's nodes should have the same position as the Current Sigma
			Object.keys(window.sigmaPrevious.helperHolder.nodeHolder).forEach(index => {
				const node = window.sigmaPrevious.helperHolder.nodeHolder.get(index);
				if (!node) throw new Error("Node not found");

				const currentNode = layoutObj.nodeHolder.get(index);
				if (currentNode) {
					node.x = currentNode.x;
					node.y = currentNode.y;
				}
			});
			Manager.synchronizeSigma(window.sigmaPrevious);
		}

		// Apply filter
		let filterResult;
		// We do not need to apply the same filter twice, if they are the same
		if (LayoutFilterClass === FilterClass && JSON.stringify(layoutOptions.filter) === JSON.stringify(filterOptions)) {
			filterResult = subFilterResult;
			console.log("Main filter and Layout filter are the same, reusing result...");
		} else {
			const filterObj = new FilterClass(filterOptions);
			filterResult = await filterObj.applyFilter(graphHolder);
		}
		window.sigmaCurrent.helperHolder.graphHolder.filtered = filterResult.graphHolder;

		// Apply comparision layout
		if (!Variables.isFirstIteration) {
			const comparisionLayout = new ComparisionLayout(
				window.sigmaCurrent.helperHolder.layoutSubFilter,
				window.sigmaPrevious.helperHolder.layoutSubFilter,
				graphManager.getMachines(),
				{}
			);
			comparisionLayout.nodeHolder = layoutObj.cloneNodeHolder();
			comparisionLayout.updatePositions();
			window.sigmaComparision.helperHolder.nodeHolder = comparisionLayout.nodeHolder;
			window.sigmaComparision.helperHolder.edgesHolder = comparisionLayout.edgesOverride;
			window.sigmaComparision.helperHolder.graphHolder = window.sigmaCurrent.helperHolder.graphHolder;
			window.sigmaComparision.helperHolder.usedLayout = comparisionLayout;

			Manager.synchronizeSigma(window.sigmaComparision);
		}

		window.sigmaCurrent.helperHolder.nodeHolder = layoutObj.nodeHolder;
		Manager.synchronizeSigma(window.sigmaCurrent);

		DOMUtils.getGenericElementById<HTMLInputElement>("currentEvent").value = graphManager.currentEventIndex;
		DOMUtils.getElementById("currentStateEventId").innerHTML = `(${graphManager.currentEventIndex})`;
		DOMUtils.getElementById("comparisionStateEventId").innerHTML = `(${lastEventIndex}/${graphManager.currentEventIndex})`;
		DOMUtils.getGenericElementById<HTMLInputElement>("currentEventTime").value = new Date(graphManager.getCurrentTimestamp() * 1000).toString();
		DOMUtils.getGenericElementById<HTMLInputElement>("currentEventElapsedTime").value = graphManager.getCurrentElapsedTime();
		DOMUtils.getGenericElementById<HTMLInputElement>("selectedEventNumber").value = window.selectedEvent = graphManager.currentSourceIndex;

		Variables.isFirstIteration = false;
	}

	static displayAllToRelations(node: string, sigma: Sigma): void {
		sigma.helperHolder.byPassOutNodes.push(node);
		Manager.synchronizeSigma(sigma);
	}

	static displayAllFromRelations(node: string, sigma: Sigma): void {
		sigma.helperHolder.byPassInNodes.push(node);
		Manager.synchronizeSigma(sigma);
	}

	static hideAllToRelations(node: string, sigma: Sigma): void {
		sigma.helperHolder.byPassOutNodes.splice(sigma.helperHolder.byPassOutNodes.indexOf(node), 1);
		Manager.synchronizeSigma(sigma);
	}

	static hideAllFromRelations(node: string, sigma: Sigma): void {
		sigma.helperHolder.byPassInNodes.splice(sigma.helperHolder.byPassInNodes.indexOf(node), 1);
		Manager.synchronizeSigma(sigma);
	}

	static async goToEventAndDraw(eventIndex: number) {
		if (eventIndex > window.logEntity.sourceApparitionLocations.length || eventIndex < 0) throw new Error("Invalid index");

		const eventNumberDOM = DOMUtils.getGenericElementById<HTMLInputElement>("selectedEventNumber");
		eventNumberDOM.value = eventIndex.toString();

		eventNumberDOM.dispatchEvent(new Event("change"));
		return HandleHolder.handleDrawByEvent();
	}

	static generateChartOptions(charts: Array<ChartDefType>): void {
		const ul = DOMUtils.getElementById("chartList");
		ul.innerHTML = "";
		for (const chartDefs of charts) {
			const chartId = chartDefs.id;
			const li = document.createElement("li");
			const label = document.createElement("label");
			label.innerHTML = chartDefs.name;
			label.htmlFor = chartId;
			const input = document.createElement("input");
			input.id = chartId;
			input.type = "checkbox";
			input.checked = true;

			label.appendChild(input);
			li.appendChild(label);

			ul.appendChild(li);
		}
	}

	static extractOverlayLog(startLine: number, lastLine: number): void {
		const evaluatedLines = Variables.overlayLogLines.splice(startLine, lastLine);
		const link = document.createElement("a");
		link.setAttribute("href", `data:application/octet-stream;base64,${btoa(evaluatedLines.join("\n"))}`);
		link.setAttribute("download", `${startLine}-${lastLine}.txt`);
		link.click();
		// console.log(evaluatedLines);
	}

	static downloadLayerLog() {
		const output: GLChartOutputType = {
			layers: Array.from(Variables.layersFound),
			colorMap: Variables.colorMap,
			data: Variables.outputGroupChartData
		};

		Utils.saveStringAsFile(JSON.stringify(output), "layer.output.json", "text/json");
	}

	static generatePeerChurnAnalysis() {
		const perfomanceEntries = window.logEntity.performanceEntryList;

		const source = window.logEntity.sourceMachineKey;
		// For each entry, create a set of known NODES.

		const arrSets = [];

		let i = -1;
		perfomanceEntries.forEach(perfomanceEntry => {
			if (perfomanceEntry.machineId === source) {
				arrSets.push({timestamp: perfomanceEntry.bootTime, set: new Set(), entries: {}});
				i++;
			}
			arrSets[i].set.add(perfomanceEntry.machineId);
			arrSets[i].entries[perfomanceEntry.machineId] = perfomanceEntry;
		});

		// console.log(arrSets);

		const outObj = {};
		for (let j = 1; j < arrSets.length; j++) {
			const oldSet = Array.from(arrSets[j - 1].set);
			const currSet = Array.from(arrSets[j].set);

			// https://medium.com/@alvaro.saburido/set-theory-for-arrays-in-es6-eb2f20a61848
			// Results that are on oldSet but not on currSet
			let difference = oldSet.filter(x => !currSet.includes(x));

			// difference has the peers that disappeared, check if their media was continuous
			difference = difference.filter(machineId => {
				const perf = arrSets[j - 1].entries[machineId];
				if ((perf.pkGen === 0) && (perf.pkSent === 0) && (perf.pkRecv === 0) && (perf.pkOver === 0) && (perf.pkMissed === 0) && (perf.pkExpected === 0)) {
					// console.log(`${machineId} media was not continuous`);
					return false;
				}

				if (perf.media1 === -1 && perf.media2 === 65535) {
					// console.log(`${machineId} media was not continuous`);
					return false;
				}

				// console.log(`${machineId} media was continuous`);
				return true;
			})

			// outStrOut += "[" + (j - 1) + " - " + j + "] -> Peers desaparecidos ["+difference.length+"]: " + difference.join(",") + "\n";

			const difference2 = currSet.filter(x => !oldSet.includes(x));
			// outStrIn += "[" + (j - 1) + " - " + j + "] -> Peers aparecidos ["+difference2.length+"]: " + difference2.join(",") + "\n";
			outObj[arrSets[j].timestamp] = {
				in: difference2,
				out: difference,
				in_num: difference2.length,
				out_num: difference.length
			};
		}
		Utils.saveStringAsFile(JSON.stringify(outObj), "peer_churn.json", "text/json");
	}
}

export default Manager;

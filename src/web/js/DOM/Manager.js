// @flow
import Utils from "../../../utils";
import Filter from "../../../parserLib/Graph/Filter/Filter";
import LogParserOverlay from "../../../parserLib/Log/Overlay/LogParserOverlay";
import LogParserPerformance from "../../../parserLib/Log/Performance/LogParserPerformance";
import ComparisionLayout from "../../../parserLib/Graph/Visualizer/Layout/ComparisionLayout";
import plOption from "../../../parserLib/Option";
import Node from "../../../parserLib/Graph/Visualizer/Node";
import DOMUtils from "./Utils.js";
import Variables from "./Variables";
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
			filterTypeDOM.add(new Option(value.name, value.id));
		});

		const availableLayoutsKeys = Object.keys(availableLayouts);
		availableLayoutsKeys.forEach(index => {
			const value = availableLayouts[index];
			layoutTypeDOM.add(new Option(value.name, value.id));
		});

		// Select default elements
		filterTypeDOM.value = availableFilters[availableFiltersKeys[0]].id;
		filterTypeDOM.dispatchEvent(new Event("change"));

		layoutTypeDOM.value = availableLayouts[availableLayoutsKeys[0]].id;
		layoutTypeDOM.dispatchEvent(new Event("change"));

		DOMUtils.getElementById("btnCurrentState").dispatchEvent(new Event("click"));
	}

	static getInputFromOption(inputId: string, option: plOption): string {
		if (!option.isFilter()) {
			// If we are not dealing with a filter
			const inputType = Manager.getInputType(option.type);

			return `<label for='${inputId}'>${option.name}</label><input id ='${inputId}' type='${inputType}' ${Manager.getDefaultAttr(option.type, option.default)}>`;
		}
		// If we area dealing with a filter option

		// Get all filters that we can use
		const availableFilters = Utils.getFiltersByType(option.type);
		let res = "<div class='layoutSubFilter'>";
		res += `<label for='${inputId}'>Filter</label><select id='${inputId}'>`;
		availableFilters.forEach(value => {
			res += `<option value='${value.id}'>${value.name}</option>`;
		});
		res += "</select>";

		// Generate sub filter config option
		// Default filter
		[Variables.selectedLayoutFilter] = availableFilters;
		const filter = Variables.selectedLayoutFilter;
		res += "<div id='subFilterOptionsHolder'>";
		res += Manager.generateOptionsForm("subFilterOptions", filter.class.getOptions());
		res += "</div></div>";
		return res;
	}

	static parseInputValue(configType: string, element: HTMLInputElement): string | number | boolean {
		const { value } = element;
		if (configType === String) return String(value);
		if (configType === Number) return Number(value);
		if (configType === Boolean) return element.checked;

		// eslint-disable-next-line flowtype-errors/show-errors
		if (configType.prototype instanceof Filter || configType === Filter) {
			const layoutFilterFormHolderId = "subFilterOptions";
			// eslint-disable-next-line flowtype-errors/show-errors
			return Manager.getOptions(layoutFilterFormHolderId, Variables.selectedLayoutFilter.class.getOptions());
		}
		throw new Error(`Invalid configType: ${configType}`);
	}

	static getInputType(configType: Class<String> | Class<Number> | Class<Boolean>): string {
		if (configType === String) return "text";
		if (configType === Number) return "number";
		if (configType === Boolean) return "checkbox";

		throw new Error(`Invalid configType: ${configType}`);
	}

	static getDefaultAttr(configType: Class<String> | Class<Number> | Class<Boolean>, defaultValue: any): string {
		if (configType === Boolean) {
			if (defaultValue === true) {
				return "checked = 'checked'";
			}
			return "";
		}
		if (configType === String || configType === Number) {
			return `value = '${defaultValue}'`;
		}
		throw new Error(`Invalid configType: ${configType}`);
	}

	static generateOptionsForm(formHolderId: string, options: { [string]: plOption }): string {
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
				console.log(`Machine ${value.address} appears on Perfomance Log but doesn't appear mainly at Overlay Log`);
			}
		}
	}

	static updateDefaultsOptionValues(): void {
		["filterOptions", "layoutOptions", "subFilterOptions"].forEach(optionType => {
			Variables.sourceOptions[optionType].forEach((value, index) => {
				const el = DOMUtils.getElementById(value);
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

	static async parseOverlayLog(e: {}): void {
		console.log("Overlay log read.");
		const entryArray = await LogParserOverlay.parse(e.currentTarget.result.split("\n"));
		console.log(`Parsed ${entryArray.length} lines from overlay log`);
		window.logEntity.addOverlayEntries(entryArray);
		window.graphManager.syncMachines();
		DOMUtils.getElementById("numberOfEvents").value = window.logEntity.sourceApparitionLocations.length;
		DOMUtils.getElementById("numberOfNodes").value = Object.keys(window.logEntity.machines).length;
		Manager.syncMachinesList();

		// Update defaults ::src
		Manager.updateDefaultsOptionValues();
	}

	static async parsePerformanceLog(e: {}): void {
		console.log("Performance log read.");
		const entryArray = await LogParserPerformance.parse(e.currentTarget.result.split("\n"));
		console.log(`Parsed ${entryArray.length} lines from performance log`);
		window.logEntity.addPerformanceEntries(entryArray);
		Manager.updateClassifications();
	}

	static getOptions(formHolderId: string, options: { [string]: plOption }): { [string]: string | number | boolean } {
		const resObj = {};
		Object.keys(options).forEach(el => {
			const option = options[el];
			const inputId = `_main${formHolderId}_${el}`;
			const element = DOMUtils.getElementById(inputId);
			resObj[el] = Manager.parseInputValue(option.type, element);
		});
		return resObj;
	}

	static synchronizeSigma(sigma: {}): void {
		const graphHolder = sigma.helperHolder.graphHolder.filtered;
		const unfilteredGraphHolder = sigma.helperHolder.graphHolder.original;
		const { nodeHolder } = sigma.helperHolder;
		const { edgesHolder } = sigma.helperHolder;
		const { byPassInNodes } = sigma.helperHolder;
		const { byPassOutNodes } = sigma.helperHolder;

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
					const edge = {
						id: `${machineKey}_>_${machineDest}`,
						source: machineKey,
						target: machineDest,
						size: 2,
						type: "arrow"
					};
					const edgesFrom = edgesHolder.get(machineKey);
					if (edgesFrom) {
						const edgeObj = edgesFrom.get(machineDest);
						if (edgeObj) {
							Object.assign(edge, edgeObj);
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
				const edge = {
					id: `${machineKey}_>_${machineDest}`,
					source: machineKey,
					target: machineDest,
					size: 2,
					type: "arrow"
				};
				if (edgesHolder[machineKey] && edgesHolder[machineKey][machineDest]) {
					Object.assign(edge, edgesHolder[machineKey][machineDest]);
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
				const edge = {
					id: `${machineFrom}_>_${machineTo}`,
					source: machineFrom,
					target: machineTo,
					size: 2,
					type: "arrow"
				};
				if (edgesHolder[machineFrom] && edgesHolder[machineFrom][machineTo]) {
					Object.assign(edge, edgesHolder[machineFrom][machineTo]);
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

	static extractOptions(): { filter: { [string]: string | number | boolean }, layout: { [string]: string | number | boolean } } {
		const filterFormHolderId = "filterOptions";
		const filterOptions = Manager.getOptions(filterFormHolderId, Variables.selectedFilter.class.getOptions());

		const layoutFormHolderId = "layoutOptions";
		const layoutOptions = Manager.getOptions(layoutFormHolderId, Variables.selectedLayout.class.getOptions());

		return {
			filter: filterOptions,
			layout: layoutOptions
		};
	}

	static synchronizeMachineListButtons(oldSigma: {}, newSigma: {}): void {
		const oldButtons = oldSigma.helperHolder.managedButtons;
		oldButtons.forEach(button => {
			button.style["border-style"] = "";
		});

		const newButtons = newSigma.helperHolder.managedButtons;
		newButtons.forEach(button => {
			button.style["border-style"] = "inset";
		});
	}

	static changeSelectedNode(node: Node): void {
		if (Variables.selectedNode) {
			DOMUtils.getElementById(`machRow_${Variables.selectedNode.id}`).classList.remove("active");
		}
		Variables.selectedNode = node;
		const elementById = DOMUtils.getElementById(`machRow_${node.id}`);
		elementById.scrollIntoView({ block: "nearest", inline: "start" });
		elementById.classList.add("active");
	}

	static drawGraph(filterOptions: { [string]: plOption }, layoutOptions: { [string]: plOption }, goToState: Number, byTimestamp: boolean = false): void {
		if (!Variables.selectedLayoutFilter) throw new Error("Layout Options missing subfilter");

		const { graphManager } = window;

		const lastEventIndex = graphManager.currentEventIndex;
		// We should store the last state on 'Previous Graph'

		DOMUtils.getElementById("previousEvent").value = lastEventIndex;
		DOMUtils.getElementById("previousStateEventId").innerHTML = `(${lastEventIndex})`;


		if (!Variables.isFirstIteration) {
			window.sigmaPrevious.helperHolder.nodeHolder = window.sigmaCurrent.helperHolder.nodeHolder;
			window.sigmaPrevious.helperHolder.edgesHolder = window.sigmaCurrent.helperHolder.edgesHolder;
			window.sigmaPrevious.helperHolder.graphHolder = {
				...window.sigmaCurrent.helperHolder.graphHolder
			};
			if (!Variables.layoutPreservation) {
				Manager.synchronizeSigma(window.sigmaPrevious);
			}
			DOMUtils.getElementById('previousEventTime').value = new Date(graphManager.getCurrentTimestamp() * 1000).toString();
			DOMUtils.getElementById('previousEventElapsedTime').value = graphManager.getCurrentElapsedTime();
		}

		const FilterClass = Variables.selectedFilter.class;
		const LayoutClass = Variables.selectedLayout.class;
		const LayoutFilterClass = Variables.selectedLayoutFilter.class;

		if(!byTimestamp) {
			graphManager.goToAbsoluteServerApparition(goToState);
		}else{
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
		const subFilterResult = subFilterObj.applyFilter(graphHolder);

		const layoutObj = new LayoutClass(subFilterResult, graphManager.getMachines(), layoutOptions);
		layoutObj.updatePositions();
		window.sigmaCurrent.helperHolder.edgesHolder = layoutObj.edgesOverride;

		if (!Variables.isFirstIteration && Variables.layoutPreservation) {
			// Previous Sigma's nodes should have the same position as the Current Sigma
			Object.keys(window.sigmaPrevious.helperHolder.nodeHolder).forEach(index => {
				const node = window.sigmaPrevious.helperHolder.nodeHolder[index];
				const currentNode = layoutObj.nodeHolder[index];
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
			filterResult = filterObj.applyFilter(graphHolder);
		}
		window.sigmaCurrent.helperHolder.graphHolder.filtered = filterResult.graphHolder;

		// Apply comparision layout
		if (window.oldSubFilterResult) {
			const comparisionLayout = new ComparisionLayout(subFilterResult, window.oldSubFilterResult, graphManager.getMachines(), {});
			comparisionLayout.nodeHolder = layoutObj.cloneNodeHolder();
			comparisionLayout.updatePositions();
			window.sigmaComparision.helperHolder.nodeHolder = comparisionLayout.nodeHolder;
			window.sigmaComparision.helperHolder.edgesHolder = comparisionLayout.edgesOverride;
			window.sigmaComparision.helperHolder.graphHolder = window.sigmaCurrent.helperHolder.graphHolder;

			Manager.synchronizeSigma(window.sigmaComparision);
		}
		window.oldSubFilterResult = subFilterResult;

		window.sigmaCurrent.helperHolder.nodeHolder = layoutObj.nodeHolder;
		Manager.synchronizeSigma(window.sigmaCurrent);

		DOMUtils.getElementById("currentEvent").value = graphManager.currentEventIndex;
		DOMUtils.getElementById("currentStateEventId").innerHTML = `(${graphManager.currentEventIndex})`;
		DOMUtils.getElementById("comparisionStateEventId").innerHTML = `(${lastEventIndex}/${graphManager.currentEventIndex})`;
		DOMUtils.getElementById('currentEventTime').value = new Date(graphManager.getCurrentTimestamp() * 1000).toString();
		DOMUtils.getElementById('currentEventElapsedTime').value = graphManager.getCurrentElapsedTime();
		DOMUtils.getElementById("selectedEventNumber").value = window.selectedEvent = graphManager.currentSourceIndex;

		Variables.isFirstIteration = false;
	}

	static displayAllToRelations(node: Node, sigma: {}): void {
		sigma.helperHolder.byPassOutNodes.push(node);
		Manager.synchronizeSigma(sigma);
	}

	static displayAllFromRelations(node: Node, sigma: {}): void {
		sigma.helperHolder.byPassInNodes.push(node);
		Manager.synchronizeSigma(sigma);
	}

	static hideAllToRelations(node: Node, sigma: {}): void {
		sigma.helperHolder.byPassOutNodes.splice(sigma.helperHolder.byPassOutNodes.indexOf(node), 1);
		Manager.synchronizeSigma(sigma);
	}

	static hideAllFromRelations(node: Node, sigma: {}): void {
		sigma.helperHolder.byPassInNodes.splice(sigma.helperHolder.byPassInNodes.indexOf(node), 1);
		Manager.synchronizeSigma(sigma);
	}
}

export default Manager;

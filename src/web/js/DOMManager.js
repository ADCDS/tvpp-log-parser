// @flow
import Utils from "../../utils";
import Filter from "../../parserLib/Graph/Filter/Filter";
import LogParserOverlay from "../../parserLib/Log/Overlay/LogParserOverlay";
import LogParserPerformance from "../../parserLib/Log/Performance/LogParserPerformance";
import ComparisionLayout from "../../parserLib/Graph/Visualizer/Layout/ComparisionLayout";

class DOMManager {
	static sourceOptions = {
		filterOptions: [],
		layoutOptions: [],
		subFilterOptions: []
	};

	static selectedFilter = null;

	static selectedLayout = null;

	static selectedLayoutFilter = null;

	static selectedNode = null;

	static selectedSigma = null;

	static layoutPreservation = false;

	static init() {
		// Show starting options

		// Get available layouts and filters
		const availableFilters = Utils.filters;
		const availableLayouts = Utils.layouts;

		const filterTypeDOM = document.getElementById("filterType");
		const layoutTypeDOM = document.getElementById("layoutType");

		const availableFiltersKeys = Object.keys(availableFilters);
		availableFiltersKeys.forEach(el => {
			const value = availableFilters[el];
			filterTypeDOM.innerHTML += `<option value='${value.id}'>${value.name}</option>`;
		});

		const availableLayoutsKeys = Object.keys(availableLayouts);
		availableLayoutsKeys.forEach(index => {
			const value = availableLayouts[index];
			layoutTypeDOM.innerHTML += `<option value='${value.id}'>${value.name}</option>`;
		});

		// Select default elements
		filterTypeDOM.value = availableFilters[availableFiltersKeys[0]].id;
		filterTypeDOM.dispatchEvent(new Event("change"));

		layoutTypeDOM.value = availableLayouts[availableLayoutsKeys[0]].id;
		layoutTypeDOM.dispatchEvent(new Event("change"));

		document.getElementById("btnCurrentState").dispatchEvent(new Event("click"));
	}

	static getInputFromOption(inputId, option) {
		if (!(option.type.prototype instanceof Filter || option.type === Filter)) {
			// If we are not dealing with a filter
			const inputType = DOMManager.getInputType(option.type);

			return `<label for='${inputId}'>${option.name}</label><input id ='${inputId}' type='${inputType}' ${DOMManager.getDefaultAttr(
				option.type,
				option.default
			)}>`;
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
		[DOMManager.selectedLayoutFilter] = availableFilters;
		const filter = DOMManager.selectedLayoutFilter;
		res += "<div id='subFilterOptionsHolder'>";
		res += DOMManager.generateOptionsForm("subFilterOptions", filter.class.getOptions());
		res += "</div></div>";
		return res;
	}

	static parseInputValue(configType, element) {
		const { value } = element;
		if (configType === String) return String(value);
		if (configType === Number) return Number(value);
		if (configType === Boolean) return element.checked;

		if (configType.prototype instanceof Filter || configType === Filter) {
			const layoutFilterFormHolderId = "subFilterOptions";
			return DOMManager.getOptions(layoutFilterFormHolderId, DOMManager.selectedLayoutFilter.class.getOptions());
		}
		throw new Error(`Invalid configType: ${configType}`);
	}

	static getInputType(configType) {
		if (configType === String) return "text";
		if (configType === Number) return "number";
		if (configType === Boolean) return "checkbox";

		throw new Error(`Invalid configType: ${configType}`);
	}

	static getDefaultAttr(configType, defaultValue) {
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

	static generateOptionsForm(formHolderId, options) {
		DOMManager.sourceOptions[formHolderId] = [];

		let resHTML = "";
		Object.keys(options).forEach(el => {
			const option = options[el];

			const inputId = `_main${formHolderId}_${el}`;
			if (option.default === "::src") {
				DOMManager.sourceOptions[formHolderId].push(inputId);
			}
			resHTML += DOMManager.getInputFromOption(inputId, option);
		});
		return resHTML;
	}

	static handleSubFilterChange(e) {
		const filter = Utils.getFilter(e.target.value);
		DOMManager.selectedLayoutFilter = filter;
		document.getElementById("subFilterOptionsHolder").innerHTML = DOMManager.generateOptionsForm("subFilterOptions", filter.class.getOptions());
		DOMManager.updateDefaultsOptionValues();
	}

	static handleMainFilterChange(e) {
		const filter = Utils.getFilter(e.target.value);
		const formHolderId = "filterOptions";
		const filterOptions = document.getElementById(formHolderId);
		DOMManager.selectedFilter = filter;
		filterOptions.innerHTML = DOMManager.generateOptionsForm(formHolderId, filter.class.getOptions());
		DOMManager.updateDefaultsOptionValues();
	}

	static handleLayoutChange(e) {
		const layout = Utils.getLayout(e.target.value);
		const formHolderId = "layoutOptions";
		const filterOptions = document.getElementById(formHolderId);
		DOMManager.selectedLayout = layout;
		filterOptions.innerHTML = DOMManager.generateOptionsForm(formHolderId, layout.class.getOptions());
		DOMManager.updateDefaultsOptionValues();
	}

	static handleSelectedEventChange(e) {
		if (e.target.value < window.logEntity.sourceApparitionLocations.length) window.selectedEvent = Number(e.target.value);
		else window.selectedEvent = Number(window.logEntity.sourceApparitionLocations.length);
		e.target.value = window.selectedEvent;
	}

	static syncMachinesList() {
		let resHTML = "";
		document.getElementById("machineListTable").innerHTML = "";
		let i = 1;
		for (const [index, value] of window.logEntity.machines.entries()) {
			resHTML += `<tr id="machRow_${value.address}" data-addr="${value.address}"><td>${i++}</td><td>${
				value.address
			}</td><td id="machClassification_${value.address}">${value.bandwidthClassification}</td><td>
<button data-type="in">In</button>
<button data-type="out">Out</button>
</td></tr>`;
		}
		document.getElementById("machineListTable").innerHTML = resHTML;
	}

	static updateClassifications() {
		for (const [index, value] of window.logEntity.machines.entries()) {
			const element = document.getElementById(`machClassification_${value.address}`);
			if (!element) {
				console.log(`Machine ${value.address} appears on Perfomance Log but doesn't appear mainly at Overlay Log`);
			} else {
				element.innerHTML = value.bandwidthClassification;
			}
		}
	}

	static updateDefaultsOptionValues() {
		["filterOptions", "layoutOptions", "subFilterOptions"].forEach(optionType => {
			DOMManager.sourceOptions[optionType].forEach((value, index) => {
				const el = document.getElementById(value);
				if (!el) {
					DOMManager.sourceOptions[optionType].splice(index, 1);
					return;
				}
				if (window.logEntity.sourceMachineKey !== null && el.value === "::src") {
					el.value = window.logEntity.sourceMachineKey;
				}
			});
		});
	}

	static async parseOverlayLog(e) {
		console.log("Overlay log read.");
		const entryArray = await LogParserOverlay.parse(e.currentTarget.result.split("\n"));
		console.log(`Parsed ${entryArray.length} lines from overlay log`);
		window.logEntity.addOverlayEntries(entryArray);
		window.graphManager.syncMachines();
		document.getElementById("numberOfEvents").value = window.logEntity.sourceApparitionLocations.length;
		document.getElementById("numberOfNodes").value = Object.keys(window.logEntity.machines).length;
		DOMManager.syncMachinesList();

		// Update defaults ::src
		DOMManager.updateDefaultsOptionValues();
	}

	static async parsePerformanceLog(e) {
		console.log("Performance log read.");
		const entryArray = await LogParserPerformance.parse(e.currentTarget.result.split("\n"));
		console.log(`Parsed ${entryArray.length} lines from performance log`);
		window.logEntity.addPerformanceEntries(entryArray);
		DOMManager.updateClassifications();
	}

	static getOptions(formHolderId, options) {
		const resObj = {};
		Object.keys(options).forEach(el => {
			const option = options[el];
			const inputId = `_main${formHolderId}_${el}`;
			const element = document.getElementById(inputId);
			resObj[el] = DOMManager.parseInputValue(option.type, element);
		});
		return resObj;
	}

	static synchronizeSigma(sigma) {
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
				if (edgesHolder[machineKey] && edgesHolder[machineKey][machineDest]) {
					Object.assign(edge, edgesHolder[machineKey][machineDest]);
				}
				try {
					sigma.graph.addEdge(edge);
				} catch (e) {
					console.log(`Sigma exception: ${e}`);
				}
			});
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

	static extractOptions() {
		const filterFormHolderId = "filterOptions";
		const filterOptions = DOMManager.getOptions(filterFormHolderId, DOMManager.selectedFilter.class.getOptions());

		const layoutFormHolderId = "layoutOptions";
		const layoutOptions = DOMManager.getOptions(layoutFormHolderId, DOMManager.selectedLayout.class.getOptions());

		return {
			filter: filterOptions,
			layout: layoutOptions
		};
	}

	static handleStateGraphChange(e) {
		const graphs = ["containerPrevious", "containerComparision", "containerCurrent"];

		graphs.forEach(el => {
			document.getElementById(el).style.display = "none";
		});

		const tablinks = document.getElementsByClassName("tablinks");
		for (let i = 0; i < tablinks.length; i++) {
			tablinks[i].className = tablinks[i].className.replace(" active", "");
		}
		document.getElementById(e.currentTarget.dataset.graph).style.display = "block";

		const sigmaObj = window[e.currentTarget.dataset.sigma];

		if (DOMManager.selectedSigma) {
			DOMManager.synchronizeMachineListButtons(DOMManager.selectedSigma, sigmaObj);
		}

		DOMManager.selectedSigma = sigmaObj;
		sigmaObj.refresh();

		e.currentTarget.className += " active";
	}

	static synchronizeMachineListButtons(oldSigma, newSigma) {
		const oldButtons = oldSigma.helperHolder.managedButtons;
		oldButtons.forEach(button => {
			button.style["border-style"] = "";
		});

		const newButtons = newSigma.helperHolder.managedButtons;
		newButtons.forEach(button => {
			button.style["border-style"] = "inset";
		});
	}

	static handleMachineListButtonClick(e) {
		const button = e.target;
		const { type } = button.dataset;
		if (!type) {
			const node = DOMManager.selectedSigma.helperHolder.nodeHolder[button.parentElement.dataset.addr];
			if (node) DOMManager.changeSelectedNode(node);
			return;
		}
		const machineId = button.parentElement.parentElement.dataset.addr;

		const isPressed = button.style["border-style"] === "inset";
		const { helperHolder } = DOMManager.selectedSigma;
		if (!isPressed) {
			if (type === "out") {
				DOMManager.displayAllToRelations(machineId, DOMManager.selectedSigma);
			} else {
				DOMManager.displayAllFromRelations(machineId, DOMManager.selectedSigma);
			}
			helperHolder.managedButtons.push(button);

			button.style["border-style"] = "inset";
		} else {
			if (type === "out") {
				DOMManager.hideAllToRelations(machineId, DOMManager.selectedSigma);
			} else {
				DOMManager.hideAllFromRelations(machineId, DOMManager.selectedSigma);
			}
			helperHolder.managedButtons.splice(helperHolder.managedButtons.indexOf(button), 1);
			button.style["border-style"] = "";
		}
	}

	static changeSelectedNode(node) {
		if (DOMManager.selectedNode) {
			document.getElementById(`machRow_${DOMManager.selectedNode.id}`).classList.remove("active");
		}
		DOMManager.selectedNode = node;
		document.getElementById(`machRow_${node.id}`).classList.add("active");
	}

	static handleSigmaClick(e) {
		DOMManager.changeSelectedNode(e.data.node);
		// DOMManager.displayAllToRelations(e.data.node, e.target);
	}

	static handleLayoutPreservationChange(e) {
		DOMManager.layoutPreservation = e.target.checked;
	}

	static isFirstIteration = true;

	static drawGraph(goToState, filterOptions, layoutOptions) {
		if (!DOMManager.selectedLayoutFilter) throw new Error("Layout Options missing subfilter");

		const { graphManager } = window;

		const lastEventIndex = graphManager.currentEventIndex;
		// We should store the last state on 'Previous Graph'
		document.getElementById("previousEvent").value = lastEventIndex;
		document.getElementById("previousStateEventId").innerHTML = `(${lastEventIndex})`;

		if (!DOMManager.isFirstIteration) {
			window.sigmaPrevious.helperHolder.nodeHolder = window.sigmaCurrent.helperHolder.nodeHolder;
			window.sigmaPrevious.helperHolder.edgesHolder = window.sigmaCurrent.helperHolder.edgesHolder;
			window.sigmaPrevious.helperHolder.graphHolder = {
				...window.sigmaCurrent.helperHolder.graphHolder
			};
			if (!DOMManager.layoutPreservation) {
				DOMManager.synchronizeSigma(window.sigmaPrevious);
			}
		}

		const FilterClass = DOMManager.selectedFilter.class;
		const LayoutClass = DOMManager.selectedLayout.class;
		const LayoutFilterClass = DOMManager.selectedLayoutFilter.class;

		graphManager.goToAbsoluteServerApparition(goToState);
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

		if (!DOMManager.isFirstIteration && DOMManager.layoutPreservation) {
			// Previous Sigma's nodes should have the same position as the Current Sigma
			Object.keys(window.sigmaPrevious.helperHolder.nodeHolder).forEach(index => {
				const node = window.sigmaPrevious.helperHolder.nodeHolder[index];
				const currentNode = layoutObj.nodeHolder[index];
				if (currentNode) {
					node.x = currentNode.x;
					node.y = currentNode.y;
				}
			});
			DOMManager.synchronizeSigma(window.sigmaPrevious);
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
			const comparisionLayout = new ComparisionLayout(subFilterResult, window.oldSubFilterResult, graphManager.getMachines());
			comparisionLayout.nodeHolder = layoutObj.cloneNodeHolder();
			comparisionLayout.updatePositions();
			window.sigmaComparision.helperHolder.nodeHolder = comparisionLayout.nodeHolder;
			window.sigmaComparision.helperHolder.edgesHolder = comparisionLayout.edgesOverride;
			window.sigmaComparision.helperHolder.graphHolder = window.sigmaCurrent.helperHolder.graphHolder;

			DOMManager.synchronizeSigma(window.sigmaComparision);
		}
		window.oldSubFilterResult = subFilterResult;

		window.sigmaCurrent.helperHolder.nodeHolder = layoutObj.nodeHolder;
		DOMManager.synchronizeSigma(window.sigmaCurrent);

		/**
		 * Update DOM
		 * Maybe this should be in DOMManager
		 */
		document.getElementById("currentEvent").value = graphManager.currentEventIndex;
		document.getElementById("currentStateEventId").innerHTML = `(${graphManager.currentEventIndex})`;
		document.getElementById("comparisionStateEventId").innerHTML = `(${lastEventIndex}/${graphManager.currentEventIndex})`;

		DOMManager.isFirstIteration = false;
	}

	static displayAllToRelations(node, sigma) {
		sigma.helperHolder.byPassOutNodes.push(node);
		DOMManager.synchronizeSigma(sigma);
	}

	static displayAllFromRelations(node, sigma) {
		sigma.helperHolder.byPassInNodes.push(node);
		DOMManager.synchronizeSigma(sigma);
	}

	static hideAllToRelations(node, sigma) {
		sigma.helperHolder.byPassOutNodes.splice(sigma.helperHolder.byPassOutNodes.indexOf(node), 1);
		DOMManager.synchronizeSigma(sigma);
	}

	static hideAllFromRelations(node, sigma) {
		sigma.helperHolder.byPassInNodes.splice(sigma.helperHolder.byPassInNodes.indexOf(node), 1);
		DOMManager.synchronizeSigma(sigma);
	}
}

export default DOMManager;

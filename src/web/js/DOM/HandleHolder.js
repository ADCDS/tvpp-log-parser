// @flow

// eslint-disable-next-line flowtype-errors/show-errors
import html2canvas from "html2canvas";

import Utils from "../../../utils";
import DOMUtils from "./Utils";
import Manager from "./Manager";
import Variables from "./Variables";
import ChartManager from "./ChartManager";
import type { GLChartOutputType, PartnerOutputLog } from "../../../types";

class HandleHolder {
	static async handleNextButtonClick() {
		return Manager.goToEventAndDraw(window.selectedEvent + 1);
	}

	static async handlePrevButtonClick() {
		return Manager.goToEventAndDraw(window.selectedEvent - 1);
	}

	static handleSigmaClick(e: any): void {
		Manager.changeSelectedNode(e.data.node);
		// DOMManager.displayAllToRelations(e.data.node, e.target);
	}

	static handleLayoutPreservationChange(e: Event): void {
		if (!(e.target instanceof HTMLInputElement)) throw new Error("Invalid type");

		Variables.layoutPreservation = e.target.checked;
	}

	static handleDisableEdgesChange(e: Event): void {
		if (!(e.target instanceof HTMLInputElement)) throw new Error("Invalid type");

		Variables.disableEdges = e.target.checked;
		if (Variables.disableEdges) {
			DOMUtils.getGenericElementById<HTMLSelectElement>("filterType").disabled = true;
			const filterTypeDOM = DOMUtils.getGenericElementById<HTMLSelectElement>("filterType");
			filterTypeDOM.selectedIndex = 0;
			filterTypeDOM.dispatchEvent(new Event("change"));
		} else {
			DOMUtils.getGenericElementById<HTMLSelectElement>("filterType").disabled = false;
		}
	}

	static handleSubFilterChange(e: Event): void {
		if (!(e.target instanceof HTMLSelectElement)) throw new Error("Invalid type");

		const filter = Utils.getFilter(e.target.value);

		Variables.selectedLayoutFilter = filter;
		DOMUtils.getElementById("subFilterOptionsHolder").innerHTML = Manager.generateOptionsForm("subFilterOptions", filter.class.getOptions());
		Manager.updateDefaultsOptionValues();

		const charts = Utils.getChartsByFilterConstraintType(filter.type);
		Manager.generateChartOptions(charts);
	}

	static handleMainFilterChange(e: Event): void {
		if (!(e.target instanceof HTMLSelectElement)) throw new Error("Invalid type");
		const filter = Utils.getFilter(e.target.value);

		const formHolderId = "filterOptions";
		const filterOptions = DOMUtils.getElementById(formHolderId);
		Variables.selectedFilter = filter;

		filterOptions.innerHTML = Manager.generateOptionsForm(formHolderId, filter.class.getOptions());
		Manager.updateDefaultsOptionValues();
	}

	static handleLayoutChange(e: Event): void {
		if (!(e.target instanceof HTMLSelectElement)) throw new Error("Invalid type");
		const layout = Utils.getLayout(e.target.value);

		const formHolderId = "layoutOptions";
		const filterOptions = DOMUtils.getElementById(formHolderId);
		Variables.selectedLayout = layout;
		filterOptions.innerHTML = Manager.generateOptionsForm(formHolderId, layout.class.getOptions());
		Manager.updateDefaultsOptionValues();

		// Associate a eventListener to a newly created layoutSubFilter HTMLSelectElement
		const layoutSubFilterSelect = DOMUtils.getGenericElementById<HTMLSelectElement>("_mainlayoutOptions_filter");
		layoutSubFilterSelect.addEventListener("change", HandleHolder.handleSubFilterChange);

		// And triggers it, to update charts options
		layoutSubFilterSelect.dispatchEvent(new Event("change"));

		// Clean chart output values
		Variables.outputGroupChartData = {};
		Variables.layersFound = new Set<string>();
	}

	static handleSelectedEventChange(e: Event): void {
		const target = e.target;
		if (!(target instanceof HTMLInputElement)) throw new Error("Invalid type");

		if (target.value < window.logEntity.sourceApparitionLocations.length) window.selectedEvent = Number(target.value);
		else window.selectedEvent = Number(window.logEntity.sourceApparitionLocations.length);
		target.value = window.selectedEvent.toString();
	}

	static handleTimestampChange(e: Event): void {
		const target = e.target;
		if (!(target instanceof HTMLInputElement)) throw new Error("Invalid type");

		window.selectedTimestamp = Number(target.value);
		target.value = window.selectedTimestamp.toString();
	}

	static handleStateGraphChange(e: Event): void {
		const currentTarget = e.currentTarget;
		if (!(currentTarget instanceof HTMLButtonElement)) throw new Error("Invalid type");

		const graphs = ["containerPrevious", "containerComparision", "containerCurrent"];

		graphs.forEach(el => {
			DOMUtils.getElementById(el).style.display = "none";
		});

		const tabLinks = document.getElementsByClassName("tablinks");
		for (let i = 0; i < tabLinks.length; i++) {
			tabLinks[i].className = tabLinks[i].className.replace(" active", "");
		}
		const graphContainer = DOMUtils.getElementById(currentTarget.dataset.graph);
		graphContainer.style.display = "block";

		const sigmaObj = window[currentTarget.dataset.sigma];

		if (Variables.selectedSigma) {
			Manager.synchronizeMachineListButtons(Variables.selectedSigma, sigmaObj);
		}

		Variables.selectedSigma = sigmaObj;
		sigmaObj.refresh();

		currentTarget.className += " active";
	}

	static handleMachineListButtonClick(e: Event): void {
		if (!(e.target instanceof HTMLButtonElement)) return;

		const button = e.target;
		const { type } = button.dataset;
		if (!button.parentElement) {
			throw new Error("Invalid event");
		}

		const tableCell = (button: Node).parentElement;
		if (!tableCell) throw new Error("Invalid event");

		const parentElement = tableCell.parentElement;
		if (!parentElement || !(parentElement instanceof HTMLElement)) throw new Error("Invalid type");
		const addr = (parentElement.dataset.addr: string);

		if (!type) {
			const node = Variables.selectedSigma.helperHolder.nodeHolder.get(addr);
			if (node) Manager.changeSelectedNode(node);
			return;
		}
		const machineId = addr;

		const isPressed = button.style.borderStyle === "inset";

		const { helperHolder } = Variables.selectedSigma;
		if (!isPressed) {
			if (type === "out") {
				Manager.displayAllToRelations(machineId, Variables.selectedSigma);
			} else {
				Manager.displayAllFromRelations(machineId, Variables.selectedSigma);
			}
			helperHolder.managedButtons.push(button);

			button.style.borderStyle = "inset";
		} else {
			if (type === "out") {
				Manager.hideAllToRelations(machineId, Variables.selectedSigma);
			} else {
				Manager.hideAllFromRelations(machineId, Variables.selectedSigma);
			}
			helperHolder.managedButtons.splice(helperHolder.managedButtons.indexOf(button), 1);
			button.style.borderStyle = "";
		}
	}

	static async handleDrawByEvent() {
		const options = Manager.extractOptions();
		await Manager.drawGraph(options.filter, options.layout, window.selectedEvent, false);
		await ChartManager.drawCharts(options.charts);
		if (Variables.saveOutput) {
			window.scrollTo(0, 0);
			const element = DOMUtils.getElementById("graphArea");
			const fileName = `(${window.graphManager.currentSourceIndex}-${
				window.logEntity.sourceApparitionLocations.length
			}) - ${window.graphManager.getCurrentTimestamp()}.png`;
			html2canvas(element).then(canvas => {
				Utils.saveBase64AsFile(canvas.toDataURL("image/png"), fileName);
			});
		}
	}

	static async handleDrawByTimestamp() {
		const options = Manager.extractOptions();
		await Manager.drawGraph(options.filter, options.layout, window.selectedTimestamp, true);
		await ChartManager.drawCharts(options.charts);
		if (Variables.saveOutput) {
			window.scrollTo(0, 0);
			const element = DOMUtils.getElementById("graphArea");
			const fileName = `(${window.graphManager.currentSourceIndex}-${
				window.logEntity.sourceApparitionLocations.length
			}) - ${window.graphManager.getCurrentTimestamp()}.png`;
			html2canvas(element).then(canvas => {
				Utils.saveBase64AsFile(canvas.toDataURL("image/png"), fileName);
			});
		}
	}

	static handleExtractLayerLog(e: Event): void {
		Manager.downloadLayerLog();
	}

	static handleToggleAutoNext(e: Event): void {
		const button = e.target;

		if (!(button instanceof HTMLInputElement)) throw new Error("Invalid type");
		if (!Variables.autoNext) {
			// Activate autoNext
			Variables.autoNext = true;
			button.value = "Disable Auto Next X";

			const autoNextFunction = async () => {
				try {
					await Manager.goToEventAndDraw(window.selectedEvent + 1);
				} catch (e2) {
					Manager.downloadLayerLog();
					Variables.autoNext = false;
					console.log(`AutoNext: ${e2}`);
				}
				if (Variables.autoNext) {
					setTimeout(autoNextFunction, 1000);
				}
			};

			setTimeout(autoNextFunction, 1000);
		} else {
			Variables.autoNext = false;
			button.value = "AutoNext X";
		}
	}

	static handleTakeSnapShot() {
		window.scrollTo(0, 0);
		const element = DOMUtils.getElementById("graphArea");
		html2canvas(element).then(canvas => {
			const image = new Image();
			image.src = canvas.toDataURL("image/png");

			const w = window.open("");
			w.document.write(image.outerHTML);
		});
	}

	static handleSaveOutputChange(e: Event) {
		const checkbox = e.target;
		if (!(checkbox instanceof HTMLInputElement)) throw new Error("Invalid type");
		Variables.saveOutput = checkbox.checked;
	}

	static handleExtractOverlay() {
		const currentSourceIndex = window.graphManager.currentSourceIndex;
		const initialEventId = window.logEntity.sourceApparitionLocations[currentSourceIndex - 1];
		const lastEventId = window.graphManager.currentEventIndex - 2;
		// console.log(initialEventId, lastEventId);
		Manager.extractOverlayLog(initialEventId, lastEventId);
	}

	static handleGeneratePartnerLog(): PartnerOutputLog {
		const graphManager = window.graphManager;
		const machinesMap = window.logEntity.machines;
		const colorArray = [
			"#ff0000",
			"#0000ff",
			"#64ff00",
			"#fff400",
			"#ff7b00",
			"#ff0051",
			"#ff00dc",
			"#e100ff",
		];

		const colorMap: {[string]: string} = {};

		for (let i = 0; i < logEntity.bandwidths.length; i++) {
			const bandwidth = logEntity.bandwidths[i];
			colorMap[bandwidth] = colorArray[i];
		}

		// Generate initial holder
		const output: PartnerOutputLog = {
			bandwidths: window.logEntity.bandwidths,
			colorMap: colorMap,
			data: {}
		};

		// Iterate through all events.
		try {
			while(true) {
				output["data"][graphManager.currentSourceIndex] = {
					metadata: {
						timestamp: graphManager.getCurrentTimestamp()
					},
					bandwidths: {}
				};

				for (const bandwidth of window.logEntity.bandwidths) {
					output["data"][graphManager.currentSourceIndex]["bandwidths"][bandwidth] = {};
					output["data"][graphManager.currentSourceIndex]["bandwidths"][bandwidth]["incoming"] = {};
					output["data"][graphManager.currentSourceIndex]["bandwidths"][bandwidth]["outgoing"] = {};

					for (const bandwidth2 of window.logEntity.bandwidths) {
						output["data"][graphManager.currentSourceIndex]["bandwidths"][bandwidth]["incoming"][bandwidth2] = 0;
						output["data"][graphManager.currentSourceIndex]["bandwidths"][bandwidth]["outgoing"][bandwidth2] = 0;
					}

				}

				const graphHolder = graphManager.graphHolder;
				// For each node, analyse its partners

				for (const machine of machinesMap.values()) {
					// Check its incoming partners
					const incoming = graphHolder.getIncomingEdgesOn(machine.address);
					//console.log("incoming", incoming);
					for (const incomingMachineAddress of incoming) {
						const incomingMachine = machinesMap.get(incomingMachineAddress);
						if (incomingMachine) {
							//console.log(output[graphManager.currentSourceIndex]["bandwidths"][machine.bandwidth]["incoming"][incomingMachine.bandwidth]);
							output["data"][graphManager.currentSourceIndex]["bandwidths"][machine.bandwidth]["incoming"][incomingMachine.bandwidth]++;
						}
					}

					const outgoing = graphHolder.getOutgoingEdges(machine.address);
					//console.log("outgoing", outgoing);
					for (const outgoingMachineAddress of outgoing) {
						const outgoingMachine = machinesMap.get(outgoingMachineAddress);
						if (outgoingMachine) {
							//console.log(output[graphManager.currentSourceIndex]["bandwidths"][machine.bandwidth]["outgoing"][outgoingMachine.bandwidth]);
							output["data"][graphManager.currentSourceIndex]["bandwidths"][machine.bandwidth]["outgoing"][outgoingMachine.bandwidth]++;
						}
					}
				}
				graphManager.goToNextServerApparition();
			}
		}catch (e) {
			console.log(e);
		}

		Utils.saveStringAsFile(JSON.stringify(output, null, 2), "partner.log.json");
	}
}

export default HandleHolder;

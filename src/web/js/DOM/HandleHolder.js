// @flow

import Utils from "../../../utils";
import DOMUtils from "./Utils";
import Manager from "./Manager";
import Variables from "./Variables";

class HandleHolder {
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
		if (!(e.target instanceof HTMLInputElement)) throw new Error("Invalid type");

		const filter = Utils.getFilter(e.target.value);

		Variables.selectedLayoutFilter = filter;
		DOMUtils.getElementById("subFilterOptionsHolder").innerHTML = Manager.generateOptionsForm("subFilterOptions", filter.class.getOptions());
		Manager.updateDefaultsOptionValues();
	}

	static handleMainFilterChange(e: Event): void {
		if (!(e.target instanceof HTMLInputElement)) throw new Error("Invalid type");
		const filter = Utils.getFilter(e.target.value);

		const formHolderId = "filterOptions";
		const filterOptions = DOMUtils.getElementById(formHolderId);
		Variables.selectedFilter = filter;

		filterOptions.innerHTML = Manager.generateOptionsForm(formHolderId, filter.class.getOptions());
		Manager.updateDefaultsOptionValues();
	}

	static handleLayoutChange(e: Event): void {
		if (!(e.target instanceof HTMLInputElement)) throw new Error("Invalid type");
		const layout = Utils.getLayout(e.target.value);

		const formHolderId = "layoutOptions";
		const filterOptions = DOMUtils.getElementById(formHolderId);
		Variables.selectedLayout = layout;
		filterOptions.innerHTML = Manager.generateOptionsForm(formHolderId, layout.class.getOptions());
		Manager.updateDefaultsOptionValues();
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
		if (!(currentTarget instanceof HTMLInputElement)) throw new Error("Invalid type");

		const graphs = ["containerPrevious", "containerComparision", "containerCurrent"];

		graphs.forEach(el => {
			DOMUtils.getElementById(el).style.display = "none";
		});

		const tabLinks = document.getElementsByClassName("tablinks");
		for (let i = 0; i < tabLinks.length; i++) {
			tabLinks[i].className = tabLinks[i].className.replace(" active", "");
		}
		DOMUtils.getElementById(currentTarget.dataset.graph).style.display = "block";

		const sigmaObj = window[currentTarget.dataset.sigma];

		if (Variables.selectedSigma) {
			Manager.synchronizeMachineListButtons(Variables.selectedSigma, sigmaObj);
		}

		Variables.selectedSigma = sigmaObj;
		sigmaObj.refresh();

		currentTarget.className += " active";
	}

	static handleMachineListButtonClick(e: Event): void {
		if (!(e.target instanceof HTMLInputElement)) throw new Error("Invalid type");

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

	static handleDrawByEvent(): void {
		const options = Manager.extractOptions();
		Manager.drawGraph(options.filter, options.layout, window.selectedEvent, false);
	}

	static handleDrawByTimestamp(): void {
		const options = Manager.extractOptions();
		Manager.drawGraph(options.filter, options.layout, window.selectedTimestamp, true);
	}
}

export default HandleHolder;

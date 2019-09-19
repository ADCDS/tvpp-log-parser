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

	static handleDisableEdgesChange(e: SyntheticInputEvent<EventTarget>): void {
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

	static handleSubFilterChange(e: SyntheticInputEvent<EventTarget>): void {
		const filter = Utils.getFilter(e.target.value);

		Variables.selectedLayoutFilter = filter;
		DOMUtils.getElementById("subFilterOptionsHolder").innerHTML = Manager.generateOptionsForm("subFilterOptions", filter.class.getOptions());
		Manager.updateDefaultsOptionValues();
	}

	static handleMainFilterChange(e: SyntheticInputEvent<EventTarget>): void {
		const filter = Utils.getFilter(e.target.value);

		const formHolderId = "filterOptions";
		const filterOptions = DOMUtils.getElementById(formHolderId);
		Variables.selectedFilter = filter;

		filterOptions.innerHTML = Manager.generateOptionsForm(formHolderId, filter.class.getOptions());
		Manager.updateDefaultsOptionValues();
	}

	static handleLayoutChange(e: SyntheticInputEvent<EventTarget>): void {
		const layout = Utils.getLayout(e.target.value);

		const formHolderId = "layoutOptions";
		const filterOptions = DOMUtils.getElementById(formHolderId);
		Variables.selectedLayout = layout;
		filterOptions.innerHTML = Manager.generateOptionsForm(formHolderId, layout.class.getOptions());
		Manager.updateDefaultsOptionValues();
	}

	static handleSelectedEventChange(e: SyntheticInputEvent<EventTarget>): void {
		if (e.target.value < window.logEntity.sourceApparitionLocations.length) window.selectedEvent = Number(e.target.value);
		else window.selectedEvent = Number(window.logEntity.sourceApparitionLocations.length);
		e.target.value = window.selectedEvent.toString();
	}

	static handleTimestampChange(e: SyntheticInputEvent<EventTarget>): void {
		if (!(e.target instanceof HTMLInputElement)) throw new Error("Invalid type");

		window.selectedTimestamp = Number(e.target.value);
		e.target.value = window.selectedTimestamp.toString();
	}

	static handleStateGraphChange(e: SyntheticInputEvent<HTMLElement>): void {
		const graphs = ["containerPrevious", "containerComparision", "containerCurrent"];

		graphs.forEach(el => {
			DOMUtils.getElementById(el).style.display = "none";
		});

		const tabLinks = document.getElementsByClassName("tablinks");
		for (let i = 0; i < tabLinks.length; i++) {
			tabLinks[i].className = tabLinks[i].className.replace(" active", "");
		}
		DOMUtils.getElementById(e.currentTarget.dataset.graph).style.display = "block";

		const sigmaObj = window[e.currentTarget.dataset.sigma];

		if (Variables.selectedSigma) {
			Manager.synchronizeMachineListButtons(Variables.selectedSigma, sigmaObj);
		}

		Variables.selectedSigma = sigmaObj;
		sigmaObj.refresh();

		e.currentTarget.className += " active";
	}

	static handleMachineListButtonClick(e: SyntheticInputEvent<HTMLElement>): void {
		const button = e.target;
		const { type } = button.dataset;
		if (!button.parentElement || !(button.parentElement instanceof HTMLElement)) {
			throw new Error("Invalid event");
		}

		if (!type) {
			const node = Variables.selectedSigma.helperHolder.nodeHolder[button.parentElement.dataset.addr];
			if (node) Manager.changeSelectedNode(node);
			return;
		}

		const machineId = button.parentElement.parentElement.dataset.addr;

		const isPressed = button.style["border-style"] === "inset";
		const { helperHolder } = Variables.selectedSigma;
		if (!isPressed) {
			if (type === "out") {
				Manager.displayAllToRelations(machineId, Variables.selectedSigma);
			} else {
				Manager.displayAllFromRelations(machineId, Variables.selectedSigma);
			}
			helperHolder.managedButtons.push(button);

			button.style["border-style"] = "inset";
		} else {
			if (type === "out") {
				Manager.hideAllToRelations(machineId, Variables.selectedSigma);
			} else {
				Manager.hideAllFromRelations(machineId, Variables.selectedSigma);
			}
			helperHolder.managedButtons.splice(helperHolder.managedButtons.indexOf(button), 1);
			button.style["border-style"] = "";
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

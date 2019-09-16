// @flow

import Utils from "../../../utils";
import DOMUtils from "./Utils";
import Manager from "./Manager";
import Variables from "./Variables";

class HandleHolder {
	static handleSigmaClick(e: {}): void {
		Manager.changeSelectedNode(e.data.node);
		// DOMManager.displayAllToRelations(e.data.node, e.target);
	}

	static handleLayoutPreservationChange(e: {}): void {
		Variables.layoutPreservation = e.target.checked;
	}

	static handleDisableEdgesChange(e: {}): void {
		Variables.disableEdges = e.target.checked;
	}

	static handleSubFilterChange(e: {}): void {
		const filter = Utils.getFilter(e.target.value);
		Variables.selectedLayoutFilter = filter;
		DOMUtils.getElementById("subFilterOptionsHolder").innerHTML = Manager.generateOptionsForm("subFilterOptions", filter.class.getOptions());
		Manager.updateDefaultsOptionValues();
	}

	static handleMainFilterChange(e: {}): void {
		const filter = Utils.getFilter(e.target.value);
		const formHolderId = "filterOptions";
		const filterOptions = DOMUtils.getElementById(formHolderId);
		Variables.selectedFilter = filter;
		filterOptions.innerHTML = Manager.generateOptionsForm(formHolderId, filter.class.getOptions());
		Manager.updateDefaultsOptionValues();
	}

	static handleLayoutChange(e: {}): void {
		const layout = Utils.getLayout(e.target.value);
		const formHolderId = "layoutOptions";
		const filterOptions = DOMUtils.getElementById(formHolderId);
		Variables.selectedLayout = layout;
		filterOptions.innerHTML = Manager.generateOptionsForm(formHolderId, layout.class.getOptions());
		Manager.updateDefaultsOptionValues();
	}

	static handleSelectedEventChange(e: {}): void {
		if (e.target.value < window.logEntity.sourceApparitionLocations.length) window.selectedEvent = Number(e.target.value);
		else window.selectedEvent = Number(window.logEntity.sourceApparitionLocations.length);
		e.target.value = window.selectedEvent;
	}
	static handleTimestampChange(e: {}): void {
		window.selectedTimestamp = Number(e.target.value);
		e.target.value = window.selectedTimestamp;
	}

	static handleStateGraphChange(e: {}): void {
		const graphs = ["containerPrevious", "containerComparision", "containerCurrent"];

		graphs.forEach(el => {
			DOMUtils.getElementById(el).style.display = "none";
		});

		const tablinks = document.getElementsByClassName("tablinks");
		for (let i = 0; i < tablinks.length; i++) {
			tablinks[i].className = tablinks[i].className.replace(" active", "");
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

	static handleMachineListButtonClick(e: {}): void {
		const button = e.target;
		const { type } = button.dataset;
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

	static handleDrawByEvent(e: {}): void{
		const options = Manager.extractOptions();
		Manager.drawGraph(options.filter, options.layout, window.selectedEvent, false);
	}

	static handleDrawByTimestamp(e: {}): void{
		const options = Manager.extractOptions();
		Manager.drawGraph(options.filter, options.layout, window.selectedTimestamp, true);
	}
}

export default HandleHolder;

// @flow
// Create a graph object
import "babel-polyfill";
import TVPPLog from "../../parserLib/TVPPLog";
import GraphManager from "../../parserLib/Graph/GraphManager";
import DijkstraFilter from "../../parserLib/Graph/Filter/Tree/Dijkstra/DijkstraFilter";
import AlgorithmR1 from "../../parserLib/Graph/Visualizer/Layout/Tree/AlgorithmR1";
import HandleHolder from "./DOM/HandleHolder";
import Manager from "./DOM/Manager";
import DOMUtils from "./DOM/Utils";

const Sigma = require("sigma");

window.logEntity = new TVPPLog({
	discriminateByPort: true
});
window.graphManager = new GraphManager(window.logEntity);

window.FilterType = DijkstraFilter;
window.FilterTypeOptions = {};

window.LayoutType = AlgorithmR1;
window.LayoutTypeOptions = {};

window.selectedEvent = 0;
window.selectedTimestamp = 0;

function createHandler(onLoadCb: any => any): Event => void {
	return evt => {
		const { target } = evt;
		if (target instanceof HTMLInputElement) {
			const { files } = target; // FileList object

			console.log("Reading file...");
			const reader = new FileReader();

			reader.onload = onLoadCb;

			reader.readAsBinaryString(files[0]);
		}
	};
}

DOMUtils.getGenericElementById<HTMLInputElement>("logOverlayFile").addEventListener("change", createHandler(Manager.parseOverlayLog), false);
DOMUtils.getGenericElementById<HTMLInputElement>("logPerformanceFile").addEventListener("change", createHandler(Manager.parsePerformanceLog), false);
DOMUtils.getGenericElementById<HTMLInputElement>("filterType").addEventListener("change", HandleHolder.handleMainFilterChange);
DOMUtils.getGenericElementById<HTMLInputElement>("layoutType").addEventListener("change", HandleHolder.handleLayoutChange);
DOMUtils.getGenericElementById<HTMLInputElement>("selectedEventNumber").addEventListener("change", HandleHolder.handleSelectedEventChange);
DOMUtils.getGenericElementById<HTMLInputElement>("selectedTimestamp").addEventListener("change", HandleHolder.handleTimestampChange);

Array.from(document.getElementsByClassName("tablinks")).forEach(el => {
	el.addEventListener("click", HandleHolder.handleStateGraphChange);
});

document.addEventListener("click", (e: MouseEvent) => {
	console.log(e);
	if (e.target instanceof HTMLSelectElement) {
		if (e.target && e.target.id === "_mainlayoutOptions_filter") {
			HandleHolder.handleSubFilterChange(e);
		}
	}
});

DOMUtils.getElementById("machineListTable").addEventListener("click", HandleHolder.handleMachineListButtonClick);

DOMUtils.getElementById("nextEvent").addEventListener("click", () => {
	const drawButtonDOM = DOMUtils.getElementById("drawEventNumber");
	const eventNumberDOM = DOMUtils.getGenericElementById<HTMLInputElement>("selectedEventNumber");
	eventNumberDOM.value = (window.selectedEvent + 1).toString();

	eventNumberDOM.dispatchEvent(new Event("change"));
	drawButtonDOM.dispatchEvent(new Event("click"));
});

DOMUtils.getElementById("prevEvent").addEventListener("click", () => {
	const drawButtonDOM = DOMUtils.getElementById("drawEventNumber");
	const eventNumberDOM = DOMUtils.getGenericElementById<HTMLInputElement>("selectedEventNumber");
	eventNumberDOM.value = (window.selectedEvent - 1).toString();

	eventNumberDOM.dispatchEvent(new Event("change"));
	drawButtonDOM.dispatchEvent(new Event("click"));
});

DOMUtils.getElementById("drawEventNumber").addEventListener("click", HandleHolder.handleDrawByEvent);
DOMUtils.getElementById("drawTimestamp").addEventListener("click", HandleHolder.handleDrawByTimestamp);

// DOMUtils.getElementById("preserveCurrentLayout").addEventListener("change", HandleHolder.handleLayoutPreservationChange);
DOMUtils.getElementById("disableEdges").addEventListener("change", HandleHolder.handleDisableEdgesChange);

(() => {
	window.sigmaPrevious = new Sigma({
		renderer: {
			container: DOMUtils.getElementById("containerPrevious"),
			type: "canvas"
		},
		settings: {
			autoRescale: false,
			autoResize: false
		}
	});
	window.sigmaPrevious.bind("clickNode", HandleHolder.handleSigmaClick);
	window.sigmaPrevious.helperHolder = {
		edgesHolder: {},
		managedButtons: [],
		byPassInNodes: [],
		byPassOutNodes: []
	};

	window.sigmaComparision = new Sigma({
		renderer: {
			container: DOMUtils.getElementById("containerComparision"),
			type: "canvas"
		},
		settings: {
			autoRescale: false,
			autoResize: false
		}
	});
	window.sigmaComparision.bind("clickNode", HandleHolder.handleSigmaClick);
	window.sigmaComparision.helperHolder = {
		edgesHolder: {},
		managedButtons: [],
		byPassInNodes: [],
		byPassOutNodes: []
	};

	window.sigmaCurrent = new Sigma({
		renderer: {
			container: DOMUtils.getElementById("containerCurrent"),
			type: "canvas"
		},
		settings: {
			autoRescale: false,
			autoResize: false
		}
	});
	window.sigmaCurrent.helperHolder = {
		edgesHolder: {},
		managedButtons: [],
		byPassInNodes: [],
		byPassOutNodes: []
	};
	window.sigmaCurrent.bind("clickNode", HandleHolder.handleSigmaClick);

	Manager.init();
	console.log("App started");

	const overlayFileEl = DOMUtils.getGenericElementById<HTMLInputElement>("logOverlayFile");
	const performanceFileEl = DOMUtils.getGenericElementById<HTMLInputElement>("logPerformanceFile");

	if (overlayFileEl.files.length !== 0) {
		overlayFileEl.dispatchEvent(new Event("change"));
	}
	if (performanceFileEl.files.length !== 0) {
		performanceFileEl.dispatchEvent(new Event("change"));
	}
})();

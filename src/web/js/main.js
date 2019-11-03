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
import Utils from "../../utils";

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

DOMUtils.getGenericElementById<HTMLInputElement>("logOverlayFile").addEventListener("change", Utils.createHandler(Manager.parseOverlayLog), false);
DOMUtils.getGenericElementById<HTMLInputElement>("logPerformanceFile").addEventListener("change", Utils.createHandler(Manager.parsePerformanceLog), false);
DOMUtils.getGenericElementById<HTMLInputElement>("filterType").addEventListener("change", HandleHolder.handleMainFilterChange);
DOMUtils.getGenericElementById<HTMLInputElement>("layoutType").addEventListener("change", HandleHolder.handleLayoutChange);
DOMUtils.getGenericElementById<HTMLInputElement>("selectedEventNumber").addEventListener("change", HandleHolder.handleSelectedEventChange);
DOMUtils.getGenericElementById<HTMLInputElement>("selectedTimestamp").addEventListener("change", HandleHolder.handleTimestampChange);
DOMUtils.getGenericElementById<HTMLInputElement>("saveOutput").addEventListener("change", HandleHolder.handleSaveOutputChange);
DOMUtils.getGenericElementById<HTMLInputElement>("generatePartnerLog").addEventListener("click", HandleHolder.handleGeneratePartnerLog);

Array.from(document.getElementsByClassName("tablinks")).forEach(el => {
	el.addEventListener("click", HandleHolder.handleStateGraphChange);
});

DOMUtils.getElementById("machineListTable").addEventListener("click", HandleHolder.handleMachineListButtonClick);

DOMUtils.getElementById("nextEvent").addEventListener("click", HandleHolder.handleNextButtonClick);

DOMUtils.getElementById("prevEvent").addEventListener("click", HandleHolder.handlePrevButtonClick);

DOMUtils.getElementById("drawEventNumber").addEventListener("click", HandleHolder.handleDrawByEvent);
DOMUtils.getElementById("drawTimestamp").addEventListener("click", HandleHolder.handleDrawByTimestamp);

// DOMUtils.getElementById("preserveCurrentLayout").addEventListener("change", HandleHolder.handleLayoutPreservationChange);
DOMUtils.getElementById("disableEdges").addEventListener("change", HandleHolder.handleDisableEdgesChange);
DOMUtils.getElementById("autoNext").addEventListener("click", HandleHolder.handleToggleAutoNext);
DOMUtils.getElementById("takeSnapshot").addEventListener("click", HandleHolder.handleTakeSnapShot);
DOMUtils.getElementById("extractOverlay").addEventListener("click", HandleHolder.handleExtractOverlay);
DOMUtils.getElementById("extractLayerLog").addEventListener("click", HandleHolder.handleExtractLayerLog);

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
	window.sigmaPrevious.cameras[0].goTo({ x: 0, y: 0, angle: 0, ratio: 2 });

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
			autoResize: false,
			ratio: 2
		}
	});
	window.sigmaComparision.bind("clickNode", HandleHolder.handleSigmaClick);
	window.sigmaComparision.cameras[0].goTo({ x: 0, y: 0, angle: 0, ratio: 2 });

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
			autoResize: false,
			ratio: 2
		}
	});
	window.sigmaCurrent.helperHolder = {
		edgesHolder: {},
		managedButtons: [],
		byPassInNodes: [],
		byPassOutNodes: []
	};
	window.sigmaCurrent.bind("clickNode", HandleHolder.handleSigmaClick);
	window.sigmaCurrent.cameras[0].goTo({ x: 0, y: 0, angle: 0, ratio: 2 });

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

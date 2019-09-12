// @flow
// Create a graph object
import "babel-polyfill";
import TVPPLog from "../../parserLib/TVPPLog";
import GraphManager from "../../parserLib/Graph/GraphManager";
import DijkstraFilter from "../../parserLib/Graph/Filter/Tree/DijkstraFilter";
import AlgorithmR1 from "../../parserLib/Graph/Visualizer/Layout/Tree/AlgorithmR1";
import DOMManager from "./DOMManager";

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

function draw() {
	const options = DOMManager.extractOptions();
	DOMManager.drawGraph(window.selectedEvent, options.filter, options.layout);
}

function createHandler(onLoadCb) {
	return evt => {
		const { files } = evt.target; // FileList object
		console.log("Reading file...");
		const reader = new FileReader();

		reader.onload = onLoadCb;

		reader.readAsBinaryString(files[0]);
	};
}

document.getElementById("logOverlayFile").addEventListener("change", createHandler(DOMManager.parseOverlayLog), false);

document.getElementById("logPerformanceFile").addEventListener("change", createHandler(DOMManager.parsePerformanceLog), false);

document.getElementById("filterType").addEventListener("change", DOMManager.handleMainFilterChange);

document.getElementById("layoutType").addEventListener("change", DOMManager.handleLayoutChange);

document.getElementById("selectedEventNumber").addEventListener("change", DOMManager.handleSelectedEventChange);

Array.from(document.getElementsByClassName("tablinks")).forEach(el => {
	el.addEventListener("click", DOMManager.handleStateGraphChange);
});

document.addEventListener("click", e => {
	if (e.target && e.target.id === "_mainlayoutOptions_filter") {
		DOMManager.handleSubFilterChange(e);
	}
});

document.getElementById("machineListTable").addEventListener("click", DOMManager.handleMachineListButtonClick);

document.getElementById("nextEvent").addEventListener("click", e => {
	const drawButtonDOM = document.getElementById("draw");
	const eventNumberDOM = document.getElementById("selectedEventNumber");
	eventNumberDOM.value = window.selectedEvent + 1;
	eventNumberDOM.dispatchEvent(new Event("change"));
	drawButtonDOM.dispatchEvent(new Event("click"));
});

document.getElementById("prevEvent").addEventListener("click", e => {
	const drawButtonDOM = document.getElementById("draw");
	const eventNumberDOM = document.getElementById("selectedEventNumber");
	eventNumberDOM.value = window.selectedEvent - 1;
	eventNumberDOM.dispatchEvent(new Event("change"));
	drawButtonDOM.dispatchEvent(new Event("click"));
});

document.getElementById("draw").addEventListener("click", draw);

document.getElementById("preserveCurrentLayout").addEventListener("change", DOMManager.handleLayoutPreservationChange);

(() => {
	window.sigmaPrevious = new Sigma({
		renderer: {
			container: document.getElementById("containerPrevious"),
			type: "canvas"
		},
		settings: {
			autoRescale: false,
			autoResize: false
		}
	});
	window.sigmaPrevious.bind("clickNode", DOMManager.handleSigmaClick);
	window.sigmaPrevious.helperHolder = {
		edgesHolder: {},
		managedButtons: [],
		byPassInNodes: [],
		byPassOutNodes: []
	};

	window.sigmaComparision = new Sigma({
		renderer: {
			container: document.getElementById("containerComparision"),
			type: "canvas"
		},
		settings: {
			autoRescale: false,
			autoResize: false
		}
	});
	window.sigmaComparision.bind("clickNode", DOMManager.handleSigmaClick);
	window.sigmaComparision.helperHolder = {
		edgesHolder: {},
		managedButtons: [],
		byPassInNodes: [],
		byPassOutNodes: []
	};

	window.sigmaCurrent = new Sigma({
		renderer: {
			container: document.getElementById("containerCurrent"),
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
	window.sigmaCurrent.bind("clickNode", DOMManager.handleSigmaClick);

	DOMManager.init();
	console.log("App started");

	const overlayFileEl = document.getElementById("logOverlayFile");
	const performanceFileEl = document.getElementById("logPerformanceFile");

	if (overlayFileEl.files.length !== 0) {
		overlayFileEl.dispatchEvent(new Event("change"));
	}
	if (performanceFileEl.files.length !== 0) {
		performanceFileEl.dispatchEvent(new Event("change"));
	}
})();

// Create a graph object
import "babel-polyfill";
import TVPPLog from "../../parserLib/TVPPLog";
import LogParserOverlay from "../../parserLib/Log/Overlay/LogParserOverlay";
import LogParserPerformance from "../../parserLib/Log/Performance/LogParserPerformance";
import GraphManager from "../../parserLib/Graph/GraphManager";
import RingTopology from "../../parserLib/Graph/Visualizer/Topology/RingTopology";
import StarTopology from "../../parserLib/Graph/Visualizer/Topology/StarTopology";
import DijkstraFilter from "../../parserLib/Graph/Filter/DijkstraFilter";

const Sigma = require("sigma");

let loadedPerformance = false;
let loadedOverlay = false;

window.logEntity = new TVPPLog();
window.graphManager = null;

window.FilterType = DijkstraFilter;
window.FilterTypeOptions = {};

window.TopologyType = StarTopology;
window.TopologyTypeOptions = { radius: 30 };

window.selectedEvent = 0;

function prevState() {}

function nextState() {}

function handleSelectedEventChange(e) {
	if (e.target.value < window.logEntity.eventList.length)
		window.selectedEvent = Number(e.target.value);
	else window.selectedEvent = Number(window.logEntity.eventList.length);
	e.target.value = window.selectedEvent;
}

function handleTopologyTypeChange(e) {
	const { value } = e.target;

	switch (value) {
		default:
		case "RingToplogy":
			window.typeTopology = RingTopology;
			window.topologyTypeOptions = { radius: 100 };
			break;
		case "StarTopology":
			window.typeTopology = StarTopology;
			break;
	}
}

function handleFilterTypeChange(e) {
	const { value } = e.target;

	switch (value) {
		default:
		case "NoFilter":
			window.FilterType = null;
			break;
		case "DijkstraFilter":
			window.FilterType = DijkstraFilter;
			break;
	}
}

function startGraph() {
	window.graphManager = new GraphManager(window.logEntity);
	window.graphManager.goToAbsoluteState(window.selectedEvent);

	let filter = null;
	let topology = null;
	if (
		window.FilterType != null &&
		window.FilterType.name === "DijkstraFilter"
	) {
		// The first machine on the log is the server
		const options = {
			source: window.logEntity.discriminateByPort
				? `${window.logEntity.eventList[0].machine}:${window.logEntity.eventList[0].port}`
				: window.logEntity.eventList[0].machine
		};

		filter = new window.FilterType(
			window.graphManager.graphHolder,
			options
		);
		filter.applyFilter();
	} else {
		console.log("remove me");
	}
	if(window.TopologyType.name === "StarTopology"){
		window.TopologyTypeOptions['distancesFromSource'] = filter.distancesFromSource;
		window.TopologyTypeOptions['fathers'] = filter.fathers;
		topology = new window.TopologyType(
			window.graphManager.graphHolder,
			window.logEntity.machines,
			window.TopologyTypeOptions
		);
	}else {
		topology = new window.TopologyType(
			window.graphManager.graphHolder,
			window.logEntity.machines,
			window.TopologyTypeOptions
		);
	}
	topology.updatePositions();
	topology.synchronizeSigma(window.sigma);

	window.sigma.refresh();
}

function draw() {
	startGraph();
}

const parseOverlayLog = function(e) {
	console.log("Overlay log read.");
	LogParserOverlay.parse(e.currentTarget.result.split("\n")).then(
		entryArray => {
			console.log(`Parsed ${entryArray.length} lines from overlay log`);
			window.logEntity.addOverlayEntries(entryArray);
			document.getElementById("numberOfEvents").innerHTML = entryArray.length;
			loadedOverlay = true;
		}
	);
};

const parsePerformanceLog = function(e) {
	console.log("Performance log read.");
	LogParserPerformance.parse(e.currentTarget.result.split("\n")).then(
		entryArray => {
			console.log(`Parsed ${entryArray.length} lines from performance log`);
			window.logEntity.addPerfomanceEntries(entryArray);
			loadedPerformance = true;
			if (loadedOverlay) {
				// Do the thing
			}
		}
	);
};

function createHandler(onLoadCb) {
	return function(evt) {
		const { files } = evt.target; // FileList object

		// files is a FileList of File objects. List some properties.
		const output = [];

		Object.keys(files).forEach(fileKey => {
			const f = files[fileKey];
			output.push(
				"<li><strong>",
				escape(f.name),
				"</strong> (",
				f.type || "n/a",
				") - ",
				f.size,
				" bytes, last modified: ",
				f.lastModifiedDate.toLocaleDateString(),
				"</li>"
			);
		});

		document.getElementById("list").innerHTML = `<ul>${output.join("")}</ul>`;

		console.log("Reading file...");
		const reader = new FileReader();

		reader.onload = onLoadCb;

		reader.readAsBinaryString(files[0]);
	};
}

document
	.getElementById("logOverlayFile")
	.addEventListener("change", createHandler(parseOverlayLog), false);

document
	.getElementById("logPerformanceFile")
	.addEventListener("change", createHandler(parsePerformanceLog), false);

document
	.getElementById("filterType")
	.addEventListener("change", handleFilterTypeChange);

document
	.getElementById("topologyType")
	.addEventListener("change", handleTopologyTypeChange);

document
	.getElementById("selectedEventNumber")
	.addEventListener("change", handleSelectedEventChange);

document.getElementById("draw").addEventListener("click", draw);

document.addEventListener("keydown", e => {
	switch (e.keyCode) {
		case 37: // left
			prevState();
			break;
		case 39: // right
			nextState();
			break;
		default:
			return; // exit this handler for other keys
	}
	e.preventDefault(); // prevent the default action (scroll / move caret)
});

(function() {
	window.sigma = new Sigma({
		renderer: {
			container: document.getElementById("container"),
			type: "canvas"
		},
		settings: {
			minEdgeSize: 0.1,
			maxEdgeSize: 2,
			minNodeSize: 1,
			maxNodeSize: 8
		}
	});

	console.log("Hello world");
})();

// Create a graph object
import "babel-polyfill";
import TVPPLog from "../../parserLib/TVPPLog";
import LogParserOverlay from "../../parserLib/Log/Overlay/LogParserOverlay";
import LogParserPerformance from "../../parserLib/Log/Performance/LogParserPerformance";
import GraphManager from "../../parserLib/Graph/GraphManager";
import RingLayout from "../../parserLib/Graph/Visualizer/Layout/RingLayout";
import RingLayeredLayout from "../../parserLib/Graph/Visualizer/Layout/RingLayeredLayout";
import DijkstraFilter from "../../parserLib/Graph/Filter/Tree/DijkstraFilter";
import SpringLayout from "../../parserLib/Graph/Visualizer/Layout/SpringLayout";
import AlgorithmR1 from "../../parserLib/Graph/Visualizer/Layout/AlgorithmR1";
import DOMManager from "./DOMManager";
import VisualizationManager from "./VisualizationManager";

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
  VisualizationManager.drawGraph(
    window.selectedEvent,
    options.filter,
    options.layout
  );
}

function createHandler(onLoadCb) {
  return function (evt) {
    const {files} = evt.target; // FileList object
    console.log("Reading file...");
    const reader = new FileReader();

    reader.onload = onLoadCb;

    reader.readAsBinaryString(files[0]);
  };
}

document
  .getElementById("logOverlayFile")
  .addEventListener("change", createHandler(DOMManager.parseOverlayLog), false);

document
  .getElementById("logPerformanceFile")
  .addEventListener(
    "change",
    createHandler(DOMManager.parsePerformanceLog),
    false
  );

document
  .getElementById("filterType")
  .addEventListener("change", DOMManager.handleMainFilterChange);

document
  .getElementById("layoutType")
  .addEventListener("change", DOMManager.handleLayoutChange);

document
  .getElementById("selectedEventNumber")
  .addEventListener("change", DOMManager.handleSelectedEventChange);

Array.from(document
  .getElementsByClassName("tablinks")).forEach(el => {
  el.addEventListener("click", DOMManager.handleStateGraphChange);
});


document.addEventListener("click", function (e) {
  if (e.target && e.target.id === "_mainlayoutOptions_filter") {
    DOMManager.handleSubFilterChange(e);
  }
});

document.getElementById('machineListTable').addEventListener("click", DOMManager.handleMachineListButtonClick);

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

(function () {
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
  window.sigmaPrevious.bind('clickNode', DOMManager.handleSigmaClick);
  window.sigmaPrevious.helperHolder = {
    managedButtons: [],
    byPassInNodes: [],
    byPassOutNodes: [],
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
  window.sigmaComparision.bind('clickNode', DOMManager.handleSigmaClick);
  window.sigmaComparision.helperHolder = {
    managedButtons: [],
    byPassInNodes: [],
    byPassOutNodes: [],
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
    managedButtons: [],
    byPassInNodes: [],
    byPassOutNodes: [],
  };
  window.sigmaCurrent.bind('clickNode', DOMManager.handleSigmaClick);

  DOMManager.init();
  console.log("App started");
})();

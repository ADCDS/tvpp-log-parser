// Create a graph object
import "babel-polyfill";
import TVPPLog from "../../parserLib/TVPPLog";
import LogParserOverlay from "../../parserLib/Log/Overlay/LogParserOverlay";
import LogParserPerformance from "../../parserLib/Log/Performance/LogParserPerformance";
import GraphManager from "../../parserLib/Graph/GraphManager";
import RingTopology from "../../parserLib/Graph/Visualizer/Topology/RingTopology";

const Sigma = require("sigma");

let loadedPerformance = false;
let loadedOverlay = false;

window.logEntity = new TVPPLog();
window.graphManager = null;
window.currentEvent = 0;

function prevState() {}

function nextState() {}

function startGraph() {
  window.graphManager = new GraphManager(window.logEntity);
  window.graphManager.goToLastState();
  const ringTopology = new RingTopology(
    window.graphManager.graphHolder,
    window.logEntity.machines,
    100
  );
  ringTopology.updatePositions();
  ringTopology.synchronizeSigma(window.sigma);
  window.sigma.refresh();
}

const parseOverlayLog = function(e) {
  console.log("Overlay log read.");
  LogParserOverlay.parse(e.currentTarget.result.split("\n")).then(
    entryArray => {
      console.log(`Parsed ${entryArray.length} lines from overlay log`);
      window.logEntity.addOverlayEntries(entryArray);
      loadedOverlay = true;
      startGraph();
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
  document.getElementById("prev").addEventListener(
    "click",
    () => {
      prevState();
    },
    false
  );
  document.getElementById("next").addEventListener(
    "click",
    () => {
      nextState();
    },
    false
  );

  console.log("Hello world");
})();

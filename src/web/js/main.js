// Create a graph object
import "babel-polyfill";
import LogParserOverlay from "../../parserLib/overlay/LogParserOverlay";
import TVPPLog from "../../parserLib/TVPPLog";

const Sigma = require("sigma");

window.logEntity = new TVPPLog();
window.currentEvent = 0;

const arrowChar = {
  in: "<",
  out: ">"
};

function nextState() {
  const currState = window.logEntity.eventList[window.currentEvent];
  window.currentEvent += 1;
  const N = Object.keys(window.logEntity.machines).length + 1;
  const currentMachine = `${currState.machine}:${currState.port}`;

  try {
    window.sigma.graph.addNode({
      id: currentMachine,
      label: currentMachine,
      x: 100 * Math.cos((2 * window.sigma.graph.nodes().length * Math.PI) / N),
      y: 100 * Math.sin((2 * window.sigma.graph.nodes().length * Math.PI) / N),
      size: 3,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    });
  } catch (e) {
    // Silence is gold
    console.log(e);
  }

  ["in", "out"].forEach(type => {
    if (currState.added[type].length > 0) {
      currState.added[type].forEach(el => {
        try {
          window.sigma.graph.addNode({
            id: el,
            label: el,
            x:
              100 *
              Math.cos((2 * window.sigma.graph.nodes().length * Math.PI) / N),
            y:
              100 *
              Math.sin((2 * window.sigma.graph.nodes().length * Math.PI) / N),
            size: 3,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
          });
          window.sigma.graph.addEdge({
            id: `${currentMachine}_${arrowChar[type]}_${el}`,
            source: currentMachine,
            target: el,
            type: "arrow"
          });
        } catch (e) {
          // Silence is gold
          console.log(e);
        }
      });
    }
  });

  if (currState.removed.length > 0) {
    currState.removed.forEach(el => {
      window.sigma.graph.dropEdge(`${currentMachine}_${el}`);
    });
  }
  window.sigma.refresh();
}

function prevState() {
  const currState = window.logEntity.eventList[window.currentEvent];
  window.currentEvent -= 1;
  const N = Object.keys(window.logEntity.machines).length + 1;
  const currentMachine = `${currState.machine}:${currState.port}`;

  try {
    window.sigma.graph.addNode({
      id: currentMachine,
      label: currentMachine,
      x: 100 * Math.cos((2 * window.sigma.graph.nodes().length * Math.PI) / N),
      y: 100 * Math.sin((2 * window.sigma.graph.nodes().length * Math.PI) / N),
      size: 3,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    });
  } catch (e) {
    // Silence is gold
    console.log(e);
  }

  if (currState.added.length > 0) {
    currState.added.forEach(el => {
      window.sigma.graph.dropEdge(`${currentMachine}_${el}`);
    });
  }
  if (currState.removed.length > 0) {
    currState.removed.forEach(el => {
      try {
        window.sigma.graph.addNode({
          id: el,
          label: el,
          x:
            100 *
            Math.cos((2 * window.sigma.graph.nodes().length * Math.PI) / N),
          y:
            100 *
            Math.sin((2 * window.sigma.graph.nodes().length * Math.PI) / N),
          size: 3,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        });
        window.sigma.graph.addEdge({
          id: `${currentMachine}_${el}`,
          source: currentMachine,
          target: el
        });
      } catch (e) {
        // Silence is gold
        console.log(e);
      }
    });
  }
  window.sigma.refresh();
}

function handleFileSelect(evt) {
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

  reader.onload = function(e) {
    console.log("File read.");
    LogParserOverlay.parse(e.currentTarget.result.split("\n")).then(
      entryArray => {
        console.log(`Parsed ${entryArray.length} lines`);
        window.logEntity.addEntries(entryArray);
      }
    );
  };
  reader.readAsBinaryString(files[0]);
}

document
  .getElementById("logfile")
  .addEventListener("change", handleFileSelect, false);

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

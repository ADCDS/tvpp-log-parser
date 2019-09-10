import Utils from "../../utils";
import Filter from "../../parserLib/Graph/Filter/Filter";
import LogParserOverlay from "../../parserLib/Log/Overlay/LogParserOverlay";
import LogParserPerformance from "../../parserLib/Log/Performance/LogParserPerformance";
import VisualizationManager from "./VisualizationManager";

class DOMManager {
  static sourceOptions = {
    filterOptions: [],
    layoutOptions: [],
    subFilterOptions: []
  };

  static selectedFilter = null;

  static selectedLayout = null;

  static selectedLayoutFilter = null;

  static selectedNode = null;

  static selectedSigma = null;

  static init() {
    // Show starting options

    // Get available layouts and filters
    const availableFilters = Utils.filters;
    const availableLayouts = Utils.layouts;

    const filterTypeDOM = document.getElementById("filterType");
    const layoutTypeDOM = document.getElementById("layoutType");

    const availableFiltersKeys = Object.keys(availableFilters);
    availableFiltersKeys.forEach(el => {
      const value = availableFilters[el];
      filterTypeDOM.innerHTML += `<option value='${value.id}'>${value.name}</option>`;
    });

    const availableLayoutsKeys = Object.keys(availableLayouts);
    availableLayoutsKeys.forEach(index => {
      const value = availableLayouts[index];
      layoutTypeDOM.innerHTML += `<option value='${value.id}'>${value.name}</option>`;
    });

    // Select default elements
    filterTypeDOM.value = availableFilters[availableFiltersKeys[0]].id;
    filterTypeDOM.dispatchEvent(new Event("change"));

    layoutTypeDOM.value = availableLayouts[availableLayoutsKeys[0]].id;
    layoutTypeDOM.dispatchEvent(new Event("change"));

    document
      .getElementById("btnCurrentState")
      .dispatchEvent(new Event("click"));
  }

  static getInputFromOption(inputId, option) {
    if (!(option.type.prototype instanceof Filter || option.type === Filter)) {
      // If we are not dealing with a filter
      const inputType = DOMManager.getInputType(option.type);

      return `<label for='${inputId}'>${
        option.name
      }</label><input id ='${inputId}' type='${inputType}' ${DOMManager.getDefaultAttr(
        option.type,
        option.default
      )}>`;
    }
    // If we area dealing with a filter option

    // Get all filters that we can use
    const availableFilters = Utils.getFiltersByType(option.type);
    let res = "<div class='layoutSubFilter'>";
    res += `<label for='${inputId}'>Filter</label><select id='${inputId}'>`;
    availableFilters.forEach(value => {
      res += `<option value='${value.id}'>${value.name}</option>`;
    });
    res += "</select>";

    // Generate sub filter config option
    // Default filter
    const filter = (this.selectedLayoutFilter = availableFilters[0]);
    res += "<div id='subFilterOptionsHolder'>";
    res += DOMManager.generateOptionsForm(
      "subFilterOptions",
      filter.class.getOptions()
    );
    res += "</div></div>";
    return res;
  }

  static parseInputValue(configType, element) {
    const {value} = element;
    if (configType === String) return String(value);
    if (configType === Number) return Number(value);
    if (configType === Boolean) return element.checked;

    if (configType.prototype instanceof Filter || configType === Filter) {
      const layoutFilterFormHolderId = "subFilterOptions";
      return DOMManager.getOptions(
        layoutFilterFormHolderId,
        DOMManager.selectedLayoutFilter.class.getOptions()
      );
    }
  }

  static getInputType(configType) {
    if (configType === String) return "text";
    if (configType === Number) return "number";
    if (configType === Boolean) return "checkbox";
  }

  static getDefaultAttr(configType, defaultValue) {
    if (configType === Boolean) {
      if (defaultValue === true) {
        return "checked = 'checked'";
      }
      return "";
    }
    if (configType === String || configType === Number) {
      return `value = '${defaultValue}'`;
    }
  }

  static generateOptionsForm(formHolderId, options) {
    DOMManager.sourceOptions[formHolderId] = [];

    let resHTML = "";
    Object.keys(options).forEach(el => {
      const option = options[el];

      const inputId = `_main${formHolderId}_${el}`;
      if (option.default === "::src") {
        DOMManager.sourceOptions[formHolderId].push(inputId);
      }
      resHTML += DOMManager.getInputFromOption(inputId, option);
    });
    return resHTML;
  }

  static handleSubFilterChange(e) {
    const filter = Utils.getFilter(e.target.value);
    DOMManager.selectedLayoutFilter = filter;
    document.getElementById(
      "subFilterOptionsHolder"
    ).innerHTML = DOMManager.generateOptionsForm(
      "subFilterOptions",
      filter.class.getOptions()
    );
    DOMManager.updateDefaultsOptionValues();
  }

  static handleMainFilterChange(e) {
    const filter = Utils.getFilter(e.target.value);
    const formHolderId = "filterOptions";
    const filterOptions = document.getElementById(formHolderId);
    DOMManager.selectedFilter = filter;
    filterOptions.innerHTML = DOMManager.generateOptionsForm(
      formHolderId,
      filter.class.getOptions()
    );
    DOMManager.updateDefaultsOptionValues();
  }

  static handleLayoutChange(e) {
    const layout = Utils.getLayout(e.target.value);
    const formHolderId = "layoutOptions";
    const filterOptions = document.getElementById(formHolderId);
    DOMManager.selectedLayout = layout;
    filterOptions.innerHTML = DOMManager.generateOptionsForm(
      formHolderId,
      layout.class.getOptions()
    );
    DOMManager.updateDefaultsOptionValues();
  }

  static handleSelectedEventChange(e) {
    if (e.target.value < window.logEntity.sourceApparitionLocations.length)
      window.selectedEvent = Number(e.target.value);
    else
      window.selectedEvent = Number(
        window.logEntity.sourceApparitionLocations.length
      );
    e.target.value = window.selectedEvent;
  }

  static syncMachinesList() {
    let resHTML = "";
    document.getElementById("machineListTable").innerHTML = "";
    let i = 1;
    Object.keys(window.logEntity.machines).forEach(index => {
      const value = window.logEntity.machines[index];
      resHTML += `<tr id="machRow_${value.address}" data-addr="${value.address}"><td>${i++}</td><td>${value.address}</td><td id="machClassification_${value.address}">${value.bandwidthClassification}</td><td>
<button data-type="in">In</button>
<button data-type="out">Out</button>
</td></tr>`;
    });
    document.getElementById("machineListTable").innerHTML = resHTML;
  }

  static updateClassifications() {
    Object.keys(window.logEntity.machines).forEach(index => {
      const value = window.logEntity.machines[index];
      const element = document.getElementById("machClassification_" + value.address);
      if (!element) {
        console.log("Machine " + value.address + " appears on Perfomance Log but doesn't appear mainly at Overlay Log");
      } else {
        element.innerHTML = value.bandwidthClassification;
      }
    });
  }

  static updateDefaultsOptionValues() {
    ["filterOptions", "layoutOptions", "subFilterOptions"].forEach(
      optionType => {
        DOMManager.sourceOptions[optionType].forEach((value, index) => {
          const el = document.getElementById(value);
          if (!el) {
            DOMManager.sourceOptions[optionType].splice(index, 1);
            return;
          }
          if (
            window.logEntity.sourceMachineKey !== null &&
            el.value === "::src"
          ) {
            el.value = window.logEntity.sourceMachineKey;
          }
        });
      }
    );
  }

  static async parseOverlayLog(e) {
    console.log("Overlay log read.");
    const entryArray = await LogParserOverlay.parse(e.currentTarget.result.split("\n"));
    console.log(`Parsed ${entryArray.length} lines from overlay log`);
    window.logEntity.addOverlayEntries(entryArray);
    window.graphManager.syncMachines();
    document.getElementById("numberOfEvents").value =
      window.logEntity.sourceApparitionLocations.length;
    document.getElementById("numberOfNodes").value = Object.keys(
      window.logEntity.machines
    ).length;
    DOMManager.syncMachinesList();

    // Update defaults ::src
    DOMManager.updateDefaultsOptionValues();
  }

  static async parsePerformanceLog(e) {
    console.log("Performance log read.");
    const entryArray = await LogParserPerformance.parse(e.currentTarget.result.split("\n"));
    console.log(`Parsed ${entryArray.length} lines from performance log`);
    window.logEntity.addPerformanceEntries(entryArray);
    DOMManager.updateClassifications();
  }

  static getOptions(formHolderId, options) {
    const resObj = {};
    Object.keys(options).forEach(el => {
      const option = options[el];
      const inputId = `_main${formHolderId}_${el}`;
      const element = document.getElementById(inputId);
      resObj[el] = DOMManager.parseInputValue(option.type, element);
    });
    return resObj;
  }

  static synchronizeSigma(sigma) {
    const graphHolder = sigma.helperHolder.graphHolder.filtered;
    const unfilteredGraphHolder = sigma.helperHolder.graphHolder.original;
    const nodeHolder = sigma.helperHolder.nodeHolder;
    const edgesHolder = sigma.helperHolder.edgesHolder;
    const byPassInNodes = sigma.helperHolder.byPassInNodes;
    const byPassOutNodes = sigma.helperHolder.byPassOutNodes;

    sigma.graph.clear();

    // Add nodes
    Object.keys(nodeHolder).forEach(machineKey => {
      const node = {...nodeHolder[machineKey]};
      sigma.graph.addNode(node);
    });

    // Add edges
    Object.keys(nodeHolder).forEach(machineKey => {
      const edgesTo = graphHolder.getOutgoingEdges(machineKey);
      edgesTo.forEach(machineDest => {
          const edge = {
            id: `${machineKey}_>_${machineDest}`,
            source: machineKey,
            target: machineDest,
            size: 2,
            type: "arrow"
          };
          if (edgesHolder[machineKey] && edgesHolder[machineKey][machineDest]) {
            Object.assign(edge, edgesHolder[machineKey][machineDest]);
          }
        try {
          sigma.graph.addEdge(edge);
        } catch (e) {
          console.log("Sigma exception: " + e);
        }
      });
    });

    // Update bypasses
    byPassOutNodes.forEach(machineKey => {
      const edgesTo = unfilteredGraphHolder.getOutgoingEdges(machineKey);
      edgesTo.forEach(machineDest => {
          const edge = {
            id: `${machineKey}_>_${machineDest}`,
            source: machineKey,
            target: machineDest,
            size: 2,
            type: "arrow"
          };
          if (edgesHolder[machineKey] && edgesHolder[machineKey][machineDest]) {
            Object.assign(edge, edgesHolder[machineKey][machineDest]);
          }
        try {
          sigma.graph.addEdge(edge);
        } catch (e) {
          console.log("Sigma exception: " + e);
        }
      });
    });

    // Update bypasses
    byPassInNodes.forEach(machineTo => {
      // Get the edges that point to me
      const edgesTo = unfilteredGraphHolder.getMachinesThatPointTo(machineTo);
      edgesTo.forEach(machineFrom => {
          let edge = {
            id: `${machineFrom}_>_${machineTo}`,
            source: machineFrom,
            target: machineTo,
            size: 2,
            type: "arrow"
          };
          if (edgesHolder[machineFrom] && edgesHolder[machineFrom][machineTo]) {
            Object.assign(edge, edgesHolder[machineFrom][machineTo]);
          }
        try {
          sigma.graph.addEdge(edge);
        } catch (e) {
          console.log("Sigma exception: " + e);
        }
      });
    });

    sigma.refresh();
  }

  static extractOptions() {
    const filterFormHolderId = "filterOptions";
    const filterOptions = DOMManager.getOptions(
      filterFormHolderId,
      DOMManager.selectedFilter.class.getOptions()
    );

    const layoutFormHolderId = "layoutOptions";
    const layoutOptions = DOMManager.getOptions(
      layoutFormHolderId,
      DOMManager.selectedLayout.class.getOptions()
    );

    return {
      filter: filterOptions,
      layout: layoutOptions
    };
  }

  static handleStateGraphChange(e) {
    const graphs = [
      "containerPrevious",
      "containerComparision",
      "containerCurrent"
    ];

    graphs.forEach(el => {
      document.getElementById(el).style.display = "none";
    });

    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(e.currentTarget.dataset.graph).style.display =
      "block";

    const sigmaObj = window[e.currentTarget.dataset.sigma];

    if (DOMManager.selectedSigma) {
      DOMManager.synchronizeMachineListButtons(DOMManager.selectedSigma, sigmaObj);
    }

    DOMManager.selectedSigma = sigmaObj;
    sigmaObj.refresh();

    e.currentTarget.className += " active";
  }

  static synchronizeMachineListButtons(oldSigma, newSigma) {
    const oldButtons = oldSigma.helperHolder.managedButtons;
    oldButtons.forEach(button => {
      button.style["border-style"] = "";
    });

    const newButtons = newSigma.helperHolder.managedButtons;
    newButtons.forEach(button => {
      button.style["border-style"] = "inset";
    });
  }

  static handleMachineListButtonClick(e) {
    const button = e.target;
    const type = button.dataset.type;
    if (!type) {
      const node = DOMManager.selectedSigma.helperHolder.nodeHolder[button.parentElement.dataset.addr];
      if (node)
        DOMManager.changeSelectedNode(node);
      return;
    }
    const machineId = button.parentElement.parentElement.dataset.addr;


    const isPressed = button.style["border-style"] === "inset";
    const helperHolder = DOMManager.selectedSigma.helperHolder;
    if (!isPressed) {
      if (type === "out") {
        VisualizationManager.displayAllToRelations(machineId, DOMManager.selectedSigma);
      } else {
        VisualizationManager.displayAllFromRelations(machineId, DOMManager.selectedSigma);
      }
      helperHolder.managedButtons.push(button);

      button.style["border-style"] = "inset";
    } else {
      if (type === "out") {
        VisualizationManager.hideAllToRelations(machineId, DOMManager.selectedSigma);
      } else {
        VisualizationManager.hideAllFromRelations(machineId, DOMManager.selectedSigma);
      }
      helperHolder.managedButtons.splice(helperHolder.managedButtons.indexOf(button), 1);
      button.style["border-style"] = "";
    }
  }

  static changeSelectedNode(node) {
    if (DOMManager.selectedNode) {
      document.getElementById('machRow_' + DOMManager.selectedNode.id).classList.remove('active');
    }
    DOMManager.selectedNode = node;
    document.getElementById('machRow_' + node.id).classList.add('active');
  }

  static handleSigmaClick(e) {
    DOMManager.changeSelectedNode(e.data.node);
    // VisualizationManager.displayAllToRelations(e.data.node, e.target);
  }
}

export default DOMManager;

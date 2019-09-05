import Utils from "../../utils";
import Filter from "../../parserLib/Graph/Filter/Filter";
import LogParserOverlay from "../../parserLib/Log/Overlay/LogParserOverlay";
import LogParserPerformance from "../../parserLib/Log/Performance/LogParserPerformance";

class DOMManager {
  static sourceOptions = {
    filterOptions: [],
    layoutOptions: [],
    subFilterOptions: []
  };

  static selectedFilter = null;

  static selectedLayout = null;

  static selectedLayoutFilter = null;

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
  }

  static getInputFromOption(inputId, option) {
    if (!(option.type.prototype instanceof Filter)) {
      // If we are not dealing with a filter
      const inputType = DOMManager.getInputType(option.type);

      return `<label for='${  inputId  }'>${  option.name  }</label><input id ='${  inputId  }' type='${  inputType  }' ${  DOMManager.getDefaultAttr(option.type, option.default)  }>`;
      );
    }
    // If we area dealing with a filter option

    // Get all filters that we can use
    const availableFilters = Utils.getFiltersByType(option.type);
    let res = "<div class='layoutSubFilter'>";
    res +=
      "<label for='" +
      inputId +
      "'>Filter</label><select id='" +
      inputId +
      "'>";
    availableFilters.forEach(value => {
      res += `<option value='${  value.id  }'>${  value.name  }</option>`;
    });
    res += "</select>";

    // Generate sub filter config option
    // Default filter
    const filter = (this.selectedLayoutFilter = availableFilters[0]);
    res += "<div>";
    res += DOMManager.generateOptionsForm(
      "subFilterOptions",
      filter.class.getOptions()
    );
    res += "</div></div>";
    return res;
  }

  static parseInputValue(configType, element) {
    const { value } = element;
    if (configType === String) return String(value);
    if (configType === Number) return Number(value);
    if (configType === Boolean) return element.checked;

    if (configType.prototype instanceof Filter) {
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
      return `value = '${  defaultValue  }'`;
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
    document.getElementById("machineListUl").innerHTML = "";
    let i = 1;
    Object.keys(window.logEntity.machines).forEach(index => {
      const value = window.logEntity.machines[index];
      document.getElementById("machineListUl").innerHTML +=
        `<li>${ 
        i++ 
        } - ${ 
        value.address 
        } Type: ${ 
        value.bandwidthClassification 
        }</li>`;
    });
  }

  static updateDefaultsOptionValues() {
    ["filterOptions", "layoutOptions", "subFilterOptions"].forEach(
      optionType => {
        DOMManager.sourceOptions[optionType].forEach(value => {
          const el = document.getElementById(value);
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

  static parseOverlayLog(e) {
    console.log("Overlay log read.");
    LogParserOverlay.parse(e.currentTarget.result.split("\n")).then(
      entryArray => {
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
    );
  }

  static parsePerformanceLog(e) {
    console.log("Performance log read.");
    LogParserPerformance.parse(e.currentTarget.result.split("\n")).then(
      entryArray => {
        console.log(`Parsed ${entryArray.length} lines from performance log`);
        window.logEntity.addPerformanceEntries(entryArray);
        DOMManager.syncMachinesList();
      }
    );
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
}

export default DOMManager;

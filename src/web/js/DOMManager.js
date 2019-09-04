import Utils from "../../utils";
import Filter from "../../parserLib/Graph/Filter/Filter";

class DOMManager {
  static init() {
    //Show starting options

    // Get available layouts and filters
    const availableFilters = Utils.filters;
    const availableLayouts = Utils.layouts;

    const filterTypeDOM = document.getElementById('filterType');
    const layoutTypeDOM = document.getElementById('layoutType');


    Object.keys(availableFilters).forEach(el => {
      const value = availableFilters[el];
      filterTypeDOM.innerHTML += "<option value='" + value.id + "'>" + value.name + "</option>";
    });

    Object.keys(availableLayouts).forEach(index => {
      const value = availableLayouts[index];
      layoutTypeDOM.innerHTML += "<option value='" + value.id + "'>" + value.name + "</option>";
    });

  }

  static getInputFromOption(inputId, option) {
    if (!(option.type.prototype instanceof Filter)) {
      // If we are not dealing with a filter
      const inputType = DOMManager.getInputType(option.type);
      return "<label for='" + inputId + "'>" + option.name + "</label><input id ='" + inputId + "' type='" + inputType + "' " + DOMManager.getDefaultAttr(option.type, option.default) + ">";
    } else {
      // If we area dealing with a filter option

      // Get all filters that we can use
      const availableFilters = Utils.getFiltersByType(option.type);
      let res = "<label for='" + inputId + "'>Filter</label><select id='" + inputId + "'>";
      availableFilters.forEach(value => {
        res += "<option value='" + value.id + "'>" + value.name + "</option>";
      });
      res += "</select>";
      return res;
    }
  }

  static getInputType(configType) {
    if (configType === String)
      return "text";
    if (configType === Number)
      return "number";
    if (configType === Boolean)
      return "checkbox"
  }

  static getDefaultAttr(configType, defaultValue) {
    if (configType === Boolean) {
      if (defaultValue === true) {
        return "checked = 'checked'";
      } else {
        return "";
      }
    }
    if (configType === String || configType === Number) {
      return "value = '" + defaultValue + "'";
    }
  }

  static updateOptionsForm(formHolderId, options) {
    const filterOptions = document.getElementById(formHolderId);
    let resHTML = "";
    Object.keys(options).forEach(el => {
      const option = options[el];
      resHTML += DOMManager.getInputFromOption("_mainFilterOptions_" + el, option);
    });
    filterOptions.innerHTML = resHTML;
  }

  static handleMainFilterChange(e) {
    const filter = Utils.getFilter(e.target.value);
    DOMManager.updateOptionsForm('filterOptions', filter.class.getOptions());
  };

  static handleLayoutChange(e) {
    const layout = Utils.getLayout(e.target.value);
    DOMManager.updateOptionsForm('layoutOptions', layout.class.getOptions());
  };
}

export default DOMManager;

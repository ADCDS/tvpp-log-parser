import DOMManager from "./DOMManager";

class VisualizationManager {
  static drawGraph(goToState, filterOptions, layoutOptions) {
    if (!DOMManager.selectedLayoutFilter) {
      throw "Layout Options missing subfilter"
    }

    const filterClass = DOMManager.selectedFilter.class;
    const layoutClass = DOMManager.selectedLayout.class;
    const layoutFilterClass = DOMManager.selectedLayoutFilter.class;

    const graphManager = window.graphManager;
    graphManager.goToAbsoluteServerApparition(goToState);
    const graphHolder = graphManager.getGraphHolder();

    // Apply layout filter
    const subFilterObj = new layoutFilterClass(layoutOptions.filter);
    const subFilterResult = subFilterObj.applyFilter(graphHolder);
    const layoutObj = new layoutClass(subFilterResult, graphManager.getMachines(), layoutOptions);
    layoutObj.updatePositions();

    // Apply filter
    const filterObj = new filterClass(filterOptions);
    const filterResult = filterObj.applyFilter(graphHolder);

    DOMManager.synchronizeSigma(filterResult.graphHolder, layoutObj.nodeHolder, window.sigmaCurrent);
  }
}

export default VisualizationManager;

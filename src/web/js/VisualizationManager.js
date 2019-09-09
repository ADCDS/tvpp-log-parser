import DOMManager from "./DOMManager";
import ComparisionLayout from "../../parserLib/Graph/Visualizer/Layout/ComparisionLayout";

const Sigma = require("sigma");

class VisualizationManager {
  static drawGraph(goToState, filterOptions, layoutOptions) {
    if (!DOMManager.selectedLayoutFilter) {
      throw "Layout Options missing subfilter"
    }
    const graphManager = window.graphManager;

    const lastEventIndex = graphManager.currentEventIndex;
    // We should store the last state on 'Previous Graph'
    document.getElementById('previousEvent').value = lastEventIndex;
    document.getElementById('previousStateEventId').innerHTML = '(' + lastEventIndex + ')';

    window.sigmaPrevious.graph.clear();
    window.sigmaPrevious.graph.read({
      nodes: window.sigmaCurrent.graph.nodes(),
      edges: window.sigmaCurrent.graph.edges()
    });
    window.sigmaPrevious.refresh();
    window.sigmaPrevious.nodeHolder = window.sigmaCurrent.nodeHolder;

    const filterClass = DOMManager.selectedFilter.class;
    const layoutClass = DOMManager.selectedLayout.class;
    const layoutFilterClass = DOMManager.selectedLayoutFilter.class;

    graphManager.goToAbsoluteServerApparition(goToState);
    const graphHolder = graphManager.getGraphHolder();
    window.originalCurrentGraphHolder = graphHolder;

    // Apply layout filter
    const subFilterObj = new layoutFilterClass(layoutOptions.filter);
    const subFilterResult = subFilterObj.applyFilter(graphHolder);

    const layoutObj = new layoutClass(subFilterResult, graphManager.getMachines(), layoutOptions);
    layoutObj.updatePositions();

    // Apply filter
    const filterObj = new filterClass(filterOptions);
    const filterResult = filterObj.applyFilter(graphHolder);
    window.filteredCurrentGraphHolder = filterResult.graphHolder;

    // Apply comparision layout
    if (window.oldSubFilterResult) {
      const comparisionLayout = new ComparisionLayout(subFilterResult, window.oldSubFilterResult, graphManager.getMachines());
      comparisionLayout.nodeHolder = layoutObj.cloneNodeHolder();
      comparisionLayout.updatePositions();
      window.sigmaComparision.nodeHolder = comparisionLayout.nodeHolder;
      DOMManager.synchronizeSigma(filterResult.graphHolder, comparisionLayout.nodeHolder, window.sigmaComparision);
    }
    window.oldSubFilterResult = subFilterResult;

    DOMManager.synchronizeSigma(filterResult.graphHolder, layoutObj.nodeHolder, window.sigmaCurrent);
    window.sigmaCurrent.nodeHolder = layoutObj.nodeHolder;

    /**
     * Update DOM
     * Maybe this should be in DOMManager
     */
    document.getElementById('currentEvent').value = graphManager.currentEventIndex;
    document.getElementById('currentStateEventId').innerHTML = '(' + graphManager.currentEventIndex + ')';

    document.getElementById('comparisionStateEventId').innerHTML = '(' + lastEventIndex + '/' + graphManager.currentEventIndex + ')';
  }

  static displayAllRelations(node, sigma){
    const oldGraphHolder = window.originalCurrentGraphHolder;
    const filteredGraphHolder =  window.filteredCurrentGraphHolder;

    filteredGraphHolder.graph[node.id] = oldGraphHolder.getEdges(node.id);

    DOMManager.synchronizeSigma(filteredGraphHolder, sigma.nodeHolder, sigma);
  }
}

export default VisualizationManager;

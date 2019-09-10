import DOMManager from "./DOMManager";
import ComparisionLayout from "../../parserLib/Graph/Visualizer/Layout/ComparisionLayout";

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
    window.sigmaPrevious.helperHolder.nodeHolder = window.sigmaCurrent.helperHolder.nodeHolder;
    window.sigmaPrevious.helperHolder.edgesHolder = window.sigmaCurrent.helperHolder.edgesHolder;
    window.sigmaPrevious.helperHolder.graphHolder = {...window.sigmaCurrent.helperHolder.graphHolder};

    const filterClass = DOMManager.selectedFilter.class;
    const layoutClass = DOMManager.selectedLayout.class;
    const layoutFilterClass = DOMManager.selectedLayoutFilter.class;

    graphManager.goToAbsoluteServerApparition(goToState);
    const graphHolder = graphManager.getGraphHolder();
    if (!window.sigmaCurrent.helperHolder.graphHolder) {
      window.sigmaCurrent.helperHolder.graphHolder = {
        original: graphHolder,
        filtered: null
      }
    } else {
      window.sigmaCurrent.helperHolder.graphHolder.original = graphHolder;
    }

    // Apply layout filter
    const subFilterObj = new layoutFilterClass(layoutOptions.filter);
    const subFilterResult = subFilterObj.applyFilter(graphHolder);

    const layoutObj = new layoutClass(subFilterResult, graphManager.getMachines(), layoutOptions);
    layoutObj.updatePositions();
    window.sigmaPrevious.helperHolder.edgesHolder = layoutObj.edgesHolder;


    // Apply filter

    let filterResult;
    // We do not need to apply the same filter twice, if they are the same
    if(layoutFilterClass === filterClass && JSON.stringify(layoutOptions.filter) === JSON.stringify(filterOptions)){
      filterResult = subFilterResult;
      console.log("Main filter and Layout filter are the same, reusing result...")
    }else {
      const filterObj = new filterClass(filterOptions);
      filterResult = filterObj.applyFilter(graphHolder);
    }
    window.sigmaCurrent.helperHolder.graphHolder.filtered = filterResult.graphHolder;

    // Apply comparision layout
    if (window.oldSubFilterResult) {
      const comparisionLayout = new ComparisionLayout(subFilterResult, window.oldSubFilterResult, graphManager.getMachines());
      comparisionLayout.nodeHolder = layoutObj.cloneNodeHolder();
      comparisionLayout.updatePositions();
      window.sigmaComparision.helperHolder.nodeHolder = comparisionLayout.nodeHolder;
      window.sigmaComparision.helperHolder.edgesHolder = comparisionLayout.edgesOverride;
      window.sigmaComparision.helperHolder.graphHolder = window.sigmaCurrent.helperHolder.graphHolder;

      DOMManager.synchronizeSigma(window.sigmaComparision);
    }
    window.oldSubFilterResult = subFilterResult;

    window.sigmaCurrent.helperHolder.nodeHolder = layoutObj.nodeHolder;
    DOMManager.synchronizeSigma(window.sigmaCurrent);

    /**
     * Update DOM
     * Maybe this should be in DOMManager
     */
    document.getElementById('currentEvent').value = graphManager.currentEventIndex;
    document.getElementById('currentStateEventId').innerHTML = '(' + graphManager.currentEventIndex + ')';
    document.getElementById('comparisionStateEventId').innerHTML = '(' + lastEventIndex + '/' + graphManager.currentEventIndex + ')';
  }

  static displayAllToRelations(node, sigma) {
    sigma.helperHolder.byPassOutNodes.push(node);
    DOMManager.synchronizeSigma(sigma);
  }

  static displayAllFromRelations(node, sigma) {
    sigma.helperHolder.byPassInNodes.push(node);
    DOMManager.synchronizeSigma(sigma);
  }

  static hideAllToRelations(node, sigma) {
    sigma.helperHolder.byPassOutNodes.splice(sigma.helperHolder.byPassOutNodes.indexOf(node), 1);
    DOMManager.synchronizeSigma(sigma);
  }

  static hideAllFromRelations(node, sigma) {
    sigma.helperHolder.byPassInNodes.splice(sigma.helperHolder.byPassInNodes.indexOf(node), 1);
    DOMManager.synchronizeSigma(sigma);
  }
}

export default VisualizationManager;

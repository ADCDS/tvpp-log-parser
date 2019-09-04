import DijkstraFilter from "./parserLib/Graph/Filter/Tree/DijkstraFilter";
import TreeFilter from "./parserLib/Graph/Filter/Tree/TreeFilter";
import AlgorithmR1 from "./parserLib/Graph/Visualizer/Layout/AlgorithmR1";
import EmptyFilter from "./parserLib/Graph/Filter/EmptyFilter";
import Filter from "./parserLib/Graph/Filter/Filter";

class Utils {
  static filters = {
    dijkstra: {
      id: "dijkstra",
      name: "Dijkstra Filter",
      class: DijkstraFilter,
      type: TreeFilter
    },
    empty: {
      id: "empty",
      name: "Empty Filter",
      class: EmptyFilter,
      type: Filter
    }
  };

  static layouts = {
    algorithmR1: {
      id: "algorithmR1",
      name: "Algorithm R1",
      class: AlgorithmR1,
      graphConstraint: TreeFilter
    }
  };

  static getFilter(filter){
    const retFilter = this.filters[filter];
    if(!retFilter)
      throw "Unknown filter name " + filter;

    return retFilter;
  }

  static getLayout(layout){
    const retLayout = this.layouts[layout];
    if(!retLayout)
      throw "Unknown layout name " + layout;

    return retLayout;
  }

  static getFiltersByType(type){
    let retFilters = [];
    Object.keys(this.filters).forEach(el => {
      if(this.filters[el].type === type)
        retFilters.push(this.filters[el]);
    });
    return retFilters;
  }
}

export default Utils;

import DijkstraFilter from "./parserLib/Graph/Filter/Tree/DijkstraFilter";
import TreeFilter from "./parserLib/Graph/Filter/Tree/TreeFilter";

export default {
  filters: [
    {
      name: "Dijkstra Filter",
      type: TreeFilter
    }
  ],
  layouts: [
    {
      name: "Algorithm R1",
      graphConstraint: ""
    }
  ]
};

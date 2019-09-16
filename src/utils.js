// @flow
import DijkstraFilter from "./parserLib/Graph/Filter/Tree/Dijkstra/DijkstraFilter";
import TreeFilter from "./parserLib/Graph/Filter/Tree/TreeFilter";
import AlgorithmR1 from "./parserLib/Graph/Visualizer/Layout/Tree/AlgorithmR1";
import EmptyFilter from "./parserLib/Graph/Filter/EmptyFilter";
import Filter from "./parserLib/Graph/Filter/Filter";
import RingLayeredLayout from "./parserLib/Graph/Visualizer/Layout/Tree/RingLayeredLayout";
import SpringLayout from "./parserLib/Graph/Visualizer/Layout/SpringLayout";
import RingLayout from "./parserLib/Graph/Visualizer/Layout/RingLayout";
const fs = require("fs");

class Utils {
	static filters = {
		empty: {
			id: "empty",
			name: "Empty Filter",
			class: EmptyFilter,
			type: Filter
		},
		dijkstra: {
			id: "dijkstra",
			name: "Dijkstra Filter",
			class: DijkstraFilter,
			type: TreeFilter
		}
	};

	static layouts = {
		ringLayeredLayout: {
			id: "ringLayeredLayout",
			name: "Ring Layered Layout",
			class: RingLayeredLayout,
			graphConstraint: TreeFilter
		},
		algorithmR1: {
			id: "algorithmR1",
			name: "Algorithm R1",
			class: AlgorithmR1,
			graphConstraint: TreeFilter
		},
		ringLayout: {
			id: "ringLayout",
			name: "Ring Layout",
			class: RingLayout,
			graphConstraint: Filter
		},
		springLayout: {
			id: "springLayout",
			name: "Spring Layout",
			class: SpringLayout,
			graphConstraint: Filter
		}
	};

	static getFilter(filter) {
		const retFilter = this.filters[filter];
		if (!retFilter) throw new Error(`Unknown filter name ${filter}`);

		return retFilter;
	}

	static getLayout(layout) {
		const retLayout = this.layouts[layout];
		if (!retLayout) throw new Error(`Unknown layout name ${layout}`);

		return retLayout;
	}

	static getFiltersByType(type) {
		const retFilters = [];
		Object.keys(this.filters).forEach(el => {
			if (this.filters[el].type.prototype instanceof type || this.filters[el].type === type) retFilters.push(this.filters[el]);
		});
		return retFilters;
	}

	static async readLog(filePath) {
		return new Promise((resolve, reject) => {
			fs.readFile(filePath, (err, fd) => {
				if (err) {
					if (err.code === "ENOENT") {
						console.error("file doesnt exists");
						return;
					}

					reject(err);
				}

				resolve(fd.toString("utf8").split("\n"));
			});
		});
	}
}


export default Utils;

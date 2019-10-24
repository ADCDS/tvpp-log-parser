// @flow
import DijkstraFilter from "./parserLib/Graph/Filter/Tree/Dijkstra/DijkstraFilter";
import TreeFilter from "./parserLib/Graph/Filter/Tree/TreeFilter";
import AlgorithmR1 from "./parserLib/Graph/Visualizer/Layout/Tree/AlgorithmR1";
import EmptyFilter from "./parserLib/Graph/Filter/EmptyFilter";
import Filter from "./parserLib/Graph/Filter/Filter";
import RingLayeredLayout from "./parserLib/Graph/Visualizer/Layout/Tree/RingLayeredLayout";
import SpringLayout from "./parserLib/Graph/Visualizer/Layout/SpringLayout";
import RingLayout from "./parserLib/Graph/Visualizer/Layout/RingLayout";
import type { ChartDefType, FilterDefType, LayoutDefType } from "./types";
import YenKSP from "./parserLib/Graph/Filter/Tree/Yen/YenKSP";
import GroupLayerChart from "./parserLib/Graph/Chart/GroupLayerChart";
import GenericOutputText from "./parserLib/Graph/Chart/GenericOutputText";

const fs = require("fs");

class Utils {
	static filters: { [string]: FilterDefType } = {
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
		},
		yensKSP: {
			id: "yensKSP",
			name: "Yen's KSP Filter",
			class: YenKSP,
			type: TreeFilter
		}
	};

	static layouts: { [string]: LayoutDefType } = {
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

	static charts: { [string]: ChartDefType } = {
		genericOutputText: {
			id: "genericOutputText",
			name: "Text Output",
			class: GenericOutputText,
			filterConstraint: Filter
		},
		groupLayerChart: {
			id: "groupLayerChart",
			name: "Group Layer Chart",
			class: GroupLayerChart,
			filterConstraint: TreeFilter
		}
	};

	static getFilter(filter: string): FilterDefType {
		const retFilter = this.filters[filter];
		if (!retFilter) throw new Error(`Unknown filter name ${filter}`);

		return retFilter;
	}

	static getLayout(layout: string): LayoutDefType {
		const retLayout = this.layouts[layout];
		if (!retLayout) throw new Error(`Unknown layout name ${layout}`);

		return retLayout;
	}

	static getFiltersByType(Type: Class<Filter>): Array<FilterDefType> {
		const retFilters = [];
		Object.values(Utils.filters).forEach(filter => {
			filter = ((filter: any): FilterDefType);
			if (filter.type instanceof Type || filter.type === Type) retFilters.push(filter);
		});
		return retFilters;
	}

	static getChartsByFilterConstraintType(Type: Class<Filter>): Array<ChartDefType> {
		const retCharts = [];
		Object.values(Utils.charts).forEach(chart => {
			chart = ((chart: any): ChartDefType);
			if (Object.prototype.isPrototypeOf.call(chart.filterConstraint, Type) || chart.filterConstraint === Type) retCharts.push(chart);
		});
		return retCharts;
	}

	static async readLog(filePath: string) {
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

	static saveBase64AsFile(base64: string, fileName: string): void {
		const link = document.createElement("a");

		link.setAttribute("href", base64);
		link.setAttribute("download", fileName);
		link.click();
	}

	static saveStringAsFile(str: string, fileName: string, type: string){
		const a = window.document.createElement('a');
		a.href = window.URL.createObjectURL(new Blob([str], {type: type}));
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
}

export default Utils;

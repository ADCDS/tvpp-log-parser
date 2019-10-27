// @flow
import Filter from "./parserLib/Graph/Filter/Filter";
import Layout from "./parserLib/Graph/Visualizer/Layout/Layout";
import SigmaInjection from "./web/js/SigmaInjection";
import GraphHolder from "./parserLib/Graph/GraphHolder";
import Chart from "./parserLib/Graph/Chart/Chart";

export type Graph = { [string]: { [string]: boolean } };
export type PartnersType = { in: Array<string>, out: Array<string> };
export type FilterDefType = { id: string, name: string, class: Class<Filter>, type: Class<Filter> };
export type LayoutDefType = { id: string, name: string, class: Class<Layout>, graphConstraint: Class<Filter> };
export type ChartDefType = { id: string, name: string, class: Class<Chart>, filterConstraint: Class<Filter> };
export type Sigma = { helperHolder: SigmaInjection, [string]: any };
export type FilterLayoutOptions = { filter: { [string]: string | number | boolean }, [string]: string | number | boolean };
export type YensKSPTask = { newGraphHolder: GraphHolder, source: string, sinks: Array<string>, k: 20, vertices: Array<string> };
export type YensKSPWorkerResult = Array<[string, number]>;


// Chart output types
export type GLChartOutputType = { layers: Array<string>, colorMap: { [number]: string }, data: { [string]: { metadata: { timestamp: number, lastLayer: boolean }, layerArray: Array<{ metadata: { name: string }, [string]: number }> } } };

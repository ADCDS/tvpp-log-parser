// @flow
import Filter from "./parserLib/Graph/Filter/Filter";
import Layout from "./parserLib/Graph/Visualizer/Layout/Layout";
import SigmaInjection from "./web/js/SigmaInjection";

export type Graph = { string: { string: boolean } };
export type PartnersType = { in: Array<string>, out: Array<string> };
export type FilterDefType = { id: string, name: string, class: Class<Filter>, type: Class<Filter> };
export type LayoutDefType = { id: string, name: string, class: Class<Layout>, graphConstraint: Class<Filter> };
export type Sigma = { helperHolder: SigmaInjection, [string]: any };
export type FilterLayoutOptions = { filter: { [string]: string | number | boolean }, [string]: string | number | boolean };

import Chart from "./Chart";
import ChartManager from "../../../web/js/DOM/ChartManager";
import type {Sigma} from "../../../types";

type OutputChart = Array<{ name: string, value: string }>;

class GenericOutputText extends Chart {
	static drawFunction = ChartManager.drawTexts;

	static generateGraphInput(input: { sigma: Sigma, [string]: any }): OutputChart {
		const data = [];
		data.push({name: "abc", value: "cde"});
		return data;
	}
}

export default GenericOutputText;

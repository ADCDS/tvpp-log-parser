//@flow

import GLCharts from "../Charts/GLCharts";
import Utils from "../../utils";
import DOMUtils from "../../web/js/DOM/Utils";

class HandleHolder {
	static async handleGenerateGroupLayerChartButtonClick(e: Event) {
		console.log("Generate button click");
		let dataFromFile = await Utils.readFileFromInput(DOMUtils.getGenericElementById<HTMLInputElement>('logFile'));
		const input = JSON.parse(dataFromFile);

		GLCharts.generateGraphics(input);
	}
}

export default HandleHolder;

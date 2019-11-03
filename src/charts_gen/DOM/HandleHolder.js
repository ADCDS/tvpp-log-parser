//@flow

import GLCharts from "../Charts/GLCharts";
import Utils from "../../utils";
import DOMUtils from "../../web/js/DOM/Utils";
import PartnerCharts from "../Charts/PartnerCharts";

class HandleHolder {
	static async handleGenerateGroupLayerChartButtonClick(e: Event) {
		let dataFromFile = await Utils.readFileFromInput(DOMUtils.getGenericElementById<HTMLInputElement>('logFile'));
		const input = JSON.parse(dataFromFile);

		GLCharts.generateGraphics(input);
	}
	static async handleGeneratePartnerChartButtonClick(){
		let dataFromFile = await Utils.readFileFromInput(DOMUtils.getGenericElementById<HTMLInputElement>('logFile'));
		const input = JSON.parse(dataFromFile);

		PartnerCharts.generateGraphics(input);
	}
}

export default HandleHolder;

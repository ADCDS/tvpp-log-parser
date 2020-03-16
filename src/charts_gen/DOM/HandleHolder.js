//@flow

import GLCharts from "../Charts/GLCharts";
import Utils from "../../utils";
import DOMUtils from "../../web/js/DOM/Utils";
import PartnerCharts from "../Charts/PartnerCharts";

class HandleHolder {
	static async handleGenerateGroupLayerChartButtonClick(e: Event) {
		const dataFromFile = await Utils.readJsonFromInput(DOMUtils.getGenericElementById<HTMLInputElement>('logFile'));

		GLCharts.generateGraphics(dataFromFile);
	}
	static async handleGeneratePartnerChartButtonClick(){
		let dataFromFile = await Utils.readFileFromInput(DOMUtils.getGenericElementById<HTMLInputElement>('logFile'));
		const input = JSON.parse(dataFromFile);

		PartnerCharts.generateGraphics(input);
	}
}

export default HandleHolder;

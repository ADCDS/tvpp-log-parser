// @flow
import Layout from "./Layout";
import FilterResult from "../../Filter/Results/FilterResult";
import Machine from "../../../Machine";
import UserOption from "../../../UserOption";

class RingLayout extends Layout {
	constructor(filterResult: FilterResult, machines: Map<string, Machine>, options: { [string]: any }) {
		const defaultOptions = {
			radius: 100,
			drawUndefinedNodes: false
		};

		options = Object.assign(defaultOptions, options);
		super(filterResult, machines, options);
	}

	static getOptions(): { [string]: UserOption<any> } {
		let options = super.getOptions();
		options = Object.assign(options, {
			radius: new UserOption<Number>("Radius", Number, 100),
			drawUndefinedNodes: new UserOption<Boolean>("Draw undefined nodes", Boolean, false)
		});

		return options;
	}

	updatePositions(): void {
		super.updatePositions();
		let nodeKeys = Array.from(this.nodeHolder.keys());

		if (!this.options.drawUndefinedNodes) {
			nodeKeys = nodeKeys.filter(node => {
				if (!this.filterResult.graphHolder.isConnected(node)) {
					this.nodeHolder.delete(node);
					return false;
				}
				return true;
			});
		}

		let iterNum = 0;
		for (const node of this.nodeHolder.values()) {
			node.x = this.options.radius * Math.cos((2 * iterNum * Math.PI) / nodeKeys.length);
			node.y = this.options.radius * Math.sin((2 * iterNum * Math.PI) / nodeKeys.length);
			iterNum++;
		}
	}
}

export default RingLayout;

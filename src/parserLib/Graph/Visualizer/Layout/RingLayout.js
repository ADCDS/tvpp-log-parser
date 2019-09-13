// @flow
import Layout from "./Layout";
import TreeFilter from "../../Filter/Tree/TreeFilter";
import FilterResult from "../../Filter/Results/FilterResult";
import Machine from "../../../Machine";
import Option from "../../../Option";

class RingLayout extends Layout {
	constructor(filterResult: FilterResult, machines: Map<string, Machine>, options: { [string]: any }) {
		const defaultOptions = {
			radius: 100,
			drawUndefinedNodes: false
		};

		options = Object.assign(defaultOptions, options);
		super(filterResult, machines, options);
	}

	updatePositions(): void {
		super.updatePositions();
		const machineLength = this.nodeHolder.size;
		let iterNum = 0;

		for (let node of this.nodeHolder.values()) {
			node.x = this.options.radius * Math.cos((2 * iterNum * Math.PI) / machineLength);
			node.y = this.options.radius * Math.sin((2 * iterNum * Math.PI) / machineLength);
			iterNum++;
		}
	}

	static getOptions(): { [string]: Option } {
		let options = super.getOptions();
		options = Object.assign(options, {
			radius: new Option("Radius", Number, 100),
			drawUndefinedNodes: new Option("Draw undefined nodes", Boolean, false)
		});

		return options;
	}
}

export default RingLayout;

// @flow
import Layout from "../Layout";
import TreeFilter from "../../../Filter/Tree/TreeFilter";
import TreeFilterResult from "../../../Filter/Results/TreeFilterResult";
import Machine from "../../../../Machine";
import TreeLayout from "./TreeLayout";

class AlgorithmR1 extends TreeLayout {
	constructor(filterResult: TreeFilterResult<TreeFilter>, machines: Map<string, Machine>, options: { [string]: any }) {
		const defaultOptions = {
			gamma: 200,
			drawUndefinedNodes: false
		};

		options = Object.assign(defaultOptions, options);
		super(filterResult, machines, options);
	}

	static degreeToRadian(degree: number): number {
		return (degree * Math.PI) / 180;
	}

	tAngle(p: number): number {
		return 2 * Math.acos(p / (p + this.options.gamma));
	}

	heightOf(nodeName: string): number {
		// children
		const edges = this.graphHolder.getEdges(nodeName);
		const childrenNodes = Object.keys(edges).filter(edgeMachine => {
			return edges[edgeMachine];
		});

		let highestHeight = 0;
		childrenNodes.forEach(node => {
			if (this.heightOf(node) > highestHeight) {
				highestHeight = this.heightOf(node);
			}
		});
		return 1 + highestHeight;
	}

	widthOf(nodeName) {
		// children
		let res = 0;
		const edges = this.graphHolder.getEdges(nodeName);
		const childrenNodes = Object.keys(edges).filter(edgeMachine => {
			return edges[edgeMachine];
		});
		// console.log(nodeName, childrenNodes.length, childrenNodes);
		if (childrenNodes.length === 0) return 1;
		childrenNodes.forEach(node => {
			res += this.widthOf(node);
		});
		return res;
	}

	drawSubTree1(machineName: string, p: number, alpha1: number, alpha2: number): void {
		const v = this.nodeHolder.get(machineName);
		v.setPolarCoordinate(p, (alpha1 + alpha2) / 2);
		// console.log("Polar: ", p, (alpha1 + alpha2) / 2, "Cartesian: ", v.x, v.y);

		let alphaRes;
		let s;
		if (this.tAngle(p) < alpha1 - alpha2) {
			s = this.tAngle(p) / this.widthOf(machineName);
			alphaRes = (alpha1 + alpha2 - this.tAngle(p)) / 2;
		} else {
			s = (alpha2 - alpha1) / this.widthOf(machineName);
			alphaRes = alpha1;
		}

		// Get children nodes;
		const edges = this.graphHolder.getEdges(machineName);
		const childrenNodes = Object.keys(edges).filter(edgeMachine => {
			return edges[edgeMachine];
		});

		childrenNodes.forEach(node => {
			this.drawSubTree1(node, p + this.options.gamma, alphaRes, alphaRes + s * this.widthOf(node));
			alphaRes += s * this.widthOf(node);
		});
	}

	updatePositions(): void {
		super.updatePositions();
		this.drawSubTree1(this.options.source, 0, 0, AlgorithmR1.degreeToRadian(360));

		const undefinedNodes = [];
		if (!this.options.drawUndefinedNodes) {
			for (const [index, node] of this.nodeHolder.entries()) {
				if (node.x === undefined || node.y === undefined) {
					this.nodeHolder.delete(index);
				}
			}
		} else {
			for (const node of this.nodeHolder.values()) {
				if (node.x === undefined || node.y === undefined) {
					undefinedNodes.push(node);
				}
			}

			let iterNum = 0;
			undefinedNodes.forEach(node => {
				const heightOfSource = this.heightOf(this.options.source);

				node.x = this.options.gamma * heightOfSource * Math.cos((2 * iterNum * Math.PI) / undefinedNodes.length);
				node.y = this.options.gamma * heightOfSource * Math.sin((2 * iterNum * Math.PI) / undefinedNodes.length);
				iterNum++;
			});
		}
		// console.log("Done AlgorithmR1");
	}

	static getOptions(): {} {
		let options = super.getOptions();
		options = Object.assign(options, {
			gamma: {
				name: "Gamma",
				type: Number,
				default: 200
			},
			source: {
				name: "Source",
				type: String,
				default: "::src"
			},
			drawUndefinedNodes: {
				name: "Draw undefined nodes",
				type: Boolean,
				default: false
			},
			filter: {
				name: "Filter",
				type: TreeFilter
			}
		});
		return options;
	}
}

export default AlgorithmR1;

// @flow
import "babel-polyfill";
import YenKSP from "../../parserLib/Graph/Filter/Tree/Yen/YenKSP";
import type { YensKSPTask, YensKSPWorkerResult } from "../../types";

import GraphHolder from "../../parserLib/Graph/GraphHolder";

onmessage = e => {
	console.log("Worker: Message received from main script");
	const result = (e.data: YensKSPTask);
	result.newGraphHolder = Object.assign((Object.create(GraphHolder.prototype): any), result.newGraphHolder);
	const nodes = result.sinks;

	const ret = [];
	nodes.forEach(node => {
		const ykspret = YenKSP.calculateValue(result.newGraphHolder, result.source, node, result.k, result.vertices);
		ret.push([node, ykspret.median_length, ykspret.paths]);
	});

	// eslint-disable-next-line flowtype-errors/show-errors
	postMessage(ret);

	/* if (isNaN(result)) {
		postMessage('Please write two numbers');
	} else {
		let workerResult = 'Result: ' + result;
		console.log('Worker: Posting message back to main script');
		postMessage(workerResult);
	} */
};

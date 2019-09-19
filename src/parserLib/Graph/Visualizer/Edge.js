// @flow

class Edge {
	color: ?string;

	constructor(color: ?string) {
		this.color = color;
	}

	toObject(): { color?: ?string } {
		return {
			color: this.color
		};
	}
}

export default Edge;

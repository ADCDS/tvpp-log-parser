// @flow
class Node {
	id: string;
	label: string;
	x: number;
	y: number;
	color: string;
	size: number;
	polar: {
		angle: number,
		radius: number
	};

	constructor(
		id: string,
		label: string,
		x: number,
		y: number,
		color: string,
		size: number
	) {
		this.id = id;
		this.label = label;
		this.x = x;
		this.y = y;
		this.color = color;
		this.size = size;
		this.polar = {
			angle: 0,
			radius: 0
		};
	}

	setPolarCoordinate(radius: number, angle: number): void {
		this.polar.angle = angle;
		this.polar.radius = radius;
		this.x = radius * Math.cos(angle);
		this.y = radius * Math.sin(angle);
	}
}

export default Node;

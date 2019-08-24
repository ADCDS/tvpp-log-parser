class Node {
  constructor(label, x, y, color, size) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.polar = {
      angle: 0,
      radius: 0,
    }
  }

  setPolarCoordinate(radius, angle){
    this.polar.angle = angle;
    this.polar.radius = radius;
    this.x = radius * Math.cos(angle);
    this.y = radius * Math.sin(angle);
  }
}

export default Node;

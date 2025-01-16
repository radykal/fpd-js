import { fabric } from "fabric";
import tinycolor from "tinycolor2";

fabric.Group.prototype.changeObjectColor = function (index, hexColor) {
	let colors = [];

	this.getObjects().forEach((path) => {
		const tc = tinycolor(path.fill);
		colors.push(tc.toHexString());
	});

	colors[index] = hexColor;

	this.changeColor(colors);

	return colors;
};

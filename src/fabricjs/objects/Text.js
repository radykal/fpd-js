import { fabric } from "fabric";
fabric.Text.prototype.initialize = (function (originalFn) {
	return function (...args) {
		originalFn.call(this, ...args);
		this._TextInit();
		return this;
	};
})(fabric.Text.prototype.initialize);

fabric.Text.prototype.toImageSVG = function (args) {
	//disable clippath otherwise shadow text is not working
	let tempCliPath = this.clipPath;
	this.clipPath = null;

	let multiplier = 1;
	if (this?.canvas?.viewOptions?.printingBox && this?.canvas?.viewOptions?.output) {
		const dpi = Math.ceil(
			(this.canvas.viewOptions.printingBox.width * 25.4) / this.canvas.viewOptions.output.width
		);
		multiplier = parseInt(300 / dpi);
	}

	let ctx = this;
	let ctxWidth = ctx.width;
	let ctxHeight = ctx.height;

	if (this.shadow?.color) {
		var shadow = this.shadow;
		// Calculate shadow offset and blur
		ctxWidth += (Math.abs(shadow.offsetX) + shadow.blur) * 2;
		ctxHeight += (Math.abs(shadow.offsetY) + shadow.blur) * 2;
	}

	let svgDataURL = ctx.toDataURL({
		withoutShadow: false,
		withoutTransform: true,
		multiplier: multiplier,
		enableRetinaScaling: false,
	});

	this.clipPath = tempCliPath;

	return this._createBaseSVGMarkup(
		[
			`<image href="${svgDataURL}" width = "${ctxWidth}" height = "${ctxHeight}" x = "${-ctxWidth / 2}" y="${
				-ctxHeight / 2
			}" style="scale: ${1.0 / this.scaleX} ${1.0 / this.scaleY}"/>`,
		],
		{
			reviver: args[0],
			noStyle: true,
			withShadow: false,
		}
	);
};

fabric.Text.prototype.toSVG = (function (originalFn) {
	return function (...args) {
		//convert text to image data uri in print mode for specific text options
		if (this.canvas.printMode && (this.opacity != 1 || this.shadow?.color || this.pattern)) {
			return this.toImageSVG(args);
		}
		return originalFn.call(this, ...args);
	};
})(fabric.Text.prototype.toSVG);

/**
 * Reverse pathdata
 */
function reversePathData(pathData) {
	// start compiling new path data
	let pathDataNew = [];

	// helper to rearrange control points for all command types
	const reverseControlPoints = (values) => {
		let controlPoints = [];
		let endPoint = [];
		for (let p = 0; p < values.length; p += 2) {
			controlPoints.push([values[p], values[p + 1]]);
		}
		endPoint = controlPoints.pop();
		controlPoints.reverse();
		return [controlPoints, endPoint];
	};

	let closed = pathData[pathData.length - 1][0].toLowerCase() === "z" ? true : false;
	if (closed) {
		// add lineto closing space between Z and M
		pathData = addClosePathLineto(pathData);
		// remove Z closepath
		pathData.pop();
	}

	// define last point as new M if path isn't closed
	let valuesLast = pathData[pathData.length - 1];
	let valuesLastL = valuesLast.length;
	let M = closed ? pathData[0] : ["M", valuesLast[valuesLastL - 2], valuesLast[valuesLastL - 1]];
	// starting M stays the same – unless the path is not closed
	pathDataNew.push(M);

	// reverse path data command order for processing
	pathData.reverse();
	for (let i = 1; i < pathData.length; i++) {
		let com = pathData[i];
		let values = com.slice(1);
		let comPrev = pathData[i - 1];
		let typePrev = comPrev[0];
		let valuesPrev = comPrev.slice(1);
		// get reversed control points and new end coordinates
		let [controlPointsPrev, endPointsPrev] = reverseControlPoints(valuesPrev);
		let [controlPoints, endPoints] = reverseControlPoints(values);

		// create new path data
		let newValues = [];
		newValues = controlPointsPrev.flat().concat(endPoints);
		pathDataNew.push([typePrev, ...newValues]);
	}

	// add previously removed Z close path
	if (closed) {
		pathDataNew.push(["z"]);
	}
	return pathDataNew;
}

/**
 * Add closing lineto:
 * needed for path reversing or adding points
 */
function addClosePathLineto(pathData) {
	let pathDataL = pathData.length;
	let closed = pathData[pathDataL - 1][0] === "Z";
	let M = pathData[0];
	let [x0, y0] = [M[1], M[2]];
	let lastCom = closed ? pathData[pathDataL - 2] : pathData[pathDataL - 1];
	let lastComL = lastCom.length;
	let [xE, yE] = [lastCom[lastComL - 2], lastCom[lastComL - 1]];
	if (closed && (x0 !== xE || y0 !== yE)) {
		pathData.pop();
		pathData.push(["L", x0, y0], ["Z"]);
	}
	return path;
}

fabric.Text.prototype._constrainScale = (function (originalFn) {
	return function (value) {
		value = originalFn.call(this, value);

		if (this.minFontSize !== undefined) {
			const scaledFontSize = parseFloat(Number(value * this.fontSize).toFixed(0));
			if (scaledFontSize < this.minFontSize) {
				return this.minFontSize / this.fontSize;
			}
		}

		if (this.maxFontSize !== undefined) {
			const scaledFontSize = parseFloat(Number(value * this.fontSize).toFixed(0));
			if (scaledFontSize > this.maxFontSize) {
				return this.maxFontSize / this.fontSize;
			}
		}

		return value;
	};
})(fabric.Text.prototype._constrainScale);

fabric.Text.prototype._TextInit = function () {
	const _updateFontSize = (elem) => {
		if (!elem.curved && !elem.uniScalingUnlockable) {
			let newFontSize = elem.fontSize * elem.scaleX;
			newFontSize = parseFloat(Number(newFontSize).toFixed(0));

			elem.scaleX = 1;
			elem.scaleY = 1;
			elem._clearCache();
			elem.set("fontSize", newFontSize);

			if (elem.canvas)
				elem.canvas.fire("elementModify", {
					element: elem,
					options: { fontSize: newFontSize },
				});
		}
	};

	this.on({
		modified: (opts) => {
			_updateFontSize(this);
		},
	});
};

fabric.Text.prototype._createTextCharSpan = function (_char, styleDecl, left, top) {
	const multipleSpacesRegex = /  +/g;

	//FPD: add text styles to tspan
	styleDecl.fontWeight = this.fontWeight;
	styleDecl.fontStyle = this.fontStyle;

	var shouldUseWhitespace = _char !== _char.trim() || _char.match(multipleSpacesRegex),
		styleProps = this.getSvgSpanStyles(styleDecl, shouldUseWhitespace);

	//FPD: add underlined text
	styleProps += this.textDecoration === "underline" ? " text-decoration: underline;" : "";

	let fillStyles = styleProps ? 'style="' + styleProps + '"' : "",
		dy = styleDecl.deltaY,
		dySpan = "",
		NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;

	if (dy) {
		dySpan = ' dy="' + fabric.util.toFixed(dy, NUM_FRACTION_DIGITS) + '" ';
	}
	return [
		'<tspan x="',
		fabric.util.toFixed(left, NUM_FRACTION_DIGITS),
		'" y="',
		fabric.util.toFixed(top, NUM_FRACTION_DIGITS),
		'" ',
		dySpan,
		fillStyles,
		">",
		fabric.util.string.escapeXml(_char),
		"</tspan>",
	].join("");
};

fabric.Text.prototype._getSVGLeftTopOffsets = (function (originalFn) {
	return function (...args) {
		const offsets = originalFn.call(this, ...args);

		//Change the left offset if direction is "rtl".  Note for "ltr" the original function sets textLeft to "-this.width / 2".
		//This is to fix a bug where the SVG is placed in the wrong position when using "rtl".
		if (this.direction === "rtl")
			offsets.textLeft = this.width / 2;

		return offsets;
	}
})(fabric.Text.prototype._getSVGLeftTopOffsets);

fabric.Text.prototype._renderChars = (function (originalFn) {
	return function (...args) {
		//Change ctx direction to "rtl" if needed.  Fixes a bug where the text was drawn in the wrong position when 
		//usePrintingBoxAsBounding set to 1.
		if (this.direction === "rtl") {
			const ctx = args[1];
			if (ctx)
				ctx.direction = "rtl";
		}

		originalFn.call(this, ...args);
	};
})(fabric.Text.prototype._renderChars);

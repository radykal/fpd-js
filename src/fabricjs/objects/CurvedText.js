import { drawCirclePath } from "../utils";

fabric.CurvedText = fabric.util.createClass(fabric.IText, {
	type: "curved-text",

	initialize: function (text, options) {
		options || (options = {});
		this.callSuper("initialize", text, options);

		this.curveRadius = options.curveRadius || 50;
		this.curveReverse = options.curveReverse || false;
		this.effect = options.effect || "curved";
		this.startAngle = options.startAngle || -Math.PI / 2;

		this.on({
			//selected
			selected: () => {
				if (this.path) this.path.visible = true;
			},
			deselected: () => {
				if (this.path) this.path.visible = false;
			},
		});
	},

	_set: function (key, value) {
		this.callSuper("_set", key, value);

		//this._updatePath no longer used.
		//-Code left here for reference in case needed for eg. effect.
		//-updateTextPosition is...
		//  -automatically called when eg.the radius or reverse change
		//  -may need to be called when eg. key === "curved"
		//-Also note that for example "reverse" should probably really be "curveReverse".
		//if (["radius", "range", "effect", "reverse", "startAngle"].indexOf(key) > -1) {
		//	this._updatePath();
		//}

		//Temp for testing
		//console.log(`_set   key = ${key}  value = ${value}`);
		return this;
	},

	// XML escaping helper function
	_escapeXml: function (str) {
		return str.replace(/[<>&'"]/g, function (match) {
			switch (match) {
				case "<":
					return "&lt;";
				case ">":
					return "&gt;";
				case "&":
					return "&amp;";
				case "'":
					return "&apos;";
				case '"':
					return "&quot;";
				default:
					return match;
			}
		});
	},

	//Not used anymore.  Code left here for reference in case needed for eg. this.effect === "spiral"
	//_updatePath: function () {
	//	const startAngle = this.startAngle;
	//	const endAngle = startAngle + this.range;

	//	let pathString;

	//	if (this.effect === "curved") {
	//		const rx = this.curveRadius;
	//		const ry = this.curveRadius;
	//		const sweep = 1;

	//		const startX = this.curveRadius * Math.cos(startAngle);
	//		const startY = this.curveRadius * Math.sin(startAngle);
	//		const endX = this.curveRadius * Math.cos(endAngle);
	//		const endY = this.curveRadius * Math.sin(endAngle);

	//		pathString = `M ${startX} ${startY} A ${rx} ${ry} 0 ${this.range > Math.PI ? 1 : 0
	//			} ${sweep} ${endX} ${endY}`;
	//	} else if (this.effect === "spiral") {
	//		const steps = 100;
	//		const stepAngle = (endAngle - startAngle) / steps;
	//		const points = [];

	//		for (let i = 0; i <= steps; i++) {
	//			const angle = startAngle + stepAngle * i;
	//			const radius = this.curveRadius + (i * this.letterSpacing) / steps;
	//			const x = radius * Math.cos(angle);
	//			const y = radius * Math.sin(angle);
	//			points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
	//		}

	//		pathString = points.join(" ");
	//	}

	//	const path = new fabric.Path(pathString, {
	//		fill: "",
	//		stroke: "",
	//		objectCaching: false,
	//		originX: "center",
	//		originY: "center",
	//	});

	//	//this.path = path;
	//	this.pathAlign = this.reverse ? "right" : "left";
	//	this.pathSide = "center";
	//	this.pathStartOffset = 0;
	//},

	_getLetterPositions: function () {
		if (!(this.textLines?.length > 0 && this.textLines[0].length > 0 && this.curveRadius > 0)) {
			console.error("ERROR: Can't calculate letter positions.");
			return [];
		}

		//Get the first line of text only.  Currently on the Canvas/PNG other lines are drawn on top of the first.
		const text = this.textLines[0];

		//Temp canvas and context.
		const tempCanvas = fabric.util.createCanvasElement();
		const tempCtx = tempCanvas.getContext("2d");
		tempCtx.font = this.fontSize + "px " + this.fontFamily;

		//Compute distance along path for each char.
		const charMetrics = [];
		const charSpacingPx = this.letterSpacing * 0.1 * this.fontSize;

		let distance = 0;
		let spacingLast = 0;
		for (let i = 0; i < text.length; i++) {
			const spacingCurrent = tempCtx.measureText(text[i]).width;
			if (i === 0) {
				//First char.
				distance += spacingCurrent / 2;
			} else {
				const spacingBoth = tempCtx.measureText(text[i - 1] + text[i]).width;
				//Chars can have different sizes, so get spacing between them.
				const spacingDelta = spacingBoth - spacingCurrent / 2 - spacingLast / 2;
				distance += charSpacingPx + spacingDelta;
			}
			spacingLast = spacingCurrent;

			charMetrics.push({ char: text[i], distance });
		}

		const totalWidth = this.calcTextWidth();
		const totalAngle = totalWidth / this.curveRadius;

		//Works for the default textAlign = "left" only (which currently works more like "center").
		const angleRadOffset = totalAngle / 2 + Math.PI;
		const angleRadStart = this.startAngle + (this.curveReverse ? angleRadOffset : -angleRadOffset - Math.PI);

		//Code left here for reference in case needed in the future for different textAlign values.  Would need more adjustments.
		////Currently if textAlign is "justify" adjust based on curveReverse.  Could be adjusted later if needed.
		//const textAlignAdjusted = (this.textAlign === "justify" ? (this.curveReverse ? "right" : "left") : this.textAlign);
		////Default alignment is left.
		//let angleRadOffset = 0;
		//switch (textAlignAdjusted) {
		//	case "center": angleRadOffset = totalAngle / 2 + Math.PI; break;
		//	case "right": angleRadOffset = totalAngle; break;
		//}
		//const angleRadStart = this.startAngle + (this.curveReverse ? angleRadOffset : -angleRadOffset - Math.PI);

		return charMetrics.map((metric) => {
			const angleRad = angleRadStart + (metric.distance / this.curveRadius) * (this.curveReverse ? -1 : 1);

			return {
				char: metric.char,
				x: this.curveRadius * Math.cos(angleRad),
				y: this.curveRadius * Math.sin(angleRad),
				rotation: (angleRad * 180) / Math.PI + (this.curveReverse ? 270 : 90),
			};
		});
	},

	toSVG: function (reviver) {
		const markup = ["<g ", this.getSvgTransform(), this.getSvgFilter()];

		if (this.clipPath && !this.clipPath.excludeFromExport) {
			markup.push(' clip-path="url(#', this.clipPath.clipPathId, ')"');
		}
		markup.push(">");

		const letterPositions = this._getLetterPositions();

		// Common text styles
		const textStyles = [
			'font-family="',
			this.fontFamily ? this._escapeXml(this.fontFamily) : "Times New Roman",
			'" ',
			'font-size="',
			this.fontSize,
			'" ',
			'font-style="',
			this.fontStyle,
			'" ',
			'font-weight="',
			this.fontWeight,
			'" ',
			'text-decoration="',
			this.textDecoration || "",
			'" ',
			'style="',
			this.getSvgStyles(true),
			'"',
			this.addPaintOrder(),
		].join("");

		// Add each letter as an individual text element
		letterPositions.forEach((pos) => {
			markup.push(
				"<text ",
				textStyles,
				'text-anchor="middle" ',
				'dominant-baseline="middle" ',
				'transform="translate(',
				pos.x.toFixed(2),
				",",
				pos.y.toFixed(2),
				") rotate(",
				pos.rotation.toFixed(2),
				')"',
				">",
				this._escapeXml(pos.char),
				"</text>\n"
			);
		});

		markup.push("</g>\n");

		return markup.join("");
	},

	setTextPath: function () {
		const path = new fabric.Path(drawCirclePath(0, 0, this.curveRadius), {
			fill: "transparent",
			strokeWidth: 1,
			stroke: "rgba(0,0,0, 0.1)",
			visible: false,
		});

		this.set("path", path);
		this.updateTextPosition();
	},

	updateTextPosition: function () {
		if (this.path) {
			this.pathSide = this.curveReverse ? "left" : "right";
			const offset = this.curveReverse ? Math.PI * this.curveRadius * 2 * 0.25 : (Math.PI * this.curveRadius) / 2;
			this.pathStartOffset = offset - this.calcTextWidth() / 2;
			this.pathAlign = "center";
		}
	},

	toObject: function (propertiesToInclude) {
		return fabric.util.object.extend(this.callSuper("toObject", propertiesToInclude), {
			curveRadius: this.curveRadius,
			curveReverse: this.curveReverse,
			effect: this.effect,
			startAngle: this.startAngle,
		});
	},
});

// Register fromObject method
fabric.CurvedText.fromObject = function (object, callback) {
	return fabric.Object._fromObject("CurvedText", object, callback);
};

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

		return this;
	},

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

	toSVG: function (...args) {
		if (this.canvas.printMode && (this.opacity != 1 || this.shadow?.color || this.pattern)) {
			return this.toImageSVG(args);
		}

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

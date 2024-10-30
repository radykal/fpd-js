import { drawCirclePath } from "../utils";

fabric.CurvedText = fabric.util.createClass(fabric.IText, {
	type: "curved-text",

	initialize: function (text, options) {
		options || (options = {});
		this.callSuper("initialize", text, options);

		this.radius = options.curveRadius || 50;
		this.reverse = options.curveReverse || false;
		this.effect = options.effect || "curved";
		this.range = options.range || Math.PI;
		this.startAngle = options.startAngle || -Math.PI / 2;

		this.on({
			//selected
			selected: () => {
				this.path.visible = true;
			},
			deselected: () => {
				this.path.visible = false;
			},
		});

		this._updatePath();
	},

	_set: function (key, value) {
		this.callSuper("_set", key, value);

		if (["radius", "range", "effect", "reverse", "startAngle"].indexOf(key) > -1) {
			this._updatePath();
		}
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

	_updatePath: function () {
		const startAngle = this.startAngle;
		const endAngle = startAngle + this.range;

		let pathString;

		if (this.effect === "curved") {
			const rx = this.curveRadius;
			const ry = this.curveRadius;
			const sweep = 1;

			const startX = this.curveRadius * Math.cos(startAngle);
			const startY = this.curveRadius * Math.sin(startAngle);
			const endX = this.curveRadius * Math.cos(endAngle);
			const endY = this.curveRadius * Math.sin(endAngle);

			pathString = `M ${startX} ${startY} A ${rx} ${ry} 0 ${
				this.range > Math.PI ? 1 : 0
			} ${sweep} ${endX} ${endY}`;
		} else if (this.effect === "spiral") {
			const steps = 100;
			const stepAngle = (endAngle - startAngle) / steps;
			const points = [];

			for (let i = 0; i <= steps; i++) {
				const angle = startAngle + stepAngle * i;
				const radius = this.curveRadius + (i * this.letterSpacing) / steps;
				const x = radius * Math.cos(angle);
				const y = radius * Math.sin(angle);
				points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
			}

			pathString = points.join(" ");
		}

		const path = new fabric.Path(pathString, {
			fill: "",
			stroke: "",
			objectCaching: false,
			originX: "center",
			originY: "center",
		});

		//this.path = path;
		this.pathAlign = this.reverse ? "right" : "left";
		this.pathSide = "center";
		this.pathStartOffset = 0;
	},

	//todo: calculate text position
	_getLetterPositions: function () {
		const chars = this.text.split("");
		const length = chars.length;
		const angleRange = this.range;

		const tempCanvas = fabric.util.createCanvasElement();
		const tempCtx = tempCanvas.getContext("2d");
		tempCtx.font = this.fontSize + "px " + this.fontFamily;

		const charMetrics = chars.map((char) => ({
			char,
			width: tempCtx.measureText(char).width,
		}));

		const totalWidth =
			charMetrics.reduce((sum, metric) => sum + metric.width, 0) + this.letterSpacing * (length - 1);

		const totalAngle = length > 1 ? angleRange : 0;
		const arcLength = this.curveRadius * totalAngle;
		const scaleFactor = arcLength / totalWidth;

		const startAngle = this.startAngle;
		let currentAngle = startAngle;
		let currentOffset = 0;

		return charMetrics.map((metric, i) => {
			currentOffset += (metric.width * scaleFactor) / 2;
			currentAngle = startAngle + currentOffset / this.curveRadius;

			let x, y;
			const spiralRadius = this.curveRadius + i * this.letterSpacing;
			x = spiralRadius * Math.cos(currentAngle - Math.PI / 2);
			y = spiralRadius * Math.sin(currentAngle - Math.PI / 2);

			const rotation = (currentAngle * 180) / Math.PI;

			currentOffset += (metric.width * scaleFactor) / 2 + this.letterSpacing * scaleFactor;

			return {
				char: metric.char,
				x,
				y,
				rotation,
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
			radius: this.curveRadius,
			reverse: this.reverse,
			effect: this.effect,
			range: this.range,
			startAngle: this.startAngle,
		});
	},
});

// Register fromObject method
fabric.CurvedText.fromObject = function (object, callback) {
	return fabric.Object._fromObject("CurvedText", object, callback);
};

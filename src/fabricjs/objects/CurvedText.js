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

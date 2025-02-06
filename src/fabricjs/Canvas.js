import { fabric } from "fabric";
import "./Element.js";
import "./canvas/History.js";
import ZoomPan from "./canvas/ZoomPan.js";
import Snap from "./canvas/Snap.js";
import Ruler from "./canvas/Ruler.js";
import tinycolor from "tinycolor2";

import { deepMerge, objectHasKeys, isUrl, isZero, isEmpty, objectGet } from "../helpers/utils.js";
import { getFilter, getScaleByDimesions } from "./utils.js";

fabric.Canvas.prototype.viewOptions = {};
fabric.Canvas.prototype.elements = [];
fabric.Canvas.prototype.currentElement = null;
fabric.Canvas.prototype.responsiveScale = 1;
fabric.Canvas.prototype.currentBoundingObject = null;
fabric.Canvas.prototype.initialElementsLoaded = false;
fabric.Canvas.prototype.isCustomized = false;
fabric.Canvas.prototype.printingBoxObject = null;
fabric.Canvas.prototype._canvasCreated = false;
fabric.Canvas.prototype._doHistory = false;
fabric.Canvas.prototype.forbiddenTextChars = /<|>/g;

fabric.Canvas.prototype.proxyFileServer = "";

fabric.Canvas.prototype.initialize = (function (originalFn) {
	return function (...args) {
		originalFn.call(this, ...args);
		this._fpdCanvasInit();
		return this;
	};
})(fabric.Canvas.prototype.initialize);

fabric.Canvas.prototype._onTouchStart = (function (originalFn) {
	return function (e) {
		const target = this.findTarget(e);

		if (this.allowTouchScrolling && !target && !this.isDrawingMode) {
			return;
		}

		originalFn.call(this, e);
	};
})(fabric.Canvas.prototype._onTouchStart);

fabric.Canvas.prototype._fpdCanvasInit = function () {
	if (this.containerClass.includes("fpd-hidden-canvas")) return;

	let modifiedType = null;

	this.on({
		"after:render": () => {
			if (!this._canvasCreated) {
				this._onCreated();
			}

			if (
				this.viewOptions &&
				this.viewOptions.highlightEditableObjects &&
				this.viewOptions.highlightEditableObjects.length > 3
			) {
				this.contextContainer.strokeStyle = this.viewOptions.highlightEditableObjects;
				this.forEachObject((obj) => {
					if (
						obj !== this.getActiveObject() &&
						!obj.isMoving &&
						((obj.getType() === "text" && obj.editable) || obj.uploadZone)
					) {
						const bound = obj.getBoundingRect();
						this.contextContainer.setLineDash([5, 15]);
						this.contextContainer.strokeRect(bound.left, bound.top, bound.width, bound.height);
					} else {
						this.contextContainer.setLineDash([]);
					}
				});
			}
		},
		"object:added": ({ target }) => {
			this._bringToppedElementsToFront();
		},
		"object:moving": ({ target }) => {
			modifiedType = "moving";

			/**
			 * Gets fired as soon as an element is selected.
			 *
			 * @event fabric.CanvasView#elementSelect
			 * @param {Event} event
			 * @param {fabric.Object} currentElement - The current selected element.
			 */
			this.fire("elementChange", { type: "moving", element: target });
		},
		"object:rotating": ({ target }) => {
			modifiedType = "rotating";

			this.fire("elementChange", { type: "rotating", element: target });
		},
		"object:scaling": ({ target }) => {
			modifiedType = "scaling";

			this.fire("elementChange", { type: "scaling", element: target });
		},
		"object:modified": ({ target }) => {
			const element = target;

			if (modifiedType !== null) {
				let modifiedProps = {};

				switch (modifiedType) {
					case "moving":
						modifiedProps.left = Number(element.left);
						modifiedProps.top = Number(element.top);
						break;
					case "scaling":
						if (element.getType() === "text" && !element.curved && !element.uniScalingUnlockable) {
							modifiedProps.fontSize = parseInt(element.fontSize);
						} else {
							modifiedProps.scaleX = parseFloat(element.scaleX);
							modifiedProps.scaleY = parseFloat(element.scaleY);
						}
						break;
					case "rotating":
						modifiedProps.angle = element.angle;
						break;
				}

				this.fire("elementModify", { element: element, options: modifiedProps });
			}

			modifiedType = null;
		},
		"selection:created": ({ selected }) => {
			if (selected.length == 1) {
				this._onSelected(selected[0]);
			} else {
				this._onMultiSelected(selected);
			}
		},
		"selection:updated": ({ selected }) => {
			if (selected.length == 1) {
				this._onSelected(selected[0]);
			} else {
				this._onMultiSelected(selected);
			}
		},
		"mouse:down": (opts) => {
			//fix: when editing text via textarea and doing a modification via corner controls
			if (opts.target && opts.target.__corner && typeof opts.target.exitEditing === "function") {
				opts.target.exitEditing();
			}

			if (opts.target == undefined) {
				this.deselectElement();
			}
		},
		elementAdd: () => {
			this.forEachObject((obj) => {
				//render clipping
				if (!obj.clipPath && ((obj.boundingBox && obj.boundingBoxMode === "clipping") || obj.hasUploadZone)) {
					obj._clipElement();
				}
			});
		},
		"text:changed": ({ target }) => {
			this.fire("elementModify", { element: target, options: { text: target.text } });
		},
	});
};

fabric.Canvas.prototype._onCreated = function () {
	this._canvasCreated = true;

	ZoomPan(this, this.viewOptions.mobileGesturesBehaviour);
	Snap(this);
	Ruler(this);

	this._renderPrintingBox();
};

fabric.Canvas.prototype._onSelected = function (element) {
	//remove crop mask object when exists
	if (element.name !== "crop-mask") {
		const cropMaskObj = this.getObjects().find((obj) => obj.name === "crop-mask");
		if (cropMaskObj) this.remove(cropMaskObj);
	}

	this.deselectElement(false);

	//dont select anything when in dragging mode
	if (this.dragStage) {
		this.deselectElement();
		return false;
	}

	this.currentElement = element;

	/**
	 * Gets fired as soon as an element is selected.
	 *
	 * @event fabric.CanvasView#elementSelect
	 * @param {Event} event
	 * @param {fabric.Object} currentElement - The current selected element.
	 */
	this.fire("elementSelect", { element: element });

	//change cursor to move when element is draggable
	this.hoverCursor = element.draggable ? "move" : "pointer";

	//check for a boundingbox
	if (element.boundingBox && !element.uploadZone) {
		this._renderElementBoundingBox(element);
	}
};

fabric.Canvas.prototype._onMultiSelected = function (selectedElements) {
	const activeSelection = this.getActiveObject();

	if (this.viewOptions.multiSelection) {
		activeSelection.set({
			lockScalingX: !Boolean(this.viewOptions.editorMode),
			lockScalingY: !Boolean(this.viewOptions.editorMode),
			lockRotation: !Boolean(this.viewOptions.editorMode),
			hasControls: Boolean(this.viewOptions.editorMode),
			borderDashArray: [8, 8],
			cornerSize: 24,
			transparentCorners: false,
			borderColor: this.viewOptions.multiSelectionColor,
			borderScaleFactor: 3,
		});

		selectedElements.forEach((obj) => {
			if ((!obj.draggable && !this.viewOptions.editorMode) || !obj.evented) {
				activeSelection.removeWithUpdate(obj);
			}
		});

		activeSelection.setControlsVisibility({
			tr: false,
			tl: false,
			mtr: false,
		});

		/**
		 * Gets fired as soon as mutiple elements are selected.
		 *
		 * @event fabric.CanvasView#multiSelect
		 * @param {Event} event
		 * @param {fabric.Object} activeSelection - The current selected object.
		 */
		this.fire("multiSelect", { activeSelection: activeSelection });
	}
};

fabric.Canvas.prototype._renderElementBoundingBox = function (element) {
	if (this.currentBoundingObject) {
		this.remove(this.currentBoundingObject);
		this.currentBoundingObject = null;
	}

	const _bbCreated = (bbObj = null) => {
		if (bbObj) {
			this.add(bbObj);
			bbObj.bringToFront();

			/**
			 * Gets fired when bounding box is toggling.
			 *
			 * @event fabric.CanvasView#boundingBoxToggle
			 * @param {Event} event
			 * @param {fabric.Object} currentBoundingObject - The current bounding box object.
			 * @param {Boolean} state
			 */
			this.fire("boundingBoxToggle", {
				currentBoundingObject: this.currentBoundingObject,
				state: true,
			});
		}
	};

	if (element && (!element._printingBox || !this.viewOptions.printingBox.visibility)) {
		var bbCoords = element.getBoundingBoxCoords();

		if (bbCoords && element.boundingBoxMode != "none") {
			let boundingBoxProps = {
				stroke: this.viewOptions.boundingBoxColor,
				strokeWidth: 1,
				strokeLineCap: "square",
				strokeDashArray: [10, 10],
				fill: false,
				selectable: false,
				evented: false,
				name: "bounding-box",
				excludeFromExport: true,
				_ignore: true,
				rx: bbCoords.borderRadius,
				ry: bbCoords.borderRadius,
			};

			boundingBoxProps = deepMerge(boundingBoxProps, this.viewOptions.boundingBoxProps);

			if (!element.clipPath || element.clipPath.type == "rect") {
				boundingBoxProps = deepMerge(boundingBoxProps, {
					left: bbCoords.left,
					top: bbCoords.top,
					width: bbCoords.width,
					height: bbCoords.height,
					angle: bbCoords.angle || 0,
					originX: "left",
					originY: "top",
				});

				this.currentBoundingObject = new fabric.Rect(boundingBoxProps);
				_bbCreated(this.currentBoundingObject);
			} else if (element.clipPath) {
				element.clipPath.clone((clonedObj) => {
					boundingBoxProps = deepMerge(boundingBoxProps, {
						fill: "transparent",
					});

					clonedObj.set(boundingBoxProps);

					if (clonedObj.type == "group") {
						//transparent background for objects in group
						clonedObj.forEachObject((obj) => {
							obj.set("fill", "transparent");
						});
					}

					this.currentBoundingObject = clonedObj;
					_bbCreated(this.currentBoundingObject);
					element._checkContainment();
				});
			}
		}

		element._checkContainment();
	}
};

fabric.Canvas.prototype._renderPrintingBox = function () {
	if (this.printingBoxObject) {
		this.remove(this.printingBoxObject);
		this.printingBoxObject = null;
	}

	if (objectHasKeys(this.viewOptions.printingBox, ["left", "top", "width", "height"])) {
		const pbWidth = this.viewOptions.printingBox.width;
		const pbHeight = this.viewOptions.printingBox.height;

		const pbStrokeWidth = 1;
		const pbVisibility = this.viewOptions.printingBox.visibility || this.viewOptions.editorMode;

		const printingBox = new fabric.Rect({
			width: pbWidth + pbStrokeWidth,
			height: pbHeight + pbStrokeWidth,
			stroke: pbVisibility ? "#db2828" : "transparent",
			strokeWidth: pbStrokeWidth,
			strokeLineCap: "square",
			fill: false,
			originX: "left",
			originY: "top",
			name: "printing-box",
			visible: !this.printMode,
		});

		this.printingBoxObject = new fabric.Group([printingBox], {
			left: this.viewOptions.printingBox.left - pbStrokeWidth,
			top: this.viewOptions.printingBox.top - pbStrokeWidth,
			evented: false,
			resizable: true,
			removable: false,
			copyable: false,
			rotatable: false,
			uniformScaling: false,
			lockRotation: true,
			borderColor: "transparent",
			transparentCorners: true,
			cornerColor: this.viewOptions.selectedColor,
			cornerIconColor: this.viewOptions.cornerIconColor,
			cornerSize: 24,
			originX: "left",
			originY: "top",
			name: "printing-boxes",
			excludeFromExport: !this.printMode,
			selectable: false,
			_ignore: true,
		});

		const bleedinMM = this.viewOptions?.output?.bleed;
		if (bleedinMM && this.viewOptions.innerBleed && pbVisibility) {
			//one mm in pixel
			const mmPxRatio = this.viewOptions.printingBox.width / this.viewOptions.output.width;
			const bleedInPx = mmPxRatio * bleedinMM;
			const bleedBoxWidth = pbWidth - bleedInPx;
			const bleedBoxHeight = pbHeight - bleedInPx;

			const bleedBox = new fabric.Rect({
				left: printingBox.left,
				top: printingBox.top,
				width: bleedBoxWidth + pbStrokeWidth,
				height: bleedBoxHeight + pbStrokeWidth,
				stroke: "#db2828",
				strokeWidth: bleedInPx,
				opacity: 0.2,
				strokeLineCap: "square",
				fill: false,
				originX: "left",
				originY: "top",
				name: "bleed-box",
				visible: !this.printMode,
			});

			this.printingBoxObject.add(bleedBox);

			const cropsDashArray = [4, 4];
			const cropMarksColor = "#000000";
			// Create crop mark lines
			const cropMarks = [
				// Top-left-Horizontal
				new fabric.Line(
					[
						-pbWidth * 0.5,
						-pbHeight * 0.5 + bleedInPx - 1,
						-pbWidth * 0.5 + bleedInPx,
						-pbHeight * 0.5 + bleedInPx - 1,
					],
					{
						stroke: cropMarksColor,
						strokeDashArray: cropsDashArray,
					}
				),
				// Top-left-Vertical
				new fabric.Line(
					[
						-pbWidth * 0.5 + bleedInPx - 1,
						-pbHeight * 0.5,
						-pbWidth * 0.5 + bleedInPx - 1,
						-pbHeight * 0.5 + bleedInPx,
					],
					{ stroke: cropMarksColor, strokeDashArray: cropsDashArray }
				),
				// Top-right-Horizontal
				new fabric.Line(
					[
						pbWidth * 0.5,
						-pbHeight * 0.5 + bleedInPx - 1,
						pbWidth * 0.5 - bleedInPx,
						-pbHeight * 0.5 + bleedInPx - 1,
					],
					{ stroke: cropMarksColor, strokeDashArray: cropsDashArray }
				),
				// Top-right-Vertical
				new fabric.Line(
					[
						pbWidth * 0.5 - bleedInPx,
						-pbHeight * 0.5,
						pbWidth * 0.5 - bleedInPx,
						-pbHeight * 0.5 + bleedInPx,
					],
					{ stroke: cropMarksColor, strokeDashArray: cropsDashArray }
				),
				// Bottom-left-Horizontal
				new fabric.Line(
					[
						-pbWidth * 0.5,
						pbHeight * 0.5 - bleedInPx,
						-pbWidth * 0.5 + bleedInPx,
						pbHeight * 0.5 - bleedInPx,
					],
					{
						stroke: cropMarksColor,
						strokeDashArray: cropsDashArray,
					}
				),
				// Bottom-left-Vertical
				new fabric.Line(
					[
						-pbWidth * 0.5 + bleedInPx - 1,
						pbHeight * 0.5,
						-pbWidth * 0.5 + bleedInPx - 1,
						pbHeight * 0.5 - bleedInPx,
					],
					{ stroke: cropMarksColor, strokeDashArray: cropsDashArray }
				),
				// Bottom-right-Horizontal
				new fabric.Line(
					[pbWidth * 0.5, pbHeight * 0.5 - bleedInPx, pbWidth * 0.5 - bleedInPx, pbHeight * 0.5 - bleedInPx],
					{ stroke: cropMarksColor, strokeDashArray: cropsDashArray }
				),
				// Bottom-right-Vertical
				new fabric.Line(
					[pbWidth * 0.5 - bleedInPx, pbHeight * 0.5, pbWidth * 0.5 - bleedInPx, pbHeight * 0.5 - bleedInPx],
					{ stroke: cropMarksColor, strokeDashArray: cropsDashArray }
				),
			];

			//add crop marks in an own group
			const cropMarksGroup = new fabric.Group(cropMarks, {
				evented: false,
				selectable: false,
				name: "crop-marks",
			});

			this.printingBoxObject.add(cropMarksGroup);
		}

		this.add(this.printingBoxObject);
		this.printingBoxObject.setCoords();
		this.renderAll();
	}
};

fabric.Canvas.prototype._bringToppedElementsToFront = function () {
	let objects = this.getObjects(),
		bringToFrontObjs = [];

	objects.forEach((object) => {
		if (object.topped || (object.uploadZone && this.viewOptions.uploadZonesTopped)) {
			bringToFrontObjs.push(object);
		}
	});

	bringToFrontObjs.forEach((object) => {
		object.bringToFront();
	});

	if (this.currentBoundingObject) {
		this.currentBoundingObject.bringToFront();
	}

	if (this.printingBoxObject) {
		this.printingBoxObject.bringToFront();
	}
};

/**
 * Adds a set of elements into the view.
 *
 * @param {Array} elements An array containing elements.
 * @param {Function} [callback] A function that will be called when all elements have beed added.
 * @method addElement
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.addElements = function (elements, callback) {
	let countElements = -1;

	//iterative function when element is added, add next one
	const _addElement = () => {
		countElements++;

		//add all elements of a view
		if (countElements < elements.length) {
			const element = elements[countElements];
			if (!_removeNotValidElementObj(element)) {
				this.addElement(element.type, element.source, element.title, element.parameters);
			}
		}
		//all initial elements are added, view is created
		else {
			this.off("elementAdd", _addElement);
			if (typeof callback !== "undefined") {
				callback.call(callback, this);
			}

			this.initialElementsLoaded = true;
		}
	};

	const _removeNotValidElementObj = (element) => {
		if (element.type === undefined || element.source === undefined || element.title === undefined) {
			const removeInd = elements.indexOf(element);
			if (removeInd !== -1) {
				console.log(
					"Element index " + removeInd + " from elements removed, its not a valid element object!",
					"info"
				);

				_addElement();
				return true;
			}
		} else {
			this.elements.push(element);
		}

		return false;
	};

	let element = elements[0];
	//check if view contains at least one element
	if (element) {
		//listen when element is added
		this.on("elementAdd", _addElement);

		//add first element of view
		_addElement();
	}
	//no elements in view, view is created without elements
	else {
		if (typeof callback !== "undefined") {
			callback.call(callback, this);
		}

		this.initialElementsLoaded = true;
	}
};

/**
 * Adds a new element to the view.
 *
 * @method addElement
 * @param {string} type The type of an element you would like to add, 'image' or 'text'.
 * @param {string} source For image the URL to the image and for text elements the default text.
 * @param {string} title Only required for image elements.
 * @param {object} [parameters={}] An object with the parameters, you would like to apply on the element.
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.addElement = function (type, source, title, params = {}) {
	if (type === undefined || source === undefined || title === undefined) return;

	/**
	 * Gets fired as soon as an element will be added (before its added to canvas).
	 *
	 * @event fabric.CanvasView#beforeElementAdd
	 * @param {Event} event
	 * @param {String} type - The element type.
	 * @param {String} source - URL for image, text string for text element.
	 * @param {String} title - The title for the element.
	 * @param {Object} params - The default properties.
	 */
	this.fire("beforeElementAdd", {
		type: type,
		source: source,
		title: title,
		params: params,
	});

	if (type === "text") {
		//strip HTML tags
		source = source.replace(/(<([^>]+)>)/gi, "");
		source = source.replace(this.forbiddenTextChars, "");
		title = title.replace(/(<([^>]+)>)/gi, "");
	}

	if (params.colorLinkGroup) {
		let currentElems = this.getElements();
		if (currentElems) {
			//get first element with the same color link group and copy the fill of that element to the new element
			const targetElem = currentElems.find((elem) => elem["colorLinkGroup"] === params.colorLinkGroup);
			if (targetElem && targetElem.fill) {
				params.fill = targetElem.fill;
			}
		}
	}

	//check that fill is a string
	if (typeof params.fill !== "string" && !Array.isArray(params.fill)) {
		params.fill = false;
	}

	//merge default options
	let defaultsParams;
	if (type.toLowerCase().includes("text")) {
		defaultsParams = deepMerge(this.viewOptions.elementParameters, this.viewOptions.textParameters);
	} else {
		defaultsParams = deepMerge(this.viewOptions.elementParameters, this.viewOptions.imageParameters);
	}

	params = deepMerge(defaultsParams, params);

	//store current color and convert colors in string to array
	if (params.colors && typeof params.colors == "string") {
		//check if string contains hex color values
		if (params.colors.indexOf("#") == 0) {
			//convert string into array
			var colors = params.colors.replace(/\s+/g, "").split(",");
			params.colors = colors;
		}
	}

	params._isInitial = !this.initialElementsLoaded;

	if (type.toLowerCase().includes("text")) {
		var defaultTextColor = params.colors[0] ? params.colors[0] : "#000000";
		params.fill = params.fill ? params.fill : defaultTextColor;
	}

	let fabricParams = {
		source: source,
		title: title,
		id: String(new Date().getTime()),
	};

	if (!this.viewOptions.editorMode) {
		fabricParams = deepMerge(fabricParams, {
			selectable: false,
			lockRotation: true,
			hasRotatingPoint: false,
			lockScalingX: true,
			lockScalingY: true,
			lockMovementX: true,
			lockMovementY: true,
			hasControls: false,
			evented: false,
			lockScalingFlip: true,
		});
	} else {
		params.__editorMode = this.viewOptions.editorMode;
		fabricParams.selectable = fabricParams.evented = true;
	}

	fabricParams = deepMerge(params, fabricParams);

	if (fabricParams.isCustom) {
		//engraving mode
		if (objectGet(this.viewOptions, "industry.type") == "engraving") {
			fabricParams.opacity = objectGet(this.viewOptions, "industry.opts.opacity", 0.5);
		}

		this.isCustomized = true;
	}

	let elemHasBB = false;
	if (typeof fabricParams.boundingBox == "string" && fabricParams.boundingBox.length > 0) {
		elemHasBB = true;
	} else if (
		typeof fabricParams.boundingBox == "object" &&
		objectHasKeys(fabricParams.boundingBox, ["width", "height"]) &&
		fabricParams.boundingBox.width > 0 &&
		fabricParams.boundingBox.height > 0
	) {
		elemHasBB = true;
	}

	if (
		this.viewOptions.usePrintingBoxAsBounding &&
		!elemHasBB &&
		objectHasKeys(this.viewOptions.printingBox, ["left", "top", "width", "height"])
	) {
		fabricParams.boundingBox = {
			x: this.viewOptions.printingBox.left - 1,
			y: this.viewOptions.printingBox.top - 1,
			width: this.viewOptions.printingBox.width + 1,
			height: this.viewOptions.printingBox.height + 1,
		};

		fabricParams._printingBox = fabricParams.boundingBox;
	}

	if (type == "image" || type == "path" || type == "group") {
		//remove url parameters
		if (source.search("<svg ") === -1) {
			var splitURLParams = source.split("?");
			source = fabricParams.source = splitURLParams[0];
		}

		const _fabricImageLoaded = (fabricImage, params, vectorImage, originParams = {}) => {
			if (fabricImage) {
				params.originParams = deepMerge(params, originParams);

				fabricImage.setOptions(params);
				this.add(fabricImage);
				this.setElementOptions(params, fabricImage);

				fabricImage.originParams.angle = fabricImage.angle;
				fabricImage.originParams.z = fabricImage.getZIndex();
			} else {
				this.fire("imageFail", { url: params.source });
			}

			/**
			 * Gets fired as soon as an element has beed added.
			 *
			 * @event fabric.Canvas#elementAdd
			 * @param {Event} event
			 * @param {fabric.Object} object - The fabric object.
			 */
			this.fire("elementAdd", { element: fabricImage });
		};

		if (source === undefined || source.length === 0) {
			console.log("No image source set for: " + title);
			return;
		}

		//add SVG from string
		if (source.search("<svg") !== -1) {
			fabric.loadSVGFromString(source, (objects, options) => {
				var svgGroup = fabric.util.groupSVGElements(objects, options);

				//replace fill prop with svgFill
				if (fabricParams.fill) {
					if (!fabricParams.svgFill) {
						fabricParams.svgFill = fabricParams.fill;
					}

					delete fabricParams["fill"];
				}
				//if no default colors are set, use the initial path colors
				else if (!fabricParams.fill && !fabricParams.svgFill) {
					if (objects) {
						params.colors = [];
						for (var i = 0; i < objects.length; ++i) {
							var color =
								objects[i].fill.length > 0 ? tinycolor(objects[i].fill).toHexString() : "transparent";
							params.colors.push(color);
						}
						params.svgFill = params.colors;
					}

					fabricParams.svgFill = params.svgFill;
				}

				delete fabricParams["boundingBox"];
				delete fabricParams["originParams"];
				delete fabricParams["colors"];
				delete fabricParams["svgFill"];
				delete fabricParams["width"];
				delete fabricParams["height"];
				delete fabricParams["originX"];
				delete fabricParams["originY"];
				delete fabricParams["objectCaching"];

				_fabricImageLoaded(svgGroup, fabricParams, true, { svgFill: params.svgFill });
			});
		}
		//load svg from url
		else if (source.split(".").includes("svg")) {
			let timeStamp = Date.now().toString(),
				url = isUrl(source) ? new URL(this.proxyFileServer + source) : source;

			//add timestamp when option enabled or is cloudfront url
			if ((source.includes(".cloudfront.net/") || this.viewOptions.imageLoadTimestamp) && !this.proxyFileServer) {
				url.searchParams.append("t", timeStamp);
			}

			if (typeof url === "object") {
				url = url.toString();
			}

			fabric.loadSVGFromURL(url, (objects, options) => {
				//if objects is null, svg is loaded from external server with cors disabled
				var svgGroup = objects ? fabric.util.groupSVGElements(objects, options) : null;

				//replace fill prop with svgFill
				if (fabricParams.fill) {
					if (!fabricParams.svgFill) {
						fabricParams.svgFill = fabricParams.fill;
					}

					delete fabricParams["fill"];
				}
				//if no default colors are set, use the initial path colors
				else if (!fabricParams.fill && !fabricParams.svgFill) {
					if (objects) {
						params.colors = [];
						for (var i = 0; i < objects.length; ++i) {
							var color =
								objects[i].fill.length > 0 ? tinycolor(objects[i].fill).toHexString() : "transparent";
							params.colors.push(color);
						}
						params.svgFill = params.colors;
					}

					fabricParams.svgFill = params.svgFill;
				}

				_fabricImageLoaded(svgGroup, fabricParams, true, { svgFill: params.svgFill });
			});
		}
		//load png/jpeg from url
		else {
			let timeStamp = Date.now().toString(),
				url;

			if (!source.includes("data:image/")) {
				//do not add timestamp to data URI

				url = isUrl(source) ? new URL(this.proxyFileServer + source) : source;

				if (this.viewOptions.imageLoadTimestamp && !this.proxyFileServer) {
					url.searchParams.append("t", timeStamp);
				}

				if (typeof url === "object") {
					url = url.toString();
				}
			} else {
				url = source;
			}

			new fabric.Image.fromURL(
				url,
				function (fabricImg) {
					//if src is empty, image is loaded from external server with cors disabled
					fabricImg = fabricImg.getSrc() === "" ? null : fabricImg;
					_fabricImageLoaded(fabricImg, fabricParams, false);
				},
				{ crossOrigin: "anonymous" }
			);
		}
	} else if (type.toLowerCase().includes("text")) {
		source = source.replace(/\\n/g, "\n");
		params.text = params.text ? params.text : source;
		fabricParams._initialText = params.hasOwnProperty("_initialText") ? params._initialText : params.text;

		fabricParams.originParams = { ...params };

		//ensure origin text is always the initial text, even when action:save
		if (params.originParams && params.originParams.text) {
			fabricParams.originParams.text = fabricParams._initialText;
		}

		//make text curved
		var fabricText;
		if (params.curved) {
			fabricText = new fabric.CurvedText(source.replace(/(?:\r\n|\r|\n)/g, ""), fabricParams);
		}
		//make text box
		else if (params.textBox) {
			fabricText = new fabric.Textbox(source, { ...fabricParams, ...{ splitByGrapheme: true } });
		}
		//neon-text
		else if (params.neonText) {
			fabricText = new fabric.NeonText(source, fabricParams);
		}
		//i-text
		else {
			fabricText = new fabric.IText(source, fabricParams);
		}

		if (fabricParams.textPlaceholder || fabricParams.numberPlaceholder) {
			this[fabricParams.textPlaceholder ? "textPlaceholder" : "numberPlaceholder"] = fabricText;
		}

		this.add(fabricText);
		this.setElementOptions(fabricParams, fabricText);

		fabricText.originParams = deepMerge(fabricText.toJSON(), fabricText.originParams);
		fabricText.originParams.z = fabricText.getZIndex();

		this.fire("elementAdd", { element: fabricText });
	}
};

/**
 * Deselects the current selected element.
 *
 * @method deselectElement
 * @param {Boolean} discardActiveObject Discards currently active object and fire events
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.deselectElement = function (discardActiveObject = true) {
	if (this.currentBoundingObject) {
		this.remove(this.currentBoundingObject);
		this.fire("boudingBoxToggle", {
			boundingBox: this.currentBoundingObject,
			state: false,
		});

		this.currentBoundingObject = null;
	}

	if (discardActiveObject) {
		this.discardActiveObject();
	}

	this.currentElement = null;

	this.fire("elementSelect", { element: null });
};

/**
 * Resets the canvas size considering the available space on the device.
 *
 * @method resetSize
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.resetSize = function () {
	if (!this.wrapperEl || !this.wrapperEl.parentNode) return;

	const viewStage = this.wrapperEl;
	const viewStageWidth = viewStage.parentNode.clientWidth;
	let allowedHeight = window.innerHeight * parseFloat(this.viewOptions.maxCanvasHeight || 1);
	let canvasHeight = this.viewOptions.stageHeight;
	let fixedHeight = null;

	this.responsiveScale =
		viewStageWidth < this.viewOptions.stageWidth ? viewStageWidth / this.viewOptions.stageWidth : 1;

	let potentialHeight = canvasHeight * this.responsiveScale;

	//set a fixed height
	if (this.viewOptions.canvasHeight && this.viewOptions.canvasHeight !== "auto") {
		if (this.viewOptions.canvasHeight.includes("px")) {
			fixedHeight = parseInt(this.viewOptions.canvasHeight);
			allowedHeight = fixedHeight;
		}
	}

	//adjust to height if necessary
	if (potentialHeight > allowedHeight) {
		this.responsiveScale = allowedHeight / canvasHeight;
	}

	this.responsiveScale = parseFloat(Number(this.responsiveScale.toFixed(7)));
	this.responsiveScale = Math.min(this.responsiveScale, 1);

	if (!this.viewOptions.responsive) {
		this.responsiveScale = 1;
	}

	this.setDimensions({
		width: this.viewOptions.stageWidth * this.responsiveScale,
		height: this.viewOptions.stageHeight * this.responsiveScale,
	})
		.setZoom(this.responsiveScale)
		.calcOffset()
		.renderAll();

	this.fire("sizeUpdate", {
		responsiveScale: this.responsiveScale,
		canvasHeight: fixedHeight ? fixedHeight : canvasHeight * this.responsiveScale || canvasHeight,
	});

	return this.responsiveScale;
};

/**
 * Sets the zoom of the stage. 1 is equal to no zoom.
 *
 * @method setResZoom
 * @param {number} value The zoom value.
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.setResZoom = function (value) {
	this.deselectElement();

	var point = new fabric.Point(this.getWidth() * 0.5, this.getHeight() * 0.5);

	this.zoomToPoint(point, value * this.responsiveScale);

	if (value == 1) {
		this.resetZoom();
	}
};

/**
 * Resets the the zoom.
 *
 * @method resetZoom
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.resetZoom = function () {
	this.deselectElement();

	this.zoomToPoint(new fabric.Point(0, 0), this.responsiveScale);
	this.absolutePan(new fabric.Point(0, 0));
};

/**
 * Returns an array with fabricjs objects.
 *
 * @method getElements
 * @returns {Array} An array with fabricjs objects.
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.getElements = function (elementType = "all", deselectElement = true) {
	if (deselectElement) {
		this.deselectElement();
	}

	let allElements = this.getObjects();

	//remove ignore objects
	allElements = allElements.filter((obj) => {
		return !obj._ignore;
	});

	if (elementType === "text") {
		return allElements.filter((elem) => {
			return elem.getType() === "text";
		});
	} else if (elementType === "image") {
		return allElements.filter((elem) => {
			return elem.getType() === "image";
		});
	}

	return allElements;
};

/**
 * Returns an fabric object by title.
 *
 * @method getElementsJSON
 * @param {string} title The title of an element.
 * @returns {Object} FabricJS Object.
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.getElementsJSON = function (onlyEditableElements = false, deselectElement = true) {
	let viewElements = this.getElements("all", deselectElement),
		jsonViewElements = [];

	viewElements.forEach((element) => {
		if (element.title !== undefined && element.source !== undefined) {
			var jsonItem = {
				title: element.title,
				source: element.source,
				parameters: element.getElementJSON(),
				type: element.getType(),
			};

			const printingBox = this.viewOptions && this.viewOptions.printingBox ? this.viewOptions.printingBox : null;
			if (printingBox && printingBox.hasOwnProperty("left") && printingBox.hasOwnProperty("top")) {
				let pointLeftTop = element.getPointByOrigin("left", "top");

				jsonItem.printingBoxCoords = {
					left: pointLeftTop.x - printingBox.left,
					top: pointLeftTop.y - printingBox.top,
				};
			}

			if (onlyEditableElements) {
				if (element.isEditable) jsonViewElements.push(jsonItem);
			} else {
				jsonViewElements.push(jsonItem);
			}
		}
	});

	return jsonViewElements;
};

/**
 * Returns an fabric object by title.
 *
 * @method getElementByTitle
 * @param {string} title The title of an element.
 * @returns {Object} FabricJS Object.
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.getElementByTitle = function (title) {
	const objects = this.getObjects();

	for (var i = 0; i < objects.length; ++i) {
		if (objects[i].title === title) {
			return objects[i];
			break;
		}
	}
};

/**
 * Returns an fabric object by ID.
 *
 * @method getElementByID
 * @param {String} id The ID of an element.
 * @returns {Object} FabricJS Object.
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.getElementByID = function (id) {
	const objects = this.getObjects();

	for (var i = 0; i < objects.length; ++i) {
		if (objects[i].id == id) {
			return objects[i];
		}
	}

	return false;
};

/**
 * Removes the canvas and resets all relevant view properties.
 *
 * @method reset
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.reset = function (removeCanvas = true) {
	this.clear();

	if (removeCanvas) {
		this.wrapperEl.remove();
	}

	this.fire("clear");
};

/**
 * Removes an element using the fabric object or the title of an element.
 *
 * @method removeElement
 * @param {object|string} element Needs to be a fabric object or the title of an element.
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.removeElement = function (element) {
	if (typeof element === "string") {
		element = this.getElementByTitle(element);
	}

	this.deselectElement();

	if (element.toggleUploadZone) element.toggleUploadZone();

	this.remove(element);

	/**
	 * Gets fired as soon as an element has been removed.
	 *
	 * @event fabric.Canvas#elementRemove
	 * @param {Event} event
	 * @param {fabric.Object} element - The fabric object that has been removed.
	 * @extends fabric.Canvas
	 */
	this.fire("elementRemove", { element: element });
};

/**
 * Gets an elment by replace property.
 *
 * @method getElementByReplace
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.getElementByReplace = function (replaceValue) {
	const objects = this.getObjects();

	for (var i = 0; i < objects.length; ++i) {
		const object = objects[i];
		if (object.replace === replaceValue) {
			return object;
		}
	}

	return null;
};

/**
 * Sets the parameters for a specified element.
 *
 * @method setElementOptions
 * @param {object} parameters An object with the parameters that should be applied to the element.
 * @param {fabric.Object | string} [element] A fabric object or the title of an element. If no element is set, the parameters will be applied to the current selected element.
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.setElementOptions = function (parameters, element) {
	element = typeof element === "undefined" ? this.getActiveObject() : element;

	if (!element || parameters === undefined) return false;

	//if element is string, get by title
	if (typeof element == "string") {
		element = this.getElementByTitle(element);
	}

	const elemType = element.getType();

	if (parameters.scale !== undefined) {
		parameters.scaleX = parameters.scaleY = Number(parameters.scale);
	}

	//scale image into bounding box (cover or fit)
	if (
		elemType == "image" &&
		!element._isInitial &&
		!element._optionsSet &&
		!element._addToUZ &&
		element.scaleX === 1
	) {
		//only scale to bb when no scale value is set
		let scale = null;
		if (!isZero(element.resizeToW) || !isZero(element.resizeToH)) {
			let scaleToWidth = element.resizeToW,
				scaleToHeight = element.resizeToH;

			scaleToWidth = isNaN(scaleToWidth)
				? (parseFloat(scaleToWidth) / 100) * this.viewOptions.stageWidth
				: parseInt(scaleToWidth);
			scaleToHeight = isNaN(scaleToHeight)
				? (parseFloat(scaleToHeight) / 100) * this.viewOptions.stageHeight
				: parseInt(scaleToHeight);

			scale = getScaleByDimesions(element.width, element.height, scaleToWidth, scaleToHeight, element.scaleMode);
		} else if (element.boundingBox) {
			const bb = element.getBoundingBoxCoords();
			scale = getScaleByDimesions(element.width, element.height, bb.width, bb.height, element.scaleMode);
		} else if (this.viewOptions.fitImagesInCanvas && element.isCustom) {
			const iconTolerance = element.cornerSize * 3;

			if (
				element.width * element.scaleX + iconTolerance > this.viewOptions.stageWidth ||
				element.height * element.scaleY + iconTolerance > this.viewOptions.stageHeight
			) {
				scale = getScaleByDimesions(
					element.width,
					element.height,
					this.viewOptions.stageWidth - iconTolerance,
					this.viewOptions.stageHeight - iconTolerance
				);
			}
		}

		if (scale !== null) {
			parameters = deepMerge(parameters, { scaleX: scale, scaleY: scale });
		}
	}

	//adds the element into a upload zone
	if (Boolean(element._addToUZ)) {
		parameters.z = -1;
		let uploadZoneObj = this.getElementByTitle(element._addToUZ),
			scale = 1;

		if (element.getType() == "image") {
			scale = getScaleByDimesions(
				element.width,
				element.height,
				uploadZoneObj.width * uploadZoneObj.scaleX,
				uploadZoneObj.height * uploadZoneObj.scaleY,
				uploadZoneObj.scaleMode
			);
		}

		parameters = deepMerge(parameters, {
			boundingBox: element._addToUZ,
			boundingBoxMode: "clipping",
			scaleX: scale,
			scaleY: scale,
			autoCenter: true,
			removable: true,
			zChangeable: false,
			autoSelect: false,
			copyable: false,
			hasUploadZone: true,
			z: this.getElementByTitle(element._addToUZ).getZIndex(),
			rotatable: uploadZoneObj.rotatable,
			draggable: uploadZoneObj.draggable,
			resizable: uploadZoneObj.resizable,
			price: uploadZoneObj.price ? uploadZoneObj.price : parameters.price,
			replace: element._addToUZ,
			lockUniScaling: uploadZoneObj.lockUniScaling,
			uniScalingUnlockable: uploadZoneObj.uniScalingUnlockable,
			advancedEditing: uploadZoneObj.advancedEditing,
			originX: uploadZoneObj.originX,
			originY: uploadZoneObj.originY,
			angle: uploadZoneObj.angle,
		});

		//set some origin params that are needed when resetting element in UZ
		parameters.originParams = deepMerge(parameters.originParams, {
			boundingBox: parameters.boundingBox,
			replace: parameters.replace,
			rotatable: parameters.rotatable,
			draggable: parameters.draggable,
			resizable: parameters.resizable,
			lockUniScaling: parameters.lockUniScaling,
			uniScalingUnlockable: parameters.uniScalingUnlockable,
			price: parameters.price,
			scaleX: parameters.scaleX,
			scaleY: parameters.scaleY,
			hasUploadZone: true,
			autoCenter: true,
			originX: parameters.originX,
			originY: parameters.originY,
			angle: parameters.angle,
		});

		delete parameters[""];
		delete element["_addToUZ"];
	}

	//if topped, z-index can not be changed
	if (parameters.topped) {
		parameters.zChangeable = false;
	}

	//new element added
	if (element.checkEditable(parameters)) {
		parameters.isEditable = parameters.evented = parameters.selectable = true;
	}

	//upload zones have no controls
	if (!parameters.uploadZone || this.viewOptions.editorMode) {
		if (parameters.draggable) {
			parameters.lockMovementX = parameters.lockMovementY = false;
		}

		if (parameters.rotatable) {
			parameters.lockRotation = false;
			parameters.hasRotatingPoint = true;
		}

		if (parameters.resizable) {
			parameters.lockScalingX = parameters.lockScalingY = false;
		}

		if (parameters.resizable || parameters.rotatable || parameters.removable) {
			parameters.hasControls = true;
		}
	}

	if (parameters.uploadZone) {
		if (!this.viewOptions.editorMode) {
			if (parameters.uploadZoneMovable) {
				parameters.lockMovementX = parameters.lockMovementY = false;
			}

			if (parameters.uploadZoneRemovable) {
				parameters.removable = true;
				parameters.copyable = false;
				parameters.hasControls = true;
			}
		}

		parameters.borderColor = "transparent";
		parameters.excludeFromExport = true;
	}

	if (parameters.fixed) {
		if (isEmpty(parameters.replace)) {
			parameters.replace = element.title;
		}
	}

	if (!this.viewOptions.editorMode && parameters.replace && parameters.replace != "") {
		let replacedElement = this.getElementByReplace(parameters.replace);

		//element with replace in view found and replaced element is not the new element
		if (replacedElement !== null && replacedElement !== element) {
			parameters.z = replacedElement.getZIndex();
			parameters.left = element.originParams.left = replacedElement.left;
			parameters.top = element.originParams.top = replacedElement.top;
			parameters.autoCenter = false;

			if (this.viewOptions.applySizeWhenReplacing) {
				const scale = replacedElement.getScaledWidth() / element.getScaledWidth();

				parameters.scaleX = element.originParams.scaleX = scale;
				parameters.scaleY = element.originParams.scaleY = scale;
			}

			if (this.viewOptions.applyFillWhenReplacing && !element._isQrCode) {
				parameters.fill = parameters.svgFill = replacedElement.fill;
			}

			this.removeElement(replacedElement);
		}
	}

	if (elemType === "text") {
		//needs to before setOptions
		if (typeof parameters.text === "string") {
			let text = parameters.text;
			text = text.replace(this.forbiddenTextChars, "");

			if (element.maxLength != 0 && text.length > element.maxLength) {
				text = text.substr(0, element.maxLength);
				element.set("text", text);
			}

			//check lines length
			if (element.maxLines != 0) {
				if (element.maxLines != 0 && text.split("\n").length > element.maxLines) {
					let textLines = text.split("\n").slice(0, element.maxLines);
					text = textLines.join("\n");
				}
			}

			if (element.textTransform === "uppercase") {
				text = text.toUpperCase();
			} else if (element.textTransform === "lowercase") {
				text = text.toLowerCase();
			}

			if (element.curved) {
				//remove lines from text
				text = text.replace(/[\n\r\t]/gm, "");
			}

			parameters.text = text;
		}

		if (parameters.hasOwnProperty("textDecoration")) {
			parameters.underline = parameters.textDecoration === "underline";
		}

		if (parameters.letterSpacing !== undefined) {
			parameters.charSpacing = parameters.letterSpacing * 100;
		}

		if (parameters.fontSize && parameters.fontSize < element.minFontSize) {
			parameters.fontSize = element.minFontSize;
		} else if (parameters.fontSize && parameters.fontSize > element.maxFontSize) {
			parameters.fontSize = element.maxFontSize;
		}

		if (parameters.textTransform) {
			let text = element.text;
			if (parameters.textTransform === "uppercase") {
				text = text.toUpperCase();
			} else if (parameters.textTransform === "lowercase") {
				text = text.toLowerCase();
			}

			parameters.text = text;
		}
	}

	if (
		parameters.hasOwnProperty("shadowColor") ||
		parameters.hasOwnProperty("shadowBlur") ||
		parameters.hasOwnProperty("shadowOffsetX") ||
		(parameters.hasOwnProperty("shadowOffsetY") && !element.neonText)
	) {
		if (parameters.shadowColor === null) {
			element.set("shadow", null);
		} else {
			let currentShadow = {};
			if (element.shadow) {
				currentShadow = element.shadow.toObject();
			}

			let shadowObj = {
				color: parameters.hasOwnProperty("shadowColor") ? parameters.shadowColor : currentShadow.color,
				blur: parameters.hasOwnProperty("shadowBlur") ? parameters.shadowBlur : currentShadow.blur,
				offsetX: parameters.hasOwnProperty("shadowOffsetX") ? parameters.shadowOffsetX : currentShadow.offsetX,
				offsetY: parameters.hasOwnProperty("shadowOffsetY") ? parameters.shadowOffsetY : currentShadow.offsetY,
			};

			element.set("shadow", shadowObj);
		}
	}

	delete parameters["paths"]; //no paths in parameters
	element.setOptions(parameters);

	if ((parameters.fontSize || parameters.fontFamily || parameters.letterSpacing) && element.updateTextPosition)
		element.updateTextPosition();

	if (element.type == "i-text" && element.widthFontSize && element.text.length > 0) {
		let resizedFontSize;
		if (element.width > element.widthFontSize) {
			resizedFontSize = element.fontSize * (element.widthFontSize / (element.width + 1)); //decrease font size
		} else {
			resizedFontSize = element.fontSize * (element.widthFontSize / (element.width - 1)); //increase font size
		}

		if (resizedFontSize < element.minFontSize) {
			resizedFontSize = element.minFontSize;
		} else if (resizedFontSize > element.maxFontSize) {
			resizedFontSize = element.maxFontSize;
		}

		resizedFontSize = parseInt(resizedFontSize);

		element.set("fontSize", resizedFontSize);
	}

	if (element.updateTextPosition) element.updateTextPosition();

	if (parameters.autoCenter) element.centerElement();

	if (parameters.hasOwnProperty("lockUniScaling")) element._elementControls();

	//set filter
	if (parameters.filter) {
		const fabricFilter = getFilter(parameters.filter);

		if (fabricFilter && element.applyFilters) {
			element.filters = [fabricFilter];
			element.applyFilters();
		} else if (element.applyFilters) {
			element.filters = [];
			element.applyFilters();
		}
	}

	//change element color
	if (parameters.fill !== undefined || parameters.svgFill !== undefined) {
		const fill = parameters.svgFill !== undefined ? parameters.svgFill : parameters.fill;

		element.changeColor(fill);
		element.pattern = undefined;
	}

	//set pattern
	if (parameters.pattern !== undefined) {
		element.setPattern(parameters.pattern);
	}

	//set z position, check if element has canvas prop, otherwise its not added into canvas
	if (element.canvas && parameters.z >= 0) {
		element.moveTo(parameters.z);
		this._bringToppedElementsToFront();
	}

	if (parameters.hasOwnProperty("curved")) {
		if (parameters.curved) {
			if (element.type == "i-text" || element.type == "textbox") {
				let textProps = element.getElementJSON();
				delete textProps["width"];

				this.addElement("text", textProps.text, element.title, textProps);
				this.removeElement(element);
				return;
			}

			element.setTextPath();

			if (element == this.getActiveObject() && element.path) {
				element.path.visible = true;
			}

			//replace new lines in curved text
			element.textAlign = "left";
			element.set("text", element.text.replace(/[\r\n]+/g, ""));
			element.updateTextPosition();
		} else {
			element.set("path", null);
		}
	}

	if (parameters.hasOwnProperty("curveRadius") && element.setTextPath) {
		element.setTextPath();

		if (element == this.getActiveObject() && element.path) {
			element.path.visible = true;
		}
	}

	if (element.uploadZone) {
		element.evented = element.opacity !== 0;
	} else if (element.isEditable && !this.viewOptions.editorMode) {
		element.evented = !parameters.locked;
	}

	if (element.textPlaceholder || element.numberPlaceholder) {
		element.removable = false;
	}

	//check if a upload zone contains an object
	var objects = this.getObjects();
	for (var i = 0; i < objects.length; ++i) {
		var object = objects[i];

		if (object.uploadZone && object.title == parameters.replace) {
			object.opacity = 0;
			object.evented = false;
		}
	}

	element.setCoords();
	this.renderAll().calcOffset();

	/**
	 * Gets fired as soon as an element is modified.
	 *
	 * @event fabric.Canvas#elementModify
	 * @param {Event} event
	 * @param {fabric.Object} currentElement - The current selected element.
	 * @extends fabric.Canvas
	 */
	this.fire("elementModify", { element: element, options: parameters });

	element._checkContainment();

	if (this._doHistory) {
		this.historySaveAction();
	}

	if (parameters.autoSelect && element.isEditable && !this.editorMode && this.wrapperEl.offsetParent) {
		setTimeout(() => {
			this.setActiveObject(element);
			this.renderAll();
		}, 200);
	}

	element._optionsSet = true;
};

/**
 * Duplicates an element in the canvas.
 *
 * @method duplicateElement
 * @param {fabric.Object} element The target element.
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.duplicateElement = function (element) {
	var newOpts = element.getElementJSON();

	newOpts.top = newOpts.top + 30;
	newOpts.left = newOpts.left + 30;

	if (!this.viewOptions.editorMode) {
		newOpts.autoSelect = true;
	}

	this.addElement(element.getType(), element.source, "Copy " + element.title, newOpts);
};

/**
 * Gets an upload zone by title.
 *
 * @method getUploadZone
 * @param {String} title The target title of an element.
 * @returns {fabric.Object} A fabric object representing the upload zone.
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.getUploadZone = function (title) {
	const objects = this.getObjects();

	for (var i = 0; i < objects.length; ++i) {
		if (objects[i].uploadZone && objects[i].title == title) {
			return objects[i];
			break;
		}
	}
};

/**
 * Use a SVG image as mask for the whole view. The image needs to be a SVG file with only one path. The method toSVG() does not include the mask.
 *
 * @method setMask
 * @param {Object|Null} maskOptions An object containing the URL to the svg. Optional: scaleX, scaleY, left and top.
 * @param {Function} [callback] A function when mask is loaded and set. Returns the mask or null, when mask could not be loaded.
 * @extends fabric.Canvas
 */
fabric.Canvas.prototype.setMask = function (maskOptions = {}, callback = () => {}) {
	if (maskOptions && maskOptions.url && maskOptions.url.includes(".svg")) {
		const maskURL = this.proxyFileServer + maskOptions.url;
		this.maskOptions = maskOptions;

		fabric.loadSVGFromURL(maskURL, (objects, options) => {
			let svgGroup = null;
			if (objects) {
				//if objects is null, svg is loaded from external server with cors disabled
				svgGroup = objects ? fabric.util.groupSVGElements(objects, options) : null;

				svgGroup.setOptions({
					left: maskOptions.left ? Number(maskOptions.left) : 0,
					top: maskOptions.top ? Number(maskOptions.top) : 0,
					scaleX: maskOptions.scaleX ? Number(maskOptions.scaleX) : 1,
					scaleY: maskOptions.scaleY ? Number(maskOptions.scaleY) : 1,
					selectable: true,
					evented: false,
					resizable: true,
					lockUniScaling: false,
					lockRotation: true,
					borderColor: "transparent",
					fill: "rgba(0,0,0,0)",
					transparentCorners: true,
					cornerColor: this.viewOptions.selectedColor,
					cornerIconColor: this.viewOptions.cornerIconColor,
					cornerSize: 24,
					originX: "left",
					originY: "top",
					name: "view-mask",
					objectCaching: false,
					excludeFromExport: true,
					_ignore: true,
				});

				this.maskObject = svgGroup;
				this.clipPath = svgGroup;

				this.resetSize();
			}

			callback(svgGroup);
		});
	} else {
		this.maskObject = this.maskOptions = this.clipPath = null;
		this.renderAll();
		callback(null);
	}
};

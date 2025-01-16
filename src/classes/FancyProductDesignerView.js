import "../fabricjs/Canvas.js";
import Modal from "../ui/view/comps/Modal.js";
import tinycolor from "tinycolor2";

import { deepMerge, objectHasKeys, toggleElemClasses } from "../helpers/utils";

import { parseFontsToEmbed } from "../helpers/fonts-loader";

/**
 * Creates a new FancyProductDesignerView.
 *
 * @class FancyProductDesignerView
 * @param  {HTMLElement} container - The container for the Fancy Product Designer View.
 * @param  {Object} [viewData={}] - The initial view data.
 * @param  {Function} [callback] - Callback when view is created.
 * @param  {Object} [fabricCanvasOptions={}] - Options for fabricJS canvas.
 * @extends EventTarget
 */
export default class FancyProductDesignerView extends EventTarget {
	/**
	 * Relevant options for the view.
	 *
	 * @type Array
	 * @memberof FancyProductDesigner
	 * @static
	 */
	static relevantOptions = [
		"stageWidth",
		"stageHeight",
		"selectedColor",
		"boundingBoxColor",
		"outOfBoundaryColor",
		"cornerIconColor",
		"customAdds",
		"elementParameters",
		"imageParameters",
		"textParameters",
		"customImageParameters",
		"customTextParameters",
		"maxPrice",
		"optionalView",
		"designCategories",
		"printingBox",
		"output",
		"layouts",
		"usePrintingBoxAsBounding",
		"threeJsPreviewModel",
		"editorMode",
		"imageLoadTimestamp",
		"fitImagesInCanvas",
		"inCanvasTextEditing",
		"applyFillWhenReplacing",
		"disableTextEmojis",
		"cornerControlsStyle",
		"responsive",
		"canvasHeight",
		"maxCanvasHeight",
		"boundingBoxProps",
		"highlightEditableObjects",
		"multiSelection",
		"multiSelectionColor",
		"mobileGesturesBehaviour",
		"smartGuides",
		"snapGridSize",
		"rulerUnit",
		"namesNumbersEntryPrice",
		"applySizeWhenReplacing",
		"rulerPosition",
		"rulerFixed",
		"industry",
		"innerBleed",
	];

	/**
	 * The total price for the view without max. price.
	 *
	 * @type Number
	 * @default 0
	 * @memberof FancyProductDesignerView
	 * @inner
	 * @readonly
	 */
	totalPrice = 0;

	/**
	 * The total price for the view including max. price and corrert formatting.
	 *
	 * @type Number
	 * @default 0
	 * @memberof FancyProductDesignerView
	 * @inner
	 * @readonly
	 */
	truePrice = 0;

	/**
	 * Additional price for the view.
	 *
	 * @type Number
	 * @default 0
	 * @memberof FancyProductDesignerView
	 * @inner
	 * @readonly
	 */
	additionalPrice = 0;

	/**
	 * The locked state of the view.
	 *
	 * @type Boolean
	 * @default false
	 * @readonly
	 */
	locked = false;

	/**
	 * The properties for the mask object (url, left, top, width, height).
	 *
	 * @type Object
	 * @default null
	 * @memberof FancyProductDesignerView
	 * @inner
	 * @readonly
	 */
	mask = null;

	viewData;
	onCreatedCallback;
	title;
	thumbnail;
	options;
	names_numbers;
	canvasElem = null;
	fabricCanvas = null;
	elementsAdded = false;

	constructor(container, viewData = {}, callback, fabricCanvasOptions = {}) {
		super();

		this.viewData = viewData;
		this.onCreatedCallback = callback;
		this.title = viewData.title;
		this.thumbnail = viewData.thumbnail;
		this.options = viewData.options;
		this.mask = viewData.mask;
		this.locked = viewData.locked !== undefined ? viewData.locked : this.options.optionalView;
		this.names_numbers = viewData.names_numbers ? viewData.names_numbers : null;

		fabric.Canvas.prototype.snapGridSize = this.options.snapGridSize;
		fabric.Canvas.prototype.snapToObjects = this.options.smartGuides;

		const selectedColor = this.options.selectedColor;
		fabric.Object.prototype.borderColor = selectedColor;
		fabric.Object.prototype.cornerColor = selectedColor;
		fabric.Object.prototype.cornerIconColor = this.options.cornerIconColor;

		fabricCanvasOptions = deepMerge(
			{
				containerClass: "fpd-view-stage fpd-hidden",
				selection: this.options.multiSelection,
				selectionBorderColor: this.options.multiSelectionColor,
				selectionColor: tinycolor(this.options.multiSelectionColor).setAlpha(0.1).toRgbString(),
				hoverCursor: "pointer",
				controlsAboveOverlay: true,
				centeredScaling: true,
				allowTouchScrolling: true,
				preserveObjectStacking: true,
				enablePointerEvents: false,
			},
			fabricCanvasOptions
		);

		this.fabricOptions = fabricCanvasOptions;

		//create canvas tag for fabricjs
		this.canvasElem = document.createElement("canvas");
		container.append(this.canvasElem);

		fabric.Canvas.prototype.forbiddenTextChars = FancyProductDesigner.forbiddenTextChars;
		fabric.Canvas.prototype.proxyFileServer = FancyProductDesigner.proxyFileServer;

		this.fabricCanvas = new fabric.Canvas(this.canvasElem, fabricCanvasOptions);
		this.fabricCanvas.viewOptions = this.options;
		this.fabricCanvas.setDimensions({
			width: this.options.stageWidth,
			height: this.options.stageHeight,
		});

		this.fabricCanvas.on({
			imageFail: ({ url }) => {
				Modal(`
                    <p>The image with the URL<br /><i style='font-size: 10px;'>${url}</i><br />can not be loaded into the canvas.</p>
                    <p><b>Troubleshooting</b>
                        <ul>
                            <li>The URL is not correct!</li>
                            <li>The image has been blocked by <a href='https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS' target='_blank'>CORS policy</a>. You need to host the image under the same protocol and domain or enable 'Access-Control-Allow-Origin' on the server where you host the image. <a href='http://enable-cors.org/' target='_blank'>Read more about it here.</a><
                            /li>
                        </ul>
                    </p>
                `);
			},
		});

		this.toggleLock(Boolean(this.locked));

		const _onTextChanged = (textElem) => {
			if (textElem.chargeAfterEditing) {
				if (!textElem._isPriced) {
					this.changePrice(textElem.price, "+");
					textElem._isPriced = true;
				}

				if (textElem._initialText === textElem.text && textElem._isPriced) {
					this.changePrice(textElem.price, "-");
					textElem._isPriced = false;
				}
			}
		};

		this.fabricCanvas.on({
			"object:added": (opts) => {
				let element = opts.target,
					price = element.price;

				//if element is added into upload zone, use upload zone price if one is set
				if (element._addToUZ && element._addToUZ != "") {
					var uploadZoneObj = this.fabricCanvas.getElementByTitle(element._addToUZ);
					price = uploadZoneObj && uploadZoneObj.price ? uploadZoneObj.price : price;
				}

				if (
					price !== undefined &&
					price !== 0 &&
					!element.uploadZone &&
					!element._ignore &&
					(!element.chargeAfterEditing || element._isPriced)
				) {
					this.changePrice(price, "+");
				}
			},
			"object:removed": (opts) => {
				const element = opts.target;

				if (
					element.price !== undefined &&
					element.price !== 0 &&
					!element.uploadZone &&
					(!element.chargeAfterEditing || element._isPriced)
				) {
					this.changePrice(element.price, "-");
				}
			},
			"text:changed": (opts) => {
				_onTextChanged(opts.target);
			},
			elementModify: (opts) => {
				if (this.elementsAdded && opts.options.hasOwnProperty("text")) {
					_onTextChanged(opts.element);
				}
			},
			elementFillChange: (opts) => {
				this.#setColorPrice(opts.element);
			},
		});
	}

	/**
	 * This method needs to be called to initialize the generation.
	 *
	 * @method init
	 */
	init() {
		this.loadElements(this.viewData.elements, this.#afterSetup.bind(this));
	}

	/**
	 * Removes the current elements and loads a set of new elements into the view.
	 *
	 * @param {Array} elements An array containing elements.
	 * @param {Function} callback A function that will be called when all elements have beed added.
	 * @method loadElements
	 */
	loadElements(elements, callback) {
		if (this.fabricCanvas.initialElementsLoaded) {
			this.fabricCanvas.reset(false);
		}

		this.fabricCanvas.offHistory();
		this.fabricCanvas.addElements(elements, callback);
	}

	#afterSetup() {
		this.elementsAdded = true;
		this.fabricCanvas._doHistory = true;

		if (this.mask) {
			this.fabricCanvas.setMask(this.mask);
		}

		if (this.onCreatedCallback) this.onCreatedCallback(this);

		this.dispatchEvent(
			new CustomEvent("priceChange", {
				detail: {
					elementPrice: 0,
					truePrice: this.truePrice,
				},
			})
		);
	}

	/**
	 * Creates a data URL of the view.
	 *
	 * @method toDataURL
	 * @param {Function} callback A function that will be called when the data URL is created. The function receives the data URL.
	 * @param {Object} [options] See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toDataURL.
	 * @param {Boolean} [options.onlyExportable=false] If true elements with excludeFromExport=true are not exported in the image.
	 * @param {String} [options.backgroundColor="transparent"] The background color as hexadecimal value. For 'png' you can also use 'transparent'.
	 * @param {fabric.Image} [options.watermarkImg] A fabricJS image that includes the watermark image.
	 * @param {Boolean} [deselectElement=true] Deselect current selected element.
	 */
	toDataURL(callback, options = {}, deselectElement = true) {
		callback = callback === undefined ? function () {} : callback;
		options.onlyExportable = options.onlyExportable === undefined ? false : options.onlyExportable;
		options.multiplier = options.multiplier === undefined ? 1 : options.multiplier;
		options.backgroundColor = options.backgroundColor === undefined ? "transparent" : options.backgroundColor;
		options.watermarkImg = options.watermarkImg === undefined ? null : options.watermarkImg;

		let hiddenObjs = [],
			tempHighlightEditableObjects = this.options.highlightEditableObjects;

		this.options.highlightEditableObjects = "transparent";
		this.fabricCanvas.getObjects().forEach((obj) => {
			if (obj.excludeFromExport && options.onlyExportable) {
				obj.visible = false;
				hiddenObjs.push(obj);
			}
		});

		if (deselectElement) {
			this.fabricCanvas.deselectElement();
		}

		this.fabricCanvas
			.setDimensions({ width: this.options.stageWidth, height: this.options.stageHeight })
			.setZoom(1);

		this.fabricCanvas.setBackgroundColor(options.backgroundColor, () => {
			if (options.watermarkImg) {
				this.fabricCanvas.add(options.watermarkImg);
				options.watermarkImg.center();
				options.watermarkImg.bringToFront();
			}

			//get data url
			callback(this.fabricCanvas.toDataURL(options));

			if (options.watermarkImg) {
				this.fabricCanvas.remove(options.watermarkImg);
			}

			if (this.fabricCanvas.wrapperEl.offsetParent) {
				this.fabricCanvas.resetSize();
			}

			this.fabricCanvas.setBackgroundColor("transparent", () => {
				this.fabricCanvas.renderAll();
			});

			for (var i = 0; i < hiddenObjs.length; ++i) {
				hiddenObjs[i].visible = true;
			}

			this.fabricCanvas.renderAll();

			this.options.highlightEditableObjects = tempHighlightEditableObjects;
		});
	}

	/**
	 * Returns the view as SVG.
	 *
	 * @method toSVG
	 * @param {Object} [options] See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toSVG
	 * @param {fabric.Image} [options.watermarkImg] A fabricJS image that includes the watermark image.
	 * @param {Function} [options.reviver] See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toSVG
	 * @param {Boolean} [options.respectPrintingBox=false] Only generate SVG from printing box
	 * @param {Array} [fontsToEmbed=[]] Aan array containing fonts to embed in the SVG. You can use <a href="https://jquerydoc.fancyproductdesigner.com/classes/FancyProductDesigner.html#method_getUsedColors" target="_blank">getUsedFonts method</a>
	 * @returns {String} A XML representing a SVG.
	 */
	toSVG(options = {}, fontsToEmbed = []) {
		options.respectPrintingBox = options.respectPrintingBox === undefined ? false : options.respectPrintingBox;
		options.watermarkImg = options.watermarkImg === undefined ? null : options.watermarkImg;

		let svg;

		this.fabricCanvas.deselectElement();

		if (options.respectPrintingBox && objectHasKeys(this.options.printingBox, ["left", "top", "width", "height"])) {
			let offsetX = 0,
				offsetY = 0;

			if (objectHasKeys(this.options.output, ["bleed", "width", "height"])) {
				(offsetX = (this.options.output.bleed / this.options.output.width) * this.options.printingBox.width),
					(offsetY =
						(this.options.output.bleed / this.options.output.height) * this.options.printingBox.height);
			}

			options.viewBox = {
				x: this.options.printingBox.left - offsetX,
				y: this.options.printingBox.top - offsetY,
				width: this.options.printingBox.width + offsetX * 2,
				height: this.options.printingBox.height + offsetY * 2,
			};

			this.fabricCanvas
				.setDimensions({
					width: this.options.printingBox.width,
					height: this.options.printingBox.height,
				})
				.setZoom(1);
		} else {
			this.fabricCanvas
				.setDimensions({
					width: this.options.stageWidth,
					height: this.options.stageHeight,
				})
				.setZoom(1);
		}

		//remove background, otherwise unneeeded rect is added in the svg
		let tempCanvasBackground = this.fabricCanvas["backgroundColor"];
		if (tempCanvasBackground == "transparent") {
			this.fabricCanvas["backgroundColor"] = false;
		}

		if (options.watermarkImg) {
			this.fabricCanvas.add(options.watermarkImg);
			options.watermarkImg.center();
			options.watermarkImg.bringToFront();
		}

		svg = this.fabricCanvas.toSVG(options, options.reviver);

		if (options.watermarkImg) {
			this.fabricCanvas.remove(options.watermarkImg);
		}

		this.fabricCanvas["backgroundColor"] = tempCanvasBackground;

		if (this.fabricCanvas.wrapperEl.offsetParent) {
			this.fabricCanvas.resetSize();
		}

		const tempSVG = document.createElement("div");
		tempSVG.innerHTML = svg;

		const defsTag = tempSVG.querySelector("defs");

		const clipPaths = tempSVG.querySelectorAll("clipPath");
		// Move each clipPath to the defs element
		clipPaths.forEach((clipPath) => {
			defsTag.appendChild(clipPath);
		});

		const styleTag = document.createElement("style");

		let googleFontsUrl = "",
			customFontsStr = "";

		fontsToEmbed.forEach((fontItem) => {
			if (fontItem.hasOwnProperty("url")) {
				if (fontItem.url == "google") {
					googleFontsUrl += fontItem.name.replace(/\s/g, "+") + ":ital,wght@0,400;0,700;1,700&";
				} else {
					customFontsStr += parseFontsToEmbed(fontItem);
				}
			}
		});

		if (googleFontsUrl.length > 0) {
			styleTag.insertAdjacentHTML(
				"beforeend",
				'@import url("https://fonts.googleapis.com/css2?family=' +
					googleFontsUrl.replace(/&/g, "&amp;") +
					'display=swap");'
			);
		}

		if (customFontsStr.length > 0) {
			styleTag.insertAdjacentHTML("beforeend", customFontsStr);
		}

		defsTag.appendChild(styleTag);

		let svgString = tempSVG.innerHTML;

		svgString = svgString
			//replace all newlines
			.replace(/(?:\r\n|\r|\n)/g, "");

		return svgString;
	}

	/**
	 * Toggles the lockment of view. If the view is locked, the price of the view will not be added to the total product price.
	 *
	 * @method toggleLock
	 * @param {Boolean} toggle The toggle state.
	 * @returns {Boolean} The toggle state.
	 */
	toggleLock(locked = true) {
		this.locked = locked;

		toggleElemClasses(this.fabricCanvas.wrapperEl, ["fpd-disabled"], locked);

		this.dispatchEvent(
			new CustomEvent("priceChange", {
				detail: {
					elementPrice: 0,
					truePrice: this.truePrice,
				},
			})
		);

		return locked;
	}

	/**
	 * Changes the price by an operator, + or -.
	 *
	 * @method changePrice
	 * @param {Number} price Price as number.
	 * @param {String} operator "+" or "-".
	 * @returns {Number} The total price of the view.
	 */
	changePrice(price, operator, additionalPrice = null) {
		if (typeof price !== "number") {
			price = Number(price);
		}

		if (operator === "+") {
			this.totalPrice += price;
		} else {
			this.totalPrice -= price;
		}

		if (additionalPrice !== null) {
			let tempAdditionalPrice = this.additionalPrice;
			this.totalPrice -= tempAdditionalPrice;

			this.additionalPrice = additionalPrice;
			this.totalPrice += additionalPrice;
		}

		this.truePrice = this.totalPrice;

		//consider max. view price
		if (
			typeof this.options.maxPrice === "number" &&
			this.options.maxPrice != -1 &&
			this.truePrice > this.options.maxPrice
		) {
			this.truePrice = Number(this.options.maxPrice);
		}

		//price has decimals, set max. decimals to 2
		if (this.truePrice % 1 != 0) {
			this.truePrice = Number(this.truePrice.toFixed(2));
		}

		/**
		 * Gets fired as soon as the price has changed.
		 *
		 * @event priceChange
		 * @param {Event} event
		 * @param {number} event.detail.elementPrice - The price of the added element.
		 * @param {number} event.detail.truePrice - The total price.
		 */
		this.dispatchEvent(
			new CustomEvent("priceChange", {
				detail: {
					elementPrice: price,
					truePrice: this.truePrice,
				},
			})
		);

		return this.truePrice;
	}

	//sets the price for the element if it has color prices
	#setColorPrice(element) {
		//only execute when initial elements are loaded and element has color prices and colors is an object
		if (
			this.elementsAdded &&
			element.colorPrices &&
			typeof element.colors === "object" &&
			element.colors.length > 1
		) {
			//subtract current color price, if set and is hex
			if (element.currentColorPrice !== undefined) {
				element.price -= element.currentColorPrice;
				this.changePrice(element.currentColorPrice, "-");
			}

			const hexFill = element.fill;
			if (typeof hexFill === "string") {
				var hexKey = hexFill.replace("#", "");

				if (
					element.colorPrices.hasOwnProperty(hexKey) ||
					element.colorPrices.hasOwnProperty(hexKey.toUpperCase())
				) {
					var elementColorPrice =
						element.colorPrices[hexKey] === undefined
							? element.colorPrices[hexKey.toUpperCase()]
							: element.colorPrices[hexKey];

					element.currentColorPrice = elementColorPrice;
					element.price += element.currentColorPrice;
					this.changePrice(element.currentColorPrice, "+");
				} else {
					element.currentColorPrice = 0;
				}
			} else {
				element.currentColorPrice = 0;
			}
		}
	}
}

window.FancyProductDesigner = FancyProductDesignerView;

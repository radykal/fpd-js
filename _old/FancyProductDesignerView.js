/**
 * The class to create a view. A view contains the canvas. You need to call {{#crossLink "FancyProductDesignerView/setup:method"}}{{/crossLink}} to set up the canvas with all elements, after setting an instance of {{#crossLink "FancyProductDesignerView"}}{{/crossLink}}.
 *
 * @class FancyProductDesignerView
 * @constructor
 * @param {jQuery} elem - jQuery object holding the container.
 * @param {Object} view - The default options for the view.
 * @param {Function} callback - This function will be called as soon as the view and all initial elements are loaded.
 * @param {Object} fabricjsCanvasOptions - Options for the fabricjs canvas.
 */
var FancyProductDesignerView = function($productStage, view, callback, fabricCanvasOptions) {

		mouseDownStage = false,
		tempModifiedParameters = null,
		modifiedType = null,
		limitModifyParameters = {},
		fpdOptions = new FancyProductDesignerOptions();

	var _initialize = function() {

		
		/**
		 * The set zoom for the view.
		 *
		 * @property zoom
		 * @type Number
		 * @default 0
		 */
		instance.zoom = 1;

		/**
		 * The properties for the mask object (url, left, top, width, height).
		 *
		 * @property mask
		 * @type Object
		 * @default null
		 */
		instance.mask = view.mask ? view.mask : null;
		/**
		 * The image object that is going to be used as mask for this view.
		 *
		 * @property maskObject
		 * @type fabric.Image
		 * @default null
		 */
		instance.maskObject = null;
		
		/**
		 * The locked state of the view.
		 *
		 * @property locked
		 * @type Boolean
		 * @default false
		 */
		instance.locked = view.locked !== undefined ? view.locked : view.options.optionalView;
		instance.dragStage = false;

		//PLUS
		instance.textPlaceholder = null;
		instance.numberPlaceholder = null;
		instance.names_numbers = view.names_numbers ? view.names_numbers : null;


		instance.fCanv = instance.stage = new fabric.Canvas(canvas, canvasOptions).on({
			'object:added': function(opts) {

				var element = opts.target,
					price = element.price;

				//if element is added into upload zone, use upload zone price if one is set
				if((element._addToUZ && element._addToUZ != '')) {

					var uploadZoneObj = instance.getElementByTitle(element._addToUZ);
					price = uploadZoneObj && uploadZoneObj.price ? uploadZoneObj.price : price;

				}

				if(price !== undefined &&
					price !== 0 &&
					!element.uploadZone &&
					!element._ignore &&
					(!element.chargeAfterEditing || element._isPriced)
				) {
					element.setCoords();
					instance.changePrice(price, '+');

				}

				$this.trigger('fabricObject:added', [element]);

			},
			'object:removed': function(opts) {

				var element = opts.target;

				if(element.price !== undefined && element.price !== 0 && !element.uploadZone
					&& (!element.chargeAfterEditing || element._isPriced)) {
					instance.changePrice(element.price, '-');
				}

				$this.trigger('fabricObject:removed', [element]);

			}
		});

		if(instance.mask) {
			instance.setMask(instance.mask);
		}

	};

	var _dragStage = function(x, y) {

		instance.stage.relativePan(new fabric.Point(x, y));

	};

	var _snapToGrid = function(element) {

		if(instance._snapElements) {

			var gridX = instance.options.snapGridSize[0] ? instance.options.snapGridSize[0] : 50,
				gridY = instance.options.snapGridSize[1] ? instance.options.snapGridSize[1] : 50,
				currentPosPoint = element.getPointByOrigin('left', 'top'),
				point = new fabric.Point(element.padding + (Math.round(currentPosPoint.x / gridX) * gridX), element.padding + (Math.round(currentPosPoint.y / gridY) * gridY));

				element.setPositionByOrigin(point, 'left', 'top');

		}

	};

	var _smartGuides = function(targetObj) {

		$productStage.siblings('.fpd-snap-line-v, .fpd-snap-line-h').hide();

		var allElements = instance.stage.getObjects().filter(function(t){
			return t.hasRotatingPoint;
		});

	    var bb = instance.currentBoundingObject;

	    if(!bb) {
		    bb = {
			    left: 0,
			    top: 0,
			    width: instance.options.stageWidth,
			    height: instance.options.stageHeight,
		    }
	    }

	    var point = instance.stage.gridSnapMove({
			tolerance: 8,
			guidlines: [
				{cx: bb.left+bb.width/2},
				{cy: bb.top+bb.height/2}
			],
			objects: allElements,
			target: targetObj
	    });

	    delete instance.stage.__snapCache;

	    if(point) {

			if(point.x !== undefined){
				$productStage.siblings('.fpd-snap-line-v')
				.css('left', $productStage.position().left + point.x * instance.responsiveScale ).show();
			}
			if(point.y !== undefined) {
				$productStage.siblings('.fpd-snap-line-h')
				.css('top', $productStage.position().top + (point.y * instance.responsiveScale) ).show();
			}

	    }

	};

	

	//sets the price for the element if it has color prices
	var _setColorPrice = function(element, hex) {

		//only execute when initial elements are loaded and element has color prices and colors is an object
		if(initialElementsLoaded && element.colorPrices && typeof element.colors === 'object' && element.colors.length > 1) {

			//subtract current color price, if set and is hex
			if(element.currentColorPrice !== undefined) {
				element.price -= element.currentColorPrice;
				instance.changePrice(element.currentColorPrice, '-');
			}

			if(typeof hex === 'string') {

				var hexKey = hex.replace('#', '');

				if(element.colorPrices.hasOwnProperty(hexKey) || element.colorPrices.hasOwnProperty(hexKey.toUpperCase())) {

					var elementColorPrice = element.colorPrices[hexKey] === undefined ? element.colorPrices[hexKey.toUpperCase()] : element.colorPrices[hexKey];

					element.currentColorPrice = elementColorPrice;
					element.price += element.currentColorPrice;
					instance.changePrice(element.currentColorPrice, '+');

				}
				else {
					element.currentColorPrice = 0;
				}

			}
			else {
				element.currentColorPrice = 0;
			}

		}

	};

	


	/**
	 * Creates a data URL of the view.
	 *
	 * @method toDataURL
	 * @param {Function} callback A function that will be called when the data URL is created. The function receives the data URL.
	 * @param {String} [backgroundColor=transparent] The background color as hexadecimal value. For 'png' you can also use 'transparent'.
	 * @param {Object} [options] See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toDataURL.
	 * @param {Boolean} [options.onlyExportable=false] If true elements with excludeFromExport=true are not exported in the image.
	 * @param {fabric.Image} [watermarkImg=null] A fabricJS image that includes the watermark image.
	 * @param {Boolean} [deselectElement=true] Deselect current selected element.
	 */
	this.toDataURL = function(callback, backgroundColor, options, watermarkImg, deselectElement) {

		callback = callback === undefined ? function() {} : callback;
		backgroundColor = backgroundColor === undefined ? 'transparent' : backgroundColor;
		options = options === undefined ? {} : options;
		options.onlyExportable = options.onlyExportable === undefined ? false : options.onlyExportable;
		options.multiplier = options.multiplier === undefined ? 1 : options.multiplier;
		options.enableRetinaScaling = options.enableRetinaScaling === undefined ? false : options.enableRetinaScaling;
		watermarkImg = watermarkImg === undefined ? false : watermarkImg;
		deselectElement = deselectElement === undefined ? true : deselectElement;

		var invisibleObjs = ['_snap_lines_group', '_ruler_hor', '_ruler_ver'],
			hiddenObjs = [],
			 tempHighlightEditableObjects = instance.options.highlightEditableObjects;

		instance.options.highlightEditableObjects = 'transparent';
		instance.stage.getObjects().forEach(function(obj) {

			if(invisibleObjs.indexOf(obj.id) !== -1 || (obj.excludeFromExport && options.onlyExportable)) {

				obj.visible = false;
				hiddenObjs.push(obj);

			}

		});

		if(deselectElement) {
			instance.deselectElement();
		}

		var tempDevicePixelRatio = fabric.devicePixelRatio;
		fabric.devicePixelRatio = 1;

		instance.stage.setDimensions({width: instance.options.stageWidth, height: instance.options.stageHeight}).setZoom(1);

		//scale view mask to multiplier
		if(instance.maskObject && instance.maskObject._originParams) {
			instance.maskObject.left = instance.maskObject._originParams.left * options.multiplier;
			instance.maskObject.top = instance.maskObject._originParams.top * options.multiplier;
			instance.maskObject.scaleX = instance.maskObject._originParams.scaleX * options.multiplier;
			instance.maskObject.scaleY = instance.maskObject._originParams.scaleY * options.multiplier;
			instance.maskObject.setCoords();
		}

		instance.stage.setBackgroundColor(backgroundColor, function() {

			if(watermarkImg) {
				instance.stage.add(watermarkImg);
				watermarkImg.center();
				watermarkImg.bringToFront();
			}

			//get data url
			callback(instance.stage.toDataURL(options));

			if(watermarkImg) {
				instance.stage.remove(watermarkImg);
			}

			if($(instance.stage.wrapperEl).is(':visible')) {
				instance.resetCanvasSize();
			}

			instance.stage.setBackgroundColor('transparent', function() {
				instance.stage.renderAll();
			});

			for(var i=0; i<hiddenObjs.length; ++i) {
				hiddenObjs[i].visible = true;
			}

			instance.stage.renderAll();

			fabric.devicePixelRatio = tempDevicePixelRatio;
			instance.options.highlightEditableObjects = tempHighlightEditableObjects;

		});

	};

	/**
	 * Returns the view as SVG.
	 *
	 * @method toSVG
	 * @param {Object} options See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toSVG
	 * @param {Function} reviver See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toSVG
	 * @param {Boolean} respectPrintingBox Only generate SVG from printing box
	 * @param {fabric.Image} [watermarkImg=null] A fabricJS image that includes the watermark image.
	 * @param {Array} [fontsToEmbed=[]] Aan array containing fonts to embed in the SVG. You can use <a href="https://jquerydoc.fancyproductdesigner.com/classes/FancyProductDesigner.html#method_getUsedColors" target="_blank">getUsedFonts method</a>
	 * @return {String} A XML representing a SVG.
	 */
	this.toSVG = function(options, reviver, respectPrintingBox, watermarkImg, fontsToEmbed) {

		options = options === undefined ? {} : options;
		respectPrintingBox = respectPrintingBox === undefined ? false : respectPrintingBox;
		watermarkImg = watermarkImg === undefined ? null : watermarkImg;
		fontsToEmbed = fontsToEmbed === undefined ? [] : fontsToEmbed;

		var svg;

		instance.deselectElement();
		if(respectPrintingBox && FPDUtil.objectHasKeys(instance.options.printingBox, ['left','top','width','height'])) {

			var offsetX = 0,
				offsetY = 0;

			if(FPDUtil.objectHasKeys(instance.options.output, ['bleed', 'width', 'height'])) {
				offsetX = (instance.options.output.bleed / instance.options.output.width) * instance.options.printingBox.width,
				offsetY = (instance.options.output.bleed / instance.options.output.height) * instance.options.printingBox.height;
			}

			options.viewBox = {
				x: instance.options.printingBox.left - offsetX,
				y: instance.options.printingBox.top - offsetY,
				width: instance.options.printingBox.width + (offsetX * 2),
				height: instance.options.printingBox.height  + (offsetY * 2)
			};

			instance.stage.setDimensions({width: instance.options.printingBox.width, height: instance.options.printingBox.height}).setZoom(1);
		}
		else {
			instance.stage.setDimensions({width: instance.options.stageWidth, height: instance.options.stageHeight}).setZoom(1);
		}

		//remove background, otherwise unneeeded rect is added in the svg
		var tempCanvasBackground = instance.stage['backgroundColor'];
		if(tempCanvasBackground == 'transparent') {
			instance.stage['backgroundColor'] = false;
		}

		if(watermarkImg) {
			instance.stage.add(watermarkImg);
			watermarkImg.center();
			watermarkImg.bringToFront();
		}

		svg = instance.stage.toSVG(options, reviver);

		if(watermarkImg) {
			instance.stage.remove(watermarkImg);
		}

		instance.stage['backgroundColor'] = tempCanvasBackground;

		if($(instance.stage.wrapperEl).is(':visible')) {
			instance.resetCanvasSize();
		}

		var $svg = $(svg);

		//move clipPath to defs section
		$svg.find('clipPath').appendTo($svg.children('defs'));

		//store fonts in style tag
		$svg.children('defs').append('<style type="text/css"></style>');
		var googleFontsUrl = '',
			customFontsStr = '';

		fontsToEmbed.forEach(function(fontItem) {

			if(fontItem.hasOwnProperty('url')) {

				if(fontItem.url == 'google') {
					googleFontsUrl += fontItem.name.replace(/\s/g, "+") + ':ital,wght@0,400;0,700;1,700&';
				}
				else {
					customFontsStr += FPDUtil.parseFontsToEmbed(fontItem);
				}

			}
		})

		if(googleFontsUrl.length > 0) {
			$svg.find('defs > style').append('@import url("https://fonts.googleapis.com/css2?family='+googleFontsUrl.replace(/&/g, "&amp;")+'display=swap");');
		}
		if(customFontsStr.length > 0) {
			$svg.find('defs > style').append(customFontsStr);
		}

		svg = $('<div>').append(
			$svg.clone()).html()
			//replace all newlines
			.replace(/(?:\r\n|\r|\n)/g, '')
			//replace & with escaped string for google fonts url, otherwise syntax error
			.replace(/700&/g, "700&amp;"
		);

		return svg;

	};

	/**
	 * Changes the price by an operator, + or -.
	 *
	 * @method changePrice
	 * @param {Number} price Price as number.
	 * @param {String} operator "+" or "-".
	 * @return {Number} The total price of the view.
	 */
	this.changePrice = function(price, operator, additionalPrice) {

		additionalPrice = additionalPrice === undefined ? null : additionalPrice;

		if(typeof price !== 'number') {
			price = Number(price);
		}

		if(operator === '+') {
			instance.totalPrice += price;
		}
		else {
			instance.totalPrice -= price;
		}

		if(additionalPrice !== null) {

			var tempAdditionalPrice = instance.additionalPrice;
			instance.totalPrice -= tempAdditionalPrice;

			instance.additionalPrice = additionalPrice;
			instance.totalPrice += additionalPrice;

		}

		instance.truePrice = instance.totalPrice;

		//consider max. view price
		if(typeof instance.options.maxPrice === 'number' && instance.options.maxPrice != -1 && instance.truePrice > instance.options.maxPrice) {
			instance.truePrice = Number(instance.options.maxPrice);
		}

		//price has decimals, set max. decimals to 2
		if(instance.truePrice % 1 != 0) {
			instance.truePrice = Number(instance.truePrice.toFixed(2));
		}

		/**
	     * Gets fired as soon as the price has changed.
	     *
	     * @event FancyProductDesignerView#priceChange
	     * @param {Event} event
	     * @param {number} elementPrice - The price of the added element.
	     * @param {number} truePrice - The total price.
	     */
		$this.trigger('priceChange', [price, instance.truePrice]);

		return instance.truePrice;

	};

	/**
	 * Use a SVG image as mask for the whole view. The image needs to be a SVG file with only one path. The method toSVG() does not include the mask.
	 *
	 * @method setMask
	 * @param {Object|Null} maskOptions An object containing the URL to the svg. Optional: scaleX, scaleY, left and top.
	 */
	this.setMask = function(maskOptions, callback) {

		callback = typeof callback !== 'undefined' ? callback : function() {};

		if(maskOptions && maskOptions.url && $.inArray('svg', maskOptions.url.split('.')) != -1) {

			instance.mask = maskOptions;

			var timeStamp = Date.now().toString(),
				_loadFromScript = instance.options._loadFromScript ? instance.options._loadFromScript : '',
				url = _loadFromScript + maskOptions.url;

			if(instance.options.imageLoadTimestamp && !instance.options._loadFromScript) {
				url += '?'+timeStamp;
			}

			//check if url is available
			$.get(url)
			.done(function(data) {

				fabric.loadSVGFromURL(url, function(objects, options) {

					var svgGroup = null;
					if(objects) {
						//if objects is null, svg is loaded from external server with cors disabled
						svgGroup = objects ? fabric.util.groupSVGElements(objects, options) : null;

						svgGroup.setOptions({
							left: maskOptions.left ? Number(maskOptions.left) :  0,
							top: maskOptions.top ? Number(maskOptions.top) :  0,
							scaleX: maskOptions.scaleX ? Number(maskOptions.scaleX) :  1,
							scaleY: maskOptions.scaleY ? Number(maskOptions.scaleY) :  1,
							selectable: true,
							evented: false,
							resizable: true,
							lockUniScaling: false,
							lockRotation: true,
							borderColor: 'transparent',
							fill: 'rgba(0,0,0,0)',
							transparentCorners: true,
							cornerColor: instance.options.selectedColor,
							cornerIconColor: instance.options.cornerIconColor,
							cornerSize: 24,
							originX: 'left',
							originY: 'top',
							name: "view-mask",
							objectCaching: false,
							excludeFromExport: true,
							_ignore: true,
							_originParams: {
								left: maskOptions.left ? Number(maskOptions.left) :  0,
								top: maskOptions.top ? Number(maskOptions.top) :  0,
								scaleX: maskOptions.scaleX ? Number(maskOptions.scaleX) :  1,
								scaleY: maskOptions.scaleY ? Number(maskOptions.scaleY) :  1,
							}
						})

						instance.stage.clipTo = function(ctx) {
						  svgGroup.render(ctx);
						};
						instance.stage.renderAll();

						instance.maskObject = svgGroup;
						instance.resetCanvasSize();
					}

					callback(svgGroup);

				});

			})
			.fail(callback);

		}
		else {
			instance.stage.clipTo = instance.maskObject = instance.mask = null;
			instance.stage.renderAll();
		}

	};

	/**
	 * Toggles the lockment of view. If the view is locked, the price of the view will not be added to the total product price.
	 *
	 * @method toggleLock
	 * @param {Boolean} toggle The toggle state.
	 * @return {Boolean} The toggle state.
	 */
	this.toggleLock = function(toggle) {

		toggle = toggle === undefined ? true : toggle;

		instance.locked = toggle;

		$this.trigger('priceChange', [0, instance.truePrice]);

		return toggle;

	};


};
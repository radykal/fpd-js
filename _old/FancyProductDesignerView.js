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

	var _initialize = function() {

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
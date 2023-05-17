/**
 * This is the main entry point to access FPD via the API. FancyProductDesigner class contains the instances of {{#crossLink "FancyProductDesignerView"}}FancyProductDesignerView{{/crossLink}} class.
 *
 *<h5>Example</h5>
 * Best practice to use the API is to wait for the ready event, then the UI and all products/designs has been set (not loaded).<pre>var fpd = new FancyProductDesigner($fpd, options);
 $fpd.on('ready', function() { //use api methods in here })</pre>
 * @class FancyProductDesigner
 * @constructor
 * @param {HTMLElement | jQuery} elem - A HTML element with an unique ID.
 * @param {Object} [opts] - See {{#crossLink "Options.defaults"}}{{/crossLink}}.
 */


var FancyProductDesigner = function(elem, opts) {

	/**
	 * The order quantity.
	 *
	 * @property orderQuantity
	 * @type Number
	 * @default 1
	 */
	this.orderQuantity = 1;

	/**
	 * If FPDBulkVariations is used with the product designer, this is the instance to the FPDBulkVariations class.
	 *
	 * @property bulkVariations
	 * @type FPDBulkVariations
	 * @default null
	 */
	this.bulkVariations = null;

	this._order = {};

	//now load UI elements from external HTML file
	var _loadProductDesignerTemplate = function(html) {

		//init Toolbar
		var $elementToolbar = $uiElements.children('.fpd-element-toolbar');
		if(instance.mainOptions.uiTheme === 'doyle') {
			$elementToolbar = $uiElements.children('.fpd-element-toolbar-side');
			instance.toolbar = new FPDToolbarSide($elementToolbar, instance);
		}
		else {
			$elementToolbar = $uiElements.children('.fpd-element-toolbar-smart');
			instance.toolbar = new FPDToolbarSmart($elementToolbar, instance);
		}

		.on('elementChange', function(evt, type, element) {

			if(!element._ignore && instance.mainOptions.uiTheme !== 'doyle') {
				instance.toolbar.toggle(false, false);
			}


		})
		.on('elementModify', function(evt, element, parameters) {

			if(instance.productCreated && !element._ignore) {

				if(!instance.toolbar.isTransforming) {

					if(parameters.fontSize !== undefined) {
						instance.toolbar.updateUIValue('fontSize', Number(parameters.fontSize));
					}

					if(parameters.scaleX !== undefined) {
						instance.toolbar.updateUIValue('scaleX', parseFloat(Number(parameters.scaleX).toFixed(2)));
					}

					if(parameters.scaleY !== undefined) {
						instance.toolbar.updateUIValue('scaleY', parseFloat(Number(parameters.scaleY).toFixed(2)));
					}

					if(parameters.angle !== undefined) {
						instance.toolbar.updateUIValue('angle', parseInt(parameters.angle));
					}

					if(parameters.text !== undefined) {
						instance.toolbar.updateUIValue('text', parameters.text);
					}

					if(instance.currentElement && !instance.currentElement.uploadZone) {
						instance.toolbar.updatePosition(instance.currentElement);
					}

					if(parameters.shadowColor !== undefined && parameters.shadowColor == '') {

						instance.toolbar.updateUIValue('shadowBlur', 0);
						instance.toolbar.updateUIValue('shadowOffsetX', 0);
						instance.toolbar.updateUIValue('shadowOffsetY', 0);

					}

				}

			}

		})

	};

	var _ready = function() {

		//load watermark image
		if(instance.mainOptions.watermark && instance.mainOptions.watermark.length > 3) {

			fabric.Image.fromURL(instance.mainOptions.watermark, function(oImg) {
				instance.watermarkImg = oImg;
			}, {crossOrigin: "anonymous"});

		}

		if(instance.mainOptions.unsavedProductAlert) {

			window.onbeforeunload = function () {

				if(instance.doUnsavedAlert) {
					return '';
				}

			};

		}

		//general close handler for modal
		$body
		on('mousedown', function(evt) {

			var $target = $(evt.target);
			_fixSelectionTextarea = $target.is('textarea') && $target.data('control') ? true : false;

		})

		instance.$container
		.on('viewSelect', function(evt, index, viewInstance) {

			instance.$viewSelectionWrapper.children('.fpd-view-prev, fpd-view-next').toggleClass('fpd-hidden', instance.viewInstances.length <= 1);
			instance.$viewSelectionWrapper.find('.fpd-view-prev').toggleClass('fpd-disabled', index === 0);
			instance.$viewSelectionWrapper.find('.fpd-view-next').toggleClass('fpd-disabled', index === instance.viewInstances.length - 1);

		})

		//view lock handler
		instance.$mainWrapper.on('click', '.fpd-modal-lock > .fpd-toggle-lock', function() {

			$(this).parents('.fpd-modal-lock:first').toggleClass('fpd-unlocked');
			instance.currentViewInstance.toggleLock(!instance.currentViewInstance.locked);

		});


	};

	var _calculateViewsPrice = function() {

		instance.currentPrice = instance.singleProductPrice = 0;

		//calulate total price of all views
		for(var i=0; i < instance.viewInstances.length; ++i) {

			if(!instance.viewInstances[i].locked) {
				instance.singleProductPrice += instance.viewInstances[i].truePrice;
			}

		}
	};

	/**
	 * Sets the order quantity.
	 *
	 * @method setOrderQuantity
	 * @param {Number} quantity The width in pixel.
	 */
	this.setOrderQuantity = function(quantity) {

		quantity = quantity == '' || quantity < 0 ? 1 : quantity;
		instance.orderQuantity = quantity;

		var truePrice = instance.calculatePrice();

		$elem.trigger('priceChange', [null, truePrice, instance.singleProductPrice]);

	};

	/**
	 * Returns an order object containing the product from the getProduct() method, usedFonts from getUsedFonts() and usedColors from getUsedColors(). If using plus add-on and bulk variations, the variations will be added into the object.
	 *
	 * @method getOrder
	 * @param {Object} [options={}] Options for the methods that are called inside this mehtod, e.g. getProduct() can receive two parameters.
	 * @return {object} An object containing different objects representing important order data.
	 * @example
	 * // includes only editable elements and the user needs to customize the initial product
	 * fpd.getOrder( {onlyEditableElements: true, customizationRequired: true} );
	 */
	this.getOrder = function(options) {

		options = options === undefined ? {} : options;

		instance._order.product = instance.getProduct(
			options.onlyEditableElements || false,
			options.customizationRequired || false
		);

		instance._order.usedFonts = instance.getUsedFonts();
		instance._order.usedColors = [];

		instance.getUsedColors().forEach(function(hexValue) {

			var colorName = instance.mainOptions.hexNames[hexValue.replace('#', '').toLowerCase()],
				colorItem = {hex: hexValue};

			if(colorName) {
				colorItem.name = colorName;
			}

			instance._order.usedColors.push(colorItem)
		});

		$elem.trigger('getOrder');

		return instance._order;

	};

	

	/**
	 * Get all used colors from a single or all views.
	 *
	 * @method getUsedColors
	 * @param {Number} [viewIndex=-1] The index of the target view. By default all views are target.
	 * @return {array} An array with hexdecimal color values.
	 */
	this.getUsedColors = function(viewIndex) {

		var usedColors = [];
		this.getElements(viewIndex, 'all', false).forEach(function(element) {

			var type = FPDUtil.elementIsColorizable(element);
			if(type) {

				if(type === 'svg') {

					if(element.type === FPDPathGroupName) { //multi pathes
						element.getObjects().forEach(function(path) {
							if(FPDUtil.isHex(path.fill)) {
								usedColors.push(path.fill);
							}
						});
					}
					else { //single path
						if(FPDUtil.isHex(element.fill)) {
							usedColors.push(element.fill);
						}
					}

				}
				else {
					if(FPDUtil.isHex(element.fill)) {
						usedColors.push(element.fill);
					}
				}
			}

		});

		return FPDUtil.arrayUnique(usedColors);

	};


	/**
	 * Calculates the total price considering the elements price in all views and pricing rules.
	 *
	 * @method calculatePrice
	 * @param {Boolean} [considerQuantity=true] Calculate with or without quantity.
	 * @return {Number} The calculated price.
	 */
	this.calculatePrice = function(considerQuantity) {

		considerQuantity = considerQuantity === undefined ? true : considerQuantity;

		_calculateViewsPrice();

		var calculatedPrice = instance.singleProductPrice;
		instance.currentPrice = calculatedPrice;

		calculatedPrice += instance.pricingRulesPrice;

		if(considerQuantity) {
			calculatedPrice *= instance.orderQuantity;
		}

		//price has decimals, set max. decimals to 2
		if(calculatedPrice % 1 != 0) {
			calculatedPrice = Number(calculatedPrice.toFixed(2));
		}

		return calculatedPrice;

	}

	/**
	 * Removes a view by its index value.
	 *
	 * @method removeView
	 * @param {Number} [viewIndex=0] The index of the target view.
	 */
	this.removeView = function(viewIndex) {

		viewIndex = viewIndex === undefined ? 0 : viewIndex;

		var $viewStage = instance.$productStage.children('.fpd-view-stage').eq(viewIndex);

		instance.$viewSelectionWrapper.find('.fpd-item').eq(viewIndex).remove();
		$viewStage.remove();

		instance.viewInstances.splice(viewIndex, 1);

		//select next view if removing view is showing
		if(instance.viewInstances.length > 0) {
			viewIndex == instance.currentViewIndex ? instance.selectView(0) : instance.selectView(viewIndex);
		}

		/**
		 * Gets fired when a view is removed.
		 *
		 * @event FancyProductDesigner#viewRemove
		 * @param {Event} event
		 * @param {Number} viewIndex
		 */
		$elem.trigger('viewRemove', [viewIndex]);

		var truePrice = instance.calculatePrice();

		/**
	     * Gets fired as soon as the price changes in a view.
	     *
	     * @event FancyProductDesigner#priceChange
	     * @param {Event} event
	     * @param {number} elementPrice - The price of the element.
	     * @param {number} totalPrice - The true price of all views with quantity.
	     * @param {number} singleProductPrice - The true price of all views without quantity.
	     */
		$elem.trigger('priceChange', [null, truePrice, instance.singleProductPrice]);

	};


	/**
	 * Generates an object that will be used for the print-ready export. This objects includes the used fonts and the SVG data strings to generate the PDF.
	 *
	 * @method getPrintOrderData
	 * @version 4.7.6
	 */
	this.getPrintOrderData = function() {

		var printOrderData = {
			used_fonts: instance.getUsedFonts(),
			svg_data: [],
			custom_images: []
		};

		for(var i=0; i < instance.viewInstances.length; ++i) {

			printOrderData.svg_data.push({
				svg: instance.viewInstances[i].toSVG({}, null, true),
				output: instance.viewInstances[i].options.output
			});

		}

		instance.getCustomElements('image').forEach(function(img) {

			printOrderData.custom_images.push(img.element.source);

		})

		return printOrderData;

	};

};
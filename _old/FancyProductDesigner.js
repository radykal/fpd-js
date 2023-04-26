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

		zoomReseted = false,
		$draggedImage,

	/**
	 * jQuery object pointing on the tooltip for the current selected element.
	 *
	 * @property $elementTooltip
	 * @type jQuery
	 */
	this.$elementTooltip = null;

	/**
	 * URL to the watermark image if one is set via options.
	 *
	 * @property watermarkImg
	 * @type String
	 * @default null
	 */
	this.watermarkImg = null;


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

	/**
	 * Returns if mouse is over a fabricJS canvas and in which case the fabricJS object.
	 *
	 * @property mouseOverCanvas
	 * @type Boolean
	 * @default false
	 */
	this.mouseOverCanvas = false;

	this._order = {};

	var _initialize = function() {

		instance.mainOptions.mainBarContainer = instance.mainOptions.modalMode !== false ? false : instance.mainOptions.mainBarContainer;

		//force sidebar when main bar container is set
		if(instance.mainOptions.mainBarContainer) {
			$elem.removeClass('fpd-sidebar').addClass('fpd-topbar');
		}

		if(!instance.mainOptions.fabricCanvasOptions.allowTouchScrolling) {
			$elem.addClass('fpd-disable-touch-scrolling');
		}

		//add product designer into modal
		if(instance.mainOptions.modalMode) {

			$elem.removeClass('fpd-hidden');
			$body.addClass('fpd-modal-mode-active');

			var $modalProductDesigner = $elem.wrap('<div class="fpd-modal-product-designer fpd-modal-overlay fpd-fullscreen"><div class="fpd-modal-wrapper"></div></div>').parents('.fpd-modal-overlay:first'),
				modalProductDesignerOnceOpened = false;

			$modalProductDesigner.children()
			.append('<div class="fpd-done fpd-btn" data-defaulttext="Done">misc.modal_done</div><div class="fpd-modal-close"><span class="fpd-icon-close"></span></div>');

			$(instance.mainOptions.modalMode).addClass('fpd-modal-mode-btn').click(function(evt) {

				evt.preventDefault();

				$body.addClass('fpd-overflow-hidden').removeClass('fpd-modal-mode-active');
				$modalProductDesigner.addClass('fpd-fullscreen').fadeIn(300);

				if(instance.currentViewInstance) {
					instance.currentViewInstance.resetCanvasSize();
					instance.resetZoom();
				}

				var $selectedModule = $mainBar.children('.fpd-navigation').children('.fpd-active');
				if($selectedModule.length > 0) {
					instance.mainBar.callModule($selectedModule.data('module'));
				}

				//auto-select
				var autoSelectElement = null;
				if(!modalProductDesignerOnceOpened) {

					if(!instance.mainOptions.editorMode && instance.currentViewInstance) {

						var viewElements = instance.currentViewInstance.stage.getObjects();
						for(var i=0; i < viewElements.length; ++i) {
							var obj = viewElements[i];

							 if(obj.autoSelect && !obj.hasUploadZone) {
								 autoSelectElement = obj;
							 }

						}

					}

				}

				setTimeout(function() {

					if(autoSelectElement) {
						instance.currentViewInstance.stage.setActiveObject(autoSelectElement);
						instance.currentViewInstance.stage.renderAll();
					}

				}, 300);

				modalProductDesignerOnceOpened = true;

				/**
			     * Gets fired when the modal with the product designer opens.
			     *
			     * @event FancyProductDesigner#modalDesignerOpen
			     * @param {Event} event
			     */
				instance.$container.trigger('modalDesignerOpen');

			});

			$modalProductDesigner.find('.fpd-done').click(function() {

				$modalProductDesigner.find('.fpd-modal-close').click();

				/**
			     * Gets fired when the modal with the product designer closes.
			     *
			     * @event FancyProductDesigner#modalDesignerClose
			     * @param {Event} event
			     */
				instance.$container.trigger('modalDesignerClose');

			});

		}

		//PLUS
		if(typeof FancyProductDesignerPlus !== 'undefined') {
			FancyProductDesignerPlus.setup($elem, instance);
		}

		//PRICING RULES
		if(typeof FPDPricingRules !== 'undefined') {
			instance.pricingRulesInstance = new FPDPricingRules($elem, instance);
		}


	}; //init end

	//init the product stage
	var _initProductStage = function() {


		//load editor box if requested
		if(typeof instance.mainOptions.editorMode === 'string') {

			$editorBox = $('<div class="fpd-editor-box"><h5></h5><div class="fpd-clearfix"></div></div>');
			$(instance.mainOptions.editorMode).append($editorBox);

		}

		$body.on('focus blur', '[class^="fpd-element-toolbar"] textarea, [class^="fpd-element-toolbar"] input[type="number"], [class^="fpd-element-toolbar"] input[type="text"]', function(evt) {
			inTextField = evt.type == 'focusin';

		});

		$window.resize(function() {


			if(instance.actions) {

				instance.actions.hideAllTooltips();
				if(!zoomReseted) {
					instance.resetZoom();
				}

			}

			//deselect element if one is selected and active element is not input (FB browser fix)
			if(instance.currentElement && $(document.activeElement).is(':not(input)') && $(document.activeElement).is(':not(textarea)')) {
				instance.deselectElement();
			}

			if((instance.currentElement && instance.currentElement.isEditing) || instance.mainOptions.editorMode) {
				return;
			}

		});


	};

	//now load UI elements from external HTML file
	var _loadProductDesignerTemplate = function(html) {

		if(instance.mainOptions.mainBarContainer) {

			$elem.addClass('fpd-main-bar-container-enabled');
			$mainBar = $(instance.mainOptions.mainBarContainer).addClass('fpd-container fpd-main-bar-container fpd-tabs fpd-tabs-top fpd-sidebar fpd-grid-columns-'+instance.mainOptions.gridColumns).html($uiElements.children('.fpd-mainbar')).children('.fpd-mainbar');

		}
		else {
			$mainBar = $uiElements.children('.fpd-mainbar').insertBefore($elem.children('.fpd-loader-wrapper'));
		}

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

		var zoomStart = 1,
			zoomDiff = undefined,
			zoomEnd = 1;

		$elem.on('elementSelect', function(evt, element) {

			

		})
		.on('elementChange', function(evt, type, element) {

			if(!element._ignore && instance.mainOptions.uiTheme !== 'doyle') {
				instance.toolbar.toggle(false, false);
			}

			if(instance.mainOptions.fabricCanvasOptions.allowTouchScrolling) {
				$elem.addClass('fpd-disable-touch-scrolling');
				instance.currentViewInstance.stage.allowTouchScrolling = false;
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

				//text link group
				if(parameters.text && !FPDUtil.isEmpty(element.textLinkGroup)) {

					for(var i=0; i < instance.viewInstances.length; ++i) {

						instance.viewInstances[i].fCanv.getObjects().forEach(function(obj) {

							if(obj !== element && FPDUtil.getType(obj.type) === 'text' && obj.textLinkGroup === element.textLinkGroup) {
								obj.set('text', element.text);
								$elem.trigger('_doPricingRules');
							}

						})

					}

				}

				if(!FPDUtil.isEmpty(element.textLinkGroup)) {

					var textLinkGroupProps = instance.mainOptions.textLinkGroupProps || [];
					Object.keys(parameters).forEach(function(param) {

						if(textLinkGroupProps.indexOf(param) != -1) {

							instance.viewInstances.forEach(function(viewInstance) {

								viewInstance.fCanv.getObjects().forEach(function(obj) {

									if(obj !== element && FPDUtil.getType(obj.type) === 'text' && obj.textLinkGroup === element.textLinkGroup) {

										var value = element[param];

										if(param == 'textDecoration') {
											obj.set('underline', value === 'underline');
										}

										if(param == 'letterSpacing') {
											obj.set('charSpacing', value * 100);
										}

										obj.set(param, value);

										$elem.trigger('_doPricingRules');


									}

								})

							})

						}


					});
				}

			}

		})

		//switchers
		$('.fpd-switch-container').click(function() {

			var $this = $(this);

			if($this.hasClass('fpd-curved-text-switcher')) {

				var z = instance.currentViewInstance.getZIndex(instance.currentElement),
					defaultText = instance.currentElement.get('text'),
					parameters = instance.currentViewInstance.getElementJSON(instance.currentElement);

				parameters.z = z;
				parameters.curved = instance.currentElement.type == 'i-text';
				parameters.textAlign = 'center';

				delete parameters['shadow'];

				function _onTextModeChanged(evt, textElement) {
					instance.currentViewInstance.stage.setActiveObject(textElement);
					$elem.off('elementAdd', _onTextModeChanged);

					setTimeout(function() {
						$('.fpd-tool-curved-text').click();
					}, 100);

				};
				$elem.on('elementAdd', _onTextModeChanged);

				instance.currentViewInstance.removeElement(instance.currentElement);
				instance.currentViewInstance.addElement('text', defaultText, defaultText, parameters);

			}

		});


		//drag image items on canvas or upload zone
		var itemDragged = false,
			$targetDraggedItem;

		$body
		.on('mousedown touchdown', '.fpd-grid .fpd-item:not(.fpd-category):not(.fpd-loading)', function(evt) {

			if(instance.mainOptions.dragDropImagesToUploadZones && evt.which == 1) { //only left mouse button

				$targetDraggedItem = $(this);

				itemDragged = false;
				$draggedImage = $('<div class="fpd-dragged-image fpd-hidden"><picture></picture></div>');
				FPDUtil.loadGridImage(
					$draggedImage.children('picture'),
					$targetDraggedItem.data('thumbnail') ? $targetDraggedItem.data('thumbnail'): $targetDraggedItem.data('source')
				);

				$body.append($draggedImage);
				$('.fpd-thumbnail-preview').remove();

			}

		})
		.on('mousemove', function(evt) {

			itemDragged = true;

			if($draggedImage) {

				var leftPos = evt.pageX + 10 + $draggedImage.outerWidth() > $window.width() ? $window.width() - $draggedImage.outerWidth() : evt.pageX + 10;
				$draggedImage.css({left: evt.pageX - ($draggedImage.width() * 0.5), top: evt.pageY - ($draggedImage.height() * 0.5)});

				$body.children('.fpd-dragged-image').removeClass('fpd-hidden');
				setTimeout(function() {

					if($draggedImage) {
						$draggedImage.addClass('fpd-animate');
					}


				}, 1);

				evt.stopPropagation();
				evt.preventDefault();

			}

		})
		.on('mouseup', function(evt) {

			if(!instance._loadingCustomImage && itemDragged && $draggedImage && instance.mouseOverCanvas) {

				instance._addGridItemToStage(
					$targetDraggedItem,
					instance.mouseOverCanvas.uploadZone ? {_addToUZ: instance.mouseOverCanvas.title} : {}
				);

			}

			$body.children('.fpd-dragged-image').remove();
			$draggedImage = null;

		});

		_ready();

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


		//window.localStorage.setItem('fpd-gt-closed', 'no');

	
		//general close handler for modal
		$body.on('click', '.fpd-modal-close', function(evt) {

			var $this = $(this),
				$modal = $this.parents('.fpd-modal-overlay:first');

			if($this.parents('.fpd-modal-product-designer:first').length) {
				$body.addClass('fpd-modal-mode-active');
			}

			$modal.fadeOut(200, function() {

				$this.removeClass('fpd-fullscreen');

				if(!$modal.hasClass('fpd-modal-product-designer')) {
					$modal.trigger('modalRemove').remove();
				}

				$elem.trigger('modalClose');

			});

			//modal product designer is closing
			if($this.parents('.fpd-modal-product-designer:first').length > 0) {
				$body.removeClass('fpd-overflow-hidden');
				instance.deselectElement();
			}
			else if($body.find('.fpd-modal-product-designer').length == 0) {
				$body.removeClass('fpd-overflow-hidden');
			}


		})
		.on('mouseup touchend', function(evt) {

			var $target = $(evt.target);

			//close upload zone panel if click outside of fpd-container, needed otherwise elements can be added to upload zone e.g. mspc
			if($target.closest('.fpd-container, .fpd-modal-internal').length === 0
				&& instance.currentViewInstance && instance.currentViewInstance.currentUploadZone
				&& $stageLoader.is(':hidden')) {
				instance.mainBar.toggleUploadZonePanel(false);

			}


		})
		//thumbnail preview effect
		.on('mouseover mouseout mousemove click', '[data-module="designs"] .fpd-item, [data-module="images"] .fpd-item, [data-module="products"] .fpd-item', function(evt) {

			var $this = $(this),
				price = null;


			if($draggedImage) { return;}

		}).
		on('mousedown', function(evt) {

			var $target = $(evt.target);
			_fixSelectionTextarea = $target.is('textarea') && $target.data('control') ? true : false;

		})
		//guided tour events
		.on('click', '.fpd-gt-close', function() {

			if(FPDUtil.localStorageAvailable()) {

				window.localStorage.setItem('fpd-gt-closed', 'yes');

			}

			$(this).parent('.fpd-gt-step').remove();

		})
		.on('click', '.fpd-gt-next, .fpd-gt-back', function() {

			instance.selectGuidedTourStep($(this).data('target'));

		});

		instance.$container
		.on('productCreate modalDesignerOpen layoutElementsAdded', function(evt, elements) {

			if((!firstProductCreated && !instance.mainOptions.modalMode) || (!firstProductCreated && evt.type === 'modalDesignerOpen')) {

				if(instance.mainOptions.autoOpenInfo) {
					instance.$container.find('[data-action="info"]').click();
				}

				if(instance.mainOptions.guidedTour && Object.keys(instance.mainOptions.guidedTour).length > 0) {

					var firstKey = Object.keys(instance.mainOptions.guidedTour)[0];

					if(FPDUtil.localStorageAvailable()) {
						if(window.localStorage.getItem('fpd-gt-closed') !== 'yes') {
							instance.selectGuidedTourStep(firstKey);
						}
					}
					else {
						instance.selectGuidedTourStep(firstKey);
					}

				}

			}

			firstProductCreated = instance.mainOptions.modalMode && evt.type === 'modalDesignerOpen';

		})
		.on('viewSelect', function(evt, index, viewInstance) {

			var currentViewOptions = viewInstance.options,
				$items = $('[data-module="designs"] .fpd-item, [data-module="images"] .fpd-item');

			$('[data-module="designs"] .fpd-item, [data-module="images"] .fpd-item').each(function() {

				FPDUtil.setItemPrice($(this), instance);

			})

			instance.$viewSelectionWrapper.children('.fpd-view-prev, fpd-view-next').toggleClass('fpd-hidden', instance.viewInstances.length <= 1);
			instance.$viewSelectionWrapper.find('.fpd-view-prev').toggleClass('fpd-disabled', index === 0);
			instance.$viewSelectionWrapper.find('.fpd-view-next').toggleClass('fpd-disabled', index === instance.viewInstances.length - 1);

		})
		.on('secondaryModuleCalled', function(evt, className, $module) {

			FPDUtil.setItemPrice($module.find('.fpd-item'), instance);

		})

		//view lock handler
		instance.$mainWrapper.on('click', '.fpd-modal-lock > .fpd-toggle-lock', function() {

			$(this).parents('.fpd-modal-lock:first').toggleClass('fpd-unlocked');
			instance.currentViewInstance.toggleLock(!instance.currentViewInstance.locked);

		});

		if(instance.mainOptions.productsJSON) {

			if(typeof instance.mainOptions.productsJSON === 'object') {
				instance.setupProducts(instance.mainOptions.productsJSON);
			}
			else {

				$.getJSON(instance.mainOptions.productsJSON)
				.done(function(data) {
					//data = data[0];
					//data = [data];
					instance.setupProducts(data);
				})
				.fail(function() {
					FPDUtil.showModal('Products JSON could not be loaded. Please check that your URL is correct!<br>URL: <i>'+instance.mainOptions.productsJSON+'</i>');
				});

			}

		}

		if(typeof Hammer !== 'undefined' && instance.mainOptions.mobileGesturesBehaviour != 'none') {

			var pinchElementScaleX,
				pinchElementScaleY;

			var mc = new Hammer.Manager($('.fpd-product-stage').get(0));
			mc.add(new Hammer.Pan({ threshold: 0, pointers: 2 }));
			mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([mc.get('pan')]);

			mc.on('pinchmove pinchstart', function(evt) {

				var currentElement = instance.currentElement;

				if(instance.mainOptions.mobileGesturesBehaviour == 'pinchImageScale' && currentElement && FPDUtil.getType(currentElement.type) == 'image' && currentElement.resizable) {

					if(evt.type == 'pinchstart') {

						pinchElementScaleX = currentElement.scaleX;
						pinchElementScaleY = currentElement.scaleY;

					}
					else {

						instance.currentViewInstance.setElementParameters({
							scaleX: pinchElementScaleX * evt.scale,
							scaleY: pinchElementScaleY * evt.scale,
						}, currentElement);

					}

				}
				else if(instance.mainOptions.mobileGesturesBehaviour == 'pinchPanCanvas') {
					instance.setZoom(evt.scale);
				}

			});

			mc.on('panmove', function(evt) {

				if(instance.mainOptions.mobileGesturesBehaviour == 'pinchPanCanvas') {

					var panX = 0,
						panY = 0;

					//left, right
					if(evt.direction == 2 || evt.direction == 4) {
						panX = evt.direction == 2 ? -1 : 1;
					}
					//up, down
					else if(evt.direction == 8 || evt.direction == 16) {
						panY = evt.direction == 8 ? -1 : 1;
					}

					panX = panX * (Math.abs(evt.velocity) * 10);
					panY = panY * (Math.abs(evt.velocity) * 10);

					instance.currentViewInstance.stage.relativePan(new fabric.Point(panX, panY));

				}

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
	 * Adds a new element to the product designer.
	 *
	 * @method addElement
	 * @param {string} type The type of an element you would like to add, 'image' or 'text'.
	 * @param {string} source For image the URL to the image and for text elements the default text.
	 * @param {string} title Only required for image elements.
	 * @param {object} [parameters={}] An object with the parameters, you would like to apply on the element.
	 * @param {number} [viewIndex] The index of the view where the element needs to be added to. If no index is set, it will be added to current showing view.
	 */
	this.addElement = function(type, source, title, parameters, viewIndex) {

		parameters = parameters === undefined ? {} : parameters;

		viewIndex = viewIndex === undefined ? instance.currentViewIndex : viewIndex;

		instance.viewInstances[viewIndex].addElement(type, source, title, parameters);

		//element should be replaced in all views
		if(parameters.replace && parameters.replaceInAllViews) {

			for(var i=0; i < instance.viewInstances.length; ++i) {

				var viewInstance = instance.viewInstances[i];
				//check if not current view and view has at least one element with the replace value
				if(viewIndex !== i && viewInstance.getElementByReplace(parameters.replace) !== null) {
					viewInstance.addElement(type, source, title, parameters, i);
				}

			}

		}

	};

	/**
	 * Creates all views in one data URL. The different views will be positioned below each other.
	 *
	 * @method getProductDataURL
	 * @param {Function} callback A function that will be called when the data URL is created. The function receives the data URL.
	 * @param {String} [backgroundColor=transparent] The background color as hexadecimal value. For 'png' you can also use 'transparent'.
	 * @param {Object} [options={}] See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toDataURL.
	 * @param {Boolean} [options.onlyExportable=false] If true elements with excludeFromExport=true are not exported in the image.
	 * @param {Array} viewRange An array defining the start and the end indexes of the exported views.
	 * @example fpd.getProductDataURL( function(dataURL){} );
	 */
	this.getProductDataURL = function(callback, backgroundColor, options, viewRange) {

		callback = callback === undefined ? function() {} : callback ;
		backgroundColor = backgroundColor === undefined ? 'transparent' : backgroundColor;
		options = options === undefined ? {} : options;
		options.onlyExportable = options.onlyExportable === undefined ? false : options.onlyExportable;
		options.enableRetinaScaling = options.enableRetinaScaling === undefined ? false : options.enableRetinaScaling;
		viewRange = viewRange === undefined ? [] : viewRange;

		if(instance.viewInstances.length === 0) { callback(''); return; }

		instance.resetZoom();

		$body.append('<canvas id="fpd-hidden-canvas"></canvas>');

		var tempDevicePixelRatio = fabric.devicePixelRatio,
			printCanvas = new fabric.Canvas('fpd-hidden-canvas', {
				containerClass: 'fpd-hidden fpd-hidden-canvas',
				enableRetinaScaling: false
			}),
			viewCount = 0,
			multiplier = options.multiplier ? options.multiplier : 1,
			targetViews = viewRange.length == 2 ? instance.viewInstances.slice(viewRange[0], viewRange[1]) : instance.viewInstances;

		function _addCanvasImage(viewInstance) {

			fabric.devicePixelRatio = 1;

			viewInstance.toDataURL(function(dataURL) {

				fabric.Image.fromURL(dataURL, function(img) {

					printCanvas.add(img);

					if(viewCount > 0) {
						img.set('top', printCanvas.getHeight());
						printCanvas.setDimensions({height: (printCanvas.getHeight() + (viewInstance.options.stageHeight * multiplier))});
					}

					viewCount++;
					if(viewCount < targetViews.length) {
						_addCanvasImage(targetViews[viewCount]);
					}
					else {

						delete options['multiplier'];

						setTimeout(function() {

							callback(printCanvas.toDataURL(options));
							fabric.devicePixelRatio = tempDevicePixelRatio;
							printCanvas.dispose();
							$body.children('#fpd-hidden-canvas').remove();

							if(instance.currentViewInstance) {
								instance.currentViewInstance.resetCanvasSize();
							}

						}, 100);

					}

				}, {crossOrigin: "anonymous"});

			}, backgroundColor, options, instance.watermarkImg);

			if(viewInstance.options.stageWidth * multiplier > printCanvas.getWidth()) {
				printCanvas.setDimensions({width: viewInstance.options.stageWidth * multiplier});
			}



		};

		var firstView = targetViews[0];
		printCanvas.setDimensions({width: firstView.options.stageWidth * multiplier, height: firstView.options.stageHeight * multiplier});
		_addCanvasImage(firstView);

	};

	/**
	 * Gets the views as data URL.
	 *
	 * @method getViewsDataURL
	 * @param {Function} callback A function that will be called when the data URL is created. The function receives the data URL.
	 * @param {string} [backgroundColor=transparent] The background color as hexadecimal value. For 'png' you can also use 'transparent'.
	 * @param {string} [options={}] See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toDataURL.
	 * @param {Boolean} [options.onlyExportable=false] If true elements with excludeFromExport=true are not exported in the image.
	 * @return {array} An array with all views as data URLs.
	 */
	this.getViewsDataURL = function(callback, backgroundColor, options) {

		callback = callback === undefined ? function() {} : callback;
		backgroundColor = backgroundColor === undefined ? 'transparent' : backgroundColor;
		options = options === 'undefined' ? {} : options;

		var dataURLs = [];

		instance.resetZoom();
		for(var i=0; i < instance.viewInstances.length; ++i) {

			instance.viewInstances[i].toDataURL(function(dataURL) {

				dataURLs.push(dataURL);

				if(dataURLs.length === instance.viewInstances.length) {
					callback(dataURLs);
				}

			}, backgroundColor, options, instance.watermarkImg);

		}

	};

	/**
	 * Returns the views as SVG.
	 *
	 * @method getViewsSVG
	 * @param {Object} options See http://fabricjs.com/docs/fabric.StaticCanvas.html#toSVG.
	 * @param {Function} reviver See http://fabricjs.com/docs/fabric.StaticCanvas.html#toSVG.
	 * @return {array} An array with all views as SVG.
	 */
	this.getViewsSVG = function(options, reviver, respectPrintingBox) {

		var SVGs = [];

		for(var i=0; i < instance.viewInstances.length; ++i) {
			SVGs.push(instance.viewInstances[i].toSVG(options, reviver, respectPrintingBox, null, this.getUsedFonts()));
		}

		return SVGs;

	};
	

	/**
	 * Opens the current showing product in a Pop-up window and shows the print dialog.
	 *
	 * @method print
	 */
	this.print = function() {

		var _createPopupImage = function(dataURLs) {

			var images = [],
				imageLoop = 0;

			//load all images first
			for(var i=0; i < dataURLs.length; ++i) {

				var image = new Image();
				image.src = dataURLs[i];
				image.onload = function() {

					images.push(this);
					imageLoop++;

					//add images to popup and print popup
					if(imageLoop == dataURLs.length) {

						var popup = window.open('','','width='+images[0].width+',height='+(images[0].height*dataURLs.length)+',location=no,menubar=no,scrollbars=yes,status=no,toolbar=no');
						FPDUtil.popupBlockerAlert(popup, instance);

						popup.document.title = "Print Image";
						for(var j=0; j < images.length; ++j) {
							$(popup.document.body).append('<img src="'+images[j].src+'" />');
						}

						setTimeout(function() {
							popup.print();
						}, 1000);

					}
				}

			}

		};

		instance.getViewsDataURL(_createPopupImage);

	};

	/**
	 * Creates an image of the current showing product.
	 *
	 * @method createImage
	 * @param {boolean} [openInBlankPage= true] Opens the image in a Pop-up window.
	 * @param {boolean} [forceDownload=false] Downloads the image to the user's computer.
	 * @param {string} [backgroundColor=transparent] The background color as hexadecimal value. For 'png' you can also use 'transparent'.
	 * @param {string} [options] See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toDataURL.
	 * @param {Boolean} [options.onlyExportable=false] If true elements with excludeFromExport=true are not exported in the image.
	 * @param {Boolean} [onlyCurrentView] If true only the curent showing view will be exported.
	 */
	this.createImage = function(openInBlankPage, forceDownload, backgroundColor, options, onlyCurrentView) {

		openInBlankPage = openInBlankPage === undefined ? true : openInBlankPage;
		forceDownload = forceDownload === undefined ? false : forceDownload;
		backgroundColor = backgroundColor === undefined ? 'transparent' : backgroundColor;
		options = options === undefined ? {} : options;
		onlyCurrentView = onlyCurrentView === undefined ? false : onlyCurrentView;

		var format = options.format === undefined ? 'png' : options.format;


		var _createPopupImage = function(dataURL) {

			var image = new Image();
			image.src = dataURL;

			image.onload = function() {

				if(openInBlankPage) {

					var popup = window.open('','_blank');
					FPDUtil.popupBlockerAlert(popup, instance);

					popup.document.title = "Product Image";
					$(popup.document.body).append('<img src="'+this.src+'" download="product.'+format+'" />');

					if(forceDownload) {
						window.location.href = popup.document.getElementsByTagName('img')[0].src.replace('image/'+format+'', 'image/octet-stream');
					}
				}

			}

		}

		onlyCurrentView ? instance.currentViewInstance.toDataURL(_createPopupImage, backgroundColor, options) : instance.getProductDataURL(_createPopupImage, backgroundColor, options);

	};

	/**
	 * Sets the zoom of the stage. 1 is equal to no zoom.
	 *
	 * @method setZoom
	 * @param {number} value The zoom value.
	 */
	this.setZoom = function(value) {

		//fix for android browser, because keyboard trigger resize event
		if(inTextField) {
			return;
		}

		zoomReseted = false;
		this.deselectElement();

		if(instance.currentViewInstance) {

			var responsiveScale = instance.currentViewInstance.responsiveScale;

			var point = new fabric.Point(instance.currentViewInstance.stage.getWidth() * 0.5, instance.currentViewInstance.stage.getHeight() * 0.5);

			instance.currentViewInstance.stage.zoomToPoint(point, value * responsiveScale);

			if(value == 1) {
				instance.resetZoom();
			}

		}


	};
	

	/**
	 * Returns the current showing product with all views and elements in the views.
	 *
	 * @method getProduct
	 * @param {boolean} [onlyEditableElements=false] If true, only the editable elements will be returned.
	 * @param {boolean} [customizationRequired=false] To receive the product the user needs to customize the initial elements.
	 * @return {array} An array with all views. A view is an object containing the title, thumbnail, custom options and elements. An element object contains the title, source, parameters and type.
	 */
	this.getProduct = function(onlyEditableElements, customizationRequired) {

		onlyEditableElements = onlyEditableElements === undefined ? false : onlyEditableElements;
		customizationRequired = customizationRequired === undefined ? false : customizationRequired;

		var customizationChecker = false,
			jsMethod = instance.mainOptions.customizationRequiredRule == 'all' ? 'every' : 'some';

		customizationChecker = instance.viewInstances[jsMethod](function(viewInst) {
			return viewInst.isCustomized;
		})

		if(customizationRequired && !customizationChecker) {
			FPDUtil.showMessage(instance.getTranslation('misc', 'customization_required_info'));
			return false;
		}

		this.deselectElement();
		this.resetZoom();

		instance.doUnsavedAlert = false;

		//check if an element is out of his containment
		var viewElements = this.getElements(),
			product = [];
		viewElements.forEach(function(element) {

			if(element.isOut && element.boundingBoxMode === 'inside' && !element.__editorMode) {

				FPDUtil.showMessage(
					element.title+': '+instance.getTranslation('misc', 'out_of_bounding_box')
				);

				product = false;
			}

		});

		//abort process
		if(product === false) {
			return false;
		}

		//add views
		for(var i=0; i < instance.viewInstances.length; ++i) {

			var viewInstance = instance.viewInstances[i],
				relevantViewOpts = viewInstance.getOptions();

			var viewElements = instance.viewInstances[i].stage.getObjects(),
				jsonViewElements = [];

			for(var j=0; j < viewElements.length; ++j) {

				var element = viewElements[j];

				if(element.title !== undefined && element.source !== undefined) {

					var jsonItem = {
						title: element.title,
						source: element.source,
						parameters: instance.viewInstances[i].getElementJSON(element),
						type: FPDUtil.getType(element.type)
					};

					if(relevantViewOpts.printingBox && relevantViewOpts.printingBox.hasOwnProperty('left')  && relevantViewOpts.printingBox.hasOwnProperty('top')) {
						var pointLeftTop = element.getPointByOrigin('left', 'top'),
							bbTL = new fabric.Point(relevantViewOpts.printingBox.left, relevantViewOpts.printingBox.top),
							bbBR = new fabric.Point(relevantViewOpts.printingBox.left + relevantViewOpts.printingBox.width, relevantViewOpts.printingBox.top  + relevantViewOpts.printingBox.height)

						jsonItem.printingBoxCoords = {
							left: pointLeftTop.x - relevantViewOpts.printingBox.left,
							top: pointLeftTop.y - relevantViewOpts.printingBox.top,
							//visible: element.intersectsWithRect(bbTL, bbBR) || element.isContainedWithinRect(bbTL, bbBR)
						};

					}

					if(onlyEditableElements) {
						if(element.isEditable) {
							jsonViewElements.push(jsonItem);
						}
					}
					else {
						jsonViewElements.push(jsonItem);
					}
				}
			}

			var viewObj = {
				title: viewInstance.title,
				thumbnail: viewInstance.thumbnail,
				elements: jsonViewElements,
				options: relevantViewOpts,
				names_numbers: viewInstance.names_numbers,
				mask: viewInstance.mask,
				locked: viewInstance.locked
			};

			if(i == 0 && instance.currentViews[0].hasOwnProperty('productTitle')) {
				viewObj.productTitle = instance.currentViews[0].productTitle;
			}

			product.push(viewObj);

		}

		//returns an array with all views
		return product;

	};

	/**
	 * Sets the dimensions of all views.
	 *
	 * @method setDimensions
	 * @param {Number} width The width in pixel.
	 * @param {Number} height The height in pixel.
	 * @param {Number} [viewIndex=-1] The target views. -1 targets all views.
	 */
	this.setDimensions = function(width, height, viewIndex) {

		viewIndex = viewIndex === undefined ? -1 : viewIndex;

		var targetViews = [];
		if(viewIndex == -1) {

			instance.mainOptions.stageWidth = width;
			instance.mainOptions.stageHeight = height;
			targetViews = instance.viewInstances;

		}
		else {
			targetViews.push(instance.viewInstances[viewIndex]);
		}

		if(viewIndex == instance.currentViewIndex || viewIndex == -1) {
			instance.$container.find('.fpd-product-stage').width(width);
		}

		targetViews.forEach(function(targetView) {

			targetView.options.stageWidth = width;
			targetView.options.stageHeight = height;

			if(viewIndex == instance.currentViewIndex) {
				targetView.resetCanvasSize();
			}

		})

		if((viewIndex == instance.currentViewIndex || viewIndex == -1) && instance.mainBar && instance.mainBar.$content && instance.$container.filter('[class*="fpd-off-canvas-"]').length > 0) {

			instance.mainBar.$content.height(instance.$mainWrapper.height());
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
	 * Get all fonts used in the product.
	 *
	 * @method getUsedFonts
	 * @return {array} An array with objects containing the font name and optional the URL to the font.
	 */
	this.getUsedFonts = function() {

		var _usedFonts = [], //temp to check if already included
			usedFonts = [];

		this.getElements(-1, 'all', false).forEach(function(element) {

			if(FPDUtil.getType(element.type) === 'text') {

				if(_usedFonts.indexOf(element.fontFamily) === -1) {

					var fontObj = {name: element.fontFamily},
						//grep font entry
						result = $.grep(instance.mainOptions.fonts, function(e){
							return e.name == element.fontFamily;
						});

					//check if result contains props and url prop
					if(result.length > 0) {

						if(result[0].url) {
							fontObj.url = result[0].url;
						}

						if(result[0].variants) {

							Object.keys(result[0].variants).forEach(function(key) {

								var fontName = element.fontFamily;
								//bold
								if(key == 'n7') {
									fontName += ' Bold';
								}
								//italic
								else if(key == 'i4') {
									fontName += ' Italic';
								}
								//bold-italic
								else if(key == 'i7') {
									fontName += ' Bold Italic';
								}

								_usedFonts.push(fontName);
								usedFonts.push({name: fontName, url: result[0].variants[key]});

							});


						}

					}

					_usedFonts.push(element.fontFamily);
					usedFonts.push(fontObj);


				}

			}

		});

		return usedFonts;

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
	 * Formats the price to a string with the currency and the decimal as well as the thousand separator.
	 *
	 * @method formatPrice
	 * @param {Number} [price] The price thats gonna be formatted.
	 * @return {String} The formatted price string.
	 */
	this.formatPrice = function(price) {

		if(typeof instance.mainOptions.priceFormat === 'object') {

			var thousandSep = instance.mainOptions.priceFormat.thousandSep,
				decimalSep = instance.mainOptions.priceFormat.decimalSep;

			var splitPrice = price.toString().split('.'),
				absPrice = splitPrice[0],
				decimalPrice = splitPrice[1],
				tempAbsPrice = '';

			if (typeof absPrice != 'undefined') {

				for (var i=absPrice.length-1; i>=0; i--) {
					tempAbsPrice += absPrice.charAt(i);
				}

				tempAbsPrice = tempAbsPrice.replace(/(\d{3})/g, "$1" + thousandSep);
				if (tempAbsPrice.slice(-thousandSep.length) == thousandSep) {
					tempAbsPrice = tempAbsPrice.slice(0, -thousandSep.length);
				}

				absPrice = '';
				for (var i=tempAbsPrice.length-1; i>=0 ;i--) {
					absPrice += tempAbsPrice.charAt(i);
				}

				if (typeof decimalPrice != 'undefined' && decimalPrice.length > 0) {
					//if only one decimal digit add zero at end
					if(decimalPrice.length == 1) {
						decimalPrice += '0';
					}
					absPrice += decimalSep + decimalPrice;
				}

			}

			absPrice = instance.mainOptions.priceFormat.currency.replace('%d', absPrice.toString());

			return absPrice;

		}
		else {
			price = instance.mainOptions.priceFormat.replace('%d', price);
		}

		return price;

	};

	this.selectGuidedTourStep = function(target) {

		$body.children('.fpd-gt-step').remove();

		var keyIndex = Object.keys(instance.mainOptions.guidedTour).indexOf(target),
			splitTarget = target.split(':'),
			$targetElem = null;

		if(splitTarget[0] === 'module') {
			$targetElem = $mainBar.find('.fpd-navigation').children('[data-module="'+splitTarget[1]+'"]');
		}
		else if(splitTarget[0] === 'action') {
			$targetElem = $('.fpd-action-btn[data-action="'+splitTarget[1]+'"]');
		}
		else if(splitTarget.length === 1) { //css selector
			$targetElem = $(splitTarget[0]);
		}

		if($targetElem) {

			//if module or action is not available, go to next
			if($targetElem.length === 0) {

				if(Object.keys(instance.mainOptions.guidedTour)[keyIndex+1]) {
					instance.selectGuidedTourStep(Object.keys(instance.mainOptions.guidedTour)[keyIndex+1]);
				}

				return;
			}

			var $step = $body.append('<div class="fpd-container fpd-gt-step"><div class="fpd-gt-pointer"><span class="fpd-icon-arrow-dropdown"></span></div><div class="fpd-gt-close"><span class="fpd-icon-close"></span></div><div class="fpd-gt-text">'+instance.mainOptions.guidedTour[target]+'</div><div class="fpd-gt-actions fpd-clearfix"><div class="fpd-gt-next fpd-btn fpd-primary">'+instance.getTranslation('misc', 'guided_tour_next')+'</div><div class="fpd-gt-back fpd-btn fpd-primary">'+instance.getTranslation('misc', 'guided_tour_back')+'</div><span class="fpd-gt-counter">'+String(keyIndex +1)+'/'+Object.keys(instance.mainOptions.guidedTour).length+'</span></div></div>').children('.fpd-gt-step'),
				targetPos = $targetElem.offset(),
				offsetX = $targetElem.outerWidth() * 0.5,
				offsetY = 0,
				stepLeft = targetPos.left + offsetX;

			if(stepLeft < 24) {
				stepLeft = 24;
			}

			//position step
			$step.css({
				left: stepLeft,
				top: targetPos.top + $targetElem.outerHeight() + offsetY,
			});

			//if step is outside viewport, reposition step and pointer
			if($step.outerWidth() + stepLeft > window.innerWidth) {
				offsetX = (window.innerWidth - ($step.outerWidth() + stepLeft));
				$step.css('left', stepLeft + offsetX)
				.children('.fpd-gt-pointer').css('margin-left', Math.abs(offsetX));
			}

			//set back btn
			if(Object.keys(instance.mainOptions.guidedTour)[keyIndex-1]) {
				$step.find('.fpd-gt-back').data('target', Object.keys(instance.mainOptions.guidedTour)[keyIndex-1]);
			}
			else {
				$step.find('.fpd-gt-back').hide();
			}

			//set next btn
			if(Object.keys(instance.mainOptions.guidedTour)[keyIndex+1]) {
				$step.find('.fpd-gt-next').data('target', Object.keys(instance.mainOptions.guidedTour)[keyIndex+1]);
			}
			else {
				$step.find('.fpd-gt-next').hide();
			}

		}

	};

	/**
	 * Toggle the responsive behavior.
	 *
	 * @method toggleResponsive
	 * @param {Boolean} [toggle] True or false.
	 * @return {Boolean} Returns true or false.
	 */
	this.toggleResponsive = function(toggle) {

		toggle = toggle === undefined ? $elem.hasClass('fpd-not-responsive') : toggle;

		$elem.toggleClass('fpd-not-responsive', !toggle);
		this.viewInstances.forEach(function(viewInstance, viewIndex) {

			viewInstance.options.responsive = toggle;

			if(viewIndex == instance.currentViewIndex) {
				viewInstance.resetCanvasSize();
			}

		});

		return toggle;

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

	_initialize();

};
/**
 * This is the main entry point to access FPD via the API. FancyProductDesigner class contains the instances of {{#crossLink "FancyProductDesignerView"}}FancyProductDesignerView{{/crossLink}} class.
 *
 *<h5>Example</h5>
 * Best practice to use the API is to wait for the ready event, then the UI and all products/designs has been set (not loaded).<pre>var fpd = new FancyProductDesigner($fpd, options);
 $fpd.on('ready', function() { //use api methods in here })</pre>
 * @class FancyProductDesigner
 * @constructor
 * @param {HTMLElement | jQuery | string} elem - A HTML element with an unique ID.
 * @param {Object} [opts] - See {{#crossLink "Options.defaults"}}{{/crossLink}}.
 */



// export default function
import FPDPricingRules from './addons/FPDPricingRules.js'
import FPDBulkVariations from './addons/plus/BulkVariations.js'
import {FPDNamesNumbersModule} from './addons/plus/NamesNumbersModule.js'
import FancyProductDesignerOptions from './Options.js'
import FPDActions from './ui/Actions.js'
import FPDMainBar from './ui/MainBar.js'
import FPDToolbarSide from './ui/ToolbarSide.js'
import FPDToolbarSmart from './ui/ToolbarSmart.js'
import FancyProductDesignerView from './FancyProductDesignerView.js'
import {FPDUtil, FPDPathGroupName} from './Util.js'
import './FabricPrototypes.js'

export default function FancyProductDesigner(elem, opts) {

	if(typeof elem === 'string'){
		elem = $(document.getElementById(elem))
	}

	'use strict';

	$ = jQuery;

	var instance = this,
		$window = $(window),
		$body = $('body'),
		$products,
		$designs,
		$elem,
		$mainBar,
		$stageLoader,
		$uiElements,
		$modules,
		$editorBox = null,
		$thumbnailPreview = null,
		stageCleared = false,
		zoomReseted = false,
		firstProductCreated = false,
		inTextField = false,
		initCSSClasses = '',
		$draggedImage,
		_totalProductElements = 0,
		_productElementLoadingIndex = 0,
		_outOfBoundingBoxLabel = '';

	/**
	 * Array containing all added products categorized.
	 *
	 * @property products
	 * @type Array
	 */
	this.products = [];

	/**
	 * Array containing all added designs.
	 *
	 * @property designs
	 * @type Array
	 */
	this.designs = [];

	/**
	 * The current selected product category index.
	 *
	 * @property currentCategoryIndex
	 * @type Number
	 * @default 0
	 */
	this.currentCategoryIndex = 0;

	/**
	 * The current selected product index.
	 *
	 * @property currentProductIndex
	 * @type Number
	 * @default 0
	 */
	this.currentProductIndex = 0;

	/**
	 * The current selected view index.
	 *
	 * @property currentViewIndex
	 * @type Number
	 * @default 0
	 */
	this.currentViewIndex = 0;

	/**
	 * The price considering the elements price in all views with order quantity.
	 *
	 * @property currentPrice
	 * @type Number
	 * @default 0
	 */
	this.currentPrice = 0;

	/**
	 * The price considering the elements price in all views without order quantity.
	 *
	 * @property singleProductPrice
	 * @type Number
	 * @default 0
	 */
	this.singleProductPrice = 0;

	/**
	 * The current views.
	 *
	 * @property currentViews
	 * @type Array
	 * @default null
	 */
	this.currentViews = null;

	/**
	 * The current view instance.
	 *
	 * @property currentViewInstance
	 * @type FancyProductDesignerView
	 * @default null
	 */
	this.currentViewInstance = null;

	/**
	 * The current selected element.
	 *
	 * @property currentElement
	 * @type fabric.Object
	 * @default null
	 */
	this.currentElement = null;

	/**
	 * JSON Object containing all translations.
	 *
	 * @property langJson
	 * @type Object
	 * @default null
	 */
	this.langJson = null;

	/**
	 * The main options set for this Product Designer.
	 *
	 * @property mainOptions
	 * @type Object
	 */
	this.mainOptions;

	/**
	 * jQuery object pointing on the product stage.
	 *
	 * @property $productStage
	 * @type jQuery
	 */
	this.$productStage = null;

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
	 * Indicates if the product is created or not.
	 *
	 * @property productCreated
	 * @type Boolean
	 * @default false
	 */
	this.productCreated = false;

	/**
	 * Indicates if the product was saved.
	 *
	 * @property doUnsavedAlert
	 * @type Boolean
	 * @default false
	 */
	this.doUnsavedAlert = false;

	/**
	 * Array containing all FancyProductDesignerView instances of the current showing product.
	 *
	 * @property viewInstances
	 * @type Array
	 * @default []
	 */
	this.viewInstances = [];

	/**
	 * Object containing all color link groups.
	 *
	 * @property colorLinkGroups
	 * @type Object
	 * @default {}
	 */
	this.colorLinkGroups = {};

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
	 * The calculated price for the pricing rules.
	 *
	 * @property pricingRulesPrice
	 * @type Number
	 * @default 0
	 */
	this.pricingRulesPrice = 0;

	/**
	 * The container for internal modals.
	 *
	 * @property $modalContainer
	 * @type jQuery
	 * @default 0
	 */
	this.$modalContainer = $('body');

	/**
	 * Array will all added custom elements.
	 *
	 * @property globalCustomElements
	 * @type Array
	 * @default []
	 */
	this.globalCustomElements = [];

	/**
	 * Array will all fixed elements.
	 *
	 * @property fixedElements
	 * @type Array
	 * @default []
	 */
	this.fixedElements = [];

	/**
	 * Returns if mouse is over a fabricJS canvas and in which case the fabricJS object.
	 *
	 * @property mouseOverCanvas
	 * @type Boolean
	 * @default false
	 */
	this.mouseOverCanvas = false;

	this.languageJSON = {
		"toolbar": {},
		"actions": {},
		"modules": {},
		"misc": {},
		"image_editor": {},
		"plus": {}
	};
	this._order = {};
	this._loadingCustomImage = false;
	this._prevPrintingBoxes = [];

	var fpdOptionsInstance = new FancyProductDesignerOptions();
	this.mainOptions = fpdOptionsInstance.merge(fpdOptionsInstance.defaults, opts);


	var _initialize = function() {

		// @@include('../envato/evilDomain.js')

		//create custom jquery expression to ignore case when filtering
		$.expr[":"].containsCaseInsensitive = $.expr.createPseudo(function(arg) {
		    return function( elem ) {
		        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
		    };
		});

		//check if element is a jquery object
		if(elem instanceof jQuery) {
			$elem = elem;
		}
		else {
			$elem = $(elem);
		}

		instance.$modalContainer = instance.mainOptions.openModalInDesigner ? $elem : $('body');

		$elem.removeClass('fpd-module-visible fpd-ui-theme-doyle');

		initCSSClasses = $elem.attr('class') ? $elem.attr('class') : '';

		instance.mainOptions.mainBarContainer = instance.mainOptions.modalMode !== false ? false : instance.mainOptions.mainBarContainer;

		//force sidebar when main bar container is set
		if(instance.mainOptions.mainBarContainer) {
			$elem.removeClass('fpd-sidebar').addClass('fpd-topbar');
		}

		if(!instance.mainOptions.fabricCanvasOptions.allowTouchScrolling) {
			$elem.addClass('fpd-disable-touch-scrolling');
		}

		//doyle setup
		$elem.addClass('fpd-device-'+FPDUtil.getDeviceByScreenSize());
		$elem.addClass('fpd-ui-theme-'+instance.mainOptions.uiTheme);
		if(instance.mainOptions.uiTheme == 'doyle') {
			$elem.removeClass('fpd-topbar fpd-tabs-top').addClass('fpd-sidebar fpd-tabs-side')
		}

		instance.$container = $elem.data('instance', instance);

		//save products and designs HTML
		$products = $elem.children('.fpd-category').length > 0 ? $elem.children('.fpd-category').remove() : $elem.children('.fpd-product').remove();
		$designs = $elem.find('.fpd-design > .fpd-category').length > 0 ? $elem.find('.fpd-design > .fpd-category') : $elem.find('.fpd-design > img');
		$elem.children('.fpd-design').remove();

		//add product designer into modal
		if(instance.mainOptions.modalMode) {

			$elem.removeClass('fpd-hidden');
			$body.addClass('fpd-modal-mode-active');

			var $modalProductDesigner = $elem.wrap('<div class="fpd-modal-product-designer fpd-modal-overlay fpd-fullscreen"><div class="fpd-modal-wrapper"></div></div>').parents('.fpd-modal-overlay:first'),
				modalProductDesignerOnceOpened = false;

			$modalProductDesigner.children()
			.append('<div class="fpd-done fpd-btn" data-defaulttext="Done">misc.modal_done</div><div class="fpd-modal-close"><span class="fpd-icon-close"></span></div>');

			$modalProductDesigner.addClass('fpd-ui-theme-'+instance.mainOptions.uiTheme)

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

		//test if browser is supported (safari, chrome, opera, firefox IE>9)
		var canvasTest = document.createElement('canvas'),
			canvasIsSupported = Boolean(canvasTest.getContext && canvasTest.getContext('2d')),
			minIE = instance.mainOptions.templatesDirectory ? 9 : 8;

		if(!canvasIsSupported || (FPDUtil.isIE() && Number(FPDUtil.isIE()) <= minIE)) {

			_loadTemplate('canvaserror', instance.mainOptions.templatesType, 0, function(html) {

				$elem.append($.parseHTML(html)).fadeIn(300);
				$elem.trigger('templateLoad', [this.url]);

			});

			/**
		     * Gets fired when the browser does not support HTML5 canvas.
		     *
		     * @event FancyProductDesigner#canvasFail
		     * @param {Event} event
		     */
			$elem.trigger('canvasFail');

			return false;
		}

		//lowercase all keys in hexNames
		var key,
			keys = Object.keys(instance.mainOptions.hexNames),
			n = keys.length,
			newHexNames = {};

		Object.keys(instance.mainOptions.hexNames).forEach(function(hexKey) {
			newHexNames[hexKey.toLowerCase()] = instance.mainOptions.hexNames[hexKey];
		});
		instance.mainOptions.hexNames = newHexNames;

		//sort fonts
		if(instance.mainOptions.fonts && instance.mainOptions.fonts.length > 0) {

			//fonts array has objects
			if(typeof instance.mainOptions.fonts[0] === 'object') {
				instance.mainOptions.fonts.sort(function(a, b) {
					var nameA = a.name.toUpperCase(), // ignore upper and lowercase
						nameB = b.name.toUpperCase(); // ignore upper and lowercase
					if (nameA < nameB) {
						return -1;
					}
					if (nameA > nameB) {
						return 1;
					}

					//same
					return 0;
				});
			}
			else {
				instance.mainOptions.fonts.sort();
			}

		}

		//PLUS
		if(typeof FancyProductDesignerPlus !== 'undefined') {
			FancyProductDesignerPlus.setup($elem, instance);
		}

		//PRICING RULES
		if(typeof FPDPricingRules !== 'undefined') {
			instance.pricingRulesInstance = new FPDPricingRules($elem, instance);
		}

		//load language JSON
		if(instance.mainOptions.langJSON !== false) {

			if(typeof instance.mainOptions.langJSON === 'object') {

				instance.langJson = instance.mainOptions.langJSON;

				$elem.trigger('langJSONLoad', [instance.langJson]);

				_initProductStage();

			}
			else {

				$.getJSON(instance.mainOptions.langJSON).done(function(data) {

					instance.langJson = data;

					/**
				     * Gets fired when the language JSON is loaded.
				     *
				     * @event FancyProductDesigner#langJSONLoad
				     * @param {Event} event
				     * @param {Object} langJSON - A JSON containing the translation.
				     */
					$elem.trigger('langJSONLoad', [instance.langJson]);

					_initProductStage();

				})
				.fail(function(data) {

					FPDUtil.showModal('Language JSON "'+instance.mainOptions.langJSON+'" could not be loaded or is not valid. Make sure you set the correct URL in the options and the JSON is valid!');

					$elem.trigger('langJSONLoad', [instance.langJson]);
				});

			}


		}
		else {
			_initProductStage();
		}

	}; //init end

	//init the product stage
	var _initProductStage = function() {

		var loaderHTML = '<div class="fpd-loader-wrapper"><div class="fpd-loader"><div class="fpd-loader-circle"></div><span class="fpd-loader-text" data-defaulttext="Initializing Product Designer">misc.initializing</span></div></div>',
			tooltipHtml = '<div class="fpd-element-tooltip" style="display: none;" data-defaulttext="Move element in its containment!">misc.out_of_bounding_box</div>';

		//add init loader
		instance.$mainWrapper = $elem.addClass('fpd-container fpd-clearfix fpd-grid-columns-'+instance.mainOptions.gridColumns).html(loaderHTML+'<div class="fpd-main-wrapper">'+tooltipHtml+'<div class="fpd-snap-line-h"></div><div class="fpd-snap-line-v"></div><div class="fpd-product-stage" style="width:'+instance.mainOptions.stageWidth+'px;height: '+instance.mainOptions.stageHeight+'px;"></div></div>').children('.fpd-main-wrapper');

		instance.$actionsWrapper = $('<div class="fpd-actions-container"></div>');
		if(instance.mainOptions.uiTheme == 'doyle') {
			instance.$actionsWrapper.addClass('fpd-primary-bg-color').prependTo(instance.$container);
		}
		else { //flat
			instance.$actionsWrapper.appendTo(instance.$mainWrapper);
		}


		if(!instance.mainOptions.editorMode) {
			$elem.after('<div class="fpd-device-info">'+instance.getTranslation('misc', 'not_supported_device_info')+'</div>');
		}

		instance.$mainWrapper.prepend('<div class="fpd-modal-lock"><div class="fpd-toggle-lock"><span class="fpd-icon-unlocked"></span><span class="fpd-icon-locked"></span><div>'+instance.getTranslation('misc', 'view_optional_unlock')+'</div></div></div>');

		instance.$productStage  = instance.$mainWrapper.children('.fpd-product-stage')
		instance.$elementTooltip = instance.$mainWrapper.children('.fpd-element-tooltip');
		$stageLoader = $elem.children('.fpd-loader-wrapper');

		instance.translateElement($stageLoader.find('.fpd-loader-text'));
		_outOfBoundingBoxLabel = instance.translateElement(instance.$elementTooltip);
		if(instance.mainOptions.modalMode) {
			instance.translateElement($body.find('.fpd-modal-overlay .fpd-done'));
		}

		//load editor box if requested
		if(typeof instance.mainOptions.editorMode === 'string') {

			$editorBox = $('<div class="fpd-editor-box"><h5></h5><div class="fpd-clearfix"></div></div>');
			$(instance.mainOptions.editorMode).append($editorBox);

		}

		$body.on('focus blur', '[class^="fpd-element-toolbar"] textarea, [class^="fpd-element-toolbar"] input[type="number"], [class^="fpd-element-toolbar"] input[type="text"]', function(evt) {
			inTextField = evt.type == 'focusin';

		});

		instance.$container.on('screenSizeChange', function(evt, device){

			if(instance.mainOptions.uiTheme !== 'doyle') {

				if(device === 'smartphone') {
					instance.$actionsWrapper.insertBefore(instance.$mainWrapper);
				}
				else {
					instance.$actionsWrapper.appendTo(instance.$mainWrapper);
				}

			}


		});

		//window resize handler
		var device = '',
            currentWindowWidth = 0;

		$window.resize(function() {
                        
			//fix for android browser, because keyboard trigger resize event
			if(window.innerWidth === currentWindowWidth || inTextField) {
				return;
			}
            
            currentWindowWidth = window.innerWidth;

			if(instance.currentViewInstance) {
				instance.currentViewInstance.resetCanvasSize();
			}

			if(instance.mainBar && instance.mainBar.$content
				&& instance.$container.filter('[class*="fpd-off-canvas-"]').length > 0) {
				instance.mainBar.$content.height(instance.$mainWrapper.height());
			}

			if(instance.actions) {

				instance.actions.hideAllTooltips();
				if(!zoomReseted) {
					instance.resetZoom();
				}

			}
            
			//deselect element if one is selected and active element is not input (FB browser fix)
			//alert(document.activeElement);
			if(instance.currentElement && $(document.activeElement).is(':not(input)') && $(document.activeElement).is(':not(textarea)')) {
				instance.deselectElement();
			}

			if((instance.currentElement && instance.currentElement.isEditing) || instance.mainOptions.editorMode) {
				return;
			}

			var currentDevice = FPDUtil.getDeviceByScreenSize();
			if(currentDevice == 'smartphone') {

				if(!instance.$container.hasClass('fpd-topbar') && instance.mainBar) {

					if(instance.mainOptions.uiTheme !== 'doyle') {

						instance.$container.removeClass('fpd-sidebar').addClass('fpd-topbar');
						instance.mainBar.setContentWrapper('draggable-dialog');

					}

				}

			}
			else if(currentDevice == 'tablet') {
			}
			else if(currentDevice == 'desktop') {

				if(instance.mainOptions.uiTheme !== 'doyle' && initCSSClasses.search('fpd-topbar') === -1 && instance.$container.hasClass('fpd-topbar')) {

					instance.$container.removeClass('fpd-topbar').addClass('fpd-sidebar');

					if(instance.mainBar && !instance.mainOptions.mainBarContainer) {
						instance.mainBar.setContentWrapper('sidebar');
					}
				}

			}

			if(device !== currentDevice) {

				/**
			     * Gets fired as soon as the screen size has changed. Breakpoints: Smartphone Width < 568, Tablet Width > 568 and < 768, Desktop Width > 768.
			     *
			     * @event FancyProductDesigner#canvasFail
			     * @param {Event} event
			     * @param {String} device Possible values: desktop, tablet, smartphone.
			     */
				$elem.trigger('screenSizeChange', [currentDevice]);
			}

			if(instance.currentViewInstance) {
				instance.currentViewInstance.resetCanvasSize();
			}

			device = currentDevice;

		});

		instance.loadFonts(instance.mainOptions.fonts, function() {
			instance.mainOptions.templatesDirectory ?
				_loadTemplate('productdesigner', instance.mainOptions.templatesType, 0, _loadProductDesignerTemplate)
			:
				_ready();
		});

	};

	//now load UI elements from external HTML file
	var _loadProductDesignerTemplate = function(html) {

		/**
	     * Gets fired as soon as a template has been loaded.
	     *
	     * @event FancyProductDesigner#templateLoad
	     * @param {Event} event
	     * @param {string} URL - The URL of the loaded template.
	     */
		$elem.trigger('templateLoad', [this.url]);

		$uiElements = $(html);

		$uiElements.find('[data-defaulttext]').each(function(index, uiElement) {

			instance.translateElement($(uiElement));

		});

		instance.translatedUI = $uiElements;

		if(instance.mainOptions.mainBarContainer) {

			$elem.addClass('fpd-main-bar-container-enabled');
			$mainBar = $(instance.mainOptions.mainBarContainer).addClass('fpd-container fpd-main-bar-container fpd-tabs fpd-tabs-top fpd-sidebar fpd-grid-columns-'+instance.mainOptions.gridColumns).html($uiElements.children('.fpd-mainbar')).children('.fpd-mainbar');

		}
		else {
			$mainBar = $uiElements.children('.fpd-mainbar').insertBefore($elem.children('.fpd-loader-wrapper'));
		}

		$modules = $uiElements.children('.fpd-modules');

		if($elem.hasClass('fpd-sidebar')) {
			$elem.height(instance.mainOptions.stageHeight);
		}
		else {
			$elem.width(instance.mainOptions.stageWidth);
		}

		//show tabs content
		$body.on('click', '.fpd-module-tabs > div', function() {

			var $this = $(this),
				context = $(this).data('context');

			$this.addClass('fpd-active').siblings().removeClass('fpd-active');
			$this.parent().next('.fpd-module-tabs-content').children().hide().filter('[data-context="'+context+'"]').show();

		});

		//setup modules
		if(instance.mainOptions.mainBarModules) {

			instance.mainBar = new FPDMainBar(
				instance,
				$mainBar,
				$modules,
				$uiElements.children('.fpd-draggable-dialog')
			);

		}

		//init Actions
		if(instance.mainOptions.actions) {
			instance.actions = new FPDActions(instance, $uiElements.children('.fpd-actions'));
		}

		/**
	     * Gets fired as soon as the user interface with all modules, actions is set and translated.
	     *
	     * @event FancyProductDesigner#uiSet
	     * @param {Event} event
	     */
		$elem.trigger('uiSet');

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

			evt.stopPropagation();
			evt.preventDefault();
            
			if(element && !element._ignore && instance.currentViewInstance) {

				//upload zone is selected
				if(element.uploadZone && !instance.mainOptions.editorMode) {

					element.set('borderColor', 'transparent');

					var customAdds = $.extend(
						{},
						instance.currentViewInstance.options.customAdds,
						element.customAdds ? element.customAdds : {}
					);

					//mobile fix: elementSelect is triggered before click, this was adding an image on mobile
					setTimeout(function() {
						instance.currentViewInstance.currentUploadZone = element.title;
						instance.mainBar.toggleUploadZoneAdds(customAdds);
						instance.mainBar.toggleUploadZonePanel();
					}, 100);

					return;
				}
				//if element has no upload zone and an upload zone is selected, close dialogs and call first module
				else if(instance.currentViewInstance.currentUploadZone) {
                    
					instance.mainBar.toggleDialog(false);
					instance.mainBar.toggleUploadZonePanel(false);

				}
                
				instance.toolbar.update(element);

				if(instance.mainOptions.openTextInputOnSelect && FPDUtil.getType(element.type) === 'text' && element.editable) {
					$elementToolbar.find('.fpd-tool-edit-text:first').click();
				}

				_updateEditorBox(element);

			}
			else {
                
				instance.toolbar.toggle(false);
				$body.children('[class^="fpd-element-toolbar"]').find('input').spectrum('destroy');

			}

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
		.on('screenSizeChange', function(evt, device) {

			$elem.removeClass('fpd-device-smartphone fpd-device-tablet fpd-device-desktop')
			.addClass('fpd-device-'+device);

		})
/*
		.on('touchend', '.fpd-view-stage', function(evt) {

			evt.preventDefault();

			if(zoomDiff !== undefined) {
				zoomStart = zoomEnd;
			}

		})
		.on('touchmove', '.fpd-view-stage', function(evt) {

			evt.preventDefault();

			if(evt.originalEvent.touches.length == 2) {

				var hypo1 = Math.hypot((event.targetTouches[0].pageX - event.targetTouches[1].pageX),
	                (event.targetTouches[0].pageY - event.targetTouches[1].pageY));

	            if (zoomDiff === undefined) {
	                zoomDiff = hypo1;
	            }

	            zoomEnd = hypo1/zoomDiff;

	            instance.setZoom(zoomStart + zoomEnd);

			}

		})
*/

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

		$('.fpd-dropdown').click(function() {

			$(this).toggleClass('fpd-active');

		});

		$body.on('click', '.fpd-views-wrapper .fpd-view-prev, .fpd-views-wrapper .fpd-view-next', function() {

			if($(this).hasClass('fpd-view-prev')) {
				instance.selectView(instance.currentViewIndex - 1);
			}
			else {
				instance.selectView(instance.currentViewIndex + 1);
			}

		})

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

		//store a boolean to detect if the text in textarea (toolbar) was selected, then dont deselect
		var _fixSelectionTextarea = false;

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

			//deselect element if click outside of a fpd-container
			if($target.closest('.fpd-container, [class^="fpd-element-toolbar"], .sp-container').length === 0
				&& instance.mainOptions.deselectActiveOnOutside && !_fixSelectionTextarea) {

				   instance.deselectElement();

			}
            
			//close upload zone panel if click outside of fpd-container, needed otherwise elements can be added to upload zone e.g. mspc
			if($target.closest('.fpd-container, .fpd-modal-internal').length === 0
				&& instance.currentViewInstance && instance.currentViewInstance.currentUploadZone
				&& $stageLoader.is(':hidden')) {
				instance.mainBar.toggleUploadZonePanel(false);

			}

			_fixSelectionTextarea = false;

		})
		//thumbnail preview effect
		.on('mouseover mouseout mousemove click', '[data-module="designs"] .fpd-item, [data-module="images"] .fpd-item, [data-module="products"] .fpd-item', function(evt) {

			var $this = $(this),
				price = null;

			if(instance.currentViewInstance && instance.currentViewInstance.currentUploadZone
				&& $(evt.target).parents('.fpd-upload-zone-adds-panel').length > 0) {

				var uploadZone = instance.currentViewInstance.getUploadZone(instance.currentViewInstance.currentUploadZone);
				if(uploadZone && uploadZone.price) {
					price = uploadZone.price;
				}

			}

			if($draggedImage) { return;}

			if(evt.type === 'mouseover' && $this.data('source')) {

				//do not show when scrolling
				if($this.parents('.mCustomScrollBox:first').next('.mCSB_scrollTools_onDrag').length) {
					return;
				}

				$thumbnailPreview = $('<div class="fpd-thumbnail-preview"><picture></picture></div>');
				FPDUtil.loadGridImage($thumbnailPreview.children('picture'), $this.children('picture').data('img'));

				//thumbnails in images module
				if($this.parents('[data-module="images"]:first').length > 0 && price === null) {

					if(!isNaN($this.data('price'))) {
						price = $this.data('price');
					}
					else if(instance.currentViewInstance && instance.currentViewInstance.options.customImageParameters.price) {
						price = instance.currentViewInstance.options.customImageParameters.price;
					}

				}
				//thumbnails in designs/products module
				else {

					if($this.data('title')) {
						$thumbnailPreview.addClass('fpd-title-enabled');
						$thumbnailPreview.append('<div class="fpd-preview-title">'+$this.data('title')+'</div>');
					}

					if($this.data('parameters') && $this.data('parameters').price && price === null) {
						price = $this.data('parameters').price;
					}

				}

				if(price) {
					$thumbnailPreview.append('<div class="fpd-preview-price">'+instance.formatPrice(price)+'</div>');
				}

				if($this.children('.fpd-image-quality-ratings').length) {

					var $cloneRatings = $this.children('.fpd-image-quality-ratings').clone();

					$thumbnailPreview.append($cloneRatings);

					if($this.children('.fpd-image-quality-ratings').data('quality-label')) {
						$cloneRatings
						.append('<span class="fpd-image-quality-rating-label">'+$this.children('.fpd-image-quality-ratings').data('quality-label')+'</span>');
					}


				}


				$body.append($thumbnailPreview);

			}

			if($thumbnailPreview !== null) {

				if(evt.type === 'mousemove' || evt.type === 'mouseover') {

					var leftPos = evt.pageX + 10 + $thumbnailPreview.outerWidth() > $window.width() ? $window.width() - $thumbnailPreview.outerWidth() : evt.pageX + 10;
					$thumbnailPreview.css({left: leftPos, top: evt.pageY + 10});

				}
				else if(evt.type === 'mouseout' || evt.type == 'click') {

					$thumbnailPreview.siblings('.fpd-thumbnail-preview').remove();
					$thumbnailPreview.remove();

				}

			}

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

			if(['productCreate', 'layoutElementsAdded'].indexOf(evt.type) != -1 && (instance.globalCustomElements.length > 0 || instance.fixedElements.length > 0)) {

                var globalElements = instance.globalCustomElements.concat(instance.fixedElements),
                	customElementsCount = 0;

                function _addCustomElement(object) {

                    var viewInstance = instance.viewInstances[object.viewIndex];

                    if(viewInstance) { //add element to correct view

	                    var fpdElement = object.element;

						//replace printing box if global element has a printing box from previous product
	                    if(instance._prevPrintingBoxes[object.viewIndex]) {

		                    var prevPrintingBox = instance._prevPrintingBoxes[object.viewIndex];
		                    if(	typeof fpdElement.boundingBox === 'object'
		                    	&& FPDUtil.objectHasKeys(viewInstance.options.printingBox, ['left','top','width','height']))
		                    {
			                    if(JSON.stringify(prevPrintingBox) === JSON.stringify(fpdElement.boundingBox)) {
				                    fpdElement.boundingBox = viewInstance.options.printingBox;
			                    }

			                }

	                    }

                        viewInstance.addElement(
                            FPDUtil.getType(fpdElement.type),
                            fpdElement.source,
                            fpdElement.title,
                            viewInstance.getElementJSON(fpdElement)
                        );

                    }
                    else {
                        _customElementAdded();
                    }

                };

                function _customElementAdded() {

                    customElementsCount++;
                    if(customElementsCount < globalElements.length) {
                        _addCustomElement(globalElements[customElementsCount]);
                    }
                    else {
                        $elem.off('elementAdd', _customElementAdded);
                    }

                };

                $elem.on('elementAdd', _customElementAdded);
                _addCustomElement(globalElements[0]);

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
		else {
			_createProductJSONFromHTML($products);
		}

		if(instance.mainOptions.designsJSON) {

			if(typeof instance.mainOptions.designsJSON === 'object') {
				instance.setupDesigns(instance.mainOptions.designsJSON);
			}
			else {

				$.getJSON(instance.mainOptions.designsJSON)
				.done(function(data) {
					/*data = data[0];
					data = data.designs;*/
					instance.setupDesigns(data);
				})
				.fail(function() {
					FPDUtil.showModal('Designs JSON could not be loaded. Please check that your URL is correct!<br>URL: <i>'+instance.mainOptions.designsJSON+'</i>');
				});

			}

		}
		else {
			_createDesignJSONFromHTML($designs);
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
		}

		/**
	     * Gets fired as soon as the product designer is ready to receive API calls.
	     *
	     * @event FancyProductDesigner#ready
	     * @param {Event} event
	     */
		$elem.trigger('ready');

		$window.resize();

	};

	var _createProductJSONFromHTML = function($products) {

		if($products.length) {
			FPDUtil.log('FPD: Creating products from HTML is deprecated, use a JSON file to store your products. Please check out the documentation!', 'warn');
		}

		var producJSON = [];

		//creates all products from HTML markup
		var _createProductsFromHTML = function($products, category) {

			for(var i=0; i < $products.length; ++i) {

				//get other views
				var views = $($products.get(i)).children('.fpd-product');
				//get first view
				views.splice(0,0,$products.get(i));

				var viewsArr = [];
				views.each(function(j, view) {

					var $view = $(view);
					var viewObj = {
						title: view.title,
						thumbnail: $view.data('thumbnail'),
						elements: [],
						options: $view.data('options')
					};

					viewObj.mask = $view.data('mask') ? $view.data('mask') : null;

					if(j === 0) {

						//get product title from first view
						if($view.data('producttitle')) {
							viewObj.productTitle = $view.data('producttitle');
						}

						//get product thumbnail from first view
						if($view.data('productthumbnail')) {
							viewObj.productThumbnail = $view.data('productthumbnail');
						}

					}

					$view.children('img,span').each(function(k, element) {

						var $element = $(element),
							source;

						if($element.is('img')) {
							source = $element.data('src') == undefined ? $element.attr('src') : $element.data('src');
						}
						else {
							source = $element.text()
						}

						var elementObj = {
							type: $element.is('img') ? 'image' : 'text', //type
							source: source, //source
							title: $element.attr('title'),  //title
							parameters: $element.data('parameters') == undefined || $element.data('parameters').length <= 2 ? {} : $element.data('parameters')  //parameters
						};

						viewObj.elements.push(elementObj);

					});

					viewsArr.push(viewObj);

				});

				//add product in category or asn own item
				if(category) {

					//get category index by category name
					var catIndex =  $.map(producJSON, function(obj, index) {
					    if(obj.category == category) {
					        return index;
					    }
					}).shift();

					if(isNaN(catIndex)) { //category does not exist in products
						catIndex = producJSON.length; // set index
						producJSON.push({category: category, products: []});
					}

					producJSON[catIndex].products.push(viewsArr);

				}
				else { //no categories
					producJSON.push(viewsArr)
				}

			}


		};

		//check if categories are used
		if($products.is('.fpd-category') && $products.filter('.fpd-category').length > 1) {

			//loop through all categories
			$products.each(function(i, cat) {
				var $cat = $(cat);
				_createProductsFromHTML($cat.children('.fpd-product'), $cat.attr('title'));
			});

		}
		else { //no categories are used

			//check if only one category is used
			$products = $products.filter('.fpd-category').length === 0 ? $products : $products.children('.fpd-product');
			_createProductsFromHTML($products, false);

		}

		if(producJSON.length > 0) {
			instance.setupProducts(producJSON);
		}

	};

	var _createDesignJSONFromHTML = function($designs) {

		var _loopDesignCategory = function($designCategories, pushToCat) {

			$designCategories.each(function(index, cat) {

				var $category = $(cat),
					categoryObj = {title: $category.attr('title'), thumbnail: $category.data('thumbnail')};

				if($category.data('parameters')) {
					categoryObj.parameters = $category.data('parameters');
				}

				pushToCat ? pushToCat.push(categoryObj) : instance.designs.push(categoryObj);

				if($category.children('.fpd-category').length > 0) {

					categoryObj.category = [];
					_loopDesignCategory($category.children('.fpd-category'), categoryObj.category);

				}
				else {

					var designImages = [];

					$category.children('img').each(function(designIndex, img) {

						var $img = $(img),
							designObj = {
								source: $img.data('src') === undefined ? $img.attr('src') : $img.data('src'),
								title: $img.attr('title'),
								parameters: $img.data('parameters'),
								thumbnail: $img.data('thumbnail')
							};

						designImages.push(designObj);

					});

					categoryObj.designs = designImages;

				}

			});

		};

		if($designs.length > 0) {

			FPDUtil.log('FPD: Creating designs from HTML is deprecated, use a JSON file to store your products. Please check out the documentation!', 'warn');

			//check if categories are used or first category also includes sub-cats
			if($designs.filter('.fpd-category').length > 1 || $designs.filter('.fpd-category:first').children('.fpd-category').length > 0) {

				_loopDesignCategory($designs.filter('.fpd-category'));

			}
			else { //display single category or designs without categories

				var $designImages = $designs;
				if($designImages.hasClass('fpd-category')) {
					$designImages = $designImages.children('img');
				}

				$designImages.each(function(designIndex, img) {

					var $img = $(img),
						designObj = {
							source: $img.data('src') === undefined ? $img.attr('src') : $img.data('src'),
							title: $img.attr('title'),
							parameters: $img.data('parameters'),
							thumbnail: $img.data('thumbnail')
						};

					instance.designs.push(designObj);

				});

			}

			$designs.remove();

			instance.setupDesigns(instance.designs);
		}

	};

	//get category index by category name
	var _getCategoryIndexInProducts = function(catName) {

		var catIndex =  $.map(instance.products, function(obj, index) {
		    if(obj.category == catName) {
		        return index;
		    }
		}).shift();

		return isNaN(catIndex) ? false : catIndex;

	};

	var _toggleUndoRedoBtn = function(undos, redos) {

		if(undos.length === 0) {
		  	instance.$actionsWrapper.find('[data-action="undo"]').addClass('fpd-disabled');
  		}
  		else {
	  		instance.$actionsWrapper.find('[data-action="undo"]').removeClass('fpd-disabled');
  		}

  		if(redos.length === 0) {
	  		instance.$actionsWrapper.find('[data-action="redo"]').addClass('fpd-disabled');
  		}
  		else {
	  		instance.$actionsWrapper.find('[data-action="redo"]').removeClass('fpd-disabled');
  		}

	};

	var _updateEditorBox = function(element) {

		if($editorBox === null) {
			return;
		}

		$editorBox.children('div').empty();
		$editorBox.children('h5').text(element.title);

		for(var i=0; i < instance.mainOptions.editorBoxParameters.length; ++i) {

			var parameter = instance.mainOptions.editorBoxParameters[i],
				value = element[parameter];

			if(value !== undefined) {

				value = typeof value === 'number' ? value.toFixed(2) : value;
				value = (typeof value === 'object' && value.source) ? value.source.src : value;
				if(parameter === 'fill' && element.type === FPDPathGroupName) {
					value = element.svgFill;
				}

				$editorBox.children('div').append('<p><i>'+parameter+'</i>: <input type="text" value="'+value+'" readonly /></p>');

			}

		}

	};

	var _onViewCreated = function() {

		//add all views of product till views end is reached
		if(instance.viewInstances.length < instance.currentViews.length) {

			instance.addView(instance.currentViews[instance.viewInstances.length]);

		}
		//all views added
		else {

			$elem.off('viewCreate', _onViewCreated);

			instance.toggleSpinner(false);
			instance.selectView(0);

			//search for object with auto-select
			if(!instance.mainOptions.editorMode && instance.currentViewInstance && $(instance.currentViewInstance.stage.getElement()).is(':visible')) {
				var viewElements = instance.currentViewInstance.stage.getObjects(),
					selectElement = null;

				for(var i=0; i < viewElements.length; ++i) {
					var obj = viewElements[i];

					 if(obj.autoSelect && !obj.hasUploadZone) {
					 	selectElement = obj;
					 }

				}
			}

			if(selectElement && instance.currentViewInstance) {
				setTimeout(function() {

					instance.currentViewInstance.stage.setActiveObject(selectElement);
					selectElement.setCoords();
					instance.currentViewInstance.stage.renderAll();

				}, 500);
			}

			instance.productCreated = true;

			//close dialog and off-canvas on element add
			if( instance.mainBar && instance.mainBar.__setup) {

				//instance.mainBar.toggleDialog(false);

			}

			if(instance.mainBar) {
				instance.mainBar.__setup = true; //initial active module fix
			}

			$window.resize();

			/**
		     * Gets fired as soon as a product has been fully added to the designer.
		     *
		     * @event FancyProductDesigner#productCreate
		     * @param {Event} event
		     * @param {array} currentViews - An array containing all views of the product.
		     */
			$elem.trigger('productCreate', [instance.currentViews]);

		}

	};

	var _updateElementTooltip = function() {

		var element = instance.currentElement;

		if(element && instance.$elementTooltip && instance.productCreated && !element.uploadZone && !element.__editorMode) {

			if(element.isOut && element.boundingBoxMode === 'inside') {
				instance.$elementTooltip.text(_outOfBoundingBoxLabel).show();
			}
			else if(instance.mainOptions.imageSizeTooltip && FPDUtil.getType(element.type) === 'image') {
				instance.$elementTooltip.text(parseInt(element.width * element.scaleX) +' x '+ parseInt(element.height * element.scaleY)).show();
			}
			else {
				instance.$elementTooltip.hide();
			}

			var oCoords = element.oCoords;
			instance.$elementTooltip.css({
				left: instance.$productStage.position().left + oCoords.mt.x,
				top: oCoords.mt.y - 10 + instance.$productStage.position().top
			});

		}
		else if(instance.$elementTooltip) {
			instance.$elementTooltip.hide();
		}

	};

	var _loadTemplate = function(template, type, loadIndex, callback) {

		var templateType = $.isArray(type) ? type[loadIndex] : type;

		$.get(
			instance.mainOptions.templatesDirectory+template+'.'+templateType,
			callback
		)
		.fail(function() {

			if($.isArray(type) && type[loadIndex+1]) {
				_loadTemplate(template, type, ++loadIndex, callback);
			}
			else {
				alert(instance.mainOptions.templatesDirectory+template+'.'+templateType+' could not be loaded.')
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

	var _downloadRemoteImage = function(source, title, options) {

		options = options === undefined ? {} : options;

		var ajaxSettings = instance.mainOptions.customImageAjaxSettings,
			uploadsDir = (ajaxSettings.data && ajaxSettings.data.uploadsDir) ? ajaxSettings.data.uploadsDir : '',
			uploadsDirURL = (ajaxSettings.data && ajaxSettings.data.uploadsDirURL) ? ajaxSettings.data.uploadsDirURL : '',
			saveOnServer = ajaxSettings.data && ajaxSettings.data.saveOnServer ? 1 : 0;

		instance._loadingCustomImage = true;
		instance.toggleSpinner(true,  instance.getTranslation('misc', 'loading_image'));
		instance.$viewSelectionWrapper.addClass('fpd-disabled');

		var uploadAjaxSettings  = $.extend({}, ajaxSettings);
		uploadAjaxSettings.success = function(data) {

			if(data && data.error === undefined) {

				instance.addCustomImage(
					data.image_src,
					data.filename ? data.filename : title,
					options
				);

			}
			else {

				instance.toggleSpinner(false);
				FPDUtil.showModal(data.error);

			}

		};

		uploadAjaxSettings.data = {
			url: source,
			uploadsDir: uploadsDir,
			uploadsDirURL: uploadsDirURL,
			saveOnServer: saveOnServer
		};

		//ajax post
		$.ajax(uploadAjaxSettings)
		.fail(function(evt) {

			instance._loadingCustomImage = false;
			instance.toggleSpinner(false);
			FPDUtil.showModal(evt.statusText);

		});

		if(instance.productCreated && instance.mainOptions.hideDialogOnAdd &&
			instance.$container.hasClass('fpd-topbar') && instance.mainBar) {

			instance.mainBar.toggleDialog(false);

		}

	};

	this._addGridItemToStage = function($item, additionalOpts, viewIndex) {

		viewIndex = viewIndex === undefined ? instance.currentViewIndex : viewIndex;

		if(!instance.currentViewInstance) { return; }

		additionalOpts = additionalOpts === undefined ? {} : additionalOpts;

		var moduleType = $item.parents('.fpd-module:first').data('module'),
			title = $item.data('title') ? $item.data('title') : null;

		if(moduleType == 'designs') {

			var options = $.extend(
				{},
				$item.data('parameters') ? $item.data('parameters') : {},
				additionalOpts
			);

			instance._addCanvasDesign(
				$item.data('source'),
				$item.data('title'),
				options,
				viewIndex
			);

		}
		else {

			var options = $.extend(
				{},
				$item.data('options') ? $item.data('options') : {},
				{_addToUZ: instance.currentViewInstance.currentUploadZone},
				additionalOpts
			);

			instance._addCanvasImage(
				$item.data('source'),
				$item.data('title'),
				options,
				$item.parents('[data-context="upload"]').length == 0,
				viewIndex
			);

		}

	};

	this._addCanvasImage = function(source, title, options, isRemoteImage, viewIndex) {

		options = options === undefined ? {} : options;
		isRemoteImage = isRemoteImage === undefined ? false : isRemoteImage;

		if(!instance.currentViewInstance) { return; }

		var ajaxSettings = instance.mainOptions.customImageAjaxSettings,
			saveOnServer = ajaxSettings.data && ajaxSettings.data.saveOnServer ? 1 : 0;

		//download remote image to local server (FB, Insta, Pixabay, Depositphotos)
		if(saveOnServer && isRemoteImage) {

			_downloadRemoteImage(
				source,
				title,
				options
			);

		}
		//add data uri or local image to canvas
		else {

			instance._loadingCustomImage = true;
			instance.addCustomImage(
				source,
				title ,
				options,
				viewIndex
			);

		}

		if(instance.productCreated && instance.mainOptions.hideDialogOnAdd && instance.mainBar) {
			instance.mainBar.toggleDialog(false);
		}

	};

	this._addCanvasDesign = function(source, title, params, viewIndex) {

		params = params === undefined ? {} : params;

		if(!instance.currentViewInstance) { return; }

		instance.toggleSpinner(true, instance.getTranslation('misc', 'loading_image'));

		params = $.extend({}, instance.currentViewInstance.options.customImageParameters, params);

		params.isCustom = true;
		if(instance.currentViewInstance.currentUploadZone) {
			params._addToUZ = instance.currentViewInstance.currentUploadZone;
		}


		instance.addElement('image', source, title, params, viewIndex);

		if(instance.productCreated && instance.mainOptions.hideDialogOnAdd && instance.mainBar) {
			instance.mainBar.toggleDialog(false);
		}

	};

	/**
	 * Adds a new product to the product designer.
	 *
	 * @method addProduct
	 * @param {array} views An array containing the views for a product. A view is an object with a title, thumbnail and elements property. The elements property is an array containing one or more objects with source, title, parameters and type.
	 * @param {string} [category] If categories are used, you need to define the category title.
	 */
	this.addProduct = function(views, category) {

		var catIndex = _getCategoryIndexInProducts(category);

		/*views.forEach(function(view) {
			view.options = view.options === undefined && typeof view.options !== 'object' ? instance.mainOptions : fpdOptionsInstance.merge(instance.mainOptions, view.options)
		});*/

		if(category === undefined) {
			instance.products.push(views);
		}
		else {

			if(catIndex === false) {

				catIndex = instance.products.length;
				instance.products[catIndex] = {category: category, products: []};

			}

			instance.products[catIndex].products.push(views);

		}

		/**
		 * Gets fired when a product is added.
		 *
		 * @event FancyProductDesigner#productAdd
		 * @param {Event} event
		 * @param {Array} views - The product views.
		 * @param {String} category - The category title.
		 * @param {Number} catIndex - The index of the category.
		 */
		$elem.trigger('productAdd', [views, category, catIndex]);

	};

	/**
	 * Selects a product by index and category index.
	 *
	 * @method selectProduct
	 * @param {number} index The requested product by an index value. 0 will load the first product.
	 * @param {number} [categoryIndex] The requested category by an index value. 0 will load the first category.
	 * @example fpd.selectProduct( 1, 2 ); //will load the second product from the third category
	 */
	this.selectProduct = function(index, categoryIndex) {

		instance.currentCategoryIndex = categoryIndex === undefined ? instance.currentCategoryIndex : categoryIndex;

		var productsObj;
		if(instance.products && instance.products.length && instance.products[0].category) { //categories enabled
			var category = instance.products[instance.currentCategoryIndex];
			productsObj = category.products;
		}
		else { //no categories enabled
			productsObj = instance.products;
		}

		instance.currentProductIndex = index;
		if(index < 0) { currentProductIndex = 0; }
		else if(index > productsObj.length-1) { instance.currentProductIndex = productsObj.length-1; }

		var product = productsObj[instance.currentProductIndex];

		/**
		 * Gets fired when a product is selected.
		 *
		 * @event FancyProductDesigner#productSelect
		 * @param {Event} event
		 * @param {Number} index - The index of the product in the category.
		 * @param {Number} categoryIndex - The index of the category.
		 * @param {Object} product - An object containing the product (views).
		 */
		$elem.trigger('productSelect', [index, categoryIndex, product]);

		instance.loadProduct(product, instance.mainOptions.replaceInitialElements);

	};

	/**
	 * Loads a new product to the product designer.
	 *
	 * @method loadProduct
	 * @param {array} views An array containing the views for the product.
	 * @param {Boolean} [onlyReplaceInitialElements=false] If true, the initial elements will be replaced. Custom added elements will stay on the canvas.
	 * @param {Boolean} [mergeMainOptions=false] Merges the main options into every view options.
	 */
	this.loadProduct = function(views, replaceInitialElements, mergeMainOptions) {

		if(!views) { return; }

		instance._prevPrintingBoxes = [];
		this.viewInstances.forEach(function(viewInstance) {

			instance._prevPrintingBoxes.push(FPDUtil.objectHasKeys(viewInstance.options.printingBox, ['left','top','width','height']) ? viewInstance.options.printingBox : null);

		})

		replaceInitialElements = replaceInitialElements === undefined ? false : replaceInitialElements;
		mergeMainOptions = mergeMainOptions === undefined ? false : mergeMainOptions;

		if($stageLoader.is(':hidden')) {
			instance.toggleSpinner(true);
		}

		//reset when loading a product
		instance.productCreated = false;
		instance.colorLinkGroups = {};

		instance.globalCustomElements = [];
		if(replaceInitialElements) {
			instance.globalCustomElements = instance.getCustomElements();
		}
		else {
			instance.doUnsavedAlert = false;
		}

		instance.fixedElements = instance.getFixedElements();

		instance.reset();

		if(mergeMainOptions) {

			views.forEach(function(view, i) {
				view.options = fpdOptionsInstance.merge(instance.mainOptions, view.options);
			});

		}

		instance.currentViews = views;

		_totalProductElements = _productElementLoadingIndex = 0;
		views.forEach(function(view, i) {
			_totalProductElements += view.elements.length;
		});

		if(!instance.$viewSelectionWrapper) {

			instance.$viewSelectionWrapper = $('<div class="fpd-views-wrapper"><span class="fpd-view-prev"><span class="fpd-icon-forward"></span></span><div class="fpd-views-selection"></div><span class="fpd-view-next"><span class="fpd-icon-forward"></span></span></div>');

		}

		if(($elem.hasClass('fpd-views-outside') || $elem.hasClass('fpd-device-smartphone')) && !instance.mainOptions.modalMode) {
			$elem.after(instance.$viewSelectionWrapper);
		}
		else {
			instance.$mainWrapper.append(instance.$viewSelectionWrapper);
		}

		$elem.on('viewCreate', _onViewCreated);

		if(views) {
			instance.addView(views[0]);
		}

	};

	/**
	 * Adds a view to the current visible product.
	 *
	 * @method addView
	 * @param {object} view An object with title, thumbnail and elements properties.
	 */
	this.addView = function(view) {

		var viewImageURL = instance.mainOptions._loadFromScript ? instance.mainOptions._loadFromScript + view.thumbnail : view.thumbnail;

		instance.$viewSelectionWrapper.children('.fpd-views-selection')
		.append('<div class="fpd-shadow-1 fpd-item fpd-tooltip" title="'+view.title+'"><picture style="background-image: url('+viewImageURL+');"></picture></div>')
		.children('div:last').click(function(evt) {

			instance.selectView(instance.$viewSelectionWrapper.children('.fpd-views-selection').children('.fpd-item').index($(this)));

		});

		var mainOptions = $.extend(true, {}, instance.mainOptions);

		//remove unnecessary props that are not needed in view
		delete mainOptions['productsJSON'];
		delete mainOptions['designsJSON'];
		delete mainOptions['guidedTour'];
		delete mainOptions['fonts'];
		delete mainOptions['pricingRules'];
		delete mainOptions['hexNames'];
		delete mainOptions['customImageAjaxSettings'];
		delete mainOptions['colorPickerPalette'];
		delete mainOptions['imageEditorSettings'];
		delete mainOptions['mainBarModules'];

		view.options = view.options === undefined && typeof view.options !== 'object' ? mainOptions : $.extend(true, {}, fpdOptionsInstance.merge(mainOptions, view.options));


		var viewInstance = new FancyProductDesignerView(instance.$productStage, view, function(viewInstance) {

			//remove view instance if not added to product container
			if($(viewInstance.stage.wrapperEl).parent().length === 0) {
				viewInstance.reset();
				return;
			}

			if(instance.viewInstances.length == 0) {
				viewInstance.resetCanvasSize();
			}

			instance.viewInstances.push(viewInstance);
			/**
			 * Gets fired when a view is created.
			 *
			 * @event FancyProductDesigner#viewCreate
			 * @param {Event} event
			 * @param {FancyProductDesignerView} viewInstance
			 */
			$elem.trigger('viewCreate', [viewInstance]);

		}, instance.mainOptions.fabricCanvasOptions );


		viewInstance.stage.on({

			'object:scaling': function(opts) {
			},
			'object:moving': function(opts) {
			},
			'object:rotating': function(opts) {
			}

		});

		$(viewInstance)
		.on('beforeElementAdd', function(evt, type, source, title, params) {

			if(!instance.productCreated) {
				_productElementLoadingIndex++;

				var loadElementState = title + '<br>' + String(_productElementLoadingIndex) + '/' + _totalProductElements;
				$stageLoader.find('.fpd-loader-text').html(loadElementState);
			}

		})
		.on('canvas:mouseUp', function(evt, viewInstance) {

			if(instance.mainOptions.fabricCanvasOptions.allowTouchScrolling) {
				$elem.removeClass('fpd-disable-touch-scrolling');
				instance.currentViewInstance.stage.allowTouchScrolling = true;
			}

		})
		.on('canvas:mouseMove', function(evt, viewInstance, opts) {

			instance.mouseOverCanvas = opts.target ? opts.target : true;

		})
		.on('canvas:mouseOut', function(evt, viewInstance) {

			instance.mouseOverCanvas = false;

		})
		.on('elementAdd', function(evt, element) {

			if(!element) {
				instance.toggleSpinner(false);
				return;
			}

			if(instance.productCreated && FPDUtil.getType(element.type) == 'image' && element.isCustom) {
				instance.toggleSpinner(false);
				FPDUtil.showMessage(instance.getTranslation('misc', 'image_added'));
			}

			//check if element has a color linking group
			if(element.colorLinkGroup && element.colorLinkGroup.length > 0 && !instance.mainOptions.editorMode) {

				var viewIndex = this.getIndex();

				if(instance.colorLinkGroups.hasOwnProperty(element.colorLinkGroup)) { //check if color link object exists for the link group

					//add new element with id and view index of it
					instance.colorLinkGroups[element.colorLinkGroup].elements.push({id: element.id, viewIndex: viewIndex});

					if(typeof element.colors === 'object') {

						//create color group colors
						var colorGroupColors = instance.mainOptions.replaceColorsInColorGroup ? element.colors : instance.colorLinkGroups[element.colorLinkGroup].colors.concat(element.colors);
						instance.colorLinkGroups[element.colorLinkGroup].colors = FPDUtil.arrayUnique(colorGroupColors);

					}

				}
				else {

					//create initial color link object
					instance.colorLinkGroups[element.colorLinkGroup] = {elements: [{id:element.id, viewIndex: viewIndex}], colors: []};

					if(typeof element.colors === 'object') {

						instance.colorLinkGroups[element.colorLinkGroup].colors = element.colors;

					}

				}

			}

			//close dialog and off-canvas on element add
			if(instance.mainBar && instance.productCreated && instance.mainOptions.hideDialogOnAdd) {
				instance.mainBar.toggleDialog(false);

			}

			/**
			 * Gets fired when an element is added.
			 *
			 * @event FancyProductDesigner#elementAdd
			 * @param {Event} event
			 * @param {fabric.Object} element
			 */
			$elem.trigger('elementAdd', [element]);

			$elem.trigger('viewCanvasUpdate', [viewInstance]);

		})
		.on('boundingBoxToggle', function(evt, currentBoundingObject, addRemove) {

			/**
		     * Gets fired as soon as the bounding box is added to or removed from the stage.
		     *
		     * @event FancyProductDesigner#boundingBoxToggle
		     * @param {Event} event
		     * @param {fabric.Object} currentBoundingObject - A fabricJS rectangle representing the bounding box.
		     * @param {Boolean} addRemove - True=added, false=removed.
		     */
			$elem.trigger('boundingBoxToggle', [currentBoundingObject, addRemove]);

		})
		.on('elementSelect', function(evt, element) {

			instance.currentElement = element;

			if(element) {
				_updateElementTooltip();
			}
			else { //deselected

				if(instance.$elementTooltip) {
					instance.$elementTooltip.hide();
				}

				instance.$mainWrapper.children('.fpd-snap-line-h, .fpd-snap-line-v').hide();

			}
			/**
			 * Gets fired when an element is selected.
			 *
			 * @event FancyProductDesigner#elementSelect
			 * @param {Event} event
			 * @param {fabric.Object} element
			 */
			$elem.trigger('elementSelect', [element]);

		})
		.on('elementChange', function(evt, type, element) {

			_updateElementTooltip();
			_updateEditorBox(element.getBoundingRect());

			/**
			 * Gets fired when an element is changed.
			 *
			 * @event FancyProductDesigner#elementChange
			 * @param {Event} event
			 * @param {fabric.Object} element
			 */
			$elem.trigger('elementChange', [type, element]);

		})
		.on('elementModify', function(evt, element, parameters) {

			_updateElementTooltip();

			/**
			 * Gets fired when an element is modified.
			 *
			 * @event FancyProductDesigner#elementModify
			 * @param {Event} event
			 * @param {fabric.Object} element
			 * @param {Object} parameters
			 */
			$elem.trigger('elementModify', [element, parameters]);

			/**
			 * Gets fired when an element is modified.
			 *
			 * @event FancyProductDesigner#viewCanvasUpdate
			 * @param {Event} event
			 * @param {FancyProductDesignerView} viewInstance
			 */
			$elem.trigger('viewCanvasUpdate', [viewInstance]);

		})
		.on('undoRedoSet', function(evt, undos, redos) {

			instance.doUnsavedAlert = true;
			_toggleUndoRedoBtn(undos, redos);

			/**
			 * Gets fired when an undo or redo state is set.
			 *
			 * @event FancyProductDesigner#undoRedoSet
			 * @param {Event} event
			 * @param {Array} undos - Array containing all undo objects.
			 * @param {Array} redos - Array containing all redo objects.
			 */
			$elem.trigger('undoRedoSet', [undos, redos]);

		})
		.on('priceChange', function(evt, price, viewPrice) {

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
			$elem.trigger('priceChange', [price, truePrice, instance.singleProductPrice]);

		})
		.on('elementCheckContainemt', function(evt, element, boundingBoxMode) {

			if(boundingBoxMode === 'inside') {

				_updateElementTooltip();

			}

		})
		.on('elementColorChange', function(evt, element, hex, colorLinking) {

			if(instance.productCreated && colorLinking && element.colorLinkGroup && element.colorLinkGroup.length > 0) {

				var group = instance.colorLinkGroups[element.colorLinkGroup];
				if(group && group.elements) {
					for(var i=0; i < group.elements.length; ++i) {

						var id = group.elements[i].id,
							viewIndex = group.elements[i].viewIndex,
							target = instance.getElementByID(id, viewIndex);

						if(target && target !== element && hex) {
							instance.viewInstances[viewIndex].changeColor(target, hex, false);
						}

					}
				}

			}

			/**
			 * Gets fired when the color of an element is changed.
			 *
			 * @event FancyProductDesigner#elementColorChange
			 * @param {Event} event
			 * @param {fabric.Object} element
			 * @param {String} hex Hexadecimal color string.
			 * @param {Boolean} colorLinking Color of element is linked to other colors.
			 */
			$elem.trigger('elementColorChange', [element, hex, colorLinking]);
			$elem.trigger('viewCanvasUpdate', [viewInstance]);

		})
		.on('elementRemove', function(evt, element) {

			//delete fixed element
			var deleteIndex = instance.fixedElements.findIndex(function(item) {
				return item.element.title == element.title
			})

			if(deleteIndex != -1) {
				instance.fixedElements.splice(deleteIndex, 1);
			}

			/**
		     * Gets fired as soon as an element has been removed.
		     *
		     * @event FancyProductDesigner#elementRemove
		     * @param {Event} event
		     * @param {fabric.Object} element - The fabric object that has been removed.
		     */
			$elem.trigger('elementRemove', [element]);

			$elem.trigger('viewCanvasUpdate', [viewInstance]);

		})
		.on('fabricObject:added fabricObject:removed', function(evt, element) {

			$elem.trigger(evt.type, [element]);

		})
		.on('textEditEnter', function() {

			if(instance.currentElement) {
				instance.toolbar.updatePosition(instance.currentElement);
			}

		})

		viewInstance.setup();

		FPDUtil.updateTooltip();

		instance.$viewSelectionWrapper.children('.fpd-views-selection').children().length > 1 ? instance.$viewSelectionWrapper.show() : instance.$viewSelectionWrapper.hide();

	};

	/**
	 * Selects a view from the current visible views.
	 *
	 * @method selectView
	 * @param {number} index The requested view by an index value. 0 will load the first view.
	 */
	this.selectView = function(index) {

		if(instance.viewInstances.length <= 0) {return;}

		instance.resetZoom();

		instance.currentViewIndex = index;
		if(index < 0) { instance.currentViewIndex = 0; }
		else if(index > instance.viewInstances.length-1) { instance.currentViewIndex = instance.viewInstances.length-1; }

		instance.$viewSelectionWrapper.children('.fpd-views-selection').children('div').removeClass('fpd-view-active')
		.eq(index).addClass('fpd-view-active');

		instance.$mainWrapper.children('.fpd-ruler').remove();

		if(instance.currentViewInstance) {
			//delete all undos/redos
			instance.currentViewInstance.undos = [];
			instance.currentViewInstance.redos = [];

			//remove some objects
			var removeObjs = ['_snap_lines_group', '_ruler_hor', '_ruler_ver'];
			for(var i=0; i<removeObjs.length; ++i) {
				var removeObj = instance.currentViewInstance.getElementByID(removeObjs[i]);
				if(removeObj) {
					instance.currentViewInstance.stage.remove(removeObj);
				}
			}

			instance.currentViewInstance._snapElements = false;

		}

		instance.currentViewInstance = instance.viewInstances[instance.currentViewIndex];

		instance.deselectElement();

		//select view wrapper and render stage of view
		instance.$productStage.children('.fpd-view-stage').addClass('fpd-hidden').eq(instance.currentViewIndex).removeClass('fpd-hidden');
		instance.currentViewInstance.stage.renderAll();

		//toggle custom adds
		if($mainBar && $mainBar.find('.fpd-navigation').length) {

			var viewOpts = instance.currentViewInstance.options,
				$nav = $mainBar.find('.fpd-navigation');

			$nav.children('[data-module="designs"]').toggleClass('fpd-disabled', !viewOpts.customAdds.designs);
			$('.fpd-sc-module-wrapper [data-module="designs"]').toggleClass('fpd-disabled', !viewOpts.customAdds.designs);
			$nav.children('[data-module="images"]').toggleClass('fpd-disabled', !viewOpts.customAdds.uploads);
			$('.fpd-sc-module-wrapper [data-module="images"]').toggleClass('fpd-disabled', !viewOpts.customAdds.designs);
			$nav.children('[data-module="text"]').toggleClass('fpd-disabled', !viewOpts.customAdds.texts);
			$('.fpd-sc-module-wrapper [data-module="text"]').toggleClass('fpd-disabled', !viewOpts.customAdds.designs);

			//PLUS
			if(typeof FPDNamesNumbersModule !== 'undefined') {
				$nav.children('[data-module="names-numbers"]').toggleClass('fpd-disabled', !instance.currentViewInstance.textPlaceholder && !instance.currentViewInstance.numberPlaceholder);
			}
			$nav.children('[data-module="drawing"]').toggleClass('fpd-disabled', !viewOpts.customAdds.drawing);

			//select nav item, if sidebar layout is used, no active item is set and active item is not disabled
			if($elem.hasClass('fpd-device-desktop')) {

				if($elem.hasClass('fpd-sidebar')) {

					if(($nav.children('.fpd-active').length === 0) || $nav.children('.fpd-active').hasClass('fpd-disabled')) {

						$nav.children(':not(.fpd-disabled)').length > 0 ? $nav.children(':not(.fpd-disabled)').first().click() : instance.mainBar.$content.children('.fpd-module').removeClass('fpd-active');

					}
					else if(instance.mainBar.$content.children('.fpd-active').length == 0 && instance.productCreated) {
						$nav.children(':first').click()
					}

				}
				else if($elem.hasClass('fpd-topbar')) {

					if($nav.children('.fpd-active').hasClass('fpd-disabled')) {

						instance.mainBar.toggleDialog(false);
					}

				}

			}

			//if products module is hidden and selected, select next
			if(instance.$container.hasClass('fpd-products-module-hidden') && $nav.children('.fpd-active').filter('[data-module="products"]').length > 0) {
				$nav.children(':not(.fpd-disabled)').eq(1).click();
			}

		}

		//adjust off-canvas height to view height
		if(instance.mainBar && instance.mainBar.$content && instance.$container.filter('[class*="fpd-off-canvas-"]').length > 0) {
			instance.mainBar.$content.height(instance.$mainWrapper.height());
		}

		_toggleUndoRedoBtn(instance.currentViewInstance.undos, instance.currentViewInstance.redos);

		//toggle view locker
		instance.$mainWrapper.children('.fpd-modal-lock')
		.removeClass('fpd-animated')
		.toggleClass('fpd-active', instance.currentViewInstance.options.optionalView)
		.toggleClass('fpd-unlocked', !instance.currentViewInstance.locked);
		setTimeout(function() {
			instance.$mainWrapper.children('.fpd-modal-lock').addClass('fpd-animated');
		}, 1);

		//reset view canvas size
		instance.$productStage.width(instance.currentViewInstance.options.stageWidth);
		instance.currentViewInstance.resetCanvasSize();
		instance.currentViewInstance.resetCanvasSize(); //fix: to calculate correct size when views have different dimensions


		/**
	     * Gets fired as soon as a view has been selected.
	     *
	     * @event FancyProductDesigner#viewSelect
	     * @param {Event} event
	     * @param {Number} viewIndex
	     * @param {Object} viewInstance
	     */
		$elem.trigger('viewSelect', [instance.currentViewIndex, instance.currentViewInstance]);

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
	 * Sets the parameters for a specified element.
	 *
	 * @method setElementParameters
	 * @param {object} parameters An object with the parameters that should be applied to the element.
	 * @param {fabric.Object | string} [element] A fabric object or the title of an element. If not set, the current selected element is used.
	 * @param {Number} [viewIndex] The index of the view you would like target. If not set, the current showing view will be used.
	 */
	this.setElementParameters = function(parameters, element, viewIndex) {

		element = element === undefined ? instance.stage.getActiveObject() : element;
		viewIndex = viewIndex === undefined ? instance.currentViewIndex : viewIndex;

		if(!element || parameters === undefined) {
			return false;
		}

		instance.viewInstances[viewIndex].setElementParameters(parameters, element);

	};

	/**
	 * Clears the product stage and resets everything.
	 *
	 * @method reset
	 */
	this.reset = function() {

		if(instance.currentViews === null) { return; }

		$elem.off('viewCreate', _onViewCreated);

		instance.deselectElement();
		instance.resetZoom();
		instance.currentViewIndex = instance.currentPrice = instance.singleProductPrice = instance.pricingRulesPrice = 0;
		instance.currentViewInstance = instance.currentViews = instance.currentElement = null;

		instance.viewInstances.forEach(function(view) {
			view.stage.clear();
		});

		instance.$mainWrapper.find('.fpd-view-stage').remove();
		$body.find('.fpd-views-selection').children().remove();

		instance.viewInstances = [];

		/**
	     * Gets fired as soon as the stage has been cleared.
	     *
	     * @event FancyProductDesigner#clear
	     * @param {Event} event
	     */
		$elem.trigger('clear');
		$elem.trigger('priceChange', [0, 0, 0]);
		stageCleared = true;

	};

	/**
	 * Deselects the selected element of the current showing view.
	 *
	 * @method deselectElement
	 */
	this.deselectElement = function() {

		if(instance.currentViewInstance) {

			instance.currentViewInstance.deselectElement();

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
	 * Shows or hides the spinner with an optional message.
	 *
	 * @method toggleSpinner
	 * @param {String} state The state can be "show" or "hide".
	 * @param {Boolean} msg The message that will be displayed underneath the spinner.
	 * @return {jQuery} $stageLoader jQuery object containing the stage loader.
	 */
	this.toggleSpinner = function(state, msg) {

		state = state === undefined ? true : state;
		msg = msg === undefined ? '' : msg;

		if(state) {

			$stageLoader.fadeIn(300).find('.fpd-loader-text').html(msg);

		}
		else {

			$stageLoader.stop().fadeOut(300);

		}

		return $stageLoader;

	};

	/**
	 * Returns an fabric object by title.
	 *
	 * @method getElementByTitle
	 * @param {String} title The title of an element.
	 * @param {Number} [viewIndex=-1] The index of the target view. By default all views are scanned.
	 * @return {fabric.Object} FabricJS Object.
	 */
	this.getElementByTitle = function(title, viewIndex) {

		viewIndex === undefined ? -1 : viewIndex;

		var searchedElement = false;
		this.getElements(viewIndex, 'all', false).some(function(element) {

			if(element.title == title) {
				searchedElement = element;
				return true;
			}

		});

		return searchedElement;

	};

	/**
	 * Returns an array with fabricjs objects.
	 *
	 * @method getElements
	 * @param {Number} [viewIndex=-1] The index of the target view. By default all views are target.
	 * @param {String} [elementType='all'] The type of elements to return. By default all types are returned. Possible values: text, image.
	 * @param {String} [deselectElement=true] Deselect current selected element.
	 * @return {Array} An array containg the elements.
	 */
	this.getElements = function(viewIndex, elementType, deselectElement) {

		viewIndex = viewIndex === undefined || isNaN(viewIndex) ? -1 : viewIndex;
		elementType = elementType === undefined ? 'all' : elementType;
		deselectElement = deselectElement === undefined ? true : deselectElement;

		if(deselectElement) {
			this.deselectElement();
		}

		var allElements = [];
		if(viewIndex === -1) {

			for(var i=0; i < instance.viewInstances.length; ++i) {
				allElements = allElements.concat(instance.viewInstances[i].stage.getObjects());
			}

		}
		else {

			if(instance.viewInstances[viewIndex]) {
				allElements = instance.viewInstances[viewIndex].stage.getObjects();
			}
			else {
				return [];
			}

		}

		//remove bounding-box and printing-box object
		allElements = allElements.filter(function(obj) {
			return !obj._ignore;
		});

		if(elementType === 'text') {

			var textElements = [];
			allElements.forEach(function(elem) {

				if(FPDUtil.getType(elem.type) === 'text') {
					textElements.push(elem);
				}

			});

			return textElements;

		}
		else if(elementType === 'image') {

			var imageElements = [];
			allElements.forEach(function(elem) {

				if(FPDUtil.getType(elem.type) === 'image') {
					imageElements.push(elem);
				}

			});

			return imageElements;

		}

		return allElements;

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
	 * Resets the zoom.
	 *
	 * @method resetZoom
	 */
	this.resetZoom = function() {

		zoomReseted = true;
		this.deselectElement();

		if(instance.currentViewInstance) {

			var responsiveScale = instance.currentViewInstance.responsiveScale;

			instance.currentViewInstance.stage.zoomToPoint(new fabric.Point(0, 0), responsiveScale);
			instance.currentViewInstance.stage.absolutePan(new fabric.Point(0, 0));

		}

	};

	/**
	 * Get an elment by ID.
	 *
	 * @method getElementByID
	 * @param {Number} id The id of an element.
	 * @param {Number} [viewIndex] The view index you want to search in. If no index is set, it will use the current showing view.
	 */
	this.getElementByID = function(id, viewIndex) {

		viewIndex = viewIndex === undefined ? instance.currentViewIndex : viewIndex;

		return instance.viewInstances[viewIndex] ? instance.viewInstances[viewIndex].getElementByID(id) : null;

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
	 * Get the translation of a label.
	 *
	 * @method getTranslation
	 * @param {String} section The section key you want - toolbar, actions, modules or misc.
	 * @param {String} label The label key.
	 */
	this.getTranslation = function(section, label, defaulText) {

		defaulText = defaulText === undefined ? '' : defaulText;

		if(instance.langJson) {

			section = instance.langJson[section];

			if(section) {
				return section[label] ? section[label] : defaulText;
			}

		}

		return defaulText;

	};

	/**
	 * Returns an array with all custom added elements.
	 *
	 * @method getCustomElements
	 * @param {string} [type='all'] The type of elements. Possible values: 'all', 'image', 'text'.
	 * @param {Number} [viewIndex=-1] The index of the target view. By default all views are target.
	 * @param {String} [deselectElement=true] Deselect current selected element.
	 * @return {array} An array with objects with the fabric object and the view index.
	 */
	this.getCustomElements = function(type, viewIndex, deselectElement) {

		var elements = this.getElements(viewIndex, type, deselectElement),
			customElements = [];

		elements.forEach(function(element) {

			if(element.isCustom) {

				var viewIndex = instance.$productStage.children('.fpd-view-stage').index(element.canvas.wrapperEl);
				customElements.push({element: element, viewIndex: viewIndex});

			}

		});

		return customElements;

	};

	/**
	 * Returns an array with all fixed elements.
	 *
	 * @method getFixedElements
	 * @param {string} [type='all'] The type of elements. Possible values: 'all', 'image', 'text'.
	 * @param {Number} [viewIndex=-1] The index of the target view. By default all views are target.
	 * @param {String} [deselectElement=true] Deselect current selected element.
	 * @return {array} An array with objects with the fabric object and the view index.
	 */
	this.getFixedElements = function(type, viewIndex, deselectElement) {

		var elements = this.getElements(viewIndex, type, deselectElement),
			fixedElements = [];

		elements.forEach(function(element) {

			if(element.fixed) {

				var viewIndex = instance.$productStage.children('.fpd-view-stage').index(element.canvas.wrapperEl);
				fixedElements.push({element: element, viewIndex: viewIndex});

			}

		});

		return fixedElements;

	};

	/**
	 * Adds a new custom image to the product stage. This method should be used if you are using an own image uploader for the product designer. The customImageParameters option will be applied on the images that are added via this method.
	 *
	 * @method addCustomImage
	 * @param {string} source The URL of the image.
	 * @param {string} title The title for the design.
	 * @param {Object} options Additional options.
	 * @param {number} [viewIndex] The index of the view where the element needs to be added to. If no index is set, it will be added to current showing view.
	 */
	this.addCustomImage = function(source, title, options, viewIndex) {

		options = options === undefined ? {} : options;
		viewIndex = viewIndex === undefined ? instance.currentViewIndex : viewIndex;

		var image = new Image;

		image.crossOrigin = "anonymous";
    	image.src = source;

    	this.toggleSpinner(true, instance.getTranslation('misc', 'loading_image'));
    	instance.$viewSelectionWrapper.addClass('fpd-disabled');

		image.onload = function() {

			instance._loadingCustomImage = false;

			var imageH = this.height,
				imageW = this.width,
				currentCustomImageParameters = instance.currentViewInstance.options.customImageParameters,
				imageParts = this.src.split('.');

			if(!FPDUtil.checkImageDimensions(instance, imageW, imageH)) {
				instance.toggleSpinner(false);
    			return false;
			}

			var fixedParams = {
				isCustom: true,
			};

			//enable color wheel for svg and when no colors are set
			if($.inArray('svg', imageParts) != -1 && !currentCustomImageParameters.colors) {
				fixedParams.colors = true;
			}


			instance.addElement(
    			'image',
    			source,
    			title,
	    		$.extend({}, currentCustomImageParameters, fixedParams, options),
	    		viewIndex
    		);

    		instance.$viewSelectionWrapper.removeClass('fpd-disabled');

		}

		image.onerror = function(evt) {
			FPDUtil.showModal('Image could not be loaded!');
		}

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

		instance._order.usedDepositPhotos = instance.getDepositPhotos();

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

	//translates a HTML element
	this.translateElement = function($tag) {

		var label = '';
		if(instance.langJson) {

			var objString = '';

			if($tag.attr('placeholder') !== undefined) {
				objString = $tag.attr('placeholder');
			}
			else if($tag.attr('title') !== undefined) {
				objString = $tag.attr('title');
			}
			else if($tag.data('title') !== undefined) {
				objString = $tag.data('title');
			}
			else {
				objString = $tag.text();
			}

			var keys = objString.split('.'),
				firstObject = instance.langJson[keys[0]];

			if(firstObject) { //check if object exists

				label = firstObject[keys[1]];

				if(label === undefined) { //if label does not exist in JSON, take default text
					label = $tag.data('defaulttext');
				}

			}
			else {
				label = $tag.data('defaulttext');
			}

			//store all translatable labels in json
			var sectionObj = instance.languageJSON[keys[0]];
			sectionObj[keys[1]] = label;

		}
		else {
			label = $tag.data('defaulttext');
		}

		if($tag.attr('placeholder') !== undefined) {
			$tag.attr('placeholder', label).text('');
		}
		else if($tag.attr('title') !== undefined) {
			$tag.attr('title', label);
		}
		else if($tag.data('title') !== undefined) {
			$tag.data('title', label);
		}
		else {
			$tag.text(label);
		}

		return label;

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
	 * Set up the products with a JSON.
	 *
	 * @method setupProducts
	 * @param {Array} products An array containg the products or categories with products.
	 * @example [{
	 "category": "Category Title", "products":
	 	[{"productTitle": "TITLE OF PRODUCT", "productThumbnail": "THUMBNAIL OF PRODUCT" "title": "TITLE OF VIEW", "thumbnail": "THUMBNAIL OF VIEW", "OPTIONS": {OBJECT VIEW OPTIONS}, "ELEMENTS": [ARRAY OF ELEMENTS]
	 	...
]}
	 */
	this.setupProducts = function(products) {

		products = products === undefined ? [] : products;

		this.products = [];

		products.forEach(function(productItem) {

			if(productItem.hasOwnProperty('category')) { //check if products JSON contains categories

				productItem.products.forEach(function(singleProduct) {
					instance.addProduct(singleProduct, productItem.category);
				});

			}
			else {
				instance.addProduct(productItem);
			}

		});

		//load first product
		if(instance.mainOptions.loadFirstProductInStage && products.length > 0 && !stageCleared) {
			instance.selectProduct(0);
		}
		else {
			instance.toggleSpinner(false);
		}

		/**
	     * Gets fired as soon as products are set either from the HTML or added as JSON.
	     *
	     * @event FancyProductDesigner#productsSet
	     * @param {Event} event
	     * @param {Array} products - An array containing the products.
	     */
		$elem.trigger('productsSet', [instance.products]);

	};

	/**
	 * Set up the designs with a JSON.
	 *
	 * @method setupDesigns
	 * @param {Array} designs An array containg the categories with designs.
	 * @example [{
	 "title": "Category Title", "thumbnail": "Thumbnail of Category", "designs": [ARRAY OF ELEMENTS]},
	 {"title": "Category Title", "thumbnail": "Thumbnail of Category", "category": [
	 		{"title": "Category Child", "thumbnail": "Thumbnail of Category", "designs": [ARRAY OF ELEMENTS]}
	 ]}
]
	 */
	this.setupDesigns = function(designs) {

		instance.designs = designs;

		/**
	     * Gets fired as soon as designs are set either from the HTML or added as JSON.
	     *
	     * @event FancyProductDesigner#designsSet
	     * @param {Event} event
	     * @param {Array} designs - An array containing the designs.
	     */
		$elem.trigger('designsSet', [instance.designs]);

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
	 * Get an array with image objects from depositphotos.com that are used in the current showing product.
	 *
	 * @method getDepositPhotos
	 * @return {Array} An array containing objects. The object contains the depositphotos media ID and the URL to the image that has been uploaded to the server.
	 */
	this.getDepositPhotos = function() {

		var dpImages = [];
		this.getElements(-1, 'image').forEach(function(imgItem) {

			if(imgItem.source && imgItem.depositphotos) {
				dpImages.push({depositphotos: imgItem.depositphotos, source: imgItem.source});
			}

		});

		return dpImages;

	};

	/**
	 * Get an object containing the download link for a media. Whenever you call this method, credits will be taken from your depositphotos account to purchase a media. You can find more infos about the Depositphotos API here: http://api.depositphotos.com/doc/classes/API.Purchase.html
	 *
	 * @method getDepositPhotosPurchaseMedia
	 * @param {Function} callback A function that will be called with JSON data has been loaded. Will also be executed on failure.
	 * @param {String} mediaID A Depositphotos media ID.
	 * @param {String} username Your Depositphotos username.
	 * @param {String} password Your Depositphotos password.
	 * @param {String} [size=s] Possible values: s/m/l/xl/vect/el0.
	 * @param {String} [license=standard] Possible values: standard or extended.
	 * @param {String} [purchaseCurrency=credits] The license. Possible values: 'credits' | 'subscription' | 'bonus' | 'ondemand'.
	 * @example
fpd.getDepositPhotosPurchaseMedia(function(data) {
}, '12345', 'username', 'password', 'm')
	 */
	this.getDepositPhotosPurchaseMedia = function(callback, mediaID, username, password, size, license, purchaseCurrency) {

		size = size === undefined ? 's' : size;
		license = license === undefined ? 'standard' : license;
		purchaseCurrency = purchaseCurrency === undefined ? 'credits' : purchaseCurrency;

		var loginObj = {
			dp_apikey: instance.mainOptions.depositphotosApiKey,
			dp_command: 'login',
			dp_login_user: username,
			dp_login_password: password
		};

		$.getJSON(location.protocol+'//api.depositphotos.com?'+$.param(loginObj), function(loginData) {

			if(loginData.error) {

				callback(loginData);
				alert(loginData.error.errormsg);

			}
			else if(loginData.sessionid) {

				var mediaObj = {
					dp_apikey: instance.mainOptions.depositphotosApiKey,
					dp_command: 'getMedia',
					dp_session_id: loginData.sessionid,
					dp_media_id: mediaID,
					dp_media_option: size,
					dp_media_license: license,
					dp_purchase_currency: purchaseCurrency,
					dp_force_purchase_method: purchaseCurrency
				};

				$.getJSON(location.protocol+'//api.depositphotos.com?'+$.param(mediaObj), function(mediaData) {

					callback(mediaData);

					if(mediaData.error) {
						alert(mediaData.error.errormsg);
					}
					else {

					}

				})

			}
			else {

				callback(loginData);
				alert("No Sessions ID!");

			}

		});


	};

	/**
	 * Load custom fonts or from Google webfonts  used in the product designer.
	 *
	 * @method loadFonts
	 * @param {Array} fonts An array containing objects with name and URL to the font file.
	 * @param {Function} callback A function that will be called when all fonts have been loaded.
	 * @version 4.7.6
	 */
	this.loadFonts = function(fonts, callback) {

		if(fonts && fonts.length > 0 && typeof fonts[0] === 'object') {

			var googleFonts = [],
				customFonts = [],
				fontStateCount = 0,
				$customFontsStyle;

			if(instance.$container.prevAll('#fpd-custom-fonts').length == 0) {

				$customFontsStyle = $('<style type="text/css" id="fpd-custom-fonts"></style>');
				instance.$container.before($customFontsStyle);

			}
			else {
				$customFontsStyle = instance.$container.prevAll('#fpd-custom-fonts:first').empty();
			}

			fonts.forEach(function(fontItem) {

				if(fontItem.hasOwnProperty('url')) {

					if(fontItem.url == 'google') { //from google fonts
						googleFonts.push(fontItem.name+':400,400i,700,700i');
					}
					else { //custom fonts

						var fontFamily = fontItem.name;

						fontFamily += ':n4'

						if(fontItem.variants) {
							fontFamily += ','+Object.keys(fontItem.variants).toString();
						}

						customFonts.push(fontFamily);

						$customFontsStyle.append(FPDUtil.parseFontsToEmbed(fontItem, instance.mainOptions._loadFromScript));

					}

				}

			});

			var _fontActiveState = function(state, familyName, fvd) {

				if(state == 'inactive') {
					FPDUtil.log(familyName+' font could not be loaded.', 'warn');
				}

				if(fontStateCount == (googleFonts.length + customFonts.length)-1) {
					callback();
				}

				fontStateCount++;

			};

			var WebFontOpts = {
				 fontactive: function(familyName, fvd) {
				    _fontActiveState('active', familyName, fvd);
			    },
			    fontinactive: function(familyName, fvd) {
				    _fontActiveState('inactive', familyName, fvd);
				},
			    timeout: 3000
			};

			if(googleFonts.length > 0) {
				WebFontOpts.google = {families: googleFonts};
			}

			if(customFonts.length > 0) {
				WebFontOpts.custom = {families: customFonts};
			}

			if(typeof WebFont !== 'undefined' && (googleFonts.length > 0 || customFonts.length > 0)) {
				WebFont.load(WebFontOpts);
			}
			else {
				callback();
			}


		}
		else {
			callback();
		}

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

	/**
	 * add events to the Designer object
	 */
	this.on = elem.on.bind(elem);

	_initialize();

};
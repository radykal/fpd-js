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

export class FancyProductDesigner {

	$modalContainer = null;

	constructor (elem, opts) {
		this.elem = document.getElementById(elem)



		this.modalContainerElement = this.mainOptions.openModalInDesigner ? this.elem : document.body

		let classes = {
			'fpd-container': true,
			'fpd-shadow-2': true,
			'fpd-topbar ': this.mainOptions.mainBarContainer,
			'fpd-sidebar ': !this.mainOptions.mainBarContainer,
			'fpd-tabs ': true,
			'fpd-tabs-side': true,
			'fpd-top-actions-centered ': true,
			'fpd-bottom-actions-centered': true,
			'fpd-views-inside-left': true,
			'fpd-disable-touch-scrolling': true,
			'fpd-ui-theme-flat ': true,
			['fpd-ui-theme-' + instance.mainOptions.uiTheme]: true,
			'fpd-clearfix': true,
			'fpd-grid-columns-2': true,
			'fpd-device-smartphone': window.innerWidth < 568,
			'fpd-device-tablet': window.innerWidth >= 568 && window.innerWidth < 768,
			'fpd-device-desktop': window.innerWidth >= 768,
		}
		for( let classname in classes){
			if(classes[classname]){
				elem.classList.push(classname)
			}
		}

		// if(instance.mainOptions.uiTheme === 'doyle') {
		// 	$elem.removeClass('fpd-topbar fpd-tabs-top').addClass('fpd-sidebar fpd-tabs-side')
		// }

	}

	var _initialize = function() {


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

	_initialize();

};
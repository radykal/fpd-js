var FPDToolbarSide = function($uiElementToolbar, fpdInstance) {

	'use strict';

	$ = jQuery;

	var instance = this,
		$body = $('body'),
		$uiToolbarSub = $uiElementToolbar.children('.fpd-sub-panel'),
		$colorPicker = $uiElementToolbar.find('.fpd-color-wrapper'),
		colorDragging = false,
		resetScroll = true,
		subPanelResetted = true;

	this.isTransforming = false; //is true, while transforming via slider
	this.placement = fpdInstance.mainOptions.toolbarPlacement;

	var _initialize = function() {
        
		$uiElementToolbar.addClass('fpd-ui-theme-'+fpdInstance.mainOptions.uiTheme)

		instance.setPlacement(fpdInstance.mainOptions.toolbarPlacement);

		$body.on('mousedown touchstart', function(evt) {

			if(typeof evt.target.className.includes === 'function' && evt.target.className.includes('fpd-range-slider')) {
				instance.isTransforming = true;
				evt.preventDefault();
			}

		})
		.on('touchmove', function(evt) {
			if(evt.target.className.includes('fpd-range-slider')) {
				evt.preventDefault();
			}
		})
		.on('mouseup touchend', function() {
			instance.isTransforming = false;
		});

		//prevent parent scrolling
		var $scrollArea = $uiElementToolbar.children('.fpd-scroll-area');

		if(!fpdInstance.$container.hasClass('fpd-device-desktop')) {

			$uiElementToolbar.children('.fpd-scroll-area').on('mousewheel', function(evt, d) {

			    if(
			    	(this.scrollLeft === ( $scrollArea.get(0).scrollWidth -  $scrollArea.width()) && d < 0)
			    	|| (this.scrollLeft === 0 && d > 0)
			    ) {
			    	evt.preventDefault();
			    }

			});

		}

		fpdInstance.$container.on('screenSizeChange', function(evt, device) {

			if(device == 'desktop') {

				instance.setPlacement('mainbar');

			}
			else {
				instance.setPlacement('body');
			}

			_createScrollbar($uiElementToolbar.find('.fpd-sub-panel .fpd-scroll-area'));

		});

		//close toolbar
		$uiElementToolbar
		//close sub panel
		.on('click', '.fpd-close-sub-panel', function() {

			$uiElementToolbar.find('.fpd-panel-font-family input').val('').keyup();
			$colorPicker.children('input').spectrum('hide');

			if(fpdInstance.currentElement && fpdInstance.currentElement.exitEditing === 'function') {
				fpdInstance.currentElement.exitEditing();
			}

			$uiElementToolbar.removeClass('fpd-panel-visible');

			fpdInstance.$container.trigger('toolbarPanelClose');

		})
		//deselect element
		.on('click', '.fpd-close-panel', function() {

			$uiElementToolbar.find('.fpd-panel-font-family input').val('').keyup();
			$colorPicker.children('input').spectrum('hide');

			if(fpdInstance.currentElement && fpdInstance.currentElement.exitEditing === 'function') {
				fpdInstance.currentElement.exitEditing();
			}

			fpdInstance.deselectElement();

			fpdInstance.$container.trigger('toolbarPanelClose');

		});

		//set max values
		var maxValuesKeys = Object.keys(fpdInstance.mainOptions.maxValues);
		for(var i=0; i < maxValuesKeys.length; ++i) {

			var maxValueProp = maxValuesKeys[i];

			$uiElementToolbar.find('[data-control="'+maxValueProp+'"]')
			.attr('max', fpdInstance.mainOptions.maxValues[maxValueProp]);

		}

		//tool nav items
		$uiElementToolbar.find('.fpd-tools-nav > div').click(function() {

			subPanelResetted = false;

			var $this = $(this);

			if($this.data('panel')) { //has a sub a panel

				var element = fpdInstance.currentElement;

				//add active state to nav item
				$this.addClass('fpd-active')
				.siblings().removeClass('fpd-active');

				//display related tool panel
				$uiToolbarSub
				.children().removeClass('fpd-active') //hide all panels in sub wrapper
				.filter('.fpd-panel-'+$this.data('panel')).addClass('fpd-active'); //display related panel

				$uiElementToolbar.addClass('fpd-panel-visible')
				.attr('data-fields', $this.data('fields') ? $this.data('fields') : '');

				if($this.data('panel') == 'color') {

					if(FPDUtil.elementHasColorSelection(element)) {

						var availableColors;
						if(element.__editorMode) {
							availableColors = ['#000'];
						}
						else if(element.colorLinkGroup) {
							availableColors = fpdInstance.colorLinkGroups[element.colorLinkGroup].colors;
						}
						else {
							availableColors = element.colors;
						}

						$colorPicker.children('input').spectrum('destroy');
						$colorPicker.empty().removeClass('fpd-colorpicker-group');

						//svg with more than one path
						if(element.type == FPDPathGroupName && (element.getObjects().length > 1 || availableColors == 1 || element.__editorMode)) {

							var paths = element.getObjects();
							for(var i=0; i < paths.length; ++i) {
								var path = paths[i],
									color = tinycolor(path.fill);

								$colorPicker.append('<input type="text" value="'+color.toHexString()+'" />');
							}

							$colorPicker.addClass('fpd-colorpicker-group').children('input').spectrum('destroy').spectrum({
								showPaletteOnly: $.isArray(element.colors) && !element.__editorMode,
								preferredFormat: "hex",
								showInput: true,
								showInitial: true,
								showButtons: false,
								showPalette: fpdInstance.mainOptions.colorPickerPalette && fpdInstance.mainOptions.colorPickerPalette.length > 0,
								palette: $.isArray(element.colors) ? element.colors : fpdInstance.mainOptions.colorPickerPalette,
								containerClassName: 'fpd-theme-'+fpdInstance.mainOptions.toolbarTheme,
								show: function(color) {

									var svgColors = FPDUtil.changePathColor(
										fpdInstance.currentElement,
										$colorPicker.children('input').index(this),
										color
									);

									FPDUtil.spectrumColorNames($(this).spectrum('container'), fpdInstance);

									element._tempFill = svgColors;

								},
								move: function(color) {

									var svgColors = FPDUtil.changePathColor(
										element,
										$colorPicker.children('input').index(this),
										color
									);

									fpdInstance.currentViewInstance.setElementParameters({fill: svgColors}, element);

								},
								change: function(color) {

									var svgColors = FPDUtil.changePathColor(
										element,
										$colorPicker.children('input').index(this),
										color
									);

									$(document).unbind("click.spectrum"); //fix, otherwise change is fired on every click
									fpdInstance.currentViewInstance.setElementParameters({fill: svgColors}, element);

								}
							});

						}
						//color list or for svg with one path
						else if(availableColors.length > 1 || (element.type == FPDPathGroupName && element.getObjects().length === 1)) {

							$colorPicker.html('<div class="fpd-scroll-area"><div class="fpd-color-palette fpd-grid"></div></div>');

							for(var i=0; i < availableColors.length; ++i) {

								var color = availableColors[i],
									colorName = fpdInstance.mainOptions.hexNames[color.replace('#', '').toLowerCase()];

								colorName = colorName ? colorName : color;
								$colorPicker.find('.fpd-grid').append('<div class="fpd-item fpd-tooltip" title="'+colorName+'" style="background-color: '+color+';"></div>')
								.children('.fpd-item:last').click(function() {

									var color = tinycolor($(this).css('backgroundColor'));

									$uiElementToolbar.find('.fpd-current-fill').css('background', color.toHexString());

									var fillValue = color.toHexString();
									if(fpdInstance.currentElement.type == FPDPathGroupName) {

										fillValue = FPDUtil.changePathColor(
											element,
											0,
											color
										);

									}

									fpdInstance.currentViewInstance.setElementParameters({fill: fillValue});

								});

							}

							_createScrollbar($colorPicker.children('.fpd-scroll-area'));
							FPDUtil.updateTooltip($colorPicker);

						}
						//colorwheel
						else {

							$colorPicker.html('<input type="text" value="'+(element.fill ? element.fill : availableColors[0])+'" />');

							$colorPicker.children('input').spectrum({
								flat: true,
								preferredFormat: "hex",
								showInput: true,
								showInitial: true,
								showPalette: fpdInstance.mainOptions.colorPickerPalette && fpdInstance.mainOptions.colorPickerPalette.length > 0,
								palette: fpdInstance.mainOptions.colorPickerPalette,
								containerClassName: 'fpd-theme-'+fpdInstance.mainOptions.toolbarTheme,
								allowEmpty: Boolean(element.__editorMode),
								show: function(color) {

									FPDUtil.spectrumColorNames($(this).spectrum('container').next('.sp-container'), fpdInstance);
									element._tempFill = color.toHexString();

								},
								move: function(color) {

									//only non-png images are changing while dragging
									if(colorDragging === false || FPDUtil.elementIsColorizable(element) !== 'png') {
										_setElementColor(color ? color.toHexString() : '');
									}

								},
								change: function(color) {

									$(document).unbind("click.spectrum"); //fix, otherwise change is fired on every click
									fpdInstance.currentViewInstance.setElementParameters({fill: color ? color.toHexString() : false}, element);

								}
							})
							.on('dragstart.spectrum', function() {
								colorDragging = true;
							})
							.on('dragstop.spectrum', function(evt, color) {
								colorDragging = false;
								_setElementColor(color.toHexString());
							});

						}
					}

					//patterns
					if((FPDUtil.isSVG(element) || FPDUtil.getType(element.type) === 'text') && element.patterns && element.patterns.length) {

						$uiToolbarSub.find('.fpd-tool-patterns .fpd-grid').empty();
						for(var i=0; i < element.patterns.length; ++i) {

							var patternUrl = element.patterns[i],
								$lastItem = $('<div/>', {
									'class': 'fpd-item',
									'data-pattern': patternUrl,
									'html': '<picture style="background-image: url('+patternUrl+');"></picture>'
								}).appendTo($uiToolbarSub.find('.fpd-tool-patterns .fpd-grid'));

							$lastItem.click(function() {

								var patternUrl = $(this).data('pattern');
								$uiElementToolbar.find('.fpd-current-fill').css('background', 'url('+patternUrl+')');
								fpdInstance.currentViewInstance.setElementParameters( {pattern: patternUrl} );


							});

						}

						_createScrollbar($uiToolbarSub.find('.fpd-tool-patterns .fpd-scroll-area'));

					}

					//stroke color
				    $uiToolbarSub.find('.fpd-stroke-color-picker input').spectrum('destroy').spectrum({
					    color: element.stroke ? element.stroke : '#000',
						flat: true,
						preferredFormat: "hex",
						showInput: true,
						showInitial: true,
						palette: element.strokeColors && element.strokeColors.length > 0 ? element.strokeColors : fpdInstance.mainOptions.colorPickerPalette,
                        showPalette: fpdInstance.mainOptions.colorPickerPalette && fpdInstance.mainOptions.colorPickerPalette.length > 0,
						showPaletteOnly: element.strokeColors && element.strokeColors.length > 0,
						containerClassName: 'fpd-theme-'+fpdInstance.mainOptions.toolbarTheme,
						move: function(color) {
							instance.isTransforming = true;
							fpdInstance.currentViewInstance.setElementParameters( {stroke: color.toHexString()} );

						},
						change: function(color) {

							fpdInstance.currentViewInstance.setElementParameters({stroke: color.toHexString()});

						}
					});


					//shadow color
				    $uiToolbarSub.find('.fpd-shadow-color-picker input').spectrum('destroy').spectrum({
					    color: element.stroke ? element.stroke : '#000',
						flat: true,
						preferredFormat: "hex",
						showInput: true,
						showInitial: true,
						allowEmpty: true,
						showPalette: fpdInstance.mainOptions.colorPickerPalette && fpdInstance.mainOptions.colorPickerPalette.length > 0,
						palette: fpdInstance.mainOptions.colorPickerPalette,
						containerClassName: 'fpd-theme-'+fpdInstance.mainOptions.toolbarTheme,
						move: function(color) {

							if(color) {
								instance.isTransforming = true;
								fpdInstance.currentViewInstance.setElementParameters( {shadowColor: color.toHexString()} );
							}

						},
						change: function(color) {

							fpdInstance.currentViewInstance.setElementParameters({shadowColor: color ? color.toHexString() : ''});

						}
					});

				}
                
				instance.toggle();
				$uiToolbarSub.find('.fpd-slider-number').change();
				FPDUtil.createScrollbar($uiToolbarSub.find('.fpd-active .fpd-scroll-area'));

				fpdInstance.$container.trigger('toolbarPanelOpen', [$this.data('panel')]);

				subPanelResetted = true;

			}

		});

		//call content in tab
		$uiToolbarSub.find('.fpd-panel-tabs > span').click(function() {

			var $this = $(this);

			$this.addClass('fpd-active').siblings().removeClass('fpd-active');
			var $activePanel = $this.parent().siblings('.fpd-panel-tabs-content').children('[data-id="'+this.dataset.tab+'"]').addClass('fpd-active');

			$activePanel.siblings().removeClass('fpd-active');
			$activePanel.find('.fpd-slider-range').rangeslider('update', true, false);

		});

		//create range slider
		var saveUndo = true;
		$uiToolbarSub.find('.fpd-slider-range').rangeslider({
			polyfill: false,
			rangeClass: 'fpd-range-slider',
			disabledClass: 'fpd-range-slider--disabled',
			horizontalClass: 'fpd-range-slider--horizontal',
		    verticalClass: 'fpd-range-slider--vertical',
		    fillClass: 'fpd-range-slider__fill',
		    handleClass: 'fpd-range-slider__handle',
		    onSlide: function(pos, value) {

				instance.isTransforming = true;

			    if(fpdInstance.currentViewInstance && fpdInstance.currentViewInstance.currentElement && instance.isTransforming) {

				    if(!this.$element.is(':visible')) {
					    return;
				    }

				    var props = {},
				    	propKey = this.$element.data('control');

				    props[propKey] = value;

				     //proportional scaling
				    if(propKey === 'scaleX' && fpdInstance.currentElement && fpdInstance.currentElement.lockUniScaling) {
					    props.scaleY = value;
				    }

					//fix: text vanished when autoselected
				    if((propKey == 'scaleX' && value == 0) || (propKey == 'scaleY' && value == 0)) {
					    return;
				    }

				    fpdInstance.currentViewInstance.setElementParameters(
						props,
						fpdInstance.currentViewInstance.currentElement,
						saveUndo
					);

					this.$element.parent().siblings('.fpd-slider-number').val(value);
					saveUndo = false;

			    }

		    },
		    onSlideEnd: function(pos, value) {

			    if(this.$element.data('control') === 'scaleX' && fpdInstance.currentElement && fpdInstance.currentElement.lockUniScaling) {

					$uiElementToolbar.find('[data-control="scaleY"]').val(value)
					.filter('.fpd-slider-range').rangeslider('update', true, false);

				}

			    instance.isTransforming = false;
			    saveUndo = true;

		    }

		});

		//Button with mulitple options
		$uiElementToolbar.on('click', '.fpd-btn-options', function(evt) {

			evt.preventDefault();

			var $this = $(this),
				options = $this.data('options'),
				optionKeys = Object.keys(options),
				currentVal = fpdInstance.currentElement ? fpdInstance.currentElement[this.dataset.control] : optionKeys[0],
				nextOption = optionKeys.indexOf(currentVal) == optionKeys.length - 1 ? optionKeys[0] : optionKeys[optionKeys.indexOf(currentVal)+1],
				params = {};

			params[this.dataset.control] = nextOption;
			$this.children('span:first').removeClass().addClass(options[nextOption]);
			fpdInstance.currentViewInstance.setElementParameters(params);


		});

		$uiElementToolbar.find('.fpd-toggle').click(function() {

			var $this = $(this).toggleClass('fpd-enabled'),
				toggleParameters = {};

			//ignore curved text switcher
			if(!$this.hasClass('fpd-curved-text-switcher')) {

				toggleParameters[$this.data('control')] = $this.hasClass('fpd-enabled') ? $this.data('enabled') : $this.data('disabled');

				if($this.hasClass('fpd-tool-uniscaling-locker')) {
					_lockUniScaling($this.hasClass('fpd-enabled'));
				}

				fpdInstance.currentViewInstance.setElementParameters(toggleParameters);

			}

		});

		$uiElementToolbar.find('.fpd-number').change(function() {

			var $this = $(this),
				numberParameters = {};

			if( this.value > Number($this.attr('max')) ) {
				this.value = Number($this.attr('max'));
			}

			if( this.value < Number($this.attr('min')) ) {
				this.value = Number($this.attr('min'));
			}

			var value = Number(this.value);

			if($this.hasClass('fpd-slider-number')) {

				$this.siblings('.fpd-range-wrapper').children('input').val(this.value)
				.rangeslider('update', true, false);

				if($this.data('control') === 'scaleX' && fpdInstance.currentElement && fpdInstance.currentElement.lockUniScaling) {
					$uiElementToolbar.find('[data-control="scaleY"]').val(value).change();
				}

			}

			numberParameters[$this.data('control')] = value;

			if(subPanelResetted && fpdInstance.currentViewInstance && $(document.activeElement).is(':not(textarea)')) {

				fpdInstance.currentViewInstance.setElementParameters(
					numberParameters,
					fpdInstance.currentViewInstance.currentElement
				);

			}

		});


		//append fonts to dropdown
		if(fpdInstance.mainOptions.fonts && fpdInstance.mainOptions.fonts.length > 0) {

			var $fontsList =  $uiToolbarSub.find('.fpd-fonts-list');
			for(var i=0; i < fpdInstance.mainOptions.fonts.length; ++i) {

				var font = fpdInstance.mainOptions.fonts[i],
					fontName = font;

				if(typeof font == 'object') {
					fontName = font.name;
				}

				$('<span/>', {
					'class': 'fpd-item',
					'data-value': fontName,
					'html': fontName,
					'css': {'fontFamily': fontName}
				}).appendTo($fontsList);

			}

			$uiToolbarSub
			.on('keyup', '.fpd-panel-font-family input', function() {

				var $items = $(this).css('font-family', 'Helvetica').next('.fpd-scroll-area')
				.find('.fpd-fonts-list .fpd-item').hide();

				if(this.value.length === 0) {
					$items.show();
				}
				else {
					$items.filter(':containsCaseInsensitive("'+this.value+'")').show();
				}

			})
			.on('click', '.fpd-fonts-list .fpd-item', function() {

				var selectedFont = this.dataset.value;

				$uiElementToolbar
				.find('.fpd-fonts-list .fpd-item').removeClass('fpd-active')
				.filter('[data-value="'+selectedFont+'"]').addClass('fpd-active')

				fpdInstance.currentViewInstance.setElementParameters({fontFamily: selectedFont});

			});

		}

	    $uiToolbarSub.find('textarea[data-control="text"]')
	    .on('keyup', function(evt) {

		    evt.stopPropagation;
		    evt.preventDefault();

		    var selectionStart = this.selectionStart,
			 	selectionEnd = this.selectionEnd;

		    fpdInstance.currentViewInstance.setElementParameters( {text: this.value} );

		    this.selectionStart = selectionStart;
			this.selectionEnd = selectionEnd;

	    });

		//advanced editing: crop, filters, color manipulation
		$uiElementToolbar.find('.fpd-tool-advanced-editing').click(function() {

			if(fpdInstance.currentViewInstance && fpdInstance.currentViewInstance.currentElement && fpdInstance.currentViewInstance.currentElement.source) {

				var source = fpdInstance.currentViewInstance.currentElement.source,
					$modal = FPDUtil.showModal($(fpdInstance.translatedUI).children('.fpd-image-editor-container').clone(), true),
					imageEditor = new FPDImageEditor(
						$modal.find('.fpd-image-editor-container'),
						fpdInstance.currentViewInstance.currentElement,
						fpdInstance
					);

				imageEditor.loadImage(source);

			}

		});

		//Position Tools
		$uiToolbarSub.on('click', '.fpd-icon-button-group > span', function() {

			var $this = $(this);

			if($this.hasClass('fpd-align-left')) {
				fpdInstance.currentViewInstance.alignElement('left');
			}
			else if($this.hasClass('fpd-align-top')) {
				fpdInstance.currentViewInstance.alignElement('top');
			}
			else if($this.hasClass('fpd-align-right')) {
				fpdInstance.currentViewInstance.alignElement('right');
			}
			else if($this.hasClass('fpd-align-bottom')) {
				fpdInstance.currentViewInstance.alignElement('bottom');
			}
			else if($this.hasClass('fpd-align-center-h')) {
				fpdInstance.currentViewInstance.centerElement(true, false);
			}
			else if($this.hasClass('fpd-align-center-v')) {
				fpdInstance.currentViewInstance.centerElement(false, true);
			}
			else if($this.hasClass('fpd-flip-h')) {
				fpdInstance.currentViewInstance.setElementParameters({flipX: !fpdInstance.currentElement.get('flipX')});
			}
			else if($this.hasClass('fpd-flip-v')) {
				fpdInstance.currentViewInstance.setElementParameters({flipY: !fpdInstance.currentElement.get('flipY')});
			}

		});

		//move layer position
		$uiElementToolbar.find('.fpd-tool-layer-up, .fpd-tool-layer-down').click(function() {

			var currentZ = fpdInstance.currentViewInstance.getZIndex();

			currentZ = $(this).hasClass('fpd-tool-layer-up') ? currentZ+1 : currentZ-1;
			currentZ = currentZ < 0 ? 0 : currentZ;

			fpdInstance.currentViewInstance.setElementParameters( {z: currentZ} );

	    });

		//reset element
	    $uiElementToolbar.find('.fpd-tool-reset').click(function() {

		    $(document).unbind("click.spectrum"); //needs to be triggered, otherwise color is not resetted
			$uiElementToolbar.find('.tooltipstered').tooltipster('destroy');

			var originParams = fpdInstance.currentElement.originParams;
			delete originParams['clipPath'];

			//if element has bounding box, rescale for scale mode
			if(fpdInstance.currentElement.boundingBox) {
				fpdInstance.currentElement.scaleX = 1;
				originParams.boundingBox = fpdInstance.currentElement.boundingBox;
			}

		    fpdInstance.currentViewInstance.setElementParameters( fpdInstance.currentElement.originParams );
		    fpdInstance.currentViewInstance.deselectElement();

		});

		//duplicate element
	    $uiElementToolbar.find('.fpd-tool-duplicate').click(function() {

		    $(document).unbind("click.spectrum"); //needs to be triggered, otherwise color is not resetted
			$uiElementToolbar.find('.tooltipstered').tooltipster('destroy');

		    fpdInstance.currentViewInstance.duplicate();

		});

		//remove element
	    $uiElementToolbar.find('.fpd-tool-remove').click(function() {

		    $(document).unbind("click.spectrum"); //needs to be triggered, otherwise color is not resetted
			$uiElementToolbar.find('.tooltipstered').tooltipster('destroy');

		    fpdInstance.currentViewInstance.removeElement(fpdInstance.currentViewInstance.currentElement);

		});

		fpdInstance.$container.on('elementModify', function(evt, element, parameters) {

			if(parameters.fontSize) {
				$uiElementToolbar.find('.fpd-tool-text-size > .fpd-current-val')
				.text(parseInt (parameters.fontSize));
			}

		});

		FPDUtil.updateTooltip($uiElementToolbar);

	};

	var _createScrollbar = function($target) {

		$target
		.mCustomScrollbar("destroy")
		.mCustomScrollbar({
			axis: fpdInstance.$container.hasClass('fpd-device-desktop') ? 'y' : 'x',
			scrollInertia: 200,
			documentTouchScroll: false,
			contentTouchScroll: true,
			mouseWheel: {
				enable: true,
				preventDefault: true
			},
			advanced:{
	        	autoExpandHorizontalScroll: true
	      	}
		});

	};

	var _toggleNavItem = function(tool, showHide, fields) {

		showHide = showHide === undefined ? true : showHide;

		var $tools = $uiElementToolbar.find('.fpd-tools-nav > .fpd-tool-'+tool);

		if(fields) {
			$tools = $tools.filter('[data-fields="'+fields+'"]');
		}

		return $tools.toggleClass('fpd-hidden', !showHide);

	};

	var _togglePanelTool = function(panel, tool, showHide) {

		showHide = Boolean(showHide);

		return $uiToolbarSub.children('.fpd-panel-'+panel)
		.find('.fpd-tool-'+tool).toggleClass('fpd-hidden', !showHide)
		.find('[class^="fpd-tool-"],div[class*=" fpd-tool-"]')
		.toggleClass('fpd-hidden', !showHide)

	};

	var _togglePanelTab = function(panel, tab, showHide) {

		$uiToolbarSub.children('.fpd-panel-'+panel)
		.find('.fpd-panel-tabs [data-tab="'+tab+'"]')
		.toggleClass('fpd-disabled', !showHide);

	};

	var _setElementColor = function(color) {

		$uiElementToolbar.find('.fpd-current-fill').css('background', color);
		fpdInstance.currentViewInstance.changeColor(fpdInstance.currentViewInstance.currentElement, color);

	};

	var _lockUniScaling = function(toggle) {

		 $uiToolbarSub.find('.fpd-tool-uniscaling-locker > span').removeClass()
		 .addClass(toggle ? 'fpd-icon-locked' : 'fpd-icon-unlocked');

		 $uiToolbarSub.find('.fpd-tool-scaleY').toggleClass('fpd-disabled', toggle);

	};

	this.update = function(element) {

		this.hideTools();
		$uiElementToolbar.removeClass('fpd-type-image');

		var source = element.source,
			allowedImageTypes = [
				'png',
				'jpg',
				'jpeg',
				'svg'
			];

		if(source) {
			source = source.split('?')[0];//remove all url parameters
			var imageParts = source.split('.'),
				sourceExt = imageParts.pop().toLowerCase();

		}

		//COLOR: colors array, true=svg colorization
		if(FPDUtil.elementHasColorSelection(element)) {

			_toggleNavItem('color');
			_togglePanelTab('color', 'fill', true);
			$colorPicker.removeClass('fpd-hidden');

		}

		if((FPDUtil.isSVG(element) || FPDUtil.getType(element.type) === 'text') && element.patterns && element.patterns.length) {

			_toggleNavItem('color');

			_togglePanelTab('color', 'fill', true);
			_togglePanelTool('color', 'patterns', true);

		}
		else {
			_togglePanelTool('color', 'patterns', false);
		}

		//TRANSFORM
		var showScale = Boolean((element.resizable && FPDUtil.getType(element.type) === 'image') || element.uniScalingUnlockable || element.__editorMode);

		if(showScale || element.rotatable || element.draggable || element.zChangeable || element.__editorMode) {

			_toggleNavItem('transform');
			_toggleNavItem('layer-depth', Boolean(element.zChangeable || element.__editorMode));

			if(!fpdInstance.$container.hasClass('fpd-device-desktop')) {
				_toggleNavItem('transform', element.rotatable || showScale, 'transform');
			}

			_togglePanelTool('transform', 'scale', showScale);
			_lockUniScaling(element.lockUniScaling);
			_togglePanelTool('transform', 'uniscaling-locker', Boolean(element.uniScalingUnlockable || element.__editorMode));
			_togglePanelTool('transform', 'angle', Boolean(element.rotatable || element.__editorMode));
			_togglePanelTool('transform', 'position', Boolean(element.draggable || element.__editorMode));
			_togglePanelTool('transform', 'flip', Boolean(element.draggable || element.__editorMode));
			_togglePanelTool('transform', 'layer-depth', Boolean(element.zChangeable || element.__editorMode));

		}

		//EDIT TEXT
		if(FPDUtil.getType(element.type) === 'text' && (element.editable || element.__editorMode)) {

			_toggleNavItem('edit-text');
			_toggleNavItem('font-family');
			_toggleNavItem('text-bold');
			_toggleNavItem('text-italic');
			_toggleNavItem('text-underline');
			_toggleNavItem('text-align');
			_toggleNavItem('text-transform');

			_togglePanelTool('edit-text', 'text-styles', true);
			_togglePanelTool('edit-text', 'text-size', Boolean(element.resizable || element.__editorMode));
			_togglePanelTool('edit-text', 'line-height', Boolean(element.resizable || element.__editorMode));
			_togglePanelTool('edit-text', 'letter-spacing', Boolean(element.resizable || element.__editorMode));

			_togglePanelTab('color', 'stroke', true);
			_togglePanelTab('color', 'shadow', true);

			if(element.curvable && !element.textBox) {
				_toggleNavItem('curved-text');
			}

			$uiElementToolbar.find('textarea[data-control="text"]').val(element.get('text'));

			_toggleNavItem('edit-text', !element.textPlaceholder && !element.numberPlaceholder);

		}
		else {
			$uiElementToolbar.addClass('fpd-type-image');
		}

		//ADVANCED EDITING
		if(element.advancedEditing && source &&
			(FPDUtil.isSVG(element) || $.inArray(sourceExt, allowedImageTypes) !== -1 || sourceExt.search(/data:image\/(jpeg|png);/) !== -1)) {
			_toggleNavItem('advanced-editing');
		}

		_toggleNavItem('reset');
		_toggleNavItem('duplicate', element.copyable);
		_toggleNavItem('remove', element.removable);

		//display only enabled tabs and when tabs length > 1
		$uiToolbarSub.find('.fpd-panel-tabs').each(function(index, panelTabs) {

			var $panelTabs = $(panelTabs);
			$panelTabs.toggleClass('fpd-hidden', $panelTabs.children(':not(.fpd-disabled)').length <= 1);
			$panelTabs.children(':not(.fpd-disabled):first').addClass('fpd-active').click();

		});

		//set UI value by selected element
		$uiElementToolbar.find('[data-control]').each(function(index, uiElement) {

			var $uiElement = $(uiElement),
				parameter = $uiElement.data('control');

			if($uiElement.hasClass('fpd-number')) {

				if(element[parameter] !== undefined) {

					var numVal = $uiElement.attr('step') && $uiElement.attr('step').length > 1 ? parseFloat(element[parameter]).toFixed(2) : parseInt(element[parameter]);
					$uiElement.val(numVal);

					if($uiElement.prev('.fpd-range-wrapper')) {

						if(parameter == 'fontSize') {
							$uiElement.prev('.fpd-range-wrapper').children('input')
							.attr('min', element.minFontSize)
							.attr('max', element.maxFontSize);
						}
						else if(parameter == 'scaleX' || parameter == 'scaleY') {
							$uiElement.prev('.fpd-range-wrapper').children('input')
							.attr('min', element.minScaleLimit)
						}

						$uiElement.prev('.fpd-range-wrapper').children('input').val(numVal)
						.rangeslider('update', true, false);

					}

				}

			}
			else if($uiElement.hasClass('fpd-toggle')) {

				$uiElement.toggleClass('fpd-enabled', element[parameter] === $uiElement.data('enabled'));

			}
			else if($uiElement.hasClass('fpd-btn-options')) {

				$uiElement.children('span:first').removeClass()
				.addClass($uiElement.data('options')[element[parameter]]);

			}
			else if(parameter == 'fontSize') {
				$uiElementToolbar.find('.fpd-tool-text-size > .fpd-current-val').text(parseInt(element[parameter]));
			}
			else if(parameter == 'fontFamily') {

				if(element[parameter] !== undefined) {

					$uiElementToolbar
					.find('.fpd-fonts-list .fpd-item').removeClass('fpd-active')
					.filter('[data-value="'+element[parameter]+'"]').addClass('fpd-active')

				}

			}

			var currentFill = FPDUtil.getBgCssFromElement(element);
			if(currentFill) {

				$uiElementToolbar.find('.fpd-current-fill').css('background', currentFill);

			}


		});

		//select first visible nav item
		if(fpdInstance.$container.hasClass('fpd-device-desktop')) {
			$uiElementToolbar.find('.fpd-tools-nav > [data-panel]:not(.fpd-hidden):first').click();
		}
		else {
			instance.toggle(true, false)
		}

		$uiElementToolbar.children('.fpd-scroll-area').scrollTop(0);
		$uiElementToolbar.children('.fpd-scroll-area').scrollLeft(0);


	};

	this.updateUIValue = function(tool, value) {

		var $UIController = $uiElementToolbar.find('[data-control="'+tool+'"]');

		$UIController.val(value);
		$UIController.filter('.fpd-slider-range').rangeslider('update', true, false);

	};

	this.hideTools = function() {

		$uiElementToolbar
		.removeClass('fpd-panel-visible')
		.find('.fpd-tools-nav > div')
		.addClass('fpd-hidden').removeClass('fpd-active'); //hide tool in row

		$uiToolbarSub
		.children().removeClass('fpd-active')//hide all sub panels in sub toolbar
		.find('.fpd-panel-tabs > span').addClass('fpd-disabled').removeClass('fpd-hidden') //disable all tabs

		//remove active tabs
		$uiToolbarSub.find('.fpd-panel-tabs-content, .fpd-panel-tabs').children().removeClass('fpd-active')

		$colorPicker.addClass('fpd-hidden');
        
	};

	this.updatePosition = function(element, showHide) {

	};

	this.toggle = function(showHide, reset) {
        
		showHide = showHide === undefined ? true : showHide;
		reset = reset === undefined ? true : reset;

		if(!showHide && reset) {
			$colorPicker.spectrum('destroy');
		}

		$uiElementToolbar.toggleClass('fpd-show', showHide);
        $('body,html').toggleClass('fpd-toolbar-visible', showHide);

	};

	this.setPlacement = function(placement) {

		instance.placement = placement;

		if(placement == 'body') {
			$uiElementToolbar.appendTo(fpdInstance.mainOptions.toolbarDynamicContext);
		}
		else {
			$uiElementToolbar.appendTo(fpdInstance.mainBar.$container);
		}

	};

	_initialize();

};
var FPDToolbarSmart = function($uiElementToolbar, fpdInstance) {

	'use strict';

	$ = jQuery;

	var instance = this,
		$body = $('body'),
		$uiToolbarSub = $uiElementToolbar.children('.fpd-sub-panel'),
		$colorPicker = $uiElementToolbar.find('.fpd-color-wrapper'),
		$window = $(window),
		colorDragging = false,
		resetScroll = true;

	this.isTransforming = false; //is true, while transforming via slider
	this.placement = fpdInstance.mainOptions.toolbarPlacement;

	var _initialize = function() {

		$uiElementToolbar.data('instance', instance).addClass('fpd-theme-'+fpdInstance.mainOptions.toolbarTheme);

		instance.setPlacement(fpdInstance.mainOptions.toolbarPlacement);

		//disable page scroll for touch devices
		if($uiElementToolbar.length > 0) {
			$uiElementToolbar.get(0).addEventListener('touchmove', function(evt) {

				if(evt.target.dataset.control !== 'text') {
					evt.preventDefault();
				}

			}, false);
		}

		$uiElementToolbar.children('.fpd-scroll-area').mCustomScrollbar({
			axis: 'x',
			scrollInertia: 200,
			mouseWheel: {
				enable: true
			},
			advanced:{
	        	autoExpandHorizontalScroll:true
	      	}
		});

		$body.on('mousedown touchstart', function(evt) {

			if($(evt.target).parents('.fpd-range-slider').length > 0) {
				instance.isTransforming = true;
			}

		})
		.on('mouseup touchend', function() {
			instance.isTransforming = false;
		});

		//close toolbar
		$uiElementToolbar.on('click touchend', '.fpd-close-panel', function(evt) {

			evt.stopPropagation();
			evt.preventDefault();

			$uiElementToolbar.find('.fpd-panel-font-family input').val('').keyup();
			$colorPicker.children('input').spectrum('hide');

			$uiToolbarSub.hide();

			if(fpdInstance.currentElement && fpdInstance.currentElement.exitEditing === 'function') {
				fpdInstance.currentElement.exitEditing();
			}

			fpdInstance.$container.trigger('toolbarPanelClose');

		});

		//set max values
		var maxValuesKeys = Object.keys(fpdInstance.mainOptions.maxValues);
		for(var i=0; i < maxValuesKeys.length; ++i) {

			var maxValueProp = maxValuesKeys[i];
			$uiElementToolbar.find('[data-control="'+maxValueProp+'"]').attr('max', fpdInstance.mainOptions.maxValues[maxValueProp]);

		}

		//first-level tools
		$uiElementToolbar.find('[class^="fpd-tool-"]').click(function() {

			var $this = $(this);

			if($this.data('panel')) { //has a sub a panel

				$this.tooltipster('hide');

				$uiToolbarSub.show() //display sub wrapper, if opener is active
				.children().removeClass('fpd-active') //hide all panels in sub wrapper
				.filter('.fpd-panel-'+$this.data('panel')).addClass('fpd-active'); //display related panel

				$uiToolbarSub.find('.fpd-slider-range').rangeslider('update', false, false);

				var element = fpdInstance.currentElement;

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

									$uiElementToolbar.find('.fpd-tool-color').css('background', color.toHexString());

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

							FPDUtil.updateTooltip();
							$colorPicker.children('.fpd-scroll-area').mCustomScrollbar({
								scrollInertia: 200,
								documentTouchScroll: false,
								contentTouchScroll: true,
								mouseWheel: {
									enable: true,
									preventDefault: true
								},
							});

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
								$uiElementToolbar.find('.fpd-tool-color').css('background', 'url('+patternUrl+')');
								fpdInstance.currentViewInstance.setElementParameters( {pattern: patternUrl} );


							});

						}

						$uiToolbarSub.find('.fpd-tool-patterns .fpd-scroll-area').mCustomScrollbar({
							scrollInertia: 200,
							documentTouchScroll: false,
							contentTouchScroll: true,
							mouseWheel: {
								enable: true,
								preventDefault: true
							},
						});

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

				$uiElementToolbar.find('.fpd-panel-font-family .fpd-fonts-list').mCustomScrollbar({
					axis: 'y',
					scrollInertia: 200,
					documentTouchScroll: false,
					contentTouchScroll: true,
					mouseWheel: {
						enable: true,
						preventDefault: true
					},
					advanced:{
			        	autoExpandHorizontalScroll:true
			      	}
				});

				instance.updatePosition(fpdInstance.currentElement);

				fpdInstance.$container.trigger('toolbarPanelOpen', [$this.data('panel')]);

			}

		});

		//call content in tab
		$uiToolbarSub.find('.fpd-panel-tabs > span').click(function() {

			var $this = $(this);

			$this.addClass('fpd-active').siblings().removeClass('fpd-active');
			var $activePanel = $this.parent().siblings('.fpd-panel-tabs-content').children('[data-id="'+this.dataset.tab+'"]').addClass('fpd-active')

			$activePanel.siblings().removeClass('fpd-active');
			$activePanel.find('.fpd-slider-range').rangeslider('update', true, false);

			instance.updatePosition(fpdInstance.currentElement);

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

			    if(fpdInstance.currentViewInstance && fpdInstance.currentViewInstance.currentElement) {

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
			$this.children('span').removeClass().addClass(options[nextOption]);
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

			if(fpdInstance.currentViewInstance && $(document.activeElement).is(':not(textarea)')) {

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

			$uiElementToolbar
			.on('keyup', '.fpd-panel-font-family input', function() {

				var $items = $(this).css('font-family', 'Helvetica').nextAll('.fpd-fonts-list')
				.find('.fpd-item').hide();

				if(this.value.length === 0) {
					$items.show();
				}
				else {
					$items.filter(':containsCaseInsensitive("'+this.value+'")').show();
				}

			})
			.on('click', '.fpd-fonts-list .fpd-item', function() {

				var selectedFont = this.dataset.value;

				$uiElementToolbar.find('.fpd-tool-font-family .fpd-current-val').text(selectedFont).css('fontFamily', selectedFont);
				fpdInstance.currentViewInstance.setElementParameters({fontFamily: selectedFont});

			});

		}

		//Edit Text Tools
		$uiElementToolbar.on('click', '.fpd-tool-edit-text', function() {

			var val = $uiToolbarSub.find('.fpd-panel-edit-text textarea').val();
			$uiToolbarSub.find('.fpd-panel-edit-text textarea').focus().val('').val(val);

		});

	    $uiElementToolbar.find('textarea[data-control="text"]')
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
		$uiToolbarSub.on('click', '.fpd-panel-position.fpd-icon-button-group > span', function() {

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

			instance.updatePosition(fpdInstance.currentElement);

		});

		//move layer position
		$uiElementToolbar.find('.fpd-tool-move-up, .fpd-tool-move-down').click(function() {

			var currentZ = fpdInstance.currentViewInstance.getZIndex();

			currentZ = $(this).hasClass('fpd-tool-move-up') ? currentZ+1 : currentZ-1;
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

			FPDUtil.updateTooltip();

		});

		fpdInstance.$container.on('elementModify', function(evt, element, parameters) {

			if(parameters.fontSize) {
				$uiElementToolbar.find('.fpd-tool-text-size > .fpd-current-val').text(parseInt (parameters.fontSize));
			}

		});

	};

	var _toggleUiTool = function(tool, showHide) {

		showHide = showHide === undefined ? true : showHide;
		return $uiElementToolbar.find('.fpd-tool-'+tool).toggleClass('fpd-hidden', !showHide);

	};

	var _toggleSubTool = function(panel, tool, showHide) {

		showHide = Boolean(showHide);

		return $uiToolbarSub.children('.fpd-panel-'+panel)
		.children('.fpd-tool-'+tool).toggleClass('fpd-hidden', !showHide);

	};

	var _togglePanelTab = function(panel, tab, showHide) {

		$uiToolbarSub.children('.fpd-panel-'+panel)
		.find('.fpd-panel-tabs [data-tab="'+tab+'"]').toggleClass('fpd-disabled', !showHide);

	};

	var _setElementColor = function(color) {

		$uiElementToolbar.find('.fpd-tool-color').css('background', color);
		fpdInstance.currentViewInstance.changeColor(fpdInstance.currentViewInstance.currentElement, color);

	};

	var _lockUniScaling = function(toggle) {

		 $uiToolbarSub.find('.fpd-tool-uniscaling-locker > span').removeClass().addClass(toggle ? 'fpd-icon-locked' : 'fpd-icon-unlocked');
		 $uiToolbarSub.find('.fpd-tool-scaleY').toggleClass('fpd-disabled', toggle);

	};

	this.update = function(element) {

		this.hideTools();
		$uiElementToolbar.removeClass('fpd-type-image');

		_toggleUiTool('reset');

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

		if(element.advancedEditing && source &&
			(FPDUtil.isSVG(element) || $.inArray(sourceExt, allowedImageTypes) !== -1 || sourceExt.search(/data:image\/(jpeg|png);/) !== -1)) {
			_toggleUiTool('advanced-editing');
		}

		//colors array, true=svg colorization
		if(FPDUtil.elementHasColorSelection(element)) {

			_toggleUiTool('color');
			_togglePanelTab('color', 'fill', true);
			$colorPicker.removeClass('fpd-hidden');

		}

		var showScale = (element.resizable && FPDUtil.getType(element.type) === 'image') || element.uniScalingUnlockable || element.__editorMode;
		if(showScale || element.rotatable || element.__editorMode) {
			_toggleUiTool('transform');

			_toggleSubTool('transform', 'scale', showScale);
			//uni scaling tools
			_lockUniScaling(element.lockUniScaling);
			_toggleSubTool('transform', 'uniscaling-locker', (element.uniScalingUnlockable || element.__editorMode));
			_toggleSubTool('transform', 'angle', Boolean(element.rotatable || element.__editorMode));
		}

		if(element.draggable || element.__editorMode) {
			_toggleUiTool('position');
		}

		if(element.zChangeable || element.__editorMode) {
			_toggleUiTool('layer-depth');
		}


		if((FPDUtil.isSVG(element) || FPDUtil.getType(element.type) === 'text') && element.patterns && element.patterns.length) {

			_toggleUiTool('color');
			_togglePanelTab('color', 'fill', true);
			_toggleUiTool('patterns', true);

		}
		else {
			_toggleUiTool('patterns', false);
		}

		//text options
		if(FPDUtil.getType(element.type) === 'text' && (element.editable || element.__editorMode)) {

			_toggleUiTool('font-family');
			_toggleUiTool('text-size', Boolean(element.resizable || element.__editorMode));
			_toggleUiTool('text-line-height');
			_toggleUiTool('text-letter-spacing');
			_toggleUiTool('text-styles');
			_toggleUiTool('text-transform');
			_toggleUiTool('text-align');
			_togglePanelTab('color', 'stroke', true);
			_togglePanelTab('color', 'shadow', true);

			if(element.curvable && !element.textBox) {
				_toggleUiTool('curved-text');
			}

			$uiElementToolbar.find('textarea[data-control="text"]').val(element.get('text'));

			if(fpdInstance.mainOptions.toolbarPlacement == 'smart' && fpdInstance.mainOptions.toolbarTextareaPosition == 'top') {
				$uiElementToolbar.children('.fpd-panel-edit-text').toggleClass('fpd-hidden', element.textPlaceholder || element.numberPlaceholder);

			}
			else {
				//hide edit-text when element is used as placeholder for numbers&names
				_toggleUiTool('edit-text', !element.textPlaceholder && !element.numberPlaceholder);
			}

		}
		else {
			$uiElementToolbar.addClass('fpd-type-image');
		}

		//add no margin to last visible tool
		$uiElementToolbar.find('.fpd-top-tools, .fpd-bottom-tools')
		.children('div').removeClass('fpd-no-margin').filter(':visible:last').addClass('fpd-no-margin');

		//display only enabled tabs and when tabs length > 1
		$uiToolbarSub.find('.fpd-panel-tabs').each(function(index, panelTabs) {

			var $panelTabs = $(panelTabs);
			$panelTabs.toggle($panelTabs.children(':not(.fpd-disabled)').length > 1);
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

				$uiElement.children('span').removeClass()
				.addClass($uiElement.data('options')[element[parameter]]);

			}
			else if($uiElement.hasClass('fpd-tool-color')) {

				$uiElement.css('background', FPDUtil.getBgCssFromElement(element));

			}
			else if(parameter == 'fontSize') {
				$uiElementToolbar.find('.fpd-tool-text-size > .fpd-current-val').text(parseInt(element[parameter]));
			}
			else if(parameter == 'fontFamily') {

				if(element[parameter] !== undefined) {
					$uiElementToolbar.find('.fpd-tool-font-family > .fpd-current-val').text(element[parameter])
					.css('font-family', element[parameter]);
				}

			}

		});

		$uiElementToolbar.children('.fpd-scroll-area').mCustomScrollbar('update');

		instance.updatePosition(element);

	};

	this.updateUIValue = function(tool, value) {

		var $UIController = $uiElementToolbar.find('[data-control="'+tool+'"]');

		$UIController.val(value);
		$UIController.filter('.fpd-slider-range').rangeslider('update', true, false);

	};

	this.hideTools = function() {

		$uiElementToolbar //hide row
		.find('.fpd-top-tools > div, .fpd-bottom-tools > div')
		.addClass('fpd-hidden').removeClass('fpd-active'); //hide tool in row

		$uiToolbarSub.hide() //hide sub toolbar
		.children().removeClass('fpd-active')//hide all sub panels in sub toolbar
		.find('.fpd-panel-tabs > span').addClass('fpd-disabled'); //disable all tabs

		//remove active tabs
		$uiToolbarSub.find('.fpd-panel-tabs-content, .fpd-panel-tabs').children().removeClass('fpd-active')

		$colorPicker.addClass('fpd-hidden');
		//$uiElementToolbar.find('.fpd-close-panel').click();

		//top textarea
		$uiElementToolbar.children('.fpd-panel-edit-text').addClass('fpd-hidden');

	};

	this.updatePosition = function(element, showHide) {

		showHide = typeof showHide === 'undefined' ? true : showHide;

		if(!element) {
			this.toggle(false);
			return;
		}

		var oCoords = element.oCoords,
			topOffset = oCoords.mb.y,
			designerOffset = fpdInstance.$productStage.offset();

		var elemBoundingRect = element.getBoundingRect(),
			designerTop = fpdInstance.mainOptions.modalMode ? parseInt(fpdInstance.$container.parents('.fpd-modal-product-designer:first > .fpd-modal-wrapper').css("padding-top")) : designerOffset.top,
			lowestY = elemBoundingRect.top + elemBoundingRect.height, //set always to lowest point of element (consider angle)
			offsetY = element.padding + element.cornerSize + designerTop; //position under element

		topOffset = lowestY + offsetY; //position above canvas

		//LIMITS
		topOffset = topOffset > fpdInstance.$productStage.height() + designerTop ? fpdInstance.$productStage.height() + designerTop + 5 : topOffset;//do not move under designer
		var viewportH = fpdInstance.mainOptions.modalMode ? fpdInstance.$container.parents('.fpd-modal-product-designer:first > .fpd-modal-wrapper')[0].scrollHeight : document.body.scrollHeight;

		topOffset = topOffset + $uiElementToolbar.children('.fpd-sub-panel').height() > viewportH ? designerTop + elemBoundingRect.top -  ($uiElementToolbar.children('.fpd-sub-panel').height() + element.padding + element.cornerSize): topOffset; //do not move outside of viewport

		var posLeft = designerOffset.left + oCoords.mb.x,
			halfWidth =  $uiElementToolbar.outerWidth() * .5;

		posLeft = posLeft < halfWidth ? halfWidth : posLeft; //move toolbar not left outside of document
		posLeft = posLeft > $(window).width() - halfWidth ? $(window).width() - halfWidth : posLeft; //move toolbar not right outside of document

		$uiElementToolbar.css({
			left: posLeft,
			top: topOffset
		});

		if(resetScroll && fpdInstance.mainOptions.toolbarPlacement == 'smart' && !fpdInstance.mainOptions.modalMode && FPDUtil.isMobile()) {

			setTimeout(function() {

				if($uiElementToolbar.offset().top < topOffset) {
					$(window).scrollTop($(document).scrollTop() + (topOffset - $uiElementToolbar.offset().top));
				}

				resetScroll = true;

			}, 500);

			resetScroll = false;

		}

		this.toggle(showHide, false);

	};

	this.toggle = function(showHide, reset) {
        
		reset = reset === undefined ? true : reset;

		if(!showHide && reset) {
			$colorPicker.spectrum('destroy');
		}

		showHide = $uiElementToolbar.find('.fpd-top-tools > div:visible, .fpd-bottom-tools > div:visible').length == 0 ? false : showHide;
		$uiElementToolbar.toggleClass('fpd-show', showHide);
        $('body,html').toggleClass('fpd-toolbar-visible', showHide);

	};

	this.setPlacement = function(placement) {

		instance.placement = placement;

		//remove fpd-toolbar-placement-* class
		$uiElementToolbar.removeClass (function (index, css) {
		    return (css.match (/(^|\s)fpd-toolbar-placement-\S+/g) || []).join(' ');
		});
		$uiElementToolbar.addClass('fpd-toolbar-placement-'+placement);

		if(['inside-bottom', 'inside-top'].indexOf(placement) !== -1) { //inside canvas

			$uiElementToolbar.appendTo(fpdInstance.$mainWrapper);
			$uiElementToolbar.children('.fpd-scroll-area').mCustomScrollbar('disable');

		}
		else {

			if(fpdInstance.$container.parents('.fpd-modal-product-designer').length > 0 && !fpdInstance.$container.hasClass('fpd-device-smartphone')) {
				$uiElementToolbar.appendTo(fpdInstance.$container.parents('.fpd-modal-product-designer:first > .fpd-modal-wrapper'));
			}
			else {
				$uiElementToolbar.appendTo(fpdInstance.mainOptions.toolbarDynamicContext);
			}

			$uiElementToolbar.children('.fpd-scroll-area').mCustomScrollbar('update');

		}

	};

	_initialize();

};
import {FPDUtil} from '../Util.js'
export const FPDTextLayersModule = {

	createList : function(fpdInstance, $container) {

		var $currentColorList,
			colorDragging = false;

		$container.off();

		//append a list item to the layers list
		var _appendLayerItem = function(element) {

			var $colorHtml = '';
			if(FPDUtil.elementHasColorSelection(element)) {

				var availableColors = FPDUtil.elementAvailableColors(element, fpdInstance),
					currentColor = '';

				if(availableColors.length > 1) {

					$colorHtml = $('<div class="fpd-color-palette fpd-grid"></div>');

					for(var i=0; i < availableColors.length; ++i) {

						var tooltipTitle = fpdInstance.mainOptions.hexNames[availableColors[i].replace('#', '').toLowerCase()];
							tooltipTitle = tooltipTitle ? tooltipTitle : availableColors[i];

						var item = '<div class="fpd-item fpd-tooltip" title="'+tooltipTitle+'" style="background-color: '+availableColors[i]+'" data-color="'+availableColors[i]+'"></div>';

						$colorHtml.append(item);
					}

					if($.isArray(element.patterns) && (FPDUtil.isSVG(element) || FPDUtil.getType(element.type) === 'text')) {

						element.patterns.forEach(function(pattern) {

							var patternTitle = pattern.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "").replace('_', ' '),
								patternLabel = '<div class="fpd-label">'+patternTitle+'</div>';

							$colorHtml.append('<div data-pattern="'+pattern+'" style="background-image: url('+pattern+')" class="fpd-item fpd-tooltip fpd-pattern" title="'+patternTitle+'"></div>');

						})

					}

				}
				else {
					currentColor = element.fill ? element.fill : availableColors[0];
					$colorHtml = $('<div class="fpd-color-picker"><input class="fpd-current-color" type="text" value="'+currentColor+'" /></div>');
				}

			}

			var textContent = element.maxLines === 1 ? '<input type="text" value="'+element.text+'">' : '<textarea>'+element.text+'</textarea>';

			$container.find('.fpd-list').append('<div class="fpd-text-layer-item" id="'+element.id+'"><div class="fpd-title">'+element.title+'</div><div class="fpd-text-layer-content">'+textContent+'<span class="fpd-text-layer-clear">'+fpdInstance.getTranslation('modules', 'text_layers_clear')+'</span></div><div class="fpd-text-layer-meta"></div></div>');

			var $lastItem = $container.find('.fpd-text-layer-item:last').data('element', element).data('colors', availableColors),
				availableFonts = $.isArray(fpdInstance.mainOptions.fonts) ? fpdInstance.mainOptions.fonts : [];

			$lastItem.find('.fpd-text-layer-meta').append('<div class="fpd-text-layer-styles"></div>');

			if(availableFonts.length > 0) {

				$lastItem.find('.fpd-text-layer-styles').append('<div class="fpd-text-layer-font-family fpd-dropdown fpd-search"><input type="text" class="fpd-dropdown-current" value="'+element.fontFamily+'" style="font-family: '+element.fontFamily+'"><div class="fpd-dropdown-arrow"><span class="fpd-icon-arrow-dropdown"></span></div><div class="fpd-dropdown-list"><div class="fpd-scroll-area"></div></div></div>');

				availableFonts.forEach(function(fontObj, i) {

					if(typeof fontObj == 'object') {
						fontObj = fontObj.name;
					}

					$('<span/>', {
						'class': 'fpd-item',
						'data-value': fontObj,
						'html': fontObj,
						'css': {'fontFamily': fontObj},
					}).appendTo($lastItem.find('.fpd-text-layer-font-family .fpd-scroll-area'));

				});

			}

			if(element.resizable || element.__editorMode) {

				$lastItem.find('.fpd-text-layer-styles').append('<input type="number" class="fpd-text-layer-font-size fpd-tooltip" title="'+fpdInstance.getTranslation('toolbar', 'font_size')+'" value="'+element.fontSize+'" min="'+element.minFontSize+'" max="'+element.maxFontSize+'" />');

			}

			$lastItem.find('.fpd-text-layer-meta').append($colorHtml);

			FPDUtil.updateTooltip($lastItem);

		};

		//destroy all color pickers and empty list
		$container.find('.fpd-current-color').spectrum('destroy');
		$container.find('.fpd-list').empty();

		fpdInstance.getElements(fpdInstance.currentViewIndex).forEach(function(element) {

			if(FPDUtil.elementIsEditable(element) && FPDUtil.getType(element.type) === 'text') {
				_appendLayerItem(element);
			}

		});

		FPDUtil.createScrollbar($container.find('.fpd-text-layers-panel .fpd-scroll-area'));

		//Color Picker
		$container.find('input.fpd-current-color').spectrum('destroy').spectrum({
			flat: false,
			preferredFormat: "hex",
			showInput: true,
			showInitial: true,
			showPalette: fpdInstance.mainOptions.colorPickerPalette && fpdInstance.mainOptions.colorPickerPalette.length > 0,
			palette: fpdInstance.mainOptions.colorPickerPalette,
			showButtons: false,
			show: function(color) {

				FPDUtil.spectrumColorNames($(this).spectrum('container'), fpdInstance);

				var element = $(this).parents('.fpd-text-layer-item:first').data('element');
				element._tempFill = color.toHexString();

			},
			move: function(color) {

				var element = $(this).parents('.fpd-text-layer-item:first').data('element');
				//only non-png images are chaning while dragging
				if(colorDragging === false || FPDUtil.elementIsColorizable(element) !== 'png') {
					fpdInstance.currentViewInstance.changeColor(element, color.toHexString());
				}

			},
			change: function(color) {

				$(document).unbind("click.spectrum"); //fix, otherwise change is fired on every click
				var element = $(this).parents('.fpd-text-layer-item:first').data('element');
				fpdInstance.currentViewInstance.setElementParameters({fill: color.toHexString()}, element);

			}
		})
		.on('beforeShow.spectrum', function(e, tinycolor) {
			if($currentColorList) {
				$currentColorList.remove();
				$currentColorList = null;
			}
		})
		.on('dragstart.spectrum', function() {
			colorDragging = true;
		})
		.on('dragstop.spectrum', function(evt, color) {
			colorDragging = false;
			var element = $(this).parents('.fpd-text-layer-item:first').data('element');
			fpdInstance.currentViewInstance.changeColor(element, color.toHexString());
		});

		//select color from color palette
		$container.on('click', '.fpd-color-palette .fpd-item', function(evt) {

			evt.stopPropagation();

			var $this = $(this),
				element = $this.parents('.fpd-text-layer-item').data('element'),
				fill = $this.data('pattern') ? $this.data('pattern') : $this.data('color'),
				paramsObj = $this.data('pattern') ? {pattern: fill} : {fill: fill};

			fpdInstance.deselectElement();
			fpdInstance.currentViewInstance.setElementParameters(paramsObj, element);

		});

		$container.on('click', '.fpd-text-layer-clear', function(evt) {

			evt.stopPropagation();

			var $this = $(this),
				$layerItem = $this.parents('.fpd-text-layer-item'),
				element = $layerItem.data('element');

			fpdInstance.currentViewInstance.setElementParameters({text: ''}, element);
			$layerItem.find('.fpd-text-layer-content > *').val('');

		});

		$container
		.on('keyup', 'textarea, .fpd-text-layer-content input[type="text"]',function(evt) {

			evt.stopPropagation();

			var $this = $(this),
				element = $this.parents('.fpd-text-layer-item').data('element'),
                maxLength = element.maxLength,
                maxLines = element.maxLines;
                            
            this.value = this.value.replace(FPDDisallowChars, '');
            
			//remove emojis
			if(fpdInstance.mainOptions.disableTextEmojis) {
				this.value = this.value.replace(FPDEmojisRegex, '');
				this.value = this.value.replace(String.fromCharCode(65039), ""); //fix: some emojis left a symbol with char code 65039
			}
            
            if(maxLength != 0 && this.value.length > maxLength) {
                this.value = this.value.substr(0, maxLength);
            }
            
            if(maxLines != 0 && this.value.split("\n").length > maxLines) {
                this.value = this.value.replace(/([\s\S]*)\n/, "$1");
            }

			fpdInstance.currentViewInstance.setElementParameters({text: this.value}, element);

		})
		.on('change', '.fpd-text-layer-font-size', function() {

			var $this = $(this),
				element = $this.parents('.fpd-text-layer-item').data('element');

			fpdInstance.currentViewInstance.setElementParameters({fontSize: parseInt(this.value)}, element);

			this.value = element.fontSize;

		})
		.on('click', '.fpd-text-layer-font-family.fpd-dropdown', function() {
			$(this).toggleClass('fpd-active');
		})
		.on('keyup', '.fpd-text-layer-font-family .fpd-dropdown-current', function() {

			var $fontItems = $(this).nextAll('.fpd-dropdown-list').find('.fpd-item');
			$fontItems.hide();

			if(this.value.length === 0) {
				$fontItems.show();
			}
			else {
				$fontItems.filter(':containsCaseInsensitive("'+this.value+'")').show();
			}

		})
		.on('click touchend', '.fpd-text-layer-font-family .fpd-item', function(evt) {

			var $this = $(this),
				element = $this.parents('.fpd-text-layer-item').data('element');

			$this.parents('.fpd-dropdown').children('.fpd-dropdown-current').val($this.text());
			fpdInstance.currentViewInstance.setElementParameters({fontFamily: $this.data('value')}, element);

		})

		var _textChanged = function(evt, element, parameters) {

			if(parameters.text) {

				if(document.activeElement && $(document.activeElement).parent('.fpd-text-layer-content').length) {
					return;
				}

				$container.find('.fpd-list')
				.find('[id="'+element.id+'"] textarea, [id="'+element.id+'"] .fpd-text-layer-content input[type="text"]').val(parameters.text);

			}
			else if(parameters.fontSize) {
				$container.find('.fpd-list')
				.find('[id="'+element.id+'"] .fpd-text-layer-font-size').val(parameters.fontSize);
			}
			else if(parameters.fontFamily) {
				$container.find('.fpd-list')
				.find('[id="'+element.id+'"] .fpd-text-layer-font-family > .fpd-dropdown-current')
				.val(parameters.fontFamily)
				.css('font-family', parameters.fontFamily);
			}

		};

		//text is changed in canvas
		fpdInstance.$container.off('elementModify', _textChanged);
		fpdInstance.$container.on('elementModify', _textChanged);

		//element color change
		var _elementColorChanged = function(evt, element, hex, colorLinking) {

			var $currentColor = $container.find('.fpd-list')
			.find('[id="'+element.id+'"] .fpd-current-color');

			if($currentColor.is('input')) {
				$currentColor.spectrum('set', hex);
			}
			else {
				$currentColor.css('background', hex);
			}

		};

		fpdInstance.$container.off('elementColorChange', _elementColorChanged);
		fpdInstance.$container.on('elementColorChange', _elementColorChanged);

	}

};


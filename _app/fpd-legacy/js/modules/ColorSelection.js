export default function FPDColorSelection (fpdInstance) {

	'use strict';

	$ = jQuery;

	var $colorSelectionElem = null,
		colorDragging = false,
		target = fpdInstance.mainOptions.colorSelectionPlacement;

	var _createColorItem = function(element) {

		var $item = $('<div class="fpd-cs-item" data-id="'+element.id+'"><div class="fpd-title">'+element.title+'</div><div class="fpd-colors"></div></div>');

		if(FPDUtil.elementHasColorSelection(element)) {

			$colorSelectionElem.append($item);

			var availableColors = FPDUtil.elementAvailableColors(element, fpdInstance);

			if(element.type == FPDPathGroupName && element.getObjects().length > 1) {  //path-groups

				for(var i=0; i < availableColors.length; ++i) {
					$item.children('.fpd-colors').append('<input type="text" value="'+availableColors[i]+'" />');
				}

				$item.find('.fpd-colors input').spectrum({
					showPaletteOnly: $.isArray(element.colors),
					preferredFormat: "hex",
					showInput: true,
					showInitial: true,
					showButtons: false,
					showPalette: fpdInstance.mainOptions.colorPickerPalette && fpdInstance.mainOptions.colorPickerPalette.length > 0,
					palette: $.isArray(element.colors) ? element.colors : fpdInstance.mainOptions.colorPickerPalette,
					show: function(color) {

						var $colors = $(this).parent('.fpd-colors');

						var svgColors = FPDUtil.changePathColor(
							element,
							$colors.children('input').index(this),
							color
						);

						FPDUtil.spectrumColorNames($(this).spectrum('container'), fpdInstance);

						element._tempFill = svgColors;

					},
					move: function(color) {

						var $colors = $(this).parent('.fpd-colors');

						var svgColors = FPDUtil.changePathColor(
							element,
							$colors.children('input').index(this),
							color
						);

						fpdInstance.currentViewInstance.changeColor(element, svgColors);

					},
					change: function(color) {

						var $colors = $(this).parent('.fpd-colors');

						var svgColors = FPDUtil.changePathColor(
							element,
							$colors.find('input').index(this),
							color
						);

						$(document).unbind("click.spectrum"); //fix, otherwise change is fired on every click
						fpdInstance.currentViewInstance.setElementParameters({fill: svgColors}, element);

					}
				});


			}
			else if(availableColors != 1 && (availableColors.length > 1 || (element.type == FPDPathGroupName && element.getObjects().length === 1))) { // multiple colors

				var dropdownActive = false;
				if(fpdInstance.mainOptions.colorSelectionDisplayType == 'dropdown' && target.indexOf('inside-') == -1) {

					$item.addClass('fpd-dropdown')
					.children('.fpd-title').append('<span class="fpd-icon-arrow-dropdown"></span>');

					dropdownActive = true;

				}

				for(var i=0; i < availableColors.length; ++i) {

					var color = availableColors[i],
						tooltipTitle = fpdInstance.mainOptions.hexNames[color.replace('#', '').toLowerCase()];

					tooltipTitle = tooltipTitle ? tooltipTitle : color;

					if(typeof color === 'string' && color.length == 4) {
						color += color.substr(1, color.length);
					}

					$item.find('.fpd-colors').append('<div data-color="'+color+'" style="background-color: '+color+'" class="fpd-item fpd-tooltip" title="'+tooltipTitle+'"><div class="fpd-label">'+(dropdownActive ? tooltipTitle : color)+'</div></div>');

					$item.find('.fpd-item:last').click(function() {

						var color = tinycolor($(this).css('backgroundColor'));

						fpdInstance.deselectElement();
						fpdInstance.currentViewInstance.currentUploadZone = null;

						var fillValue = color.toHexString();
						if(element.type == FPDPathGroupName) {

							fillValue = FPDUtil.changePathColor(
								element,
								0,
								color
							);

						}

						fpdInstance.viewInstances[0].setElementParameters(
							{fill: fillValue},
							element
						);

					});

				}

				_renderPatternsList(element, $item.find('.fpd-colors'), dropdownActive);

				FPDUtil.updateTooltip($item);

			}
			else { //color picker

				$item.children('.fpd-colors').append('<input type="text" value="'+element.colors[0]+'" />');
				$item.find('input').spectrum({
					showButtons: false,
					preferredFormat: "hex",
					showInput: true,
					showInitial: true,
					showPalette: fpdInstance.mainOptions.colorPickerPalette && fpdInstance.mainOptions.colorPickerPalette.length > 0,
					palette: fpdInstance.mainOptions.colorPickerPalette,
					show: function(color) {

						FPDUtil.spectrumColorNames($(this).spectrum('container'), fpdInstance);
						element._tempFill = color.toHexString();

					},
					move: function(color) {

						//only non-png images are chaning while dragging
						if(colorDragging === false || FPDUtil.elementIsColorizable(element) !== 'png') {
							fpdInstance.viewInstances[0].changeColor(element, color.toHexString());
						}

					},
					change: function(color) {

						$(document).unbind("click.spectrum");
						fpdInstance.viewInstances[0].setElementParameters(
							{fill: color.toHexString()},
							element
						);

					}
				})
				.on('dragstart.spectrum', function() {
					colorDragging = true;
				})
				.on('dragstop.spectrum', function(evt, color) {
					colorDragging = false;
					fpdInstance.viewInstances[0].changeColor(element, color.toHexString());
				});

			}

		}

	};

	var _renderPatternsList = function(element, $wrapper, dropdownActive) {

		if($.isArray(element.patterns) && (FPDUtil.isSVG(element) || FPDUtil.getType(element.type) === 'text')) {

			element.patterns.forEach(function(pattern) {

				var patternTitle = pattern.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "").replace('_', ' '),
					patternLabel = dropdownActive ? '<div class="fpd-label">'+patternTitle+'</div>' : '';

				$wrapper.append('<div data-pattern="'+pattern+'" style="background-image: url('+pattern+')" class="fpd-item fpd-tooltip fpd-pattern" title="'+patternTitle+'">'+patternLabel+'</div>');

				$wrapper.find('.fpd-item:last').click(function() {

					var pattern = $(this).data('pattern');

					fpdInstance.deselectElement();
					fpdInstance.currentViewInstance.currentUploadZone = null;

					fpdInstance.viewInstances[0].setElementParameters(
						{pattern: pattern},
						element
					);

				});

			})

		}

	};

	var _initialize = function() {

		//update color selection when product is created
		fpdInstance.$container
		.on('productCreate', function() {

			//get all elements in first view for color selection panel
			var csElements = fpdInstance.getElements(0).filter(function(obj) {
				return obj.showInColorSelection;
			});

			//check if instance has views and a first a main element to get the colors from
			if(csElements.length > 0) {

				//create cs wrapper on first product creation
				if($colorSelectionElem == null) {

					//position inside
					if(target.indexOf('inside-') !== -1) {

						$colorSelectionElem = fpdInstance.$mainWrapper.append('<div class="fpd-color-selection fpd-inside-main fpd-clearfix fpd-'+target+'"></div>').children('.fpd-color-selection');
					}
					//position outside
					else {

						$colorSelectionElem = $(target).addClass('fpd-color-selection fpd-clearfix fpd-custom-pos');

					}

				}

				//clear all
				$colorSelectionElem.find('input').spectrum('destroy');
				$colorSelectionElem.empty();

				//only one single element is allowed inside
				if(target.indexOf('inside-') !== -1) {
					csElements = [csElements[0]];
				}

				//create color items
				csElements.forEach(function(element) {
					_createColorItem(element);
				});

				$colorSelectionElem.off().on('click', '.fpd-dropdown > .fpd-title', function() {

					$(this).next('.fpd-colors').toggleClass('fpd-active')
					.parent('.fpd-dropdown').siblings('.fpd-dropdown').children('.fpd-colors').removeClass('fpd-active');

				});

				$colorSelectionElem.show();

			}
			else if($colorSelectionElem) {
				$colorSelectionElem.hide();
			}

		})
		.on('elementRemove', function(evt, element) {

			if(element.showInColorSelection) {
				$colorSelectionElem.children('[data-id="'+element.id+'"]')
				.find('input').spectrum('destroy')
				.remove();
			}

		})
		.on('elementColorChange', function(evt, element, hex) {

			if($colorSelectionElem && typeof hex === 'string') {

				$colorSelectionElem.children('[data-id="'+element.id+'"]').find('.fpd-colors > [data-color="'+hex+'"]')
				.addClass('fpd-active').siblings().removeClass('fpd-active');

			}

		})

	};

	_initialize();
};
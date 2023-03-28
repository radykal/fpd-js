import {FPDUtil} from '../Util.js'
export const FPDLayersModule = {

	createList : function(fpdInstance, $container) {

		var $currentColorList,
			colorDragging = false;

		$container.off();

		//append a list item to the layers list
		var _appendLayerItem = function(element) {

			var colorHtml = '<span></span>';
			if(FPDUtil.elementHasColorSelection(element)) {

				var availableColors = FPDUtil.elementAvailableColors(element, fpdInstance);

				if(element.uploadZone) {
					colorHtml = '<span></span>';
				}
				else if(element.type == FPDPathGroupName && element.getObjects().length > 1) {
					colorHtml = '<span class="fpd-current-color" style="background: '+FPDUtil.getBgCssFromElement(element)+'"></span>';
				}
				else if(availableColors != 1 && (availableColors.length > 1 || (element.type == FPDPathGroupName && element.getObjects().length === 1))) {
					colorHtml = '<span class="fpd-current-color" style="background: '+FPDUtil.getBgCssFromElement(element)+'" data-colors=""></span>';
				}
				else {
					colorHtml = '<input class="fpd-current-color" type="text" value="'+FPDUtil.getBgCssFromElement(element)+'" />'
				}

			}

			var sourceContent = element.title;
			if(FPDUtil.getType(element.type) === 'text' && element.editable) {

				sourceContent = '<textarea>'+element.text+'</textarea>';

			}

			$container.find('.fpd-list').append('<div class="fpd-list-row" id="'+element.id+'"><div class="fpd-cell-0">'+colorHtml+'</div><div class="fpd-cell-1">'+sourceContent+'</div><div class="fpd-cell-2"></div></div>');

			var $lastItem = $container.find('.fpd-list-row:last')
				.data('element', element)
				.data('colors', availableColors);

			if(element.uploadZone) {
				$lastItem.addClass('fpd-add-layer')
				.find('.fpd-cell-2').append('<span class="fpd-icon-add"></span>');

				if(element.uploadZoneRemovable) {
					$lastItem.find('.fpd-icon-add').after('<span class="fpd-remove-element"><span class="fpd-icon-remove"></span></span>');
				}

			}
			else {

				var lockIcon = element.locked ? 'fpd-icon-locked-full' : 'fpd-icon-unlocked',
					reorderHtml = element.zChangeable ? '<span class="fpd-icon-reorder"></span>' : '';

				$lastItem.find('.fpd-cell-2').append(reorderHtml+'<span class="fpd-lock-element"><span class="'+lockIcon+'"></span></span>');

				if(element.removable || element.__editorMode) {
					$lastItem.find('.fpd-lock-element').after('<span class="fpd-remove-element"><span class="fpd-icon-remove"></span></span>');
				}

				$lastItem.toggleClass('fpd-locked', element.locked);

			}

		};

		//destroy all color pickers and empty list
		$container.find('.fpd-current-color').spectrum('destroy');
		$container.find('.fpd-list').empty();

		fpdInstance.getElements(fpdInstance.currentViewIndex).forEach(function(element) {

			if(FPDUtil.elementIsEditable(element)) {
				_appendLayerItem(element);
			}

		});

		FPDUtil.createScrollbar($container.find('.fpd-scroll-area'));

		//sortable layers list
		var sortDir = 0;
		$container.find('.fpd-list').sortable({
			handle: '.fpd-icon-reorder',
			placeholder: 'fpd-list-row fpd-sortable-placeholder',
			scroll: false,
			axis: 'y',
			containment: 'parent',
			items: '.fpd-list-row:not(.fpd-locked)',
			start: function(evt, ui) {
				if(ui.originalPosition) {
                    sortDir = ui.originalPosition.top;
                }
			},
			change: function(evt, ui) {

				var targetElement = fpdInstance.getElementByID(ui.item.attr('id')),
					relatedItem;

				if(ui.position.top > sortDir) { //down
					relatedItem = ui.placeholder.prevAll(".fpd-list-row:not(.ui-sortable-helper)").first();
				}
				else { //up
					relatedItem = ui.placeholder.nextAll(".fpd-list-row:not(.ui-sortable-helper)").first();
				}

				var fabricElem = fpdInstance.currentViewInstance.getElementByID(relatedItem.attr('id')),
					index = fpdInstance.currentViewInstance.getZIndex(fabricElem);

				fpdInstance.setElementParameters({z: index}, targetElement);

				sortDir = ui.position.top;

			}
		});

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

				var element = $(this).parents('.fpd-list-row:first').data('element');
				element._tempFill = color.toHexString();

			},
			move: function(color) {

				var element = $(this).parents('.fpd-list-row:first').data('element');
				//only non-png images are chaning while dragging
				if(colorDragging === false || FPDUtil.elementIsColorizable(element) !== 'png') {
					fpdInstance.currentViewInstance.changeColor(element, color.toHexString());
				}

			},
			change: function(color) {

				$(document).unbind("click.spectrum"); //fix, otherwise change is fired on every click
				var element = $(this).parents('.fpd-list-row:first').data('element');
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
			var element = $(this).parents('.fpd-list-row:first').data('element');
			fpdInstance.currentViewInstance.changeColor(element, color.toHexString());
		});

		$container.off('click', '.fpd-current-color') //unregister click, otherwise triggers multi-times when changing view
		.on('click', '.fpd-current-color', function(evt) { //open sub

			evt.stopPropagation();

			$container.find('.fpd-path-colorpicker').spectrum('destroy');
			$container.find('input.fpd-current-color').spectrum('hide');

			var $listItem = $(this).parents('.fpd-list-row'),
				element = $listItem.data('element'),
				availableColors = $listItem.data('colors');

			//clicked on opened sub colors, just close it
			if($currentColorList && $listItem.children('.fpd-scroll-area').length > 0) {
				$currentColorList.slideUp(200, function(){ $(this).remove(); });
				$currentColorList = null;
				return;
			}

			//close another sub colors
			if($currentColorList) {
				$currentColorList.slideUp(200, function(){ $(this).remove(); });
				$currentColorList = null;
			}

			if(availableColors.length > 0) {

				$listItem.append('<div class="fpd-scroll-area"><div class="fpd-color-palette fpd-grid"></div></div>');

				for(var i=0; i < availableColors.length; ++i) {

					var item;
					if(element.type === FPDPathGroupName && element.getObjects().length > 1) {

						item = '<input class="fpd-path-colorpicker" type="text" value="'+availableColors[i]+'" />';

					}
					else {

						var tooltipTitle = fpdInstance.mainOptions.hexNames[availableColors[i].replace('#', '').toLowerCase()];
						tooltipTitle = tooltipTitle ? tooltipTitle : availableColors[i];

						item = '<div class="fpd-item fpd-tooltip" title="'+tooltipTitle+'" style="background-color: '+availableColors[i]+'" data-color="'+availableColors[i]+'"></div>';

					}

					$listItem.find('.fpd-color-palette').append(item);
				}

				FPDUtil.createScrollbar($listItem.children('.fpd-scroll-area'));
				FPDUtil.updateTooltip($listItem);

				if(element.type === FPDPathGroupName && element.getObjects().length > 1) {

					$listItem.find('.fpd-path-colorpicker').spectrum({
						showPaletteOnly: $.isArray(element.colors),
						preferredFormat: "hex",
						showInput: true,
						showInitial: true,
						showButtons: false,
						showPalette: fpdInstance.mainOptions.colorPickerPalette && fpdInstance.mainOptions.colorPickerPalette.length > 0,
						palette: $.isArray(element.colors) ? element.colors : fpdInstance.mainOptions.colorPickerPalette,
						show: function(color) {

							var $listItem = $(this).parents('.fpd-list-row'),
								element = $listItem.data('element');

							var svgColors = FPDUtil.changePathColor(
								element,
								$listItem.find('.fpd-path-colorpicker').index(this),
								color
							);

							FPDUtil.spectrumColorNames($(this).spectrum('container'), fpdInstance);

							element._tempFill = svgColors;

						},
						move: function(color) {

							var $listItem = $(this).parents('.fpd-list-row'),
								element = $listItem.data('element');

							var svgColors = FPDUtil.changePathColor(
								element,
								$listItem.find('.fpd-path-colorpicker').index(this),
								color
							);

							fpdInstance.currentViewInstance.changeColor(element, svgColors);

						},
						change: function(color) {

							var $listItem = $(this).parents('.fpd-list-row'),
								element = $listItem.data('element');

							var svgColors = FPDUtil.changePathColor(
								element,
								$listItem.find('.fpd-path-colorpicker').index(this),
								color
							);

							$(document).unbind("click.spectrum"); //fix, otherwise change is fired on every click
							fpdInstance.currentViewInstance.setElementParameters({fill: svgColors}, element);

						}
					});

				}
				else {

					if($.isArray(element.patterns) && (FPDUtil.isSVG(element) || FPDUtil.getType(element.type) === 'text')) {

						element.patterns.forEach(function(pattern) {

							var patternTitle = pattern.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "").replace('_', ' '),
								patternLabel = '<div class="fpd-label">'+patternTitle+'</div>';

							$listItem.find('.fpd-color-palette').append('<div data-pattern="'+pattern+'" style="background-image: url('+pattern+')" class="fpd-item fpd-tooltip fpd-pattern" title="'+patternTitle+'"></div>');


						})

						FPDUtil.updateTooltip($listItem);

					}

				}

				$currentColorList = $listItem.children('.fpd-scroll-area').slideDown(300);

			}

		});

		//select color from color palette
		$container.on('click', '.fpd-color-palette .fpd-item', function(evt) {

			evt.stopPropagation();

			var $this = $(this),
				$listItem = $this.parents('.fpd-list-row'),
				element = $listItem.data('element'),
				fill = $this.data('pattern') ? $this.data('pattern') : $this.data('color'),
				paramsObj = $this.data('pattern') ? {pattern: fill} : {fill: fill};

			$listItem.find('.fpd-current-color').css('background', $this.data('pattern') ? 'url('+fill+')' : fill);

			//if svg has one path
			if(element.type == FPDPathGroupName) {

				newColor = FPDUtil.changePathColor(
					element,
					0,
					fill
				);

			}

			fpdInstance.currentViewInstance.setElementParameters(paramsObj, element);

		});

		//select associated element on stage when choosing one from the layers list
		$container.on('click', '.fpd-list-row', function(evt) {

			var $this = $(this);

			if($this.hasClass('fpd-locked') ||  $(evt.target).is('textarea')) {
				return;
			}

			var targetElement = fpdInstance.getElementByID(this.id);
			if(targetElement) {
				targetElement.canvas.setActiveObject(targetElement).renderAll();
			}

		});

		//lock element
		$container.on('click', '.fpd-lock-element',function(evt) {

			evt.stopPropagation();

			var $this = $(this),
				element = $this.parents('.fpd-list-row').data('element');

			if($currentColorList) {
				$currentColorList.slideUp(200, function(){ $(this).remove(); });
				$currentColorList = null;
			}

			element.evented = !element.evented;
			element.locked = !element.evented;

			$this.children('span').toggleClass('fpd-icon-unlocked', element.evented)
			.toggleClass('fpd-icon-locked-full', !element.evented);

			$this.parents('.fpd-list-row').toggleClass('fpd-locked', !element.evented);
			$this.parents('.fpd-list:first').sortable( 'refresh' );

		});

		//remove element
		$container.on('click', '.fpd-remove-element',function(evt) {

			evt.stopPropagation();

			var $listItem = $(this).parents('.fpd-list-row');

			fpdInstance.currentViewInstance.removeElement($listItem.data('element'));

		});

		//text is changed via textarea
		$container.on('keyup', 'textarea',function(evt) {

			evt.stopPropagation();

			var $this = $(this),
				element = $this.parents('.fpd-list-row').data('element');
            
            this.value = this.value.replace(FPDDisallowChars, '');
            
			//remove emojis
			if(fpdInstance.mainOptions.disableTextEmojis) {
				this.value = this.value.replace(FPDEmojisRegex, '');
				this.value = this.value.replace(String.fromCharCode(65039), ""); //fix: some emojis left a symbol with char code 65039
			}

			fpdInstance.currentViewInstance.setElementParameters({text: this.value}, element);

		});

		//text is changed in canvas
		var _textChanged = function(evt, element, parameters) {

			if(parameters.text) {

				if(document.activeElement && $(document.activeElement).parent('.fpd-cell-1').length) {
					return;
				}

				$container.find('.fpd-list')
				.find('[id="'+element.id+'"] textarea').val(parameters.text);
			}

		};

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
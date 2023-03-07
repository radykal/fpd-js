var FPDDynamicViews = function(fpdInstance, $module) {

	'use strict';

	$ = jQuery;

	var instance = this,
		selectCreatedView = null,
		unitFormat = fpdInstance.mainOptions.dynamicViewsOptions.unit,
		formats = fpdInstance.mainOptions.dynamicViewsOptions.formats,
		minWidth = fpdInstance.mainOptions.dynamicViewsOptions.minWidth,
		minHeight = fpdInstance.mainOptions.dynamicViewsOptions.minHeight,
		maxWidth = fpdInstance.mainOptions.dynamicViewsOptions.maxWidth,
		maxHeight = fpdInstance.mainOptions.dynamicViewsOptions.maxHeight,
		currentLayouts = [],
		startSortIndex = null;

	var _array_move = function(arr, fromIndex, toIndex) {

	    var element = arr[fromIndex];
		arr.splice(fromIndex, 1);
	    arr.splice(toIndex, 0, element);
	};

	var _checkDimensionLimits = function(type, input) {

		if(type == 'width') {

			if(input.value < minWidth) { input.value = minWidth; }
			else if(input.value > maxWidth) { input.value = maxWidth; }

		}
		else {

			if(input.value < minHeight) { input.value = minHeight; }
			else if(input.value > maxHeight) { input.value = maxHeight; }

		}

		return input.value;

	};

	var _initialize = function() {

		$module.find('.fpd-list').sortable({
			placeholder: 'fpd-item fpd-sortable-placeholder',
			items: '.fpd-item',
			cancel: 'input',
			handle: '.fpd-view-thumbnail',
			scroll: false,
			axis: 'y',
			start: function(evt, ui) {
				startSortIndex = ui.item.index();
			},
			update: function(evt, ui) {

				var newIndex = ui.item.index(),
					$views = fpdInstance.$productStage.children('.fpd-view-stage'),
					$viewThumbs = fpdInstance.$viewSelectionWrapper.find('.fpd-item');

				if(newIndex == 0) { //set a first position

					$views.eq(startSortIndex).insertBefore($views.eq(0));
					$viewThumbs.eq(startSortIndex).insertBefore($viewThumbs.eq(0));

				}
				else {

					if(startSortIndex > newIndex) {
						$views.eq(startSortIndex).insertBefore($views.eq(newIndex));
						$viewThumbs.eq(startSortIndex).insertBefore($viewThumbs.eq(newIndex));
					}
					else {
						$views.eq(startSortIndex).insertAfter($views.eq(newIndex));
						$viewThumbs.eq(startSortIndex).insertAfter($viewThumbs.eq(newIndex));
					}

				}

				_array_move(fpdInstance.viewInstances, startSortIndex, newIndex);

				if(startSortIndex == fpdInstance.currentViewIndex) {

					fpdInstance.selectView(newIndex);

				}

			}
		});

		fpdInstance.$container
		.on('productSelect', function() { //clear view list
			$module.find('.fpd-list').empty();
		})
		.on('productCreate', function() { //toggle layouts button

			if(fpdInstance.currentViewInstance.options.layouts && fpdInstance.currentViewInstance.options.layouts.length > 0) {

				$module.find('.fpd-add-from-layouts').removeClass('fpd-hidden');

			}
			else {
				$module.find('.fpd-add-from-layouts').addClass('fpd-hidden');
			}

		})
		.on('uiSet', function(evt, viewInstance) { //set up formats for blank module

			var $blankCon = fpdInstance.mainBar.$content.find('.fpd-dynamic-views-blank');

			if($.isArray(formats) && formats.length > 0) {

				var $blankFormatsDropdown = $blankCon.find('.fpd-blank-formats').removeClass('fpd-hidden');

				formats.forEach(function(format, index) {

					$('<span/>', {
						'class': 'fpd-item',
						'data-value': index,
						'html': format[0]+' x '+format[1]
					}).appendTo($blankFormatsDropdown.find('.fpd-dropdown-list'));

				});

			}

			$blankCon.find('.fpd-dynamic-views-unit').text(unitFormat); //set unit format in blank module

			fpdInstance.mainBar.$content
			.on('click', '.fpd-blank-formats .fpd-item', function() { //select format inside add blank view

				var selectedFormatIndex = $(this).data('value');

				fpdInstance.mainBar.$content.find('.fpd-blank-custom-size .fpd-width').val(formats[selectedFormatIndex][0])
				.nextAll('input:first').val(formats[selectedFormatIndex][1]);


			})
			.on('click', '.fpd-dynamic-views-blank .fpd-btn', function() { //add blank view

				var allValid = true,
					viewOptions = {};

				$blankCon.find('.fpd-blank-custom-size input').each(function() {

					var $this = $(this);

					if(this.value.length == 0) {

						allValid = false;
						$this.addClass('fpd-error');

					}
					else {

						viewOptions[$this.hasClass('fpd-width') ? 'stageWidth' : 'stageHeight'] = FPDUtil.unitToPixel(Number(this.value), unitFormat);

					}

				});

				if(allValid) {

					viewOptions.output = {width: FPDUtil.pixelToUnit(viewOptions.stageWidth, 'mm'), height: FPDUtil.pixelToUnit(viewOptions.stageHeight, 'mm')};

					selectCreatedView = fpdInstance.viewInstances.length;

					fpdInstance.addView({
						title: Date.now(),
						thumbnail: '',
						elements: [],
						options: viewOptions
					});

					$blankCon.find('.fpd-blank-custom-size input').val('').removeClass('fpd-error');

				}

			})
			.on('click', '.fpd-dynamic-views-layouts .fpd-item', function() { //add view from layout

				var $this = $(this),
					layoutIndex = $this.parent().children('.fpd-item').index($this);

				selectCreatedView = fpdInstance.viewInstances.length;

				fpdInstance.addView(currentLayouts[layoutIndex]);

			});

		})
		.on('viewCreate', function(evt, viewInstance) {

			if(selectCreatedView !== null) {

				fpdInstance.selectView(selectCreatedView);
				fpdInstance.mainBar.callModule('dynamic-views');
				selectCreatedView = null;

			}

			viewInstance.toDataURL(function(dataURL) {

				var viewWidthUnit = FPDUtil.pixelToUnit(viewInstance.options.stageWidth, unitFormat),
					viewHeightUnit = FPDUtil.pixelToUnit(viewInstance.options.stageHeight, unitFormat),
					$lastItem = $('<div/>', {
						'class': 'fpd-item',
						'html': '<div class="fpd-view-thumbnail"><picture style="background-image: url('+dataURL+')"></picture></div><div class="fpd-actions"><div class="fpd-copy-view"><span class="fpd-icon-copy"></span></div><div class="fpd-dimensions"><input type="number" class="fpd-width" value="'+viewWidthUnit+'" min="'+minWidth+'" max="'+maxWidth+'" />x<input type="number" value="'+viewHeightUnit+'" min="'+minHeight+'" max="'+maxHeight+'" />'+unitFormat+'</div><div class="fpd-remove-view"><span class="fpd-icon-remove"></span></div></div>'
					}).appendTo($module.find('.fpd-list'));

				FPDUtil.createScrollbar($module.find('.fpd-scroll-area'));

			})

		})
		.on('viewRemove', function(evt, viewIndex) {

			$module.find('.fpd-list .fpd-item').eq(viewIndex).remove();

		})
		.on('viewCanvasUpdate', function(evt, viewInstance) {

			if(fpdInstance.productCreated) { //update view thumbnail

				var viewIndex = fpdInstance.$productStage.children('.fpd-view-stage').index($(viewInstance.stage.wrapperEl)),
					multiplier = FPDUtil.getScalingByDimesions(viewInstance.options.stageWidth, viewInstance.options.stageHeight, 250, 200);

				viewInstance.toDataURL(function(dataURL) {

					$module.find('.fpd-item').eq(viewIndex).find('picture').css('background-image', 'url('+dataURL+')');

					if(viewInstance.thumbnail === '') {
						fpdInstance.$viewSelectionWrapper.find('.fpd-item').eq(viewIndex).find('picture').css('background-image', 'url('+dataURL+')');
					}

				}, 'transparent', {multiplier: multiplier}, false, false);

			}

		})
		.on('secondaryModuleCalled', function(evt, className, $moduleContainer) {

			if(className == 'fpd-dynamic-views-layouts') { //set up layouts from view options

				$moduleContainer.find('.fpd-scroll-area .fpd-grid').empty();

				var layouts = fpdInstance.viewInstances[0].options.layouts;
				if($.isArray(layouts)) {

					currentLayouts = layouts;

					layouts.forEach(function(layoutObject) {

						var $lastItem = $('<div/>', {
									'class': 'fpd-item fpd-tooltip',
									'title': layoutObject.title,
									'html': '<picture style="background-image: url('+layoutObject.thumbnail+'");"></picture>'
								}).appendTo($moduleContainer.find('.fpd-scroll-area .fpd-grid'));

					});

					FPDUtil.updateTooltip($moduleContainer.children('.fpd-scroll-area'));
					FPDUtil.createScrollbar($moduleContainer.children('.fpd-scroll-area'));

				}

			}

		})
		.on('clear', function() {

			$module.find('.fpd-list .fpd-item').remove();

		})
		.on('viewCreate viewSizeChange', function(evt, viewInstance) { //toggle layouts button

			if(fpdInstance.mainOptions.dynamicViewsOptions.pricePerArea) {

				var width = FPDUtil.pixelToUnit(viewInstance.options.stageWidth, 'cm'),
					height = FPDUtil.pixelToUnit(viewInstance.options.stageHeight, 'cm');

				//check if canvas output has dimensions
				if(FPDUtil.objectHasKeys(viewInstance.options.output, ['width', 'height'])) {
					width = viewInstance.options.output.width / 10;
					height = viewInstance.options.output.height / 10;

				}

				var cm2 = Math.ceil(width * height),
					cm2Price = cm2 * Number(fpdInstance.mainOptions.dynamicViewsOptions.pricePerArea);

				viewInstance.changePrice(0, '+', cm2Price);

			}

		})

		$module.on('click', '.fpd-btn', function() { //selelct secondary module

			if($(this).hasClass('fpd-add-blank-view')) {
				fpdInstance.mainBar.callSecondary('fpd-dynamic-views-blank');
			}
			else {
				fpdInstance.mainBar.callSecondary('fpd-dynamic-views-layouts');
			}

		})
		.on('click', '.fpd-list .fpd-item', function() { //select view from views list

			var viewIndex = $module.find('.fpd-item').index($(this));
			fpdInstance.selectView(viewIndex);

		})
		.on('change', '.fpd-dimensions input', function() { //change view dimensions

			var $this = $(this),
				stageWidth,
				stageHeight;

			if($this.hasClass('fpd-width')) {

				stageWidth = FPDUtil.unitToPixel(_checkDimensionLimits('width', this), unitFormat);
				stageHeight = FPDUtil.unitToPixel(_checkDimensionLimits('height', $this.siblings('input[type="number"]').get(0)), unitFormat);

			}
			else {

				stageHeight = FPDUtil.unitToPixel(_checkDimensionLimits('height', this), unitFormat);
				stageWidth = FPDUtil.unitToPixel(_checkDimensionLimits('width', $this.siblings('input[type="number"]').get(0)), unitFormat);

			}

			//calculate output dimensions in mm
			var outputWidth = FPDUtil.pixelToUnit(stageWidth, 'mm'),
				outputHeight = FPDUtil.pixelToUnit(stageHeight, 'mm');

			if(fpdInstance.currentViewInstance.options.output) {
				fpdInstance.currentViewInstance.options.output.width = outputWidth;
				fpdInstance.currentViewInstance.options.output.height = outputHeight;
			}
			else {
				fpdInstance.currentViewInstance.options.output = {width: outputWidth, height: outputHeight};
			}

			//calculate canvas dimensions, max. width and height can not exceed 1000px for proper performance
			var scaleToMax = FPDUtil.getScalingByDimesions(stageWidth, stageHeight, 1000, 1000);
			scaleToMax = scaleToMax > 1 ? 1 : scaleToMax;

			fpdInstance.currentViewInstance.options.stageWidth = Math.round(stageWidth * scaleToMax);
			fpdInstance.currentViewInstance.options.stageHeight = Math.round(stageHeight * scaleToMax);

			//re-render printing box
			var tempPbVisiblity = fpdInstance.currentViewInstance.options.printingBox ? fpdInstance.currentViewInstance.options.printingBox.visibility : false;

			fpdInstance.currentViewInstance.options.printingBox = {
				top: 0,
				left: 0,
				width: fpdInstance.currentViewInstance.options.stageWidth,
				height: fpdInstance.currentViewInstance.options.stageHeight,
				visibility: tempPbVisiblity
			};
			fpdInstance.currentViewInstance.renderPrintingBox();

			//set width otherwise not updated
			fpdInstance.$productStage.width(fpdInstance.currentViewInstance.options.stageWidth);
			fpdInstance.currentViewInstance.resetCanvasSize();

			/**
		     * Gets fired when the size of a view is changed via the Dynamic Views module.
		     *
		     * @event FancyProductDesigner#viewSizeChange
		     * @param {Event} event
		     * @param {String} currentViewInstance - The current view instance.
		     */
			fpdInstance.$container.trigger('viewSizeChange', [fpdInstance.currentViewInstance]);


		})
		.on('click', '.fpd-copy-view', function(evt) { //remove view

			evt.stopPropagation();

			var viewIndex = $module.find('.fpd-item').index($(this).parents('.fpd-item:first')),
				viewInstance = fpdInstance.viewInstances[viewIndex];

			var viewElements = viewInstance.stage.getObjects(),
				jsonViewElements = [];

			for(var j=0; j < viewElements.length; ++j) {
				var element = viewElements[j];

				if(element.title !== undefined && element.source !== undefined) {
					var jsonItem = {
						title: element.title,
						source: element.source,
						parameters: viewInstance.getElementJSON(element),
						type: FPDUtil.getType(element.type)
					};

					jsonViewElements.push(jsonItem);
				}
			}

			fpdInstance.addView({
				title: viewInstance.title,
				thumbnail: viewInstance.thumbnail,
				elements: jsonViewElements,
				options: viewInstance.options
			});


		})
		.on('click', '.fpd-remove-view', function(evt) { //remove view

			evt.stopPropagation();

			var viewIndex = $module.find('.fpd-item').index($(this).parents('.fpd-item:first'));
			fpdInstance.removeView(viewIndex);

		});

	};

	_initialize();

};
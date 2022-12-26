import {FPDUtil} from '../Util.js'
export default function FPDLayoutsModule (fpdInstance, $module) {

	'use strict';

	$ = jQuery;

	var instance = this,
		currentLayouts = [],
		_layoutElementLoadingIndex = 0,
		_totalLayoutElements = 0,
		$scrollArea = $module.find('.fpd-scroll-area');

	var _setupLayouts = function(layouts) {

		if($.isArray(layouts)) {

			currentLayouts = layouts;

			$scrollArea.find('.fpd-grid').empty();

			layouts.forEach(function(layoutObject) {

				var $lastItem = $('<div/>', {
							'class': 'fpd-item fpd-tooltip',
							'title': layoutObject.title,
							'html': '<picture style="background-image: url('+layoutObject.thumbnail+'");"></picture>'
						}).appendTo($scrollArea.find('.fpd-grid'));

			});

			FPDUtil.updateTooltip($scrollArea.find('.fpd-grid'));
			FPDUtil.createScrollbar($scrollArea);

		}

	};

	var _loadingLayoutElement = function(evt, type, source, title, params) {

		_layoutElementLoadingIndex++;

		var loadElementState = title + '<br>' + String(_layoutElementLoadingIndex) + '/' + _totalLayoutElements;
		fpdInstance.$container.find('.fpd-loader-text').html(loadElementState);

	};

	var _initialize = function() {

		fpdInstance.$container
		.on('productCreate', function(evt, views) {

			if(views.length > 0) {
				_setupLayouts(views[0].options.layouts)
			}

		});

		$scrollArea.on('click', '.fpd-item', function() {

			if(fpdInstance.productCreated) {

				var $confirm = FPDUtil.showModal(fpdInstance.getTranslation('modules', 'layouts_confirm_replacement'), false, 'confirm', fpdInstance.$modalContainer),
					layoutIndex = $scrollArea.find('.fpd-item').index($(this));

				$confirm.find('.fpd-confirm').text(fpdInstance.getTranslation('modules', 'layouts_confirm_button')).click(function() {

					_layoutElementLoadingIndex = 0;

					var $viewInstance = $(fpdInstance.currentViewInstance);

					_totalLayoutElements = currentLayouts[layoutIndex].elements.length;

					fpdInstance.globalCustomElements = [];
					if(fpdInstance.mainOptions.replaceInitialElements) {
						fpdInstance.globalCustomElements = fpdInstance.getCustomElements();
					}

					$viewInstance.on('beforeElementAdd', _loadingLayoutElement);

					fpdInstance.toggleSpinner(true);
					fpdInstance.currentViewInstance.loadElements(currentLayouts[layoutIndex].elements, function() {

						fpdInstance.toggleSpinner(false);
						$viewInstance.off('beforeElementAdd', _loadingLayoutElement);

						/**
						 * Gets fired when a all elements of layout are added.
						 *
						 * @event FancyProductDesigner#productAdd
						 * @param {Event} event
						 * @param {Array} elements - Added elements.
						 */
						fpdInstance.$container.trigger('layoutElementsAdded', [currentLayouts[layoutIndex].elements]);

					});

					fpdInstance.$viewSelectionWrapper.find('.fpd-item').eq(fpdInstance.currentViewIndex).children('picture').css('background-image', 'url('+currentLayouts[layoutIndex].thumbnail+')');

					$confirm.find('.fpd-modal-close').click();

				});

			}

		});

	};

	_initialize();

};
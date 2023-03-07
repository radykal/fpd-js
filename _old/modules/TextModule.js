var FPDTextModule = function(fpdInstance, $module) {

	'use strict';

	$ = jQuery;

	var currentViewOptions;

	var _initialize = function() {

		$module.find('.fpd-textbox-wrapper').toggle(Boolean(fpdInstance.mainOptions.setTextboxWidth));

		fpdInstance.$container.on('viewSelect', function(evt, index, viewInstance) {

			currentViewOptions = viewInstance.options;

			if(currentViewOptions.customTextParameters && currentViewOptions.customTextParameters.price) {
				var price = fpdInstance.formatPrice(currentViewOptions.customTextParameters.price);
				$module.find('.fpd-btn > .fpd-price').html(' - '+price);
			}
			else {
				$module.find('.fpd-btn > .fpd-price').html('');
			}

		});

		$module.on('click', '.fpd-btn', function() {

			var $input = $(this).prevAll('textarea:first'),
				text = $input.val();

			if(fpdInstance.currentViewInstance && text && text.length > 0) {

				var textboxWidth = parseInt($module.find('.fpd-textbox-width').val());
				$module.find('.fpd-textbox-width').val('');

				var textParams = $.extend({}, currentViewOptions.customTextParameters, {isCustom: true, _addToUZ: fpdInstance.currentViewInstance.currentUploadZone});

				if(!isNaN(textboxWidth)) {
					textParams.textBox = true;
					textParams.width = textboxWidth;
					textParams.resizable = true;
				}

				fpdInstance.addElement(
					'text',
					text,
					text,
					textParams
				);

			}

			$input.val('');

		});

		$module.on('input change', 'textarea', function() {

			var text = this.value,
				maxLength = currentViewOptions ? currentViewOptions.customTextParameters.maxLength : 0,
				maxLines = currentViewOptions ? currentViewOptions.customTextParameters.maxLines : 0;
            
            text = text.replace(FPDDisallowChars, '');
            
			//remove emojis
			if(fpdInstance.mainOptions.disableTextEmojis) {
				text = text.replace(FPDEmojisRegex, '');
				text = text.replace(String.fromCharCode(65039), ""); //fix: some emojis left a symbol with char code 65039
			}
            
			if(maxLength != 0 && text.length > maxLength) {
				text = text.substr(0, maxLength);
			}

			if(maxLines != 0 && text.split("\n").length > maxLines) {
				text = text.replace(/([\s\S]*)\n/, "$1");
			}
            
			this.value = text;

		});

		if($.isArray(fpdInstance.mainOptions.textTemplates)) {

			var $textTemplatesGrid = $module.find('.fpd-text-templates .fpd-grid');

			fpdInstance.mainOptions.textTemplates.forEach(function(item) {

				var props = item.properties,
					styleAttr = 'font-family:'+ (props.fontFamily ? props.fontFamily : 'Arial');

				styleAttr += '; text-align:'+ (props.textAlign ? props.textAlign : 'left');

				var $lastItem = $('<div/>', {
					'class': 'fpd-item',
					'data-props': JSON.stringify(item.properties),
					'data-text': item.text,
					'html': '<div style="'+styleAttr+'">'+item.text.replace(/(?:\r\n|\r|\n)/g, '<br>')+'</div>'
				}).appendTo($textTemplatesGrid);

				$lastItem.click(function() {

					if(fpdInstance.currentViewInstance) {

						var textParams = $.extend({},
							currentViewOptions.customTextParameters,
							{isCustom: true, _addToUZ: fpdInstance.currentViewInstance.currentUploadZone},
							$(this).data('props')
						);

						fpdInstance.addElement(
							'text',
							this.dataset.text,
							this.dataset.text,
							textParams
						);

					}

				})

			})

			FPDUtil.createScrollbar($textTemplatesGrid.parent('.fpd-scroll-area'));

		}

	};

	_initialize();

};
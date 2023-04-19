var FPDLayersModule = {

	createList : function(fpdInstance, $container) {

		//text is changed via textarea
		$container.on('keyup', 'textarea',function(evt) {

			evt.stopPropagation();
            
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

		fpdInstance.$container.on('elementColorChange', _elementColorChanged);

	}

};
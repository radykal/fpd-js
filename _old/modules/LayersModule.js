var FPDLayersModule = {

	createList : function(fpdInstance, $container) {

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
var FPDToolbarSide = function($uiElementToolbar, fpdInstance) {

	var _initialize = function() {

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

	};

};
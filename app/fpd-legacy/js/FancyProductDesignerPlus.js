/*
* Fancy Product Designer Plus
* An Add-On for Fancy Product Designer.
* Copyright 2016, Rafael Dery
*
* Only for the sale at the envato marketplaces
*/

const FancyProductDesignerPlus = {
	version: '1.0.7',
	setup: function($elem, fpdInstance) {
		// @@include('../../envato/evilDomain.js')

		if(fpdInstance.mainOptions.colorSelectionPlacement && fpdInstance.mainOptions.colorSelectionPlacement !== '') {
			new FPDColorSelection(fpdInstance);
		}

		$elem.on('langJSONLoad', function() {

			if(fpdInstance.mainOptions.bulkVariationsPlacement && fpdInstance.mainOptions.bulkVariations) {
				var bulkVariations = new FPDBulkVariations(fpdInstance);
				fpdInstance.bulkVariations = bulkVariations;
			}
		});

		if(fpdInstance.mainOptions.mainBarModules.indexOf('names-numbers') != -1) {
			$elem.on('viewCreate', function(evt, viewInstance) {
				if(viewInstance.names_numbers && viewInstance.names_numbers.length > 1) {
					viewInstance.changePrice((viewInstance.names_numbers.length-1) * viewInstance.options.namesNumbersEntryPrice, '+');
				}
			});
		}
	},
	availableModules: [
		'names-numbers',
		'drawing',
		'dynamic-views'
	]
};

export default FancyProductDesignerPlus


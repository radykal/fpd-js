/**
 * <strong>This is part of the PLUS add-on.</strong><br>
 * The class to create the Bulk Variations that is related to FancyProductDesigner class.
 * <h5>Example</h5><pre>fpdInstance.bulkVariations.getOrderVariations();</pre>
 * But you can just use the getOrder() method of FancyProductDesigner class, this will also include the order variations object. <pre>fpdInstance.getOrder();</pre>
 *
 * @class FPDBulkVariations
 * @constructor
 * @param {FancyProductDesigner} fpdInstance - An instance of FancyProductDesigner class.
 */
var FPDBulkVariations = function(fpdInstance) {

	'use strict';

	$ = jQuery;

	var instance = this,
		$container = $(fpdInstance.mainOptions.bulkVariationsPlacement).addClass('fpd-bulk-variations fpd-container'),
		variations = fpdInstance.mainOptions.bulkVariations,
		variationRowHtml = '';


	/**
	 * Gets the variation(s) from the UI.
	 *
	 * @method getOrderVariations
	 * @return {Array|Boolean} An array containing objects with variation and quantity properties. If a variation in the UI is not set, it will return false.
	 */
	this.getOrderVariations = function() {

		var variations = [];
		$container.find('.fpd-row').each(function(i, row) {

			var $row = $(row);

			var variation = {};
			$row.children('.fpd-select-col').each(function(i, selectCol) {

				var $select = $(selectCol).find('select');

				if($select.val() == null) {
					variations = false;
					$select.addClass('fpd-error');
				}

				variation[$select.attr('name')] = $select.val();

			});

			if(variations !== false) {
				variations.push({variation: variation, quantity: parseInt($row.find('.fpd-quantity').val()) });
			}


		});

		return variations;
	};

	/**
	 * Loads variation(s) in the UI.
	 *
	 * @method setup
	 * @param {Array} variations An array containing objects with variation and quantity properties.
	 */
	this.setup = function(variations) {

		if(typeof variations === 'object') {

			$container.children('.fpd-variations-list').empty();
			variations.forEach(function(variationItem) {

				$container.children('.fpd-variations-list').append(variationRowHtml);

				var $lastRow = $container.children('.fpd-variations-list').children('.fpd-row:last');

				//Set value of select dropdowns
				Object.keys(variationItem.variation).forEach(function(attribute) {
					$lastRow.find('select[name="'+attribute+'"]').val(variationItem.variation[attribute]);
				});

				$lastRow.find('.fpd-quantity').val(variationItem.quantity);

			});

		}

		_setTotalQuantity();

	};

	var _setTotalQuantity = function() {

		var totalQuantity = 0;
		$container.find('.fpd-quantity').each(function() {
			totalQuantity += Number(this.value);
		});

		fpdInstance.setOrderQuantity(Number(totalQuantity));

	};

	var _initialize = function() {

		//when getOrder is called, add bulk variations
		fpdInstance.$container.on('getOrder', function() {

			fpdInstance._order.bulkVariations = instance.getOrderVariations();

		});

		if(typeof variations === 'object') {

			var keys = Object.keys(variations);

			variationRowHtml += '<div class="fpd-row">';
			for(var i=0; i<keys.length; ++i) {

				var key = keys[i],
					variationAttrs = variations[key];

				variationRowHtml += '<div class="fpd-select-col"><select name="'+key+'"><option value="" disabled selected>'+key+'</option>';

				for(var j=0; j<variationAttrs.length; ++j) {
					variationRowHtml += '<option value="'+variationAttrs[j]+'">'+variationAttrs[j]+'</option>';
				}

				variationRowHtml += '</select></div>';

			}

			variationRowHtml += '<div><input type="number" class="fpd-quantity" step="1" min="1" value="1" /></div>';
			variationRowHtml += '<div class="fpd-remove-row"><span class="fpd-icon-close"></span></div>';
			variationRowHtml += '</div>';

		}

		$container.append('<div class="fpd-variations-list">'+variationRowHtml+'</div>')
		.prepend('<div class="fpd-clearfix"><span class="fpd-title fpd-left">'+fpdInstance.getTranslation('plus', 'bulk_add_variations_title')+'</span><span class="fpd-add-row fpd-btn fpd-right">'+fpdInstance.getTranslation('plus', 'bulk_add_variations_add')+'</span></div>');

		$container.on('click', '.fpd-add-row', function() {
			$container.children('.fpd-variations-list').append(variationRowHtml);
			_setTotalQuantity();
		});

		$container.on('click', '.fpd-remove-row', function() {

			var $thisRow = $(this).parents('.fpd-row:first');
			if($thisRow.siblings('.fpd-row').length > 0) {
				$thisRow.remove();
				_setTotalQuantity();
			}

		});

		$container.on('change', 'select', function() {

			var $this = $(this);

			$this.removeClass('fpd-error');

		});

		$container.on('change', '.fpd-quantity', function() {

			var $this = $(this);

			if( this.value < Number($this.attr('min')) ) {
				this.value = Number($this.attr('min'));
			}
			if(this.value == '') {
				this.value = 1;
			}

			_setTotalQuantity();

		});

		_setTotalQuantity();

	};

	_initialize();

};
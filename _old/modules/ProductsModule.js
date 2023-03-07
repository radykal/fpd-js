var FPDProductsModule = function(fpdInstance, $module) {

	'use strict';

	$ = jQuery;

	var instance = this,
		currentCategoryIndex = 0,
		$categoriesDropdown = $module.find('.fpd-product-categories'),
		$scrollArea = $module.children('.fpd-scroll-area'),
		$gridWrapper = $module.find('.fpd-grid'),
		lazyClass = fpdInstance.mainOptions.lazyLoad ? 'fpd-hidden' : '';

	var _initialize = function() {

		_checkProductsLength();

		$categoriesDropdown.children('input').keyup(function() {

			var $categoryItems = $categoriesDropdown.find('.fpd-dropdown-list .fpd-item');
			$categoryItems.hide();

			if(this.value.length === 0) {
				$categoryItems.show();
			}
			else {
				$categoryItems.filter(':containsCaseInsensitive("'+this.value+'")').show();
			}

		});

		$categoriesDropdown.on('click', '.fpd-dropdown-list .fpd-item', function() {

			var $this = $(this);

			currentCategoryIndex = $this.data('value');

			$this.parent().prevAll('.fpd-dropdown-current:first').val($this.text());
			instance.selectCategory(currentCategoryIndex);

			$this.siblings('.fpd-item').show();

			FPDUtil.refreshLazyLoad($gridWrapper, false);

		});

		fpdInstance.$container.on('productsSet', function(evt, products) {

			$categoriesDropdown.find('.fpd-dropdown-list .fpd-item').remove();
			$gridWrapper.empty();

			if(products && products.length > 0) {

				if(products[0].category !== undefined && products.length > 1) { //categories are used

					$module.addClass('fpd-categories-enabled');

					products.forEach(function(categoryItem, i) {
						$categoriesDropdown.find('.fpd-dropdown-list > .fpd-scroll-area')
						.append('<span class="fpd-item" data-value="'+i+'">'+categoryItem.category+'</span>');
					});

				}

				_checkProductsLength();

				instance.selectCategory(0);
			}

			FPDUtil.createScrollbar($categoriesDropdown.find('.fpd-dropdown-list .fpd-scroll-area'));

		});

		//when adding a product after products are set with productsSetup()
		fpdInstance.$container.on('productAdd', function(evt, views, category, catIndex) {

			if(catIndex == currentCategoryIndex) {
				_addGridProduct(views);
			}

		});

	};

	//adds a new product to the products grid
	var _addGridProduct = function(views) {

		var thumbnail = views[0].productThumbnail ? views[0].productThumbnail : views[0].thumbnail,
			productTitle = views[0].productTitle ? views[0].productTitle : views[0].title;

		var $lastItem = $('<div/>', {
							'class': 'fpd-item fpd-tooltip '+lazyClass,
							'data-title': productTitle,
							'data-source': thumbnail,
							'html': '<picture data-img="'+thumbnail+'"></picture>'
						}).appendTo($gridWrapper);

		$lastItem.click(function(evt) {

			evt.preventDefault();

			var $this = $(this),
				index = $gridWrapper.children('.fpd-item').index($this);

			if(fpdInstance.mainOptions.swapProductConfirmation) {

				var $confirm = FPDUtil.showModal(fpdInstance.getTranslation('modules', 'products_confirm_replacement'), false, 'confirm', fpdInstance.$modalContainer);

				$confirm.find('.fpd-confirm').text(fpdInstance.getTranslation('modules', 'products_confirm_button'))
				.click(function() {

					fpdInstance.selectProduct(index, currentCategoryIndex);
					$confirm.find('.fpd-modal-close').click();

				})

			}
			else {
				fpdInstance.selectProduct(index, currentCategoryIndex);
			}


		}).data('views', views);

		if(lazyClass === '') {
			FPDUtil.loadGridImage($lastItem.children('picture'), thumbnail);
		}
		else {
			FPDUtil.refreshLazyLoad($gridWrapper, false);
		}

		FPDUtil.updateTooltip($gridWrapper);

	};

	var _checkProductsLength = function() {

		if(fpdInstance.mainOptions.editorMode) { return; }

		var firstProductItem = fpdInstance.products[0],
			hideProductsModule = firstProductItem === undefined; //hide if no products exists at all

		if(firstProductItem !== undefined) { //at least one product exists

			if((!firstProductItem.hasOwnProperty('category') && fpdInstance.products.length < 2) //no categories are used
				|| (firstProductItem.hasOwnProperty('category') && firstProductItem.products.length < 2 && fpdInstance.products.length < 2)) //categories are used
			{
				hideProductsModule = true;
			}
			else {
				hideProductsModule = false;
			}

		}

		fpdInstance.$container.toggleClass('fpd-products-module-hidden', hideProductsModule);

	};

	this.selectCategory = function(index) {

		$scrollArea.find('.fpd-grid').empty();

		if(fpdInstance.products && fpdInstance.products.length > 0) {

			var productsObj;
			if(fpdInstance.products[0].category !== undefined) { //categories are used
				productsObj = fpdInstance.products[index].products;
				$categoriesDropdown.children('input').val(fpdInstance.products[index].category);
			}
			else {
				productsObj = fpdInstance.products;
			}

			productsObj.forEach(function(productItem) {
				_addGridProduct(productItem);
			});

			FPDUtil.createScrollbar($scrollArea);

		}

	};

	_initialize();

};
import {FPDUtil} from '../Util.js'
export default function FPDDesignsModule (fpdInstance, $module, dynamicDesignId) {

	'use strict';

	$ = jQuery;

	var instance = this,
		searchInLabel = '',
		$head = $module.find('.fpd-head'),
		$scrollArea = $module.find('.fpd-scroll-area'),
		$designsGrid = $module.find('.fpd-grid'),
		lazyClass = fpdInstance.mainOptions.lazyLoad ? 'fpd-hidden' : '',
		currentCategories = null,
		categoriesUsed = false,
		categoryLevelIndexes = [];

	var _initialize = function() {

		if(dynamicDesignId) {
			$module.attr('data-dynamic-designs-id', dynamicDesignId);
		}

		searchInLabel = fpdInstance.getTranslation('modules', 'designs_search_in').toUpperCase();

		$head.find('.fpd-input-search input').keyup(function() {

			if(this.value == '') { //no input, display all
				$designsGrid.children('.fpd-item').css('display', 'block');
			}
			else {
				//hide all items
				$designsGrid.children('.fpd-item').css('display', 'none');

				//only show by input value
			    var searchq = this.value.toLowerCase().trim().split(" ");

			    $designsGrid.children('.fpd-item').filter(function(){

			     	var fullsearchc = 0,
			     		self = this;

				 	$.each( searchq, function( index, value ){
					 	fullsearchc += $(self).is("[data-search*='"+value+"']");
					});

					if(fullsearchc==searchq.length) {return 1;}

			    }).css('display', 'block');
			}

		});

		$head.find('.fpd-back').on('click', function() {

			if($designsGrid.children('.fpd-category').length > 0) {
				categoryLevelIndexes.pop(); //remove last level index
			}

			//loop through design categories to receive parent category
			var displayCategories = fpdInstance.designs,
				parentCategory;

			categoryLevelIndexes.forEach(function(levelIndex) {

				parentCategory = displayCategories[levelIndex];
				displayCategories = parentCategory.category;

			});

			currentCategories = displayCategories;

			if(displayCategories) { //display first level categories
				_displayCategories(currentCategories, parentCategory);
			}

			//only toggle categories for top level
			if(parentCategory === undefined) {
				instance.toggleCategories();
			}

		});

		//when adding a product after products are set with productsSetup()
		fpdInstance.$container.on('designsSet', function(evt, designs) {

			if(!$.isArray(designs) || designs.length === 0) {
				return;
			}

			if(designs[0].hasOwnProperty('source')) { //check if first object is a design image

				$module.addClass('fpd-single-cat');
				_displayDesigns(designs);

			}
			else {

				if(designs.length > 1 || designs[0].category) { //display categories
					categoriesUsed = true;
					instance.toggleCategories();
				}
				else if(designs.length === 1 && designs[0].designs) { //display designs in category, if only one category exists
					$module.addClass('fpd-single-cat');
					_displayDesigns(designs[0].designs);
				}


			}

		})
		.on('viewSelect', function() {
			instance.toggleCategories();
		})

	};

	var _displayCategories = function(categories, parentCategory) {

		$scrollArea.find('.fpd-grid').empty();
		$head.find('.fpd-input-search input').val('');
		$module.removeClass('fpd-designs-active').addClass('fpd-categories-active');

		categories.forEach(function(category, i) {
			_addDesignCategory(category);
		});

		//set category title
		if(parentCategory) {
			$head.find('.fpd-input-search input').attr('placeholder', searchInLabel + ' ' + parentCategory.title.toUpperCase());
			$module.addClass('fpd-head-visible');
		}

		FPDUtil.refreshLazyLoad($designsGrid, false);
		FPDUtil.createScrollbar($scrollArea);

	};

	var _addDesignCategory = function(category) {

		var thumbnailHTML = category.thumbnail ? '<picture data-img="'+category.thumbnail+'"></picture>' : '',
			itemClass = category.thumbnail ? lazyClass : lazyClass+' fpd-title-centered',
			$lastItem = $('<div/>', {
							'class': 'fpd-category fpd-item '+lazyClass,
							'data-search': category.title.toLowerCase(),
							'html': thumbnailHTML+'<span>'+category.title+'</span>'
						}).appendTo($designsGrid);

		$lastItem.click(function(evt) {

			var $this = $(this),
				index = $this.parent().children('.fpd-item').index($this),
				selectedCategory = currentCategories[index];

			if(selectedCategory.category) {

				categoryLevelIndexes.push(index);
				currentCategories = selectedCategory.category;
				_displayCategories(currentCategories, selectedCategory);

			}
			else {
				_displayDesigns(selectedCategory.designs, selectedCategory.parameters);
			}

			$head.find('.fpd-input-search input').attr('placeholder', searchInLabel + ' ' +$this.children('span').text().toUpperCase());

		});

		if(lazyClass === '' && category.thumbnail) {
			FPDUtil.loadGridImage($lastItem.children('picture'), category.thumbnail);
		}

	};

	var _displayDesigns = function(designObjects, categoryParameters) {

		$scrollArea.find('.fpd-grid').empty();
		$head.find('.fpd-input-search input').val('');
		$module.removeClass('fpd-categories-active').addClass('fpd-designs-active fpd-head-visible');

		var categoryParameters = categoryParameters ? categoryParameters : {};

		designObjects.forEach(function(designObject) {

			designObject.parameters = $.extend({}, categoryParameters, designObject.parameters);
			_addGridDesign(designObject);

		});

		FPDUtil.refreshLazyLoad($designsGrid, false);
		FPDUtil.createScrollbar($scrollArea);
		FPDUtil.updateTooltip();

	};

	//adds a new design to the designs grid
	var _addGridDesign = function(design) {

		design.thumbnail = design.thumbnail === undefined ? design.source : design.thumbnail;

		var $lastItem = $('<div/>', {
							'class': 'fpd-item '+lazyClass,
							'data-title': design.title,
							'data-source': design.source,
							'data-search': design.title.toLowerCase(),
							'data-thumbnail': design.thumbnail,
							'html': '<picture data-img="'+design.thumbnail+'"></picture><span class="fpd-price"></span>'
						}).appendTo($designsGrid);

		$lastItem.click(function() {

			var $this = $(this);

			fpdInstance._addCanvasDesign(
				$this.data('source'),
				$this.data('title'),
				$this.data('parameters')
			);

		}).data('parameters', design.parameters);

		FPDUtil.setItemPrice($lastItem, fpdInstance);

		if(lazyClass === '') {
			FPDUtil.loadGridImage($lastItem.children('picture'), design.thumbnail);
		}

	};

	this.toggleCategories = function() {

		if(!categoriesUsed) {
			return;
		}

		categoryLevelIndexes = [];

		//reset to default view(head hidden, top-level cats are displaying)
		$module.removeClass('fpd-head-visible fpd-single-cat');

		currentCategories = fpdInstance.designs;
		_displayCategories(currentCategories);

		var catTitles = []; //stores category titles that are only visible for UZ or view

		if(fpdInstance.currentViewInstance) {

			var element = fpdInstance.currentViewInstance.currentElement;

			//element (upload zone) has design categories
			if(element && element.uploadZone && element.designCategories) {
				catTitles = fpdInstance.currentViewInstance.currentElement.designCategories;
			}
			//display ror dynamic designs
			else if(dynamicDesignId) {
				catTitles = fpdInstance.mainOptions.dynamicDesigns[dynamicDesignId].categories;
			}
			//all
			else {
				catTitles = fpdInstance.currentViewInstance.options.designCategories;
			}

		}

		//check for particular design categories
		var $allCats = $designsGrid.find('.fpd-category');
		if(catTitles.length > 0) {

			var $visibleCats = $allCats.hide().filter(function() {
				var title = $(this).children('span').text();
				return $.inArray(title, catTitles) > -1;
			}).show($visibleCats);

			if($visibleCats.length === 1) {
				$module.toggleClass('fpd-single-cat');
				$visibleCats.first().click();
				$module.find('.fpd-category').filter(function() { return $(this).css("display") == "block" }).click();
			}

		}
		else {
			$allCats.show();
		}

	};

	_initialize();

};
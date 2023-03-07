var FPDMainBar = function(fpdInstance, $mainBar, $modules, $draggableDialog) {

	this.$selectedModule = null;
	this.mainBarShowing = true;

	var _initialize = function() {

		$draggableDialog
		.toggleClass('fpd-hidden', fpdInstance.$container.hasClass('fpd-main-bar-container-enabled'));

		if(fpdInstance.mainOptions.uiTheme !== 'doyle' && fpdInstance.$container.hasClass('fpd-topbar') && !fpdInstance.$container.hasClass('fpd-main-bar-container-enabled') && fpdInstance.$container.filter('[class*="fpd-off-canvas-"]').length === 0) { //draggable dialog
			instance.setContentWrapper('draggable-dialog');
		}
		else {
			instance.setContentWrapper('sidebar');
		}
        

		//select module
		$nav.on('click', '> div', function(evt) {


			if((fpdInstance.$container.hasClass('fpd-topbar')
				|| fpdInstance.mainOptions.uiTheme == 'doyle')
				&& $this.hasClass('fpd-active')
			) { //hide dialog when clicking on active nav item

				fpdInstance.$container.removeClass('fpd-module-visible')
				$this.removeClass('fpd-active');
				instance.toggleDialog(false);

			}

		});


		//nav in upload zones (text, images, designs)
		instance.$content.on('click', '.fpd-bottom-nav > div', function() {

			var $this = $(this);

			$this.addClass('fpd-active').siblings().removeClass('fpd-active');

			var $selectedModule = $this.parent().next().children('[data-module="'+$this.data('module')+'"]').addClass('fpd-active');
			$selectedModule.siblings().removeClass('fpd-active');

			//short timeout, because fpd-grid must be visible
			setTimeout(function() {
				FPDUtil.refreshLazyLoad($selectedModule.find('.fpd-grid'), false);
			}, 10);


		});
        
		fpdInstance.$container.on('viewSelect', function() {

			if(instance.$selectedModule) {

				if(instance.$selectedModule.filter('[data-module="manage-layers"]').length > 0) {
					FPDLayersModule.createList(fpdInstance, instance.$selectedModule);
				}
				else if(instance.$selectedModule.filter('[data-module="text-layers"]').length > 0) {
					FPDTextLayersModule.createList(fpdInstance, instance.$selectedModule);
				}
				//PLUS
				else if(typeof FPDNamesNumbersModule !== 'undefined'
					&& instance.$selectedModule.filter('[data-module="names-numbers"]').length > 0) {
					FPDNamesNumbersModule.setup(fpdInstance, instance.$selectedModule);
				}

			}

			/**
		     * Gets fired as soon as the list with the layers has been updated. Is fired when a view is selected or an object has been added/removed.
		     *
		     * @event FancyProductDesigner#layersListUpdate
		     * @param {Event} event
		     */
			fpdInstance.$container.trigger('layersListUpdate');

		});

		fpdInstance.$container.on('fabricObject:added fabricObject:removed', function(evt, element) {

			if(fpdInstance.productCreated && !element._ignore) {

				if(instance.$selectedModule) {
					if(instance.$selectedModule.filter('[data-module="manage-layers"]').length > 0) {
						FPDLayersModule.createList(fpdInstance, instance.$selectedModule);
					}
					else if(instance.$selectedModule.filter('[data-module="text-layers"]').length > 0) {
						FPDTextLayersModule.createList(fpdInstance, instance.$selectedModule);
					}
				}

				fpdInstance.$container.trigger('layersListUpdate');

			}

		});

	}

	//call module by name
	this.callModule = function(name, dynamicDesignsId) {
        
		instance.$selectedModule = instance.$content.children('div').removeClass('fpd-active')
		.filter(dynamicDesignsId ? '[data-dynamic-designs-id="'+dynamicDesignsId+'"]' : '[data-module="'+name+'"]:not([data-dynamic-designs-id])')
		.addClass('fpd-active');
        
		if(fpdInstance.mainOptions.uiTheme !== 'doyle' && instance.$content.parent('.fpd-draggable-dialog').length > 0) {

			if($draggableDialog.attr('style') === undefined || $draggableDialog.attr('style') === '') {

				var topOffset = fpdInstance.$productStage.offset().top;
				if($draggableDialog.parent('.fpd-modal-product-designer').length > 0) {
					topOffset = parseInt($draggableDialog.siblings('.fpd-modal-wrapper').css('paddingTop'))+ $mainBar.height();
				}

				$draggableDialog.css('top', topOffset);
			}

			$draggableDialog.addClass('fpd-active')
			.find('.fpd-dialog-title').text($selectedNavItem.find('.fpd-label').text());

		}

		if(name === 'text') {
			instance.$selectedModule.find('textarea').focus();
		}
		else if(name === 'manage-layers') {

			if(fpdInstance.productCreated) {
				FPDLayersModule.createList(fpdInstance, instance.$selectedModule);
			}

		}
		else if(name === 'text-layers') {

			if(fpdInstance.productCreated) {
				FPDTextLayersModule.createList(fpdInstance, instance.$selectedModule);
			}

		}
		else if(typeof FPDNamesNumbersModule !== 'undefined' && name === 'names-numbers') {

			if(fpdInstance.productCreated) {
				FPDNamesNumbersModule.setup(fpdInstance, instance.$selectedModule);
			}

		}

		instance.toggleDialog(true);
		FPDUtil.refreshLazyLoad(instance.$selectedModule.find('.fpd-grid'), false);

	};

	this.callSecondary = function(className) {
        
		instance.callModule('secondary');

		instance.$content.children('.fpd-secondary-module').children('.'+className).addClass('fpd-active')
		.siblings().removeClass('fpd-active');

		var label = null;
		if(className === 'fpd-upload-zone-adds-panel') {
			instance.$content.find('.fpd-upload-zone-adds-panel .fpd-bottom-nav > :not(.fpd-hidden)').first().click();
		}
		else if(className === 'fpd-saved-designs-panel') {
			label = fpdInstance.getTranslation('actions', 'load')
		}

		if(fpdInstance.mainOptions.uiTheme !== 'doyle' && instance.$content.parent('.fpd-draggable-dialog').length > 0 && label) {

			$draggableDialog.addClass('fpd-active')
			.find('.fpd-dialog-title').text(label);

		}

		fpdInstance.$container.trigger('secondaryModuleCalled', [className, instance.$content.children('.fpd-secondary-module').children('.fpd-active')]);

	};

	this.setContentWrapper = function(wrapper) {

		if(wrapper === 'sidebar') {

			if($nav.children('.fpd-active').length === 0) {
				$nav.children().first().addClass('fpd-active');
			}

		}
		else if(wrapper === 'draggable-dialog') {

			$nav.removeClass('fpd-hidden');

		}

		//if only modules exist, select it and hide nav
		if(instance.currentModules.length <= 1 && !fpdInstance.$container.hasClass('fpd-topbar')) {
			$nav.addClass('fpd-hidden');
		}
		else {
			$nav.removeClass('fpd-hidden');
		}

		$nav.children('.fpd-active').click();

	};

	this.toggleDialog = function(toggle) {

		//off-canvas is enabled
		if(fpdInstance.$container.filter('[class*="fpd-off-canvas-"]').length > 0) {


			//deselect element when main bar is showing
			if(!toggle && instance.mainBarShowing) {
				fpdInstance.deselectElement();
			}

		}

		if(!toggle) {
			$nav.children('.fpd-active').removeClass('fpd-active');
		}

		instance.mainBarShowing = toggle;

	};

	this.toggleUploadZonePanel = function(toggle) {
                
		toggle = typeof toggle === 'undefined' ? true : toggle;

		//do nothing when custom image is loading
		if(fpdInstance._loadingCustomImage) {
			return;
		}

		if(toggle) {
			instance.callSecondary('fpd-upload-zone-adds-panel');
		}
		else {

			fpdInstance.currentViewInstance.currentUploadZone = null;
			instance.toggleDialog(false);

		}

	};

	this.toggleUploadZoneAdds = function(customAdds) {

		var $uploadZoneAddsPanel = instance.$content.find('.fpd-upload-zone-adds-panel');

		$uploadZoneAddsPanel.find('.fpd-add-image').toggleClass('fpd-hidden', !Boolean(customAdds.uploads));
		$uploadZoneAddsPanel.find('.fpd-add-text').toggleClass('fpd-hidden', !Boolean(customAdds.texts));
		$uploadZoneAddsPanel.find('.fpd-add-design').toggleClass('fpd-hidden', !Boolean(customAdds.designs));

		if(fpdInstance.currentElement.price) {
			$uploadZoneAddsPanel.find('[data-module="text"] .fpd-btn > .fpd-price')
			.html(' - '+fpdInstance.formatPrice(fpdInstance.currentElement.price));
		}
		else {
			$uploadZoneAddsPanel.find('[data-module="text"] .fpd-btn > .fpd-price').html('');
		}

		if(fpdInstance.UZmoduleInstance_designs) {
			fpdInstance.UZmoduleInstance_designs.toggleCategories();
		}

		//select first visible add panel
		$uploadZoneAddsPanel.find('.fpd-off-canvas-nav > :not(.fpd-hidden)').first().click();

	};


};

FPDMainBar.availableModules = [
	'products',
	'images',
	'text',
	'designs',
	'manage-layers',
	'text-layers',
	'layouts'
];
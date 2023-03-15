var FPDMainBar = function(fpdInstance, $mainBar, $modules, $draggableDialog) {

	var _initialize = function() {

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

	};

};
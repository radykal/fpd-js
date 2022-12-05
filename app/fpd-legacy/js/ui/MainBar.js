import FPDDrawingModule from '../addons/plus/DrawingModule.js'
import FPDDynamicViews from '../addons/plus/DynamicViews.js'
import {FPDNamesNumbersModule} from '../addons/plus/NamesNumbersModule.js'
import FancyProductDesigner from '../FancyProductDesigner.js'
import FPDDesignsModule from'../modules/DesignsModule.js'
import FPDImagesModule from'../modules/ImagesModule.js'
import {FPDLayersModule} from'../modules/LayersModule.js'
import FPDLayoutsModule from'../modules/LayoutsModule.js'
import FPDProductsModule from'../modules/ProductsModule.js'
import {FPDTextLayersModule} from'../modules/TextLayersModule.js'
import FPDTextModule from'../modules/TextModule.js'
import {FPDUtil} from '../Util.js'

export default function FPDMainBar (fpdInstance, $mainBar, $modules, $draggableDialog) {

	'use strict';

	$ = jQuery;

	var instance = this,
		$body = $('body'),
		$nav = $mainBar.children('.fpd-navigation');

	this.currentModules = fpdInstance.mainOptions.mainBarModules;
	this.$selectedModule = null;
	this.$container = $mainBar;
	instance.$content = $('<div class="fpd-content"></div>');
	this.mainBarShowing = true;

	var _initialize = function() {

		$draggableDialog
		.addClass('fpd-grid-columns-'+fpdInstance.mainOptions.gridColumns)
		.toggleClass('fpd-hidden', fpdInstance.$container.hasClass('fpd-main-bar-container-enabled'));

		if(fpdInstance.mainOptions.uiTheme !== 'doyle' && fpdInstance.$container.hasClass('fpd-topbar') && !fpdInstance.$container.hasClass('fpd-main-bar-container-enabled') && fpdInstance.$container.filter('[class*="fpd-off-canvas-"]').length === 0) { //draggable dialog
			instance.setContentWrapper('draggable-dialog');
		}
		else {
			instance.setContentWrapper('sidebar');
		}


		if(fpdInstance.$container.filter('[class*="fpd-off-canvas-"]').length > 0) {

			var touchStart = 0,
				panX = 0,
				closeStartX = 0,
				$closeBtn = $mainBar.children('.fpd-close-off-canvas');

			instance.$content.on('touchstart', function(evt) {

				touchStart = evt.originalEvent.touches[0].pageX;
				closeStartX = parseInt($closeBtn.css(fpdInstance.$container.hasClass('fpd-off-canvas-left') ? 'left' : 'right'));

			})
			.on('touchmove', function(evt) {

				evt.preventDefault();

				var moveX = evt.originalEvent.touches[0].pageX;
					panX = touchStart-moveX,
					targetPos = fpdInstance.$container.hasClass('fpd-off-canvas-left') ? 'left' : 'right';

				panX = Math.abs(panX) < 0 ? 0 : Math.abs(panX);
				instance.$content.css(targetPos, -panX);
				$closeBtn.css(targetPos, closeStartX - panX);

			})
			.on('touchend', function(evt) {

				var targetPos = fpdInstance.$container.hasClass('fpd-off-canvas-left') ? 'left' : 'right';

				if(Math.abs(panX) > 100) {

					instance.toggleDialog(false);

				}
				else {
					instance.$content.css(targetPos, 0);
					$closeBtn.css(targetPos, closeStartX);
				}

				panX = 0;

			});

		}
        
        let startYDown = null;
        let yDiff = null;
        
//         instance.$content
//         .on('touchstart', '> .fpd-module', function(evt) {
//             yDiff = null;
//             startYDown = evt.originalEvent.touches[0].clientY;
//         })
//         .on('touchmove', '> .fpd-module', function(evt) {
//             
//             if(startYDown) {
//                 
//                 let yMove = evt.originalEvent.touches[0].clientY;
//                 yDiff = yMove - startYDown;
//                 
//                 $mainBar.css('top', yDiff+'px');
//                 
//             }
// 
//         })
//         .on('touchend', '> .fpd-module', function(evt) {
//             if(yDiff) {
//                 
//                 if(yDiff > 50) {
//                     instance.toggleDialog(false);
//                 }
//                 
//                 $mainBar.css('marginTop', '')
//         
//             }
//         });

		//close off-canvas
		$mainBar.on('click', '.fpd-close-off-canvas', function(evt) {

			evt.stopPropagation();

			$nav.children('div').removeClass('fpd-active');
			instance.toggleDialog(false);

		});

		var $dialogContainer = fpdInstance.mainOptions.modalMode ? $('.fpd-modal-product-designer') : $body;
		$dialogContainer.append($draggableDialog);

		$draggableDialog.draggable({
			handle: $draggableDialog.find('.fpd-dialog-head'),
			containment: $dialogContainer
		});

		//select module
		$nav.on('click', '> div', function(evt) {

			evt.stopPropagation();

			var $this = $(this);

			fpdInstance.deselectElement();

			if(fpdInstance.currentViewInstance) {
				fpdInstance.currentViewInstance.currentUploadZone = null;
			}

			instance.$content.find('.fpd-manage-layers-panel')
			.find('.fpd-current-color, .fpd-path-colorpicker').spectrum('destroy');

			if((fpdInstance.$container.hasClass('fpd-topbar')
				|| fpdInstance.mainOptions.uiTheme == 'doyle')
				&& $this.hasClass('fpd-active')
			) { //hide dialog when clicking on active nav item

				fpdInstance.$container.removeClass('fpd-module-visible')
				$this.removeClass('fpd-active');
				instance.toggleDialog(false);

			}
			else {
				instance.callModule($this.data('module'), $this.data('dynamic-designs-id'));
			}

		});

		//prevent document scrolling when in dialog content
		$draggableDialog.on('mousewheel', function(evt) {
			 evt.preventDefault();
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

		//close dialog
		$body.on('click touchend', '.fpd-close-dialog', function() {

			if(fpdInstance.currentViewInstance && fpdInstance.currentViewInstance.currentUploadZone) {
				fpdInstance.currentViewInstance.deselectElement();
			}
			instance.toggleDialog(false);

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

		instance.setup(instance.currentModules);

	}

	//call module by name
	this.callModule = function(name, dynamicDesignsId) {

		var $selectedNavItem = $nav.children('div').removeClass('fpd-active')
		.filter(dynamicDesignsId ? '[data-dynamic-designs-id="'+dynamicDesignsId+'"]' : '[data-module="'+name+'"]:not([data-dynamic-designs-id])')
		.addClass('fpd-active');
        
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

		$draggableDialog.removeClass('fpd-active');

		if(wrapper === 'sidebar') {

			if($nav.children('.fpd-active').length === 0) {
				$nav.children().first().addClass('fpd-active');
			}

			instance.$content.appendTo($mainBar);

		}
		else if(wrapper === 'draggable-dialog') {

			instance.$content.appendTo($draggableDialog);
			$nav.removeClass('fpd-hidden');

		}

		//if only modules exist, select it and hide nav
		if(instance.currentModules.length <= 1 && !fpdInstance.$container.hasClass('fpd-topbar')) {
			$nav.addClass('fpd-hidden');
		}
		else {
			$nav.removeClass('fpd-hidden');
		}

		//toogle tooltips
		$nav.children().each(function(i, navItem) {

			var $navItem = $(navItem);
			$navItem.filter('.tooltipstered').tooltipster('destroy');
			if(fpdInstance.$container.hasClass('fpd-sidebar')) {
				$navItem.addClass('fpd-tooltip').attr('title', $navItem.children('.fpd-label').text());
			}
			else {
				$navItem.removeClass('fpd-tooltip').removeAttr('title');
			}

		});

		FPDUtil.updateTooltip($nav);

		$nav.children('.fpd-active').click();

	};

	this.toggleDialog = function(toggle) {

		toggle = typeof toggle === 'undefined' ? true : toggle;

		//top bar is enabled
		if(fpdInstance.mainOptions.uiTheme !== 'doyle' && fpdInstance.$container.hasClass('fpd-topbar') && fpdInstance.$container.filter('[class*="fpd-off-canvas-"]').length === 0) {

			$draggableDialog.toggleClass('fpd-active', toggle);

		}
		else {

			fpdInstance.$container.toggleClass('fpd-module-visible', toggle)
			.children('.fpd-content').toggleClass('fpd-active', toggle)

		}

		//off-canvas is enabled
		if(fpdInstance.$container.filter('[class*="fpd-off-canvas-"]').length > 0) {

			instance.$container.toggleClass('fpd-show', toggle)
			.children('.fpd-close-off-canvas').removeAttr('style');
			instance.$content.removeAttr('style')
			.height(fpdInstance.$mainWrapper.height());

			if($nav.children('div').length === 0) {
				instance.$content.css('top', 0);
			}
			else {
				instance.$content.css('top', $nav.height());
			}

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

	this.setup = function(modules) {

		instance.currentModules = modules;

		var selectedModule = fpdInstance.mainOptions.initialActiveModule ? fpdInstance.mainOptions.initialActiveModule : '';

		//if only one modules exist, select it and hide nav
		if(instance.currentModules.length <= 1 && !fpdInstance.$container.hasClass('fpd-topbar')) {

			selectedModule = instance.currentModules[0] ? instance.currentModules[0] : '';
			$nav.addClass('fpd-hidden');

		}
		else if(fpdInstance.$container.hasClass('fpd-sidebar') && selectedModule == '') {

			selectedModule = $nav.children().first().data('module');

		}
		else {
			$nav.removeClass('fpd-hidden');
		}

		$nav.empty();
		instance.$content.empty();

		//add selected modules
		modules.forEach(function(module) {

			var moduleType = module,
				$moduleIcon = $('<span class="fpd-nav-icon"></span>'),
				navItemTitle = '',
				dynamicDesignId = null,
				moduleAttrs = '',
				useFpdIcon = true;

			if(module.search('designs') == 0) {

				moduleType = 'designs';

				if(!FPDUtil.isEmpty(fpdInstance.mainOptions.dynamicDesigns) && module.search('designs_') == 0) {

					dynamicDesignId = module.split('_').pop();

					if(dynamicDesignId && fpdInstance.mainOptions.dynamicDesigns[dynamicDesignId]) {

						var dynamicDesignConfig = fpdInstance.mainOptions.dynamicDesigns[dynamicDesignId];

						navItemTitle = dynamicDesignConfig.name;
						moduleAttrs += ' data-dynamic-designs-id="'+dynamicDesignId+'"';

						if(!FPDUtil.isEmpty(dynamicDesignConfig.icon) && dynamicDesignConfig.icon.indexOf('.svg') != -1) {

							useFpdIcon = false;

							$.get(dynamicDesignConfig.icon, function(data) {
								$moduleIcon.append($(data).children('svg'));
							});
						}

					}
					else { //dynamic designs module does not exist
						return;
					}
				}

			}

			var $module = $modules.children('[data-module="'+moduleType+'"]'),
				$moduleClone = $module.clone(),
				moduleInstance;

			if(!dynamicDesignId) {
				navItemTitle = $module.data('title');
			}

			if(useFpdIcon) {
				$moduleIcon.addClass($module.data('moduleicon'));
			}

			moduleAttrs += fpdInstance.$container.hasClass('fpd-sidebar') ? ' class="fpd-tooltip"' : '';
			moduleAttrs += fpdInstance.$container.hasClass('fpd-sidebar') ? ' title="'+navItemTitle+'"' : '';

			$nav.append('<div data-module="'+moduleType+'" '+moduleAttrs+'><span class="fpd-label">'+navItemTitle+'</span></div>');
			$nav.children('div:last').prepend($moduleIcon);

			instance.$content.append($moduleClone);

			if(moduleType === 'products') {
				moduleInstance = new FPDProductsModule(fpdInstance, $moduleClone);
			}
			else if(moduleType === 'text') {
				moduleInstance = new FPDTextModule(fpdInstance, $moduleClone);
			}
			else if(moduleType === 'designs') {
				moduleInstance = new FPDDesignsModule(fpdInstance, $moduleClone, dynamicDesignId);
			}
			else if(moduleType === 'images') {
				moduleInstance = new FPDImagesModule(fpdInstance, $moduleClone);
			}
			else if(moduleType === 'layouts') {
				moduleInstance = new FPDLayoutsModule(fpdInstance, $moduleClone);
			}
			//PLUS
			else if(typeof FPDDrawingModule !== 'undefined' && moduleType === 'drawing') {
				moduleInstance = new FPDDrawingModule(fpdInstance, $moduleClone);
			}
			else if(typeof FPDDynamicViews !== 'undefined' && moduleType === 'dynamic-views') {
				moduleInstance = new FPDDynamicViews(fpdInstance, $moduleClone);
			}

			if(moduleInstance) {
				fpdInstance['moduleInstance_'+module] = moduleInstance;
			}

		});

		if(instance.$content.children('[data-module="manage-layers"]').length === 0) {
			instance.$content.append($modules.children('[data-module="manage-layers"]').clone());
		}

		instance.$content.append($modules.children('[data-module="secondary"]').clone());

		//add upload zone modules
		var uploadZoneModules = ['images', 'text', 'designs'];
		for(var i=0; i < uploadZoneModules.length; ++i) {

			var module = uploadZoneModules[i],
				$module = $modules.children('[data-module="'+module+'"]'),
				$moduleClone = $module.clone(),
				moduleInstance;

			instance.$content.find('.fpd-upload-zone-content').append($moduleClone);

			if(module === 'text') {
				moduleInstance = new FPDTextModule(fpdInstance, $moduleClone);
			}
			else if(module === 'designs') {
				moduleInstance = new FPDDesignsModule(fpdInstance, $moduleClone);
			}
			else if(module === 'images') {
				moduleInstance = new FPDImagesModule(fpdInstance, $moduleClone);
			}

			if(moduleInstance) {
				fpdInstance['UZmoduleInstance_'+module] = moduleInstance;
			}

		}

		if(fpdInstance.$container.hasClass('fpd-device-desktop') || fpdInstance.$container.parents('.ui-composer-page').length) {
			$nav.children('[data-module="'+selectedModule+'"]').click();
		}

	};

	_initialize();

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
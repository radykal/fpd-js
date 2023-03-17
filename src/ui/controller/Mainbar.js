import MainbarView from '../view/Mainbar.js';
import UIManager from '../UIManager';
import ModuleWrapper from './ModuleWrapper';

import { addEvents, addElemClasses, removeElemClasses, toggleElemClasses } from '../../utils.js';

export default class Mainbar extends EventTarget {
    
    #dialogContainer = null;
    #draggableDialog = null;
    #isDragging = false;
    #dragX = 0;
    #dragY = 0;
    #diffX = 0;
    #diffY = 0;
    #draggableDialogEnabled = false;
    #offCanvasEnabled = false;
    contentElem = null;
    navElem = null;
    currentModuleKey = '';
    
    constructor(fpdInstance) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        
        const fpdContainer = fpdInstance.container;
                
        this.container = document.createElement("fpd-main-bar");
        fpdContainer.append(this.container);
        
        this.contentElem = this.container.querySelector('.fpd-module-content');
        this.navElem = this.container.querySelector('.fpd-navigation');
        
        this.currentModules = fpdInstance.mainOptions.mainBarModules;
        
        //draggable dialog
        this.#dialogContainer = document.querySelector(this.fpdInstance.mainOptions.modalMode ? '.fpd-modal-product-designer' : 'body');
        
        this.#draggableDialog = document.querySelector(".fpd-draggable-dialog");
        this.#dialogContainer.append(this.#draggableDialog);
        
        //prevent right click context menu & document scrolling when in dialog content
        // addEvents(
        //     this.#draggableDialog,
        //     ['contextmenu'],
        //     evt => evt.preventDefault()
        // )
        
        addEvents(
            this.#draggableDialog,
            ['mousedown', 'touchstart'],
            this.#draggableDialogStart.bind(this)
        )
        
        addEvents(
            this.#draggableDialog,
            ['mouseup', 'touchend'],
            this.#draggableDialogEnd.bind(this)
        )
        
        addEvents(
            document,
            ['mousemove', 'touchmove'],
            this.#draggableDialogMove.bind(this)
        )
        
        addEvents(
            this.#draggableDialog.querySelector('.fpd-close-dialog'),
            ['click', 'touchstart'],
            this.#closeDialog.bind(this)
        )
        
        addEvents(
            this.container.querySelector('.fpd-close-off-canvas'),
            'click',
            this.#closeDialog.bind(this)
        )
        
        if(fpdContainer.classList.contains('fpd-off-canvas')) {
            
            let touchStart = 0,
                panX = 0,
                closeStartX = 0;
            
            this.contentElem.addEventListener('touchstart', (evt) => {
            
                touchStart = evt.touches[0].pageX;
                addElemClasses(this.container, ['fpd-is-dragging']);
            
            })
            this.contentElem.addEventListener('touchmove', (evt) => {
            
                evt.preventDefault();
            
                let moveX = evt.touches[0].pageX;
                    panX = touchStart-moveX;
                
                panX = Math.abs(panX) < 0 ? 0 : Math.abs(panX);
                this.contentElem.style.left = -panX+'px';
                this.contentElem.previousElementSibling.style.left = this.contentElem.clientWidth - panX+'px';
            
            })
            this.contentElem.addEventListener('touchend', (evt) => {
            
                if(Math.abs(panX) > 100) {
                    
                    this.toggleContentDisplay(false);
            
                }
                else {
                    this.contentElem.style.left = '0px';
                    this.contentElem.previousElementSibling.style.left = this.contentElem.clientWidth+'px';
                }
            
                panX = 0;
                removeElemClasses(this.container, ['fpd-is-dragging']);
            
            });
               
        }
        
        this.updateContentWrapper();
        this.setup(this.currentModules);
    }
    
    #draggableDialogStart(evt) {
                
        if(this.#draggableDialog.querySelector('.fpd-dialog-drag-handle').contains(evt.target)) {
            
            evt.preventDefault();
            
            this.#isDragging = true;
            
            this.#dragX = evt.touches ? event.touches[0].clientX : evt.clientX;
            this.#dragY = evt.touches ? event.touches[0].clientY : evt.clientY;        
            this.#diffX = this.#dragX - this.#draggableDialog.offsetLeft;
            this.#diffY = this.#dragY - this.#draggableDialog.offsetTop;
            
        }
        
    }
    
    #draggableDialogMove(evt) {
        
        if (!this.#isDragging) return;
        
        const containerWidth = this.#dialogContainer.clientWidth < window.innerWidth ? window.innerWidth : this.#dialogContainer.clientWidth;
        const containerHeight = this.#dialogContainer.clientHeight < window.innerHeight ? window.innerHeight : this.#dialogContainer.clientHeight;
        const rightBarrier = containerWidth - this.#draggableDialog.clientWidth;
        const bottomBarrier = containerHeight - this.#draggableDialog.clientHeight;
        
        const newMouseX = evt.touches ? event.touches[0].clientX : evt.clientX;
        const newMouseY = evt.touches ? event.touches[0].clientY : evt.clientY;
        
        let newElmTop = newMouseY - this.#diffY;
        let newElmLeft = newMouseX - this.#diffX;
        
        if(newElmLeft < 0) {
            newElmLeft = 0;
        }    
        if(newElmTop < 0) {
            newElmTop = 0;  
        }
        if( newElmLeft > rightBarrier) {
            newElmLeft = rightBarrier;
        } 
        if(newElmTop > bottomBarrier) {
            newElmTop = bottomBarrier;
        } 
        
        this.#draggableDialog.style.top = newElmTop + "px";
        this.#draggableDialog.style.left = newElmLeft + "px";
        
    }
    
    #draggableDialogEnd(evt) {
        
        this.#isDragging = false;
        
    }
    
    #navItemSelect(evt) {
        
        evt.stopPropagation();
        
        this.fpdInstance.deselectElement();
        
        if(this.fpdInstance.currentViewInstance) {
            this.fpdInstance.currentViewInstance.currentUploadZone = null;
        }
        
        // hide dialog when clicking on active nav item
        if(evt.currentTarget.classList.contains('fpd-active') && this.contentClosable) {
            
            this.toggleContentDisplay(false);
            
        }
        else {
            
            this.callModule(
                evt.currentTarget.dataset.module,
                evt.currentTarget.dataset.dynamicdesignsid,
            );
            
        }
        
    }
    
    #closeDialog() {
                
        if(this.fpdInstance.currentViewInstance && this.fpdInstance.currentViewInstance.currentUploadZone) {
            this.fpdInstance.currentViewInstance.deselectElement();
        }
        
        this.toggleContentDisplay(false);
        
    }
    
    callModule(name, dynamicDesignsId=null) {
        
        //unselect current module
        removeElemClasses(
            this.navElem.querySelectorAll('.fpd-nav-item'), 
            ['fpd-active']
        );
        
        removeElemClasses(
            Array.from(this.contentElem.children), 
            ['fpd-active']
        );
        
        let selectedNavItem;
        if(dynamicDesignsId) {
            
            selectedNavItem = addElemClasses(
                this.navElem.querySelector('.fpd-nav-item[data-dynamic-designs-id="'+dynamicDesignsId+'"]'),
                ['fpd-active']
            );
            
        }
        else {
            
            selectedNavItem = addElemClasses(
                this.navElem.querySelector('.fpd-nav-item[data-module="'+name+'"]'),
                ['fpd-active']
            );
            
            addElemClasses(
                this.contentElem.querySelector('fpd-module-'+name),
                ['fpd-active']
            );
                        
        }
                
        this.toggleContentDisplay();
        this.currentModuleKey = name;
        
    }
    
    get contentClosable() {
        
        const fpdContainer = this.fpdInstance.container;
        
        return this.#offCanvasEnabled || this.#draggableDialogEnabled || fpdContainer.classList.contains('fpd-layout-small');
        
    }
    
    callSecondary() {
        
        this.callModule('secondary');
        
        // instance.$content.children('.fpd-secondary-module').children('.'+className).addClass('fpd-active')
        // .siblings().removeClass('fpd-active');
        // 
        // var label = null;
        // if(className === 'fpd-upload-zone-adds-panel') {
        //     instance.$content.find('.fpd-upload-zone-adds-panel .fpd-bottom-nav > :not(.fpd-hidden)').first().click();
        // }
        // else if(className === 'fpd-saved-designs-panel') {
        //     label = fpdInstance.getTranslation('actions', 'load')
        // }
        // 
        // if(fpdInstance.mainOptions.uiTheme !== 'doyle' && instance.$content.parent('.fpd-draggable-dialog').length > 0 && label) {
        // 
        //     $draggableDialog.addClass('fpd-active')
        //     .find('.fpd-dialog-title').text(label);
        // 
        // }
        // 
        // fpdInstance.$container.trigger('secondaryModuleCalled', [className, instance.$content.children('.fpd-secondary-module').children('.fpd-active')]);
        
    }
    
    toggleContentDisplay(toggle=true) {
        
        const fpdContainer = this.fpdInstance.container;
        
        toggleElemClasses(fpdContainer, ['fpd-module-visible'], toggle);
        
        if(this.contentClosable) {
            
            if(!toggle) {
                
                removeElemClasses(
                    this.navElem.querySelectorAll('.fpd-nav-item'), 
                    ['fpd-active']
                );
                
            }
            
        }       
        
        if(this.#offCanvasEnabled) {
            
            //deselect element when main bar is showing
            if(!toggle && this.currentModuleKey.length) {
                this.fpdInstance.deselectElement();
            }
            
            this.contentElem.style.removeProperty('left');
            this.contentElem.previousElementSibling.style.removeProperty('left');
            this.contentElem.style.height = this.fpdInstance.mainWrapper.container.clientHeight+'px';
            this.container.classList.toggle('fpd-show', toggle);
            
        }
        else if(this.#draggableDialogEnabled) {
            
            if(toggle) {
                this.#draggableDialog.querySelector('.fpd-dialog-title').innerText = this.navElem.querySelector('.fpd-nav-item.fpd-active .fpd-label').innerText;
            }
            
            this.#draggableDialog.classList.toggle('fpd-show', toggle);
            
        }
        
        if(!toggle) {
            this.currentModuleKey = '';
        }
        
    }
    
    updateContentWrapper() {
        
        const fpdContainer = this.fpdInstance.container;
            
        this.toggleContentDisplay(false);
        this.#offCanvasEnabled = false;
        this.#draggableDialogEnabled = false;
        
        removeElemClasses(
            this.navElem.querySelectorAll('.fpd-nav-item'), 
            ['fpd-active']
        );
        
        if(fpdContainer.classList.contains('fpd-off-canvas')) {
            
            this.#offCanvasEnabled = true;
            this.container.append(this.contentElem);
            
        }
        else if(fpdContainer.classList.contains('fpd-sidebar')) {
            
            this.container.append(this.contentElem);
            
        }
        else {
            
            this.#draggableDialogEnabled = true;
            this.#draggableDialog.append(this.contentElem);
            
        }
                
    }
    
    toggleUploadZonePanel(toggle=true) {
                    
        //do nothing when custom image is loading
        if(this.fpdInstance.loadingCustomImage) {
            return;
        }
    
        if(toggle) {
            this.callSecondary('fpd-upload-zone-adds-panel');
        }
        else {
    
            this.fpdInstance.currentViewInstance.currentUploadZone = null;
            this.toggleContentDisplay(false);
    
        }
    
    }
    
    toggleUploadZoneAdds(customAdds) {
    
    //     var $uploadZoneAddsPanel = instance.$content.find('.fpd-upload-zone-adds-panel');
    // 
    //     $uploadZoneAddsPanel.find('.fpd-add-image').toggleClass('fpd-hidden', !Boolean(customAdds.uploads));
    //     $uploadZoneAddsPanel.find('.fpd-add-text').toggleClass('fpd-hidden', !Boolean(customAdds.texts));
    //     $uploadZoneAddsPanel.find('.fpd-add-design').toggleClass('fpd-hidden', !Boolean(customAdds.designs));
    // 
    //     if(fpdInstance.currentElement.price) {
    //         $uploadZoneAddsPanel.find('[data-module="text"] .fpd-btn > .fpd-price')
    //         .html(' - '+fpdInstance.formatPrice(fpdInstance.currentElement.price));
    //     }
    //     else {
    //         $uploadZoneAddsPanel.find('[data-module="text"] .fpd-btn > .fpd-price').html('');
    //     }
    // 
    //     if(fpdInstance.UZmoduleInstance_designs) {
    //         fpdInstance.UZmoduleInstance_designs.toggleCategories();
    //     }
    // 
    //     //select first visible add panel
    //     $uploadZoneAddsPanel.find('.fpd-off-canvas-nav > :not(.fpd-hidden)').first().click();
    
    }
    
    setup(modules=[]) {
                
        let selectedModule = this.fpdInstance.mainOptions.initialActiveModule ? this.fpdInstance.mainOptions.initialActiveModule : '';
        
        const navElem = this.container.querySelector('.fpd-navigation');
        
        //if only one modules exist, select it and hide nav
        if(this.currentModules.length <= 1 && !this.fpdInstance.container.classList.contains('fpd-topbar')) {
        
            selectedModule = this.currentModules[0] ? this.currentModules[0] : '';
            navElem.classList.add('fpd-hidden');
        
        }
        else if(this.fpdInstance.container.classList.contains('fpd-sidebar') && selectedModule == '') {
        
            selectedModule = this.currentModules[0] ? this.currentModules[0] : '';
        
        }
        else {
            navElem.classList.remove('fpd-hidden');
        }
        
        navElem.innerHTML = this.contentElem.innerHTML = '';
        
        //add selected modules
        modules.forEach((moduleType) => {
        
                let dynamicDesignId = null,
                    moduleAttrs = {},
                    navItemTitle = '';
                        
            const moduleWrapper = new ModuleWrapper(this.fpdInstance, this.contentElem, moduleType);
            
            if(!moduleWrapper.moduleInstance)
                return;
            
            //create nav item element            
            const navItemElem = document.createElement('div');
            navItemElem.classList.add('fpd-nav-item');
            navItemElem.dataset.module = moduleType;
            navItemElem.addEventListener('click', this.#navItemSelect.bind(this));
            navElem.appendChild(navItemElem);
            
            //create nav icon
            let moduleIcon = document.createElement('span');
            moduleIcon.classList.add('fpd-nav-icon');
            moduleIcon.classList.add(moduleWrapper.configs.icon);
            navItemElem.append(moduleIcon);
            
            //create label inside nav item
            if(!dynamicDesignId) {
                
                //get translation for nav item label
                const langKeys = moduleWrapper.configs.langKeys;
                navItemTitle = this.fpdInstance.translatorInstance.getTranslation(
                    langKeys[0], 
                    langKeys[1], 
                    this.fpdInstance.mainOptions.langJson, 
                    moduleWrapper.configs.defaultText
                );
                
            }
            
            const navItemLabelElem = document.createElement('span');
            navItemLabelElem.className = 'fpd-label';
            navItemLabelElem.innerText = navItemTitle;
            navItemElem.append(navItemLabelElem);
                   
            //attach attributes to nav item
            for(const [key, value] of Object.entries(moduleAttrs)) {            
                navItemElem.setAttribute(key, value);
            }
                                
        });
        
        if(!this.contentClosable) {
            navElem.querySelector(`[data-module="${selectedModule}"]`).click()
        }
        
    }

}
import MainbarView from '../view/Mainbar.js';
import ModulesHTML from '../html/modules.html';
import UIManager from '../UIManager';
import { addEvents, addElemClasses, removeElemClasses, toggleElemClasses } from '../../utils.js';

export default class Mainbar extends EventTarget {
    
    availableModules = [
        'products',
        'images',
        'text',
        'designs',
        'manage-layers',
        'text-layers',
        'layouts'
    ];
    
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
        
        this.contentElem = this.container.querySelector('.fpd-content');
        this.navElem = this.container.querySelector('.fpd-navigation');
        
        this.modulesHTML = document.createElement("div");
        this.modulesHTML.innerHTML = ModulesHTML;
        
        this.currentModules = fpdInstance.mainOptions.mainBarModules;
        
        //draggable dialog
        this.#dialogContainer = document.querySelector(this.fpdInstance.mainOptions.modalMode ? '.fpd-modal-product-designer' : 'body');
        
        this.#draggableDialog = document.querySelector(".fpd-draggable-dialog");
        this.#dialogContainer.append(this.#draggableDialog);
        
        //prevent right click context menu & document scrolling when in dialog content
        addEvents(
            this.#draggableDialog,
            ['contextmenu', 'mousewheel'],
            evt => evt.preventDefault()
        )
        
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
                    
                    this.toggleDialog(false);
            
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
                
        evt.preventDefault();
                
        if(this.#draggableDialog.querySelector('.fpd-dialog-drag-handle').contains(evt.target)) {
            
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
    
    #selectModule(evt) {
        
        evt.stopPropagation();
        
        this.fpdInstance.deselectElement();
        
        if(this.fpdInstance.currentViewInstance) {
            this.fpdInstance.currentViewInstance.currentUploadZone = null;
        }
        
        // hide dialog when clicking on active nav item
        if(evt.currentTarget.classList.contains('fpd-active')
            && (this.#offCanvasEnabled || this.#draggableDialogEnabled)) {
            
            removeElemClasses(
                this.navElem.querySelectorAll('.fpd-nav-item'), 
                ['fpd-active']
            );
            this.toggleDialog(false);
            
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
        
        this.toggleDialog(false);
        
    }
    
    callModule(name, dynamicDesignsId=null) {
        
        removeElemClasses(
            this.navElem.querySelectorAll('.fpd-nav-item'), 
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
            
        }
                
        this.toggleDialog();
        this.currentModuleKey = name;
        
    }
    
    callSecondary() {
        
    }
    
    toggleDialog(toggle=true) {
        
        const fpdContainer = this.fpdInstance.container;
        
        console.log(toggle);
        
        toggleElemClasses(fpdContainer, ['fpd-module-visible'], toggle);
        
        if(this.#offCanvasEnabled) {
            
            this.contentElem.style.removeProperty('left');
            this.contentElem.previousElementSibling.style.removeProperty('left');
            this.contentElem.style.height = this.fpdInstance.mainWrapper.container.clientHeight+'px';
            this.container.classList.toggle('fpd-show', toggle);
            
        }
        else if(this.#draggableDialogEnabled) {
            
            this.#draggableDialog.classList.toggle('fpd-show', toggle);
            
        }
        
        if(!toggle) {
            this.currentModuleKey = '';
        }
        
        
    }
    
    updateContentWrapper() {
        
        const fpdContainer = this.fpdInstance.container;
        
        this.toggleDialog(false);
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
        
            let moduleIcon = document.createElement('span'),
                navItemTitle = '',
                dynamicDesignId = null,
                moduleAttrs = {},
                useFpdIcon = true;
            
            moduleIcon.classList.add('fpd-nav-icon');
            
            //todo
        //     if(moduleType.includes('designs')) {
        // 
        //         moduleType = 'designs';
        // 
        //         if(!FPDUtil.isEmpty(fpdInstance.mainOptions.dynamicDesigns) && module.includes('designs_')) {
        // 
        //             dynamicDesignId = module.split('_').pop();
        // 
        //             if(dynamicDesignId && fpdInstance.mainOptions.dynamicDesigns[dynamicDesignId]) {
        // 
        //                 var dynamicDesignConfig = fpdInstance.mainOptions.dynamicDesigns[dynamicDesignId];
        // 
        //                 navItemTitle = dynamicDesignConfig.name;
        //                 moduleAttrs['data-dynamic-designs-id'] = dynamicDesignId;
        // 
        //                 if(!FPDUtil.isEmpty(dynamicDesignConfig.icon) && dynamicDesignConfig.icon.indexOf('.svg') != -1) {
        // 
        //                     useFpdIcon = false;
        // 
        //                     $.get(dynamicDesignConfig.icon, function(data) {
        //                         $moduleIcon.append($(data).children('svg'));
        //                     });
        //                 }
        // 
        //             }
        //             else { //dynamic designs module does not exist
        //                 return;
        //             }
        //         }
        // 
        //     }
            
            
            var moduleElem = this.modulesHTML.querySelector('[data-module="'+moduleType+'"]').cloneNode(true),
                moduleInstance;
            
            if(!dynamicDesignId) {
                const langId = moduleElem.dataset.title.split('.');
                navItemTitle = this.fpdInstance.translator.getTranslation(
                    langId[0], 
                    langId[1], 
                    this.fpdInstance.mainOptions.langJson, 
                    moduleElem.dataset.defaulttext
                );
            }
            
            if(useFpdIcon) {
                moduleIcon.classList.add(moduleElem.dataset.moduleicon);
            }
                        
            const navItemElem = document.createElement('div');
            navItemElem.classList.add('fpd-nav-item');
            navItemElem.dataset.module = moduleType;
            navItemElem.addEventListener('click', this.#selectModule.bind(this));
            
            navItemElem.append(moduleIcon);
            
            const navItemLabelElem = document.createElement('span');
            navItemLabelElem.className = 'fpd-label';
            navItemLabelElem.innerText = navItemTitle;
            
            for(const [key, value] of Object.entries(moduleAttrs)) {            
                navItemElem.setAttribute(key, value);
            }
            
            navItemElem.append(navItemLabelElem);
            navElem.appendChild(navItemElem);
                        
            this.contentElem.append(moduleElem);
        
        //     if(moduleType === 'products') {
        //         moduleInstance = new FPDProductsModule(this.fpdInstance, $moduleClone);
        //     }
        //     else if(moduleType === 'text') {
        //         moduleInstance = new FPDTextModule(this.fpdInstance, $moduleClone);
        //     }
        //     else if(moduleType === 'designs') {
        //         moduleInstance = new FPDDesignsModule(this.fpdInstance, $moduleClone, dynamicDesignId);
        //     }
        //     else if(moduleType === 'images') {
        //         moduleInstance = new FPDImagesModule(this.fpdInstance, $moduleClone);
        //     }
        //     else if(moduleType === 'layouts') {
        //         moduleInstance = new FPDLayoutsModule(this.fpdInstance, $moduleClone);
        //     }
        //     //PLUS
        //     else if(typeof FPDDrawingModule !== 'undefined' && moduleType === 'drawing') {
        //         moduleInstance = new FPDDrawingModule(this.fpdInstance, $moduleClone);
        //     }
        //     else if(typeof FPDDynamicViews !== 'undefined' && moduleType === 'dynamic-views') {
        //         moduleInstance = new FPDDynamicViews(this.fpdInstance, $moduleClone);
        //     }
        // 
        //     if(moduleInstance) {
        //         this.fpdInstance['moduleInstance_'+module] = moduleInstance;
        //     }
        
        });
        
        // if(fpdInstance.$container.hasClass('fpd-device-desktop') || fpdInstance.$container.parents('.ui-composer-page').length) {
        //     $nav.children('[data-module="'+selectedModule+'"]').click();
        // }
        
    }

}
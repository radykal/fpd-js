import MainbarView from '../view/Mainbar.js';
import ModulesHTML from '../html/modules.html';
import UIManager from '../UIManager';
import { addEventList } from '../../utils.js';

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
    
    constructor(fpdInstance) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        
        const fpdContainer = fpdInstance.container;
                
        this.mainBarView = document.createElement("fpd-main-bar");
        fpdContainer.append(this.mainBarView);
        
        this.contentElem = this.mainBarView.querySelector('.fpd-content');
        
        this.modulesHTML = document.createElement("div");
        this.modulesHTML.innerHTML = ModulesHTML;
        
        this.currentModules = fpdInstance.mainOptions.mainBarModules;
        
        //draggable dialog
        this.#dialogContainer = document.querySelector(this.fpdInstance.mainOptions.modalMode ? '.fpd-modal-product-designer' : 'body');
        
        this.#draggableDialog = document.querySelector(".fpd-draggable-dialog");
        this.#dialogContainer.append(this.#draggableDialog);
        
        this.#draggableDialog.addEventListener('contextmenu', evt => evt.preventDefault());

        this.#draggableDialog.addEventListener('mousedown', this.#draggableDialogStart.bind(this));
        this.#draggableDialog.addEventListener('mouseup', this.#draggableDialogEnd.bind(this));
        document.addEventListener('mousemove', this.#draggableDialogMove.bind(this));
        
        this.#draggableDialog.addEventListener('touchstart', this.#draggableDialogStart.bind(this));
        this.#draggableDialog.addEventListener('touchend', this.#draggableDialogEnd.bind(this));
        document.addEventListener('touchmove', this.#draggableDialogMove.bind(this));
        
        addEventList(
            this.#draggableDialog.querySelector('.fpd-close-dialog'),
            'click',
            this.#closeDialog.bind(this)
        )
        
        addEventList(
            this.mainBarView.querySelector('.fpd-close-off-canvas'),
            'click',
            this.#closeDialog.bind(this)
        )
        
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
        
        this.callModule();
    }
    
    #closeDialog() {
        
        if(this.fpdInstance.currentViewInstance && this.fpdInstance.currentViewInstance.currentUploadZone) {
            this.fpdInstance.currentViewInstance.deselectElement();
        }
        
        this.toggleDialog(false);
        
    }
    
    callModule(name, dynamicDesignsId=null) {
        
        this.toggleDialog();
        
    }
    
    callSecondary() {
        
    }
    
    toggleDialog(toggle=true) {
        
        if(this.#offCanvasEnabled) {
            
            this.mainBarView.classList.toggle('fpd-show', toggle);
            
        }
        else if(this.#draggableDialogEnabled) {
            
            this.#draggableDialog.classList.toggle('fpd-show', toggle);
            
        }
        
        
    }
    
    updateContentWrapper() {
        
        const fpdContainer = this.fpdInstance.container;
        
        this.toggleDialog(false);
        this.#offCanvasEnabled = false;
        this.#draggableDialogEnabled = false;
        
        if(fpdContainer.classList.contains('fpd-off-canvas')) {
            
            this.#offCanvasEnabled = true;
            
            this.mainBarView.append(this.contentElem);
            
        }
        else if(fpdContainer.classList.contains('fpd-sidebar')) {
            
            this.mainBarView.append(this.contentElem);
            
        }
        else {
            
            this.#draggableDialogEnabled = true;
            
            this.#draggableDialog.append(this.contentElem);
            
        }
        
    }
    
    setup(modules=[]) {
                
        let selectedModule = this.fpdInstance.mainOptions.initialActiveModule ? this.fpdInstance.mainOptions.initialActiveModule : '';
        
        const navElem = this.mainBarView.querySelector('.fpd-navigation');
        
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
        
    }

}
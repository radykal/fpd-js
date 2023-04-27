import '../view/Mainbar.js';
import '../UIManager';
import ModuleWrapper from './ModuleWrapper';

import { 
    addEvents, 
    addElemClasses, 
    removeElemClasses, 
    toggleElemClasses 
} from '/src/helpers/utils';
import { fetchText } from '/src/helpers/request';

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
        this.secContent = this.container.querySelector('.fpd-secondary-content');
        
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
        
        addEvents(
            fpdInstance,
            'viewSelect',
            this.#viewSelected.bind(this)
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
                evt.currentTarget.dataset.dynamicDesignsId,
            );
            
        }
        
    }
    
    #closeDialog() {
                
        if(this.fpdInstance.currentViewInstance && this.fpdInstance.currentViewInstance.currentUploadZone) {
            this.fpdInstance.currentViewInstance.deselectElement();
        }
        
        this.toggleContentDisplay(false);
        
    }
    
    #viewSelected() {
        
        const viewInst = this.fpdInstance.currentViewInstance;
        const viewOpts = viewInst.options;
        const viewAdds = viewOpts.customAdds;
        
        toggleElemClasses(
            document.querySelectorAll('.fpd-nav-item[data-module^="designs"]'),
            ['fpd-disabled'],
            !viewAdds.designs
        );
        
        toggleElemClasses(
            document.querySelectorAll('.fpd-nav-item[data-module="images"]'),
            ['fpd-disabled'],
            !viewAdds.uploads
        );
        
        toggleElemClasses(
            document.querySelectorAll('.fpd-nav-item[data-module="text-to-image"]'),
            ['fpd-disabled'],
            !viewAdds.uploads
        );
        
        toggleElemClasses(
            document.querySelectorAll('.fpd-nav-item[data-module="drawing"]'),
            ['fpd-disabled'],
            !viewAdds.drawing
        );
        
        toggleElemClasses(
            document.querySelectorAll('.fpd-nav-item[data-module="text"]'),
            ['fpd-disabled'],
            !viewAdds.texts
        );
        
        toggleElemClasses(
            document.querySelectorAll('.fpd-nav-item[data-module="names-numbers"]'),
            ['fpd-disabled'],
            !viewInst.textPlaceholder && !viewInst.numberPlaceholder
        );

        this.toggleContentDisplay(false);
        
    }
    
    callModule(name, dynamicDesignsId=null) {

        //hide secondary content
        removeElemClasses(
            this.secContent,
            ['fpd-active']
        );

        removeElemClasses(
            this.contentElem,
            ['fpd-hidden']
        );
        
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
            
            addElemClasses(
                this.contentElem.querySelector('[data-dynamic-designs-id="'+dynamicDesignsId+'"]'),
                ['fpd-active']
            );
            
        }
        else {
            
            selectedNavItem = addElemClasses(
                this.navElem.querySelector('.fpd-nav-item[data-module="'+name+'"]'),
                ['fpd-active']
            );
            
            const selectedModule = this.contentElem.querySelector('fpd-module-'+name);
            addElemClasses(
                selectedModule,
                ['fpd-active']
            );
            
            //focus textarea when text module is selected
            if(name == 'text')
                selectedModule.querySelector('textarea').focus();            
                        
        }
                
        this.toggleContentDisplay();
        this.currentModuleKey = name;
        
    }

    callSecondary(name) {
        
        //deselect main modules
        removeElemClasses(
            this.navElem.querySelectorAll('.fpd-nav-item'), 
            ['fpd-active']
        );
        
        addElemClasses(
            this.contentElem,
            ['fpd-hidden']
        );
                
        addElemClasses(
            this.secContent,
            ['fpd-active']
        );

        addElemClasses(
            this.secContent.querySelector('.fpd-'+name),
            ['fpd-active']
        );
        
        this.fpdInstance.dispatchEvent(
            new CustomEvent('secondaryModuleCalled', {
                detail: {
                    moduleName: name
                }
            })
        );

        
    }
    
    get contentClosable() {
        
        const fpdContainer = this.fpdInstance.container;
        
        return this.#offCanvasEnabled || this.#draggableDialogEnabled || fpdContainer.classList.contains('fpd-layout-small');
        
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
    
    toggleUploadZonePanel(toggle=true, customAdds={}) {
                    
        //do nothing when custom image is loading
        if(this.fpdInstance.loadingCustomImage) {
            return;
        }

        toggleElemClasses(this.secContent, ['fpd-active'], toggle);
    
        if(toggle) {

            toggleElemClasses(
                this.uploadZoneNavItems.find(navItem => navItem.classList.contains('fpd-add-image')),
                ['fpd-hidden'],
                !Boolean(customAdds.uploads)
            )

            toggleElemClasses(
                this.uploadZoneNavItems.find(navItem => navItem.classList.contains('fpd-add-text')),
                ['fpd-hidden'],
                !Boolean(customAdds.texts)
            )

            toggleElemClasses(
                this.uploadZoneNavItems.find(navItem => navItem.classList.contains('fpd-add-design')),
                ['fpd-hidden'],
                !Boolean(customAdds.designs)
            )
                        
            if(this.fpdInstance.UZmoduleInstance_designs) {
                this.fpdInstance.UZmoduleInstance_designs.toggleCategories();
            }
            
            //select first visible nav item
            const firstVisibleNavItem = this.uploadZoneNavItems.find(navItem => !navItem.classList.contains('fpd-hidden'))
            if(firstVisibleNavItem)
                firstVisibleNavItem.click();   
        

            this.callSecondary('upload-zone-panel');
        }
        else {
    
            this.fpdInstance.currentViewInstance.currentUploadZone = null;
    
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

        if(FancyProductDesigner.additionalModules) {

            Object.keys(FancyProductDesigner.additionalModules).forEach((moduleKey) => {
                modules.push(moduleKey);
            })

        }
        
        //add selected modules
        modules.forEach((moduleKey) => {
        
            let navItemTitle = '';        
            const moduleWrapper = new ModuleWrapper(this.fpdInstance, this.contentElem, moduleKey);
            
            if(!moduleWrapper.moduleInstance)
                return;
                            
            //create nav item element            
            const navItemElem = document.createElement('div');
            navItemElem.classList.add('fpd-nav-item');
            navItemElem.dataset.module = moduleKey;
            navItemElem.addEventListener('click', this.#navItemSelect.bind(this));
            navElem.appendChild(navItemElem);
            
            //create nav icon
            let moduleIcon = document.createElement('span');
            if(moduleWrapper.configs.icon.includes('.svg')) {
                
                fetchText({
                    url: moduleWrapper.configs.icon,
                    onSuccess: (svgStr) => {
                        moduleIcon.innerHTML = svgStr;
                    },
                    onError: (error) => {
                        console.log(error);
                    }
                })
                
            }
            else {
                moduleIcon.classList.add('fpd-nav-icon');
                moduleIcon.classList.add(moduleWrapper.configs.icon);
            }
            
            navItemElem.append(moduleIcon);
            
            //create label inside nav item
            if(moduleWrapper.configs.langKeys) {
                
                //get translation for nav item label
                const langKeys = moduleWrapper.configs.langKeys;
                navItemTitle = this.fpdInstance.translator.getTranslation(
                    langKeys[0], 
                    langKeys[1], 
                    this.fpdInstance.mainOptions.langJson, 
                    moduleWrapper.configs.defaultText
                );
                
            }
            else if(moduleWrapper.configs.defaultText) {
                navItemTitle = moduleWrapper.configs.defaultText;
            }
            
            //create nav item label
            const navItemLabelElem = document.createElement('span');
            navItemLabelElem.className = 'fpd-label';
            navItemLabelElem.innerText = navItemTitle;
            navItemElem.append(navItemLabelElem);
                   
            //attach attributes to nav item
            if(moduleWrapper.configs.attrs) {
                
                for(const [key, value] of Object.entries(moduleWrapper.configs.attrs)) {            
                    navItemElem.setAttribute(key, value);
                }
                
            }  
                                
        });
        
        if(!this.contentClosable) {
            navElem.querySelector(`[data-module="${selectedModule}"]`).click()
        }

        //upload zone panel
        this.uploadZoneContent = this.secContent.querySelector('.fpd-upload-zone-content');
        this.uploadZoneNavItems = Array.from(this.secContent.querySelectorAll('.fpd-upload-zone-panel .fpd-bottom-nav > div'));
        
        const imagesModuleWrapper = new ModuleWrapper(this.fpdInstance, this.uploadZoneContent, 'images');
        this.fpdInstance['UZmoduleInstance_images'] = imagesModuleWrapper.moduleInstance;
        
        const textModuleWrapper = new ModuleWrapper(this.fpdInstance, this.uploadZoneContent, 'text');
        this.fpdInstance['UZmoduleInstance_text'] = textModuleWrapper.moduleInstance;

        const designModuleWrapper = new ModuleWrapper(this.fpdInstance, this.uploadZoneContent, 'designs');
        this.fpdInstance['UZmoduleInstance_designs'] = designModuleWrapper.moduleInstance;

        addEvents(
            this.uploadZoneNavItems,
            'click',
            (evt) => {

                removeElemClasses(
                    this.uploadZoneNavItems,
                    ['fpd-active']
                )

                addElemClasses(
                    evt.currentTarget,
                    ['fpd-active']
                )

                removeElemClasses(
                    Array.from(this.uploadZoneContent.children),
                    ['fpd-active']
                )
                                
                addElemClasses(
                    this.uploadZoneContent.querySelector('fpd-module-'+evt.currentTarget.dataset.module),
                    ['fpd-active']
                );                

            }
        )
        
        
    }

}
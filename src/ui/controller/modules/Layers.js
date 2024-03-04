import '../../../ui/view/modules/Layers.js';

import { 
    addEvents, 
    elementAvailableColors,
    getBgCssFromElement,
    toggleElemClasses,
    removeElemClasses,
    addElemClasses
} from '../../../helpers/utils.js';

import ColorPalette from '../../view/comps/ColorPalette.js';
import ColorPanel from '../../view/comps/ColorPanel.js';
import AreaSortable from '../../../vendor/js/areasortable.js';

export default class LayersModule extends EventTarget {
    
    #areaSortable = null;
    
    constructor(fpdInstance, wrapper) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        
        this.container = document.createElement("fpd-module-manage-layers");
        wrapper.append(this.container);
        
        this.listElem = this.container.querySelector('.fpd-list');
        
        addEvents(
            fpdInstance,
            ['elementAdd', 'elementRemove', 'viewSelect', 'productCreate'], 
            (evt) => {
                
                if(fpdInstance.productCreated) {
                    this.#updateList();
                }
            }
        )

        addEvents(
            fpdInstance,
            ['elementModify', 'textLinkApply'], 
            (evt) => {
                
                if(fpdInstance.productCreated) {
                    
                    const {element, options} = evt.detail;
                    const rowElem = this.listElem.querySelector('.fpd-list-row[id="'+element.id+'"]');

                    if(rowElem) {
                        
                        const textInput = rowElem.querySelector('textarea');
                        if(options.text && textInput)
                            textInput.value =  options.text;

                    }

                }

            }
        )

        addEvents(
            fpdInstance,
            ['elementModify', 'elementChange'], 
            (evt) => {
                                
                if(fpdInstance.productCreated) {
                    
                    const {element, options, type} = evt.detail;

                    if((options && options.scaleX) || type == 'scaling') {
                        this.#updateSizeDisplay(element);
                    }
                    

                }

            }
        )

        addEvents(
            fpdInstance,
            'elementFillChange', 
            (evt) => {
                
                if(fpdInstance.productCreated) {

                    const element = evt.detail.element;
                    const rowElem = this.listElem.querySelector('.fpd-list-row[id="'+element.id+'"]');

                    if(rowElem && rowElem.querySelector('.fpd-current-color')) {
                        
                        rowElem.querySelector('.fpd-current-color').style.background = getBgCssFromElement(element);
                        
                    }
                    
                }
                
            }
        )
        
    }
    
    #updateList() {
        
        this.listElem.innerHTML = '';
                
        this.fpdInstance.getElements(this.fpdInstance.currentViewIndex, 'all', false)
        .forEach((element) => {
                        
            if(element.checkEditable()) {
                this.#appendLayerItem(element);
            }
        
        });
        
        if(this.#areaSortable) {
            this.#areaSortable.dispose();
        }
        
        this.#areaSortable = AreaSortable('vertical', {
            container: this.listElem,
            handle: 'fpd-icon-reorder',
            item: 'fpd-list-row',
            placeholder: 'fpd-sortable-placeholder',
            activeItem: 'fpd-sortable-dragged',
            closestItem: 'fpd-sortable-closest',
            autoscroll: true,
            animationMs: 0,
            onStart: (item) => {
                
                // disable scroll
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
                window.onscroll = () => {
                    window.scrollTo({top: scrollTop})
                };
                
                
            },
            onChange: (item) => {
                    
                    const fabricCanvas = this.fpdInstance.currentViewInstance.fabricCanvas;
                    //get target element
                    const targetElement = fabricCanvas.getElementByID(item.id);
                    
                    //get index of related item depeding on sort direction
                    let closestItem = this.listElem.querySelector('.fpd-sortable-closest')
                    
                    const fabricElem = fabricCanvas.getElementByID(closestItem ? closestItem.id : item.id);
                    let newIndex = fabricElem.getZIndex();
                    
                    //no related item, use origin t of target and increase by one
                    if(!closestItem)
                        newIndex++;
                                        
                    fabricCanvas
                    .setElementOptions({z: newIndex}, targetElement);
                    
                
            },
            onEnd: (item)=> {
                
                window.onscroll = () => {};                
                
            }

        });
                
    }
    
    #appendLayerItem(element) {
        
        //create row node
        const rowElem = document.createElement('div');
        rowElem.className = 'fpd-list-row';
        rowElem.id = element.id;
        
        //create color selection
        let colorElem = document.createElement('span');
        let availableColors = null; //the amount of available colors of an object
                
        if(!element.uploadZone && element.hasColorSelection()) {
            
            availableColors = elementAvailableColors(element, this.fpdInstance);
            const cssBg = getBgCssFromElement(element); 
               
            colorElem.style.background = cssBg;
            colorElem.className = 'fpd-current-color';
            
            rowElem.colors = availableColors;
            
        }
        
        //create color wrapper
        const colorWrapper = document.createElement('div');
        colorWrapper.className = 'fpd-cell-0';
        colorWrapper.append(colorElem);
        rowElem.append(colorWrapper);
        
        //create label (textarea)
        let sourceContent = element.title;
        if(element.getType() === 'text' && element.editable) {
        
            sourceContent = document.createElement('textarea');
            sourceContent.value = element.text;
            
            addEvents(
                sourceContent,
                'keyup',
                (evt) => {
                    
                    evt.stopPropagation();
                    
                    let txt = evt.target.value;
                    txt = txt.replace(FancyProductDesigner.forbiddenTextChars, '');
                    
                    //remove emojis
                    if(this.fpdInstance.mainOptions.disableTextEmojis) {
                        txt = txt.replace(FPDEmojisRegex, '');
                        txt = txt.replace(String.fromCharCode(65039), ""); //fix: some emojis left a symbol with char code 65039
                    }
                    
                    this.fpdInstance.currentViewInstance.fabricCanvas.
                    setElementOptions({text: txt}, element);
                    
                }
            )
            
            //update input when text has changed
            element.on({
                'editing:exited': () => {
                    sourceContent.value = element.text;
                }
            })
        
        }
        
        const textWrapper = document.createElement('div');
        textWrapper.className = 'fpd-cell-1';
        textWrapper.append(sourceContent);

        if(element.isBitmap()) {

            const imgMetaWrapper = document.createElement('div');
            imgMetaWrapper.className = 'fpd-img-meta';
            imgMetaWrapper.innerHTML = 'W: <span data-prop="width"></span>H: <span data-prop="height"></span>';
            imgMetaWrapper.innerHTML += '<div class="fpd-dpi">DPI: <span data-prop="dpi"></span></div>';
            textWrapper.append(imgMetaWrapper);

        }

        rowElem.append(textWrapper);
        
        //create actions
        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'fpd-cell-2';
        rowElem.append(actionsWrapper);
        
        if(element.uploadZone) {
            
            addElemClasses(
                rowElem,
                ['fpd-add-layer']
            );
            
            const addIcon = document.createElement('span');
            addIcon.className = 'fpd-icon-add';
            actionsWrapper.append(addIcon);
                
        }
        else {
            
            //z-sorting
            if(element.zChangeable) {
                
                const sortIcon = document.createElement('span');
                sortIcon.className = 'fpd-icon-reorder';
                actionsWrapper.append(sortIcon);
                
            }
            
            //lock/unlock element
            const lockClass = element.locked ? 'fpd-icon-locked' : 'fpd-icon-unlocked';     
            const lockIcon = document.createElement('span');
            lockIcon.className = 'fpd-lock-element';
            lockIcon.innerHTML = `<span class="${lockClass}"></span>`;
            actionsWrapper.append(lockIcon);
            
            addEvents(
                lockIcon,
                'click',
                (evt) => {
                    
                    evt.stopPropagation();
                    
                    removeElemClasses(
                        rowElem,
                        ['fpd-show-colors']
                    )
                    
                    element.evented = !element.evented;
                    element.locked = !element.evented;
                    
                    const lockSymbol = evt.currentTarget.querySelector('span');
                    toggleElemClasses(
                        lockSymbol,
                        ['fpd-icon-unlocked'],
                        element.evented
                    )
                    
                    toggleElemClasses(
                        lockSymbol,
                        ['fpd-icon-locked'],
                        !element.evented
                    )
                    
                    toggleElemClasses(
                        rowElem,
                        ['fpd-locked'],
                        !element.evented
                    )
                    
                }
            )
            
            toggleElemClasses(
                rowElem,
                ['fpd-locked'],
                element.locked
            );

            //toggle visbility
            const visibleClass = element.visible ? 'fpd-icon-eye-hide' : 'fpd-icon-eye';     
            const visibleElem = document.createElement('span');
            visibleElem.className = 'fpd-visible-element';
            visibleElem.innerHTML = `<span class="${visibleClass}"></span>`;
            actionsWrapper.append(visibleElem);

            addEvents(
                visibleElem,
                'click',
                (evt) => {

                    element.set('visible', !element.visible);
                    element.canvas.renderAll();
                    
                    toggleElemClasses(
                        visibleElem.querySelector('span'),
                        ['fpd-icon-eye-hide'],
                        element.visible
                    )
                    
                    toggleElemClasses(
                        visibleElem.querySelector('span'),
                        ['fpd-icon-eye'],
                        !element.visible
                    )

                }
            )
            
        }
        
        let enableRemove = element.removable || element.__editorMode;
        if(element.uploadZone)
            enableRemove = element.uploadZoneRemovable;
        
        if(enableRemove) {
            
            const removeIcon = document.createElement('span');
            removeIcon.className = 'fpd-remove-element';
            removeIcon.innerHTML = `<span class="fpd-icon-bin"></span>`;
            actionsWrapper.append(removeIcon);
            
            addEvents(
                removeIcon,
                'click',
                (evt) => {
                    
                    evt.stopPropagation();
                    this.fpdInstance.currentViewInstance.fabricCanvas.removeElement(element);
                    
                }
            )
            
        }
        
        this.listElem.prepend(rowElem);        
        
        let colorPanel;

        if(availableColors) {
            
            colorPanel = document.createElement('div');
                        
            //color panel for object group(multi-paths)
            if(element.type === 'group' && element.getObjects().length > 1) {
                
                const paletterPerPath = Array.isArray(element.colors)  && element.colors.length > 1;

                let colorPalette = ColorPalette({
                    colors: availableColors, 
                    colorNames: this.fpdInstance.mainOptions.hexNames,
                    palette: element.colors,
                    subPalette: paletterPerPath,
                    enablePicker: !paletterPerPath,
                    onChange: (hexColor, pathIndex) => {
                        
                        this.#updateGroupPath(element, pathIndex, hexColor);
                        
                        
                    },
                    //only for colorpicker per path
                    onMove: (hexColor, pathIndex) => {
                        
                        element.changeObjectColor(pathIndex, hexColor);
                        
                    },
                });
                
                colorPanel.append(colorPalette);
                
            }
            //color panel for text, png, svg with one path, path
            else {

                colorPanel = ColorPanel(this.fpdInstance, {
                    colors: availableColors,
                    patterns: Array.isArray(element.patterns) && (element.isSVG() || element.getType() === 'text') ? element.patterns : null,
                    onMove: (hexColor) => {
                                                
                        this.#updateElementColor(element, hexColor);
                        
                    },
                    onChange: (hexColor) => {
                        
                        this.#setElementColor(element, hexColor);
                        
                    },
                    onPatternChange: (patternImg) => {

                        rowElem.querySelector('.fpd-current-color')
                        .style.backgroundImage = `url("${patternImg}")`;
                        
                        this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(
                            {pattern: patternImg}, 
                            element
                        );

                    }
                })
                
            }

            if(colorPanel) {

                addElemClasses(colorPanel, ['fpd-cell-full'])
                rowElem.append(colorPanel);

            }
            
            
            //show color options
            addEvents(
                rowElem.querySelector('.fpd-current-color'),
                'click', 
                (evt) => {
                    
                    const toggle = !rowElem.classList.contains('fpd-show-colors');
                    
                    removeElemClasses(
                        this.listElem.querySelectorAll('.fpd-list-row'),
                        ['fpd-show-colors'],
                    );
                    
                    toggleElemClasses(
                        rowElem,
                        ['fpd-show-colors'],
                        toggle
                    );
                }
            )
            
        }
        
        //select associated element on canvas when choosing one from the layers list
        addEvents(
            rowElem.querySelector('.fpd-cell-1'),
            'click',
            (evt) => {
                
                const row = evt.currentTarget.parentNode;
                
                if(row.classList.contains('fpd-locked') ||  evt.target.nodeName == 'TEXTAREA') {
                    return;
                }
                
                const targetElement = this.fpdInstance.currentViewInstance.fabricCanvas.getElementByID(row.id);
                if(targetElement) {

                    targetElement.canvas.setActiveObject(targetElement)
                    .renderAll();
                    
                }
                
            }
        )

        this.#updateSizeDisplay(element);
        
    }
    
    #updateElementColor(element, hexColor) {
        
        let elementType = element.isColorizable();
        
        if(elementType !== 'png') {
            element.changeColor(hexColor);
        }        
        
    }
    
    #setElementColor(element, hexColor) {

        const rowElem = this.listElem.querySelector('.fpd-list-row[id="'+element.id+'"]');

        if(rowElem && rowElem.querySelector('.fpd-current-color')) {

            rowElem.querySelector('.fpd-current-color').style.background = getBgCssFromElement(element);
            
        }
                
        this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({fill: hexColor}, element);
        
    }
    
    #updateGroupPath(element, pathIndex, hexColor) {
        
        const groupColors = element.changeObjectColor(pathIndex, hexColor);
        this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({fill: groupColors}, element);
        
    }

    #updateSizeDisplay(element) {

        const rowElem = this.listElem.querySelector('.fpd-list-row[id="'+element.id+'"]');

        if(rowElem && element.isBitmap()) {

            const imgSize = this.fpdInstance.calcDisplaySize(element);

            if(rowElem.querySelector('[data-prop="width"]')) {

                rowElem.querySelector('[data-prop="width"]').innerText = imgSize.width+imgSize.unit;
                rowElem.querySelector('[data-prop="height"]').innerText = imgSize.height+imgSize.unit;

            }

            if(imgSize.dpi) {

                rowElem.querySelector('[data-prop="dpi"]').innerText = imgSize.dpi;                

            }
            else {
                addElemClasses(rowElem, ['fpd-hide-dpi'])
            }

        }

    }

}

window.FPDLayersModule = LayersModule;
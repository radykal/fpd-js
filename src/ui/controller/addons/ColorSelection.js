import ColorPanel from '../../../ui/view/comps/ColorPanel.js';
import ColorPalette from '../../../ui/view/comps/ColorPalette.js';

import { 
    addEvents,
    addElemClasses,
    isEmpty,
    toggleElemClasses,
    elementAvailableColors
} from '../../../helpers/utils.js';

/**
 * The class to create the Color Selection that is related to FancyProductDesigner class.
 *
 * @class FPDColorSelection
 * @constructor
 * @param {FancyProductDesigner} fpdInstance - An instance of FancyProductDesigner class.
 * @extends EventTarget
 */
export default class ColorSelection extends EventTarget {

    constructor(fpdInstance) {

        super();

        this.fpdInstance = fpdInstance;

        if(!isEmpty(fpdInstance.mainOptions.colorSelectionPlacement)) {

            this.container = document.querySelector(fpdInstance.mainOptions.colorSelectionPlacement);
            if(this.container) {

                addElemClasses(
                    this.container,
                    ['fpd-color-selection', 'fpd-container']
                )

                addEvents(
                    fpdInstance,
                    'productCreate',
                    this.#updateList.bind(this)
                )

                addEvents(
                    fpdInstance,
                    'elementAdd',
                    this.#updateList.bind(this)
                )

            }

        }

        addEvents(
            fpdInstance,
            'elementRemove',
            (evt) => {

                const { element } = evt.detail;

                if(element && element.showInColorSelection) {
                    
                    const targetItem = this.container.querySelector('.fpd-cs-item[data-id="'+element.id+'"]');
                    if(targetItem)
                        targetItem.remove();

                }                

            }
        )

    }

    #updateList() {

        this.container.innerHTML = '';

        //get all elements in first view for color selection panel
        const csElements = this.fpdInstance.getElements(0).filter(fElem => {
            return fElem.showInColorSelection;
        });

        toggleElemClasses(
            this.container,
            ['fpd-hidden'],
            csElements.length == 0
        )
        

        csElements.forEach(csElement => {

            this.#createColorItem(csElement); 
            
        })
        
    }

    #createColorItem(element) {
        
        if(element.hasColorSelection()) {

            const item = document.createElement('div');
            item.className = 'fpd-cs-item';
            item.dataset.id = element.id;
            item.innerHTML = `<div class="fpd-title">${element.title}</div>`;
            this.container.append(item);

            let availableColors = elementAvailableColors(element, this.fpdInstance);

            let colorPanel;
            if(element.type === 'group' && element.getObjects().length > 1) {

                const paletterPerPath = Array.isArray(element.colors)  && element.colors.length > 1;

                colorPanel = ColorPalette({
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
                
            }
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
                        
                        this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(
                            {pattern: patternImg}, 
                            element
                        );
    
                    }
                })

            }
            
            if(colorPanel)
                item.append(colorPanel);

        }

    }

    #updateGroupPath(element, pathIndex, hexColor) {

        const groupColors = element.changeObjectColor(pathIndex, hexColor);
        this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({fill: groupColors}, element);

    }

    #updateElementColor(element, hexColor) {

        let elementType = element.isColorizable();
        
        if(elementType !== 'png') {
            element.changeColor(hexColor);
        } 

    }

    #setElementColor(element, hexColor) {

        this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({fill: hexColor}, element);

    }

}

window.FPDColorSelection = ColorSelection;

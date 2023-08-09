import {
    addEvents,
    addElemClasses,
    toggleElemClasses
} from '../../helpers/utils.js';

export default class EditorBox {
    
    constructor(fpdInstance) {

        const wrapper = document.querySelector(fpdInstance.mainOptions.editorMode);

        if(wrapper) {
            
            addElemClasses(wrapper, ['fpd-editor-box-wrapper', 'fpd-container']);

            this.titleElem = document.createElement('div');
            this.titleElem.className = 'fpd-eb-title';
            wrapper.append(this.titleElem);

            this.gridElem = document.createElement('div');
            this.gridElem.className = 'fpd-eb-grid';
            wrapper.append(this.gridElem);
            
            fpdInstance.mainOptions.editorBoxParameters.forEach(param => {
                            
                const inputElem = document.createElement('div');
                inputElem.innerHTML = '<span>'+param+'</span><input type="text" readonly data-prop="'+param+'" />';     
                this.gridElem.append(inputElem);
                
            });

        }
        
        addEvents(
            fpdInstance,
            ['elementSelect', 'elementChange'],
            (evt) => {

                if(wrapper) {

                    if(fpdInstance.currentElement) {
                        
                        this.titleElem.innerText = fpdInstance.currentElement.title;

                        fpdInstance.mainOptions.editorBoxParameters.forEach(param => {
                            
                            let value = fpdInstance.currentElement[param];

                            if(value !== undefined) {

                                value = typeof value === 'number' ? value.toFixed(2) : value;
                                value = (typeof value === 'object' && value.source) ? value.source.src : value;
                                if(param === 'fill' && fpdInstance.currentElement.type === 'group') {
                                    value = fpdInstance.currentElement.svgFill;
                                }

                                const inputElem =this.gridElem.querySelector('input[data-prop="'+param+'"]');
                                if(inputElem)
                                    inputElem.value = value;
                                
                            }

                        })

                    }
                    else {
                        this.titleElem.innerText = '';
                    }

                    toggleElemClasses(this.gridElem, ['fpd-hidden'], !fpdInstance.currentElement);

                }
                
            }
        )     

    }

};
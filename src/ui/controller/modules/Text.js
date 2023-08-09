import '../../../ui/view/modules/Text.js';

import { 
    deepMerge, 
    addEvents,
    objectGet
} from '../../../helpers/utils.js';

export default class TextsModule extends EventTarget {
        
    constructor(fpdInstance, wrapper) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        
        this.container = document.createElement("fpd-module-text");
        wrapper.append(this.container);        
        
        this.container.querySelector('.fpd-btn')
        .addEventListener('click', (evt) => {
        
            let textarea = this.container.querySelector('textarea'),
                text = textarea.value;
                
            if(fpdInstance.currentViewInstance && text.length > 0) {
                
                const currentViewOptions = fpdInstance.currentViewInstance.options;
        
                let textParams = deepMerge(
                    currentViewOptions.customTextParameters, 
                    {
                        textBox: Boolean(this.fpdInstance.mainOptions.customTextAsTextbox),
                        resizable: true,
                        isCustom: true, 
                        _addToUZ: fpdInstance.currentViewInstance.currentUploadZone,
                        _calcWidth: true
                    }
                );
        
                fpdInstance.currentViewInstance.fabricCanvas.addElement(
                    'text',
                    text,
                    text,
                    textParams
                );
        
            }
        
            textarea.value = '';
        
        });
        
        addEvents(
            this.container.querySelector('textarea'),
            ['input', 'change'],
            (evt) => {

                const currentViewOptions = fpdInstance.currentViewInstance.options;
                
                let text = evt.currentTarget.value,
                    maxLength = currentViewOptions.customTextParameters.maxLength,
                    maxLines = currentViewOptions.customTextParameters.maxLines;
                                    
                text = text.replace(FancyProductDesigner.forbiddenTextChars, '');
                
                //remove emojis
                if(fpdInstance.mainOptions.disableTextEmojis) {
                    text = text.replace(FPDEmojisRegex, '');
                    //fix: some emojis left a symbol with char code 65039
                    text = text.replace(String.fromCharCode(65039), ""); 
                }
                
                //max. characters
                if(maxLength != 0 && text.length > maxLength) {
                    text = text.substr(0, maxLength);
                }
                
                // max. lines
                if(maxLines != 0 && text.split("\n").length > maxLines) {
                    text = text.replace(/([\s\S]*)\n/, "$1");
                }
                
                evt.currentTarget.value = text;

            }
        )

        addEvents(
            fpdInstance,
            ['viewSelect', 'secondaryModuleCalled'], 
            (evt) => {

                if(!fpdInstance.currentViewInstance) return;
            
                const currentViewOptions = fpdInstance.currentViewInstance.options;
                let price = null;
                
                //get upload zone price
                if(fpdInstance.currentViewInstance.currentUploadZone 
                    && this.container.parentNode.classList.contains('fpd-upload-zone-content')
                ) { 
                
                    const uploadZone = fpdInstance.currentViewInstance.fabricCanvas.getUploadZone(
                                        fpdInstance.currentViewInstance.currentUploadZone
                                    );
                                    
                    if(objectGet(uploadZone, 'price')) {
                        price = uploadZone.price;
                    }
                
                }

                const viewTextPrice = objectGet(currentViewOptions, 'customTextParameters.price', 0);
                if(price == null && viewTextPrice) {
                    price = viewTextPrice;
                }

                const priceElem = this.container.querySelector('.fpd-btn > .fpd-price');
                if(priceElem)
                    priceElem.innerHTML = price ? (' - '+fpdInstance.formatPrice(price)) : '';
        
            }
        );
                
        if(Array.isArray(fpdInstance.mainOptions.textTemplates)) {
        
            var textTemplatesGridElem = this.container.querySelector('.fpd-text-templates .fpd-grid');
        
            fpdInstance.mainOptions.textTemplates.forEach((item) => {
        
                var props = item.properties,
                    styleAttr = 'font-family:'+ (props.fontFamily ? props.fontFamily : 'Arial');
        
                styleAttr += '; text-align:'+ (props.textAlign ? props.textAlign : 'left');
                
                //create text template element
                const textTemplateElem = document.createElement('div');
                textTemplateElem.className = 'fpd-item';
                textTemplateElem.addEventListener('click', (evt) => {
                    
                    if(fpdInstance.currentViewInstance) {

                        const currentViewOptions = fpdInstance.currentViewInstance.options;
                                                
                        let templateProps = {...item.properties};                        
                        templateProps.isCustom = true;
                        templateProps.textBox = Boolean(this.fpdInstance.mainOptions.customTextAsTextbox);
                        templateProps.resizable = true;
                        templateProps._addToUZ = fpdInstance.currentViewInstance.currentUploadZone;
                        templateProps._calcWidth = true;
                        
                        let textParams = deepMerge(
                            currentViewOptions.customTextParameters,
                            templateProps
                        );
                        
                        fpdInstance.currentViewInstance.fabricCanvas.addElement(
                            'text',
                            item.text,
                            item.text,
                            textParams
                        );
                    
                    }
                    
                })
                
                //create inner content
                const textTemplateInnerElem = document.createElement('div');
                textTemplateInnerElem.setAttribute('style', styleAttr); 
                textTemplateInnerElem.innerHTML = item.text.replace(/(?:\r\n|\r|\n)/g, '<br>');
                
                textTemplateElem.append(textTemplateInnerElem);
                textTemplatesGridElem.append(textTemplateElem);
        
            })
        
        }
        
    }

}

window.FPDTextsModule = TextsModule;
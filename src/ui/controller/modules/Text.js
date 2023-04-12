import TextView from '/src/ui/view/modules/Text';

import { deepMerge, addEvents } from '/src/helpers/utils';

export default class TextsModule extends EventTarget {
    
    #currentViewOptions;
    
    constructor(fpdInstance, wrapper) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        
        this.container = document.createElement("fpd-module-text");
        wrapper.append(this.container);
        
        if(!Boolean(fpdInstance.mainOptions.setTextboxWidth)) {
            this.container.querySelector('.fpd-textbox-wrapper')
            .classList.add('fpd-hidden');
        }
        
        this.container.querySelector('.fpd-btn')
        .addEventListener('click', (evt) => {
        
            let textarea = this.container.querySelector('textarea'),
                text = textarea.value;
                
            if(fpdInstance.currentViewInstance && text.length > 0) {
                
                const textBoxWidthElem = this.container.querySelector('.fpd-textbox-width');
                const textboxWidth = parseInt(textBoxWidthElem.value);
                textBoxWidthElem.value = '';
        
                let textParams = deepMerge(
                    currentViewOptions.customTextParameters, 
                    {
                        isCustom: true, 
                        _addToUZ: fpdInstance.currentViewInstance.currentUploadZone
                    }
                );
        
                if(!isNaN(textboxWidth)) {
                    textParams.textBox = true;
                    textParams.width = textboxWidth;
                    textParams.resizable = true;
                }
        
                fpdInstance.addElement(
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
                
                let text = evt.currentTarget.value,
                    maxLength = this.#currentViewOptions ? this.#currentViewOptions.customTextParameters.maxLength : 0,
                    maxLines = this.#currentViewOptions ? this.#currentViewOptions.customTextParameters.maxLines : 0;
                                    
                text = text.replace(FancyProductDesigner.forbiddenTextChars, '');
                
                //remove emojis
                if(fpdInstance.mainOptions.disableTextEmojis) {
                    text = text.replace(FPDEmojisRegex, '');
                    //fix: some emojis left a symbol with char code 65039
                    text = text.replace(String.fromCharCode(65039), ""); 
                }
                
                if(maxLength != 0 && text.length > maxLength) {
                    text = text.substr(0, maxLength);
                }
                
                if(maxLines != 0 && text.split("\n").length > maxLines) {
                    text = text.replace(/([\s\S]*)\n/, "$1");
                }
                
                evt.currentTarget.value = text;

            }
        )
                
        if(Array.isArray(fpdInstance.mainOptions.textTemplates)) {
        
            var textTemplatesGridElem = this.container.querySelector('.fpd-text-templates .fpd-grid');
            
        
            fpdInstance.mainOptions.textTemplates.forEach((item) => {
        
                var props = item.properties,
                    styleAttr = 'font-family:'+ (props.fontFamily ? props.fontFamily : 'Arial');
        
                styleAttr += '; text-align:'+ (props.textAlign ? props.textAlign : 'left');
                
                //create text template element
                const textTemplateElem = document.createElement('div');
                textTemplateElem.className = 'fpd-item';
                textTemplateElem.dataset.props = JSON.stringify(item.properties);
                textTemplateElem.dataset.text = item.text;
                textTemplateElem.addEventListener('click', (evt) => {
                    
                    //todo check
                    if(fpdInstance.currentViewInstance) {
                        
                        let templateProps = JSON.parse(evt.currentTarget.dataset.props);
                        templateProps.isCustom = true;
                        templateProps._addToUZ = fpdInstance.currentViewInstance.currentUploadZone;
                        
                        let textParams = deepMerge(
                            currentViewOptions.customTextParameters,
                            templateProps
                        );
                        
                        fpdInstance.addElement(
                            'text',
                            this.dataset.text,
                            this.dataset.text,
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
        
        //todo check
        fpdInstance.addEventListener('viewSelect', (evt) => {
            
        //     const detail = evt.detail;
        //     this.#currentViewOptions = detail.viewInstance.options;
        // 
        //     if(currentViewOptions.customTextParameters && currentViewOptions.customTextParameters.price) {
        //         var price = fpdInstance.formatPrice(currentViewOptions.customTextParameters.price);
        //         $module.find('.fpd-btn > .fpd-price').html(' - '+price);
        //     }
        //     else {
        //         $module.find('.fpd-btn > .fpd-price').html('');
        //     }
        
        });

        
    }


}
import Mainbar from './controller/Mainbar.js';

export default class UIManager {
    
    constructor(fpdInstance, events={}) {
        
        this.fpdInstance = fpdInstance;
        this.events = events;
        this.#loadTemplate();
        
    }
    
    #loadTemplate() {
        
        fetch(this.fpdInstance.mainOptions.templatesDirectory+'productdesigner.html')
        .then(stream => stream.text())
        .then(text => {
            
            const templateWrapper = document.createElement('div');
            templateWrapper.innerHTML = text.trim();
            
            this.fpdInstance.container.appendChild(templateWrapper);
                
            this.#templateLoaded();
        
        })
        
    }
    
    #templateLoaded() {
        
        this.fpdInstance.mainbar = new Mainbar(this.fpdInstance);
        
        //todo: translate labels
        // Array.from(this.fpdInstance.container.querySelectorAll('[data-defaulttext]'))
        // .forEach(item => {
        //     console.log(item);
        // })
        
        if(this.events.onUiReady) {
            this.events.onUiReady.call();
        }
        
    }
    
    //translates a HTML element
    translateElement(htmlElem) {
    
        let label = '';
        if(this.fpdInstance.mainOptions.langJson) {
    
            let objString = '';
    
            if(htmlElem.getAttribute('placeholder')) {
                objString = htmlElem.getAttribute('placeholder');
            }
            else if(htmlElem.getAttribute('title')) {
                objString = htmlElem.getAttribute('title');
            }
            else if(htmlElem.dataset.title) {
                objString = htmlElem.dataset.title;
            }
            else {
                objString = htmlElem.innerText;
            }
    
            var keys = objString.split('.'),
                firstObject = this.fpdInstance.mainOptions.langJson[keys[0]];
    
            if(firstObject) { //check if object exists
    
                label = firstObject[keys[1]];
    
                if(label === undefined) { //if label does not exist in JSON, take default text
                    label = htmlElem.dataset.defaulttext;
                }
    
            }
            else {
                label = htmlElem.dataset.defaulttext;
            }
    
        }
        else {
            label = htmlElem.dataset.defaulttext;
        }
    
        if(htmlElem.getAttribute('placeholder')) {
            htmlElem.setAttribute('placeholder', label);
            htmlElem.innerText = '';
        }
        else if(htmlElem.getAttribute('title')) {
            htmlElem.setAttribute('title', label);
        }
        else if(htmlElem.dataset.title) {
            htmlElem.dataset.title = label;
        }
        else {
            htmlElem.innerText = label;
        }
    
        return label;
    
    };
    
}
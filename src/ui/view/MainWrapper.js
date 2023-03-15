import MainWrapperHTML from '../html/main-wrapper.html';

class MainWrapper extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        const templateElem = document.createElement("template");
        templateElem.innerHTML = MainWrapperHTML;
        
        this.append(templateElem.content.cloneNode(true));  
        
    }

}

customElements.define( 'fpd-main-wrapper', MainWrapper );
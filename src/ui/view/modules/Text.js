import TextHTML from '../../html/modules/text.html';

class TextView extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = TextHTML;
        
    }

}

customElements.define( 'fpd-module-text', TextView );
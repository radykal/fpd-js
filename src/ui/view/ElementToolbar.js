import html from '../html/element-toolbar.html';

class ElementToolbar extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html; 

    }

}

customElements.define( 'fpd-element-toolbar', ElementToolbar );
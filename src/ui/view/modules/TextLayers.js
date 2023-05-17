import html from '/src/ui/html/modules/text-layers.html';

class TextLayersView extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html;
        
    }

}

customElements.define( 'fpd-module-text-layers', TextLayersView );
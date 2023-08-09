import html from '../../html/modules/save-load.html';

class SaveLoadView extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html;
        
    }

}

customElements.define( 'fpd-module-save-load', SaveLoadView );
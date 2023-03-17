import DesignsHTML from '../../html/modules/designs.html';

class DesignsView extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = DesignsHTML;
        
    }

}

customElements.define( 'fpd-module-designs', DesignsView );
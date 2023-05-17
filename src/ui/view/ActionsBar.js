import html from '/src/ui/html/actions-bar.html';

class ActionsBar extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html; 
        
    }

}

customElements.define( 'fpd-actions-bar', ActionsBar );
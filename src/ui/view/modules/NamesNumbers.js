import html from '/src/ui/html/modules/names-numbers.html';

class NamesNumbersView extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html;
        
    }

}

customElements.define( 'fpd-module-names-numbers', NamesNumbersView );
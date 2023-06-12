import html from '/src/ui/html/views-nav.html';

class ViewsNav extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html;
        
    }

}

customElements.define( 'fpd-views-nav', ViewsNav );
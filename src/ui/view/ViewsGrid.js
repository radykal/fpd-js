import html from '/src/ui/html/views-grid.html';

class ViewsGrid extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html;
        
    }

}

customElements.define( 'fpd-views-grid', ViewsGrid );
import html from '/src/ui/html/views-wrapper.html';

class ViewsWrapper extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html;
        
    }

}

customElements.define( 'fpd-views-wrapper', ViewsWrapper );
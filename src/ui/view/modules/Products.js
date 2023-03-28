import html from '/src/ui/html/modules/products.html';

class ProductsView extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html;
        
    }

}

customElements.define( 'fpd-module-products', ProductsView );
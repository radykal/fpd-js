import ProductsHTML from '../../html/modules/products.html';

class ProductsView extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = ProductsHTML;
        
    }

}

customElements.define( 'fpd-module-products', ProductsView );
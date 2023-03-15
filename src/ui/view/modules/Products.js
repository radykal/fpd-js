import ProductsHTML from '../../html/modules/products.html';

class ProductsModule extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = ProductsHTML;
        
    }

}

customElements.define( 'fpd-module-products', ProductsModule );
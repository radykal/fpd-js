class FPDMainBarButton extends HTMLElement {
    
    constructor() {
        
        super();
        
    }
    
    static get observedAttributes() {
        return ['onClick'];
    }

    connectedCallback() {
        
        this.addEventListener("click", (evt) => {
            console.log(this);
        });
        
        this.innerHTML = `
            <span class="fpd-btn">Hello World</span>
        `;
        
    }

}

customElements.define( 'fpd-main-bar-btn', FPDMainBarButton );
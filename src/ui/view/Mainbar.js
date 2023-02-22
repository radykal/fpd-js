class Mainbar extends HTMLElement {
    
    constructor() {
        
        super();
                
        let templateContent = document.getElementById('fpd-main-bar').content.cloneNode(true);
        
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(templateContent);
                
    }

    connectedCallback() {
        

    }

}

customElements.define( 'fpd-main-bar', Mainbar );
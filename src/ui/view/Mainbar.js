import MainBarHTML from '../html/mainbar.html';

class Mainbar extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        const templateElem = document.createElement("template");
        templateElem.innerHTML = MainBarHTML;
        
        this.append(templateElem.content.cloneNode(true));  

    }

}

customElements.define( 'fpd-main-bar', Mainbar );
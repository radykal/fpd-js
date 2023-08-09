import html from '../../html/modules/qr-code.html';

class QRCodeView extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html;
        
    }

}

customElements.define( 'fpd-module-qr-code', QRCodeView );
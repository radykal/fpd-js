import html from '../../html/modules/pixabay-images.html';

class PixabayImagesView extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html;
        
    }

}

customElements.define( 'fpd-module-pixabay-images', PixabayImagesView );
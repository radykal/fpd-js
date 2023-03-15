import DropdownHTML from '../../html/comps/dropdown.html';

class FPD_Dropdown extends HTMLElement {
    
    searchable = false;
    
    constructor() {
        
        super();
        this.innerHTML = DropdownHTML;
        this.addEventListener('click', () => {
            
            this.classList.toggle('fpd-active');
            
        })
        
    }
    
    static get observedAttributes() {
        
        return ['searchable']
        
    }

    connectedCallback() {
        
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        
        if (oldValue !== newValue) {
            
            if(name === 'searchable') {
            }
        }
        
    }

}

customElements.define( 'fpd-dropdown', FPD_Dropdown );
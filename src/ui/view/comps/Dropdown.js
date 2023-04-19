import DropdownHTML from '/src/ui/html/comps/dropdown.html';

class FPD_Dropdown extends HTMLElement {
    
    placeholder = '';
    value = '';
    searchable = false;
    
    constructor() {
        
        super();
        this.innerHTML = DropdownHTML;
        
    }
    
    connectedCallback() {
        
        this.addEventListener('click', () => {
            this.classList.toggle('fpd-active');
        });
        
        this.querySelector('.fpd-dropdown-arrow').addEventListener('click', (evt) => {
            
            evt.stopPropagation();
            this.classList.toggle('fpd-active');
            
        });
        
        this.querySelector('input.fpd-dropdown-current')
        .addEventListener('keyup', (evt) => {
            
            if(this.searchable) {
                
                const searchStr = evt.currentTarget.value;
                this.querySelectorAll('.fpd-dropdown-list .fpd-item').forEach((item) => {
                    
                    if(searchStr.length == 0) {
                        item.classList.remove('fpd-hidden');
                    }
                    else {
                        item.classList.toggle(
                            'fpd-hidden', 
                            !item.innerText.toLowerCase().includes(searchStr.toLowerCase()));
                    }
            
                })
                
            }
            
        })
        
    }
    
    static get observedAttributes() {
        
        return ['searchable', 'placeholder', 'value']
        
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        
        if (oldValue !== newValue) {
            
            if(name === 'placeholder') {
                this.querySelector('input.fpd-dropdown-current')
                .setAttribute('placeholder', newValue);
            }
            else if(name === 'value') {
                this.querySelector('input.fpd-dropdown-current')
                .value = newValue;
            }
            else if(name === 'searchable') {
                this.searchable = this.hasAttribute('searchable');
            }
            
        }
        
    }

}

customElements.define( 'fpd-dropdown', FPD_Dropdown );
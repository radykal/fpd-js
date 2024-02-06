import html from '../../../ui/html/comps/dropdown.html';

class FPD_Dropdown extends HTMLElement {
    
    placeholder = '';
    value = '';
    searchable = false;
    inputElem = null;
    listElem = null;
    
    constructor() {
        
        super();
    
    }
    
    connectedCallback() {

        this.innerHTML = html;
        this.inputElem = this.querySelector('input.fpd-dropdown-current');
        this.listElem = this.querySelector('.fpd-dropdown-list');

        //close dropdown when clicked outside of container
        document.addEventListener('click', (evt) => {

            if(!this.contains(evt.target)) {
                this.classList.remove('fpd-active');
            }
            
        });
        
        this.addEventListener('click', () => {

            this.#updatePosition();
            this.classList.toggle('fpd-active');
            
        });
        
        this.querySelector('.fpd-dropdown-arrow').addEventListener('click', (evt) => {
            
            evt.stopPropagation();
            this.#updatePosition();
            this.classList.toggle('fpd-active');
            
            
        });        
        
        this.inputElem
        .addEventListener('keyup', (evt) => {
            
            if(this.searchable) {
                
                const searchStr = evt.currentTarget.value;
                
                this.listElem.querySelectorAll('.fpd-item').forEach((item) => {
                    
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

        window.addEventListener('scroll', () => {
            this.#updatePosition();
        })

        const anyParentScrolled = (elem) => {

            var parentElem = elem.parentNode;

            if(parentElem) {

                elem.addEventListener('scroll', () => {
                    this.#updatePosition();
                })
                anyParentScrolled(parentElem);
                
            }
        }
        anyParentScrolled(this)

        this.inputElem.setAttribute('placeholder', this.getAttribute('placeholder') || '');
        this.#updatePosition();
        
    }
    
    static get observedAttributes() {
        
        return ['searchable', 'placeholder', 'value']
        
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        
        if (oldValue !== newValue) {
                        
            if(this.inputElem) {

                if(name === 'placeholder') {

                    this.inputElem.setAttribute('placeholder', newValue);

                }
                else if(name === 'value') {

                    this.inputElem.value = newValue;

                }

            }
            
            if(name === 'searchable') {

                this.searchable = this.hasAttribute('searchable');
                
            }
            
        }
        
    }

    #updatePosition() {

        const bounding = this.getBoundingClientRect();

        this.listElem.style.width = bounding.width+'px';
        this.listElem.style.left = bounding.left+'px';
        this.listElem.style.top = (bounding.top+bounding.height)+'px';        
    
    }

}

customElements.define( 'fpd-dropdown', FPD_Dropdown );
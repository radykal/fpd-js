import html from '../../../ui/html/comps/tabs.html';

class FPD_Tabs extends HTMLElement {
    
    items = [];
        
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html;
        this.tabsElem = this.querySelector('.fpd-tabs');
        this.contentElem = this.querySelector('.fpd-tabs-content');
        
    }
    
    static get observedAttributes() {
        
        return ['items']
        
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        
        if (oldValue !== newValue) {
            
            if(name === 'items' && newValue) {
                
                this.tabsElem.innerHTML = '';
                this.tabsElem.contentElem = '';
                
                newValue.split(',').forEach((tab) => {
                    
                    const item = document.createElement('div');
                    item.dataset.context = tab;
                    this.tabsElem.append(item);
                    
                    const content = document.createElement('div');
                    item.dataset.context = tab;
                    this.contentElem.append(item);

                });
                
            }
        }
        
    }
    

}

customElements.define( 'fpd-tabs', FPD_Tabs );
import { addElemClasses, addEvents, removeElemClasses, toggleElemClasses } from '../../../helpers/utils';
import html from '../../../ui/html/comps/actions-menu.html';
import ActionsBar from '../../controller/ActionsBar';

class FPD_ActionsMenu extends HTMLElement {

    constructor() {
        
        super();
        this.items = [];        
    
    }
    
    connectedCallback() {

        this.innerHTML = html;
        this.uncollapsedMenu = this.querySelector('.fpd-uncollapsed-menu');
        this.collapsedMenu = this.querySelector('.fpd-collapsed-menu');

        this.collapsedMenu.querySelector('.fpd-dropdown-btn > i').className = this.dataset.fontIcon || '';
        
        addEvents(
			this.collapsedMenu.querySelectorAll('.fpd-dropdown-btn'),
			'click',
			(evt) => {
				                
				const menu = evt.currentTarget.querySelector('.fpd-dropdown-menu');
				toggleElemClasses(
					menu,
					['fpd-show'],
					!menu.classList.contains('fpd-show')
				)

			}
		)

    }

    static get observedAttributes() {
        
        return ['items', 'placeholder']
        
    }

    attributeChangedCallback(name, oldValue, newValue) {
                
        if (oldValue !== newValue) {

            if(name == 'placeholder' && this.collapsedMenu) {
                this.collapsedMenu.querySelector('.fpd-dropdown-btn > .fpd-label').innerText = newValue;
            }
            
        }

    }

    get items() {
        return this._items;
    }

    set items(newValue) {
        
        this._items = newValue;
        this.#updateItems();

    }

    #updateItems() {

        this.#reset();
        
        this._items.forEach(actionItem => {

            const actionBtn = document.createElement('div');
			actionBtn.className = 'fpd-btn fpd-tooltip';
			actionBtn.setAttribute('aria-label', actionItem.title);
			actionBtn.dataset.action = actionItem.type;
			actionBtn.innerHTML = `<i class="${actionItem.icon}"></i><span>${actionItem.title}</span>`;            

            if (ActionsBar.toggleActions.includes(actionItem.type)) {
				actionBtn.insertAdjacentHTML(
					'beforeend',
					'<input type="checkbox" class="fpd-switch" />'
				)
			}
            
            this.uncollapsedMenu.append(actionBtn);
            const clonedActionBtn = actionBtn.cloneNode(true);
            this.collapsedMenu.querySelector('.fpd-dropdown-menu').append(clonedActionBtn);

            addEvents(
                [actionBtn, clonedActionBtn],
                'click',
                actionItem.handler
            )
            
        });
        
        this.toggleMenus();
        
    }

    toggleMenus() {
        
        if(this.isConnected && this.uncollapsedMenu) {

            removeElemClasses(
                this.uncollapsedMenu,
                ['fpd-hidden']
            )
            
            //show collapsed menu (dropdown)            
            if(this.uncollapsedMenu.offsetWidth > this.offsetWidth && !this.classList.contains('fpd-only-uncollapsed')) {

                addElemClasses(
                    this.uncollapsedMenu,
                    ['fpd-visible-hidden']
                )

                addElemClasses(
                    this.uncollapsedMenu,
                    ['fpd-hidden']
                )

                removeElemClasses(
                    this.collapsedMenu,
                    ['fpd-hidden']
                )
                

            }
            //show uncollapsed menu
            else {

                removeElemClasses(
                    this.uncollapsedMenu,
                    ['fpd-visible-hidden']
                )

                addElemClasses(
                    this.collapsedMenu,
                    ['fpd-hidden']
                )                

            }

        }

    }

    #reset() {

        if(this.isConnected && this.uncollapsedMenu) {

            this.uncollapsedMenu.innerHTML = '';
            this.collapsedMenu.querySelector('.fpd-dropdown-menu').innerHTML = '';

        }

    }

}

customElements.define( 'fpd-actions-menu', FPD_ActionsMenu );
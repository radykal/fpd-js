import '../../../ui/view/modules/Products.js';
import Modal from '../../../ui/view/comps/Modal.js';
import { 
    addEvents
} from '../../../helpers/utils.js';

export default class ProductsModule extends EventTarget {
        
    currentCategoryIndex = 0;
    
    constructor(fpdInstance, wrapper) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        this.container = document.createElement("fpd-module-products");
        wrapper.append(this.container);
                
        fpdInstance.addEventListener('productsSet', (evt) => {
                        
            const catListAreaElem = this.container.querySelector('.fpd-dropdown-list > .fpd-scroll-area');
            
            catListAreaElem.innerHTML = '';
            
            if(this.fpdInstance.products && this.fpdInstance.products.length > 0) {
                
                if(this.fpdInstance.products[0].category !== undefined && this.fpdInstance.products.length > 1) { //categories are used
                
                    this.container.classList.add('fpd-categories-enabled');
                
                    this.fpdInstance.products.forEach((item, i) => {
                        
                        const itemElem = document.createElement('span');
                        itemElem.className = 'fpd-item';
                        itemElem.dataset.index = i;
                        itemElem.innerText = item.category;
                        itemElem.addEventListener('click', (evt) => {
                            
                            this.selectCategory(evt.currentTarget.dataset.index);
                            
                        })
                        
                        catListAreaElem.append(itemElem);
                    });
                
                }
                
                this.#checkProductsLength();
                this.selectCategory(0);
                
            }
            
        });
        
        //when adding a product after products are set with productsSetup()
        fpdInstance.addEventListener('productAdd', (evt, views, category, catIndex) => {
        
            if(catIndex == this.currentCategoryIndex) {
                this.#addGridProduct(views);
            }
        
        });

    }
    
    #checkProductsLength() {
    
        if(this.fpdInstance.mainOptions.editorMode) { return; }
    
        let firstProductItem = this.fpdInstance.products[0],
            hideProductsModule = firstProductItem === undefined; //hide if no products exists at all
            
        //at least one product exists
        if(firstProductItem !== undefined) { 
    
            if((!firstProductItem.hasOwnProperty('category') && this.fpdInstance.products.length < 2) //no categories are used
                || (firstProductItem.hasOwnProperty('category') && firstProductItem.products.length < 2 && this.fpdInstance.products.length < 2)) //categories are used
            {
                hideProductsModule = true;
            }
            else {
                hideProductsModule = false;
            }
    
        }
                
        this.fpdInstance.container.classList.toggle('fpd-products-module-hidden', hideProductsModule);

        //select another item if products module is selected
        const selectedNavItem = this.fpdInstance.mainBar.navElem.querySelector('.fpd-active');
        if(hideProductsModule && selectedNavItem && selectedNavItem.dataset.module == 'products') {

            selectedNavItem.nextSibling && selectedNavItem.nextSibling.click();
            
        }
    
    };
    
    #addGridProduct(views, index) {
                
        let thumbnail = views[0].productThumbnail ? views[0].productThumbnail : views[0].thumbnail,
            productTitle = views[0].productTitle ? views[0].productTitle : views[0].title;
        
        //create grid item
        const itemElem = document.createElement('div');
        itemElem.className = 'fpd-item fpd-hover-thumbnail';
        itemElem.dataset.title = productTitle;
        itemElem.dataset.source = thumbnail;
        itemElem.dataset.index = index;
        itemElem.addEventListener('click', (evt) => {
            
            evt.preventDefault();
            
            if(this.fpdInstance.mainOptions.swapProductConfirmation) {
                
                var confirmModal = Modal(
                    this.fpdInstance.translator.getTranslation(
                        'modules', 
                        'products_confirm_replacement'
                    ), 
                    false, 
                    'confirm', 
                    this.fpdInstance.container
                );
                
                const confirmBtn = confirmModal.querySelector('.fpd-confirm');
                confirmBtn.innerText = this.fpdInstance.translator.getTranslation(
                    'modules', 
                    'products_confirm_button'
                );
                
                addEvents(
                    confirmBtn,
                    ['click'],
                    () => {
                        
                        this.fpdInstance.selectProduct(index, this.currentCategoryIndex);
                        confirmModal.remove();
                        
                    }
                )
            
            }
            else {
                this.fpdInstance.selectProduct(
                    Number(evt.currentTarget.dataset.index), 
                    this.currentCategoryIndex
                );
            }
            
        })
        
        this.container.querySelector('.fpd-grid')
        .append(itemElem);
        
        //create picture item
        const pictureElem = document.createElement('picture');
        pictureElem.dataset.img = thumbnail;
        itemElem.append(pictureElem);
        
        this.fpdInstance.lazyBackgroundObserver.observe(pictureElem);
        
    }
    
    selectCategory(index=0) {
        
        this.currentCategoryIndex = index;
        this.container.querySelector('.fpd-grid').innerHTML = '';
        
        if(this.fpdInstance.products && this.fpdInstance.products.length > 0) {
        
            let productsObj;
            if(this.fpdInstance.products[0].category !== undefined) { //categories are used
                
                productsObj = this.fpdInstance.products[index].products;
                
                this.container
                .querySelector('.fpd-dropdown-current')
                .value = this.fpdInstance.products[index].category;
                
            }
            else {                
                productsObj = this.fpdInstance.products;
            }
            
            productsObj.forEach((productItem, i) => {
                this.#addGridProduct(productItem, i);
            });
        
        
        }
        
        
    }

}

window.FPDProductsModule = ProductsModule;
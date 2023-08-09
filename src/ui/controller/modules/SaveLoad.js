import '../../../ui/view/modules/SaveLoad.js';
import Snackbar from '../../../ui/view/comps/Snackbar.js';

import { 
    addEvents,
    createImgThumbnail,
    localStorageAvailable
} from '../../../helpers/utils.js';
import { getScaleByDimesions } from '../../../fabricjs/utils.js';

export default class SaveLoadModule extends EventTarget {
        
    constructor(fpdInstance, wrapper) {

        super();

        this.fpdInstance = fpdInstance;

        this.container = document.createElement("fpd-module-save-load");
        wrapper.append(this.container);

        this.inputElem = this.container.querySelector('input'); 
        this.gridElem = this.container.querySelector('.fpd-grid');        

        addEvents(
            this.container.querySelector('.fpd-btn'),
            'click',
            (evt) => {
                
                const scale = getScaleByDimesions(
                    this.fpdInstance.currentViewInstance.options.stageWidth, 
                    this.fpdInstance.currentViewInstance.options.stageHeight, 
                    300, 
                    300, 
                    'cover'
                );

                fpdInstance.viewInstances[0].toDataURL((thumbnail) => {

                    const product = this.fpdInstance.getProduct();
                    const title = this.inputElem.value || '';
                    const savedProduct = {
                        thumbnail: thumbnail, 
                        product: product, 
                        title: title
                    };

					if(product && this.fpdInstance.mainOptions.saveActionBrowserStorage) {

						//check if there is an existing products array
						let savedProducts = this.#getSavedProducts();
						if(!savedProducts) {
							savedProducts = [];
						}

                        this.addSavedProduct(savedProduct);

						savedProducts.push(savedProduct);
						window.localStorage.setItem(
                            this.fpdInstance.container.id, 
                            JSON.stringify(savedProducts)
                        );

						Snackbar(this.fpdInstance.translator.getTranslation('misc', 'product_saved'));

					}

                    if(product) {

                        this.fpdInstance.dispatchEvent(
                            new CustomEvent('actionSave', {detail: savedProduct})
                        );

                        this.fpdInstance.doUnsavedAlert = false;

                    }
                    

				}, {multiplier: scale, format: 'png', backgroundColor:'transparent'});
                
            }
        )

        if(this.fpdInstance.mainOptions.saveActionBrowserStorage) {

            let savedProducts = this.#getSavedProducts();
            if(savedProducts && savedProducts.length > 0) {

                savedProducts.forEach((savedProduct) => {
                    this.addSavedProduct(savedProduct);
                })
                
            }

        }

    }

    //returns an object with the saved products for the current showing product
	#getSavedProducts() {
		return localStorageAvailable() ? JSON.parse(window.localStorage.getItem(this.fpdInstance.container.id)) : false;
	}

    //add a saved product to the load dialog
    addSavedProduct({thumbnail, product, title=''}) {
        
        const thumbnailElem = createImgThumbnail({
            url: thumbnail,
            title: title,
            removable: true,
            disablePrice: true,
            disableDraggable: true
        }); 

        this.fpdInstance.lazyBackgroundObserver.observe(thumbnailElem.querySelector('picture'));

        thumbnailElem.product = product;

        this.gridElem.append(thumbnailElem);

        addEvents(
            thumbnailElem,
            'click',
            (evt) => {
                this.fpdInstance.loadProduct(thumbnailElem.product);
		        this.fpdInstance.currentProductIndex = -1;

            }
        );

        addEvents(
            thumbnailElem.querySelector('.fpd-delete'),
            'click',
            (evt) => {
                
                evt.stopPropagation();

                const itemElem = evt.currentTarget.parentNode;
                const index = Array.from(this.gridElem.querySelectorAll('.fpd-item')).indexOf(itemElem);
                
                if(this.fpdInstance.mainOptions.saveActionBrowserStorage) {

                    let savedProducts = this.#getSavedProducts();
                        savedProducts.splice(index, 1);
    
                    window.localStorage.setItem(
                        this.fpdInstance.container.id, 
                        JSON.stringify(savedProducts)
                    );
    
                }

                this.fpdInstance.dispatchEvent(
                    new CustomEvent('actionLoad:Remove', {detail: {
                        index: index,
                        item: itemElem,
                    }})
                );

                itemElem.remove();

            }
        );

        return thumbnailElem;

	}

}

window.FPDSaveLoadModule = SaveLoadModule;
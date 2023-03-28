import Options from './Options.js';
import FontsLoader from '/src/helpers/FontsLoader.js';
import Translator from '/src/ui/Translator.js';
import UIManager from '/src/ui/UIManager';

import { loadGridImage } from '/src/helpers/utils';
import { getJSON } from '/src/helpers/request';

/**
 * Creates a new FancyProductDesigner.
 *
 * @class FancyProductDesigner
 * @param  {HTMLElement} elem - The container for the Fancy Product Designer.
 * @param  {Object} [opts={}] - {@link Options Options for configuration}.
 */
export default class FancyProductDesigner extends EventTarget {
    
    /**
     * The container for the Fancy Product Designer.
     *
     * @type {HTMLElement}
     * @readonly
     * @instance
     * @memberof FancyProductDesigner
     * @default null
     */
    container = null;
    
    /**
     * The main options set for this Product Designer.
     *
     * @type Object
     * @readonly
     * @instance
     * @memberof FancyProductDesigner
     * @default {}
     */
    mainOptions = {};
    
    /**
     * The current selected view instance.
     *
     * @type {FancyProductDesignerView}
     * @readonly
     * @instance
     * @memberof FancyProductDesigner
     */
    currentViewInstance = null;
    
    /**
     * Array containing all products.
     *
     * @type {Array}
     * @readonly
     * @instance
     * @memberof FancyProductDesigner
     */
    products = [];
    
    /**
     * Array containing all designs.
     *
     * @type {Array}
     * @readonly
     * @instance
     * @memberof FancyProductDesigner
     */
    designs = [];
    
    /**
     * The container for internal modals.
     *
     * @type HTMLElement
     * @default document.body
     * @instance
     * @memberof FancyProductDesigner
     */
    modalContainer = document.body;
    
    loadingCustomImage = false;
    lazyBackgroundObserver = null;
    
    constructor(elem, opts={}) {
        
        super();
        
        this.lazyBackgroundObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    loadGridImage(entry.target);
                    this.lazyBackgroundObserver.unobserve(entry.target);
                }
            });
        });
                
        this.container = elem;
        this.container.instance = this;
        
        this.mainOptions = Options.merge(Options.defaults, opts);
        
        //todo: remove this
        this.currentViewInstance = { options:  {...this.mainOptions} };
        
        this.translator = new Translator();
        this.translator.loadLangJSON(this.mainOptions.langJson, this.#langLoaded.bind(this));
                      
    }
    
    #langLoaded() {
        
        this.uiManager = new UIManager(this);
        
        this.uiManager.addEventListener('ready', (event) => {
            this.#loadFonts();
        });
        
        this.uiManager.init();
        
    }
    
    #loadFonts() {
        
        FontsLoader.load(this, () => {
            this.#uiReady();
        })
        
    }
    
    #uiReady() {
        
        //timeout when no language json file is loaded
        setTimeout(() => {
            
            this.dispatchEvent(
                new CustomEvent('uiSet')
            );
            
        }, 1)
        
        this.#ready();

    }
    
    #ready() {
            
        this.dispatchEvent(
            new CustomEvent('ready')
        );
        
        if(this.mainOptions.productsJSON) {
        
            if(typeof this.mainOptions.productsJSON === 'object') {
                this.setupProducts(this.mainOptions.productsJSON);
            }
            else {
                
                getJSON({
                    url: this.mainOptions.productsJSON,
                    onSuccess: (data) => {
                        this.setupProducts(data);
                    },
                    onError: () => {
                        alert('Products JSON could not be loaded. Please check that your URL is correct! URL: '+this.mainOptions.productsJSON);
                    } 
                });                    
        
            }
        
        }
        
        if(this.mainOptions.designsJSON) {
            
            if(typeof this.mainOptions.productsJSON === 'object') {
                this.setupDesigns(this.mainOptions.designsJSON);
            }
            else {
                
                getJSON({
                    url: this.mainOptions.designsJSON,
                    onSuccess: (data) => {
                        this.setupDesigns(data);
                    },
                    onError: () => {
                        alert('Design JSON could not be loaded. Please check that your URL is correct! URL: '+this.mainOptions.designsJSON);
                    } 
                });

            
            }
        
        }
            
    }
    
    //get category index by category name
    #getCategoryIndexInProducts(catName) {
        
        var catIndex = this.products.findIndex(obj => obj.category === catName);
        return catIndex === -1 ? false : catIndex;
    
    };
    
    setupProducts(products=[]) {
                        
        this.products = [];
        
        products.forEach((productItem) => {
        
            if(productItem.hasOwnProperty('category')) { //check if products JSON contains categories
        
                productItem.products.forEach((singleProduct) => {
                    this.addProduct(singleProduct, productItem.category);
                });
        
            }
            else {
                this.addProduct(productItem);
            }
        
        });
        
        //load first product
        if(this.mainOptions.loadFirstProductInStage && products.length > 0) {
            this.selectProduct(0);
        }
        else {
            this.toggleSpinner(false);
        }
        
        /**
         * Gets fired as soon as products are set.
         *
         * @event FancyProductDesigner#productsSet
         * @property {CustomEvent} event
         */
        this.dispatchEvent(
            new CustomEvent('productsSet')
        );
        
    }
    
    /**
     * Set up the designs with a JSON.
     *
     * @method setupDesigns
     * @param {Array} designs An array containg the categories with designs.
     */
    setupDesigns(designs) {

        this.designs = designs;
                
        /**
         * Gets fired as soon as the designs are set.
         *
         * @event FancyProductDesigner#designsSet
         */
        this.dispatchEvent(
            new CustomEvent('designsSet')
        );

    };
    
    /**
     * Adds a new product to the product designer.
     *
     * @method addProduct
     * @param {array} views An array containing the views for a product. A view is an object with a title, thumbnail and elements property. The elements property is an array containing one or more objects with source, title, parameters and type.
     * @param {string} [category] If categories are used, you need to define the category title.
     */
    addProduct(views, category) {
        
        var catIndex = this.#getCategoryIndexInProducts(category);
        
        if(category === undefined) {
            this.products.push(views);
        }
        else {
        
            if(catIndex === false) {
        
                catIndex = this.products.length;
                this.products[catIndex] = {category: category, products: []};
        
            }
        
            this.products[catIndex].products.push(views);
        
        }
        
        /**
         * Gets fired when a product is added.
         *
         * @event FancyProductDesigner#productAdd
         * @param {Event} event
         * @param {Array} views - The product views.
         * @param {String} category - The category title.
         * @param {Number} catIndex - The index of the category.
         */
        this.dispatchEvent(
            new CustomEvent('productAdd', {
                detail: {
                    views: views,
                    category: category,
                    catIndex: catIndex
                }
            })
        );
        
    }
    
    selectProduct(index) {
                
    }
    
    toggleSpinner() {
        
    }
    
    toggleSpinner() {
        
    }
    
    /**
     * Deselects the selected element of the current showing view.
     *
     * @method deselectElement
     * @instance
     * @memberof FancyProductDesigner
     */
    deselectElement() {
        
    }
    
    /**
     * Formats the price to a string with the currency and the decimal as well as the thousand separator.
     *
     * @method formatPrice
     * @param {Number} [price] The price thats gonna be formatted.
     * @return {String} The formatted price string.
     */
    formatPrice(price) {
        
        const priceFormatOpts = this.mainOptions.priceFormat;
        if(price && typeof priceFormatOpts === 'object') {
    
            const thousandSep = priceFormatOpts.thousandSep;
            const decimalSep = priceFormatOpts.decimalSep;
    
            let splitPrice = price.toString().split('.'),
                absPrice = splitPrice[0],
                decimalPrice = splitPrice[1],
                tempAbsPrice = '';
    
            if (typeof absPrice != 'undefined') {
    
                for (var i=absPrice.length-1; i>=0; i--) {
                    tempAbsPrice += absPrice.charAt(i);
                }
    
                tempAbsPrice = tempAbsPrice.replace(/(\d{3})/g, "$1" + thousandSep);
                if (tempAbsPrice.slice(-thousandSep.length) == thousandSep) {
                    tempAbsPrice = tempAbsPrice.slice(0, -thousandSep.length);
                }
    
                absPrice = '';
                for (var i=tempAbsPrice.length-1; i>=0 ;i--) {
                    absPrice += tempAbsPrice.charAt(i);
                }
    
                if (typeof decimalPrice != 'undefined' && decimalPrice.length > 0) {
                    //if only one decimal digit add zero at end
                    if(decimalPrice.length == 1) {
                        decimalPrice += '0';
                    }
                    absPrice += decimalSep + decimalPrice;
                }
    
            }
    
            absPrice = priceFormatOpts.currency.replace('%d', absPrice.toString());
    
            return absPrice;
    
        }
        else if(price) {
            price = priceFormatOpts.priceFormat.replace('%d', price);
        }
    
        return price;
    
    };
    
    _addGridItemToCanvas(item, additionalOpts={}, viewIndex) {
        
        viewIndex = viewIndex === undefined ? this.currentViewIndex : viewIndex;
    
        if(!this.currentViewInstance) { return; }
        
    // 
        //var options = deepMerge(
        //             {_addToUZ: instance.currentViewInstance.currentUploadZone},
        //             additionalOpts
        //         );
        // 
        //         this._addCanvasImage(
        //             item.dataset.source,
        //             item.dataset.title,
        //             options,
        //             $item.parents('[data-context="upload"]').length == 0,
        //             viewIndex
        //         );
    }
    
    _addCanvasImage(source, title, options={}, isRemoteImage=false, viewIndex) {
        
        viewIndex = viewIndex === undefined ? this.currentViewIndex : viewIndex;
        
        if(!this.currentViewInstance) { return; }
    
        let ajaxSettings = this.mainOptions.customImageAjaxSettings,
            saveOnServer = ajaxSettings.data && ajaxSettings.data.saveOnServer ? 1 : 0;
    
        //download remote image to local server (FB, Insta, Pixabay)
        if(saveOnServer && isRemoteImage) {
    
            _downloadRemoteImage(
                source,
                title,
                options
            );
    
        }
        //add data uri or local image to canvas
        else {
    
            this.loadingCustomImage = true;
            this.addCustomImage(
                source,
                title ,
                options,
                viewIndex
            );
    
        }
    
        if(this.productCreated && this.mainOptions.hideDialogOnAdd && this.mainBar) {
            this.mainBar.toggleDialog(false);
        }
    
    }
}

window.FancyProductDesigner = FancyProductDesigner;
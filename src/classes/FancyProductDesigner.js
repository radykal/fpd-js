import Options from './Options.js';
import FontsLoader from './FontsLoader.js';
import Translator from '../ui/Translator.js';
import UIManager from '../ui/UIManager';

import { loadGridImage } from '../utils.js';

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
     * The current selected view instance.
     *
     * @type {FancyProductDesignerView}
     * @readonly
     * @instance
     * @memberof FancyProductDesigner
     */
    currentViewInstance = null;
    loadingCustomImage = false;
    products = [];
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
        
        this.optionsInstance = new Options();
        this.mainOptions = this.optionsInstance.merge(Options.defaults, opts);
        
        this.translatorInstance = new Translator()
        this.translatorInstance.loadLangJSON(this.mainOptions.langJson, this.#langLoaded.bind(this));
              
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
                                    
                fetch(this.mainOptions.productsJSON)
                .then((response) => response.json())
                .catch(() => {
                    alert('Products JSON could not be loaded. Please check that your URL is correct! URL: '+this.mainOptions.productsJSON);
                })
                .then((data) => this.setupProducts(data));
        
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
        // if(this.mainOptions.loadFirstProductInStage && products.length > 0 && !stageCleared) {
        //     this.selectProduct(0);
        // }
        // else {
        //     this.toggleSpinner(false);
        // }
        
        /**
         * Gets fired as soon as products are set.
         *
         * @event FancyProductDesigner#productsSet
         * @property {CustomEvent} event
         * @property {Array} event.detail.products - An array containing the products.
         */
        this.dispatchEvent(
            new CustomEvent('productsSet', {
                detail: {
                    products: products
                }
            })
        );
        
        
    }
    
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
    
    selectProduct() {
        
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
}

window.FancyProductDesigner = FancyProductDesigner;


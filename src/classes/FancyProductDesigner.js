import Options from './Options.js';
import FancyProductDesignerView from './FancyProductDesignerView.js';
import FontsLoader from '/src/helpers/FontsLoader.js';
import Translator from '/src/ui/Translator.js';
import UIManager from '/src/ui/UIManager';
import Snackbar from '/src/ui/view/comps/Snackbar';

import { 
    addEvents,
    loadGridImage,
    isPlainObject,
    deepMerge,
    addElemClasses,
    removeElemClasses
} from '/src/helpers/utils';
import { getJSON } from '/src/helpers/request';

/**
 * Creates a new FancyProductDesigner.
 *
 * @class FancyProductDesigner
 * @param  {HTMLElement} elem - The container for the Fancy Product Designer.
 * @param  {Object} [opts={}] - {@link Options Options for configuration}.
 */
export default class FancyProductDesigner extends EventTarget {
    
    static forbiddenTextChars = /<|>/g;
    static proxyFileServer = '';
        
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
     * The current selected view index.
     *
     * @type Number
     * @default 0
     * @instance
     * @memberof FancyProductDesigner
     */
    currentViewIndex = 0;
    
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
    
    /**
     * The current selected product category index.
     *
     * @type Number
     * @default 0
     * @instance
     * @memberof FancyProductDesigner
     */
    currentCategoryIndex = 0;
    
    /**
     * The current selected product index.
     *
     * @type Number
     * @default 0
     * @instance
     * @memberof FancyProductDesigner
     */
    currentProductIndex = 0;
    
    /**
     * Array containing all FancyProductDesignerView instances of the current showing product.
     *
     * @type Array
     * @default []
     * @instance
     * @memberof FancyProductDesigner
     */
    viewInstances = [];
    
    /**
     * The current views.
     *
     * @type Array
     * @default null
     * @instance
     * @memberof FancyProductDesigner
     */
    currentViews = null;
    
    /**
     * The current selected element.
     *
     * @property currentElement
     * @type fabric.Object
     * @default null
     */
    currentElement = null;
    
    /**
     * Indicates if the product is created or not.
     *
     * @type Boolean
     * @default false
     * @instance
     * @memberof FancyProductDesigner
     */
    productCreated = false;
    
    /**
     * Object containing all color link groups.
     *
     * @type Object
     * @default {}
     * @instance
     * @memberof FancyProductDesigner
     */
    colorLinkGroups = {};
    
    /**
     * Array will all added custom elements.
     *
     * @type Array
     * @default []
     * @instance
     * @memberof FancyProductDesigner
     */
    globalCustomElements = [];
    
    /**
     * Indicates if the product was saved.
     *
     * @type Boolean
     * @default false
     * @instance
     * @memberof FancyProductDesigner
     */
    doUnsavedAlert = false;
    
    /**
     * The price considering the elements price in all views with order quantity.
     *
     * @property currentPrice
     * @type Number
     * @default 0
     */
    currentPrice = 0;
    
    /**
     * The price considering the elements price in all views without order quantity.
     *
     * @property singleProductPrice
     * @type Number
     * @default 0
     */
    singleProductPrice = 0;
    
    /**
     * The calculated price for the pricing rules.
     *
     * @property pricingRulesPrice
     * @type Number
     * @default 0
     */
    pricingRulesPrice = 0;
    
    loadingCustomImage = false;
    lazyBackgroundObserver = null;
    
    #prevPrintingBoxes = [];
    #totalProductElements = 0;
    #productElementLoadingIndex = 0;
    #inTextField = false;
    
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
        
        if(this.mainOptions.keyboardControl) {
            
            addEvents(
                document,
                'keydown',
                (evt) => {
                    
                    if(this.currentViewInstance && this.currentViewInstance.fabricCanvas) {
                        
                        const viewInst = this.currentViewInstance;
                        const targetNodename = evt.target.nodeName;
                        const currentElement = viewInst.fabricCanvas.getActiveObject(); 
                                                
                        if(currentElement && !['TEXTAREA', 'INPUT'].includes(targetNodename)) {
                        
                            switch(evt.which) {
                                case 8:
                                    //remove element
                                    if(currentElement.removable) {
                                        viewInst.fabricCanvas.removeElement(currentElement);
                                    }
                        
                                break;
                                case 37: // left
                        
                                    if(currentElement.draggable) {
                                        viewInst.fabricCanvas.setElementParameters({
                                            left: currentElement.left - 1
                                        });
                                    }
                        
                                break;
                                case 38: // up
                        
                                    if(currentElement.draggable) {
                                        viewInst.fabricCanvas.setElementParameters({
                                            top: currentElement.top - 1
                                        });
                                    }
                        
                                break;
                                case 39: // right
                        
                                    if(currentElement.draggable) {
                                        viewInst.fabricCanvas.setElementParameters({
                                            left: currentElement.left + 1
                                        });
                                    }
                        
                                break;
                                case 40: // down
                        
                                    if(currentElement.draggable) {
                                        viewInst.fabricCanvas.setElementParameters({
                                            top: currentElement.top + 1
                                        });
                                    }
                        
                                break;
                        
                                default: return; //other keys
                            }
                        
                            evt.preventDefault();
                        
                        }
                        
                    }                    
                    
                }
            )
        
        }
        
        //window resize handler
        let currentWindowWidth = 0;
        addEvents(
            window,
            'resize',
            (evt) => {
                
                //fix for android browser, because keyboard trigger resize event
                if(window.innerWidth === currentWindowWidth || this.#inTextField) {
                    return;
                }
                
                currentWindowWidth = window.innerWidth;
                
                if(this.currentViewInstance) {
                    this.currentViewInstance.resetSize();
                }
                
                
                //todo
                // if(instance.actions) {
                // 
                //     if(!zoomReseted) {
                //         instance.resetZoom();
                //     }
                // 
                // }
                
                //deselect element if one is selected and active element is not input (FB browser fix)
                //todo
                // if(this.currentElement && $(document.activeElement).is(':not(input)') && $(document.activeElement).is(':not(textarea)')) {
                //     this.deselectElement();
                // }
                
                //todo
                // if((instance.currentElement && instance.currentElement.isEditing) || instance.mainOptions.editorMode) {
                //     return;
                // }
                
                
                
            }
        )
            
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
         * @param {CustomEvent} event
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
         * @param {CustomEvent} event
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
         * @param {CustomEvent} event
         * @param {Array} event.detail.views - The product views.
         * @param {String} event.detail.category - The category title.
         * @param {Number} event.detail.catIndex - The index of the category.
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
    
    selectProduct(index, categoryIndex) {
        
        this.currentCategoryIndex = categoryIndex === undefined ? this.currentCategoryIndex : categoryIndex;
        
        let productsObj;
        if(this.products && this.products.length && this.products[0].category) { 
            //categories enabled
            const category = this.products[this.currentCategoryIndex];
            productsObj = category.products;
        }
        else { 
            //no categories enabled
            productsObj = instance.products;
        }
        
        this.currentProductIndex = index;
        if(index < 0) { 
            this.currentProductIndex = 0; 
        }
        else if(index > productsObj.length-1) { 
            this.currentProductIndex = productsObj.length-1; 
        }
        
        const product = productsObj[this.currentProductIndex];
        
        /**
         * Gets fired when a product is selected.
         *
         * @event FancyProductDesigner#productSelect
         * @param {CustomEvent} event
         * @param {Object} event.detail.product - An object containing the product (views).
         */
        this.dispatchEvent(
            new CustomEvent('productSelect', {
                detail: {
                    product: product
                }
            })
        );
        
        this.loadProduct(
            product, 
            this.mainOptions.replaceInitialElements
        );
                
    }
    
    /**
     * Loads a new product to the product designer.
     *
     * @method loadProduct
     * @param {array} views An array containing the views for the product.
     * @param {Boolean} [onlyReplaceInitialElements=false] If true, the initial elements will be replaced. Custom added elements will stay on the canvas.
     * @param {Boolean} [mergeMainOptions=false] Merges the main options into every view options.
     */
    loadProduct(views, replaceInitialElements=false, mergeMainOptions=false) {
        
        if(!views) { return; }
        
        this.toggleSpinner(true);
    
        this.#prevPrintingBoxes = [];
        this.viewInstances.forEach((viewInstance) => {
            
            //todo
            //this.#prevPrintingBoxes.push(FPDUtil.objectHasKeys(viewInstance.options.printingBox, ['left','top','width','height']) ? viewInstance.options.printingBox : null);
    
        })
        
        
        //reset when loading a product
        this.productCreated = false;
        this.colorLinkGroups = {};
    
        this.globalCustomElements = [];
        if(replaceInitialElements) {
            this.globalCustomElements = this.getCustomElements();
        }
        else {
            this.doUnsavedAlert = false;
        }
    
        this.fixedElements = this.getFixedElements();
    
        this.reset();
    
        if(mergeMainOptions) {
    
            views.forEach((view, i) => {
                view.options = Options.merge(this.mainOptions, view.options);
            });
    
        }
    
        this.currentViews = views;
        
    
        this.#totalProductElements = this.#productElementLoadingIndex = 0;
        views.forEach((view, i) => {
            this.#totalProductElements += view.elements.length;
        });
    
        addEvents(
            this,
            'viewCreate',
            this.#onViewCreated
        )
    
        if(views) {
            this.addView(views[0]);
        }
    
    }
    
    /**
     * Adds a view to the current visible product.
     *
     * @method addView
     * @param {object} view An object with title, thumbnail and elements properties.
     */
    addView(view) {
    
        const viewImageURL = FancyProductDesigner.proxyFileServer ? FancyProductDesigner.proxyFileServer + view.thumbnail : view.thumbnail;
        
        //create view selection item
        const viewSelectonItem = document.createElement('div');
        viewSelectonItem.className = 'fpd-shadow-1 fpd-item';
        viewSelectonItem.title = view.title;
        viewSelectonItem.innerHTML = '<picture style="background-image: url('+viewImageURL+');"></picture>';
        
        this.viewsWrapper.container
        .querySelector('.fpd-views-selection')
        .append(viewSelectonItem);
        
        addEvents(
            viewSelectonItem,
            'click', 
            (evt) => {
                
                const itemIndex = Array.from(this.viewsWrapper.container.querySelectorAll('.fpd-views-selection > div')).indexOf(viewSelectonItem);
                                
                this.selectView(itemIndex);
                
            }
        )
        
    
        //todo get relevant view options
        let relevantMainOptions = {};
        FancyProductDesignerView.relevantOptions.forEach((key) => {
            
            let mainProp = this.mainOptions[key];
            relevantMainOptions[key] = isPlainObject(mainProp) ? {...mainProp} : mainProp;
            
        })
            
        view.options = isPlainObject(view.options) ? deepMerge(relevantMainOptions, view.options) : relevantMainOptions;
    
        let viewInstance = new FancyProductDesignerView(
            this.productStage, 
            view, 
            this.#viewStageAdded.bind(this), 
            this.mainOptions.fabricCanvasOptions 
        );
        
        viewInstance.fabricCanvas.on(
            'elementAdd',
            ({element}) => {
                
                if(!element) {
                    this.toggleSpinner(false);
                    return;
                }
                
                if(this.productCreated && element.getType() == 'image' && element.isCustom) {
                    this.toggleSpinner(false);
                    Snackbar(this.translator.getTranslation('misc', 'image_added'));
                }
                // 
                //         //check if element has a color linking group
                //         if(element.colorLinkGroup && element.colorLinkGroup.length > 0 && !instance.mainOptions.editorMode) {
                // 
                //             var viewIndex = this.getIndex();
                // 
                //             if(instance.colorLinkGroups.hasOwnProperty(element.colorLinkGroup)) { //check if color link object exists for the link group
                // 
                //                 //add new element with id and view index of it
                //                 instance.colorLinkGroups[element.colorLinkGroup].elements.push({id: element.id, viewIndex: viewIndex});
                // 
                //                 if(typeof element.colors === 'object') {
                // 
                //                     //create color group colors
                //                     var colorGroupColors = instance.mainOptions.replaceColorsInColorGroup ? element.colors : instance.colorLinkGroups[element.colorLinkGroup].colors.concat(element.colors);
                //                     instance.colorLinkGroups[element.colorLinkGroup].colors = FPDUtil.arrayUnique(colorGroupColors);
                // 
                //                 }
                // 
                //             }
                //             else {
                // 
                //                 //create initial color link object
                //                 instance.colorLinkGroups[element.colorLinkGroup] = {elements: [{id:element.id, viewIndex: viewIndex}], colors: []};
                // 
                //                 if(typeof element.colors === 'object') {
                // 
                //                     instance.colorLinkGroups[element.colorLinkGroup].colors = element.colors;
                // 
                //                 }
                // 
                //             }
                // 
                //         }
                // 
                //         //close dialog and off-canvas on element add
                //         if(instance.mainBar && instance.productCreated && instance.mainOptions.hideDialogOnAdd) {
                //             instance.mainBar.toggleDialog(false);
                // 
                //         }
                // 
                /**
                 * Gets fired when an element is added.
                 *
                 * @event FancyProductDesigner#elementAdd
                 * @param {Event} event
                 * @param {fabric.Object} element
                 */
                this.dispatchEvent(
                    new CustomEvent('elementAdd', {
                        detail: {
                            element: element
                        }
                    })
                );
                // 
                //         $elem.trigger('viewCanvasUpdate', [viewInstance]);
                
            }
        )
        addEvents(
            viewInstance.fpdCanvas,
            
        )
        
    //     
    //     $(viewInstance)
    //     .on('beforeElementAdd', function(evt, type, source, title, params) {
    // 
    //         if(!instance.productCreated) {
    //             _productElementLoadingIndex++;
    // 
    //             var loadElementState = title + '<br>' + String(_productElementLoadingIndex) + '/' + _totalProductElements;
    //             $stageLoader.find('.fpd-loader-text').html(loadElementState);
    //         }
    // 
    //     })
    //     .on('canvas:mouseUp', function(evt, viewInstance) {
    // 
    //         if(instance.mainOptions.fabricCanvasOptions.allowTouchScrolling) {
    //             $elem.removeClass('fpd-disable-touch-scrolling');
    //             instance.currentViewInstance.stage.allowTouchScrolling = true;
    //         }
    // 
    //     })
    //     .on('canvas:mouseMove', function(evt, viewInstance, opts) {
    // 
    //         instance.mouseOverCanvas = opts.target ? opts.target : true;
    // 
    //     })
    //     .on('canvas:mouseOut', function(evt, viewInstance) {
    // 
    //         instance.mouseOverCanvas = false;
    // 
    //     })
    //     .on('elementAdd', function(evt, element) {
    // 
    //         
    // 
    //     })
    //     .on('boundingBoxToggle', function(evt, currentBoundingObject, addRemove) {
    // 
    //         /**
    //          * Gets fired as soon as the bounding box is added to or removed from the stage.
    //          *
    //          * @event FancyProductDesigner#boundingBoxToggle
    //          * @param {Event} event
    //          * @param {fabric.Object} currentBoundingObject - A fabricJS rectangle representing the bounding box.
    //          * @param {Boolean} addRemove - True=added, false=removed.
    //          */
    //         $elem.trigger('boundingBoxToggle', [currentBoundingObject, addRemove]);
    // 
    //     })
    //     .on('elementSelect', function(evt, element) {
    // 
    //         instance.currentElement = element;
    // 
    //         if(element) {
    //             _updateElementTooltip();
    //         }
    //         else { //deselected
    // 
    //             if(instance.$elementTooltip) {
    //                 instance.$elementTooltip.hide();
    //             }
    // 
    //             instance.$mainWrapper.children('.fpd-snap-line-h, .fpd-snap-line-v').hide();
    // 
    //         }
    //         /**
    //          * Gets fired when an element is selected.
    //          *
    //          * @event FancyProductDesigner#elementSelect
    //          * @param {Event} event
    //          * @param {fabric.Object} element
    //          */
    //         $elem.trigger('elementSelect', [element]);
    // 
    //     })
    //     .on('elementChange', function(evt, type, element) {
    // 
    //         _updateElementTooltip();
    //         _updateEditorBox(element.getBoundingRect());
    // 
    //         /**
    //          * Gets fired when an element is changed.
    //          *
    //          * @event FancyProductDesigner#elementChange
    //          * @param {Event} event
    //          * @param {fabric.Object} element
    //          */
    //         $elem.trigger('elementChange', [type, element]);
    // 
    //     })
    //     .on('elementModify', function(evt, element, parameters) {
    // 
    //         _updateElementTooltip();
    // 
    //         /**
    //          * Gets fired when an element is modified.
    //          *
    //          * @event FancyProductDesigner#elementModify
    //          * @param {Event} event
    //          * @param {fabric.Object} element
    //          * @param {Object} parameters
    //          */
    //         $elem.trigger('elementModify', [element, parameters]);
    // 
    //         /**
    //          * Gets fired when an element is modified.
    //          *
    //          * @event FancyProductDesigner#viewCanvasUpdate
    //          * @param {Event} event
    //          * @param {FancyProductDesignerView} viewInstance
    //          */
    //         $elem.trigger('viewCanvasUpdate', [viewInstance]);
    // 
    //     })
    //     .on('undoRedoSet', function(evt, undos, redos) {
    // 
    //         instance.doUnsavedAlert = true;
    //         _toggleUndoRedoBtn(undos, redos);
    // 
    //         /**
    //          * Gets fired when an undo or redo state is set.
    //          *
    //          * @event FancyProductDesigner#undoRedoSet
    //          * @param {Event} event
    //          * @param {Array} undos - Array containing all undo objects.
    //          * @param {Array} redos - Array containing all redo objects.
    //          */
    //         $elem.trigger('undoRedoSet', [undos, redos]);
    // 
    //     })
    //     .on('priceChange', function(evt, price, viewPrice) {
    // 
    //         var truePrice = instance.calculatePrice();
    // 
    //         /**
    //          * Gets fired as soon as the price changes in a view.
    //          *
    //          * @event FancyProductDesigner#priceChange
    //          * @param {Event} event
    //          * @param {number} elementPrice - The price of the element.
    //          * @param {number} totalPrice - The true price of all views with quantity.
    //          * @param {number} singleProductPrice - The true price of all views without quantity.
    //          */
    //         $elem.trigger('priceChange', [price, truePrice, instance.singleProductPrice]);
    // 
    //     })
    //     .on('elementCheckContainemt', function(evt, element, boundingBoxMode) {
    // 
    //         if(boundingBoxMode === 'inside') {
    // 
    //             _updateElementTooltip();
    // 
    //         }
    // 
    //     })
    //     .on('elementColorChange', function(evt, element, hex, colorLinking) {
    // 
    //         if(instance.productCreated && colorLinking && element.colorLinkGroup && element.colorLinkGroup.length > 0) {
    // 
    //             var group = instance.colorLinkGroups[element.colorLinkGroup];
    //             if(group && group.elements) {
    //                 for(var i=0; i < group.elements.length; ++i) {
    // 
    //                     var id = group.elements[i].id,
    //                         viewIndex = group.elements[i].viewIndex,
    //                         target = instance.getElementByID(id, viewIndex);
    // 
    //                     if(target && target !== element && hex) {
    //                         instance.viewInstances[viewIndex].changeColor(target, hex, false);
    //                     }
    // 
    //                 }
    //             }
    // 
    //         }
    // 
    //         /**
    //          * Gets fired when the color of an element is changed.
    //          *
    //          * @event FancyProductDesigner#elementColorChange
    //          * @param {Event} event
    //          * @param {fabric.Object} element
    //          * @param {String} hex Hexadecimal color string.
    //          * @param {Boolean} colorLinking Color of element is linked to other colors.
    //          */
    //         $elem.trigger('elementColorChange', [element, hex, colorLinking]);
    //         $elem.trigger('viewCanvasUpdate', [viewInstance]);
    // 
    //     })
    //     .on('elementRemove', function(evt, element) {
    // 
    //         //delete fixed element
    //         var deleteIndex = instance.fixedElements.findIndex(function(item) {
    //             return item.element.title == element.title
    //         })
    // 
    //         if(deleteIndex != -1) {
    //             instance.fixedElements.splice(deleteIndex, 1);
    //         }
    // 
    //         /**
    //          * Gets fired as soon as an element has been removed.
    //          *
    //          * @event FancyProductDesigner#elementRemove
    //          * @param {Event} event
    //          * @param {fabric.Object} element - The fabric object that has been removed.
    //          */
    //         $elem.trigger('elementRemove', [element]);
    // 
    //         $elem.trigger('viewCanvasUpdate', [viewInstance]);
    // 
    //     })
    //     .on('fabricObject:added fabricObject:removed', function(evt, element) {
    // 
    //         $elem.trigger(evt.type, [element]);
    // 
    //     })
    //     .on('textEditEnter', function() {
    // 
    //         if(instance.currentElement) {
    //             instance.toolbar.updatePosition(instance.currentElement);
    //         }
    // 
    //     })
    
        viewInstance.init();
    
    }
    
    #viewStageAdded(viewInstance) {
        
        this.viewInstances.push(viewInstance);
        
        addEvents(
            viewInstance,
            'sizeUpdate',
            (evt) => {
                
                const viewInst = evt.currentTarget;
                let mainHeight = evt.detail.canvasHeight+'px';
                
                this.productStage.style.height = mainHeight;
                
                const mainBarClasslist = this.container.classList;
                if(mainBarClasslist.contains('fpd-sidebar')) {
                    this.mainBar.container.style.height = mainHeight;
                }
                
                
            }
        )
        
        /**
         * Gets fired when a view is created.
         *
         * @event FancyProductDesigner#viewCreate
         * @param {Event} event
         * @param {FancyProductDesignerView} viewInstance
         */
        this.dispatchEvent(
            new CustomEvent('viewCreate', {
                detail: {
                    viewInstance: viewInstance
                }
            })
        );
        
    }
    
    toggleSpinner(toggle=true, msg='') {
        
        this.mainLoader.querySelector('.fpd-loader-text').innerText = msg;
        this.mainLoader.classList.toggle('fpd-hidden', !toggle);

        return this.mainLoader; 
        
    }
    
    /**
     * Selects a view from the current visible views.
     *
     * @method selectView
     * @param {number} index The requested view by an index value. 0 will load the first view.
     */
    selectView(index=0) {
        
        if(this.viewInstances.length <= 0) {return;}
        
        if(this.currentViewInstance && this.currentViewInstance.fabricCanvas)
            this.currentViewInstance.fabricCanvas.resetZoom();
        
        this.currentViewIndex = index;
        if(index < 0) { 
            this.currentViewIndex = 0; 
        }
        else if(index > this.viewInstances.length-1) { 
            this.currentViewIndex = this.viewInstances.length-1; 
        }
        
        
        //todo instance.$mainWrapper.children('.fpd-ruler').remove();
        
        if(this.currentViewInstance) {
            
            if(this.currentViewInstance.fabricCanvas) {
                this.currentViewInstance.fabricCanvas.clearHistory();
            }
        
        //todo
        //     //remove some objects
        //     var removeObjs = ['_snap_lines_group', '_ruler_hor', '_ruler_ver'];
        //     for(var i=0; i<removeObjs.length; ++i) {
        //         var removeObj = instance.currentViewInstance.getElementByID(removeObjs[i]);
        //         if(removeObj) {
        //             instance.currentViewInstance.stage.remove(removeObj);
        //         }
        //     }
        // 
        //     instance.currentViewInstance._snapElements = false;
        
        }
        
        this.currentViewInstance = this.viewInstances[this.currentViewIndex];
        
        this.deselectElement();
        
        //select view wrapper and render stage of view
        const viewStages = this.productStage.querySelectorAll('.fpd-view-stage');
        addElemClasses(
            viewStages,
            ['fpd-hidden']
        );
        
        removeElemClasses(
            viewStages.item(this.currentViewIndex),
            ['fpd-hidden']
        );
                
        
        //todo
        //toggle view locker
        // instance.$mainWrapper.children('.fpd-modal-lock')
        // .removeClass('fpd-animated')
        // .toggleClass('fpd-active', instance.currentViewInstance.options.optionalView)
        // .toggleClass('fpd-unlocked', !instance.currentViewInstance.locked);
        // setTimeout(function() {
        //     instance.$mainWrapper.children('.fpd-modal-lock').addClass('fpd-animated');
        // }, 1);
        
        //reset view canvas size
        this.currentViewInstance.resetSize();
        
        
        /**
         * Gets fired as soon as a view has been selected.
         *
         * @event FancyProductDesigner#viewSelect
         * @param {Event} event
         */
        this.dispatchEvent(
            new CustomEvent('viewSelect')
        );
        
    }
    
    /**
     * Returns an array with fabricjs objects.
     *
     * @method getElements
     * @param {Number} [viewIndex=-1] The index of the target view. By default all views are target.
     * @param {String} [elementType='all'] The type of elements to return. By default all types are returned. Possible values: text, image.
     * @param {String} [deselectElement=true] Deselect current selected element.
     * @return {Array} An array containg the elements.
     */
    getElements(viewIndex, elementType='all', deselectElement=true) {
    
        viewIndex = viewIndex === undefined || isNaN(viewIndex) ? -1 : viewIndex;
    
        if(deselectElement) {
            this.deselectElement();
        }
    
        let allElements = [];
        if(viewIndex === -1) {
    
            for(var i=0; i < this.viewInstances.length; ++i) {
                allElements = allElements.concat(this.viewInstances[i].fabricCanvas.getObjects());
            }
    
        }
        else {
    
            if(this.viewInstances[viewIndex]) {
                allElements = this.viewInstances[viewIndex].fabricCanvas.getObjects();
            }
            else {
                return [];
            }
    
        }
    
        //remove bounding-box and printing-box object
        allElements = allElements.filter((obj) => {
            return !obj._ignore;
        });
    
        if(elementType === 'text') {
    
            var textElements = [];
            allElements.forEach((elem) => {
    
                if(elem.getType(elem) === 'text') {
                    textElements.push(elem);
                }
    
            });
    
            return textElements;
    
        }
        else if(elementType === 'image') {
    
            var imageElements = [];
            allElements.forEach(function(elem) {
    
                if(elem.getType() === 'image') {
                    imageElements.push(elem);
                }
    
            });
    
            return imageElements;
    
        }
    
        return allElements;
    
    };
    
    /**
     * Returns an array with all custom added elements.
     *
     * @method getCustomElements
     * @param {string} [type='all'] The type of elements. Possible values: 'all', 'image', 'text'.
     * @param {Number} [viewIndex=-1] The index of the target view. By default all views are target.
     * @param {String} [deselectElement=true] Deselect current selected element.
     * @return {array} An array with objects with the fabric object and the view index.
     * @instance
     * @memberof FancyProductDesigner
     */
    getCustomElements(type='all', viewIndex=-1, deselectElement=true) {
        
        let customElements = [];
        
        //todo
        const elements = this.getElements(viewIndex, type, deselectElement);
        elements.forEach((element) => {
    
            if(element.isCustom) {
                
                const viewIndex = Array.from(this.productStage.querySelectorAll('.fpd-view-stage')).indexOf(element.canvas.wrapperEl);
                
                customElements.push({element: element, viewIndex: viewIndex});
    
            }
    
        });
    
        return customElements;
    
    }
    
    /**
     * Returns an array with all fixed elements.
     *
     * @method getFixedElements
     * @param {string} [type='all'] The type of elements. Possible values: 'all', 'image', 'text'.
     * @param {Number} [viewIndex=-1] The index of the target view. By default all views are target.
     * @param {String} [deselectElement=true] Deselect current selected element.
     * @return {array} An array with objects with the fabric object and the view index.
     * @instance
     * @memberof FancyProductDesigner
     */
    getFixedElements(type='all', viewIndex=-1, deselectElement=true) {
        
        let fixedElements = [];
    
        const elements = this.getElements(viewIndex, type, deselectElement);
            
        elements.forEach((element) => {
    
            if(element.fixed) {
    
                const viewIndex = Array.from(this.productStage.querySelectorAll('.fpd-view-stage')).indexOf(element.canvas.wrapperEl);
                
                fixedElements.push({element: element, viewIndex: viewIndex});
    
            }
    
        });
    
        return fixedElements;
    
    };
    
    /**
     * Get an elment by ID.
     *
     * @method getElementByID
     * @param {Number} id The id of an element.
     * @param {Number} [viewIndex] The view index you want to search in. If no index is set, it will use the current showing view.
     */
     getElementByID(id, viewIndex) {
    
        viewIndex = viewIndex === undefined ? this.currentViewIndex : viewIndex;
    
        return this.viewInstances[viewIndex] ? this.viewInstances[viewIndex].fabricCanvas.getElementByID(id) : null;
    
    };
    
    /**
     * Clears the product stage and resets everything.
     *
     * @method reset
     * @instance
     * @memberof FancyProductDesigner
     */
    reset() {
    
        if(this.currentViews === null) { return; }
        
        this.removeEventListener('viewCreate', this.#onViewCreated)
    
        this.deselectElement();
        this.currentViewInstance.fabricCanvas.resetZoom();

        this.currentViewIndex = this.currentPrice = this.singleProductPrice = this.pricingRulesPrice = 0;
        this.currentViewInstance = this.currentViews = this.currentElement = null;
    
        this.viewInstances.forEach((view) => {
            view.fabricCanvas.clear();
        });
        
        this.productStage.innerHTML = '';
        this.viewsWrapper.container.querySelector('.fpd-views-selection').innerHTML = '';
    
        this.viewInstances = [];
    
        /**
         * Gets fired as soon as the stage has been cleared.
         *
         * @event FancyProductDesigner#clear
         * @param {Event} event
         */
        this.dispatchEvent(
            new CustomEvent('clear')
        );
        
        this.dispatchEvent(
            new CustomEvent('priceChange')
        );
            
    };
    
    /**
     * Deselects the selected element of the current showing view.
     *
     * @method deselectElement
     * @instance
     * @memberof FancyProductDesigner
     */
    deselectElement() {
        
        if(this.currentViewInstance && this.currentViewInstance.fabricCanvas) {
                
            this.currentViewInstance.fabricCanvas.deselectElement();
        
        }
        
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
    
    }
    
    #onViewCreated() {
    
        //add all views of product till views end is reached
        if(this.viewInstances.length < this.currentViews.length) {
    
            this.addView(this.currentViews[this.viewInstances.length]);
    
        }
        //all views added
        else {
            
            this.removeEventListener('viewCreate', this.#onViewCreated)
    
            this.toggleSpinner(false);
            this.selectView(0);
            
            //search for object with auto-select
    //         if(!instance.mainOptions.editorMode && instance.currentViewInstance && $(instance.currentViewInstance.stage.getElement()).is(':visible')) {
    //             var viewElements = instance.currentViewInstance.stage.getObjects(),
    //                 selectElement = null;
    // 
    //             for(var i=0; i < viewElements.length; ++i) {
    //                 var obj = viewElements[i];
    // 
    //                  if(obj.autoSelect && !obj.hasUploadZone) {
    //                      selectElement = obj;
    //                  }
    // 
    //             }
    //         }
    //todo
    //         if(selectElement && instance.currentViewInstance) {
    //             setTimeout(function() {
    // 
    //                 instance.currentViewInstance.stage.setActiveObject(selectElement);
    //                 selectElement.setCoords();
    //                 instance.currentViewInstance.stage.renderAll();
    // 
    //             }, 500);
    //         }
    
            this.productCreated = true;
        
            /**
             * Gets fired as soon as a product has been fully added to the designer.
             *
             * @event FancyProductDesigner#productCreate
             * @param {Event} event
             */
            this.dispatchEvent(
                new CustomEvent('productCreate')
            );
    
        }
    
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
            this.mainBar.toggleContentDisplay(false);
        }
    
    }
    
    addCanvasDesign(source, title, params={}, viewIndex) {
        
        if(!this.currentViewInstance) { return; }
    
        this.toggleSpinner(true, this.translator.getTranslation('misc', 'loading_image'));
        
        params = deepMerge(this.currentViewInstance.options.customImageParameters, params);
        
        params.isCustom = true;
        if(this.currentViewInstance.currentUploadZone) {
            params._addToUZ = this.currentViewInstance.currentUploadZone;
        }
    
        this.currentViewInstance.fpdCanvas.addElement(
            'image', 
            source, 
            title, 
            params, 
            viewIndex
        );
    
        if(this.productCreated && this.mainOptions.hideDialogOnAdd && this.mainBar) {
            this.mainBar.toggleContentDisplay(false);
        }
    
    };
}

window.FancyProductDesigner = FancyProductDesigner;
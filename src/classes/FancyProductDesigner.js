import Options from './Options.js';
import FancyProductDesignerView from './FancyProductDesignerView.js';
import FontsLoader from '/src/helpers/FontsLoader.js';
import Translator from '/src/ui/Translator.js';
import UIManager from '/src/ui/UIManager';
import Snackbar from '/src/ui/view/comps/Snackbar';
import EditorBox from '/src/ui/controller/EditorBox';

import { 
    addEvents,
    loadGridImage,
    isPlainObject,
    deepMerge,
    addElemClasses,
    removeElemClasses,
    checkImageDimensions,
    arrayUnique
} from '/src/helpers/utils';
import { getJSON, postJSON } from '/src/helpers/request';

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
     * You can register your own modules and add them in this static property.
     *
     * @type {Object}
     * @readonly
     * @static
     * @instance
     * @memberof FancyProductDesigner
     * @default {}
     * @example {'my-module': ModuleClass}
     */
    static additionalModules = {}; 
        
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
     * Array with all added custom elements.
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

        //uploads settings
        const ajaxSettings = this.mainOptions.customImageAjaxSettings;
        this.uploadsURL = ajaxSettings.url;
        this.uploadsDir = (ajaxSettings.data && ajaxSettings.data.uploadsDir) ? ajaxSettings.data.uploadsDir : '';
        this.uploadsDirURL = (ajaxSettings.data && ajaxSettings.data.uploadsDirURL) ? ajaxSettings.data.uploadsDirURL : '';
        this.uploadsToServer = (ajaxSettings.data && ajaxSettings.data.saveOnServer) ? 1 : 0

        //lowercase all keys in hexNames
        let newHexNames = {};
        Object.keys(this.mainOptions.hexNames).forEach((hexKey) => {
            newHexNames[hexKey.toLowerCase()] = this.mainOptions.hexNames[hexKey];            
        })
        this.mainOptions.hexNames = newHexNames;
        
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
                    this.currentViewInstance.fabricCanvas.resetSize();
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
                if(this.currentElement && !['INPUT', 'TEXTAREA'].includes(document.activeElement)) {
                    this.deselectElement();
                }
                    
            }
        )

        addEvents(
            this,
            'productCreate',
            this.#addGlobalElements.bind(this)
        )

        //store a boolean to detect if the text in textarea (toolbar) was selected, then dont deselect
		let _fixSelectionTextarea = false;
        addEvents(
            document.body,
            'mousedown',
            (evt) => {

            }
        )

        addEvents(
            document.body,
            ['focusin', 'blur'],
            (evt) => {
                
                if(['TEXTAREA', 'INPUT'].includes(evt.target.nodeName)) {
                    this.#inTextField = evt.type == 'focusin';
                    
                }                

            },
            true
        )

        addEvents(
            document.body,
            ['mouseup', 'touchend'],
            (evt) => {
                
                let fpdContainers = Array.from(document.querySelectorAll('.fpd-container'));
                const clickedWithinContainer = Boolean(fpdContainers.find((container) => container.contains(evt.target)));
                
                //deselect element if click outside of a fpd-container
                if(!clickedWithinContainer 
                    && this.mainOptions.deselectActiveOnOutside 
                    && !_fixSelectionTextarea
                ) {

                    this.deselectElement();

                }

                _fixSelectionTextarea = false;



            },
            true
        )

        if(typeof this.mainOptions.editorMode === 'string') {
            new EditorBox(this);
        }
            
    }

    #addGlobalElements() {

        const globalElements = this.globalCustomElements.concat(this.fixedElements);
        if(!globalElements.length) return;

        let globalElementsCount = 0;
        const _addCustomElement = (object) => {
            
            const viewInstance = this.viewInstances[object.viewIndex];

            if(viewInstance) { //add element to correct view

                const fpdElement = object.element;

                let propertyKeys = Object.keys(this.mainOptions.elementParameters);
                if(fpdElement.getType() === 'text') {
                    propertyKeys = propertyKeys.concat(Object.keys(this.mainOptions.textParameters));
                }
                else {
                    propertyKeys = propertyKeys.concat(Object.keys(this.mainOptions.imageParameters));
                }

                let elementProps = fpdElement.getElementJSON(false, propertyKeys);

                //delete old printing box to fetch printing box from current view
                if(elementProps._printingBox) {
                    delete elementProps.boundingBox;
                }

                viewInstance.fabricCanvas.addElement(
                    fpdElement.getType(),
                    fpdElement.source,
                    fpdElement.title,
                    elementProps
                );

            }
            else {
                _customElementAdded();
            }

        };

        const _customElementAdded = () => {

            globalElementsCount++;
            if(globalElementsCount < globalElements.length) {
                _addCustomElement(globalElements[globalElementsCount]);
            }
            else {
                this.removeEventListener('elementAdd', _customElementAdded);
            }

        };

        addEvents(
            this,
            'elementAdd',
            _customElementAdded
        )
                
        if(globalElements[0])
            _addCustomElement(globalElements[0]);

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
    
        //get relevant view options
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
        
        viewInstance.fabricCanvas.on({
            'beforeElementAdd': (opts) => {

                if(!this.productCreated) {

                    this.#productElementLoadingIndex++;
        
                    const txt = opts.title + '<br>' + String(this.#productElementLoadingIndex) + '/' + this.#totalProductElements;
                    this.mainLoader.querySelector('.fpd-loader-text').innerHTML = txt;

                }
                
            },
            'elementAdd': ({element}) => {
                
                if(!element) {
                    this.toggleSpinner(false);
                    return;
                }
                else {
                    
                    if(this.productCreated && element.getType() == 'image' && element.isCustom) {

                        this.toggleSpinner(false);
                        Snackbar(this.translator.getTranslation('misc', 'image_added'));
                    }

                }
    
                //check if element has a color linking group
                if(element.colorLinkGroup && element.colorLinkGroup.length > 0 && !this.mainOptions.editorMode) {
                                        
                    var viewIndex = this.getViewIndexByWrapper(viewInstance.fabricCanvas.wrapperEl);
        
                    if(this.colorLinkGroups.hasOwnProperty(element.colorLinkGroup)) { //check if color link object exists for the link group
        
                        //add new element with id and view index of it
                        this.colorLinkGroups[element.colorLinkGroup].elements.push({id: element.id, viewIndex: viewIndex});
        
                        if(typeof element.colors === 'object') {
        
                            //create color group colors
                            const colorGroupColors = this.mainOptions.replaceColorsInColorGroup ? element.colors : this.colorLinkGroups[element.colorLinkGroup].colors.concat(element.colors);                            
                            this.colorLinkGroups[element.colorLinkGroup].colors = arrayUnique(colorGroupColors);
        
                        }
        
                    }
                    else {
        
                        //create initial color link object
                        this.colorLinkGroups[element.colorLinkGroup] = {elements: [{id:element.id, viewIndex: viewIndex}], colors: []};
        
                        if(typeof element.colors === 'object') {
        
                            this.colorLinkGroups[element.colorLinkGroup].colors = element.colors;
        
                        }
        
                    }
        
                }
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
                
                this.dispatchEvent(
                    new CustomEvent('viewCanvasUpdate', {
                        detail: {
                            viewInstance: viewInstance
                        }
                    })
                );
                
            },
            'elementRemove': ({element}) => {

                /**
                 * Gets fired as soon as an element has been removed.
                 *
                 * @event FancyProductDesigner#elementRemove
                 * @param {Event} event
                 * @param {fabric.Object} element - The fabric object that has been removed.
                 */
                this.dispatchEvent(
                    new CustomEvent('elementRemove', {
                        detail: {
                            element: element
                        }
                    })
                );

                this.dispatchEvent(
                    new CustomEvent('viewCanvasUpdate', {
                        detail: {
                            viewInstance: viewInstance
                        }
                    })
                );
                

            },
            'elementSelect': ({element}) => {
                
                this.currentElement = element;
                this.#updateElementTooltip();
                
                if(element && !element._ignore && this.currentViewInstance) {

                    //upload zone is selected
                    if(element.uploadZone && !this.mainOptions.editorMode) {
                        
                        let customAdds = deepMerge(
                            this.currentViewInstance.options.customAdds,
                            element.customAdds || {}
                        );

                        //mobile fix: elementSelect is triggered before click, this was adding an image on mobile
                        setTimeout(() => {
                            this.currentViewInstance.currentUploadZone = element.title;
                            this.mainBar.toggleUploadZonePanel(true, customAdds);
                        }, 100);

                        return;
                    }
                    //if element has no upload zone and an upload zone is selected, close dialogs and call first module
                    else if(this.currentViewInstance.currentUploadZone) {

                        this.mainBar.toggleUploadZonePanel(false);

                    }

                    //TODO:
                    //instance.toolbar.update(element);

                    // if(instance.mainOptions.openTextInputOnSelect && FPDUtil.getType(element.type) === 'text' && element.editable) {
                    //     $elementToolbar.find('.fpd-tool-edit-text:first').click();
                    // }

                }
                else {
                    //TODO:
                    // instance.toolbar.toggle(false);

                }

                /**
                 * Gets fired when an element is selected.
                 *
                 * @event FancyProductDesigner#elementSelect
                 * @param {Event} event
                 */
                this.dispatchEvent(
                    new CustomEvent('elementSelect')
                );

            },
            'elementCheckContainemt': ({target, boundingBoxMode}) => {

                if(boundingBoxMode === 'inside') {
        
                    this.#updateElementTooltip();
        
                }

            },
            'elementColorChange': ({target, colorLinking}) => {
                
                if(this.productCreated && colorLinking && target.colorLinkGroup && target.colorLinkGroup.length > 0) {
        
                    const group = this.colorLinkGroups[target.colorLinkGroup];

                    if(group && group.elements) {

                        group.elements.forEach((groupElem) => {
                            
                            if(target.id, groupElem.id) {

                                const targetView = this.viewInstances[groupElem.viewIndex];
                                const element = targetView.fabricCanvas.getElementByID(groupElem.id);
                                
                                element.changeColor(target.fill, false);

                            }

                        })

                    }
        
                }

                /**
                 * Gets fired when the color of an element is changed.
                 *
                 * @event FancyProductDesigner#elementColorChange
                 * @param {Event} event
                 * @param {fabric.Object} element
                 * @param {String} hex Hexadecimal color string.
                 * @param {Boolean} colorLinking Color of element is linked to other colors.
                 */
                new CustomEvent('elementColorChange', {
                    detail: {
                        target: target,
                        colorLinking: colorLinking
                    }
                });

                this.dispatchEvent(
                    new CustomEvent('viewCanvasUpdate', {
                        detail: {
                            viewInstance: viewInstance
                        }
                    })
                );                
            
            },
            'elementChange': ({element, type}) => {
                
                this.dispatchEvent(
                    new CustomEvent('elementChange', {
                        detail: {
                            type: type,
                            element: element
                        }
                    })
                )

            }
        })

        
    //     
    //     $(viewInstance)
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
    //     .on('elementModify', function(evt, element, parameters) {
    // 
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
            
            //select element with autoSelect enabled
            if(!this.mainOptions.editorMode 
                && this.currentViewInstance 
                && this.currentViewInstance.fabricCanvas.wrapperEl.offsetParent //canvas is visible
            ) {

                let selectElement = null;
                const viewElements = this.currentViewInstance.fabricCanvas.getObjects();
                viewElements.forEach((obj) => {
                    
                    if(obj.autoSelect && !obj.hasUploadZone) {
                        selectElement = obj;
                    }

                })

                if(selectElement) {

                    setTimeout(() => {
        
                        this.currentViewInstance.fabricCanvas.setActiveObject(selectElement);
        
                    }, 500);
    
                }

            }
    
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
    
    }
    
    #viewStageAdded(viewInstance) {
        
        this.viewInstances.push(viewInstance);
        
        viewInstance.fabricCanvas.on(
            'sizeUpdate',
            ({canvasHeight}) => {
                
                let mainHeight = canvasHeight+'px';
                
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
        
        viewInstance.fabricCanvas.onHistory();
        viewInstance.fabricCanvas.clearHistory();
        
    }

    #updateElementTooltip() {

		const element = this.currentElement;
        
		if(this.productCreated && element && !element.uploadZone && !element.__editorMode) {

            if(element.isOut && element.boundingBoxMode === 'inside') {

                const label = this.translator.getTranslation('misc', 'out_of_bounding_box');
                this.mainTooltip.innerHTML = label;
                this.mainTooltip.classList.add('fpd-show');

			}
			else if(this.mainOptions.imageSizeTooltip && element.getType() === 'image') {
				//instance.$elementTooltip.text(parseInt(element.width * element.scaleX) +' x '+ parseInt(element.height * element.scaleY)).show();
                this.mainTooltip.classList.add('fpd-show');
			}
			else {
                this.mainTooltip.classList.remove('fpd-show');
			}

            if(this.mainTooltip.classList.contains('fpd-show')) {
                
                const oCoords = element.oCoords;
                const viewStageRect = this.currentViewInstance.fabricCanvas.wrapperEl.getBoundingClientRect();                
                
                this.mainTooltip.style.left = (viewStageRect.left + oCoords.mt.x - this.mainTooltip.clientWidth / 2)+'px';
                this.mainTooltip.style.top = (viewStageRect.top + oCoords.mt.y - this.mainTooltip.clientHeight - 20)+'px';

            }

		}
        else {
            this.mainTooltip.classList.remove('fpd-show');
        }

	}

    /**
	 * Gets the index of the view.
	 *
	 * @method getIndex
	 * @return {Number} The index.
	 */
	getViewIndexByWrapper(wrapperEl) {

        return Array.from(this.productStage.querySelectorAll('.fpd-view-stage')).indexOf(wrapperEl);

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
        
        //TODO:
        //instance.$mainWrapper.children('.fpd-ruler').remove();
        
        if(this.currentViewInstance) {
            
            if(this.currentViewInstance.fabricCanvas) {
                this.currentViewInstance.fabricCanvas.clearHistory();
            }
        
        //TODO:
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
                
        
        //TODO:
        //toggle view locker
        // instance.$mainWrapper.children('.fpd-modal-lock')
        // .removeClass('fpd-animated')
        // .toggleClass('fpd-active', instance.currentViewInstance.options.optionalView)
        // .toggleClass('fpd-unlocked', !instance.currentViewInstance.locked);
        // setTimeout(function() {
        //     instance.$mainWrapper.children('.fpd-modal-lock').addClass('fpd-animated');
        // }, 1);
        
        //reset view canvas size
        this.currentViewInstance.fabricCanvas.resetSize();
        
        
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
    
        //remove ignore objects
        allElements = allElements.filter((obj) => {
            return !obj._ignore;
        });
    
        if(elementType === 'text') {
    
            let textElements = [];
            allElements.forEach((elem) => {
    
                if(elem.getType(elem) === 'text') {
                    textElements.push(elem);
                }
    
            });
    
            return textElements;
    
        }
        else if(elementType === 'image') {
    
            let imageElements = [];
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
        
        const elements = this.getElements(viewIndex, type, deselectElement);
        elements.forEach((element) => {
    
            if(element.isCustom) {
                
                const viewIndex = this.getViewIndexByWrapper(element.canvas.wrapperEl);
                
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
    
                const viewIndex = this.getViewIndexByWrapper(element.canvas.wrapperEl);
                
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
    
        if(this.currentViews === null) return;
        
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
            this.currentElement = null;
        
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

    /**
	 * Adds a new custom image to the product stage. This method should be used if you are using an own image uploader for the product designer. The customImageParameters option will be applied on the images that are added via this method.
	 *
	 * @method addCustomImage
	 * @param {string} source The URL of the image.
	 * @param {string} title The title for the design.
	 * @param {Object} options Additional options.
	 * @param {number} [viewIndex] The index of the view where the element needs to be added to. If no index is set, it will be added to current showing view.
	 */
	addCustomImage(source, title, options={}, viewIndex) {

		viewIndex = viewIndex === undefined ? this.currentViewIndex : viewIndex;

		const image = new Image;
		image.crossOrigin = "anonymous";
    	image.src = source;

    	this.toggleSpinner(true, this.translator.getTranslation('misc', 'loading_image'));
        addElemClasses(
            this.viewsWrapper.container,
            ['fpd-disabled']
        );

		image.onload = () => {

			this.loadingCustomImage = false;

			let imageH = image.height,
				imageW = image.width,
				currentCustomImageParameters = this.currentViewInstance.options.customImageParameters;
                
			if(!checkImageDimensions(this, imageW, imageH)) {
				this.toggleSpinner(false);
    			return false;
			}

			let fixedParams = {
				isCustom: true,
			};

			//enable color wheel for svg and when no colors are set
			if(image.src.includes('.svg') && !currentCustomImageParameters.colors) {
				fixedParams.colors = true;
			}

            let imageParams = deepMerge(currentCustomImageParameters, fixedParams);
            imageParams = deepMerge(imageParams, options);

            this.viewInstances[viewIndex].fabricCanvas.addElement(
    			'image',
    			source,
    			title,
	    		imageParams,
	    		viewIndex
    		);
            
            removeElemClasses(
                this.viewsWrapper.container,
                ['fpd-disabled']
            );

		}

		image.onerror = () => {
            Snackbar('Image could not be loaded!');
        }

	}
    
    _addGridItemToCanvas(item, additionalOpts={}, viewIndex) {
        
        if(!this.currentViewInstance) { return; }
        viewIndex = viewIndex === undefined ? this.currentViewIndex : viewIndex;
    
        const options = deepMerge(
            {_addToUZ: this.currentViewInstance.currentUploadZone},
            additionalOpts
        );
        
        this._addCanvasImage(
            item.dataset.source,
            item.dataset.title,
            options,
            viewIndex
        );
    }
    
    _addCanvasImage(source, title, options={}, viewIndex) {
        
        if(!this.currentViewInstance) return;
        viewIndex = viewIndex === undefined ? this.currentViewIndex : viewIndex;
        
        let isRemoteImage = !source.includes(window.location.origin);
        
        //download remote image to local server (FB, Insta, Pixabay)
        if(this.uploadsToServer && isRemoteImage) {
    
            this._downloadRemoteImage(
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

    _downloadRemoteImage(source, title, options={}) {

		this.loadingCustomImage = true;
		this.toggleSpinner(true,  this.translator.getTranslation('misc', 'loading_image'));
        addElemClasses(
            this.viewsWrapper.container,
            ['fpd-disabled']
        );

        const formData = new FormData();
        formData.append('uploadsDir', this.uploadsDir);
        formData.append('uploadsDirURL', this.uploadsDirURL);
        formData.append('saveOnServer', this.uploadsToServer);
        formData.append('url', source);

        postJSON({
            url: this.uploadsURL,
            body: formData,
            onSuccess: (data) => {
                
                if(data && data.image_src) {
                    
                    this.addCustomImage(
                        data.image_src,
                        data.filename ? data.filename : title,
                        options
                    );
    
                }
                else {
    
                    this.toggleSpinner(false);
                    Snackbar(data.error);
    
                }

                
            },
            onError: (error) => {
                
                this.loadingCustomImage = false;
                this.toggleSpinner(false);
                Snackbar(data.error);
                
            }
        })
        
        if(this.productCreated && this.mainOptions.hideDialogOnAdd && this.mainBar)
			this.mainBar.toggleContentDisplay(false);


	}
    
    addCanvasDesign(source, title, params={}, viewIndex) {
        
        if(!this.currentViewInstance) { return; }
    
        this.toggleSpinner(true, this.translator.getTranslation('misc', 'loading_image'));
        
        params = deepMerge(this.currentViewInstance.options.customImageParameters, params);
        
        params.isCustom = true;
        if(this.currentViewInstance.currentUploadZone) {
            params._addToUZ = this.currentViewInstance.currentUploadZone;
        }
    
        this.currentViewInstance.fabricCanvas.addElement(
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
window.FPDEmojisRegex = /(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F/g;
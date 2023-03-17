import DesignsView from '../../view/modules/Designs';

import { deepMerge, addEvents } from '../../../utils.js';

export default class DesignsModule extends EventTarget {
    
    #searchInLabel = '';
    #categoriesUsed = false;
    #categoryLevelIndexes = [];
    #currentCategories = null;
    
    constructor(fpdInstance, wrapper, dynamicDesignId=null) {
        
        super();
        
        this.#searchInLabel = fpdInstance.translatorInstance.getTranslation('modules', 'designs_search_in').toUpperCase();        
        this.fpdInstance = fpdInstance;
        
        this.container = document.createElement("fpd-module-designs");
        wrapper.append(this.container);
        
        if(dynamicDesignId) {
            this.container.dataset.dynamicDesignsId = dynamicDesignId;            
        }
        
        this.headElem = this.container.querySelector('.fpd-head');
        this.gridElem = this.container.querySelector('.fpd-grid');
        
        this.headElem.querySelector('.fpd-input-search input')
        .addEventListener('keyup', (evt) => {
            
            const inputElem = evt.currentTarget;
            const gridItems = this.gridElem.querySelectorAll('.fpd-item');
            
            if(inputElem.value == '') { //no input, display all
                
                for (let item of gridItems) {
                    item.classList.remove('fpd-hidden');
                }
                
            }
            else {
        
                const searchQuery = inputElem.value.toLowerCase().trim();
                
                for (let item of gridItems) {
                    
                    item.classList.add('fpd-hidden');
                    
                    if(item.dataset.search.includes(searchQuery)) {
                        item.classList.remove('fpd-hidden');
                    }
                }
                
            }
        
        });
        
        this.headElem.querySelector('.fpd-back')
        .addEventListener('click', (evt) => {
        
            if(this.gridElem.querySelectorAll('.fpd-category').length > 0) {
                this.#categoryLevelIndexes.pop(); //remove last level index
            }
        
            //loop through design categories to receive parent category
            let displayCategories = this.fpdInstance.designs,
                parentCategory;
        
            this.#categoryLevelIndexes.forEach((levelIndex) => {
        
                parentCategory = displayCategories[levelIndex];
                displayCategories = parentCategory.category;
        
            });
        
            this.#currentCategories = displayCategories;
        
            if(displayCategories) { //display first level categories
                this.#displayCategories(this.#currentCategories, parentCategory);
            }
        
            //only toggle categories for top level
            if(parentCategory === undefined) {
                this.toggleCategories();
            }
        
        });
        
        //when adding a product after products are set with productsSetup()
        fpdInstance.addEventListener('designsSet', (evt) => {
            
            const designs = fpdInstance.designs;
            
            if(!Array.isArray(designs) || designs.length === 0) {
                return;
            }
        
            if(designs[0].hasOwnProperty('source')) { //check if first object is a design image
        
                this.container.classList.add('fpd-single-cat');
                this.#displayDesigns(designs);
        
            }
            else {
        
                if(designs.length > 1 || designs[0].category) { //display categories
                    this.#categoriesUsed = true;
                    this.toggleCategories();
                }
                else if(designs.length === 1 && designs[0].designs) { //display designs in category, if only one category exists
                    this.container.classList.add('fpd-single-cat');
                    this.#displayDesigns(designs[0].designs);
                }
        
        
            }
        
        })
        // .on('viewSelect', function() {
        //     instance.toggleCategories();
        // })

        
    }
    
    #displayCategories(categories, parentCategory) {
            
        this.gridElem.innerHTML = '';
        this.headElem.querySelector('.fpd-input-search input').value = '';
        this.container.classList.remove('fpd-designs-active');
        this.container.classList.add('fpd-categories-active');
    
        categories.forEach((category, i) => {
            this.#addDesignCategory(category);
        });
    
        //set category title
        if(parentCategory) {
            
            this.headElem.querySelector('.fpd-input-search input')
            .setAttribute('placeholder', this.#searchInLabel + ' ' + parentCategory.title.toUpperCase());            
            this.container.classList.add('fpd-head-visible');
            
        }
    
    };
    
    #addDesignCategory(category) {
                            
        const gridItem = document.createElement('div');
        gridItem.className = 'fpd-category fpd-item';
        gridItem.dataset.search = category.title.toLowerCase();
        
        if(category.thumbnail) {
            const picElem = document.createElement('picture');
            picElem.dataset.img = category.thumbnail;
            gridItem.append(picElem);
            this.fpdInstance.lazyBackgroundObserver.observe(picElem);
        }
        else {
            gridItem.innerHTML = '<span>'+category.title+'</span>';
        }
        
        gridItem.addEventListener('click', (evt) => {
            
            let targetItem = evt.currentTarget,
                index = Array.from(this.gridElem.querySelectorAll('.fpd-item')).indexOf(targetItem),
                selectedCategory = this.#currentCategories[index];
                
            
            if(selectedCategory.category) {
            
                this.#categoryLevelIndexes.push(index);
                this.#currentCategories = selectedCategory.category;
                this.#displayCategories(this.#currentCategories, selectedCategory);
            
            }
            else {
                this.#displayDesigns(selectedCategory.designs, selectedCategory.parameters);
            }
            
            this.headElem.querySelector('.fpd-input-search input')
            .setAttribute('placeholder', this.#searchInLabel + ' ' +targetItem.dataset.search.toUpperCase());
            
        })
        
        this.gridElem.append(gridItem);
    
    };
    
    #displayDesigns(designObjects, categoryParameters={}) {
        
        this.gridElem.innerHTML = '';
        this.headElem.querySelector('.fpd-input-search input').value = '';
        this.container.classList.remove('fpd-categories-active')
        this.container.classList.add('fpd-designs-active', 'fpd-head-visible');
        
        designObjects.forEach((designObject) => {
            
            designObject.parameters = deepMerge(categoryParameters, designObject.parameters);
            this.#addGridDesign(designObject);
    
        });
    
    };
    
    //adds a new design to the designs grid
    #addGridDesign(design) {
    
        design.thumbnail = design.thumbnail === undefined ? design.source : design.thumbnail;
        
        const gridItem = document.createElement('div');
        gridItem.className = 'fpd-item';
        gridItem.dataset.title = design.title;
        gridItem.dataset.source = design.source;
        gridItem.dataset.search = design.title.toLowerCase();
        gridItem.dataset.thumbnail = design.thumbnail;
        gridItem.parameters = design.parameters;
        gridItem.innerHTML = '<picture data-img="'+design.thumbnail+'"></picture><span class="fpd-price"></span>';
                
        this.gridElem.append(gridItem);
        
        gridItem.addEventListener('click', (evt) => {
            
            const item = evt.currentTarget;
            
            this.fpdInstance._addCanvasDesign(
                item.dataset.source,
                item.dataset.title,
                item.dataset.parameters
            );
            
        })
        
        this.fpdInstance.lazyBackgroundObserver.observe(gridItem.querySelector('picture'));
        
        //todo
        //FPDUtil.setItemPrice($lastItem, fpdInstance);
  
    };
    
    toggleCategories() {
    
        if(!this.#categoriesUsed) {
            return;
        }
    
        this.#categoryLevelIndexes = [];
    
        //reset to default view(head hidden, top-level cats are displaying)
        this.container.classList.remove('fpd-head-visible', 'fpd-single-cat');
    
        this.#currentCategories = this.fpdInstance.designs;
        this.#displayCategories(this.#currentCategories);
    
        let catTitles = []; //stores category titles that are only visible for UZ or view
    
        if(this.fpdInstance.currentViewInstance) {
    
            var element = this.fpdInstance.currentViewInstance.currentElement;
    
            //element (upload zone) has design categories
            if(element && element.uploadZone && element.designCategories) {
                catTitles = this.fpdInstance.currentViewInstance.currentElement.designCategories;
            }
            //display ror dynamic designs
            else if(dynamicDesignId) {
                catTitles = this.fpdInstance.mainOptions.dynamicDesigns[dynamicDesignId].categories;
            }
            //all
            else {
                catTitles = this.fpdInstance.currentViewInstance.options.designCategories;
            }
    
        }
    
        //check for particular design categories
        var allCatElems = this.container.querySelectorAll('.fpd-category');
        if(catTitles.length > 0) {
    
            var $visibleCats = $allCats.hide().filter(function() {
                var title = $(this).children('span').text();
                return $.inArray(title, catTitles) > -1;
            }).show($visibleCats);
    
            if($visibleCats.length === 1) {
                $module.toggleClass('fpd-single-cat');
                $visibleCats.first().click();
                $module.find('.fpd-category').filter(function() { return $(this).css("display") == "block" }).click();
            }
    
        }
        else {
            //$allCats.show();
        }
    
    };


}
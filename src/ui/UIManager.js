import './view/comps/Dropdown.js';
import './view/comps/RangeSlider.js';
import './view/comps/ActionsMenu.js';
import MainLoaderHTML from './html/main-loader.html';
import Mainbar from './controller/Mainbar.js';
import MainWrapper from './controller/MainWrapper.js';
import ActionsBar from './controller/ActionsBar.js';
import ViewsNav from './controller/ViewsNav.js';
import ViewsGrid from './controller/ViewsGrid.js';
import ElementToolbar from './controller/ElementToolbar.js';
import GuidedTour from './controller/addons/GuidedTour.js';
import BulkVariations from './controller/addons/BulkVariations.js';
import ColorSelection from './controller/addons/ColorSelection.js';
import ViewThumbnails from './controller/addons/ViewThumbnails.js';

import { 
    addEvents,
    toggleElemClasses,
    addElemClasses,
    removeElemClasses
} from '../helpers/utils.js';
import AdvancedImageEditor from './controller/AdvancedImageEditor.js';

export default class UIManager extends EventTarget {
    
    #currentWindowWidth = 0;
    currentLayout = '';
    
    constructor(fpdInstance) {
        
        super();
        
        this.fpdInstance = fpdInstance;
                        
    }
    
    init() {

        //add product designer into modal
		if(this.fpdInstance.mainOptions.modalMode) {

            this.fpdInstance.mainOptions.maxCanvasHeight = 0.75;
            this.fpdInstance.mainOptions.canvasHeight = 'auto';
            this.fpdInstance.mainOptions.fabricCanvasOptions.allowTouchScrolling = false;

            let modalProductDesignerOnceOpened = false;

            addElemClasses(
                document.body,
                ['fpd-modal-mode-active']
            )

            removeElemClasses(
                this.fpdInstance.container,
                ['fpd-off-canvas', 'fpd-topbar']
            )

            addElemClasses(
                this.fpdInstance.container,
                ['fpd-sidebar']
            )

            const modalWrapper = document.createElement('div');
            modalWrapper.className = 'fpd-modal-product-designer fpd-modal-overlay fpd-fullscreen';
            document.body.append(modalWrapper);
            this.fpdInstance.modalWrapper = modalWrapper;

            const modalInner = document.createElement('div');
            modalInner.className = 'fpd-modal-inner';
            modalInner.append(this.fpdInstance.container);
            modalWrapper.append(modalInner);

            //get modal opener
            const modalOpener = document.querySelector(this.fpdInstance.mainOptions.modalMode);
            addEvents(
                modalOpener,
                'click',
                (evt) => {

                    evt.preventDefault();

                    addElemClasses(
                        document.body,
                        ['fpd-overflow-hidden', 'fpd-modal-designer-visible']
                    )

                    addElemClasses(
                        modalWrapper,
                        ['fpd-show']
                    )
                    
                    this.fpdInstance.selectView(0);

                    if(this.fpdInstance.currentViewInstance) {

                        this.fpdInstance.currentViewInstance.fabricCanvas.resetZoom();

                        if(!modalProductDesignerOnceOpened) {
                            this.fpdInstance.doAutoSelect();
                        }

                    }

                    modalProductDesignerOnceOpened = true;

                    /**
                     * Gets fired when the modal with the product designer opens.
                     *
                     * @event FancyProductDesigner#modalDesignerOpen
                     * @param {Event} event
                     */
                    this.fpdInstance.dispatchEvent(
                        new CustomEvent('modalDesignerOpen')
                    );

                    window.dispatchEvent(
                        new CustomEvent('fpdModalDesignerOpen')
                    );

                }
            )

            addEvents(
                this.fpdInstance,
                'modalDesignerClose',
                () => {

                    removeElemClasses(
                        document.body,
                        ['fpd-overflow-hidden', 'fpd-modal-designer-visible']
                    )
                    
                }
            )

            addEvents(
                this.fpdInstance,
                'priceChange',
                () => {

                    modalWrapper.querySelector('fpd-actions-bar .fpd-total-price')
                    .innerHTML = this.fpdInstance.formatPrice(this.fpdInstance.currentPrice); 
                    
                }
            )

		}
        
        this.fpdInstance.container.classList.add('fpd-container');
        this.fpdInstance.container.classList.add('fpd-wrapper');
        
        const loader = document.createElement('div');
        loader.innerHTML = MainLoaderHTML;
        
        this.fpdInstance.container.appendChild(loader.firstChild.cloneNode(true));
        this.fpdInstance.mainLoader = this.fpdInstance.container.querySelector('.fpd-loader-wrapper');
        
        this.fpdInstance.actionsBar = new ActionsBar(this.fpdInstance);
        this.fpdInstance.mainBar = new Mainbar(this.fpdInstance);
        
        this.fpdInstance.mainWrapper = new MainWrapper(this.fpdInstance);
        this.fpdInstance.productStage = this.fpdInstance.mainWrapper.container.querySelector('.fpd-product-stage');
        this.fpdInstance.viewsNav = new ViewsNav(this.fpdInstance);
        this.fpdInstance.viewsGrid = new ViewsGrid(this.fpdInstance);
        this.fpdInstance.advancedImageEditor = new AdvancedImageEditor(this.fpdInstance);

        //addons
        this.fpdInstance.bulkVariations = new BulkVariations(this.fpdInstance);
        this.fpdInstance.colorSelection = new ColorSelection(this.fpdInstance);

        //view thumbnails
        this.fpdInstance.viewThumbnails = new ViewThumbnails(this.fpdInstance);

        //guided tour
        this.fpdInstance.guidedTour = new GuidedTour(this.fpdInstance);
        
        this.fpdInstance.translator.translateArea(this.fpdInstance.container);

        this.dispatchEvent(
            new CustomEvent('ready')
        );
        
        window.addEventListener("resize", this.#updateResponsive.bind(this));
        
        this.#updateResponsive();
        this.#hoverThumbnail();
        this.#setMainTooltip();
        
    }
    
    #updateResponsive() {
        
        const breakpoints = this.fpdInstance.mainOptions.responsiveBreakpoints;
        
        this.#currentWindowWidth = window.innerWidth;
        
        let currentLayout;
        if(this.#currentWindowWidth < breakpoints.small) {
            this.fpdInstance.container.classList.remove('fpd-layout-medium');
            this.fpdInstance.container.classList.remove('fpd-layout-large');
            this.fpdInstance.container.classList.add('fpd-layout-small');
            currentLayout = 'small';
        }
        else if(this.#currentWindowWidth < breakpoints.medium) {
            this.fpdInstance.container.classList.remove('fpd-layout-small');
            this.fpdInstance.container.classList.remove('fpd-layout-large');
            this.fpdInstance.container.classList.add('fpd-layout-medium');
            currentLayout = 'medium';
        }
        else {
            this.fpdInstance.container.classList.remove('fpd-layout-medium');
            this.fpdInstance.container.classList.remove('fpd-layout-small');
            this.fpdInstance.container.classList.add('fpd-layout-large');
            currentLayout = 'large';
        }

        this.fpdInstance.container.dataset.layout = currentLayout;

        if(currentLayout != this.currentLayout) {

            this.currentLayout = currentLayout;
            
            this.updateToolbarWrapper();

            /**
             * Gets fired when the UI layout changes.
             *
             * @event uiLayoutChange
             * @param {CustomEvent} event
             * @param {Array} event.detail.layout - The current layout: small, medium or large.
             */
            this.fpdInstance.dispatchEvent(
                new CustomEvent('uiLayoutChange', {
                    detail: {
                        layout: currentLayout,
                    }
                })
            );
            
        }
        
    }

    updateToolbarWrapper() {

        const presentToolbar = document.querySelector('fpd-element-toolbar');
        if(presentToolbar)
            presentToolbar.remove()

        this.fpdInstance.toolbar = new ElementToolbar(this.fpdInstance);
        this.fpdInstance.translator.translateArea(this.fpdInstance.toolbar.container)
        
    }

    #hoverThumbnail() {

        const context = document.body;

        let thumbnailPreview;
        thumbnailPreview = document.createElement('div');
        thumbnailPreview.className = "fpd-thumbnail-preview fpd-shadow-1 fpd-hidden";
        thumbnailPreview.innerHTML = '<picture></picture>';

        const titleElem = document.createElement('div');
        titleElem.className = "fpd-preview-title";
        thumbnailPreview.append(titleElem);

        context.append(thumbnailPreview);

        addEvents(
            context,
            ['mouseover', 'mouseout', 'mousemove', 'click'],
            (evt) => {

                if(this.fpdInstance.draggedPlaceholder) {
                    thumbnailPreview.classList.add('fpd-hidden');
                    return;
                };

                const target = evt.target;
                            
                if(target.classList.contains('fpd-hover-thumbnail') 
                    && thumbnailPreview.classList.contains('fpd-hidden')
                    && evt.type === 'mouseover' 
                    && target.dataset.source
                ) {
                    
                    if(thumbnailPreview.querySelector('.fpd-price'))
                        thumbnailPreview.querySelector('.fpd-price').remove();

                    if(thumbnailPreview.querySelector('.fpd-image-quality-ratings'))
                        thumbnailPreview.querySelector('.fpd-image-quality-ratings').remove();

                    thumbnailPreview.querySelector('picture').style.backgroundImage = `url("${target.dataset.source}")`

                    if(target.dataset.title) {
                        titleElem.innerText = target.dataset.title;
                    }
                    toggleElemClasses(
                        titleElem,
                        ['fpd-hidden'],
                        !target.dataset.title
                    )

                    toggleElemClasses(
                        thumbnailPreview,
                        ['fpd-title-enabled'],
                        target.dataset.title
                    )
                    
                    const targetPrice = target.querySelector('.fpd-price');                    
                    if(targetPrice) {
                        thumbnailPreview.append(targetPrice.cloneNode(true));
                    }

                    const targetRatings = target.querySelector('.fpd-image-quality-ratings');                                        
                    if(targetRatings) {

                        const clonedRatings = targetRatings.cloneNode(true);
                        const ratingLabel = document.createElement('span');
                        ratingLabel.className = "fpd-image-quality-rating-label";
                        ratingLabel.innerText = targetRatings.dataset.qualityLabel;
                        clonedRatings.prepend(ratingLabel);
                        thumbnailPreview.append(clonedRatings);

                    }

                    thumbnailPreview.classList.remove('fpd-hidden');
                    
                }
                                
                if(!thumbnailPreview.classList.contains('fpd-hidden') 
                    && (evt.type === 'mousemove' || evt.type === 'mouseover')) 
                {
                                        
                    const leftPos = evt.pageX + 10 + thumbnailPreview.offsetWidth > window.innerWidth ? window.innerWidth - thumbnailPreview.offsetWidth : evt.pageX + 10;
                    thumbnailPreview.style.left = leftPos+'px';
                    thumbnailPreview.style.top = (evt.pageY + 10)+'px';

                }
                else if(evt.type === 'mouseout' || evt.type == 'click') {
                                            
                    thumbnailPreview.classList.add('fpd-hidden');

                }

            }
        )

    }
    
    #setMainTooltip() {
        
        const tooltipContext = document.body;
        
        const mainTooltip = document.createElement('div');
        mainTooltip.className = 'fpd-main-tooltip';
        tooltipContext.append(mainTooltip);
        this.fpdInstance.mainTooltip = mainTooltip;
        
        tooltipContext.addEventListener('mouseover', (evt) => {
            
            const currentElem = evt.target;
            
            if(currentElem.classList.contains('fpd-tooltip')) {
                
                let txt = currentElem.getAttribute('aria-label');
                if(txt === null)
                    txt = currentElem.getAttribute('title');

                    mainTooltip.innerHTML = txt;
                
                const extraOffset = 5;
                const { x, y, width, height } = currentElem.getBoundingClientRect();
                
                let topPos = Math.floor(y - mainTooltip.clientHeight - extraOffset);
                let leftPos = Math.floor(x + width / 2 - mainTooltip.clientWidth / 2);
                
                if(topPos < 0) {
                    topPos = Math.floor(y + height + extraOffset);
                }
                
                if(leftPos < 0) {
                    leftPos = 0;
                }
                else if(leftPos > window.outerWidth - mainTooltip.clientWidth) {
                    leftPos = window.outerWidth - mainTooltip.clientWidth - extraOffset;
                }
                
                mainTooltip.style.left = `${leftPos}px`;
                mainTooltip.style.top = `${topPos}px`;
                mainTooltip.classList.add('fpd-show');
                
            }
            else {
                mainTooltip.classList.remove('fpd-show');
            }
            
        });
        
        tooltipContext.addEventListener('touchstart', (evt) => {
            
                mainTooltip.classList.remove('fpd-show');
            
        });
        
    }
    
}
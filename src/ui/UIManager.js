import Dropdown from './view/comps/Dropdown';
import MainLoaderHTML from './html/main-loader.html';
import Mainbar from './controller/Mainbar.js';
import MainWrapper from './controller/MainWrapper.js';
import ActionsBar from './controller/ActionsBar.js';
import ViewsWrapper from './controller/ViewsWrapper.js';

import { 
    addEvents,
    toggleElemClasses
} from '/src/helpers/utils';

export default class UIManager extends EventTarget {
    
    #currentWindowWidth = 0;
    
    constructor(fpdInstance) {
        
        super();
        
        this.fpdInstance = fpdInstance;
                        
    }
    
    init() {
        
        this.#updateResponsive();
        this.#hoverThumbnail();
        this.#setMainTooltip();
        
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
        this.fpdInstance.viewsWrapper = new ViewsWrapper(this.fpdInstance);
        
        Array.from(this.fpdInstance.container.querySelectorAll('[data-defaulttext]'))
        .forEach(item => {
            
            this.fpdInstance.translator.translateElement(
                item, 
                this.fpdInstance.mainOptions.langJson
            );
            
        })
        
        this.dispatchEvent(
            new CustomEvent('ready')
        );
        
        window.addEventListener("resize", this.#updateResponsive.bind(this));
        
    }
    
    #updateResponsive() {
        
        const breakpoints = this.fpdInstance.mainOptions.responsiveBreakpoints;
        
        this.#currentWindowWidth = window.innerWidth;
        
        if(this.#currentWindowWidth < breakpoints.small) {
            this.fpdInstance.container.classList.remove('fpd-layout-medium');
            this.fpdInstance.container.classList.remove('fpd-layout-large');
            this.fpdInstance.container.classList.add('fpd-layout-small');
        }
        else if(this.#currentWindowWidth < breakpoints.medium) {
            this.fpdInstance.container.classList.remove('fpd-layout-small');
            this.fpdInstance.container.classList.remove('fpd-layout-large');
            this.fpdInstance.container.classList.add('fpd-layout-medium');
        }
        else {
            this.fpdInstance.container.classList.remove('fpd-layout-medium');
            this.fpdInstance.container.classList.remove('fpd-layout-small');
            this.fpdInstance.container.classList.add('fpd-layout-large');
        }
        
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
                
                const txt = currentElem.getAttribute('aria-label');
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
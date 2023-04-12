import Dropdown from './view/comps/Dropdown';
import MainLoaderHTML from './html/main-loader.html';
import Mainbar from './controller/Mainbar.js';
import MainWrapper from './controller/MainWrapper.js';
import ActionsBar from './controller/ActionsBar.js';
import ViewsWrapper from './controller/ViewsWrapper.js';

export default class UIManager extends EventTarget {
    
    #currentWindowWidth = 0;
    
    constructor(fpdInstance) {
        
        super();
        
        this.fpdInstance = fpdInstance;
                        
    }
    
    init() {
        
        this.#updateResponsive();
        
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
    
}
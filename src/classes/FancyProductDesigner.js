import Options from './Options.js';
import Translator from '../ui/Translator.js';
import UIManager from '../ui/UIManager';

export default class FancyProductDesigner extends EventTarget {
    
    container = null;
    $container = null;
    currentViewInstance = null;
    
    constructor(elem, opts={}) {
        
        super();
                
        this.container = elem;
        this.$container = typeof jQuery === 'undefined' ? null : jQuery(elem);
        
        this.optionsInstance = new Options();
        this.mainOptions = this.optionsInstance.merge(this.optionsInstance.defaults, opts);
        
        this.translator = new Translator()
        this.translator.loadLangJSON(this.mainOptions.langJson, this.#langLoaded.bind(this));
              
    }
    
    #langLoaded() {
        
        this.uiManager = new UIManager(this);
        
        this.uiManager.addEventListener('ready', (event) => {
            this.#uiReady();
        });
        
        this.uiManager.init();
        
    }
    
    #loadFonts() {
        
    }
    
    #uiReady() {
        
        //timeout when no language json file is loaded
        setTimeout(() => {
            
            this.dispatchEvent(
                new CustomEvent('uiSet')
            );
            
        }, 1)
        
        this.#ready();
        console.log("ui ready");
    }
    
    #ready() {
            
        this.dispatchEvent(
            new CustomEvent('ready')
        );
            
        
        console.log("api ready");
    }
    
    deselectElement() {
        
    }
}

window.FancyProductDesigner = FancyProductDesigner;


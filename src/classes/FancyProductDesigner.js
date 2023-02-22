import Options from './Options.js';
import UIManager from '../ui/UIManager';

export default class FancyProductDesigner {
    
    constructor(elem, opts={}) {
                
        this.container = elem;
        
        this.optionsInstance = new Options();
        this.mainOptions = this.optionsInstance.merge(this.optionsInstance.defaults, opts);
        
        this.uiManager = new UIManager(this, {
            onUiReady: this.#uiReady
        });
                
    }
    
    #uiReady() {
        console.log("ui ready");
    }
}

window.FancyProductDesigner = FancyProductDesigner;


import MainbarView from '../view/Mainbar.js';

export default class Mainbar {
    
    availableModules = [
        'products',
        'images',
        'text',
        'designs',
        'manage-layers',
        'text-layers',
        'layouts'
    ];

    constructor(fpdInstance) {
        
        this.mainBarView = document.createElement("fpd-main-bar");
        fpdInstance.container.appendChild(this.mainBarView);
        
        // const test = document.createElement("div");
        // test.innerHTML = '<p>Hello</p>';
        // this.mainBarView.shadowRoot.appendChild(test)
    }
    
    callModule(name, dynamicDesignsId=null) {
        
    }
    
    callSecondary() {
        
    }
    
    setup(modules) {
        
    }

}
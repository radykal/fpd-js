import ProductsModule from './modules/Products';

export default class ModuleWrapper extends EventTarget {
    
    constructor(fpdInstance, wrapper, moduleType) {
        
        super();
        
        let moduleInstance;
        
        if(moduleType === 'products') {
            moduleInstance = new ProductsModule(fpdInstance, wrapper);
        }
        // else if(moduleType === 'text') {
        //     moduleInstance = new FPDTextModule(this.fpdInstance, $moduleClone);
        // }
        // else if(moduleType === 'designs') {
        //     moduleInstance = new FPDDesignsModule(this.fpdInstance, $moduleClone, dynamicDesignId);
        // }
        // else if(moduleType === 'images') {
        //     moduleInstance = new FPDImagesModule(this.fpdInstance, $moduleClone);
        // }
        // else if(moduleType === 'layouts') {
        //     moduleInstance = new FPDLayoutsModule(this.fpdInstance, $moduleClone);
        // }
        // else if(moduleType === 'drawing') {
        //     moduleInstance = new FPDDrawingModule(this.fpdInstance, $moduleClone);
        // }
        // else if(moduleType === 'dynamic-views') {
        //     moduleInstance = new FPDDynamicViews(this.fpdInstance, $moduleClone);
        // }
        
        if(!moduleInstance) { return; }
        
        this.moduleInstance = moduleInstance;
        fpdInstance['moduleInstance_'+module] = moduleInstance;
        
        //store module configs
        const configsElem = moduleInstance.container.querySelector('div');
        this.configs = {
            icon: configsElem.dataset.moduleicon,
            langId: configsElem.dataset.title,
            langKeys: configsElem.dataset.title.split('.'),
            defaultText: configsElem.dataset.defaulttext
        };
        
    }

}
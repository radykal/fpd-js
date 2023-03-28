import ProductsModule from './modules/Products';
import TextModule from './modules/Text';
import DesignsModule from './modules/Designs';
import TextToImageModule from './modules/TextToImage';
import ImagesModule from './modules/Images';

import { isEmpty } from '/src/helpers/utils';

export default class ModuleWrapper extends EventTarget {
    
    constructor(fpdInstance, wrapper, moduleType) {
        
        super();
        
        let moduleInstance;
                
        if(moduleType === 'products') {
            moduleInstance = new ProductsModule(fpdInstance, wrapper);
        }
        else if(moduleType === 'text') {
            moduleInstance = new TextModule(fpdInstance, wrapper);
        }
        else if(moduleType === 'text-to-image') {
            moduleInstance = new TextToImageModule(fpdInstance, wrapper);
        }
        else if(moduleType.includes('designs')) {
            
            let dynamicDesignId = null;
            if(moduleType.includes('designs_')) {
        
                if(!isEmpty(fpdInstance.mainOptions.dynamicDesigns)) {
        
                    dynamicDesignId = moduleType.split('_').pop();
        
                    if(dynamicDesignId && fpdInstance.mainOptions.dynamicDesigns[dynamicDesignId]) {
        
                        var dynamicDesignConfig = fpdInstance.mainOptions.dynamicDesigns[dynamicDesignId];
                        
                        const moduleAttrs = {};
                        moduleAttrs['data-dynamic-designs-id'] = dynamicDesignId;
        
                        if(!isEmpty(dynamicDesignConfig.icon) && dynamicDesignConfig.icon.includes('.svg')) {
                            
                            this.configs = {
                                icon: dynamicDesignConfig.icon,
                                defaultText: dynamicDesignConfig.name,
                                attrs: moduleAttrs
                            };     
                        }
        
                    }
                    else { //dynamic designs module does not exist
                        return;
                    }
                }
        
            }
            
            moduleInstance = new DesignsModule(fpdInstance, wrapper, dynamicDesignId);
        }
        else if(moduleType === 'images') {
            moduleInstance = new ImagesModule(fpdInstance, wrapper);
        }
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
        fpdInstance['moduleInstance_'+moduleType] = moduleInstance;
        
        //store module configs
        if(!moduleType.includes('designs_')) {
            
            const configsElem = moduleInstance.container.querySelector('div');
            this.configs = {
                icon: configsElem.dataset.moduleicon,
                langId: configsElem.dataset.title,
                langKeys: configsElem.dataset.title.split('.'),
                defaultText: configsElem.dataset.defaulttext
            };
            
        }
        
        
    }

}
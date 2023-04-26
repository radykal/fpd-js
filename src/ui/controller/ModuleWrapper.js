import ProductsModule from './modules/Products';
import TextModule from './modules/Text';
import DesignsModule from './modules/Designs';
import TextToImageModule from './modules/TextToImage';
import ImagesModule from './modules/Images';
import LayersModule from './modules/Layers';

import { isEmpty } from '/src/helpers/utils';

export default class ModuleWrapper extends EventTarget {
    
    constructor(fpdInstance, wrapper, moduleKey) {
        
        super();
        
        let moduleInstance;
                
        if(moduleKey === 'products') {
            moduleInstance = new ProductsModule(fpdInstance, wrapper);
        }
        else if(moduleKey === 'text') {
            moduleInstance = new TextModule(fpdInstance, wrapper);
        }
        else if(moduleKey === 'text-to-image') {
            moduleInstance = new TextToImageModule(fpdInstance, wrapper);
        }
        else if(moduleKey.includes('designs')) {
            
            let dynamicDesignId = null;
            if(moduleKey.includes('designs_')) {
        
                if(!isEmpty(fpdInstance.mainOptions.dynamicDesigns)) {
        
                    dynamicDesignId = moduleKey.split('_').pop();
        
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
        else if(moduleKey === 'images') {
            moduleInstance = new ImagesModule(fpdInstance, wrapper);
        }
        else if(moduleKey === 'manage-layers') {
            moduleInstance = new LayersModule(fpdInstance, wrapper);
        }
        // else if(moduleKey === 'layouts') {
        //     moduleInstance = new FPDLayoutsModule(this.fpdInstance, $moduleClone);
        // }
        // else if(moduleKey === 'drawing') {
        //     moduleInstance = new FPDDrawingModule(this.fpdInstance, $moduleClone);
        // }

        //additional custom modules: add your own modules
        if(FancyProductDesigner.additionalModules && !moduleInstance) {

            const ClassModule = FancyProductDesigner.additionalModules[moduleKey];            
            if(ClassModule)
                moduleInstance = new ClassModule(fpdInstance, wrapper);
            
        }        
        
        if(!moduleInstance) { return; }
        
        this.moduleInstance = moduleInstance;
        fpdInstance['moduleInstance_'+moduleKey] = moduleInstance;
        
        //store module configs
        if(!moduleKey.includes('designs_')) {
            
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
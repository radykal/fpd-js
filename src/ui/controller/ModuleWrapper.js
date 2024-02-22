import ProductsModule from './modules/Products.js';
import TextModule from './modules/Text.js';
import DesignsModule from './modules/Designs.js';
import ImagesModule from './modules/Images.js';
import LayersModule from './modules/Layers.js';
import SaveLoadModule from './modules/SaveLoad.js';
import TextLayersModule from './modules/TextLayers.js';
import LayoutsModule from './modules/Layouts.js';
import NamesNumbersModule from './modules/NamesNumbers.js';

import { isEmpty } from '../../helpers/utils.js';

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
        else if(moduleKey.includes('designs')) {
            
            let dynamicDesignId = null;
            if(moduleKey.includes('designs_')) {
        
                if(!isEmpty(fpdInstance.mainOptions.dynamicDesigns)) {
        
                    dynamicDesignId = moduleKey.split('_').pop();
        
                    if(dynamicDesignId && fpdInstance.mainOptions.dynamicDesigns[dynamicDesignId]) {
        
                        var dynamicDesignConfig = fpdInstance.mainOptions.dynamicDesigns[dynamicDesignId];
                        
                        const moduleAttrs = {};
                        moduleAttrs['data-dynamic-designs-id'] = dynamicDesignId;
                        
                        this.configs = {
                            icon: !isEmpty(dynamicDesignConfig.icon) && dynamicDesignConfig.icon.includes('.svg') ? dynamicDesignConfig.icon : 'fpd-icon-design-library',
                            defaultText: dynamicDesignConfig.name,
                            attrs: moduleAttrs
                        };                         
        
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
        else if(moduleKey === 'save-load') {
            moduleInstance = new SaveLoadModule(fpdInstance, wrapper);            
        }
        else if(moduleKey === 'text-layers') {
            moduleInstance = new TextLayersModule(fpdInstance, wrapper);            
        }
        else if(moduleKey === 'layouts') {
            moduleInstance = new LayoutsModule(fpdInstance, wrapper);
        }
        else if(moduleKey === 'names-numbers') {
            moduleInstance = new NamesNumbersModule(fpdInstance, wrapper);
        }
        // else if(moduleKey === 'drawing') {
        //     moduleInstance = new FPDDrawingModule(this.fpdInstance, $moduleClone);
        // }

        //additional custom modules: add your own modules
        //example: FancyProductDesigner.additionalModules = {'module-key': ModuleClass}
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
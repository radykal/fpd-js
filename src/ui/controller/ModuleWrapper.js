import ProductsModule from './modules/Products';
import TextModule from './modules/Text';
import DesignsModule from './modules/Designs';

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
        else if(moduleType === 'designs') {
            
            let dynamicDesignId = null;
            //todo
            //     if(moduleType.includes('designs')) {
            // 
            //         moduleType = 'designs';
            // 
            //         if(!FPDUtil.isEmpty(fpdInstance.mainOptions.dynamicDesigns) && module.includes('designs_')) {
            // 
            //             dynamicDesignId = module.split('_').pop();
            // 
            //             if(dynamicDesignId && fpdInstance.mainOptions.dynamicDesigns[dynamicDesignId]) {
            // 
            //                 var dynamicDesignConfig = fpdInstance.mainOptions.dynamicDesigns[dynamicDesignId];
            // 
            //                 navItemTitle = dynamicDesignConfig.name;
            //                 moduleAttrs['data-dynamic-designs-id'] = dynamicDesignId;
            // 
            //                 if(!FPDUtil.isEmpty(dynamicDesignConfig.icon) && dynamicDesignConfig.icon.indexOf('.svg') != -1) {
            // 
            //                     useFpdIcon = false;
            // 
            //                     $.get(dynamicDesignConfig.icon, function(data) {
            //                         $moduleIcon.append($(data).children('svg'));
            //                     });
            //                 }
            // 
            //             }
            //             else { //dynamic designs module does not exist
            //                 return;
            //             }
            //         }
            // 
            //     }
            
            moduleInstance = new DesignsModule(fpdInstance, wrapper, dynamicDesignId);
        }
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
import ImagesView from '/src/ui/view/modules/Images';
import UploadsModule from './Uploads';
import FacebookImagesModule from './FacebookImages';
import InstagramImagesModule from './InstagramImages';
import PixabayImagesModule from './PixabayImages';

import { 
    addEvents, 
    isEmpty, 
    addElemClasses, 
    removeElemClasses 
} from '/src/helpers/utils';

export default class ImagesModule extends EventTarget {
    
    constructor(fpdInstance, wrapper) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        
        this.container = document.createElement("fpd-module-images");
        wrapper.append(this.container);
        
        const tabs = Array.from(
            this.container.querySelectorAll('.fpd-module-tabs > div')
        );
        const tabContents = Array.from(
            this.container.querySelectorAll('.fpd-module-tabs-content > div')
        );
        
        let instaInstance = null,
            pixabayInstance = null;
                
        //tabs handler
        addEvents(
            tabs,
            'click',
            (evt) => {
                
                const targetTab = evt.currentTarget;
                
                removeElemClasses(
                    tabs,
                    ['fpd-active']
                )
                
                removeElemClasses(
                    tabContents,
                    ['fpd-active']
                )
                
                addElemClasses(
                    targetTab,
                    ['fpd-active']
                )
                
                addElemClasses(
                    tabContents.find( t => t.dataset.context == targetTab.dataset.context ),
                    ['fpd-active']
                )
                
                if(targetTab.dataset.context == 'instagram' && instaInstance && !instaInstance.accessToken) {
                    instaInstance.authenticate();
                }
                else if(targetTab.dataset.context == 'pixabay' && pixabayInstance) {
                    pixabayInstance.loadImages();
                }
                
            }
        );
        
        const mainOptions = fpdInstance.mainOptions;
        
        new UploadsModule(
            fpdInstance,
            tabContents.find( t => t.dataset.context == 'upload' ),
        )
        
        //set price in upload drop zone
        addEvents(
            fpdInstance,
            ['viewSelect', 'secondaryModuleCalled'],
            (evt) => {
                
                if(!fpdInstance.currentViewInstance) { return; }
                
                let currentViewOptions = fpdInstance.currentViewInstance.options,
                    price = null;
                
                //get upload zone price
                if(fpdInstance.currentViewInstance.currentUploadZone) { 
                
                    const uploadZone = fpdInstance.currentViewInstance.getUploadZone(
                                        fpdInstance.currentViewInstance.currentUploadZone
                                    );
                                    
                    if(uploadZone && uploadZone.price) {
                        price = uploadZone.price;
                    }
                
                }
                
                if(price == null 
                    && currentViewOptions.customImageParameters 
                    && currentViewOptions.customImageParameters.price
                ) {
                    price = fpdInstance.formatPrice(
                        currentViewOptions.customImageParameters.price
                    );
                
                }
                
                const priceElem = this.container.querySelector('.fpd-upload-zone .fpd-price');
                if(priceElem)
                    priceElem.innerHTML = price ? price : '';
                
            }
        );
        
        if(!isEmpty(mainOptions.facebookAppId)) {
            
            new FacebookImagesModule(
                fpdInstance,
                tabContents.find( t => t.dataset.context == 'facebook' )
            )
            
            tabs.find( t => t.dataset.context == 'facebook' )
            .classList.remove('fpd-hidden');
            
        }
        
        if(!isEmpty(mainOptions.instagramClientId)) {
            
            instaInstance = new InstagramImagesModule(
                fpdInstance,
                tabContents.find( t => t.dataset.context == 'instagram' )
            )
            
            tabs.find( t => t.dataset.context == 'instagram' )
            .classList.remove('fpd-hidden');
            
        }
        
        if(!isEmpty(mainOptions.pixabayApiKey)) {
            
            pixabayInstance = new PixabayImagesModule(
                fpdInstance,
                tabContents.find( t => t.dataset.context == 'pixabay' )
            )
            
            tabs.find( t => t.dataset.context == 'pixabay' )
            .classList.remove('fpd-hidden');
            
        }
        
        //hide tabs if only one tab is available
        if(tabs.filter( t => !t.classList.contains('fpd-hidden')).length < 2) {
            this.container.classList.add('fpd-hide-tabs');
        }
        
    }

}
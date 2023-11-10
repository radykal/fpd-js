import '../../../ui/view/modules/Images.js';
import UploadsModule from './Uploads';
import FacebookImagesModule from './FacebookImages';
import InstagramImagesModule from './InstagramImages';
import PixabayImagesModule from './PixabayImages';
import QRCodeModule from './QRCode';
import TextToImageModule from './TextToImage';

import { 
    addEvents, 
    isEmpty, 
    addElemClasses, 
    removeElemClasses,
    toggleElemClasses,
    getItemPrice
} from '../../../helpers/utils.js';

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
                                
                const priceStr = getItemPrice(fpdInstance, this.container); 
                const priceElems = this.container.querySelectorAll('.fpd-price');

                if(priceElems) {

                    //hide prices when empty or 0
                    toggleElemClasses(
                        priceElems,
                        ['fpd-hidden'],
                        !Boolean(priceStr)
                    );
    
                    priceElems.forEach(elem => {
                        elem.innerHTML = priceStr;
                    })

                }
                    
                
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
        
        if(!isEmpty(mainOptions.aiService.serverURL) && mainOptions.aiService.text2Img) {
            
             new TextToImageModule(
                fpdInstance,
                tabContents.find( t => t.dataset.context == 'text2Img' )
            )
            
            tabs.find( t => t.dataset.context == 'text2Img' )
            .classList.remove('fpd-hidden');
            
        }

        new QRCodeModule(
            fpdInstance,
            tabContents.find( t => t.dataset.context == 'qr-code' )
        )
        
        //hide tabs if only one tab is available
        if(tabs.filter( t => !t.classList.contains('fpd-hidden')).length < 2) {
            this.container.classList.add('fpd-hide-tabs');
        }
        
    }

}

window.FPDImagesModule = ImagesModule;
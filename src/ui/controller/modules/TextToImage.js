import '../../../ui/view/modules/TextToImage';
import { addEvents, createImgThumbnail, getFilename, getItemPrice, isEmpty, localStorageAvailable } from '../../../helpers/utils';
import { postJSON } from '../../../helpers/request';

export default class TextToImageModule extends EventTarget {
    
    #isLoading = false;
    
    constructor(fpdInstance, wrapper) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        
        this.container = document.createElement("fpd-module-text-to-image");
        wrapper.append(this.container);
        
        this.inputElem = this.container.querySelector('.fpd-head textarea');
        this.gridElem = this.container.querySelector('.fpd-grid');
        
        this.container.querySelector('.fpd-head .fpd-btn')
        .addEventListener('click', (evt) => {
            
            const btnElem = evt.currentTarget;
            
            if(!isEmpty(this.inputElem.value) && !this.#isLoading) {

                this.#isLoading = true;
                btnElem.classList.add('fpd-loading');

                postJSON({
                    url: fpdInstance.mainOptions.aiService.serverURL,
                    body: {
                        service: 'text2Img',
                        prompt: this.inputElem.value,
                    },
                    onSuccess: (data) => {
                            
                        if(data && data.images) {
                            
                            this.#gridImagedLoaded(data.images);

                            data.images.forEach(imgURL => {

                                if(localStorageAvailable()) {

                                    let currentAiImages = window.localStorage.getItem('fpd_ai_images');
    
                                    if(currentAiImages) {
                                        currentAiImages = JSON.parse(currentAiImages);
                                    }
                                    else {
                                        currentAiImages = [];
                                    }
    
                                    currentAiImages.push(imgURL);
    
                                    window.localStorage.setItem('fpd_ai_images', JSON.stringify(currentAiImages))
    
                                }

                            })
                            

                        }
                        else {
        
                            fpdInstance.aiRequestError(data.error);
            
                        }

                        this.#isLoading = false;
                        btnElem.classList.remove('fpd-loading');
        
                        
                    },
                    onError: () => {

                        this.#isLoading = false;
                        btnElem.classList.remove('fpd-loading');
                        fpdInstance.aiRequestError.bind(fpdInstance);

                    }
                })
                
            }
            
        })

        addEvents(fpdInstance, 'productCreate', this.#productCreated.bind(this))

        
    }

    #productCreated() {

        this.gridElem.innerHTML = '';

        //saved ai images from local storage
        //window.localStorage.removeItem('fpd_ai_images');
        let currentAiImages = window.localStorage.getItem('fpd_ai_images');
        if(localStorageAvailable() && currentAiImages) {

            currentAiImages = JSON.parse(currentAiImages);
            this.#gridImagedLoaded(currentAiImages);

        }

    }
    
    #gridImagedLoaded(images=[]) {
        
        images.forEach((imgURL) => {

            const thumbnail = createImgThumbnail({
                url: imgURL,
                title: getFilename(imgURL),
                price: getItemPrice(this.fpdInstance, this.container),
                removable: true
            });
            
            this.gridElem.prepend(thumbnail);
            this.fpdInstance
            .lazyBackgroundObserver.observe(thumbnail.querySelector('picture'));

            addEvents(
                thumbnail,
                ['click'],
                (evt) => {
                    
                    if(!this.fpdInstance.loadingCustomImage) {
                        this.fpdInstance._addGridItemToCanvas(evt.currentTarget);
                    }
                    
                }
            )

            //remove stored image
            addEvents(
                thumbnail.querySelector('.fpd-delete'),
                'click',
                (evt) => {
                                        
                    evt.stopPropagation();
                    evt.preventDefault();
                    
                    const index = Array.from(this.gridElem.children).indexOf(thumbnail);
                    
                    if(!thumbnail.classList.contains('fpd-loading')) {
                        
                        let storageImages = JSON.parse(window.localStorage.getItem('fpd_ai_images'));
        
                        storageImages.splice(index, 1);
                        window.localStorage.setItem('fpd_ai_images', JSON.stringify(storageImages));
                        
                        if(thumbnail.xhr) {
                            thumbnail.xhr.abort();
                        }
                        
                        thumbnail.remove();
                        
                    }
                                        
                }
            );
            
        })
                
    }

}

window.FPDTextToImageModule = TextToImageModule;
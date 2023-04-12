import TextToImageView from '/src/ui/view/modules/TextToImage';

import { isEmpty } from '/src/helpers/utils';

export default class TextToImageModule extends EventTarget {
    
    #apiEndpoint = 'https://radykal.dep/fpd-js/server/php/sd-api.php';
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
                
                let requestBody = {
                    action: 'text2img',
                    prompt: this.inputElem.value,
                    numOfImg: 2
                };
                
                fetch(this.#apiEndpoint, {
                    method: 'POST',
                    redirect: 'follow',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                })
                .then((response) => response.json())
                .then((data) => {
                    
                    
                    data = JSON.parse(data);
                    console.log(data);
                    
                    if(data && data.output) {
                        
                        
                        this.#gridImagedLoaded(data.output);

                    }
                                        
                    this.#isLoading = false;
                    btnElem.classList.remove('fpd-loading');
                    
                })
                .catch(error => {
                    this.#isLoading = false;
                    btnElem.classList.remove('fpd-loading');
                })
                
            }
            
        })

        
    }
    
    #gridImagedLoaded(images=[]) {
        
        images.forEach((img) => {
            
            const gridItem = document.createElement('div');
            gridItem.className = 'fpd-item';
            gridItem.dataset.source = img;
            gridItem.innerHTML = '<picture data-img="'+img+'"></picture><span class="fpd-price"></span>';
                    
            this.gridElem.append(gridItem);
            
            gridItem.addEventListener('click', (evt) => {
                
                const item = evt.currentTarget;
                
                this.fpdInstance._addCanvasDesign(
                    item.dataset.source,
                    item.dataset.title,
                    item.dataset.parameters
                );
                
            })
            
            this.fpdInstance.lazyBackgroundObserver.observe(gridItem.querySelector('picture'));
            
        })
                
    }


}
import PixabayImagesView from '/src/ui/view/modules/PixabayImages';

import { getJSON } from '/src/helpers/request';
import { 
    addEvents, 
    addElemClasses, 
    removeElemClasses, 
    createImgThumbnail 
} from '/src/helpers/utils';

export default class PixabayImagesModule extends EventTarget {
    
    loadingStack = false;
    currentQuery = '';
    pixabayPage = 1;
    
    constructor(fpdInstance, wrapper) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        
        this.container = document.createElement("fpd-module-pixabay-images");
        wrapper.append(this.container);
        
        this.gridElem = this.container.querySelector('.fpd-grid');
        this.loader = this.container.querySelector('.fpd-loader-wrapper');
        const scrollArea = this.container.querySelector('.fpd-scroll-area');

        //infinite scroll and load next stack of instagram images
        scrollArea
        .addEventListener('scroll', (evt) => {
            
            const offset = 100;
            let areaHeight = scrollArea.scrollHeight;
            let currentScroll = scrollArea.clientHeight + scrollArea.scrollTop;
            
            if(currentScroll+offset > areaHeight) {
                
                if(!this.loadingStack) {
                
                    this.pixabayPage++;
                    this.loadImages(undefined, false);
                
                }
                
            }
            
        });
        
        addEvents(
            this.container.querySelector('input'),
            ['keypress'],
            (evt) => {
                
                if(evt.which == 13) {
                
                    this.pixabayPage = 1;
                    this.loadImages(evt.currentTarget.value);
                
                }
                
            }
        )
           
    }
    
    loadImages(query, emptyGrid=true) {
    
        if(this.currentQuery === query) {
            return false;
        }
                
        const mainOptions = this.fpdInstance.mainOptions;
    
        this.loadingStack = true;
        this.currentQuery = query === undefined ? this.currentQuery : query;
    
        var perPage = 40,
            highResParam = mainOptions.pixabayHighResImages ? '&response_group=high_resolution' : '',
            url = 'https://pixabay.com/api/?safesearch=true&key='+mainOptions.pixabayApiKey+'&page='+this.pixabayPage+'&per_page='+perPage+'&min_width='+mainOptions.customImageParameters.minW+'&min_height='+mainOptions.customImageParameters.minH+highResParam+'&q='+encodeURIComponent(this.currentQuery)+'&lang='+mainOptions.pixabayLang;
    
        if(emptyGrid) {
            this.gridElem.innerHTML = '';
        }
        
        removeElemClasses(
            this.loader,
            ['fpd-hidden']
        )
        
        getJSON({
            url: url,
            onSuccess: (data) => {
                
                addElemClasses(
                    this.loader,
                    ['fpd-hidden']
                )
                
                if (data.hits.length > 0) {
                
                    data.hits.forEach((item) => {
                                                
                        const thumbnail = createImgThumbnail({
                                    url: item.imageURL ? item.imageURL : item.webformatURL, 
                                    thumbnailUrl: item.webformatURL, 
                                    title: item.id ? item.id : item.id_hash,
                                    price: this.fpdInstance.formatPrice(this.fpdInstance.currentViewInstance.options.customImageParameters.price)    
                        });
                        
                        addEvents(
                            thumbnail,
                            ['click'],
                            (evt) => {
                                
                                if(!this.fpdInstance.loadingCustomImage) {
                                    this.fpdInstance._addGridItemToCanvas(evt.currentTarget);
                                }
                                
                            }
                        )
                        
                        this.gridElem.append(thumbnail);
                        this.fpdInstance.lazyBackgroundObserver.observe(thumbnail.querySelector('picture'));
                
                    });
                
                }
                
                this.loadingStack = false;
                                
            },
            onError: (evt) => {
                
                addElemClasses(
                    this.loader,
                    ['fpd-hidden']
                )
                
            }
        });
        
        return;
        $.getJSON(url, function(data) {
    
            $pixabayScrollArea.prevAll('.fpd-loader-wrapper:first').addClass('fpd-hidden');
    
            if (data.hits.length > 0) {
    
                data.hits.forEach(function(item) {
                    
                    const thumbnail = createImgThumbnail({
                                url: item.media_url, 
                                thumbnailUrl: item.thumbnail_url ? item.thumbnail_url : item.media_url, 
                                title: item.id,
                                price: this.fpdInstance.formatPrice(this.fpdInstance.currentViewInstance.options.customImageParameters.price)    
                    });
                    
                    this.gridElem.append(thumbnail);
                    this.fpdInstance.lazyBackgroundObserver.observe(thumbnail.querySelector('picture'));
    
                    var source = item.imageURL ? item.imageURL : item.webformatURL,
                        $lastItem = $('<div/>', {
                                'class': 'fpd-item '+lazyClass,
                                'data-title': (item.id ? item.id : item.id_hash),
                                'data-source': source,
                                'data-thumbnail': item.webformatURL,
                                'html': '<picture data-img="'+item.webformatURL+'"></picture><span class="fpd-price"></span>'
                            }).appendTo($pixabayGrid);
    
                    FPDUtil.setItemPrice($lastItem, fpdInstance);
    
                });
    
            }
    
            loadingStack = false;
    
        })
        .fail(function(data, textStatus, jqXHR) {
            $pixabayScrollArea.prevAll('.fpd-loader-wrapper:first').addClass('fpd-hidden');
            FPDUtil.log(textStatus);
        });
    
    };
    
    

}
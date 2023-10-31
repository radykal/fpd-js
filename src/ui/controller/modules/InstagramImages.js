import '../../../ui/view/modules/InstagramImages.js';

import { getJSON } from '../../../helpers/request';
import { 
    addEvents, 
    getItemPrice, 
    createImgThumbnail,
    localStorageAvailable,
    isEmpty
} from '../../../helpers/utils';

export default class InstgramImagesModule extends EventTarget {
    
    accessToken = null;
    nextStack = null;
    loadingStack = false;
    scrollArea = null;
    
    constructor(fpdInstance, wrapper) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        
        this.container = document.createElement("fpd-module-instagram-images");
        wrapper.append(this.container);
        
        this.gridElem = this.container.querySelector('.fpd-grid');
        this.scrollArea = this.container.querySelector('.fpd-scroll-area');
        
        //infinite scroll and load next stack of instagram images
        this.scrollArea.addEventListener('scroll', this.#nextStack.bind(this));
           
    }
    
    authenticate() {
        
        const mainOptions = this.fpdInstance.mainOptions;
        
        if(localStorageAvailable()) {
            
            //window.localStorage.removeItem('fpd_insta_access_token');
            const browserAccessToken = window.localStorage.getItem('fpd_insta_access_token');
            if(!isEmpty(browserAccessToken)) {
                
                this.accessToken = browserAccessToken;
                this.#loadImages();
                return;
                
            }
            
        }
    
        let popupLeft = (window.screen.width - 700) / 2,
            popupTop = (window.screen.height - 500) / 2,
            authUrl = 'https://api.instagram.com/oauth/authorize',
            authUrlQuery = {
                app_id: mainOptions.instagramClientId,
                redirect_uri: mainOptions.instagramRedirectUri,
                scope: 'user_profile,user_media',
                response_type: 'code'
            },
            urlParams = new URLSearchParams(authUrlQuery).toString();
        
        var popup = window.open(authUrl+'?'+urlParams, '', 'width=700,height=500,left='+popupLeft+',top='+popupTop+'');
    
        var interval = setInterval(() => {
    
            if(popup.closed) {
                clearInterval(interval);
            }
    
            try {
    
                if(popup.location && popup.location.href) {
    
                    var url = new URL(popup.location.href),
                        code = url.searchParams.get('code');
                            
                    if(code) {
    
                        code = code.replace('#_', '');
                        this.#getAccessToken(code);
                        popup.close();
    
                    }
    
                }
    
            }
            catch(evt) {}
    
        }, 500);
    
    };
    
    #getAccessToken(code) {
        
        const mainOptions = this.fpdInstance.mainOptions;
    
        this.fpdInstance.toggleSpinner(true);
        
        getJSON({
            url: mainOptions.instagramTokenUri,
            params: {
                code: code,
                client_app_id: mainOptions.instagramClientId,
                redirect_uri: mainOptions.instagramRedirectUri
            },
            onSuccess: (data) => {
                
                if(data.access_token) {
                    
                    if(localStorageAvailable()) {
                        window.localStorage
                        .setItem('fpd_insta_access_token', data.access_token);
                    }
                
                    this.accessToken = data.access_token;
                    this.#loadImages();
                
                }
                else if(data.error_message) {
                    this.fpdInstance.toggleSpinner(false);
                } 
                
            },
            onError: (evt) => {
                this.fpdInstance.toggleSpinner(false);
            }
        });
    
    };
    
    //load photos from instagram using an endpoint
    #loadImages(endpoint='https://graph.instagram.com/me/media', emptyGrid=true) {
        
        this.loadingStack = true;
        this.fpdInstance.toggleSpinner(true);
        
        let getOpts = {
            url: endpoint,
            onSuccess: (response) => {
                
                if(response.data) {
                    
                    this.nextStack = (response.paging && response.paging.next) ? response.paging.next : null;
                                                            
                    response.data.forEach((item) => {
                        
                        if(item.media_type !== 'VIDEO') {
                            
                            const thumbnail = createImgThumbnail({
                                        url: item.media_url, 
                                        thumbnailUrl: item.thumbnail_url ? item.thumbnail_url : item.media_url, 
                                        title: item.id,
                                        price: getItemPrice(this.fpdInstance, this.container) 
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
                        
                        }
                        
                    })
                    
                }
                
                this.fpdInstance.toggleSpinner(false);
                this.loadingStack = false;
                this.#nextStack();
                
            },
            onError: ( xhr) => {
                
                if(xhr.response && xhr.response.error && xhr.response.error.code) {
                    
                    if(localStorageAvailable() && xhr.response.error.code == 190) {
                        
                        window.localStorage.removeItem('fpd_insta_access_token');
                        this.accessToken = null;
                        
                        this.authenticate();
                    }
                    
                }
                
                this.fpdInstance.toggleSpinner(false);
                this.loadingStack = false;
            }
        }
        
        if(emptyGrid) {
            
            this.gridElem.innerHTML = '';
            
            getOpts.params = {
                fields: 'id,caption,media_url,media_type',
                access_token: this.accessToken
            }
            
        }
        
        getJSON(getOpts);
    
    }

    #nextStack() {

        const offset = 100;
        let areaHeight = this.scrollArea.scrollHeight;
        let currentScroll = this.scrollArea.clientHeight + this.scrollArea.scrollTop;
                
        if(currentScroll+offset > areaHeight || this.gridElem.clientHeight < areaHeight) {
            
            if(this.nextStack !== null && !this.loadingStack) {
                this.#loadImages(this.nextStack, false);
            }
            
        }

    }

}
import '../../../ui/view/modules/FacebookImages.js';

import { 
    addEvents, 
    addElemClasses, 
    removeElemClasses, 
    createImgThumbnail,
    getItemPrice
} from '../../../helpers/utils.js';

export default class FacebookImagesModule extends EventTarget {
    
    constructor(fpdInstance, wrapper) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        
        this.container = document.createElement("fpd-module-facebook-images");
        wrapper.append(this.container);
        
        this.dropdown = this.container.querySelector('fpd-dropdown');
        this.dropdownList = this.container.querySelector('.fpd-dropdown-list > .fpd-scroll-area');
        this.gridElem = this.container.querySelector('.fpd-grid');
        
        this.#authenticate();
        
    }
    
    #authenticate() {
        
        const scriptTag = document.createElement('script');
        scriptTag.src = '//connect.facebook.com/en_US/sdk.js';
        scriptTag.addEventListener("load", () => {
            
            //init facebook
            FB.init({
                appId: this.fpdInstance.mainOptions.facebookAppId,
                autoLogAppEvents: true,
                xfbml: true,
                version: 'v16.0'
            });
            
            FB.getLoginStatus(this.#checkLoginStatus.bind(this));
            FB.Event.subscribe('auth.statusChange', this.#checkLoginStatus.bind(this));
            
        });
        
        document.body.appendChild(scriptTag);
        
    }
    
    #checkLoginStatus(response) {
        
        if (response.status === 'connected') {
            
            // the user is logged in and has authenticated your app
            addElemClasses(
                this.container,
                ['fpd-facebook-logged-in']
            )
    
            FB.api('/me/albums?fields=name,count,id', (response) => {
                
                //add all albums to select
                const albums = response.data;
                
                if(albums) {
                    
                    albums.forEach(album => {
                    
                        const albumItem = document.createElement('span');
                        albumItem.className = 'fpd-item';
                        albumItem.dataset.albumid = album.id;
                        albumItem.innerText = album.name;
                        albumItem.addEventListener('click', (evt) => {
                                                        
                            this.dropdown.setAttribute('value', evt.currentTarget.innerText);
                            this.#selectAlbum(evt.currentTarget.dataset.albumid);
                            
                        })
                        
                        this.dropdownList.append(albumItem);
                        
                    })

                }
                    
                removeElemClasses(
                    this.dropdown,
                    ['fpd-on-loading']
                );
    
            });
    
        }
    
    }
    
    #selectAlbum(albumId) {
        
        this.gridElem.innerHTML = '';
        
        addElemClasses(
            this.dropdown,
            ['fpd-on-loading']
        );
                
        FB.api('/'+albumId+'?fields=count', (response) => {
        
            const albumCount = response.count;
   
            FB.api(
                '/'+albumId+'?fields=photos.limit('+albumCount+').fields(source,images)',
                (response) => {
                    
                    removeElemClasses(
                        this.dropdown,
                        ['fpd-on-loading']
                    );
            
                    if(!response.error) {
            
                        const photos = response.photos.data;
                        
                        photos.forEach(photo => {
                            
                            const photoLargest = photo.images[0] ? photo.images[0].source : photo.source;
                            const photoThumbnail = photo.images[photo.images.length-1] ? photo.images[photo.images.length-1].source : photo.source;
                            
                            const thumbnail = createImgThumbnail({
                                    url: photoLargest, 
                                    thumbnailUrl: photoThumbnail, 
                                    title: photo.id,
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
                            
                        })
            
                    }
            
                    this.fpdInstance.toggleSpinner(false);
        
            });
        
        });
        
    }

}
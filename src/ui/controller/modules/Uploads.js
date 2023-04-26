import UploadsView from '/src/ui/view/modules/Uploads';
import Modal from '/src/ui/view/comps/Modal';
import Snackbar from '/src/ui/view/comps/Snackbar';
import { 
    addEvents, 
    localStorageAvailable, 
    createImgThumbnail, 
    checkImageDimensions,
    getFileExtension
} from '/src/helpers/utils';

export default class UploadsModule extends EventTarget {
    
    #allowedFileTypes;
    #uploadCounter = 0;
    #firstUploadDone = false; //add first upload to canvas, when product is created
    #allUploadZones = [];
    #totalUploadFiles = 0;
    
    constructor(fpdInstance, wrapper) {
        
        super();
                
        this.fpdInstance = fpdInstance;
                        
        this.container = document.createElement("fpd-module-uploads");
        wrapper.append(this.container);
        
        this.gridElem = this.container.querySelector('.fpd-grid');
        const uploadZone = this.container.querySelector('.fpd-upload-zone');
        
        //setup for allowed file types
        this.#allowedFileTypes = fpdInstance.mainOptions.allowedImageTypes;
        if(this.#allowedFileTypes.includes('jpeg') && !this.#allowedFileTypes.includes('jpg')) {
            this.#allowedFileTypes.push('jpg');
        }
        
        const uploadInput = this.container.querySelector('.fpd-upload-input');
        let acceptTypes = [];
        this.#allowedFileTypes.forEach((imageTpye) => {
        
            if(imageTpye == 'pdf') {
                acceptTypes.push('application/pdf')
            }
            else {
            
                if(imageTpye == 'svg') {
                    imageTpye += '+xml';
                }
                acceptTypes.push('image/'+imageTpye);
            
            }
        
        });
        uploadInput.setAttribute('accept', acceptTypes.join());
        
        //open file picker
        addEvents(
            uploadZone,
            'click',
            async (evt) => {
                
                evt.preventDefault();
                uploadInput.click();
                                
            }
        );
        
        //add files per click
        addEvents(
            uploadInput,
            'change', 
            (evt) => {
                this.#parseFiles(evt.currentTarget.files);
            }
        )
        
        //add files per drag&drop
        addEvents(
            uploadZone,
            ['dragover', 'dragleave'],
            (evt) => {
                
                evt.stopPropagation();
                evt.preventDefault();
                evt.currentTarget.classList.toggle('fpd-hover', evt.type === 'dragover')
                
            }
        ); 
        
        addEvents(
            uploadZone,
            'drop',
            (evt) => {
                
                evt.stopPropagation();
                evt.preventDefault();
                
                const files = evt.target.files || evt.dataTransfer.files;
                this.#parseFiles(files);
                
            }
        );
        
        addEvents(
            fpdInstance,
            'productCreate',
            (evt) => {
                
                this.#firstUploadDone = false;
                
            }
        ); 
        
        //window.localStorage.removeItem('fpd_uploaded_images');
        //get stored uploaded images from browser storage
        if(localStorageAvailable && window.localStorage.getItem('fpd_uploaded_images')) {
        
            const storageImages = JSON.parse(window.localStorage.getItem('fpd_uploaded_images'));
        
            storageImages.forEach((storageImage) => {
                
                const thumbnail = this.#addGridItem(
                    storageImage.url,
                    storageImage.title
                );
        
                var image = new Image();
                image.src = storageImage.url;
                image.onerror = function() {
        
                    var removeIndex = null;
                    storageImages.forEach(function(storedImg, key) {
                        if(storedImg.url == image.src) { removeIndex = key; }
                    })
        
                    if(removeIndex != null) {
                        storageImages.splice(removeIndex, 1);
                        window.localStorage.setItem('fpd_uploaded_images', JSON.stringify(storageImages));
                    }
        
                }
        
            });
        
        }
        
    }
    
    #parseFiles(files) {
        
        if(this.fpdInstance.mainOptions.uploadAgreementModal) {
            
            var confirmModal = Modal(
                this.fpdInstance.translator.getTranslation(
                    'modules', 
                    'images_agreement'
                ), 
                false, 
                'confirm', 
                this.fpdInstance.container
            );
            
            const confirmBtn = confirmModal.querySelector('.fpd-confirm');
            confirmBtn.innerText = this.fpdInstance.translator.getTranslation(
                'modules', 
                'images_confirm_button'
            );
            
            addEvents(
                confirmBtn,
                ['click'],
                () => {
                    
                    this.#addFiles(files);
                    confirmModal.remove();
                    
                }
            )
    
        }
        else {
            this.#addFiles(files);
        }
    
    };
    
    #addFiles(files) {
    
        this.#uploadCounter = 0;
        this.#totalUploadFiles = files.length;
        
        //todo
    //     for(var i=0; i < fpdInstance.currentViews.length; ++i) {
    // 
    //         fpdInstance.getElements(i).forEach(function(elem) {
    // 
    //             if(elem.uploadZone) {
    //                 allUploadZones.push({uz: elem.title, viewIndex: i});
    //             }
    // 
    //         });
    // 
    //     }
        
        this.fpdInstance.loadingCustomImage = true;        
        Array.from(files).forEach((file, i) => {
            
            if(this.#allowedFileTypes.includes(getFileExtension(file.name))) {
                this.#initUpload(file, i == 0);
            }
            
        })
        
        this.container.querySelector('.fpd-upload-zone')
        .classList.remove('fpd-hover');
    
    }
    
    #initUpload(file, addToStage) {
    
        //check maximum allowed size
        const maxSizeBytes = this.fpdInstance.mainOptions.customImageParameters.maxSize * 1024 * 1024;
    
        if(file.size > maxSizeBytes) {
            
            Snackbar(
                this.fpdInstance.translator.getTranslation('misc', 'maximum_size_info')
                .replace('%filename', file.name)
                .replace('%mb', this.fpdInstance.mainOptions.customImageParameters.maxSize)
            );
            
            this.fpdInstance.loadingCustomImage = false;
            return;
            
        }
        
        if(file.type === 'application/pdf') {
            this.#uploadPdf(file, addToStage);            
        }
        else {
            this.#uploadImage(file, addToStage);
        }
    
    }
    
    #uploadImage(file, addToStage=false) {
        
        const mainOptions = this.fpdInstance.mainOptions;
        
        //load image with FileReader
        const reader = new FileReader();
        
        reader.onload = (evt) => {
                    
            const imgDataURI = evt.currentTarget.result;
            
            //check image resolution of jpeg
            if(file.type === 'image/jpeg' && mainOptions.customImageParameters.minDPI) {   
                
                const jpeg = new JpegMeta.JpegFile(
                    atob(imgDataURI.replace(/^.*?,/,'')), 
                    file.name
                );
                let realRes = null;
                        
                if(jpeg.tiff && jpeg.tiff.XResolution && jpeg.tiff.XResolution.value) {
        
                    var xResDen = jpeg.tiff.XResolution.value.den,
                        xResNum = jpeg.tiff.XResolution.value.num;
        
                    realRes = xResNum / xResDen;
        
                }
                else if(jpeg.jfif && jpeg.jfif.Xdensity && jpeg.jfif.Xdensity.value) {
                    realRes = jpeg.jfif.Xdensity.value;
                }
        
                if(realRes !== null) {
                    
                    console.log(file.name+' Real Resolution: '+ realRes);
        
                    if(realRes < mainOptions.customImageParameters.minDPI) {
                        
                        let dpiMsg = this.fpdInstance.translator.getTranslation(
                            'misc', 
                            'minimum_dpi_info'
                        );
                        dpiMsg = dpiMsg.replace('%dpi', mainOptions.customImageParameters.minDPI)
                        
                        Modal(dpiMsg, false, '', this.fpdInstance.container);
                        
                        this.fpdInstance.loadingCustomImage = false;
                        return false;
                        
                    }
        
                }
                else {
                    console.log(file.name + ': Resolution is not accessible.');
                }
        
            }
            
            const thumbnail = this.#addGridItem(
                imgDataURI,
                file.name
            );
            
            if(this.fpdInstance.uploadsToServer) {
                
                thumbnail.classList.add('fpd-loading');
                thumbnail.insertAdjacentHTML(
                    'beforeend', 
                    '<div class="fpd-loading-bar"><div class="fpd-loading-progress"></div></div>'
                );
        
            }
                    
            //check image dimensions
            var checkDimImage = new Image();
            checkDimImage.onload = (evt) => {
                                
                const image = evt.currentTarget;
        
                let imageH = image.height,
                    imageW = image.width,
                    currentCustomImageParameters = this.fpdInstance.currentViewInstance.options.customImageParameters;
        
                if(checkImageDimensions(this.fpdInstance, imageW, imageH)) {
                    
                    if(this.fpdInstance.uploadsToServer) {
                        
                        var formData = new FormData();
                        formData.append('uploadsDir', this.fpdInstance.uploadsDir);
                        formData.append('uploadsDirURL', this.fpdInstance.uploadsDirURL);
                        formData.append('images[]', file);
                        
                        const xhr = new XMLHttpRequest();
                        xhr.responseType = 'json';
                        
                        xhr.onreadystatechange = (evt) => {
                            
                            if (xhr.readyState === XMLHttpRequest.DONE) {
                                
                                const status = xhr.status;
                                if (status === 0 || (status >= 200 && status < 400)) {
                                    
                                    const data = xhr.response;
                                    
                                    if(data.image_src) {
                                        
                                        this.#storeUploadedImage(data.image_src, data.filename);
                                        
                                        //update source to local server image
                                        thumbnail
                                        .dataset.source =  data.image_src; 
                                        
                                        thumbnail.classList.remove('fpd-loading');
                                        thumbnail.querySelector('.fpd-loading-bar').remove();
                                        
                                        this.#addToStage(thumbnail, addToStage);
                                        this.#uploadCounter++;
                                        
                                        thumbnail.xhr = null;
                                        
                                    }  
                                    
                                    this.fpdInstance.loadingCustomImage = false;
                                    
                                } 
                                
                            }
                        
                        };
                        
                        xhr.upload.onprogress = (evt) => {
                            
                            let max = evt.total,
                                current = evt.loaded,
                                percentage = parseInt((current * 100)/max);
                                
                            thumbnail
                            .querySelector('.fpd-loading-progress')
                            .style.width = percentage+'%';
                            
                        };
                        
                        xhr.upload.onerror = (evt) => {
                            
                            this.fpdInstance.loadingCustomImage = false;
                            thumbnail.remove();
                            Snackbar('Upload failed. Please try again or check your web console!');
                        
                        };
                        
                        xhr.open('POST', this.fpdInstance.uploadsURL);
                        xhr.send(formData);
                        
                        thumbnail.xhr = xhr;
        
                    }
                    else { //do not save on server
        
                        this.#storeUploadedImage(image, file.name);
                        this.#addToStage(thumbnail, addToStage);
                        this.#uploadCounter++;
        
                    }
        
                }
                else { //remove thumbnail when dimensions are not in the range
                    
                    thumbnail.remove();
                    this.fpdInstance.currentViewInstance.currentUploadZone = null;
                    
                }
        
            };
        
            checkDimImage.src = imgDataURI;
        
        }
        
        //add file to start loading
        reader.readAsDataURL(file);
        
    }
    
    #uploadPdf(file, addToStage=false) {
        
        const mainOptions = this.fpdInstance.mainOptions;
        
        const uploadSnackBar = Snackbar(
            this.fpdInstance.translator.getTranslation('modules', 'images_pdf_upload_info'), 
            false
        );
        
        const formData = new FormData();
        formData.append('uploadsDir', this.fpdInstance.uploadsDir);
        formData.append('uploadsDirURL', this.fpdInstance.uploadsDirURL);
        formData.append('pdf', file);
        
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.onreadystatechange = (evt) => {
            
            if (xhr.readyState === XMLHttpRequest.DONE) {
                
                const status = xhr.status;
                if (status === 0 || (status >= 200 && status < 400)) {
                    
                    const data = xhr.response;
                                        
                    this.#totalUploadFiles--;
                    data.pdf_images.forEach((pdfImageData, i) => {
                        
                        const thumbnail = this.#addGridItem(
                            pdfImageData.image_url,
                            pdfImageData.filename
                        );
                                                            
                        this.#addToStage(
                            thumbnail, 
                            i == 0
                        );
                        
                        this.#storeUploadedImage(
                            pdfImageData.image_url, 
                            pdfImageData.filename
                        );
                        
                        this.#uploadCounter++;
                
                    })
                
                    uploadSnackBar.remove();
                    this.#totalUploadFiles++;
                    this.fpdInstance.loadingCustomImage = false;
                    
                } 
                
            }
        
        };
        
        xhr.upload.onerror = () => {
                                        
            this.fpdInstance.loadingCustomImage = false;
            uploadSnackBar.remove();
            Snackbar('Upload failed. Please try again or check your web console!');
        
        };
        
        xhr.open('POST', this.fpdInstance.uploadsURL);
        xhr.send(formData);
        
    }
    
    #storeUploadedImage(url, title) {
    
        if(localStorageAvailable) {
    
            var savedLocalFiles = window.localStorage.getItem('fpd_uploaded_images') ? JSON.parse(window.localStorage.getItem('fpd_uploaded_images')) : [],
                imgObj = {
                    url: url,
                    title: title
                };
    
            savedLocalFiles.push(imgObj);
            window.localStorage.setItem('fpd_uploaded_images', JSON.stringify(savedLocalFiles))
    
        }
    
    }
    
    #addGridItem(imgUrl, title) {
        
        const thumbnail = createImgThumbnail({
                url: imgUrl,
                title: title,
                price: this.fpdInstance.formatPrice(this.fpdInstance.mainOptions.customImageParameters.price),
                removable: true
        });
        
        this.gridElem.append(thumbnail);
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
        
        //remove upload item
        addEvents(
            thumbnail.querySelector('.fpd-delete'),
            'click',
            (evt) => {
                                    
                evt.stopPropagation();
                evt.preventDefault();
                
                const index = Array.from(this.gridElem.children).indexOf(thumbnail);
                
                if(!thumbnail.classList.contains('fpd-loading')) {
                    
                    var storageImages = JSON.parse(window.localStorage.getItem('fpd_uploaded_images'));
    
                    storageImages.splice(index, 1);
                    window.localStorage.setItem('fpd_uploaded_images', JSON.stringify(storageImages));
                    
                    if(thumbnail.xhr) {
                        thumbnail.xhr.abort();
                    }
                    
                    thumbnail.remove();
                    
                }
                                    
            }
        );
        
        return thumbnail;
        
    }
        
    #addToStage(item, addToStage) {
    
        if(!this.#firstUploadDone && this.fpdInstance.mainOptions.autoFillUploadZones) {
    
            const targetUploadzone = this.#allUploadZones[this.#uploadCounter] ? this.#allUploadZones[this.#uploadCounter] : null;
    
            if(targetUploadzone) {
    
                this.fpdInstance._addGridItemToCanvas(
                    item,
                    {_addToUZ: targetUploadzone.uz},
                    targetUploadzone.viewIndex
                );
    
            }
    
        }
        else if(addToStage) {
            this.fpdInstance._addGridItemToCanvas(item);
        }
    
        if(this.#uploadCounter == this.#totalUploadFiles-1) {
            this.#firstUploadDone = true;
        }
    
    }
    
    //todo
    #imageQualityRatings($thumbnail, imgUrl) {
        
        const opts = this.fpdInstance.mainOptions.imageQualityRatings;
        
        if(opts && typeof opts == 'object') {
    
            var low = opts.low ? opts.low : null,
                mid = opts.mid ? opts.mid : null,
                high = opts.high ? opts.high : null,
                icon = 'fpd-icon-star',
                iconOutline = 'fpd-icon-star-outline';
    
            var image = new Image();
            image.onload = function() {
    
                var $ratingsWrapper = $thumbnail.append('<div class="fpd-image-quality-ratings"></div>').children('.fpd-image-quality-ratings'),
                    qualityLabel;
    
                if(low && low.length == 2) {
                    var lowIcon = this.width < Number(low[0]) || this.height < Number(low[1]) ? iconOutline : icon;
                    $ratingsWrapper.append('<span class="'+lowIcon+'"></span>');
    
                    if(lowIcon == icon) {
                        qualityLabel = fpdInstance.getTranslation('misc', 'image_quality_rating_low');
                    }
    
                }
    
                if(mid && mid.length == 2) {
                    var midIcon = this.width < Number(mid[0]) || this.height < Number(mid[1]) ? iconOutline : icon;
                    $ratingsWrapper.append('<span class="'+midIcon+'"></span>');
    
                    if(midIcon == icon) {
                        qualityLabel = fpdInstance.getTranslation('misc', 'image_quality_rating_mid');
                    }
    
                }
    
                if(high && high.length == 2) {
                    var highIcon = this.width < Number(high[0]) || this.height < Number(high[1]) ? iconOutline : icon;
                    $ratingsWrapper.append('<span class="'+highIcon+'"></span>');
    
                    if(highIcon == icon) {
                        qualityLabel = fpdInstance.getTranslation('misc', 'image_quality_rating_high');
                    }
    
    
                }
    
                if(qualityLabel) {
                    $ratingsWrapper.data('quality-label', qualityLabel)
                }
    
            }
    
            image.src = imgUrl;
    
        }
    
    }


}
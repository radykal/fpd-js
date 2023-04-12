import Modal from '/src/ui/view/comps/Modal';

const isPlainObject = (value) => {
    return Object.prototype.toString.call(value) === '[object Object]';
}

export { isPlainObject };

const objectHasKeys = (obj, keys) => {

    if(obj && typeof obj === 'object') {

        let hasAllKeys = true;
        for(var i=0; i < keys.length; ++i) {

            var key = keys[i];
            if(!obj.hasOwnProperty(key)) {
                hasAllKeys = false;
                break;
            }

        }

        return hasAllKeys;

    }
    else {
        return false;
    }

}

export { objectHasKeys };

const deepMerge = (obj1, obj2) => {
    
    // Create a new object that combines the properties of both input objects
    const merged = {
        ...obj1,
        ...obj2
    };
    
    if(Object.keys(obj2).length) {
        
        // Loop through the properties of the merged object
        for(const key of Object.keys(merged)) {
            
            // Check if the property is an object
            if (isPlainObject(merged[key])) {
                if(obj1[key] && obj2[key]) {
                    merged[key] = deepMerge(obj1[key], obj2[key]);
                }
                
            }
        }
        
    }
    
    return merged;
}

export { deepMerge };

/**
 * Checks if a string is an URL.
 *
 * @method isUrl
 * @param {String} s The string.
 * @return {Boolean} Returns true if string is an URL.
 * @static
 */
const isUrl = (s) => {

    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);

}

export { isUrl };

/**
 * Removes an element from an array by value.
 *
 * @method removeFromArray
 * @param {Array} array The target array.
 * @param {String} element The element value.
 * @return {Array} Returns the edited array.
 * @static
 */
const removeFromArray  = (array, element) => {

    var index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }

    return array;

}

export { removeFromArray };

/**
 * Checks if a string is XML formatted.
 *
 * @method isXML
 * @param {String} string The target string.
 * @return {Boolean} Returns true if string is XML formatted.
 * @static
 */
const isXML = (string) => {

    try {
        //todo
        xmlDoc = jQuery.parseXML(string); //is valid XML
        return true;
    } catch (err) {
        // was not XML
        return false;
    }

};

export { isXML };

const isZero = (value) => {

    return value === 0 || (typeof value === 'string' && value === "0");

}

export { isZero };

const addEvents = (elements, events=[], listener=()=>{}) => {
    
    events = typeof events == 'string' ? [events] : events; 
    
    events.forEach(eventType => {
        
        if(elements instanceof HTMLElement) {
            
            elements.addEventListener(eventType, listener);
            
        }
        else if(Array.from(elements).length) {
            
            elements.forEach(elem => {
                elem.addEventListener(eventType, listener);
            })
            
        }
        else {
            elements.addEventListener(eventType, listener);
        }
        
    })
        
}

export { addEvents };

const addElemClasses = (elements=[], classes=[]) => {
    
    if(elements) {
        
        if(elements instanceof HTMLElement) {
            
            classes.forEach(c => {
                elements.classList.add(c);
            })
            
        }
        else {
            
            elements.forEach(elem => {
                classes.forEach(c => {
                    elem.classList.add(c);
                })
            })
            
        }
        
    }
    
    return elements;
    
}

export { addElemClasses };

const removeElemClasses = (elements=[], classes=[]) => {
    
    if(elements) {
        
        if(elements instanceof HTMLElement) {
            
            classes.forEach(c => {
                elements.classList.remove(c);
            })
            
        }
        else {
            
            elements.forEach(elem => {
                classes.forEach(c => {
                    elem.classList.remove(c);
                })
            
            })
            
        }
        
         
    }
    
    return elements;
    
}

export { removeElemClasses };

const toggleElemClasses = (elements=[], classes=[], toggle=true) => {
    
    if(elements) {
        
        if(elements instanceof HTMLElement) {
            
            classes.forEach(c => {
                elements.classList.toggle(c, toggle);
            })
            
        }
        else {
            
            elements.forEach(elem => {
                classes.forEach(c => {
                    elem.classList.toggle(c, toggle);
                })
            })
            
        }
        
    }
    
    return elements;
    
}

export { toggleElemClasses };

const loadGridImage = (pictureElem, source=null) => {

    if(pictureElem) {
        
        pictureElem.classList.add('fpd-on-loading');
        
        var image = new Image();
        image.src = source ? source : pictureElem.dataset.img;
        
        image.onload = function() {
            pictureElem.dataset.originwidth = this.width;
            pictureElem.dataset.originheight = this.height;
            pictureElem.classList.remove('fpd-on-loading');
            pictureElem.style.backgroundImage =  'url("'+this.src+'")';
        };
        
        image.onerror = function() {
            pictureElem.parentNode.remove();

        }

    }

}

export { loadGridImage };

const isEmpty = (value) => {

    if (value === undefined) 
        return true;

    if (value == null)  
        return true;

    if (typeof value === 'string')
        return !value.trim().length;
    
    if (Array.isArray(value))
        return !value.length;

    if (typeof value === 'object')
        return !Object.keys(value).length;

    return false;

};

export { isEmpty };

/**
 * Checks if the browser local storage is available.
 *
 * @method localStorageAvailable
 * @return {Boolean} Returns true if local storage is available.
 * @static
 */
const localStorageAvailable = () => {

    var localStorageAvailable = true;
    //execute this because of a ff issue with localstorage
    try {
        window.localStorage.length;
        window.localStorage.setItem('fpd-storage', 'just-testing');
        //window.localStorage.clear();
    }
    catch(error) {
        localStorageAvailable = false;
        //In Safari, the most common cause of this is using "Private Browsing Mode". You are not able to save products in your browser.
    }

    return localStorageAvailable;

}

export { localStorageAvailable };

const createImgThumbnail = (opts={}) => {
    
    if(!opts.url) return;

    // todo: price
    // FPDUtil.setItemPrice($thumbnail, fpdInstance);

    const thumbnail = document.createElement('div');
    thumbnail.className = 'fpd-item';
    thumbnail.dataset.source = opts.url;
    
    if(opts.title)
        thumbnail.dataset.title = opts.title;
    
    const picElem = document.createElement('picture');
    picElem.dataset.img = opts.thumbnailUrl ? opts.thumbnailUrl : opts.url;
    thumbnail.append(picElem);
    
    if(opts.price) {
        const priceElem = document.createElement('span');
        priceElem.className = "fpd-price";
        priceElem.innerHTML = opts.price;
        thumbnail.append(priceElem);
    }
    
    if(opts.removable) {
        const removeElem = document.createElement('span');
        removeElem.className = 'fpd-delete fpd-icon-remove';
        thumbnail.append(removeElem);
    }
    
    
    return thumbnail;

};

export { createImgThumbnail };

/**
 * Checks if the dimensions of an image is within the allowed range set in the customImageParameters of the view options.
 *
 * @method checkImageDimensions
 * @param {FancyProductDesigner} fpdInstance Instance of FancyProductDesigner.
 * @param {Number} imageW The image width.
 * @param {Number} imageH The image height.
 * @return {Array} Returns true if image dimension is within allowed range(minW, minH, maxW, maxH).
 * @static
 */
const checkImageDimensions = (fpdInstance, imageW, imageH) => {
    
    console.log(imageW);
    const viewInst = fpdInstance.currentViewInstance;
    let imageRestrictions = viewInst.options.customImageParameters;
    
    //todo
    // const uploadZone = viewInst.getUploadZone(viewInst.currentUploadZone);
    // if(uploadZone) {
    //     imageRestrictions = deepMerge( imageRestrictions, uploadZone );
    // }

    if(imageW > imageRestrictions.maxW ||
    imageW < imageRestrictions.minW ||
    imageH > imageRestrictions.maxH ||
    imageH < imageRestrictions.minH) {

        fpdInstance.loadingCustomImage = false;
        
        console.log(fpdInstance.mainBar);
        if(fpdInstance.mainBar) {
            
            fpdInstance.mainBar.toggleContentDisplay(false);

            if(viewInst.currentUploadZone) {
                fpdInstance.mainBar.toggleUploadZonePanel(false);
            }

        }
        
        let sizeAlert = fpdInstance.translator.getTranslation(
            'misc', 
            'uploaded_image_size_alert'
        );
        
        sizeAlert = sizeAlert
                    .replace('%minW', imageRestrictions.minW)
                    .replace('%minH', imageRestrictions.minH)
                    .replace('%maxW', imageRestrictions.maxW)
                    .replace('%maxH', imageRestrictions.maxH);
        
        Modal(sizeAlert);
        return false;

    }
    else {
        return true;
    }

}

export { checkImageDimensions };

const getFileExtension = (str) => {
    //ext > lowercase > remove query params
    return str.split('.').pop().toLowerCase().split('?')[0];
}

export { getFileExtension }

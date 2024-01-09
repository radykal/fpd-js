import Modal from '../ui/view/comps/Modal.js';
import Snackbar from '../ui/view/comps/Snackbar.js';
import tinycolor from "tinycolor2";



const isPlainObject = (value) => {
    return Object.prototype.toString.call(value) === '[object Object]';
}

export { isPlainObject }

const objectHasKeys = (obj, keys) => {

    if (obj && typeof obj === 'object') {

        let hasAllKeys = true;
        for (var i = 0; i < keys.length; ++i) {

            var key = keys[i];
            if (!obj.hasOwnProperty(key)) {
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

export { objectHasKeys }

const objectsAreEqual = (obj1, obj2) => {

    var props1 = Object.getOwnPropertyNames(obj1);
    var props2 = Object.getOwnPropertyNames(obj2);

    if (props1.length != props2.length) {
        return false;
    }

    for (var i = 0; i < props1.length; i++) {
        let val1 = obj1[props1[i]];
        let val2 = obj2[props1[i]];
        let isObjects = isPlainObject(val1) && isPlainObject(val2);
        if (isObjects && !objectsAreEqual(val1, val2) || !isObjects && val1 !== val2) {
            return false;
        }
    }

    return true;
}

export { objectsAreEqual }

const deepMerge = (obj1, obj2) => {

    // Create a new object that combines the properties of both input objects
    const merged = {
        ...obj1,
        ...obj2
    };
    
    if (Object.keys(obj2).length) {

        // Loop through the properties of the merged object
        for (const key of Object.keys(merged)) {

            // Check if the property is an object            
            if (isPlainObject(merged[key])) {

                if (obj1[key] && obj2[key]) {
                    merged[key] = deepMerge(obj1[key], obj2[key]);
                }

            }
        }

    }

    return merged;
}

export { deepMerge }


const objectGet = (obj, path, defValue) => {

    // If path is not defined or it has false value
    if (!path) return undefined
    // Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g)
    // Find value
    const result = pathArray.reduce(
        (prevObj, key) => prevObj && prevObj[key],
        obj
    )
    // If found value is undefined return default value; otherwise return the value
    return result === undefined ? defValue : result;
}

export { objectGet }

const isUrl = (s) => {

    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);

}

export { isUrl }
    

const removeUrlParams = (url) => {
    return url.replace(/\?.*$/, '');
}

export { removeUrlParams }

/**
 * Makes an unique array.
 *
 * @method arrayUnique
 * @param {Array} array The target array.
 * @return {Array} Returns the edited array.
 * @static
 */
const arrayUnique = (array) => {

    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}

export { arrayUnique }

/**
 * Removes an element from an array by value.
 *
 * @method removeFromArray
 * @param {Array} array The target array.
 * @param {String} element The element value.
 * @return {Array} Returns the edited array.
 * @static
 * @ignore
 */
const removeFromArray = (array, element) => {

    var index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }

    return array;

}

export { removeFromArray }

const isZero = (value) => {

    return value === 0 || (typeof value === 'string' && value === "0");

}

export { isZero }

const addEvents = (elements, events = [], listener = () => { }, useCapture = false) => {

    events = typeof events == 'string' ? [events] : events;

    events.forEach(eventType => {

        if (elements instanceof HTMLElement || elements instanceof window.constructor) {

            elements.addEventListener(eventType, listener, useCapture);

        }
        else if (Array.from(elements).length) {

            if (elements && elements.forEach) {
                
                elements.forEach(elem => {
                    elem.addEventListener(eventType, listener, useCapture);
                })
                

            }

        }
        else {
            elements.addEventListener(eventType, listener, useCapture);
        }

    })

}

export { addEvents }

const fireEvent = (target, eventName, eventDetail={}) => {
    
    if(window) {

        target.dispatchEvent(
            new CustomEvent(eventName, {
                detail: eventDetail
            })
        );

    }   

    if(window.jQuery && target.container) {

        jQuery(target.container).trigger(eventName, Object.values(eventDetail));

    }

}

export { fireEvent }

const addElemClasses = (elements = [], classes = []) => {

    if (elements) {

        if (elements instanceof HTMLElement) {

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

export { addElemClasses }

const removeElemClasses = (elements = [], classes = []) => {

    if (elements) {

        if (elements instanceof HTMLElement) {

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

export { removeElemClasses }

const toggleElemClasses = (elements = [], classes = [], toggle = true) => {

    if (elements) {

        if (elements instanceof HTMLElement) {

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

const loadGridImage = (pictureElem, source = null) => {

    if (pictureElem) {

        pictureElem.classList.add('fpd-on-loading');

        var image = new Image();
        image.src = source ? source : pictureElem.dataset.img;

        image.onload = function () {
            pictureElem.dataset.originwidth = this.width;
            pictureElem.dataset.originheight = this.height;
            pictureElem.classList.remove('fpd-on-loading');
            pictureElem.style.backgroundImage = 'url("' + this.src + '")';
        };

        image.onerror = function () {
            pictureElem.parentNode.remove();

        }

    }

}

export { loadGridImage }

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

}

export { isEmpty }

/**
 * Checks if the browser local storage is available.
 *
 * @method localStorageAvailable
 * @return {Boolean} Returns true if local storage is available.
 * @static
 * @ignore
 */
const localStorageAvailable = () => {

    var localStorageAvailable = true;
    //execute this because of a ff issue with localstorage
    try {
        window.localStorage.length;
        window.localStorage.setItem('fpd-storage', 'just-testing');
        //window.localStorage.clear();
    }
    catch (error) {
        localStorageAvailable = false;
        //In Safari, the most common cause of this is using "Private Browsing Mode". You are not able to save products in your browser.
    }

    return localStorageAvailable;

}

export { localStorageAvailable }

const createImgThumbnail = (opts = {}) => {

    if (!opts.url) return;

    const thumbnail = document.createElement('div');
    thumbnail.className = 'fpd-item fpd-hover-thumbnail';
    thumbnail.dataset.source = opts.url;

    if (!opts.disableDraggable) {
        thumbnail.classList.add('fpd-draggable');
    }

    if (opts.title) {
        thumbnail.dataset.title = opts.title;
        thumbnail.setAttribute('aria-label', opts.title);
    }

    const picElem = document.createElement('picture');
    picElem.dataset.img = opts.thumbnailUrl ? opts.thumbnailUrl : opts.url;
    thumbnail.append(picElem);

    const img = new Image();
    img.onerror = () => {
        thumbnail.remove();
    }
    img.src = picElem.dataset.img;
    
    if (!opts.disablePrice) {
        
        const priceElem = document.createElement('span');
        priceElem.className = "fpd-price";
        priceElem.innerHTML = opts.price;
        thumbnail.append(priceElem);

        toggleElemClasses(priceElem, ['fpd-hidden'], !Boolean(opts.price));

    }

    if (opts.removable) {
        const removeElem = document.createElement('span');
        removeElem.className = 'fpd-delete fpd-icon-remove';
        thumbnail.append(removeElem);
    }

    return thumbnail;

}

export { createImgThumbnail }

const getItemPrice = (fpdInstance, container, price = null) => {
    
    if (!fpdInstance.currentViewInstance) return '';

    let currentViewOptions = fpdInstance.currentViewInstance.options;

    //get price from upload zone if module is inside upload-zone-content    
    if (document.querySelector('.fpd-upload-zone-content').contains(container)
        && fpdInstance.currentViewInstance.currentUploadZone
    ) {

        const uploadZone = fpdInstance.currentViewInstance.fabricCanvas.getUploadZone(
            fpdInstance.currentViewInstance.currentUploadZone
        );

        if (uploadZone && uploadZone.price) {
            price = uploadZone.price;

        }

    }

    //only apply general price if null    
    if (price == null) {
        price = objectGet(currentViewOptions, 'customImageParameters.price', 0);
    }

    const priceStr = price ? formatPrice(price, fpdInstance.mainOptions.priceFormat) : '';

    return priceStr;

}

export { getItemPrice }

/**
 * Checks if the dimensions of an image is within the allowed range set in the customImageParameters of the view options.
 *
 * @method checkImageDimensions
 * @param {FancyProductDesigner} fpdInstance Instance of FancyProductDesigner.
 * @param {Number} imageW The image width.
 * @param {Number} imageH The image height.
 * @return {Array} Returns true if image dimension is within allowed range(minW, minH, maxW, maxH).
 * @static
 * @ignore
 */
const checkImageDimensions = (fpdInstance, imageW, imageH) => {

    const viewInst = fpdInstance.currentViewInstance;
    let imageRestrictions = viewInst.options.customImageParameters;

    const uploadZone = viewInst.fabricCanvas.getUploadZone(viewInst.currentUploadZone);
    if (uploadZone) {
        imageRestrictions = deepMerge(imageRestrictions, uploadZone);
    }

    if (imageW > imageRestrictions.maxW ||
        imageW < imageRestrictions.minW ||
        imageH > imageRestrictions.maxH ||
        imageH < imageRestrictions.minH) {

        fpdInstance.loadingCustomImage = false;

        if (fpdInstance.mainBar) {

            fpdInstance.mainBar.toggleContentDisplay(false);

            if (viewInst.currentUploadZone) {
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

const getFilename = (str) => {
    return str.split('/').pop();;
}

export { getFilename }

const isBitmap = (url) => {

    return ['jpeg', 'jpg', 'png'].includes(getFileExtension(url));
}

export { isBitmap }

/**
 * Returns the available colors of an element.
 *
 * @method elementAvailableColors
 * @param {fabric.Object} element The target element.
 * @param {FancyProductDesigner} fpdInstance Instance of FancyProductDesigner.
 * @return {Array} Available colors.
 * @static
 * @ignore
 */
const elementAvailableColors = (element, fpdInstance) => {

    var availableColors = [];
    if (element.type == 'group') {

        const paths = element.getObjects();
        if (paths.length === 1) {
            availableColors = element.colors === true || element.colors === 1 ? ['#000'] : element.colors;
        }
        else {
            availableColors = [];
            paths.forEach((path) => {

                const color = tinycolor(path.fill);
                availableColors.push(color.toHexString());

            })

        }

    }
    else if (element.__editorMode) {
        return ['#000'];
    }
    else if (element.colorLinkGroup && fpdInstance.colorLinkGroups[element.colorLinkGroup]) {
        availableColors = fpdInstance.colorLinkGroups[element.colorLinkGroup].colors;

    }
    else {
        availableColors = element.colors === true || element.colors === 1 ? ['#000'] : element.colors;
    }

    return availableColors;

}

export { elementAvailableColors }

const getBgCssFromElement = (element) => {

    let currentFill = element.fill;

    //fill: hex
    if (typeof currentFill === 'string') {
        return currentFill;
    }
    //fill: pattern or svg fill
    else if (typeof currentFill === 'object') {

        if (currentFill.source) { //pattern
            currentFill = currentFill.source.src;
            return 'url(' + currentFill + ')';
        }
        else { //svg has fill
            return currentFill[0];
        }

    }
    //element: svg
    else if (element.colors === true && element.type === 'group') {
        return tinycolor(element.getObjects()[0].fill);
    }
    //no fill, only colors set
    else if (currentFill === false && element.colors && element.colors[0]) {
        return element.colors[0];
    }

}

export { getBgCssFromElement };

const getNextSibling = (elem, selector) => {

    // Get the next sibling element
    var sibling = elem.nextElementSibling;

    // If the sibling matches our selector, use it
    // If not, jump to the next sibling and continue the loop
    while (sibling) {
        if (sibling.matches(selector)) return sibling;
        sibling = sibling.nextElementSibling
    }

}

export { getNextSibling };

const getPrevSibling = (elem, selector) => {

    // Get the next sibling element
    var sibling = elem.nextElementSibling;

    // If the sibling matches our selector, use it
    // If not, jump to the next sibling and continue the loop
    while (sibling) {
        if (sibling.matches(selector)) return sibling;
        sibling = sibling.nextElementSibling
    }

}

export { getPrevSibling };

const popupBlockerAlert = (popup, msg) => {

    if (popup == null || typeof (popup) == 'undefined') {
        Snackbar(msg);
    }

}

export { popupBlockerAlert }

const getScript = (src) => {

    return new Promise(function (resolve, reject) {

        if (document.querySelector("script[src='" + src + "']") === null) {

            var script = document.createElement('script');
            script.onload = () => {
                resolve();
            };
            script.onerror = () => {
                reject();
            };

            script.src = src;
            document.body.appendChild(script);

        } else {
            resolve();
        }

    });

}

export { getScript }

const unitToPixel = (length, unit='inch', dpi = 72) => {

    const ppi = length * dpi;

    if (unit == 'cm') {
        return Math.round(ppi / 2.54);
    }
    else if (unit == 'mm') {
        return Math.round(ppi / 25.4);
    }
    else {
        return Math.round(ppi);
    }

}

export { unitToPixel }

const pixelToUnit = (pixel, unit='inch', dpi = 72) => {

    const inches = pixel / dpi;

    if (unit == 'cm') {
        return Math.round(inches * 2.54);
    }
    else if (unit == 'mm') {
        return Math.round(inches * 25.4);
    }
    else {
        return Math.round(inches);
    }

}

export { pixelToUnit }    

const formatPrice = (price, priceFormatOpts = {}) => {
    
    if (!isNaN(price) && typeof priceFormatOpts === 'object') {

        const thousandSep = priceFormatOpts.thousandSep || ',';
        const decimalSep = priceFormatOpts.decimalSep || '.';

        let splitPrice = price.toString().split('.'),
            absPrice = splitPrice[0],
            decimalPrice = splitPrice[1],
            tempAbsPrice = '';

        if (typeof absPrice != 'undefined') {

            for (var i = absPrice.length - 1; i >= 0; i--) {
                tempAbsPrice += absPrice.charAt(i);
            }

            tempAbsPrice = tempAbsPrice.replace(/(\d{3})/g, "$1" + thousandSep);
            if (tempAbsPrice.slice(-thousandSep.length) == thousandSep) {
                tempAbsPrice = tempAbsPrice.slice(0, -thousandSep.length);
            }

            absPrice = '';
            for (var i = tempAbsPrice.length - 1; i >= 0; i--) {
                absPrice += tempAbsPrice.charAt(i);
            }

            if (typeof decimalPrice != 'undefined' && decimalPrice.length > 0) {
                //if only one decimal digit add zero at end
                if (decimalPrice.length == 1) {
                    decimalPrice += '0';
                }
                absPrice += decimalSep + decimalPrice;
            }

        }

        const currency = priceFormatOpts.currency || '&#36;%d';

        absPrice = currency.replace('%d', absPrice.toString());

        return absPrice;

    }

    return price;

}

export { formatPrice }

const showModal = ((...args) => {   
    Modal(...args);
});

export { showModal }

const showMessage = ((...args) => {   
    Snackbar(...args);
});
export { showMessage }

if (typeof window !== 'undefined') {
    
    /**
     * A class with some static helper functions. You do not need to initiate the class, just call the methods directly, e.g. FPDUtil.showModal();
     *
     * @class FPDUtils
     */
    window.FPDUtils = {};

    /**
	 * Displays a modal dialog.
	 *
	 * @method showModal
	 * @param {String} htmlContent The html content for the modal.
     * @param {Boolean} [fullscreen=false] Displays the modal in full screen.
     * @param {String} [type=''] Empty, 'prompt' or 'confirm'.
     * @param {HTMLElement} [container=document.body] The container for the modal.
	 * @static
	 */
    window.FPDUtils.showModal = showModal

    /**
	 * Displays a message in a snackbar (bottom-left).
	 *
	 * @method showMessage
	 * @param {String} text The text for the message.
     * @param {Boolean} [autoRemove=true] Either to remove the message automatcially or not.
	 * @static
	 */
    window.FPDUtils.showMessage = showMessage
        
    /**
     * Checks if a string is an URL.
     *
     * @method isUrl
     * @param {String} s The string.
     * @return {Boolean} Returns true if string is an URL.
     * @static
     */
    window.FPDUtils.isUrl = isUrl;

    /**
     * Converts a pixel value to any metric value considering the DPI.
     *
     * @method pixelToUnit
     * @param {Number} pixel The pixel value.
     * @param {String} [unit='inch'] Target metric - 'inch', 'mm', 'cm'.
     * @param {Number} [dpi=72] Target DPI.
     * @return {Boolean} Returns the pixel value.
     * @static
     */
    window.FPDUtils.pixelToUnit = pixelToUnit;

    /**
     * Converts a metric value to pixel considering the DPI.
     *
     * @method unitToPixel
     * @param {Number} pixel The pixel value.
     * @param {String} [unit='inch'] Target metric - 'inch', 'mm', 'cm'.
     * @param {Number} [dpi=72] Target DPI.
     * @return {Boolean} Returns the metric value.
     * @static
     */
    window.FPDUtils.unitToPixel = unitToPixel;

}

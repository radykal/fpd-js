/**
 * Returns a simpler type of a fabric object.
 *
 * @method getType
 * @param {String} fabricType The fabricjs type.
 * @return {String} This could be image or text.
 * @static
 */
const getType = (fabricType) => {

    if(fabricType === 'text' || fabricType === 'i-text' || fabricType === 'curvedText' || fabricType === 'textbox') {
        return 'text';
    }
    else {
        return 'image';
    }

}

export { getType }

/**
 * Checks if an image can be colorized and returns the image type
 *
 * @method elementIsColorizable
 * @param {fabric.Object} element The target element.
 * @return {String | Boolean} Returns the element type(text, dataurl, png or svg) or false if the element can not be colorized.
 * @static
 */
const elementIsColorizable = (element) => {

    if(getType(element.type) === 'text') {
        return 'text';
    }

    if(!element.source) {
        return false;
    }

    //check if url is a png or base64 encoded
    var imageParts = element.source.split('.');
    //its base64 encoded
    if(imageParts.length == 1) {

        //check if dataurl is png
        if(imageParts[0].search('data:image/png;') == -1) {
            element.fill = element.colors = false;
            return false;
        }
        else {
            return 'dataurl';
        }

    }
    //its a url
    else {

        var source = element.source;

        source = source.split('?')[0];//remove all url parameters
        imageParts = source.split('.');

        //only png and svg are colorizable
        if(!imageParts.includes('png') && !FPDUtil.isSVG(element)) {
            element.fill = element.colors = false;
            return false;
        }
        else {
            if(FPDUtil.isSVG(element)) {
                return 'svg';
            }
            else {
                return 'png';
            }
        }

    }

}

export { elementIsColorizable };

/**
 * Returns the scale value calculated with the passed image dimensions and the defined "resize-to" dimensions.
 *
 * @method getScalingByDimesions
 * @param {Number} imgW The width of the image.
 * @param {Number} imgH The height of the image.
 * @param {Number} resizeToW The maximum width for the image.
 * @param {Number} resizeToH The maximum height for the image.
 * @return {Number} The scale value to resize an image to a desired dimension.
  * @static
 */
const getScalingByDimesions = (imgW, imgH, resizeToW, resizeToH, mode='fit') => {

    resizeToW = typeof resizeToW !== 'number' ? 0 : resizeToW;
    resizeToH = typeof resizeToH !== 'number' ? 0 : resizeToH;

    let scaling = 1,
        rwSet = resizeToW !== 0,
        rhSet = resizeToH !== 0;

    if(mode === 'cover') { //cover whole area

        var dW = resizeToW - imgW,
            dH =  resizeToH - imgH;

        if (dW < dH) { //scale width
            scaling = rwSet ? Math.max(resizeToW / imgW,  resizeToH / imgH) : 1;
        }
        else { //scale height
              scaling = rhSet ? Math.max(resizeToW / imgW,  resizeToH / imgH) : 1;
        }

    }
    else { //fit into area

        if(imgW > imgH) {
            scaling = rwSet ? Math.min(resizeToW / imgW,  resizeToH / imgH) : 1;
        }
        else {
            scaling = rhSet ? Math.min(resizeToW / imgW,  resizeToH / imgH) : 1;
        }

    }

    return parseFloat(scaling.toFixed(10));

}

export { getScalingByDimesions };

const elementIsEditable = (element) => {

    return element &&
        (typeof element.colors === 'object' ||
        element.colors === true ||
        element.colors == 1 ||
        element.removable ||
        element.draggable ||
        element.resizable ||
        element.rotatable ||
        element.zChangeable ||
        element.advancedEditing ||
        element.editable ||
        element.uploadZone ||
        (element.colorLinkGroup && element.colorLinkGroup.length > 0) ||
        element.__editorMode
        );


}

export { elementIsEditable };
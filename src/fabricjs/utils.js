

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



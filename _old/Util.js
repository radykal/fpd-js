
/**
 * A class with some static helper functions. You do not need to initiate the class, just call the methods directly, e.g. FPDUtil.isIE();
 *
 * @class FPDUtil
 */
var FPDUtil =  {	
	
	/**
	 * Adds a thousand separator and returns it.
	 *
	 * @method addThousandSep
	 * @param {Number} n A numeric value.
	 * @return {String} Returns a string.
	 * @static
	 */
	addThousandSep : function(n){

	    var rx=  /(\d+)(\d{3})/;
	    return String(n).replace(/^\d+/, function(w){
	        while(rx.test(w)){
	            w= w.replace(rx, '$1'+thousandSeparator+'$2');
	        }
	        return w;
	    });

	},

	getFilter : function(type, opts) {

		if(typeof type !== 'string') {
			return null;
		}

		opts = opts === undefined ? {} : opts;
		type = type.toLowerCase();

		if(FPDFilters[type] && FPDFilters[type].array) {
			return new fabric.Image.filters.ColorMatrix({
				matrix: FPDFilters[type].array,
			});
		}

		switch(type) {
			case 'grayscale':
				return new fabric.Image.filters.Grayscale();
			break;
			case 'sepia':
				return new fabric.Image.filters.Sepia();
			break;
			case 'sepia2':
				return new fabric.Image.filters.Sepia2();
			break;
			case 'brightness':
				return new fabric.Image.filters.Brightness(opts);
			break;
			case 'contrast':
				return new fabric.Image.filters.Contrast(opts);
			break;
			case 'removewhite':
				return new fabric.Image.filters.RemoveColor(opts);
			break;
		}

		return null;

	},

    getDataUriSize : function(dataURL, unit) {

	    unit = unit === undefined ? 'mb' : unit;

	    var base64String = dataURL.split(",")[1];
		var stringLength = base64String.length;
		var sizeInBytes = 4 * Math.ceil((stringLength / 3))*0.5624896334383812;

		if(unit == 'byte') {
			return sizeInBytes;
		}
		else if(unit == 'kb') {
			return sizeInBytes/1000;
		}
		else {
			return sizeInBytes/1000000;
		}

    },

	/**
	 * Changes the DPI of a base64 image.
	 *
	 * @method changeBase64DPI
	 * @param {dataURI} string A base64 data uri representing the image(png or jpeg).
	 * @param {dpi} number The target DPI.
	 * @return {String} Returns the base64 image with the new DPI.
	 * @static
	 */
    changeBase64DPI : function(dataURI, dpi) {

	    dpi = dpi === undefined ? 72 : dpi;

	    return dpi == 72 ? dataURI : changeDpiDataUrl(dataURI, dpi);

    }

};

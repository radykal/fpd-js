var FPDPathGroupName = fabric.version === '1.6.7' ? 'path-group' : 'group';

/**
 * A class with some static helper functions. You do not need to initiate the class, just call the methods directly, e.g. FPDUtil.isIE();
 *
 * @class FPDUtil
 */
var FPDUtil =  {


	

	/**
	 * Looks for the .fpd-tooltip classes and adds a nice tooltip to these elements (tooltipster).
	 *
	 * @method updateTooltip
	 * @param {jQuery} [$container] The container to look in. If not set, the whole document will be searched.
	 * @static
	 */
	updateTooltip : function($container) {

		var $tooltips = $container ? $container.find('.fpd-tooltip') : jQuery('.fpd-tooltip');

		$tooltips.each(function(i, tooltip) {

			var $tooltip = jQuery(tooltip);
			if($tooltip.hasClass('tooltipstered')) {
				$tooltip.tooltipster('reposition');
			}
			else {
				$tooltip.tooltipster({
					offsetY: 0,
					position: 'bottom',
					theme: '.fpd-tooltip-theme',
					touchDevices: false
				});
			}

		});

	},

	/**
	 * Makes an unique array.
	 *
	 * @method arrayUnique
	 * @param {Array} array The target array.
	 * @return {Array} Returns the edited array.
	 * @static
	 */
	arrayUnique : function(array) {

	    var a = array.concat();
	    for(var i=0; i<a.length; ++i) {
	        for(var j=i+1; j<a.length; ++j) {
	            if(a[i] === a[j])
	                a.splice(j--, 1);
	        }
	    }

	    return a;
	},	


	/**
	 * Parses the fabricjs options to a FPD options object.
	 *
	 * @method parseFabricObjectToFPDElement
	 * @param {Object} object The target fabricjs object.
	 * @return {Object} Returns the FPD object.
	 * @static
	 */
	parseFabricObjectToFPDElement : function(object) {

		if(!object) { return {}; }

		var options = new FancyProductDesignerOptions(),
			properties = Object.keys(options.defaults.elementParameters),
			additionalKeys  = FPDUtil.getType(object.type) === 'text' ? Object.keys(options.defaults.textParameters) : Object.keys(options.defaults.imageParameters);

		properties = jQuery.merge(properties, additionalKeys);

		var parameters = {};
		for(var i=0; i < properties.length; ++i) {
			var prop = properties[i];
			if(object[prop] !== undefined) {
				parameters[prop] = object[prop];
			}

		}

		return {
			type: FPDUtil.getType(object.type), //type
			source: object.source, //source
			title: object.title,  //title
			parameters: parameters  //parameters
		};

	},

	/**
	 * If pop-up blocker is enabled, the user will get a notification modal.
	 *
	 * @method popupBlockerAlert
	 * @param {window} popup The target popup window.
	 * @static
	 */
	popupBlockerAlert : function(popup, fpdInstance) {

		if (popup == null || typeof(popup)=='undefined') {
			FPDUtil.showModal(fpdInstance.getTranslation('misc', 'popup_blocker_alert'));
		}

	},

	

	/**
	 * Checks if an element has a color selection.
	 *
	 * @method elementHasColorSelection
	 * @param {fabric.Object} element The target element.
	 * @return {Boolean} Returns true if element has colors.
	 * @static
	 */
	elementHasColorSelection : function(element) {

		return (Array.isArray(element.colors) || Boolean(element.colors) || element.colorLinkGroup || element.__editorMode) && FPDUtil.elementIsColorizable(element) !== false;

	},

	/**
	 * Returns the available colors of an element.
	 *
	 * @method elementAvailableColors
	 * @param {fabric.Object} element The target element.
	 * @param {FancyProductDesigner} fpdInstance Instance of FancyProductDesigner.
	 * @return {Array} Available colors.
	 * @static
	 */
	elementAvailableColors : function(element, fpdInstance) {

		var availableColors = [];
		if(element.type == FPDPathGroupName) {

			var paths = element.getObjects();
			if(paths.length === 1) {
				availableColors = element.colors;
			}
			else {
				availableColors = [];
				for(var i=0; i < paths.length; ++i) {
					var path = paths[i],
						color = tinycolor(path.fill);
					availableColors.push(color.toHexString());
				}
			}

		}
		else if(element.colorLinkGroup && fpdInstance.colorLinkGroups[element.colorLinkGroup]) {
			availableColors = fpdInstance.colorLinkGroups[element.colorLinkGroup].colors;
		}
		else {
			availableColors = element.colors;
		}

		return availableColors;

	},

	/**
	 * Changes a single path color by index.
	 *
	 * @method changePathColor
	 * @param {fabric.Object} element The target element.
	 * @param {Number} index The path index.
	 * @param {String} color Hexadecimal color value.
	 * @return {Array} All colors used in the SVG.
	 * @static
	 */
	changePathColor : function(element, index, color) {

		var svgColors = [],
			paths = element.getObjects();

		for(var i=0; i < paths.length; ++i) {

			var path = paths[i],
				c = tinycolor(path.fill);

			svgColors.push(c.toHexString());
		}

		svgColors[index] = typeof color === 'string' ? color : color.toHexString();

		return svgColors;

	},

	/**
	 * Checks if a string is a valid hexadecimal color value.
	 *
	 * @method isHex
	 * @param {String} value The target value.
	 * @return {Boolean} Returns true if value is a valid hexadecimal color.
	 * @static
	 */
	isHex : function(value) {
		return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);
	},

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

	spectrumColorNames : function($spContainer, fpdInstance) {

		$spContainer.find('.sp-palette-container .sp-thumb-el').each(function(i, ci) {

			var color = ci.title,
				colorName = fpdInstance.mainOptions.hexNames[color.replace('#', '').toLowerCase()];

			jQuery(ci).attr('title', colorName ? colorName : color).addClass('fpd-tooltip');

			FPDUtil.updateTooltip($spContainer);

		});

	},

	getDeviceByScreenSize : function() {

		var windowWidth = jQuery(window).width();
		if(windowWidth < 568) {
			return 'smartphone';
		}
		else if(windowWidth > 568 && windowWidth <= 768) {
			return 'tablet';
		}
		else {
			return 'desktop'
		}

	},

	hexToRgb : function(hex) {

	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;

	},

	unitToPixel : function(length, unit, dpi) {

		dpi = dpi === undefined ? 72 : dpi;

		var ppi = length * dpi;

		if(unit == 'cm') {
			return Math.round(ppi / 2.54);
		}
		else if(unit == 'mm') {
			return Math.round(ppi / 25.4);
		}
		else {
			return Math.round(ppi);
		}

	},

	pixelToUnit : function(pixel, unit, dpi) {

		dpi = dpi === undefined ? 72 : dpi;

		var inches = pixel / dpi;

		if(unit == 'cm') {
			return Math.round(inches * 2.54);
		}
		else if(unit == 'mm') {
			return Math.round(inches * 25.4);
		}
		else {
			return Math.round(inches);
		}

	},

	isSVG : function(element) {

		return element !== null && (element.type === FPDPathGroupName || element.d !== undefined || (element.source && jQuery.inArray('svg', element.source.split('.')) !== -1));

	},

	inRange: function (val1, val2, tolerance) {

		tolerance = tolerance === undefined ? 10 : tolerance;

		return Math.abs(val1 - val2) < tolerance;

    },

    

    setItemPrice: function($item, fpdInstance) {

	    if(!fpdInstance.currentViewInstance)
	    	return;

	    var currentViewOptions = fpdInstance.currentViewInstance.options,
	    	price = null;

	    if(fpdInstance.currentViewInstance && fpdInstance.currentViewInstance.currentUploadZone
			&& $item.parents('.fpd-upload-zone-adds-panel').length > 0) {

			var uploadZone = fpdInstance.currentViewInstance.getUploadZone(fpdInstance.currentViewInstance.currentUploadZone);
			if(uploadZone && uploadZone.price) {
				price = uploadZone.price;
			}

		}

    },

    getBgCssFromElement: function(element) {

	    var currentFill = element.fill;

	    //fill: hex
		if(typeof currentFill === 'string') {
			return currentFill;
		}
		//fill: pattern or svg fill
		else if(typeof currentFill === 'object') {

			if(currentFill.source) { //pattern
				currentFill = currentFill.source.src;
				return 'url('+currentFill+')';
			}
			else { //svg has fill
				return currentFill[0];
			}

		}
		//element: svg
		else if(element.colors === true && element.type === FPDPathGroupName) {
			return tinycolor(element.getObjects()[0].fill);
		}
		//no fill, only colors set
		else if(currentFill === false && element.colors && element.colors[0]) {
			return element.colors[0];
		}

    },

    //smartphone (not tablets)
    isMobile : function() {

	    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  		return check;

    },

    convertHexToRGBA : function(hexCode, opacity) {

	    var hex = hexCode.replace('#', '');

		if (hex.length === 3) {
	    	hex = "".concat(hex[0]).concat(hex[0]).concat(hex[1]).concat(hex[1]).concat(hex[2]).concat(hex[2]);
		}

		var r = parseInt(hex.substring(0, 2), 16);
		var g = parseInt(hex.substring(2, 4), 16);
	 	var b = parseInt(hex.substring(4, 6), 16);

	 	return "rgba(".concat(r, ",").concat(g, ",").concat(b, ",").concat(opacity / 100, ")");

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


var FPDEmojisRegex = /(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F/g;
import '/src/fabricjs/Canvas';
import Modal from '/src/ui/view/comps/Modal';

import { 
    deepMerge,
    objectHasKeys
} from '/src/helpers/utils';

import { parseFontsToEmbed } from '/src/helpers/fonts-loader';

/**
 * Creates a new FancyProductDesigner.
 *
 * @class FancyProductDesigner
 * @param  {HTMLElement} elem - The container for the Fancy Product Designer.
 * @param  {Object} [opts={}] - {@link Options Options for configuration}.
 */
export default class FancyProductDesignerView extends EventTarget {
    
    /**
     * Relevant options for the view.
     *
     * @type Array
     * @static
     * @instance
     * @memberof FancyProductDesigner
     */
    static relevantOptions = [
        'stageWidth',
        'stageHeight',
        'selectedColor',
        'boundingBoxColor',
        'outOfBoundaryColor',
        'cornerIconColor',
        'customAdds',
        'elementParameters',
        'imageParameters',
        'textParameters',
        'customImageParameters',
        'customTextParameters',
        'maxPrice',
        'optionalView',
        'designCategories',
        'printingBox',
        'output',
        'layouts',
        'usePrintingBoxAsBounding',
        'threeJsPreviewModel',
        'editorMode',
        'imageLoadTimestamp',
        'fitImagesInCanvas',
        'inCanvasTextEditing',
        'applyFillWhenReplacing',
        'disableTextEmojis',
        'cornerControlsStyle',
        'responsive',
        'canvasHeight',
        'maxCanvasHeight',
        'boundingBoxProps',
        'highlightEditableObjects',
        'multiSelection',
        'multiSelectionColor',
        'mobileGesturesBehaviour',
        'smartGuides',
        'snapGridSize'
    ];
    
    /**
     * The total price for the view without max. price.
     *
     * @property totalPrice
     * @type Number
     * @default 0
     */
    totalPrice = 0;
    /**
     * The total price for the view including max. price and corrert formatting.
     *
     * @property truePrice
     * @type Number
     * @default 0
     */
    truePrice = 0;
    /**
     * Additional price for the view.
     *
     * @property additionalPrice
     * @type Number
     * @default 0
     */
    additionalPrice = 0;
    viewData;
    onCreatedCallback;
    title;
    thumbnail;
    options;
    canvasElem = null;
    fabricCanvas = null;
    
    constructor(container, viewData={}, callback, fabricCanvasOptions={}) {
        
        super();
        
        this.viewData = viewData;
        this.onCreatedCallback = callback;
        this.title = viewData.title;
        this.thumbnail = viewData.thumbnail;
        this.options = viewData.options;
        
        fabric.Canvas.prototype.snapGridSize = this.options.snapGridSize;
        fabric.Canvas.prototype.snapToObjects = this.options.smartGuides;
        
        const selectedColor = this.options.selectedColor;
        fabric.Object.prototype.borderColor = selectedColor;
        fabric.Object.prototype.cornerColor = selectedColor;
        fabric.Object.prototype.cornerIconColor = this.options.cornerIconColor;
        
        fabricCanvasOptions = deepMerge({
            containerClass: 'fpd-view-stage fpd-hidden',
            selection: this.options.multiSelection,
            selectionBorderColor: this.options.multiSelectionColor,
            selectionColor: tinycolor(this.options.multiSelectionColor).setAlpha(0.1).toRgbString(),
            hoverCursor: 'pointer',
            controlsAboveOverlay: true,
            centeredScaling: true,
            allowTouchScrolling: true,
            preserveObjectStacking: true
        }, fabricCanvasOptions);        
        
        this.fabricOptions = fabricCanvasOptions;
        
        //create canvas tag for fabricjs
        this.canvasElem = document.createElement('canvas');
        container.append(this.canvasElem);
        
        this.fabricCanvas = new fabric.Canvas(this.canvasElem, fabricCanvasOptions);
        this.fabricCanvas.viewOptions = this.options;
        this.fabricCanvas.setDimensions({
            width: this.options.stageWidth, 
            height: this.options.stageHeight
        });
        
        this.fabricCanvas.on({
            'imageFail': ({url}) => {
                
                Modal(`
                    <p>The image with the URL<br /><i style='font-size: 10px;'>${url}</i><br />can not be loaded into the canvas.</p>
                    <p><b>Troubleshooting</b>
                        <ul>
                            <li>The URL is not correct!</li>
                            <li>The image has been blocked by <a href='https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS' target='_blank'>CORS policy</a>. You need to host the image under the same protocol and domain or enable 'Access-Control-Allow-Origin' on the server where you host the image. <a href='http://enable-cors.org/' target='_blank'>Read more about it here.</a><
                            /li>
                        </ul>
                    </p>
                `);
    
            }
        });
                
    }
    
    /**
     * This method needs to be called after the instance of {{#crossLink "FancyProductDesignerView"}}{{/crossLink}} is set.
     *
     * @method init
     */
    init() {
        
        this.loadElements(this.viewData.elements, this.#afterSetup.bind(this));
    
    };
    
    /**
     * Removes the current elements and loads a set of new elements into the view.
     *
     * @param {Array} elements An array containing elements.
     * @param {Function} callback A function that will be called when all elements have beed added.
     * @method loadElements
     */
    loadElements(elements, callback) {
    
        if(this.fabricCanvas.initialElementsLoaded) {
            this.fabricCanvas.reset(false);
        }
        
        this.fabricCanvas.offHistory();
        this.fabricCanvas.addElements(elements, callback);
    
    }
    
    #afterSetup() {

        this.onCreatedCallback(this);  
        
        this.dispatchEvent(
            new CustomEvent('priceChange', {
                detail: {
                    elementPrice: 0,
                    truePrice: this.truePrice
                }
            })
        );
    
    }

    /**
	 * Creates a data URL of the view.
	 *
	 * @method toDataURL
	 * @param {Function} callback A function that will be called when the data URL is created. The function receives the data URL.
	 * @param {String} [backgroundColor=transparent] The background color as hexadecimal value. For 'png' you can also use 'transparent'.
	 * @param {Object} [options] See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toDataURL.
	 * @param {Boolean} [options.onlyExportable=false] If true elements with excludeFromExport=true are not exported in the image.
	 * @param {fabric.Image} [watermarkImg=null] A fabricJS image that includes the watermark image.
	 * @param {Boolean} [deselectElement=true] Deselect current selected element.
	 */
	toDataURL(callback, backgroundColor='transparent', options={}, watermarkImg=null, deselectElement=true) {

		callback = callback === undefined ? function() {} : callback;
		options.onlyExportable = options.onlyExportable === undefined ? false : options.onlyExportable;
		options.multiplier = options.multiplier === undefined ? 1 : options.multiplier;
		options.enableRetinaScaling = options.enableRetinaScaling === undefined ? false : options.enableRetinaScaling;

		let hiddenObjs = [],
			tempHighlightEditableObjects = this.options.highlightEditableObjects;

		this.options.highlightEditableObjects = 'transparent';
		this.fabricCanvas.getObjects().forEach((obj) => {

			if(obj.excludeFromExport && options.onlyExportable) {

				obj.visible = false;
				hiddenObjs.push(obj);

			}

		});

		if(deselectElement) {
			this.fabricCanvas.deselectElement();
		}

		let tempDevicePixelRatio = fabric.devicePixelRatio;
		fabric.devicePixelRatio = 1;

		this.fabricCanvas.setDimensions({width: this.options.stageWidth, height: this.options.stageHeight}).setZoom(1);

		//scale view mask to multiplier
        //todo
		// if(this.fabricCanvas.maskObject && this.fabricCanvas.maskObject._originParams) {
		// 	instance.maskObject.left = instance.maskObject._originParams.left * options.multiplier;
		// 	instance.maskObject.top = instance.maskObject._originParams.top * options.multiplier;
		// 	instance.maskObject.scaleX = instance.maskObject._originParams.scaleX * options.multiplier;
		// 	instance.maskObject.scaleY = instance.maskObject._originParams.scaleY * options.multiplier;
		// 	instance.maskObject.setCoords();
		// }

		this.fabricCanvas.setBackgroundColor(backgroundColor, () => {

			if(watermarkImg) {
				this.fabricCanvas.add(watermarkImg);
				watermarkImg.center();
				watermarkImg.bringToFront();
			}

			//get data url
			callback(this.fabricCanvas.toDataURL(options));

			if(watermarkImg) {
				this.fabricCanvas.remove(watermarkImg);
			}

			if(this.fabricCanvas.wrapperEl.offsetParent) {
				this.fabricCanvas.resetSize();
			}

			this.fabricCanvas.setBackgroundColor('transparent', () => {
				this.fabricCanvas.renderAll();
			});

			for(var i=0; i<hiddenObjs.length; ++i) {
				hiddenObjs[i].visible = true;
			}

			this.fabricCanvas.renderAll();

			fabric.devicePixelRatio = tempDevicePixelRatio;
			this.options.highlightEditableObjects = tempHighlightEditableObjects;

		});

	}

    /**
	 * Returns the view as SVG.
	 *
	 * @method toSVG
	 * @param {Object} options See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toSVG
	 * @param {Function} reviver See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toSVG
	 * @param {Boolean} respectPrintingBox Only generate SVG from printing box
	 * @param {fabric.Image} [watermarkImg=null] A fabricJS image that includes the watermark image.
	 * @param {Array} [fontsToEmbed=[]] Aan array containing fonts to embed in the SVG. You can use <a href="https://jquerydoc.fancyproductdesigner.com/classes/FancyProductDesigner.html#method_getUsedColors" target="_blank">getUsedFonts method</a>
	 * @return {String} A XML representing a SVG.
	 */
	toSVG(options={}, reviver, respectPrintingBox=false, watermarkImg=null, fontsToEmbed=[]) {

		let svg;

        this.fabricCanvas.deselectElement();
        
		if(respectPrintingBox && objectHasKeys(this.options.printingBox, ['left','top','width','height'])) {

			let offsetX = 0,
				offsetY = 0;

			if(objectHasKeys(this.options.output, ['bleed', 'width', 'height'])) {
				offsetX = (this.options.output.bleed / this.options.output.width) * this.options.printingBox.width,
				offsetY = (this.options.output.bleed / this.options.output.height) * this.options.printingBox.height;
			}

			options.viewBox = {
				x: this.options.printingBox.left - offsetX,
				y: this.options.printingBox.top - offsetY,
				width: this.options.printingBox.width + (offsetX * 2),
				height: this.options.printingBox.height  + (offsetY * 2)
			};

			this.fabricCanvas.setDimensions({
                width: this.options.printingBox.width, 
                height: this.options.printingBox.height
            })
            .setZoom(1);
		}
		else {

			this.fabricCanvas.setDimensions({
                width: this.options.stageWidth, 
                height: this.options.stageHeight
            }).setZoom(1);

		}

		//remove background, otherwise unneeeded rect is added in the svg
		let tempCanvasBackground = this.fabricCanvas['backgroundColor'];
		if(tempCanvasBackground == 'transparent') {
			this.fabricCanvas['backgroundColor'] = false;
		}

		if(watermarkImg) {
			this.fabricCanvas.add(watermarkImg);
			watermarkImg.center();
			watermarkImg.bringToFront();
		}

		svg = this.fabricCanvas.toSVG(options, reviver);

		if(watermarkImg) {
			this.fabricCanvas.remove(watermarkImg);
		}

		this.fabricCanvas['backgroundColor'] = tempCanvasBackground;

        if(this.fabricCanvas.wrapperEl.offsetParent) {
            this.fabricCanvas.resetSize();
        }

        const tempSVG = document.createElement('div');
        tempSVG.innerHTML = svg;

        const defsTag = tempSVG.querySelector('defs');

        const clipPaths = tempSVG.querySelectorAll('clipPath');
        // Move each clipPath to the defs element
        clipPaths.forEach(clipPath => {
            defsTag.appendChild(clipPath);
        });

        const styleTag = document.createElement('style');

        let googleFontsUrl = '',
            customFontsStr = '';

        fontsToEmbed.forEach((fontItem) => {

            if(fontItem.hasOwnProperty('url')) {

                if(fontItem.url == 'google') {
                    googleFontsUrl += fontItem.name.replace(/\s/g, "+") + ':ital,wght@0,400;0,700;1,700&';
                }
                else {
                    customFontsStr += parseFontsToEmbed(fontItem);
                }

            }
        })

        if(googleFontsUrl.length > 0) {

            styleTag.insertAdjacentHTML(
                'beforeend', 
                '@import url("https://fonts.googleapis.com/css2?family='+googleFontsUrl.replace(/&/g, "&amp;")+'display=swap");'
            )
        }

        if(customFontsStr.length > 0) {

            styleTag.insertAdjacentHTML(
                'beforeend', 
                customFontsStr
            )
        }

        defsTag.appendChild(styleTag);

        let svgString = tempSVG.innerHTML;

		svgString = svgString
			//replace all newlines
			.replace(/(?:\r\n|\r|\n)/g, '')

		return svgString;

	}
    
}

window.FancyProductDesigner = FancyProductDesignerView;
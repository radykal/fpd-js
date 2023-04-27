import '/src/fabricjs/Canvas';
import Modal from '/src/ui/view/comps/Modal';

import { 
    deepMerge
} from '/src/helpers/utils';

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
        'multiSelectionColor'
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

        let modifiedType = null;
        this.fabricCanvas.on({
            'mouse:up': (opts) => {
                
                //todo
                //$productStage.siblings('.fpd-snap-line-v, .fpd-snap-line-h').hide();
    
            },
            'object:moving': opts => {
    
                modifiedType = 'moving';
    
                if(!opts.target.lockMovementX || !opts.target.lockMovementY) {
    
                    //todo
                    //_snapToGrid(opts.target);
    
                    if(this.options.smartGuides) {
                        //todo
                        //_smartGuides(opts.target);
                    }
    
                }
    
            },
            'object:modified': opts => {
                
                //todo: add these lines in canvas if possible
                const element = opts.target;
    
                if(modifiedType !== null) {
    
                    let modifiedParameters = {};
    
                    switch(modifiedType) {
                        case 'moving':
                            modifiedParameters.left = Number(element.left);
                            modifiedParameters.top = Number(element.top);
                        break;
                        case 'scaling':
                            if(element.getType() === 'text' && element.type !== 'curvedText' && !element.uniScalingUnlockable) {
                                modifiedParameters.fontSize = parseInt(element.fontSize);
                            }
                            else {
                                modifiedParameters.scaleX = parseFloat(element.scaleX);
                                modifiedParameters.scaleY = parseFloat(element.scaleY);
                            }
                        break;
                        case 'rotating':
                            modifiedParameters.angle = element.angle;
                        break;
                    }
    
                    /**
                     * Gets fired when an element is modified.
                     *
                     * @event FancyProductDesignerView#elementModify
                     * @param {Event} event
                     * @param {fabric.Object} element - The fabricJS object.
                     * @param {Object} modifiedParameters - The modified parameters.
                     */                    
                    this.dispatchEvent(
                        new CustomEvent('elementModify', {
                            detail: {
                                element: element,
                                properties: modifiedParameters
                            }
                        })
                    );
                }
    
                modifiedType = null;
    
            }
        });    
        
        this.dispatchEvent(
            new CustomEvent('priceChange', {
                detail: {
                    elementPrice: 0,
                    truePrice: this.truePrice
                }
            })
        );
    
    }
    
}

window.FancyProductDesigner = FancyProductDesignerView;
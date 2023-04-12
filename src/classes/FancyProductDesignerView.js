import Modal from '/src/ui/view/comps/Modal';
import Canvas from '/src/fabricjs/Canvas';

import { 
    addEvents,
    isPlainObject,
    deepMerge,
    objectHasKeys,
    isUrl,
    isZero,
    isEmpty
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
     * @default ['stageWidth',
        'stageHeight',
        'customAdds',
        'customImageParameters',
        'customTextParameters',
        'maxPrice',
        'optionalView',
        'designCategories',
        'printingBox',
        'output',
        'layouts',
        'usePrintingBoxAsBounding']
     * @instance
     * @memberof FancyProductDesigner
     */
    static relevantOptions = [
        'stageWidth',
        'stageHeight',
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
        '_loadFromScript',
        'fitImagesInCanvas',
        'setTextboxWidth',
        'inCanvasTextEditing',
        'applyFillWhenReplacing',
        'disableTextEmojis',
        'cornerControlsStyle',
        'responsive',
        'maxCanvasHeight'
    ];
    
    viewData;
    onCreatedCallback;
    title;
    thumbnail;
    options;
    fpdCanvas = null;
    canvasElem = null;
    fabricCanvas = null;
    responsiveScale = 1;
    
    constructor(container, viewData={}, callback, fabricCanvasOptions={}) {
        
        super();
        
        this.viewData = viewData;
        this.onCreatedCallback = callback;
        this.title = viewData.title;
        this.thumbnail = viewData.thumbnail;
        this.options = viewData.options;
        
        const selectionColor = 'rgba(84,223,230,1.00)';
        const canvasOptions = deepMerge({
            containerClass: 'fpd-view-stage fpd-hidden',
            selection: this.options.multiSelection,
            selectionBorderColor: selectionColor,
            selectionColor: selectionColor,
            hoverCursor: 'pointer',
            controlsAboveOverlay: true,
            centeredScaling: true,
            allowTouchScrolling: true,
            preserveObjectStacking: true
        }, fabricCanvasOptions);
        
        
        this.fpdCanvas = new Canvas(container, canvasOptions, this.options);
        
        addEvents(
            this.fpdCanvas,
            'imageFail',
            (evt) => {

                Modal(`
                    <p>The image with the URL<br /><i style='font-size: 10px;'>${evt.detail.url}</i><br />can not be loaded into the canvas.</p>
                    <p><b>Troubleshooting</b>
                        <ul>
                            <li>The URL is not correct!</li>
                            <li>The image has been blocked by <a href='https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS' target='_blank'>CORS policy</a>. You need to host the image under the same protocol and domain or enable 'Access-Control-Allow-Origin' on the server where you host the image. <a href='http://enable-cors.org/' target='_blank'>Read more about it here.</a><
                            /li>
                        </ul>
                    </p>
                `);
            }
        )
        
        //todo: maybe remove these 2 lines
        this.canvasElem = this.fpdCanvas.canvasElem;
        this.fabricCanvas = this.fpdCanvas.fabricCanvas;
                
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
    
        if(this.fpdCanvas.initialElementsLoaded) {
            this.fpdCanvas.reset(false);
        }
        
        this.fpdCanvas.addElements(elements, callback);
    
    }
    
    /**
     * Resizes the canvas responsive.
     *
     * @method resetCanvasSize
     */
    resetSize() {
        
        const viewStage = this.fabricCanvas.wrapperEl;
        const viewStageWidth = viewStage.clientWidth;
        
        this.responsiveScale = viewStageWidth < this.options.stageWidth ? viewStageWidth / this.options.stageWidth : 1;
        
        if(!isNaN(this.options.maxCanvasHeight) && this.options.maxCanvasHeight !== 1) {
        
            const maxHeight = window.innerHeight * parseFloat(this.options.maxCanvasHeight);
            if(this.options.stageHeight > this.options.stageWidth && (this.options.stageHeight * this.responsiveScale) > maxHeight) {
                this.responsiveScale = maxHeight / this.options.stageHeight;
            }
        
        }
        
        this.responsiveScale = parseFloat(Number(this.responsiveScale.toFixed(7)));
        this.responsiveScale = Math.min(this.responsiveScale, 1);
        
        if(!this.options.responsive) {
            this.responsiveScale = 1;
        }
        
        // if(!instance.options.editorMode && instance.maskObject && instance.maskObject._originParams) {
        //     instance.maskObject.left = instance.maskObject._originParams.left * instance.responsiveScale;
        //     instance.maskObject.top = instance.maskObject._originParams.top * instance.responsiveScale;
        //     instance.maskObject.scaleX = instance.maskObject._originParams.scaleX * instance.responsiveScale;
        //     instance.maskObject.scaleY = instance.maskObject._originParams.scaleY * instance.responsiveScale;
        // 
        // }
        // else if(instance.maskObject) {
        //     instance.maskObject.setCoords();
        // }
        
        
        this.fabricCanvas
        .setDimensions({
            width: viewStageWidth,
            height: this.options.stageHeight * this.responsiveScale
        })
        .setZoom(this.responsiveScale)
        .calcOffset()
        .renderAll();
        
        this.dispatchEvent(
            new CustomEvent('sizeUpdate', {
                detail: {
                }
            })
        );
        
        return this.responsiveScale;
        
    }
    
    #afterSetup() {
        
        this.onCreatedCallback(this);
        return;
        
        if(instance.options.keyboardControl) {
    
            $(document).on('keydown', function(evt) {
    
                var $target = $(evt.target);
    
                if(instance.currentElement && !$target.is('textarea,input[type="text"],input[type="number"]')) {
    
                    switch(evt.which) {
                        case 8:
                            //remove element
                            if(instance.currentElement.removable && $('.fpd-image-editor-container').length == 0) {
                                instance.removeElement(instance.currentElement);
                            }
    
                        break;
                        case 37: // left
    
                            if(instance.currentElement.draggable) {
                                instance.setElementParameters({left: instance.currentElement.left - 1});
                            }
    
                        break;
                        case 38: // up
    
                            if(instance.currentElement.draggable) {
                                instance.setElementParameters({top: instance.currentElement.top - 1});
                            }
    
                        break;
                        case 39: // right
    
                            if(instance.currentElement.draggable) {
                                instance.setElementParameters({left: instance.currentElement.left + 1});
                            }
    
                        break;
                        case 40: // down
    
                            if(instance.currentElement.draggable) {
                                instance.setElementParameters({top: instance.currentElement.top + 1});
                            }
    
                        break;
    
                        default: return; //other keys
                    }
    
                    evt.preventDefault();
    
                }
    
            });
    
        }
    
        //attach handlers to stage
        var lastTouchX,
            lastTouchY;
    
        this.fabricCanvas.on({
            'after:render': function() {
    
                if(instance.options.highlightEditableObjects.length > 3) {
    
                    instance.stage.contextContainer.strokeStyle = instance.options.highlightEditableObjects;
                    instance.stage.forEachObject(function(obj) {
    
                        if(obj !== instance.stage.getActiveObject() && !obj.isMoving
                            && ((getType(obj.type) === 'text' && obj.editable) || obj.uploadZone)) {
    
                            var bound = obj.getBoundingRect();
                            instance.stage.contextContainer.setLineDash([5, 15]);
                            instance.stage.contextContainer.strokeRect(
                                bound.left,
                                bound.top,
                                bound.width,
                                bound.height
                            );
    
                        }
                        else {
                            instance.stage.contextContainer.setLineDash([]);
                        }
    
                    });
    
                }
    
            },
            'mouse:over': function(opts) {
    
                if(instance.currentElement && instance.currentElement.draggable && opts.target === instance.currentElement) {
                    instance.stage.hoverCursor = 'move';
                }
                else {
                    instance.stage.hoverCursor = 'pointer';
                }
    
                /**
                 * Gets fired when the mouse gets over on fabricJS canvas.
                 *
                 * @event FancyProductDesignerView#canvas:mouseOver
                 * @param {Event} event
                 * @param {String} instance - The view instance.
                 * @param {Event} opts - FabricJS event options.
                 */
                $this.trigger('canvas:mouseOver', [instance, opts]);
    
            },
            'mouse:out': function(opts) {
    
                /**
                 * Gets fired when the mouse gets over on fabricJS canvas.
                 *
                 * @event FancyProductDesignerView#canvas:mouseOut
                 * @param {Event} event
                 * @param {String} instance - The view instance.
                 * @param {Event} opts - FabricJS event options.
                 */
                $this.trigger('canvas:mouseOut', [instance, opts]);
    
            },
            'mouse:down': function(opts) {
    
                if(opts.e.touches) {
                    lastTouchX = opts.e.touches[0].clientX;
                    lastTouchY = opts.e.touches[0].clientY;
                }
    
                mouseDownStage = true;
    
                //fix: when editing text via textarea and doing a modification via corner controls
                if(opts.target && opts.target.__corner && typeof opts.target.exitEditing === 'function') {
                    opts.target.exitEditing();
                }
    
                if(opts.target == undefined) {
                    instance.deselectElement();
                }
                else {
    
                    var targetCorner = opts.target.__corner;
    
                    //remove element
                    if(instance.options.cornerControlsStyle !== 'basic' && targetCorner == 'bl' && (opts.target.removable || instance.options.editorMode)) {
                        instance.removeElement(opts.target);
                    }
                    //copy element
                    else if(instance.options.cornerControlsStyle !== 'basic' && targetCorner == 'tl' && (opts.target.copyable || instance.options.editorMode) && !opts.target.hasUploadZone) {
    
                        instance.duplicate(opts.target);
    
                    }
                    else {
                        tempModifiedParameters = instance.getElementJSON();
                    }
    
    
                }
    
                /**
                 * Gets fired when the mouse/touch gets down on fabricJS canvas.
                 *
                 * @event FancyProductDesignerView#canvas:mouseDown
                 * @param {Event} event
                 * @param {String} instance - The view instance.
                 * @param {Event} opts - FabricJS event options.
                 */
                $this.trigger('canvas:mouseDown', [instance, opts]);
    
            },
            'mouse:up': function(opts) {
    
                $productStage.siblings('.fpd-snap-line-v, .fpd-snap-line-h').hide();
    
                mouseDownStage = false;
    
                /**
                 * Gets fired when the mouse/touch gets up on fabricJS canvas.
                 *
                 * @event FancyProductDesignerView#canvas:mouseUp
                 * @param {Event} event
                 * @param {String} instance - The view instance.
                 * @param {Event} opts - FabricJS event options.
                 */
                $this.trigger('canvas:mouseUp', [instance, opts]);
    
            },
            'mouse:move': function(opts) {
    
                if(mouseDownStage && instance.dragStage) {
    
                    //mobile fix: touch pan
                    if(opts.e.touches) {
                        var currentTouchX = opts.e.touches[0].clientX,
                            currentTouchY = opts.e.touches[0].clientY;
                    }
    
                    instance.stage.relativePan(new fabric.Point(
                        opts.e.touches ? (currentTouchX - lastTouchX) : opts.e.movementX,
                        opts.e.touches ? (currentTouchY - lastTouchY) : opts.e.movementY
                    ));
    
                    //mobile fix: touch pan
                    if(opts.e.touches) {
                        lastTouchX = currentTouchX;
                        lastTouchY = currentTouchY;
                    }
    
                }
    
                /**
                 * Gets fired when the mouse/touch is moving on fabricJS canvas.
                 *
                 * @event FancyProductDesignerView#canvas:mouseMove
                 * @param {Event} event
                 * @param {String} instance - The view instance.
                 * @param {Event} opts - FabricJS event options.
                 */
                $this.trigger('canvas:mouseMove', [instance, opts]);
    
            },
            'text:editing:entered': function(opts) {
                $this.trigger('textEditEnter', [opts.target]);
            },
            'text:changed': function(opts) {
    
                instance.setElementParameters({text: opts.target.text});
                $this.trigger('textChange', [opts.target]);
    
            },
            'text:editing:exited':  function(opts) {
                $this.trigger('textEditExit', [opts.target]);
            },
            'object:moving': function(opts) {
    
                modifiedType = 'moving';
    
                if(!opts.target.lockMovementX || !opts.target.lockMovementY) {
    
                    _snapToGrid(opts.target);
    
                    if(instance.options.smartGuides) {
                        _smartGuides(opts.target);
                    }
    
                }
    
                instance.stage.contextContainer.strokeStyle = '#990000';
                
                //todo
                //_checkContainment(opts.target);
    
                /**
                 * Gets fired when an element is changing via drag, resize or rotate.
                 *
                 * @event FancyProductDesignerView#elementChange
                 * @param {Event} event
                 * @param {String} modifiedType - The modified type.
                 * @param {fabric.Object} element - The fabricJS object.
                 */
                $this.trigger('elementChange', [modifiedType, opts.target]);
    
            },
            'object:scaling': function(opts) {
    
                modifiedType = 'scaling';
                _checkContainment(opts.target);
    
                $productStage.siblings('.fpd-snap-line-v, .fpd-snap-line-h').hide();
    
                $this.trigger('elementChange', [modifiedType, opts.target]);
    
            },
            'object:rotating': function(opts) {
    
                modifiedType = 'rotating';
                _checkContainment(opts.target);
    
                $this.trigger('elementChange', [modifiedType, opts.target]);
    
            },
            'object:modified': function(opts) {
    
                var element = opts.target;
    
    
                if(getType(element.type) === 'text' && element.type !== 'curvedText' && !element.uniScalingUnlockable) {
    
                    var newFontSize = opts.target.fontSize * opts.target.scaleX;
    
                    newFontSize = parseFloat(Number(newFontSize).toFixed(0));
                    element.scaleX = 1;
                    element.scaleY = 1;
                    element._clearCache();
                    element.set('fontSize', newFontSize);
                    element.fontSize = newFontSize;
    
                }
    
                if(modifiedType !== null) {
    
                    var modifiedParameters = {};
    
                    switch(modifiedType) {
                        case 'moving':
                            modifiedParameters.left = Number(element.left);
                            modifiedParameters.top = Number(element.top);
                        break;
                        case 'scaling':
                            if(getType(element.type) === 'text' && element.type !== 'curvedText' && !element.uniScalingUnlockable) {
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
                    $this.trigger('elementModify', [element, modifiedParameters]);
                }
    
                modifiedType = null;
    
            },
            'selection:updated': _elementSelect, //Fabric V2.1
            'object:selected': _elementSelect,
        });
    
        instance.stage.renderAll();
    
        //trigger price change after view has been created to get initial price
        $this.trigger('priceChange', [0, instance.truePrice]);
    
    }
    
}

window.FancyProductDesigner = FancyProductDesignerView;
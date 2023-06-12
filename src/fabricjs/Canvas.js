import './Element';
import './canvas/History';
import ZoomPan from './canvas/ZoomPan';
import Snap from './canvas/Snap';
import Ruler from './canvas/Ruler';

import {
    deepMerge,
    objectHasKeys,
    isUrl,
    isZero,
    isEmpty
} from '/src/helpers/utils';
import {
    getScaleByDimesions
} from './utils.js';


fabric.Canvas.prototype.viewOptions = {};
fabric.Canvas.prototype.elements = [];
fabric.Canvas.prototype.currentElement = null;
fabric.Canvas.prototype.responsiveScale = 1;
fabric.Canvas.prototype.currentBoundingObject = null;
fabric.Canvas.prototype.initialElementsLoaded = false;
fabric.Canvas.prototype.isCustomized = false;
fabric.Canvas.prototype.printingBoxObject = null;
fabric.Canvas.prototype._canvasCreated = false;
fabric.Canvas.prototype.currentCurvedTextPath = false;
fabric.Canvas.prototype._doHistory = false;

fabric.Canvas.prototype.initialize = (function (originalFn) {

    return function (...args) {
        originalFn.call(this, ...args);
        this._fpdCanvasInit();
        return this;
    };

})(fabric.Canvas.prototype.initialize);

fabric.Canvas.prototype._onTouchStart = (function (originalFn) {
    return function (e) {

        const target = this.findTarget(e); 
        
        if (this.allowTouchScrolling && !target && !this.isDrawingMode) { 
            return; 
        } 

        originalFn.call(this, e);
        
    };
})(fabric.Canvas.prototype._onTouchStart);

fabric.Canvas.prototype._fpdCanvasInit = function () {    

    if(this.containerClass.includes('fpd-hidden-canvas')) return;

    let modifiedType = null;    

    this.on({
        'after:render': () => {

            if (!this._canvasCreated) {
                this._onCreated();
            }
            
            if (this.viewOptions && this.viewOptions.highlightEditableObjects.length > 3) {

                this.contextContainer.strokeStyle = this.viewOptions.highlightEditableObjects;
                this.forEachObject((obj) => {

                    if (obj !== this.getActiveObject()
                        && !obj.isMoving
                        && ((obj.getType() === 'text' && obj.editable) || obj.uploadZone)
                    ) {

                        const bound = obj.getBoundingRect();
                        this.contextContainer.setLineDash([5, 15]);
                        this.contextContainer.strokeRect(
                            bound.left,
                            bound.top,
                            bound.width,
                            bound.height
                        );

                    }
                    else {
                        this.contextContainer.setLineDash([]);
                    }

                });

            }            

        },
        'object:added': ({ target }) => {
            
            this._bringToppedElementsToFront();            

        },
        'object:moving': ({ target }) => {

            modifiedType = 'moving';

            /**
             * Gets fired as soon as an element is selected.
             *
             * @event FancyProductDesignerView#elementSelect
             * @param {Event} event
             * @param {fabric.Object} currentElement - The current selected element.
             */
            this.fire('elementChange', { type: 'moving', element: target })

        },
        'object:rotating': ({ target }) => {

            modifiedType = 'rotating';

            this.fire('elementChange', { type: 'rotating', element: target })

        },
        'object:scaling': ({ target }) => {

            modifiedType = 'scaling';

            this.fire('elementChange', { type: 'scaling', element: target })

        },
        'object:modified': ({target}) => {
            
            const element = target;
            
            if(modifiedType !== null) {

                let modifiedProps = {};

                switch(modifiedType) {
                    case 'moving':
                        modifiedProps.left = Number(element.left);
                        modifiedProps.top = Number(element.top);
                    break;
                    case 'scaling':
                        if(element.getType() === 'text' 
                            && !element.curved 
                            && !element.uniScalingUnlockable
                        ) {
                            modifiedProps.fontSize = parseInt(element.fontSize);
                        }
                        else {
                            modifiedProps.scaleX = parseFloat(element.scaleX);
                            modifiedProps.scaleY = parseFloat(element.scaleY);
                        }
                    break;
                    case 'rotating':
                        modifiedProps.angle = element.angle;
                    break;
                }
                
                this.fire('elementModify', { element: element, options: modifiedProps })                
        
            }

            modifiedType = null;

        },
        'selection:created': ({ selected }) => {

            if (selected.length == 1) {
                this._onSelected(selected[0]);
            }
            else {
                this._onMultiSelected(selected);
            }

        },
        'selection:updated': ({ selected }) => {

            if (selected.length == 1) {
                this._onSelected(selected[0]);
            }
            else {
                this._onMultiSelected(selected);
            }

        },
        'selection:cleared': ({ deselected }) => {

            if (this.currentCurvedTextPath) {
                this.currentCurvedTextPath.visible = false;
                this.currentCurvedTextPath = null;
            }

        },
        'mouse:down': (opts) => {

            //fix: when editing text via textarea and doing a modification via corner controls
            if (opts.target && opts.target.__corner && typeof opts.target.exitEditing === 'function') {
                opts.target.exitEditing();
            }

            if (opts.target == undefined) {
                this.deselectElement();
            }

        },
        'elementAdd': () => {

            this.forEachObject((obj) => {

                //render clipping
                if (!obj.clipPath && ((obj.boundingBox && obj.boundingBoxMode === 'clipping') || obj.hasUploadZone)) {                                        
                    obj._clipElement();
                }

            })
    

        }
    });    
    
}

fabric.Canvas.prototype._onCreated = function () {

    this._canvasCreated = true;
    
    if(this.viewOptions.mobileGesturesBehaviour != 'none') {
        ZoomPan(this, this.viewOptions.mobileGesturesBehaviour);
    }

    Snap(this);
    Ruler(this);

    this._renderPrintingBox();

}

fabric.Canvas.prototype._onSelected = function (element) {

    this.deselectElement(false);

    //dont select anything when in dragging mode
    if (this.dragStage) {
        this.deselectElement();
        return false;
    }

    this.currentElement = element;

    if (this.currentCurvedTextPath) {
        this.currentCurvedTextPath.visible = false;
    }
    this.currentCurvedTextPath = element.path;

    if (this.currentCurvedTextPath) {
        this.currentCurvedTextPath.visible = true;
    }

    /**
     * Gets fired as soon as an element is selected.
     *
     * @event FancyProductDesignerView#elementSelect
     * @param {Event} event
     * @param {fabric.Object} currentElement - The current selected element.
     */
    this.fire('elementSelect', { element: element })

    //change cursor to move when element is draggable
    this.hoverCursor = element.draggable ? 'move' : 'pointer';

    //check for a boundingbox
    if (element.boundingBox && !element.uploadZone) {
        this._renderElementBoundingBox(element);
    }

}

fabric.Canvas.prototype._onMultiSelected = function (selectedElements) {

    const activeSelection = this.getActiveObject();

    if (this.viewOptions.multiSelection) {

        activeSelection.set({
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hasControls: false,
            borderDashArray: [8, 8],
            cornerStyle: 'circle',
            cornerSize: 16,
            transparentCorners: false,
            borderColor: this.viewOptions.multiSelectionColor,
            borderScaleFactor: 3,
        });

        selectedElements.forEach((obj) => {

            if (!obj.draggable || obj.locked) {
                activeSelection.removeWithUpdate(obj);
            }
        })

    }

}

fabric.Canvas.prototype._renderElementBoundingBox = function (element) {

    if (this.currentBoundingObject) {
        this.remove(this.currentBoundingObject);
        this.currentBoundingObject = null;
    }

    if (element) {

        var bbCoords = element.getBoundingBoxCoords();

        if (bbCoords && element.boundingBoxMode != 'none') {

            let boundingBoxProps = {
                left: bbCoords.left,
                top: bbCoords.top,
                width: bbCoords.width,
                height: bbCoords.height,
                angle: bbCoords.angle || 0,
                stroke: this.viewOptions.boundingBoxColor,
                strokeWidth: 1,
                strokeLineCap: 'square',
                strokeDashArray: [10, 10],
                fill: false,
                selectable: false,
                evented: false,
                originX: 'left',
                originY: 'top',
                name: "bounding-box",
                excludeFromExport: true,
                _ignore: true
            };

            boundingBoxProps = deepMerge(boundingBoxProps, this.viewOptions.boundingBoxProps);
            this.currentBoundingObject = new fabric.Rect(boundingBoxProps);

            this.add(this.currentBoundingObject);
            this.currentBoundingObject.bringToFront();

            /**
             * Gets fired when bounding box is toggling.
             *
             * @event FancyProductDesignerView#boundingBoxToggle
             * @param {Event} event
             * @param {fabric.Object} currentBoundingObject - The current bounding box object.
             * @param {Boolean} state
             */
            this.fire('boundingBoxToggle', {
                currentBoundingObject: this.currentBoundingObject,
                state: true
            });

        }

        element._checkContainment();

    }

}

fabric.Canvas.prototype._renderPrintingBox = function () {

    if (this.printingBoxObject) {
        this.remove(this.printingBoxObject);
        this.printingBoxObject = null;
    }

    if (objectHasKeys(this.viewOptions.printingBox, ['left', 'top', 'width', 'height'])) {

        const printingBox = new fabric.Rect({
            left: 100,
            top: 100,
            width: this.viewOptions.printingBox.width,
            height: this.viewOptions.printingBox.height,
            stroke: this.viewOptions.printingBox.visibility || this.viewOptions.editorMode ? '#db2828' : 'transparent',
            strokeWidth: 1,
            strokeLineCap: 'square',
            fill: false,
            originX: 'left',
            originY: 'top',
            name: "printing-box",
            excludeFromExport: true,
            _ignore: true
        });


        this.printingBoxObject = new fabric.Group([printingBox], {
            left: this.viewOptions.printingBox.left,
            top: this.viewOptions.printingBox.top,
            evented: false,
            resizable: true,
            uniformScaling: false,
            lockRotation: true,
            borderColor: 'transparent',
            transparentCorners: true,
            cornerColor: this.viewOptions.selectedColor,
            cornerIconColor: this.viewOptions.cornerIconColor,
            cornerSize: 24,
            originX: 'left',
            originY: 'top',
            name: "printing-boxes",
            excludeFromExport: true,
            selectable: false,
            _ignore: true
        });


        this.add(this.printingBoxObject);
        this.printingBoxObject.setCoords();
        this.renderAll();

    }

}

fabric.Canvas.prototype._bringToppedElementsToFront = function () {

    let objects = this.getObjects(),
        bringToFrontObjs = [];

    objects.forEach((object) => {

        if (object.topped || (object.uploadZone && this.viewOptions.uploadZonesTopped)) {
            bringToFrontObjs.push(object);
        }

    })

    bringToFrontObjs.forEach((object) => {

        object.bringToFront();

    })

    if (this.currentBoundingObject) {
        this.currentBoundingObject.bringToFront();
    }

    if (this.printingBoxObject) {
        this.printingBoxObject.bringToFront();
    }

}

/**
 * Adds a set of elements into the view.
 *
 * @param {Array} elements An array containing elements.
 * @param {Function} callback A function that will be called when all elements have beed added.
 * @method addElements
 */
fabric.Canvas.prototype.addElements = function (elements, callback) {

    let countElements = -1;

    //iterative function when element is added, add next one
    const _addElement = () => {

        countElements++;

        //add all elements of a view
        if (countElements < elements.length) {

            const element = elements[countElements];
            if (!_removeNotValidElementObj(element)) {

                this.addElement(
                    element.type,
                    element.source,
                    element.title,
                    element.parameters
                );

            }

        }
        //all initial elements are added, view is created
        else {

            this.off('elementAdd', _addElement);
            if (typeof callback !== 'undefined') {
                callback.call(callback, this);
            }

            this.initialElementsLoaded = true;

        }

    };

    const _removeNotValidElementObj = (element) => {

        if (element.type === undefined
            || element.source === undefined
            || element.title === undefined) {

            const removeInd = elements.indexOf(element)
            if (removeInd !== -1) {

                console.log('Element index ' + removeInd + ' from elements removed, its not a valid element object!', 'info');

                _addElement();
                return true;

            }

        }
        else {
            this.elements.push(element);
        }

        return false;

    };

    let element = elements[0];
    //check if view contains at least one element
    if (element) {

        //listen when element is added
        this.on('elementAdd', _addElement);

        //add first element of view
        _addElement();

    }
    //no elements in view, view is created without elements
    else {

        if (typeof callback !== 'undefined') {
            callback.call(callback, this);
        }

        this.initialElementsLoaded = true;
    }

}

/**
 * Adds a new element to the view.
 *
 * @method addElement
 * @param {string} type The type of an element you would like to add, 'image' or 'text'.
 * @param {string} source For image the URL to the image and for text elements the default text.
 * @param {string} title Only required for image elements.
 * @param {object} [parameters] An object with the parameters, you would like to apply on the element.
 */
fabric.Canvas.prototype.addElement = function (type, source, title, params = {}) {    

    if (type === undefined || source === undefined || title === undefined) return;    

    /**
     * Gets fired as soon as an element will be added (before its added to canvas).
     *
     * @event FancyProductDesignerView#beforeElementAdd
     * @param {Event} event
     * @param {String} type - The element type.
     * @param {String} source - URL for image, text string for text element.
     * @param {String} title - The title for the element.
     * @param {Object} params - The default properties.
     */
    this.fire('beforeElementAdd', {
        type: type,
        source: source,
        title: title,
        params: params
    });

    if (type === 'text') {
        //strip HTML tags
        source = source.replace(/(<([^>]+)>)/ig, "");
        source = source.replace(FancyProductDesigner.forbiddenTextChars, '');
        title = title.replace(/(<([^>]+)>)/ig, "");
    }

    //check that fill is a string
    if (typeof params.fill !== 'string' && !Array.isArray(params.fill)) {
        params.fill = false;
    }

    //merge default options
    let defaultsParams;
    if (type.toLowerCase().includes('text')) {

        defaultsParams = deepMerge(
            this.viewOptions.elementParameters,
            this.viewOptions.textParameters
        );

    }
    else {

        defaultsParams = deepMerge(
            this.viewOptions.elementParameters,
            this.viewOptions.imageParameters
        );
    }

    params = deepMerge(defaultsParams, params);

    //convert boolean value to hex   
    if (params.colors === true || params.colors == 1) {
        params.colors = params.fill ? params.fill : '#000';
    }
    //store current color and convert colors in string to array
    if (params.colors && typeof params.colors == 'string') {

        //check if string contains hex color values
        if (params.colors.indexOf('#') == 0) {
            //convert string into array
            var colors = params.colors.replace(/\s+/g, '').split(',');
            params.colors = colors;
        }

    }

    params._isInitial = !this.initialElementsLoaded;

    if (type.toLowerCase().includes('text')) {
        var defaultTextColor = params.colors[0] ? params.colors[0] : '#000000';
        params.fill = params.fill ? params.fill : defaultTextColor;
    }

    let fabricParams = {
        source: source,
        title: title,
        id: String(new Date().getTime()),
    };

    if (!this.viewOptions.editorMode) {

        fabricParams = deepMerge(fabricParams, {
            selectable: false,
            lockRotation: true,
            hasRotatingPoint: false,
            lockScalingX: true,
            lockScalingY: true,
            lockMovementX: true,
            lockMovementY: true,
            hasControls: false,
            evented: false,
            lockScalingFlip: true
        });

    }
    else {
        params.__editorMode = this.viewOptions.editorMode;
        fabricParams.selectable = fabricParams.evented = true;
    }

    fabricParams = deepMerge(params, fabricParams);

    if (fabricParams.isCustom) {
        this.isCustomized = true;
    }

    if (this.viewOptions.usePrintingBoxAsBounding && !fabricParams.boundingBox && objectHasKeys(this.viewOptions.printingBox, ['left', 'top', 'width', 'height'])) {

        fabricParams.boundingBox = {
            x: this.viewOptions.printingBox.left - 1,
            y: this.viewOptions.printingBox.top - 1,
            width: this.viewOptions.printingBox.width + 1,
            height: this.viewOptions.printingBox.height + 1
        };

        fabricParams._printingBox = fabricParams.boundingBox;
    }

    if (type == 'image' || type == 'path' || type == 'group') {

        //remove url parameters
        if (source.search('<svg ') === -1) {
            var splitURLParams = source.split('?');
            source = fabricParams.source = splitURLParams[0];
        }

        const _fabricImageLoaded = (fabricImage, params, vectorImage, originParams = {}) => {

            if (fabricImage) {

                params.originParams = deepMerge(params, originParams);

                fabricImage.setOptions(params);
                this.add(fabricImage);
                this.setElementOptions(params, fabricImage);

                fabricImage.originParams.angle = fabricImage.angle;
                fabricImage.originParams.z = fabricImage.getZIndex();


            }
            else {

                this.fire('imageFail', { url: params.source });

            }

            /**
             * Gets fired as soon as an element has beed added.
             *
             * @event fabric.Canvas#elementAdd
             * @param {Event} event
             * @param {fabric.Object} object - The fabric object.
             */            
            this.fire('elementAdd', { element: fabricImage });

        };


        if (source === undefined || source.length === 0) {
            console.log('No image source set for: ' + title);
            return;
        }

        //add SVG from string
        if (source.search('<svg') !== -1) {

            fabric.loadSVGFromString(source, (objects, options) => {

                var svgGroup = fabric.util.groupSVGElements(objects, options);

                //replace fill prop with svgFill
                if (fabricParams.fill) {

                    if (!fabricParams.svgFill) {
                        fabricParams.svgFill = fabricParams.fill;
                    }

                    delete fabricParams['fill'];
                }
                //if no default colors are set, use the initial path colors
                else if (!fabricParams.fill && !fabricParams.svgFill) {

                    if (objects) {
                        params.colors = [];
                        for (var i = 0; i < objects.length; ++i) {
                            var color = objects[i].fill.length > 0 ? tinycolor(objects[i].fill).toHexString() : 'transparent';
                            params.colors.push(color);
                        }
                        params.svgFill = params.colors;
                    }

                    fabricParams.svgFill = params.svgFill;
                }


                delete fabricParams['boundingBox'];
                delete fabricParams['originParams'];
                delete fabricParams['colors'];
                delete fabricParams['svgFill'];
                delete fabricParams['width'];
                delete fabricParams['height'];
                delete fabricParams['originX'];
                delete fabricParams['originY'];
                delete fabricParams['objectCaching'];

                _fabricImageLoaded(svgGroup, fabricParams, true, { svgFill: params.svgFill });
            });

        }
        //load svg from url
        else if (source.split('.').includes('svg')) {

            let timeStamp = Date.now().toString(),
                url = isUrl(source) ? new URL(FancyProductDesigner.proxyFileServer + source) : source;

            //add timestamp when option enabled or is cloudfront url
            if ((source.includes('.cloudfront.net/')
                || this.viewOptions.imageLoadTimestamp)
                && !FancyProductDesigner.proxyFileServer) {

                url.searchParams.append('t', timeStamp);

            }

            if (typeof url === 'object') {
                url = url.toString();
            }

            fabric.loadSVGFromURL(url, (objects, options) => {

                //if objects is null, svg is loaded from external server with cors disabled
                var svgGroup = objects ? fabric.util.groupSVGElements(objects, options) : null;

                //replace fill prop with svgFill
                if (fabricParams.fill) {

                    if (!fabricParams.svgFill) {
                        fabricParams.svgFill = fabricParams.fill;
                    }

                    delete fabricParams['fill'];
                }
                //if no default colors are set, use the initial path colors
                else if (!fabricParams.fill && !fabricParams.svgFill) {

                    if (objects) {
                        params.colors = [];
                        for (var i = 0; i < objects.length; ++i) {
                            var color = objects[i].fill.length > 0 ? tinycolor(objects[i].fill).toHexString() : 'transparent';
                            params.colors.push(color);
                        }
                        params.svgFill = params.colors;
                    }

                    fabricParams.svgFill = params.svgFill;
                }
                _fabricImageLoaded(svgGroup, fabricParams, true, { svgFill: params.svgFill });

            });

        }
        //load png/jpeg from url
        else {

            let timeStamp = Date.now().toString(),
                url;

            if (!source.includes('data:image/')) {//do not add timestamp to data URI

                url = isUrl(source) ? new URL(FancyProductDesigner.proxyFileServer + source) : source

                if ((this.viewOptions.imageLoadTimestamp)
                    && !FancyProductDesigner.proxyFileServer) {
                    url.searchParams.append('t', timeStamp);
                }

                if (typeof url === 'object') {
                    url = url.toString();
                }

            }
            else {
                url = source;
            }

            new fabric.Image.fromURL(url, function (fabricImg) {

                //if src is empty, image is loaded from external server with cors disabled
                fabricImg = fabricImg.getSrc() === '' ? null : fabricImg;
                _fabricImageLoaded(fabricImg, fabricParams, false);

            }, { crossOrigin: 'anonymous' });

        }

    }
    else if (type.toLowerCase().includes('text')) {

        source = source.replace(/\\n/g, '\n');
        params.text = params.text ? params.text : source;
        fabricParams._initialText = params.hasOwnProperty('_initialText') ? params._initialText : params.text;

        fabricParams.originParams = { ...params };

        //ensure origin text is always the initial text, even when action:save
        if (params.originParams && params.originParams.text) {
            fabricParams.originParams.text = fabricParams._initialText;
        }

        //make text curved
        var fabricText;
        if (params.curved) {

            fabricText = new fabric.IText(source.replace(/(?:\r\n|\r|\n)/g, ''), fabricParams);

        }
        //make text box
        else if (params.textBox) {

            fabricText = new fabric.Textbox(source, fabricParams);

        }
        //i-text
        else {

            fabricText = new fabric.IText(source, fabricParams);

        }

        if (fabricParams.textPlaceholder || fabricParams.numberPlaceholder) {

            if (fabricParams.textPlaceholder) {
                this.textPlaceholder = fabricText;
                fabricParams.removable = false;
                fabricParams.editable = false;
            }

            if (fabricParams.numberPlaceholder) {
                this.numberPlaceholder = fabricText;
                fabricParams.removable = false;
                fabricParams.editable = false;
            }

        }

        this.add(fabricText);
        this.setElementOptions(fabricParams, fabricText);

        fabricText.originParams = deepMerge(fabricText.toJSON(), fabricText.originParams);
        fabricText.originParams.z = fabricText.getZIndex();

        this.fire('elementAdd', { element: fabricText });

    }

}

fabric.Canvas.prototype.deselectElement = function (discardActiveObject = true) {

    if (this.currentBoundingObject) {

        this.remove(this.currentBoundingObject);
        this.fire('boudingBoxToggle', {
            boundingBox: this.currentBoundingObject,
            state: false
        })

        this.currentBoundingObject = null;

    }

    if (discardActiveObject) {
        this.discardActiveObject();
    }

    this.currentElement = null;
    
    this.fire('elementSelect', { element: null })

}

/**
 * Resizes the canvas responsive.
 *
 * @method resetSize
 */
fabric.Canvas.prototype.resetSize = function () {

    if(!this.wrapperEl.parentNode) return;

    const viewStage = this.wrapperEl;
    const viewStageWidth = viewStage.parentNode.clientWidth;

    let widthScale = viewStageWidth < this.viewOptions.stageWidth ? viewStageWidth / this.viewOptions.stageWidth : 1;
    let scaleHeight = widthScale;
    this.responsiveScale = widthScale;

    let canvasHeight = this.viewOptions.stageHeight;
    if (this.viewOptions.canvasHeight !== 'auto') {

        if (this.viewOptions.canvasHeight.includes('px')) {

            canvasHeight = parseInt(this.viewOptions.canvasHeight);
            this.responsiveScale = widthScale * (canvasHeight / this.viewOptions.stageHeight);
            scaleHeight = 1;
        }

    }

    if (!isNaN(this.viewOptions.maxCanvasHeight) && this.viewOptions.maxCanvasHeight !== 1) {

        const maxHeight = window.innerHeight * parseFloat(this.viewOptions.maxCanvasHeight);
        if ((canvasHeight * scaleHeight) > maxHeight) {
            this.responsiveScale = widthScale * (maxHeight / this.viewOptions.stageHeight);
            canvasHeight = maxHeight;
        }

    }

    this.responsiveScale = parseFloat(Number(this.responsiveScale.toFixed(7)));
    this.responsiveScale = Math.min(this.responsiveScale, 1);
        
    if (!this.viewOptions.responsive) {
        this.responsiveScale = 1;
        widthScale = scaleHeight = 1;
    }

    this
    .setDimensions({
        width: widthScale * this.viewOptions.stageWidth,
        height: this.viewOptions.stageHeight * this.responsiveScale
    })
    .setZoom(this.responsiveScale)
    .calcOffset()
    .renderAll();    

    this.fire('sizeUpdate', {
        responsiveScale: this.responsiveScale,
        canvasHeight: canvasHeight * scaleHeight
    })

    return this.responsiveScale;

}

/**
	 * Sets the zoom of the stage. 1 is equal to no zoom.
	 *
	 * @method setResZoom
	 * @param {number} value The zoom value.
	 */
fabric.Canvas.prototype.setResZoom = function(value) {

    this.deselectElement();
    
    var point = new fabric.Point(this.getWidth() * 0.5, this.getHeight() * 0.5);

    this.zoomToPoint(point, value * this.responsiveScale);

    if(value == 1) {
        this.resetZoom();
    }

};

fabric.Canvas.prototype.resetZoom = function () {

    this.deselectElement();

    this.zoomToPoint(new fabric.Point(0, 0), this.responsiveScale);
    this.absolutePan(new fabric.Point(0, 0));

};

/**
 * Returns an fabric object by title.
 *
 * @method getElementByTitle
 * @param {string} title The title of an element.
 * @return {Object} FabricJS Object.
 */
fabric.Canvas.prototype.getElementByTitle = function (title) {

    const objects = this.getObjects();

    for (var i = 0; i < objects.length; ++i) {
        if (objects[i].title === title) {
            return objects[i];
            break;
        }
    }

}

//return an element by ID
fabric.Canvas.prototype.getElementByID = function (id) {

    const objects = this.getObjects();

    for (var i = 0; i < objects.length; ++i) {
        if (objects[i].id == id) {
            return objects[i];
            break;
        }
    }

    return false;

}

/**
 * Removes the canvas and resets all relevant view properties.
 *
 * @method reset
 */
fabric.Canvas.prototype.reset = function (removeCanvas = true) {

    this.elements = [];
    //todo add to view class
    //this.totalPrice = this.truePrice = this.additionalPrice = 0;
    this.clear();

    if (removeCanvas) {
        this.wrapperEl.remove();
    }

    this.fire('clear')

    //$this.trigger('priceChange', [0, 0]);

}

/**
 * Removes an element using the fabric object or the title of an element.
 *
 * @method removeElement
 * @param {object|string} element Needs to be a fabric object or the title of an element.
 */
fabric.Canvas.prototype.removeElement = function (element) {

    if (typeof element === 'string') {
        element = this.getElementByTitle(element);
    }

    this.deselectElement();

    if (element.toggleUploadZone)
        element.toggleUploadZone();

    this.remove(element);

    /**
     * Gets fired as soon as an element has been removed.
     *
     * @event FancyProductDesignerView#elementRemove
     * @param {Event} event
     * @param {fabric.Object} element - The fabric object that has been removed.
     */
    this.fire('elementRemove', { element: element })

}

/**
 * Gets an elment by replace property.
 *
 * @method getElementByReplace
 */
fabric.Canvas.prototype.getElementByReplace = function (replaceValue) {

    const objects = this.getObjects();

    for (var i = 0; i < objects.length; ++i) {

        const object = objects[i];
        if (object.replace === replaceValue) {
            return object;
            break;
        }

    }

    return null;

}

/**
 * Sets the parameters for a specified element.
 *
 * @method setElementOptions
 * @param {object} parameters An object with the parameters that should be applied to the element.
 * @param {fabric.Object | string} [element] A fabric object or the title of an element. If no element is set, the parameters will be applied to the current selected element.
 */
fabric.Canvas.prototype.setElementOptions = function (parameters, element) {

    element = typeof element === 'undefined' ? this.getActiveObject() : element;

    if (!element || parameters === undefined) return false;    

    //if element is string, get by title
    if (typeof element == 'string') {
        element = this.getElementByTitle(element);
    }

    const elemType = element.getType();

    //scale image into bounding box (cover or fit)
    if (elemType == 'image' && !element._isInitial && !element._addToUZ && element.scaleX === 1) {

        //only scale to bb when no scale value is set
        let scale = null;
        if (!isZero(element.resizeToW) || !isZero(element.resizeToH)) {

            let scaleToWidth = element.resizeToW,
                scaleToHeight = element.resizeToH;

            scaleToWidth = isNaN(scaleToWidth) ? (parseFloat(scaleToWidth) / 100) * this.viewOptions.stageWidth : parseInt(scaleToWidth);
            scaleToHeight = isNaN(scaleToHeight) ? (parseFloat(scaleToHeight) / 100) * this.viewOptions.stageHeight : parseInt(scaleToHeight);

            scale = getScaleByDimesions(
                element.width,
                element.height,
                scaleToWidth,
                scaleToHeight,
                element.scaleMode
            );

        }
        else if (element.boundingBox) {

            const bb = element.getBoundingBoxCoords();
            scale = getScaleByDimesions(
                element.width,
                element.height,
                bb.width,
                bb.height,
                element.scaleMode
            );

        }
        else if (this.viewOptions.fitImagesInCanvas) {

            const iconTolerance = element.cornerSize * 3;

            if ((element.width * element.scaleX) + iconTolerance > this.viewOptions.stageWidth
                || (element.height * element.scaleY) + iconTolerance > this.viewOptions.stageHeight) {

                scale = getScaleByDimesions(
                    element.width,
                    element.height,
                    this.viewOptions.stageWidth - iconTolerance,
                    this.viewOptions.stageHeight - iconTolerance
                );

            }
        }

        if (scale !== null) {
            parameters = deepMerge(parameters, { scaleX: scale, scaleY: scale });
        }

    }

    //adds the element into a upload zone
    if (Boolean(element._addToUZ)) {

        parameters.z = -1;
        let uploadZoneObj = this.getElementByTitle(element._addToUZ),
            scale = 1;

        if (element.getType() == 'image') {

            scale = getScaleByDimesions(
                element.width,
                element.height,
                uploadZoneObj.width * uploadZoneObj.scaleX,
                uploadZoneObj.height * uploadZoneObj.scaleY,
                uploadZoneObj.scaleMode
            );

        }

        parameters = deepMerge(
            parameters,
            {
                boundingBox: element._addToUZ,
                boundingBoxMode: 'clipping',
                scaleX: scale,
                scaleY: scale,
                autoCenter: true,
                removable: true,
                zChangeable: false,
                autoSelect: false,
                copyable: false,
                hasUploadZone: true,
                z: this.getElementByTitle(element._addToUZ).getZIndex(),
                rotatable: uploadZoneObj.rotatable,
                draggable: uploadZoneObj.draggable,
                resizable: uploadZoneObj.resizable,
                price: uploadZoneObj.price ? uploadZoneObj.price : parameters.price,
                replace: element._addToUZ,
                lockUniScaling: uploadZoneObj.lockUniScaling,
                uniScalingUnlockable: uploadZoneObj.uniScalingUnlockable,
                advancedEditing: uploadZoneObj.advancedEditing,
                originX: uploadZoneObj.originX,
                originY: uploadZoneObj.originY,
                angle: uploadZoneObj.angle
            }
        );

        //set some origin params that are needed when resetting element in UZ
        parameters.originParams = deepMerge(parameters.originParams, {
            boundingBox: parameters.boundingBox,
            replace: parameters.replace,
            rotatable: parameters.rotatable,
            draggable: parameters.draggable,
            resizable: parameters.resizable,
            lockUniScaling: parameters.lockUniScaling,
            uniScalingUnlockable: parameters.uniScalingUnlockable,
            price: parameters.price,
            scaleX: parameters.scaleX,
            scaleY: parameters.scaleY,
            hasUploadZone: true,
            autoCenter: true,
            originX: parameters.originX,
            originY: parameters.originY,
            angle: parameters.angle
        });

        delete parameters[''];
        delete element['_addToUZ'];

    }

    //if topped, z-index can not be changed
    if (parameters.topped) {
        parameters.zChangeable = false;
    }

    //new element added
    if (element.checkEditable(parameters)) {
        parameters.isEditable = parameters.evented = parameters.selectable = true;
    }

    //upload zones have no controls
    if (!parameters.uploadZone || this.viewOptions.editorMode) {

        if (parameters.draggable) {
            parameters.lockMovementX = parameters.lockMovementY = false;
        }

        if (parameters.rotatable) {
            parameters.lockRotation = false;
            parameters.hasRotatingPoint = true;
        }

        if (parameters.resizable) {
            parameters.lockScalingX = parameters.lockScalingY = false;
        }

        if ((parameters.resizable || parameters.rotatable || parameters.removable)) {
            parameters.hasControls = true;
        }

    }

    if (parameters.uploadZone) {

        if (!this.viewOptions.editorMode) {

            if (parameters.uploadZoneMovable) {
                parameters.lockMovementX = parameters.lockMovementY = false;
            }

            if (parameters.uploadZoneRemovable) {
                parameters.removable = true;
                parameters.copyable = false;
                parameters.hasControls = true;
            }

        }

        parameters.borderColor = 'transparent';
        parameters.excludeFromExport = true;

    }

    if (parameters.fixed) {

        if (isEmpty(parameters.replace)) {
            parameters.replace = element.title;
        }

    }

    if (parameters.replace && parameters.replace != '') {

        let replacedElement = this.getElementByReplace(parameters.replace);

        //element with replace in view found and replaced element is not the new element
        if (replacedElement !== null && replacedElement !== element) {
            parameters.z = replacedElement.getZIndex();
            parameters.left = element.originParams.left = replacedElement.left;
            parameters.top = element.originParams.top = replacedElement.top;
            parameters.autoCenter = false;
            if (this.viewOptions.applyFillWhenReplacing) {
                parameters.fill = replacedElement.fill;
            }
            this.removeElement(replacedElement);
        }

    }

    //needs to before setOptions
    if (typeof parameters.text === 'string') {

        let text = parameters.text;
        text = text.replace(FancyProductDesigner.forbiddenTextChars, '');

        if (this.initialElementsLoaded && element.chargeAfterEditing) {

            if (!element._isPriced) {
                //todo: use in view instance
                //this.changePrice(element.price, '+');
                element._isPriced = true;
            }

            if (element._initialText === text && element._isPriced) {
                //todo: use in view instance
                //this.changePrice(element.price, '-');
                element._isPriced = false;
            }

        }

    }

    if (elemType === 'text') {

        if (parameters.hasOwnProperty('textDecoration')) {
            parameters.underline = parameters.textDecoration === 'underline';
        }

        if (parameters.letterSpacing !== undefined) {
            parameters.charSpacing = parameters.letterSpacing * 100;
        }

        if (parameters.fontSize && parameters.fontSize < element.minFontSize) {
            parameters.fontSize = element.minFontSize;
        }
        else if (parameters.fontSize && parameters.fontSize > element.maxFontSize) {
            parameters.fontSize = element.maxFontSize;
        }

        if (parameters.text) {

            let text = element.text;
            if (element.textTransform === 'uppercase') {
                text = text.toUpperCase()
            }
            else if (element.textTransform === 'lowercase') {
                text = text.toLowerCase()
            }

            element.set('text', text);

        }

        if (parameters.textTransform) {

            let text = element.text;
            if (parameters.textTransform === 'uppercase') {
                text = text.toUpperCase()
            }
            else if (parameters.textTransform === 'lowercase') {
                text = text.toLowerCase()
            }

            element.set('text', text);

        }

        if( parameters.hasOwnProperty('shadowColor') 
            || parameters.hasOwnProperty('shadowBlur') 
            || parameters.hasOwnProperty('shadowOffsetX') 
            || parameters.hasOwnProperty('shadowOffsetY')
        ) {
            
            if(parameters.shadowColor === null) {
                element.set('shadow', null);
            }
            else {

                let currentShadow = {};
                if(element.shadow) {
                    currentShadow = element.shadow.toObject();
                }
                            
                let shadowObj = {
                    color: parameters.hasOwnProperty('shadowColor') ? parameters.shadowColor : currentShadow.color,
                    blur: parameters.hasOwnProperty('shadowBlur') ? parameters.shadowBlur : currentShadow.blur,
                    offsetX: parameters.hasOwnProperty('shadowOffsetX') ? parameters.shadowOffsetX : currentShadow.offsetX,
                    offsetY: parameters.hasOwnProperty('shadowOffsetY') ? parameters.shadowOffsetY : currentShadow.offsetY,
                }
                
                element.set('shadow', shadowObj);

            }

        }

    }

    delete parameters['paths']; //no paths in parameters
    element.setOptions(parameters);

    if (element.type == 'i-text' && element.widthFontSize && element.text.length > 0) {

        let resizedFontSize;
        if (element.width > element.widthFontSize) {
            resizedFontSize = element.fontSize * (element.widthFontSize / (element.width + 1)); //decrease font size
        }
        else {
            resizedFontSize = element.fontSize * (element.widthFontSize / (element.width - 1)); //increase font size
        }

        if (resizedFontSize < element.minFontSize) {
            resizedFontSize = element.minFontSize;
        }
        else if (resizedFontSize > element.maxFontSize) {
            resizedFontSize = element.maxFontSize;
        }

        resizedFontSize = parseInt(resizedFontSize);
        element.set('fontSize', resizedFontSize);

    }

    if (parameters.autoCenter) {
        element.centerElement();
    }

    if(parameters.hasOwnProperty('lockUniScaling'))
        element._elementControls();

    //change element color
    if (parameters.fill !== undefined || parameters.svgFill !== undefined) {

        const fill = parameters.svgFill !== undefined ? parameters.svgFill : parameters.fill;

        element.changeColor(fill);
        element.pattern = undefined;

    }

    //set pattern
    if (parameters.pattern !== undefined) {
        element.setPattern(parameters.pattern)
        //todo
        // _setColorPrice(element, parameters.pattern);
    }

    //set filter
    if (parameters.filter) {
        //todo
        //         element.filters = [];
        //         var fabricFilter = FPDUtil.getFilter(parameters.filter);
        // 
        //         if(fabricFilter != null) {
        //             element.filters.push(fabricFilter);
        //         }
        //         if(typeof element.applyFilters !== 'undefined') {
        //             element.applyFilters();
        //         }

    }

    //set z position, check if element has canvas prop, otherwise its not added into canvas
    if (element.canvas && parameters.z >= 0) {
        element.moveTo(parameters.z);
        this._bringToppedElementsToFront();
    }
    
    if(parameters.hasOwnProperty('curved')) {

        if(parameters.curved) {

            element.setCurvedTextPath();
                
            if(element == this.getActiveObject()) {
                element.path.visible = true;   
            }
    
            //replace new lines in curved text
            if(parameters.text) {
                element.set('text', element.text.replace(/(?:\r\n|\r|\n)/g, ''));
                element.setCurvedTextPosition();            
            }   

        } 
        else {
            element.set('path', null);
        }    

    }

    if(parameters.hasOwnProperty('curveRadius')) {

        element.setCurvedTextPath();

        if(element == this.getActiveObject()) {
            element.path.visible = true;   
        }
        

    }
    

    if (element.uploadZone) {
        element.evented = element.opacity !== 0;
    }
    else if (element.isEditable && !this.viewOptions.editorMode) {
        element.evented = !parameters.locked;
    }


    //check if a upload zone contains an object
    var objects = this.getObjects();
    for (var i = 0; i < objects.length; ++i) {

        var object = objects[i];

        if (object.uploadZone && object.title == parameters.replace) {
            object.opacity = 0;
            object.evented = false;
        }

    }

    element.setCoords();
    this.renderAll().calcOffset();

    /**
     * Gets fired as soon as an element is modified.
     *
     * @event FancyProductDesignerView#elementModify
     * @param {Event} event
     * @param {fabric.Object} currentElement - The current selected element.
     */
    this.fire('elementModify', { element: element, options: parameters })

    element._checkContainment();

    if(this._doHistory) {
        this.historySaveAction();
    }

    if (parameters.autoSelect
        && element.isEditable
        && !this.editorMode
        && this.wrapperEl.offsetParent
    ) {

        setTimeout(() => {
            this.setActiveObject(element);
        }, 200);

    }

}

fabric.Canvas.prototype.duplicateElement = function (element) {

    var newOpts = element.getElementJSON();

    newOpts.top = newOpts.top + 30;
    newOpts.left = newOpts.left + 30;

    if (!this.viewOptions.editorMode) {
        newOpts.autoSelect = true;
    }

    this.addElement(
        element.getType(),
        element.source,
        'Copy ' + element.title,
        newOpts
    );

};

/**
 * Gets an upload zone by title.
 *
 * @method getUploadZone
 * @param {String} title The target title of an element.
 * @return {fabric.Object} A fabric object representing the upload zone.
 */
fabric.Canvas.prototype.getUploadZone = function (title) {

    const objects = this.getObjects();

    for (var i = 0; i < objects.length; ++i) {

        if (objects[i].uploadZone && objects[i].title == title) {
            return objects[i];
            break;
        }

    }

};

/**
 * Use a SVG image as mask for the whole view. The image needs to be a SVG file with only one path. The method toSVG() does not include the mask.
 *
 * @method setMask
 * @param {Object|Null} maskOptions An object containing the URL to the svg. Optional: scaleX, scaleY, left and top.
 */
fabric.Canvas.prototype.setMask = function(maskOptions={}, callback=() => {}) {

    if(maskOptions && maskOptions.url && maskOptions.url.includes('.svg')) {

        const maskURL = FancyProductDesigner.proxyFileServer + maskOptions.url;

        fabric.loadSVGFromURL(maskURL, (objects, options) => {            

            let svgGroup = null;
            if(objects) {
                //if objects is null, svg is loaded from external server with cors disabled
                svgGroup = objects ? fabric.util.groupSVGElements(objects, options) : null;

                svgGroup.setOptions({
                    left: maskOptions.left ? Number(maskOptions.left) :  0,
                    top: maskOptions.top ? Number(maskOptions.top) :  0,
                    scaleX: maskOptions.scaleX ? Number(maskOptions.scaleX) :  1,
                    scaleY: maskOptions.scaleY ? Number(maskOptions.scaleY) :  1,
                    selectable: true,
                    evented: false,
                    resizable: true,
                    lockUniScaling: false,
                    lockRotation: true,
                    borderColor: 'transparent',
                    fill: 'rgba(0,0,0,0)',
                    transparentCorners: true,
                    cornerColor: this.viewOptions.selectedColor,
                    cornerIconColor: this.viewOptions.cornerIconColor,
                    cornerSize: 24,
                    originX: 'left',
                    originY: 'top',
                    name: "view-mask",
                    objectCaching: false,
                    excludeFromExport: true,
                    _ignore: true,
                    _originParams: {
                        left: maskOptions.left ? Number(maskOptions.left) :  0,
                        top: maskOptions.top ? Number(maskOptions.top) :  0,
                        scaleX: maskOptions.scaleX ? Number(maskOptions.scaleX) :  1,
                        scaleY: maskOptions.scaleY ? Number(maskOptions.scaleY) :  1,
                    }
                })

                this.clipPath = svgGroup;
                this.renderAll();

                this.resetSize();

            }

            callback(svgGroup);

        });

    }
    else {
        this.clipPath = null;
    }

};
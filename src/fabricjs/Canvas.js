import Element from './Element';
import History from './History';
import { 
    deepMerge,
    objectHasKeys,
    isUrl,
    isZero,
    isEmpty
} from '/src/helpers/utils';
import { 
    getScalingByDimesions,
} from './utils.js';


fabric.Canvas.prototype.viewOptions = {};
fabric.Canvas.prototype.elements = [];
fabric.Canvas.prototype.currentElement = null;
fabric.Canvas.prototype.responsiveScale = 1;
fabric.Canvas.prototype.currentBoundingObject = null;
fabric.Canvas.prototype.initialElementsLoaded = false;
fabric.Canvas.prototype.isCustomized = false;

/**
 * Adds a set of elements into the view.
 *
 * @param {Array} elements An array containing elements.
 * @param {Function} callback A function that will be called when all elements have beed added.
 * @method addElements
 */
fabric.Canvas.prototype.addElements = function(elements, callback) {

    let countElements = -1;

    //iterative function when element is added, add next one
    const _addElement = () => {

        countElements++;

        //add all elements of a view
        if(countElements < elements.length) {
            
            const element = elements[countElements];
            if(!_removeNotValidElementObj(element)) {
                
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
            if(typeof callback !== 'undefined') {
                callback.call(callback, this);
            }
            
            this.initialElementsLoaded = true;

        }

    };

    const _removeNotValidElementObj = (element) => {
        
        if(element.type === undefined 
            || element.source === undefined 
            || element.title === undefined) {

            const removeInd = elements.indexOf(element)
            if(removeInd !== -1) {
                
                console.log('Element index '+removeInd+' from elements removed, its not a valid element object!', 'info');
                
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
    if(element) {
        
        //listen when element is added
        this.on('elementAdd', _addElement);

        //add first element of view
        _addElement();

    }
    //no elements in view, view is created without elements
    else {
        
        if(typeof callback !== 'undefined') {
            callback.call(callback, instance);
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
fabric.Canvas.prototype.addElement = function(type, source, title, params={}) {
    
    if(type === undefined || source === undefined || title === undefined) return;
    
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

    if(type === 'text') {
        //strip HTML tags
        source = source.replace(/(<([^>]+)>)/ig,"");
        source = source.replace(FancyProductDesigner.forbiddenTextChars, '');
        title = title.replace(/(<([^>]+)>)/ig,"");
    }

    //check that fill is a string
    if(typeof params.fill !== 'string' && !Array.isArray(params.fill)) {
        params.fill = false;
    }

    //merge default options
    let defaultsParams;
    if(type.toLowerCase().includes('text')) {
        
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
    if(params.colors === true || params.colors == 1) {
        params.colors = params.fill ? params.fill : '#000';
    }
    //store current color and convert colors in string to array
    if(params.colors && typeof params.colors == 'string') {

        //check if string contains hex color values
        if(params.colors.indexOf('#') == 0) {
            //convert string into array
            var colors = params.colors.replace(/\s+/g, '').split(',');
            params.colors = colors;
        }

    }
    
    params._isInitial = !this.initialElementsLoaded;

    if(type.toLowerCase().includes('text')) {
        var defaultTextColor = params.colors[0] ? params.colors[0] : '#000000';
        params.fill = params.fill ? params.fill : defaultTextColor;
    }

    let fabricParams = {
        source: source,
        title: title,
        id: String(new Date().getTime()),
    };

    if(!this.viewOptions.editorMode) {

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

    if(fabricParams.isCustom) {
        this.isCustomized = true;
    }

    if(this.viewOptions.usePrintingBoxAsBounding && !fabricParams.boundingBox && objectHasKeys(this.viewOptions.printingBox, ['left','top','width','height'])) {

        fabricParams.boundingBox = {
            x: this.viewOptions.printingBox.left-1,
            y: this.viewOptions.printingBox.top-1,
            width: this.viewOptions.printingBox.width+1,
            height: this.viewOptions.printingBox.height+1
        };
    }
    
    if(type == 'image' || type == 'path' || type == 'group') {

        fabricParams.lockUniScaling = this.viewOptions.editorMode ? false : !fabricParams.uniScalingUnlockable;

        //remove url parameters
        if(source.search('<svg ') === -1) {
            var splitURLParams = source.split('?');
            source = fabricParams.source = splitURLParams[0];
        }

        const _fabricImageLoaded = (fabricImage, params, vectorImage, originParams={}) => {
            
            if(fabricImage) {
                
                params.originParams = deepMerge(params, originParams);
                                    
                fabricImage.setOptions(params);
                this.add(fabricImage);
                this.setElementOptions(params, fabricImage);

                fabricImage.originParams.angle = fabricImage.angle;
                fabricImage.originParams.z = fabricImage.getZIndex();


            }
            else {
                
                this.fire('imageFail', {url: params.source});

            }

            /**
             * Gets fired as soon as an element has beed added.
             *
             * @event fabric.Canvas#elementAdd
             * @param {Event} event
             * @param {fabric.Object} object - The fabric object.
             */
            this.fire('elementAdd', {element: fabricImage});

        };


        if(source === undefined || source.length === 0) {
            console.log('No image source set for: '+ title);
            return;
        }

        //add SVG from string
        if(source.search('<svg') !== -1) {

            fabric.loadSVGFromString(source, (objects, options) => {
                
                var svgGroup = fabric.util.groupSVGElements(objects, options);

                //replace fill prop with svgFill
                if(fabricParams.fill) {

                    if(!fabricParams.svgFill) {
                        fabricParams.svgFill = fabricParams.fill;
                    }

                    delete fabricParams['fill'];
                }
                //if no default colors are set, use the initial path colors
                else if(!fabricParams.fill && !fabricParams.svgFill) {

                    if(objects) {
                        params.colors = [];
                        for(var i=0; i < objects.length; ++i) {
                            var color = objects[i].fill.length > 0 ? tinycolor(objects[i].fill).toHexString() : 'transparent';
                            params.colors.push(color);
                        }
                        params.svgFill = params.colors;
                    }

                    fabricParams.svgFill = params.svgFill;
                }


                delete fabricParams['clippingRect'];
                delete fabricParams['boundingBox'];
                delete fabricParams['originParams'];
                delete fabricParams['colors'];
                delete fabricParams['svgFill'];
                delete fabricParams['width'];
                delete fabricParams['height'];
                delete fabricParams['originX'];
                delete fabricParams['originY'];
                delete fabricParams['objectCaching'];

                _fabricImageLoaded(svgGroup, fabricParams, true, {svgFill: params.svgFill});
            });

        }
        //load svg from url
        else if(source.split('.').includes('svg')) {

            let timeStamp = Date.now().toString(),
                url = isUrl(source) ? new URL(FancyProductDesigner.proxyFileServer + source) : source;

            //add timestamp when option enabled or is cloudfront url
            if((source.includes('.cloudfront.net/') 
                || this.viewOptions.imageLoadTimestamp)
                && !FancyProductDesigner.proxyFileServer) {

                url.searchParams.append('t', timeStamp);

            }

            if(typeof url === 'object') {
                url = url.toString();
            }

            fabric.loadSVGFromURL(url, (objects, options) => {

                //if objects is null, svg is loaded from external server with cors disabled
                var svgGroup = objects ? fabric.util.groupSVGElements(objects, options) : null;

                //replace fill prop with svgFill
                if(fabricParams.fill) {

                    if(!fabricParams.svgFill) {
                        fabricParams.svgFill = fabricParams.fill;
                    }

                    delete fabricParams['fill'];
                }
                //if no default colors are set, use the initial path colors
                else if(!fabricParams.fill && !fabricParams.svgFill) {

                    if(objects) {
                        params.colors = [];
                        for(var i=0; i < objects.length; ++i) {
                            var color = objects[i].fill.length > 0 ? tinycolor(objects[i].fill).toHexString() : 'transparent';
                            params.colors.push(color);
                        }
                        params.svgFill = params.colors;
                    }

                    fabricParams.svgFill = params.svgFill;
                }
                _fabricImageLoaded(svgGroup, fabricParams, true, {svgFill: params.svgFill});

            });

        }
        //load png/jpeg from url
        else {
            
            let timeStamp = Date.now().toString(),
                url;

            if(!source.includes('data:image/')) {//do not add timestamp to data URI

                url = isUrl(source) ? new URL(FancyProductDesigner.proxyFileServer + source) : source

                if((this.viewOptions.imageLoadTimestamp)
                    && !FancyProductDesigner.proxyFileServer) {
                    url.searchParams.append('t', timeStamp);
                }

                if(typeof url === 'object') {
                    url = url.toString();
                }

            }
            else {
                url = source;
            }

            new fabric.Image.fromURL(url, function(fabricImg) {

                //if src is empty, image is loaded from external server with cors disabled
                fabricImg = fabricImg.getSrc() === '' ? null : fabricImg;
                _fabricImageLoaded(fabricImg, fabricParams, false);

            }, {crossOrigin: 'anonymous'});

        }

    }
    else if(type.toLowerCase().includes('text')) {

        source = source.replace(/\\n/g, '\n');
        params.text = params.text ? params.text : source;
        fabricParams._initialText = params.hasOwnProperty('_initialText') ? params._initialText : params.text;
        
        fabricParams = deepMerge(fabricParams, {
            spacing: params.curveSpacing,
            radius: params.curveRadius,
            reverse: params.curveReverse,
            originParams: {...params}
        });

        //ensure origin text is always the initial text, even when action:save
        if(params.originParams && params.originParams.text) {
            fabricParams.originParams.text = fabricParams._initialText;
        }

        //make text curved
        var fabricText;
        if(params.curved && typeof fabric.CurvedText !== 'undefined') {

            var _tempText = fabricParams.text; //fix: text property gets empty, when creating curved text
            fabricText = new fabric.CurvedText(source, fabricParams);
            fabricParams.text = _tempText;

        }
        //make text box
        else if(params.textBox) {

            fabricParams.lockUniScaling = !this.viewOptions.editorMode;

            if(this.viewOptions.setTextboxWidth) {
                fabricParams.lockUniScaling = false;
                fabricParams.lockScalingX = false;
            }

            fabricParams.lockScalingY = true;

            fabricText = new fabric.Textbox(source, fabricParams);
            fabricText.setControlVisible('bl', true);

            if(!this.viewOptions.inCanvasTextEditing) {
                fabricText.on({'editing:entered': function() {
                    this.exitEditing();
                }});
            }

        }
        //i-text
        else {
            
            fabricText = new fabric.IText(source, fabricParams);

            if(!this.viewOptions.inCanvasTextEditing) {
                fabricText.on({'editing:entered': function() {
                    this.exitEditing();
                }});
            }

        }

        if(fabricParams.textPlaceholder || fabricParams.numberPlaceholder) {

            if(fabricParams.textPlaceholder) {
                this.textPlaceholder = fabricText;
                fabricParams.removable = false;
                fabricParams.editable = false;
            }

            if(fabricParams.numberPlaceholder) {
                this.numberPlaceholder = fabricText;
                fabricParams.removable = false;
                fabricParams.editable = false;
            }

        }

        this.add(fabricText);
        this.setElementOptions(fabricParams, fabricText);

        fabricText.originParams = deepMerge(fabricText.toJSON(), fabricText.originParams);
        delete fabricText.originParams['clipTo'];
        fabricText.originParams.z = fabricText.getZIndex();

        this.fire('elementAdd', {element: fabricText});

    }

}

fabric.Canvas.prototype.deselectElement = function(discardActiveObject=true) {
    
    if(this.currentBoundingObject) {
    
        this.remove(this.currentBoundingObject);
        this.fire('boudingBoxToggle', {
            boundingBox: this.currentBoundingObject,
            state: false
        })
        this.currentBoundingObject = null;
    
    }
    
    if(discardActiveObject) {
        this.discardActiveObject();
    }
    
    this.currentElement = null;
    this.renderAll().calcOffset();
    
}

fabric.Canvas.prototype.resetZoom = function() {
    
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
fabric.Canvas.prototype.getElementByTitle = function(title) {

    const objects = this.getObjects();
    
    for(var i = 0; i < objects.length; ++i) {
        if(objects[i].title === title) {
            return objects[i];
            break;
        }
    }

}

//return an element by ID
fabric.Canvas.prototype.getElementByID = function(id) {

    const objects = this.getObjects();
    
    for(var i=0; i < objects.length; ++i) {
        if(objects[i].id == id) {
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
fabric.Canvas.prototype.reset = function(removeCanvas=true) {
    
    this.elements = [];
    //todo add to view class
    //this.totalPrice = this.truePrice = this.additionalPrice = 0;
    this.clear();

    if(removeCanvas) {
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
fabric.Canvas.prototype.removeElement = function(element) {

    if(typeof element === 'string') {
        element = this.getElementByTitle(element);
    }

    this.deselectElement();

    setTimeout(() => {

        this.remove(element);
        
        //todo
        //_elementHasUploadZone(element);

        /**
         * Gets fired as soon as an element has been removed.
         *
         * @event FancyProductDesignerView#elementRemove
         * @param {Event} event
         * @param {fabric.Object} element - The fabric object that has been removed.
         */
        this.fire('elementRemove', {target: element})

    }, 1);

}

/**
 * Gets an elment by replace property.
 *
 * @method getElementByReplace
 */
fabric.Canvas.prototype.getElementByReplace = function(replaceValue) {

    const objects = this.getObjects();
    
    for(var i = 0; i < objects.length; ++i) {
        
        const object = objects[i];
        if(object.replace === replaceValue) {
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
fabric.Canvas.prototype.setElementOptions = function(parameters, element) {
    
    element = typeof element === 'undefined' ? this.getActiveObject() : element;
    
        if(!element || parameters === undefined) {
            return false;
        }
    
        //if element is string, get by title
        if(typeof element == 'string') {
            element = this.getElementByTitle(element);
        }
    
        var elemType = element.getType();
    
        //scale image into bounding box (cover or fit)
        if(elemType == 'image' && !element._isInitial && !element._addToUZ && element.scaleX === 1) {
    
    
            var scale = null;
             if(!isZero(element.resizeToW) || !isZero(element.resizeToH)) {
    
                var scaleToWidth = element.resizeToW,
                     scaleToHeight = element.resizeToH;
    
                scaleToWidth = isNaN(scaleToWidth) ? (parseFloat(scaleToWidth) / 100) *  this.options.stageWidth : parseInt(scaleToWidth);
                scaleToHeight = isNaN(scaleToHeight) ? (parseFloat(scaleToHeight) / 100) * this.options.stageHeight : parseInt(scaleToHeight);
    
                scale = getScalingByDimesions(
                    element.width,
                    element.height,
                    scaleToWidth,
                    scaleToHeight,
                    element.scaleMode
                );
    
            }
            //only scale to bb when no scale value is set
            else if(element.boundingBox) {
    
                var bb = this.getBoundingBoxCoords(element);
    
                scale = getScalingByDimesions(
                    element.width,
                    element.height,
                    bb.width,
                    bb.height,
                    element.scaleMode
                );
    
            }
            else if(this.options.fitImagesInCanvas) {
    
                var iconTolerance = element.cornerSize * 3;
    
                if((element.width * element.scaleX) + iconTolerance > this.options.stageWidth
                    || (element.height * element.scaleY) + iconTolerance > this.options.stageHeight) {
    
                    scale = getScalingByDimesions(
                        element.width,
                        element.height,
                        this.options.stageWidth - iconTolerance,
                        this.options.stageHeight - iconTolerance
                    );
    
                }
            }
    
            if(scale !== null) {
                parameters = deepMerge(parameters, {scaleX: scale, scaleY: scale});
            }
    
        }
    
        //adds the element into a upload zone
        if(Boolean(element._addToUZ)) {
    
            parameters.z = -1;
            var uploadZoneObj = this.getElementByTitle(element._addToUZ),
                scale = 1;
    
            if(element.getType() == 'image') {
                
                scale = getScalingByDimesions(
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
        if(parameters.topped) {
            parameters.zChangeable = false;
        }
    
        //new element added
        if(element.checkEditable(parameters)) {
            parameters.isEditable = parameters.evented = parameters.selectable = true;
        }
    
        //upload zones have no controls
        if(!parameters.uploadZone || this.viewOptions.editorMode) {
            
            if(parameters.draggable) {
                parameters.lockMovementX = parameters.lockMovementY = false;
            }
    
            if(parameters.rotatable) {
                parameters.lockRotation = false;
                parameters.hasRotatingPoint = true;
            }
    
            if(parameters.resizable) {
                parameters.lockScalingX = parameters.lockScalingY = false;
            }
    
            if((parameters.resizable || parameters.rotatable || parameters.removable)) {
                parameters.hasControls = true;
            }
    
        }
    
        if(parameters.uploadZone) {
    
            if(!this.viewOptions.editorMode) {
    
                if(parameters.uploadZoneMovable) {
                    parameters.lockMovementX = parameters.lockMovementY = false;
                }
    
                if(parameters.uploadZoneRemovable) {
                    parameters.removable = true;
                    parameters.copyable = false;
                    parameters.hasControls = true;
                }
    
            }
    
            parameters.excludeFromExport = true;
    
        }
    
        if(parameters.fixed) {
    
            if(isEmpty(parameters.replace)) {
                parameters.replace = element.title;
            }
    
        }
    
        if(parameters.replace && parameters.replace != '') {
    
            var replacedElement = this.getElementByReplace(parameters.replace);
    
            //element with replace in view found and replaced element is not the new element
            if(replacedElement !== null && replacedElement !== element ) {
                parameters.z = replacedElement.getZIndex();
                parameters.left = element.originParams.left = replacedElement.left;
                parameters.top = element.originParams.top =  replacedElement.top;
                parameters.autoCenter = false;
                if(this.options.applyFillWhenReplacing) {
                    parameters.fill = replacedElement.fill;
                }
                this.removeElement(replacedElement);
            }
    
        }
    
        //needs to before setOptions
        if(typeof parameters.text === 'string') {
    
            var text = parameters.text;
            
            text = text.replace(FancyProductDesigner.forbiddenTextChars, '');
    
            //remove emojis
            if(this.options.disableTextEmojis) {
                text = text.replace(FPDEmojisRegex, '');
                text = text.replace(String.fromCharCode(65039), ""); //fix: some emojis left a symbol with char code 65039
            }
    
            if(element.maxLength != 0 && text.length > element.maxLength) {
                text = text.substr(0, element.maxLength);
                element.selectionStart = element.maxLength;
            }
    
            //check lines length
            if(element.maxLines != 0) {
    
                if(element.type == 'textbox' && element.__lineHeights) {
                    text = _maxTextboxLines(element, text);
                }
                else if(text.split("\n").length > element.maxLines) {
                    text = text.replace(/([\s\S]*)\n/, "$1");
                    element.exitEditing(); //exit editing when max lines are reached
                }
    
            }
    
            element.set('text', text);
            parameters.text = text;
    
            if(this.initialElementsLoaded && element.chargeAfterEditing) {
    
                if(!element._isPriced) {
                    //todo
                    //this.changePrice(element.price, '+');
                    element._isPriced = true;
                }
    
                if( element._initialText === text && element._isPriced) {
                    //todo
                    //this.changePrice(element.price, '-');
                    element._isPriced = false;
                }
    
            }
    
        }
    
        if(elemType === 'text') {
    
            if(parameters.hasOwnProperty('textDecoration')) {
                parameters.underline = parameters.textDecoration === 'underline';
            }
    
            if(parameters.letterSpacing !== undefined) {
                parameters.charSpacing = parameters.letterSpacing * 100;
            }
    
            if(parameters.fontSize && parameters.fontSize < element.minFontSize) {
                parameters.fontSize = element.minFontSize;
            }
            else if(parameters.fontSize && parameters.fontSize > element.maxFontSize) {
                parameters.fontSize = element.maxFontSize;
            }
    
            if(parameters.text) {
    
                if(element.textTransform === 'uppercase') {
                    text = text.toUpperCase()
                }
                else if(element.textTransform === 'lowercase') {
                    text = text.toLowerCase()
                }
    
                element.set('text', text);
                parameters.text = text;
    
            }
    
            if(parameters.textTransform) {
    
                var text = element.text;
                if(parameters.textTransform === 'uppercase') {
                    text = text.toUpperCase()
                }
                else if(parameters.textTransform === 'lowercase') {
                    text = text.toLowerCase()
                }
    
                element.set('text', text);
                parameters.text = text;
    
            }
    
            if((parameters.shadowColor || parameters.shadowBlur || parameters.shadowOffsetX || parameters.shadowOffsetY) && !element.shadow) {
    
                var shadowObj = {
                    color: parameters.shadowColor ? parameters.shadowColor: 'rgba(0,0,0,0)'
                }
    
                element.setShadow(shadowObj);
    
            }
    
            if(element.shadow && parameters.hasOwnProperty('shadowColor')) {
                if(parameters.shadowColor) {
                    element.shadow.color = parameters.shadowColor;
                }
                else {
                    element.setShadow(null);
                }
            }
    
            if(element.shadow) {
    
                if(parameters.shadowBlur) {
                    element.shadow.blur = parameters.shadowBlur;
                }
    
                if(parameters.shadowOffsetX) {
                    element.shadow.offsetX = parameters.shadowOffsetX;
                }
    
                if(parameters.shadowOffsetY) {
                    element.shadow.offsetY = parameters.shadowOffsetY;
                }
    
            }
    
        }
    
        delete parameters['paths']; //no paths in parameters
        element.setOptions(parameters);
    
        if(element.type == 'i-text' && element.widthFontSize && element.text.length > 0) {
    
            var resizedFontSize;
            if(element.width > element.widthFontSize) {
                resizedFontSize = element.fontSize * (element.widthFontSize / (element.width + 1)); //decrease font size
            }
            else {
                resizedFontSize = element.fontSize * (element.widthFontSize / (element.width - 1)); //increase font size
            }
    
            if(resizedFontSize < element.minFontSize) {
                resizedFontSize = element.minFontSize;
            }
            else if(resizedFontSize > element.maxFontSize) {
                resizedFontSize = element.maxFontSize;
            }
    
            resizedFontSize = parseInt(resizedFontSize);
            parameters.fontSize = resizedFontSize;
            element.set('fontSize', resizedFontSize);
    
        }
    
        //clip element
        if((element.boundingBox && parameters.boundingBoxMode === 'clipping') || parameters.hasUploadZone) {
            //todo
            //_clipElement(element);
        }
    
        if(parameters.autoCenter) {
            //todo
            //this.centerElement(true, true, element);
        }
    
        //change element color
        if(parameters.fill !== undefined || parameters.svgFill !== undefined) {
            var fill = parameters.svgFill !== undefined ? parameters.svgFill : parameters.fill;
            //todo
            //this.changeColor(element, fill);
            element.pattern = undefined;
        }
    
        //set pattern
        if(parameters.pattern !== undefined) {
            //todo
            element.setPattern(parameters.pattern)
            // _setColorPrice(element, parameters.pattern);
        }
    
        //set filter
        if(parameters.filter) {
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
        if(element.canvas && parameters.z >= 0) {
            element.moveTo(parameters.z);
            
            //todo
            //_bringToppedElementsToFront();
        }
    
        if(element.curved) {
    
            if(parameters.curveRadius) {
                element.set('radius', parameters.curveRadius);
            }
    
            if(parameters.curveSpacing) {
                element.set('spacing', parameters.curveSpacing);
            }
    
            if(parameters.curveReverse !== undefined) {
                element.set('reverse', parameters.curveReverse);
            }
    
        }
    
        if(element.uploadZone) {
            element.evented = element.opacity !== 0;
        }
        else if(element.isEditable && !this.viewOptions.editorMode) {
            element.evented = !parameters.locked;
        }
    
    
        //check if a upload zone contains an object
        var objects = this.getObjects();
        for(var i=0; i < objects.length; ++i) {
    
            var object = objects[i];
    
            if(object.uploadZone && object.title == parameters.replace) {
                object.opacity = 0;
                object.evented = false;
            }
    
        }
    
        element.setCoords();
        this.renderAll().calcOffset();
    
        //todo
        //$this.trigger('elementModify', [element, parameters]);
        
        //todo
        //_checkContainment(element);
    
        //select element
        //todo
    //     if(parameters.autoSelect && element.isEditable && !this.editorMode && $(this.fabricCanvas.getElement()).is(':visible')) {
    // 
    //         setTimeout(function() {
    //             this.stage.setActiveObject(element);
    //             this.fabricCanvas.renderAll();
    //         }, 350);
    // 
    //     }

}


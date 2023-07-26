import './objects/Controls';
import './objects/Group';
import './objects/Text';
import './objects/IText';
import './objects/Textbox';

import {
    removeUrlParams
} from '/src/helpers/utils';

fabric.Object.propertiesToInclude = [
    '_isInitial', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'lockScalingFlip', 'lockUniScaling',
    'resizeType', 'boundingBox', 'boundingBoxMode', 'selectable', 'evented', 'title', 'editable', 'cornerColor', 'cornerIconColor',
    'borderColor', 'isEditable', 'hasUploadZone', 'cornerSize', 'source'];

fabric.Object.prototype._limitModifyOpts = {};
fabric.Object.prototype.__editorMode = false;

fabric.Object.prototype.initialize = (function (originalFn) {
    return function (...args) {
        originalFn.call(this, ...args);
        this._elementInit();
        return this;
    };
})(fabric.Object.prototype.initialize);

fabric.Object.prototype._elementInit = function () {

    this.on({
        'added': () => {

            if (this.isCustom && !this.hasUploadZone && !this.replace) {
                this.copyable = this.originParams.copyable = true;
            }

        },
        'moving': () => {

            this._checkContainment();

        },
        'rotating': () => {

            this._checkContainment();

        },
        'scaling': () => {

            this._checkContainment();

        },
        'selected': () => {

            this._elementControls();

        }
    })

}

fabric.Object.prototype._elementControls = function () {

    let widthControls = Boolean(!this.lockUniScaling || this.__editorMode),
        heightControls = Boolean(!this.lockUniScaling || this.__editorMode),
        copyControl = Boolean(this.copyable),
        removeControl = Boolean(this.removable || this.__editorMode),
        resizeControl = Boolean((this.resizable || this.__editorMode) && !this.curved),
        rotateControl = Boolean(this.rotatable || this.__editorMode);

    if (this.textBox)
        widthControls = true;

    if (this.canvas && this.canvas.viewOptions.cornerControlsStyle == 'basic') {
        this.controls.mtr.offsetX = 0;
        this.cornerSize = 16;
    }

    if (this.name == 'printing-boxes' || this.name == 'view-mask') {

        widthControls = false;
        heightControls = false;
        rotateControl = false;
        copyControl = false;
        removeControl = false;

    }

    this.setControlsVisibility({
        ml: widthControls,
        mr: widthControls,
        mt: heightControls,
        mb: heightControls,
        tr: removeControl,
        tl: copyControl,
        mtr: rotateControl,
        br: resizeControl,
    });

}

fabric.Object.prototype.getType = function (fabricType) {

    fabricType = fabricType ? fabricType : this.type;

    if (fabricType === 'text' || fabricType === 'i-text' || fabricType === 'textbox') {
        return 'text';
    }
    else {
        return 'image';
    }

};

fabric.Object.prototype.isSVG = function () {

    return this.type === 'group' ||
        this.type === 'path' ||
        (this.source && this.source.includes('.svg'));

};

fabric.Object.prototype.isColorizable = function () {

    if (this.getType() === 'text') {
        return 'text';
    }

    if (!this.source) {
        return false;
    }

    const imageParts = this.source.split('.');
    //its base64 encoded
    if (imageParts.length == 1) {

        if (this.source.includes('data:image/png;')) {
            return 'dataurl';
        }
        else {
            this.fill = this.colors = false;
            return false;
        }

    }
    //its a url
    else {

        let url = removeUrlParams(this.source);

        //only png and svg are colorizable
        if (url.includes('.png') || this.isSVG()) {
            return this.isSVG() ? 'svg' : 'png';
        }
        else {
            this.fill = this.colors = false;
            return false;
        }

    }

};

fabric.Object.prototype.hasColorSelection = function () {

    return (Array.isArray(this.colors) || Boolean(this.colors) || this.colorLinkGroup || this.__editorMode) && this.isColorizable() !== false;

};

fabric.Object.prototype.checkEditable = function (checkProps) {

    checkProps = checkProps ? checkProps : this;

    return typeof checkProps.colors === 'object' ||
        checkProps.colors === true ||
        checkProps.colors == 1 ||
        checkProps.removable ||
        checkProps.draggable ||
        checkProps.resizable ||
        checkProps.rotatable ||
        checkProps.zChangeable ||
        checkProps.advancedEditing ||
        checkProps.editable ||
        checkProps.uploadZone ||
        (checkProps.colorLinkGroup && checkProps.colorLinkGroup.length > 0) ||
        checkProps.__editorMode;

};

fabric.Object.prototype.changeColor = function (colorData, colorLinking = true) {

    const colorizable = this.isColorizable();

    //check if hex color has only 4 digits, if yes, append 3 more
    if (typeof colorData === 'string')
        colorData = tinycolor(colorData).toHexString();

    //text
    if (this.getType() === 'text') {

        if (typeof colorData == 'object') {
            colorData = colorData[0];
        }

        //set color of a text element
        this.set('fill', colorData);
        this.canvas.renderAll();
        this.pattern = null;

    }
    //path groups (svg)
    else if (this.type == 'group' && typeof colorData == 'object') {

        const objects = this.getObjects();
        colorData.forEach((hexColor, i) => {

            if (objects[i]) {
                objects[i].set('fill', hexColor);
            }

        })
        this.canvas.renderAll();

        this.svgFill = colorData;
        delete this['fill'];

    }
    //image
    else {

        if (typeof colorData == 'object') {
            colorData = colorData[0];
        }

        if (typeof colorData !== 'string') {
            colorData = false;
        }

        //colorize png or dataurl image
        if (colorizable == 'png' || colorizable == 'dataurl') {

            this.filters = [];

            if (colorData) {
                this.filters.push(new fabric.Image.filters.BlendColor({ mode: 'tint', color: colorData }));
            }

            this.applyFilters();
            this.canvas.renderAll();
            this.fill = colorData;

        }
        //colorize svg (single path)
        else if (colorizable == 'svg') {

            this.set('fill', colorData);
            this.canvas.renderAll();

        }

    }

    this.canvas.fire('elementFillChange', { element: this, colorLinking: colorLinking });

};

fabric.Object.prototype.setPattern = function (patternUrl) {

    if (FancyProductDesigner.proxyFileServer) {
        patternUrl = FancyProductDesigner.proxyFileServer + patternUrl;
    }

    if (patternUrl) {

        fabric.util.loadImage(patternUrl, (img) => {

            if (this.isSVG()) {

                //group of paths
                if (this.hasOwnProperty('getObjects')) {

                    const paths = this.getObjects();
                    for (var i = 0; i < paths.length; ++i) {

                        paths[i].set('fill', new fabric.Pattern({
                            source: img,
                            repeat: 'repeat'
                        }));
                    }

                }
                //single path
                else {

                    this.set('fill', new fabric.Pattern({
                        source: img,
                        repeat: 'repeat'
                    }));

                }

            }
            //text
            else if (this.getType() == 'text') {

                this.set('fill', new fabric.Pattern({
                    source: img,
                    repeat: 'repeat'
                }));

            }
            //for all other revert to color
            else {

                let color = this.fill ? this.fill : this.colors[0];
                color = color ? color : '#000000';
                this.set('fill', color);

            }

            this.canvas.renderAll();
            this.canvas.fire('elementFillChange', { element: this });

        });

        this.pattern = patternUrl;

    }

};

/**
 * Gets the z-index of an element.
 *
 * @method getZIndex
 * @param {fabric.Object} [element] The element to center. If not set, it centers the current selected element.
 * @return {Number} The index.
 */
fabric.Object.prototype.getZIndex = function () {

    const objects = this.canvas.getObjects();
    return objects.indexOf(this);
}

/**
 * Centers an element horizontal or/and vertical.
 *
 * @method centerElement
 * @param {Boolean} h Center horizontal.
 * @param {Boolean} v Center vertical.
 * @param {fabric.Object} [element] The element to center. If not set, it centers the current selected element.
 */
fabric.Object.prototype.centerElement = function (hCenter = true, vCenter = true) {

    let boundingBox = this.getBoundingBoxCoords(),
        left = this.left,
        top = this.top;

    if (hCenter) {

        if (boundingBox) {
            left = boundingBox.cp ? boundingBox.cp.x : boundingBox.left + boundingBox.width * 0.5;
        }
        else {
            left = this.canvas.viewOptions.stageWidth * 0.5;
        }

    }

    if (vCenter) {
        if (boundingBox) {
            top = boundingBox.cp ? boundingBox.cp.y : boundingBox.top + boundingBox.height * 0.5;
        }
        else {
            top = this.canvas.viewOptions.stageHeight * 0.5;
        }

    }

    this.setPositionByOrigin(new fabric.Point(left, top), 'center', 'center');

    this.canvas.renderAll();
    this.setCoords();
    this._checkContainment();

    this.autoCenter = false;

}

//checks if an element is in its containment (bounding box)
fabric.Object.prototype._checkContainment = function () {

    if (this.canvas && this.canvas.currentBoundingObject && !this.hasUploadZone) {

        this.setCoords();

        if (this.boundingBoxMode === 'limitModify') {

            let targetBoundingRect = this.getBoundingRect(),
                bbBoundingRect = this.canvas.currentBoundingObject.getBoundingRect(),
                minX = bbBoundingRect.left,
                maxX = bbBoundingRect.left + bbBoundingRect.width - targetBoundingRect.width,
                minY = bbBoundingRect.top,
                maxY = bbBoundingRect.top + bbBoundingRect.height - targetBoundingRect.height;


            //check if target element is not contained within bb
            if (!this.isContainedWithinObject(this.canvas.currentBoundingObject)) {

                if (targetBoundingRect.left > minX && targetBoundingRect.left < maxX) {                    
                    this._limitModifyOpts.left = this.left;
                }

                if (targetBoundingRect.top > minY && targetBoundingRect.top < maxY) {
                    this._limitModifyOpts.top = this.top;
                }


                this.setOptions(this._limitModifyOpts);


            } else {

                this._limitModifyOpts = {
                    left: this.left,
                    top: this.top,
                    angle: this.angle,
                    scaleX: this.scaleX,
                    scaleY: this.scaleY
                };

                if (this.getType() == 'text') {

                    this._limitModifyOpts.fontSize = this.fontSize;
                    this._limitModifyOpts.lineHeight = this.lineHeight;
                    this._limitModifyOpts.charSpacing = this.charSpacing;

                }

            }

        }
        else if (this.boundingBoxMode === 'inside' || this.boundingBoxMode === 'clipping') {

            var isOut = false,
                tempIsOut = this.isOut;

            isOut = !this.isContainedWithinObject(this.canvas.currentBoundingObject);

            if (isOut) {

                if (this.boundingBoxMode === 'inside') {
                    this.borderColor = this.canvas.viewOptions.outOfBoundaryColor;
                }

                this.isOut = true;

            }
            else {

                if (this.boundingBoxMode === 'inside') {
                    this.borderColor = this.canvas.viewOptions.selectedColor;
                }

                this.isOut = false;

            }

            if (tempIsOut != this.isOut && tempIsOut != undefined) {

                if (isOut) {

                    /**
                     * Gets fired as soon as an element is outside of its bounding box.
                     *
                     * @event FancyProductDesignerView#elementOut
                     * @param {Event} event
                     */
                    this.canvas.fire('elementOut', {
                        target: this,
                    })
                }
                else {

                    /**
                     * Gets fired as soon as an element is inside of its bounding box again.
                     *
                     * @event FancyProductDesignerView#elementIn
                     * @param {Event} event
                     */
                    this.canvas.fire('elementIn', {
                        target: this,
                    })
                }

            }

            this.canvas.fire('elementCheckContainemt', {
                target: this,
                boundingBoxMode: this.boundingBoxMode
            })

        }

    }

}

/**
 * Returns the bounding box of an element.
 *
 * @method getBoundingBoxCoords
 * @param {fabric.Object} element A fabric object
 * @return {Object | Boolean} The bounding box object with x,y,width and height or false.
 */
fabric.Object.prototype.getBoundingBoxCoords = function () {

    if (this.boundingBox || this.uploadZone) {

        if (typeof this.boundingBox == "object") {


            if (this.boundingBox.hasOwnProperty('x') &&
                this.boundingBox.hasOwnProperty('y') &&
                this.boundingBox.width &&
                this.boundingBox.height
            ) {
                return {
                    left: this.boundingBox.x,
                    top: this.boundingBox.y,
                    width: this.boundingBox.width,
                    height: this.boundingBox.height
                };
            }
            else {
                return false;
            }

        }
        else {

            const targetObject = this.canvas.getElementByTitle(this.boundingBox);

            if (targetObject) {

                const topLeftPoint = targetObject.getPointByOrigin('left', 'top');
                return {
                    left: topLeftPoint.x,
                    top: topLeftPoint.y,
                    width: targetObject.width * targetObject.scaleX,
                    height: targetObject.height * targetObject.scaleY,
                    angle: targetObject.angle || 0,
                    cp: targetObject.getCenterPoint()
                };

            }

        }

    }

    return false;

}

fabric.Object.prototype.getClippingObject = function () {

    if (this.boundingBox || this.uploadZone) {

        if (typeof this.boundingBox == "object") {
            return this.getBoundingBoxCoords();
        }
        else {

            const targetObject = this.canvas.getElementByTitle(this.boundingBox);

            if (targetObject) {

                if (targetObject.type == 'image') {
                    return this.getBoundingBoxCoords();
                }
                else {
                    return targetObject;
                }

            }

        }

    }

    return false;

}

fabric.Object.prototype._clipElement = function () {

    var clippingObj = this.getClippingObject();

    if (clippingObj) {

        if (clippingObj.type) {

            clippingObj.clone((clonedPath) => {

                clonedPath.set({
                    absolutePositioned: true,
                    opacity: 1,
                })

                this.clipPath = clonedPath;

            })

        }
        else {

            const clipRect = new fabric.Rect({
                originX: 'left',
                originY: 'top',
                angle: clippingObj.angle || 0,
                left: clippingObj.left,
                top: clippingObj.top,
                width: clippingObj.width,
                height: clippingObj.height,
                fill: '#DDD',
                absolutePositioned: true,
            });

            this.clipPath = clipRect;

        }

        this.canvas.renderAll();

    }

};

fabric.Object.prototype.getElementJSON = function (addPropertiesToInclude = false, propertyKeys = []) {

    if (this.canvas) {

        propertyKeys = Object.keys(this.canvas.viewOptions.elementParameters);

        if (this.getType() === 'text') {
            propertyKeys = propertyKeys.concat(Object.keys(this.canvas.viewOptions.textParameters));
        }
        else {
            propertyKeys = propertyKeys.concat(Object.keys(this.canvas.viewOptions.imageParameters));
        }

    }

    if (addPropertiesToInclude) {
        propertyKeys = propertyKeys.concat(fabric.Object.propertiesToInclude);
    }

    if (this.uploadZone) {
        propertyKeys.push('customAdds');
        propertyKeys.push('designCategories');
        propertyKeys.push('designCategories[]'); //fpd-admin
    }

    if (this.getType() === 'text') {
        propertyKeys.push('text');
        propertyKeys.push('_initialText');
    }

    if (this.type === 'group') {
        propertyKeys.push('svgFill');
    }

    propertyKeys.push('width');
    propertyKeys.push('height');
    propertyKeys.push('isEditable');
    propertyKeys.push('hasUploadZone');
    propertyKeys.push('evented');
    propertyKeys.push('isCustom');
    propertyKeys.push('currentColorPrice');
    propertyKeys.push('_isPriced');
    propertyKeys.push('originParams');
    propertyKeys.push('originSource');
    propertyKeys.push('_printingBox');
    propertyKeys = propertyKeys.sort();


    let elementProps = {};
    propertyKeys.forEach(key => {

        if (this[key] !== undefined) {
            elementProps[key] = this[key];
        }

    });

    return elementProps;

};

/**
     * Aligns an element.
     *
     * @method alignToPosition
     * @param {String} pos Allowed values: left, right, top or bottom.
     */
fabric.Object.prototype.alignToPosition = function (pos = 'left') {


    let localPoint = this.getPointByOrigin('left', 'top'),
        boundingBox = this.getBoundingBoxCoords(),
        posOriginX = 'left',
        posOriginY = 'top';

    if (pos === 'left') {

        localPoint.x = boundingBox ? boundingBox.left : 0;
        localPoint.x += this.padding + 1;

    }
    else if (pos === 'top') {

        localPoint.y = boundingBox ? boundingBox.top : 0;
        localPoint.y += this.padding + 1;

    }
    else if (pos === 'right') {

        localPoint.x = boundingBox ? boundingBox.left + boundingBox.width - this.padding : this.canvas.viewOptions.stageWidth - this.padding;
        posOriginX = 'right';

    }
    else {

        localPoint.y = boundingBox ? boundingBox.top + boundingBox.height - this.padding : this.canvas.viewOptions.stageHeight;
        posOriginY = 'bottom';

    }

    this.setPositionByOrigin(localPoint, posOriginX, posOriginY);
    this.canvas.renderAll();
    this._checkContainment();

};

fabric.Object.prototype.toggleUploadZone = function () {

    if (this.hasUploadZone && this.canvas) {

        //check if upload zone contains objects
        let objects = this.canvas.getObjects(),
            uploadZoneEmpty = true;

        for (var i = 0; i < objects.lenth; ++i) {

            var object = objects[i];
            if (object.replace == this.replace) {
                uploadZoneEmpty = false;
                break;
            }

        }

        //get upload zone of element
        var uploadZoneObject = this.canvas.getUploadZone(this.replace);
        if (uploadZoneObject) {
            //show/hide upload zone
            uploadZoneObject.set('opacity', uploadZoneEmpty ? 1 : 0);
            uploadZoneObject.evented = uploadZoneEmpty;
        }

        this.canvas.renderAll();
    }

};
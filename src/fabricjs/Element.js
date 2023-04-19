import { 
    isUrl,
    removeUrlParams
} from '/src/helpers/utils';

import Controls from './objects/Controls';
import Image from './objects/Image';
import Group from './objects/Group';

fabric.Object.prototype.getType = function (fabricType) {
    
    fabricType = fabricType ? fabricType : this.type;
    
    if(fabricType === 'text' || fabricType === 'i-text' || fabricType === 'curvedText' || fabricType === 'textbox') {
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
        
    if(this.getType() === 'text') {
        return 'text';
    }
    
    if(!this.source) {
        return false;
    }
    
    const imageParts = this.source.split('.');
    //its base64 encoded
    if(imageParts.length == 1) {
        
        if(this.source.includes('data:image/png;')) {
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
        if(url.includes('.png') || this.isSVG()) {
            return this.isSVG() ? 'svg' : 'png';
        }
        else {
            this.fill = this.colors = false;
            return false;
        }
    
    }

};

fabric.Object.prototype.hasColorSelection = function() {
    
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

fabric.Object.prototype.changeColor = function (colorData) {
    
    const colorizable = this.isColorizable();
    
    //check if hex color has only 4 digits, if yes, append 3 more
    if(typeof colorData === 'string')
        colorData = tinycolor(colorData).toHexString();
    
    //text
    if(this.getType() === 'text') {
    
        if(typeof colorData == 'object') {
            colorData = colorData[0];
        }
    
        //set color of a text element
        this.set('fill', colorData);
        this.canvas.renderAll();    
        this.pattern = null;
    
    }
    //path groups (svg)
    else if(this.type == 'group' && typeof colorData == 'object') {
        
        const objects = this.getObjects();
        colorData.forEach((hexColor, i) => {
            
            if(objects[i]) {
                objects[i].set('fill', hexColor);
            }
            
        })
        this.canvas.renderAll();
        
        this.svgFill = colorData;
        delete this['fill'];
    
    }
    //image
    else {
    
        if(typeof colorData == 'object') {
            colorData = colorData[0];
        }
    
        if(typeof colorData !== 'string') {
            colorData = false;
        }
    
        //colorize png or dataurl image
        if(colorizable == 'png' || colorizable == 'dataurl') {
    
            this.filters = [];
    
            if(colorData) {
                this.filters.push(new fabric.Image.filters.BlendColor({mode: 'tint', color: colorData}));
            }
            
            this.applyFilters();
            this.canvas.renderAll();
            this.canvas.fire('elementColorChange', { target: this });
            this.fill = colorData;
    
        }
        //colorize svg (single path)
        else if(colorizable == 'svg') {
            
            this.set('fill', colorData);
            this.canvas.renderAll();
            this.canvas.fire('elementColorChange', { target: this });
    
        }
    
    }

};

fabric.Object.prototype.setPattern = function (patternUrl) {
    
    if(FancyProductDesigner.proxyFileServer) {
        patternUrl = FancyProductDesigner.proxyFileServer + patternUrl;
    }
    
    if(patternUrl) {
        
        fabric.util.loadImage(patternUrl, (img) => {
            
            if(this.isSVG()) {
                
                //group of paths
                if(this.hasOwnProperty('getObjects')) { 
                    
                    const paths = this.getObjects();
                    for(var i=0; i < paths.length; ++i) {
                        
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
            else if(this.getType() == 'text') {
                
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
fabric.Object.prototype.getZIndex = function() {

    const objects = this.canvas.getObjects();
    return objects.indexOf(this);
}

/**
 * Returns the bounding box of an element.
 *
 * @method getBoundingBoxCoords
 * @param {fabric.Object} element A fabric object
 * @return {Object | Boolean} The bounding box object with x,y,width and height or false.
 */
fabric.Object.prototype.getBoundingBoxCoords = function() {

    if(this.boundingBox || this.uploadZone) {

        if(typeof this.boundingBox == "object") {


            if( this.boundingBox.hasOwnProperty('x') &&
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

            var objects = this.fabricCanvas.getObjects();

            for(var i=0; i < objects.length; ++i) {

                //get all layers from first view
                var object = objects[i];
                if(this.boundingBox == object.title) {

                    var topLeftPoint = object.getPointByOrigin('left', 'top');

                    return {
                        left: topLeftPoint.x,
                        top: topLeftPoint.y,
                        width: object.width * object.scaleX,
                        height: object.height * object.scaleY,
                        angle: object.angle || 0,
                        cp: object.getCenterPoint()
                    };

                    break;
                }

            }

        }

    }

    return false;

}
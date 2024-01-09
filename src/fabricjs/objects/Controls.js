import { fabric } from "fabric";

const renderRectY = (ctx, left, top, styleOverride, fabricObject) => {

    styleOverride = styleOverride || {};
    
    let xSize = 6,
        ySize = 15,
        xSizeBy2 = xSize / 2, 
        ySizeBy2 = ySize / 2;

    const borderRadius = 4;

    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.fillStyle = styleOverride.cornerColor || fabricObject.cornerColor;
    ctx.beginPath();
    if(ctx.roundRect)
        ctx.roundRect(-xSizeBy2, -ySizeBy2, xSize, ySize, borderRadius);
    else
        ctx.rect(-xSizeBy2, -ySizeBy2, xSize, ySize);
    ctx.filter = 'drop-shadow(0px 0px 2px rgba(0,0,0, 0.3))';
    ctx.fill();
    ctx.restore();
    
}

const renderRectX = (ctx, left, top, styleOverride, fabricObject) => {

    styleOverride = styleOverride || {};
    
    let xSize = 15,
        ySize = 6,
        xSizeBy2 = xSize / 2, 
        ySizeBy2 = ySize / 2;

    const borderRadius = 4;

    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.fillStyle = styleOverride.cornerColor || fabricObject.cornerColor;
    ctx.beginPath();
    if(ctx.roundRect)
        ctx.roundRect(-xSizeBy2, -ySizeBy2, xSize, ySize, borderRadius);
    else
        ctx.rect(-xSizeBy2, -ySizeBy2, xSize, ySize);
    ctx.filter = 'drop-shadow(0px 0px 2px rgba(0,0,0, 0.3))';
    ctx.fill();
    ctx.restore();
    
}

fabric.Control.prototype.touchSizeX = 40;
fabric.Control.prototype.touchSizeY = 40;
fabric.Object.prototype.transparentCorners = false;

//vertical and horizontal bars for unpropoprtional scaling
fabric.Object.prototype.controls.ml.render = renderRectY;  
fabric.Object.prototype.controls.mr.render = renderRectY;   
fabric.Object.prototype.controls.mt.render = renderRectX;  
fabric.Object.prototype.controls.mb.render = renderRectX;  
fabric.Textbox.prototype.controls.ml.render = renderRectY;  
fabric.Textbox.prototype.controls.mr.render = renderRectY;  

//hide bottom-left corner
fabric.Object.prototype.controls.bl.visible = false;   

//rotate
fabric.Object.prototype.controls.mtr.withConnection = false;
fabric.Object.prototype.controls.mtr.y = 0.5;
fabric.Object.prototype.controls.mtr.offsetY = 25;
fabric.Object.prototype.controls.mtr.offsetX = -8;

//circle corner (basic)
fabric.Object.prototype.controls.tl.render = 
fabric.Object.prototype.controls.tr.render =
fabric.Object.prototype.controls.mtr.render =
fabric.Object.prototype.controls.br.render = function(ctx, left, top, styleOverride, fabricObject) {
    fabric.controlsUtils.renderCircleControl.call(this, ctx, left, top, styleOverride, fabricObject)
};

//crop-mask done
fabric.Object.prototype.controls.cropMaskDoneControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    actionName: 'crop-mask-done',
    offsetY: -20,
    offsetX: -45,
    cursorStyle: 'pointer',
    mouseDownHandler: cropMaskDone,
    render: (ctx, left, top, styleOverride, fabricObject) => {
        
        if(fabricObject.name !== 'crop-mask') return;
        
        styleOverride.cornerColor = '#2ecc71';
        styleOverride.cornerIconColor = '#fff';

        // renderIcon(
        //     ctx, 
        //     left, 
        //     top, 
        //     styleOverride, 
        //     fabricObject,
        //     String.fromCharCode('0xe90a'),
        //     0,
        //     0
        // )
    },
    cornerSize: 24
});

function cropMaskDone(eventData, transform) {

    const maskObj = transform.target;
    if(maskObj.targetElement) {
        
    }
    
}

//crop-mask cancel
fabric.Object.prototype.controls.cropMaskCancelControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    actionName: 'crop-mask-cancel',
    offsetY: -20,
    offsetX: -12,
    cursorStyle: 'pointer',
    mouseDownHandler: cropMaskCancel,
    render: (ctx, left, top, styleOverride, fabricObject) => {

        if(fabricObject.name !== 'crop-mask') return;
        
        styleOverride.cornerColor = '#c44d56';
        styleOverride.cornerIconColor = '#fff';

        // renderIcon(
        //     ctx, 
        //     left, 
        //     top, 
        //     styleOverride, 
        //     fabricObject,
        //     String.fromCharCode('0xe944'),
        //     0,
        //     0
        // )
    },
    cornerSize: 24
});

function cropMaskCancel(eventData, transform) {

    const maskObj = transform.target;
    if(maskObj.targetElement) {
        maskObj.canvas.removeElement(maskObj);
        maskObj.targetElement.cropMask = null;
    }
    
}

const initAdvancedCorners = () => {

    const renderIcon = (control, ctx, left, top, styleOverride, fabricObject, iconString, offsetX=8, offsetY=8) => {    

        styleOverride = styleOverride || {};
    
        let xSize = control.sizeX || styleOverride.cornerSize || fabricObject.cornerSize,
            ySize = control.sizeY || styleOverride.cornerSize || fabricObject.cornerSize,
            xSizeBy2 = xSize / 2, 
            ySizeBy2 = ySize / 2;
    
        const borderRadius = 4;
        const iconSize = xSize * 0.6;
        const iconColor = styleOverride.cornerIconColor || fabricObject.cornerIconColor || '#000000';
    
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.fillStyle = styleOverride.cornerColor || fabricObject.cornerColor;
        ctx.beginPath();
        if(ctx.roundRect)
            ctx.roundRect(-xSizeBy2+offsetX, -ySizeBy2+offsetY, xSize, ySize, borderRadius);
        else
            ctx.rect(-xSizeBy2+offsetX, -ySizeBy2+offsetY, xSize, ySize);
        ctx.filter = 'drop-shadow(0px 0px 2px rgba(0,0,0, 0.3))';
        ctx.fill();
        ctx.font = iconSize + 'px FontFPD';
        ctx.fillStyle = iconColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.filter = 'none';
        ctx.fillText(iconString, -(iconSize*0.5)+offsetX, -(iconSize*0.5)+offsetY);
        ctx.restore();
        
    };

    //copy
    fabric.Object.prototype.controls.tl.cursorStyleHandler = () => {
        return 'pointer';
    }

    fabric.Object.prototype.controls.tl.mouseDownHandler = function(eventData, transform) {

        const target = transform.target;
        
        if(target.canvas.viewOptions.cornerControlsStyle === 'advanced') {
            target.canvas.duplicateElement(target);
        }
    
    }
    fabric.Object.prototype.controls.tl.actionHandler = null;
    fabric.Object.prototype.controls.tl.render = function(ctx, left, top, styleOverride, fabricObject) {
        
        renderIcon(
            this,
            ctx, 
            left, 
            top, 
            styleOverride, 
            fabricObject,
            String.fromCharCode('0xe94d'),
            -8,
            -8
        );
        
    }

    fabric.Object.prototype.controls.tr.cursorStyleHandler = () => {
        return 'pointer';
    }
    fabric.Object.prototype.controls.tr.mouseDownHandler = function(eventData, transform) {
    
        const target = transform.target;
        target.canvas.removeElement(target);
        
    }
    fabric.Object.prototype.controls.tr.actionHandler = null;
    fabric.Object.prototype.controls.tr.render = function(ctx, left, top, styleOverride, fabricObject) {
            
        renderIcon(
            this,
            ctx, 
            left, 
            top, 
            styleOverride, 
            fabricObject,
            String.fromCharCode('0xe907'),
            8,
            -8
        );
        
    }


    //rotate
    fabric.Object.prototype.controls.mtr.render = function(ctx, left, top, styleOverride, fabricObject) {
        
        renderIcon(
            this,
            ctx, 
            left, 
            top, 
            styleOverride, 
            fabricObject,
            String.fromCharCode('0xe957')
        );
        
    }


    //scale
    fabric.Object.prototype.controls.br.render = function(ctx, left, top, styleOverride, fabricObject) {
        
        renderIcon(
            this,
            ctx, 
            left, 
            top, 
            styleOverride, 
            fabricObject,
            String.fromCharCode('0xe922')
        );
        
    }

}

export { initAdvancedCorners };


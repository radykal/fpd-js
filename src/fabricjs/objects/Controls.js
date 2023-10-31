const renderIcon = (ctx, left, top, styleOverride, fabricObject, iconString, offsetX=8, offsetY=8) => {

    styleOverride = styleOverride || {};

    let xSize = this.sizeX || styleOverride.cornerSize || fabricObject.cornerSize,
        ySize = this.sizeY || styleOverride.cornerSize || fabricObject.cornerSize,
        xSizeBy2 = xSize / 2, 
        ySizeBy2 = ySize / 2;

    const borderRadius = 4;
    const iconSize = xSize * 0.6;
    const iconColor = fabricObject.cornerIconColor || '#000000';

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
    
}

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

fabric.Control.prototype.touchSizeX = 60;
fabric.Control.prototype.touchSizeY = 60;
fabric.Object.prototype.transparentCorners = false;

//copy
fabric.Object.prototype.controls.tl.cursorStyleHandler = () => {
    return 'pointer';
}
fabric.Object.prototype.controls.tl.mouseDownHandler = function(eventData, transform) {

    const target = transform.target;
    target.canvas.duplicateElement(target);
    
}
fabric.Object.prototype.controls.tl.actionHandler = null;
fabric.Object.prototype.controls.tl.render = function(ctx, left, top, styleOverride, fabricObject) {
    
    if(fabricObject.canvas && fabricObject.canvas.viewOptions && fabricObject.canvas.viewOptions.cornerControlsStyle === 'basic') {
        fabric.controlsUtils.renderCircleControl.call(this, ctx, left, top, styleOverride, fabricObject);
    }
    else {

        renderIcon(
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
    
}

//delete
fabric.Object.prototype.controls.tr.cursorStyleHandler = () => {
    return 'pointer';
}
fabric.Object.prototype.controls.tr.mouseDownHandler = function(eventData, transform) {

    const target = transform.target;
    target.canvas.removeElement(target);
    
}
fabric.Object.prototype.controls.tr.actionHandler = null;
fabric.Object.prototype.controls.tr.render = function(ctx, left, top, styleOverride, fabricObject) {
        
    if(fabricObject.canvas && fabricObject.canvas.viewOptions && fabricObject.canvas.viewOptions.cornerControlsStyle === 'basic') {
        fabric.controlsUtils.renderCircleControl.call(this, ctx, left, top, styleOverride, fabricObject);
    }
    else {

        renderIcon(
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
    
}

//rotate
fabric.Object.prototype.controls.mtr.withConnection = false;
fabric.Object.prototype.controls.mtr.y = 0.5;
fabric.Object.prototype.controls.mtr.offsetY = 25;
fabric.Object.prototype.controls.mtr.offsetX = -8;
fabric.Object.prototype.controls.mtr.render = function(ctx, left, top, styleOverride, fabricObject) {
    
    if(fabricObject.canvas && fabricObject.canvas.viewOptions && fabricObject.canvas.viewOptions.cornerControlsStyle === 'basic') {
        fabric.controlsUtils.renderCircleControl.call(this, ctx, left, top, styleOverride, fabricObject);
    }
    else {

        renderIcon(
            ctx, 
            left, 
            top, 
            styleOverride, 
            fabricObject,
            String.fromCharCode('0xe957')
        );

    }
    
}

//scale
fabric.Object.prototype.controls.br.render = function(ctx, left, top, styleOverride, fabricObject) {
    
    if(fabricObject.canvas && fabricObject.canvas.viewOptions && fabricObject.canvas.viewOptions.cornerControlsStyle === 'basic') {
        fabric.controlsUtils.renderCircleControl.call(this, ctx, left, top, styleOverride, fabricObject);
    }
    else {

        renderIcon(
            ctx, 
            left, 
            top, 
            styleOverride, 
            fabricObject,
            String.fromCharCode('0xe922')
        );

    }
    
    
}

//vertical and horizontal bars for unpropoprtional scaling
fabric.Object.prototype.controls.ml.render = renderRectY;  
fabric.Object.prototype.controls.mr.render = renderRectY;   
fabric.Object.prototype.controls.mt.render = renderRectX;  
fabric.Object.prototype.controls.mb.render = renderRectX;  
fabric.Textbox.prototype.controls.ml.render = renderRectY;  
fabric.Textbox.prototype.controls.mr.render = renderRectY;  

//hide bottom-left corner
fabric.Object.prototype.controls.bl.visible = false;   

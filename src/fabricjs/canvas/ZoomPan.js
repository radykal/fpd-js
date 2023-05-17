fabric.Canvas.prototype.panCanvas = false;

const ZoomPan = (canvas, type) => {

    let mouseDownStage = false,
        lastTouchX,
		lastTouchY,
        pinchElementScaleX,
        pinchElementScaleY;
 
    canvas.on({
        'mouse:down': (opts) => {
            
            mouseDownStage = true;

            if(opts.e.touches) {

                lastTouchX = opts.e.touches[0].clientX;
                lastTouchY = opts.e.touches[0].clientY;
                
                if(canvas.currentElement) {
                    pinchElementScaleX = canvas.currentElement.scaleX;
                    pinchElementScaleY = canvas.currentElement.scaleY;
                }
                

            }

        },
        'mouse:up': function(opts) {
            
            mouseDownStage = false;

        },
        'mouse:move': function(opts) {
            
            //on touch            
            if(type == 'pinchImageScale' 
                && opts.e.touches
                && opts.e.touches.length == 2
                && canvas.currentElement 
                && canvas.currentElement.getType() == 'image' 
                && canvas.currentElement.resizable) 
            {

                canvas.setElementOptions({
                    scaleX: pinchElementScaleX * opts.e.scale,
                    scaleY: pinchElementScaleY * opts.e.scale,
                }, canvas.currentElement);

            }
            else if(type == 'pinchPanCanvas') {

                //on touch
                if(opts.e.touches) {

                    //pan                    
                    if(opts.e.touches.length == 1 && canvas.panCanvas) {

                        let currentTouchX = opts.e.touches[0].clientX,
                            currentTouchY = opts.e.touches[0].clientY;

                            canvas.relativePan(new fabric.Point(
                            currentTouchX - lastTouchX,
                            currentTouchY - lastTouchY
                        ));

                        lastTouchX = currentTouchX;
                        lastTouchY = currentTouchY;

                    }
                    //pinch
                    else if(opts.e.touches.length == 2) {
                        canvas.setResZoom(opts.e.scale);
                    }

                }
                //on mouse
                else if(canvas.panCanvas) {

                    //drag canvas with mouse
                    if(mouseDownStage) {

                        canvas.relativePan(new fabric.Point(
                            opts.e.movementX,
                            opts.e.movementY
                        ));

                    }

                }
                
            }

        },
    })
    
    
}

export default ZoomPan;
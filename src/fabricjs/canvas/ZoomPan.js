fabric.Canvas.prototype.panCanvas = false;

const ZoomPan = (canvas, type) => {

    let mouseDownStage = false,
        lastTouchX,
		lastTouchY,
        pinchElementScaleX,
        pinchElementScaleY,
        initialDist = null;
            
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
            initialDist = null;

        },
        'mouse:move': function(opts) {
            
            let scale = null;
            if((type == 'pinchImageScale' || type == 'pinchPanCanvas')
                && opts.e.touches
                && opts.e.touches.length == 2)
            {

                let touch1 = opts.e.touches[0],
                    touch2 = opts.e.touches[1];

                if(initialDist === null) {
                    initialDist = Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
                }

                let dist = Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
                
                scale =  dist / initialDist;

            }
            
            //on touch            
            if( type == 'pinchImageScale'
                && scale !== null 
                && canvas.currentElement 
                && canvas.currentElement.getType() == 'image' 
                && canvas.currentElement.resizable) 
            {
                                
                canvas.setElementOptions({
                    scaleX: pinchElementScaleX * scale,
                    scaleY: pinchElementScaleY * scale,
                }, canvas.currentElement);

            } 
            //pinch
            else if(type == 'pinchPanCanvas' && opts.e.touches && scale !== null) {                        
                canvas.setResZoom(scale);
            }
            else if(canvas.panCanvas) {
                
                //on touch
                if(opts.e.touches) {
                    
                    //pan                    
                    if(opts.e.touches.length == 1) {

                        let currentTouchX = opts.e.touches[0].clientX,
                            currentTouchY = opts.e.touches[0].clientY;

                            canvas.relativePan(new fabric.Point(
                            currentTouchX - lastTouchX,
                            currentTouchY - lastTouchY
                        ));

                        lastTouchX = currentTouchX;
                        lastTouchY = currentTouchY;

                    }

                }
                //on mouse
                else {

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
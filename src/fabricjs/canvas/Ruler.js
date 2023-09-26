import { 
    objectHasKeys
} from '../../helpers/utils';

fabric.Canvas.prototype.enableRuler = false;
fabric.Canvas.prototype.rulerBg = 'rgba(0,0,0, 0.6)';
fabric.Canvas.prototype.rulerTickColor = '#ccc';

const Ruler = (canvas) => {

    canvas.on('after:render', () => {

        if (canvas.viewOptions && canvas.enableRuler) {
            
            const tickSize = 10;
            const majorTickSize = 100;
            const unit = canvas.viewOptions.rulerUnit;
            let unitFactor = unit == 'cm' ? 10 : 1;
            let viewWidth = canvas.viewOptions.stageWidth;
            let widthRatio = 1;
            let viewHeight = canvas.viewOptions.stageHeight;
            let heightRatio = 1;
                        
            if(unit != 'px' 
                && objectHasKeys(canvas.viewOptions.printingBox, ['left','top','width','height']) 
                && objectHasKeys(canvas.viewOptions.output, ['width','height'])
            ) {

                //one pixel in mm
                widthRatio = canvas.viewOptions.output.width / canvas.viewOptions.printingBox.width;
                heightRatio = canvas.viewOptions.output.height / canvas.viewOptions.printingBox.height;               

            }
            else {
                unitFactor = 1;
            }

            const zoom = canvas.getZoom();
            const ctx = canvas.getSelectionContext();

            // Render the ruler on the X axis
            const rulerXHeight = 20;
            ctx.fillStyle = canvas.rulerBg;
            ctx.fillRect(0, 0, viewWidth, rulerXHeight);
            
            for (var i = 0; i <= viewWidth * widthRatio; i += tickSize) {
                                
                const tickHeight = i % majorTickSize === 0 ? rulerXHeight : rulerXHeight / 2;
                const tickX = ((i * zoom) / widthRatio) * unitFactor;           
                ctx.fillRect(tickX, 0, 1, tickHeight);

                if (i % majorTickSize === 0) {

                    ctx.fillStyle = canvas.rulerTickColor;
                    ctx.font = '10px Arial';                    
                    ctx.fillText(Math.round(i / unitFactor), tickX+2, rulerXHeight);

                }

            }

            // Render the ruler on the Y axis
            const rulerYWidth = 20;
            ctx.fillStyle = canvas.rulerBg;
            ctx.fillRect(canvas.width - rulerYWidth, 0, rulerYWidth, viewHeight);

            for (var j = 0; j <= viewHeight * heightRatio; j += tickSize) {

                const tickWidth = canvas.width - (i % majorTickSize === 0 ? rulerYWidth : rulerYWidth / 2);
                const tickY = ((j * zoom) / heightRatio) * unitFactor; 
                
                ctx.fillRect(tickWidth, tickY, rulerYWidth, 1);

                if (j % majorTickSize === 0) {

                    ctx.fillStyle = canvas.rulerTickColor;
                    ctx.font = '10px Arial';
                    ctx.fillText(Math.round(j / unitFactor), canvas.width - rulerYWidth, tickY + (10 * zoom));
                    
                }

            }

        }

    });

    canvas.on('before:render', () => {

        if(canvas.contextTop)
            canvas.clearContext(canvas.contextTop);

    });

}

export default Ruler;
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
            const rulerPosition = canvas.viewOptions.rulerPosition;
            const pb = canvas.viewOptions.printingBox;
            const zoom = canvas.getZoom();
            const ctx = canvas.getSelectionContext();    
            
            if(!ctx) return;
            
            const viewWidth = canvas.viewOptions.stageWidth;
            const viewHeight = canvas.viewOptions.stageHeight; 

            const _calculateTickInterval = (inputWidth) => {

                const rawInterval = inputWidth / tickSize;
                const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
                const residual = rawInterval / magnitude;

                if (residual >= 5) {
                    return 5 * magnitude;
                } else if (residual >= 2) {
                    return 2 * magnitude;
                } else {
                    return magnitude;
                }
            }

            let unitFactor = unit == 'cm' ? 10 : 1;
            let widthRatio = 1;
            let heightRatio = 1;
            let viewOutput;

            if(unit != 'px' 
                && objectHasKeys(pb, ['left','top','width','height']) 
                && objectHasKeys(canvas.viewOptions.output, ['width','height'])
            ) {

                viewOutput = canvas.viewOptions.output;

                //one pixel in mm                
                widthRatio = viewOutput.width / pb.width;                
                heightRatio = viewOutput.height / pb.height; 
                
                
            }
            else {
                unitFactor = 1;
            }

            let rulerXHeight = 20 * zoom,
                rulerYWidth = 20 * zoom,
                rulerXLeft = 0,
                rulerXTop = 0,
                rulerYLeft = canvas.width - rulerYWidth,
                rulerYTop = 0,
                rulerXWidth = viewWidth,
                
                rulerYHeight = viewHeight,
                loopXWidth = viewWidth * widthRatio,
                loopYHeight = viewHeight * heightRatio;

            if(rulerPosition == 'pb' && viewOutput) {
                
                rulerXLeft = pb.left * zoom;
                rulerXTop = (pb.top-rulerXHeight) * zoom;
                rulerXWidth = pb.width * zoom;

                rulerYLeft = (pb.left+pb.width) * zoom;
                rulerYTop = pb.top * zoom;
                rulerYHeight = pb.height * zoom;

                loopXWidth = viewOutput.width;
                loopYHeight = viewOutput.height;

            }

            // Render the ruler on the X axis
            ctx.fillStyle = canvas.rulerBg;
            ctx.fillRect(rulerXLeft, rulerXTop, rulerXWidth, rulerXHeight);
                            
            for (var i = 0; i <= loopXWidth; i += _calculateTickInterval(loopXWidth)) {
                                
                const tickHeight = i % majorTickSize === 0 ? rulerXHeight : rulerXHeight / 3;
                const tickX = ((i * zoom) / widthRatio);

                ctx.fillRect(rulerXLeft+tickX, rulerXTop, 1, tickHeight);
                
                if (i % majorTickSize === 0) {

                    ctx.fillStyle = canvas.rulerTickColor;
                    ctx.font = '10px Arial';   
                    
                    let tickLabelX = rulerXLeft + tickX;
                    const textMetrics = ctx.measureText(Math.round(i / unitFactor));
                    tickLabelX += i == 0 ? 2 : -(textMetrics.width+2);
                    
                    ctx.fillText(Math.round(i / unitFactor) + (i == 0 ? ' '+unit.toUpperCase() : ''), tickLabelX, rulerXTop+rulerXHeight-2);

                }

            }

            // Render the ruler on the Y axis
            ctx.fillStyle = canvas.rulerBg;
            ctx.fillRect(rulerYLeft, rulerYTop, rulerYWidth, rulerYHeight);

            for (var j = 0; j <= loopYHeight; j += _calculateTickInterval(loopYHeight)) {
                
                const tickWidth = (j % majorTickSize === 0 ? rulerYWidth : rulerYWidth / 3);
                const tickY = ((j * zoom) / heightRatio); 
                                    
                ctx.fillRect(rulerYLeft, rulerYTop+tickY, tickWidth, 1);

                if (j % majorTickSize === 0) {

                    ctx.fillStyle = canvas.rulerTickColor;
                    ctx.font = '10px Arial';

                    let tickLabelY = rulerYTop + tickY;
                    tickLabelY += j == 0 ? 12 : -2;
                    
                    ctx.fillText(Math.round(j / unitFactor), rulerYLeft, tickLabelY);
                    
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
fabric.Canvas.prototype.enableRuler = false;
fabric.Canvas.prototype.rulerBg = 'rgba(0,0,0, 0.6)';
fabric.Canvas.prototype.rulerTickColor = '#ccc';

const Ruler = (canvas) => {

    canvas.on('after:render', () => {

        if (canvas.viewOptions && canvas.enableRuler) {

            const tickSize = 10;
            const majorTickSize = 100;
            const viewWidth = canvas.viewOptions.stageWidth;
            const viewHeight = canvas.viewOptions.stageHeight;
            const zoom = canvas.getZoom();
            const ctx = canvas.getSelectionContext();

            // Render the ruler on the X axis
            const rulerXHeight = 20;
            ctx.fillStyle = canvas.rulerBg;
            
            ctx.fillRect(0, 0, viewWidth, rulerXHeight);

            for (var i = 0; i <= viewWidth; i += tickSize) {

                const tickHeight = i % majorTickSize === 0 ? rulerXHeight : rulerXHeight / 2;
                ctx.fillRect(i * zoom, 0, 1, tickHeight);

                if (i % majorTickSize === 0) {

                    ctx.fillStyle = canvas.rulerTickColor;
                    ctx.font = '10px Arial';
                    ctx.fillText(i, (i + 2) * zoom, rulerXHeight);

                }
            }

            // Render the ruler on the Y axis
            const rulerYWidth = 20;
            ctx.fillStyle = canvas.rulerBg;
            ctx.fillRect(canvas.width - rulerYWidth, 0, rulerYWidth, viewHeight);

            for (var j = 0; j <= viewHeight; j += tickSize) {

                const tickWidth = canvas.width - (i % majorTickSize === 0 ? rulerYWidth : rulerYWidth / 2);
                ctx.fillRect(tickWidth, j * zoom, rulerYWidth, 1);

                if (j % majorTickSize === 0) {

                    ctx.fillStyle = canvas.rulerTickColor;
                    ctx.font = '10px Arial';
                    ctx.fillText(j, canvas.width - rulerYWidth, (j + (10 * zoom)) * zoom);
                    
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
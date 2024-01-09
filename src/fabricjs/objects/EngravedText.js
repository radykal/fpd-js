import { fabric } from "fabric";

const EngravedText = fabric.util.createClass(fabric.Group, {

    type: 'engraved-text',
    text: '',
    fontFamily: 'Arial',
    fontSize: 40,
    lineHeight: 1,
    charSpacing: 0,

    initialize: function (text, options) {

        options || (options = {});

        this.text = text;
        this.texts = [];

        this.shadowText = new fabric.IText(text, {
            left: 0,
            top: 1.5,
            originX: 'center',
            originY: 'center',
            fontSize: options.fontSize,
            fontFamily: options.fontFamily,
        });

        this.fgText = new fabric.IText(text, {
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
            fontSize: options.fontSize,
            fontFamily: options.fontFamily
        });

        this.texts.push(this.shadowText);
        this.texts.push(this.fgText);

        this.callSuper('initialize', this.texts, options);
    },

    set: function(key, value) {
        
        if (['fontFamily', 'text', 'fontSize', 'lineHeight', 
            'charSpacing', 'textAlign'].includes(key)) {
                        
            this.texts.forEach(text => {
                
                text[key] = value;
   
            })

        }

        setTimeout(() => {
            
            this.width = this.texts[0].width;
            this.height = this.texts[0].height;
            this.canvas && this.canvas.renderAll();

        }, 10);

        this.callSuper('set', key, value);

    },

    render: function(ctx) {
                
        let whiteColorStopOffset = (this.shadowText.calcTextHeight()-24) / this.shadowText.calcTextHeight();
        whiteColorStopOffset = Number(whiteColorStopOffset.toFixed(2));

        const shadowGradient = new fabric.Gradient({
            type: 'linear',
            gradientUnits: 'pixels', // or 'percentage'
            coords: { x1: 0, y1:this.padding , x2: 0, y2: this.shadowText.calcTextHeight() },
            colorStops: [
                { offset: 0, color: 'rgba(0,0,0,0)' },
                { offset: 0.5, color: 'rgba(0,0,0, 0)' },
                { offset: whiteColorStopOffset-0.01, color: 'rgba(0,0,0, 0.2)' },
                { offset: whiteColorStopOffset, color: 'rgba(255,255,255, 0.3)' },
                { offset: 1, color: 'rgba(255,255,255, 0.8)' }
            ]
        })

        this.shadowText.fill = shadowGradient;

        let darkColorStopOffset = (this.fgText.calcTextHeight()-15) / this.fgText.calcTextHeight();
        darkColorStopOffset = Number(darkColorStopOffset.toFixed(2));
        darkColorStopOffset = 1 - darkColorStopOffset;

        const fgGradient = new fabric.Gradient({
            type: 'linear',
            gradientUnits: 'pixels', // or 'percentage'
            coords: { x1: 0, y1: this.padding, x2: 0, y2: this.fgText.calcTextHeight() },
            colorStops: [
                { offset: 0, color: 'rgba(0,0,0, 1)' },
                { offset: darkColorStopOffset, color: 'rgba(0,0,0, 0.8)' },
                { offset: darkColorStopOffset + 0.01, color: 'rgba(0,0,0, 0.5)' },
                { offset: 1, color: 'rgba(0,0,0, 0.4)' }
            ]
        });

        this.fgText.fill = fgGradient;
        
        this.callSuper('render', ctx);
    }

});

// Register the new type so that it can be created from an object
fabric.EngravedText = EngravedText;
fabric.EngravedText.fromObject = function (object, callback) {
    return fabric.Object._fromObject('EngravedText', object, callback);
};
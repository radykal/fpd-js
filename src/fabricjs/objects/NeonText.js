import { fabric } from "fabric";

const NeonText = fabric.util.createClass(fabric.Group, {

    type: 'neon-text',
    text: '',
    fontFamily: 'Arial',
    fontSize: 40,
    lineHeight: 1,
    charSpacing: 0,
    textAlign: 'left',

    initialize: function (text, options) {
        
        options || (options = {});

        this.text = text;
        this.texts = [];
        
        const shadows = [
            {
                color: '#fff',
                offsetX: 0,
                offsetY: 0,
                blur: 5
            },
            {
                color: '#fff',
                offsetX: 0,
                offsetY: 0,
                blur: 10
            },
            {
                color: options.fill,
                offsetX: 0,
                offsetY: 0,
                blur: 40
            },
            {
                color: options.fill,
                offsetX: 0,
                offsetY: 0,
                blur: 80
            }
        ];

        shadows.forEach((shadow, i) => {            
            
            const shadowedText = new fabric.IText(text, {
                left: 0,
                top: 0,
                originX: 'center',
                originY: 'center',
                fontSize: options.fontSize,
                fontFamily: options.fontFamily,
                fill: '#fff',
                shadow: new fabric.Shadow(shadow)
            });

            this.texts.push(shadowedText);

        })

        this.callSuper('initialize', this.texts, options);
    },

    set: function(key, value) {
        
        if (['fill', 'fontFamily', 'text', 'fontSize', 'lineHeight', 
            'charSpacing', 'textAlign'].includes(key)) {
                        
            this.texts.forEach(text => {

                if(key == 'text')
                    text[key] = value;
                else {

                    if(key == 'fill') {

                        this.texts[2].shadow.color = value;
                        this.texts[3].shadow.color = value;

                    }
                    else {                        
                        text[key] = value;
                    }
                    
                }
   
            })

        }

        setTimeout(() => {
            
            this.width = this.texts[0].width;
            this.height = this.texts[0].height;
            this.canvas && this.canvas.renderAll();

        }, 10);

        this.callSuper('set', key, value);

    },

});

// Register the new type so that it can be created from an object
fabric.NeonText = NeonText;
fabric.NeonText.fromObject = function (object, callback) {
    return fabric.Object._fromObject('NeonText', object, callback);
};
import { fabric } from "fabric";

const EmbossedText = fabric.util.createClass(fabric.IText, {

    type: 'embossed-text',

    initialize: function (text, options) {

        options || (options = {});

        this.callSuper('initialize', text, options);
    },

    set: function(key, value) {

        this.callSuper('set', key, value);

        // this.shadow = new fabric.Shadow({
        //     color: 'rgba(255,255,255,0.8)',
        //     offsetX: 0,
        //     offsetY: 1,
        //     blur: 0
        // });

        const gradient = new fabric.Gradient({
            type: 'linear',
            gradientUnits: 'pixels', // or 'percentage'
            coords: { x1: 0, y1: 0, x2: 0, y2: this.height },
            colorStops:[
              { offset: 0, color: 'rgba(0,0,0, 1)' },
              { offset: 0.2, color: 'rgba(0,0,0, 0.8)' },
              { offset: 0.25, color: 'rgba(0,0,0, 0.5)' },
              { offset: 1, color: 'rgba(0,0,0, 0.4)'}
            ]
          })

        this.fill = gradient;

    }

});

// Register the new type so that it can be created from an object
fabric.EmbossedText = EmbossedText;
fabric.EmbossedText.fromObject = function (object, callback) {
    return fabric.Object._fromObject('EmbossedText', object, callback);
};
import { fabric } from "fabric";

const EngravedText = fabric.util.createClass(fabric.IText, {

    type: 'engraved-text',

    initialize: function (text, options) {

        options || (options = {});

        this.callSuper('initialize', text, options);
    },

    set: function(key, value) {

        this.callSuper('set', key, value);
        
        this.opacity = this.fixedOpacity;
        
    }

});

// Register the new type so that it can be created from an object
fabric.EngravedText = EngravedText;
fabric.EngravedText.fromObject = function (object, callback) {
    return fabric.Object._fromObject('EngravedText', object, callback);
};

fabric.EngravedText.prototype.fixedOpacity = 0.5;
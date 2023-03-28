fabric.TextFrame = fabric.util.createClass(fabric.Textbox, {
    type: 'text-frame',
    initialize: function(text, options) {
        this.ctx = fabric.util.createCanvasElement().getContext("2d");
        this.callSuper("initialize", text, options);
        this.set({
            lockUniScaling: options.lockScalingY || false,
            lockScalingFlip: options.lockScalingFlip || false,
            lockScalingY: options.lockScalingY || false,
            hasBorders: true
        });
        //this.setControlsVisibility(fabric.Textbox.getTextboxControlVisibility());
        this._dimensionAffectingProps.width = true;
        this.on("changed", this.fitText.bind(this));
        this.fitText();
    },
    setWidth: function(w) {
        this.width = w;
        if(w && this.height){
            this.fitText();
        }
    },
    setHeight: function(h) {
        this.height = h;
        if(h && this.width) {
            this.fitText();
        }
    },
    _initDimensions: function(ctx) {
        if (this.__skipDimension) {
            return;
        }
        if (!ctx) {
            ctx = fabric.util.createCanvasElement().getContext("2d");
            this._setTextStyles(ctx);
        }
        this.dynamicMinWidth = 0;
        this._textLines = this._splitTextIntoLines();
        this._clearCache();
    },
    fitText : function(){
        // this.__lineHeights = [];
        this._clearCache ();
        // this._textLines = this._splitTextIntoLines();
        this._textLines = this._splitTextIntoLines();

        this._initDimensions(this.ctx);

        while(this._getTextHeight() < this.height ){
            this.fontSize++;
            this._clearCache ();
            this._initDimensions(this.ctx);
        }

        while(this._getTextHeight() > this.height || this.dynamicMinWidth > this.width ){
            if(this.fontSize == 1)break;
            this.fontSize--;
            this._clearCache ();
            this._initDimensions(this.ctx);
        }
        //this.lineHeight = (this.height / this._textLines.length) / this.fontSize / this._fontSizeMult;
    }
});
//
//Object.defineProperty(fabric.TextFrame, "width", {
//    get: function() {
//        return this._w;
//    },
//    set: function(slide) {
//        console.log(slide);
//        this._w = slide;
//    }
//});


fabric.TextFrame.fromObject = function(object, callback) {
    var _total = 0, loaded = 0;
    function create(){
        var f = new fabric.TextFrame(object.text,object);
        callback && callback(f);
    }
    fabric.util.recoursive(object,
        function(property, value, parent) {

            if (property == "pattern") {
                _total ++;
                //  var _texture = _.findWhere(o.project.textures,{id: parent[property]});

                var _texture =  fabric.texturesPath + parent[property];

              fabric.util.loadImage(_texture, function(img) {
                    //this[property] = new fabric.Image(img);

                    parent["fill"] = new fabric.Pattern({
                        source: img,
                        repeat: "repeat"
                    });
                    delete parent[property];
                    loaded++;
                    if(_total == loaded)create();

                }, this, this.crossOrigin);

                //
                //parent["fill"] = new fabric.Pattern({
                //    source: _texture,
                //    repeat: "repeat"
                //});
            }
        }
    );
    if(_total == loaded){
        return create();
    }
};

if (fabric.objectsLibrary) {
  fabric.objectsLibrary.textFrame = {
      "type": "text-frame",
      "text": "text-frame",
      width: 100,
      height: 50
  };
}

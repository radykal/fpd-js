'use strict';



//fabric.DPI todo why do not use it?
/**
 * @author Denis Ponomarev
 * @email den.ponomarev@gmail.com
 */
//fabric.require("Raster",[], function() {
fabric.Raster = fabric.util.createClass(fabric.Image, {
  type: 'raster',
  colors: null,
  _color_areas: null,
  colorAreas: null,
  optionsOrder: ["colorAreas","colors","*"],
  initialize: function (img, options,callback) {

    this.colorAreas = [];
    this._color_areas = [];
    this.colors = {};
    this.callSuper('initialize', img, options, function(el){
      callback(this);
    }.bind(this));
  },
  setColorAreas: function (val,callback) {

    var cb = fabric.util.loader(val.length + 1,function(){
      callback && callback(this);
    }.bind(this));

    var _this = this;
    for(var i in val){
      this.colorAreas[i] = val[i];
      if(val[i].src){
        fabric.Image.fromURL(val[i].src,function(index,el){
          el.width = _this.width;
          el.height = _this.height;
          _this._color_areas[index] = {
            image: el,
            filters: [
              new fabric.Image.filters.Mask({'mask': el})
            ]
          };
          if(this.colors[index]){
            this.setColor(index,this.colors[index],cb)
          }else{
            cb();
          }
        }.bind(this,i));
      }else{
        _this._color_areas[i] = {
        };
        cb();
      }
    }
    cb();
  },
  setColor: function (index,options,callback) {
    var _this = this;
    var colorArea = this._color_areas[index];
    this.colors[index] = options;

    if(!colorArea || !colorArea.image){
      return callback();
    }


    var _Blend = fabric.Image.filters.Blend;


    if(!options){
      //do not fill
      colorArea.filters.length = 1;
      createColorArea();
    }else if(options.constructor == String){

      // var _c = fabric.Color.colorNameMap[fabric.util.string.toDashed(colors[i].replace(/\s/, ""))];
      // if (!_c) {
      //   console.warn("HEX Code of '" + colors[i] + "' Not Found!");
      // }

      //fill a color
      if(!options.startsWith("rgb") && !options.startsWith("#") && !fabric.Color.colorNameMap[options]){
        console.log("color '" + options + "' not defined");
        options = "#000";
      }
      colorArea.filters[1] = new _Blend({
        color: options,
        mode: "multiply"
      });
      createColorArea()
    }else{
      //fill a texture
      colorArea.options = fabric.util.deepClone(options);
      fabric.Image.fromURL(colorArea.options.src,function(el){
        colorArea.options.image = el;
        colorArea.filters[1] = new _Blend(colorArea.options);
        createColorArea();
      })
    }


    function createColorArea() {
      var _image = new fabric.Image(_this._filteredEl || _this._originalElement);
      colorArea.canvas = _image.applyFilters(callback, colorArea.filters, _this._filteredEl || _this._originalElement);
    }

  },
  getColor: function (index) {
    return this.colors[index];
    //return this._color_areas[index].filters[1].color;
  },
  setColors: function (colors,callback) {

    var cb = fabric.util.loader(colors.length,function(){

      this.fire("colors:changed", colors);
      this.fire("modified");
      //this.canvas && this.canvas.fire('object:modified', { target: this });
      callback && callback();
    }.bind(this));

    for(var i= 0; i< colors.length ;i ++){

      this.setColor(i,colors[i],cb)
    }
  },
  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  _render: function(ctx, noTransform) {
    var x, y, imageMargins = this._findMargins(), elementToDraw;

    x = (noTransform ? this.left : -this.width / 2);
    y = (noTransform ? this.top : -this.height / 2);

    if (this.meetOrSlice === 'slice') {
      ctx.beginPath();
      ctx.rect(x, y, this.width, this.height);
      ctx.clip();
    }

    if (this.isMoving === false && this.resizeFilters.length && this._needsResize()) {
      this._lastScaleX = this.scaleX;
      this._lastScaleY = this.scaleY;
      elementToDraw = this.applyFilters(null, this.resizeFilters, this._filteredEl || this._originalElement, true);
    }
    else {
      elementToDraw = this._element;
    }
    elementToDraw && ctx.drawImage(elementToDraw,
      x + imageMargins.marginX,
      y + imageMargins.marginY,
      imageMargins.width,
      imageMargins.height
    );
    for(var i in this._color_areas){
      elementToDraw = this._color_areas[i].canvas;
      elementToDraw && ctx.drawImage(elementToDraw,
        x + imageMargins.marginX,
        y + imageMargins.marginY,
        imageMargins.width,
        imageMargins.height
      );
    }

    this._renderStroke(ctx);
  },
  toObject : function() {
    var _obj = this.callSuper('toObject');
    //_obj.height = this._original_height;
    _obj.colors = this.colors;
    _obj.colorAreas = this.colorAreas;
    return _obj;
  }
});

fabric.Raster.prototype.actions = Object.assign({},{
  colors: {
    type:   'menu',
    title: 'color menu',
    menu:   function(){
      var _menu = [];
      for(var key in this._color_areas){
        _menu.push({
          title: "Цвет",
          args:   key,
          value: {
            get:    function(key){
              var color = this.getColor(key);
              if(color.constructor !== String){
                return "#000000"
              }
              return color;
            },
            set:    function(key,value){
              this.setColor(key,value);
              this.canvas.renderAll();
            }
          },
          type:       "color"
        })
      }
      return _menu;
    }
  }
});


fabric.Raster.fromObject = function(object, callback) {

  fabric.util.initImageAndFilters(object,function(img){
    var instance = new fabric.Raster(img, object,callback);
  })
};

/**
 * Indicates that instances of this type are async
 * @static
 * @type Boolean
 * @default
 */
fabric.Raster.async = true;

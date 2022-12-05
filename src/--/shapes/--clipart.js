'use strict';

// require("../mixins/cacheMixin");
// require("../shapes/pathGroup");
require("../modules/resizable");

/**
 * @author Denis Ponomarev
 * @email den.ponomarev@gmail.com
 */
fabric.Clipart = fabric.util.createClass(
  fabric.Group,
  // fabric.CacheMixin
  {
    type: 'clipart',
    colors: null,
    resizable: true,
    processing: false,
    stateProperties: fabric.Group.prototype.stateProperties.concat(["colors"]),
    optionsOrder: ["*","colors","element", "actions", "tools"],
    getOriginalSize: function(){
      return {
        width: this.element.width,
        height: this.element.height
      }
    },
    initialize: function (options) {
      options || ( options = {});

      if (options.constructor != Object) {

        var _obj = options.toObject();
        if (options.element) {
          _obj.element = options.element.cloneSync();
          _obj.element.clipTo = _obj._fabric_shape;
        }
        _obj.shape = options.shape;
        options = _obj;
      }

      this.on({
        "scaling": this.updateElement
      });

      this.initShape(options);
      this._fabric_shape.set({
        opacity: 0,
        originX : 'center',
        originY : 'center',
      });

      this.callSuper('initialize', [this._fabric_shape], options);
      this._setWidthHeight(options);
    },
    setShape: function(el,cb){

      el =  Object.assign({
        strokeWidthFull: this.shape.strokeWidthFull,
        strokeWidthEmpty: this.shape.strokeWidthEmpty,
        strokeWidthActive: this.shape.strokeWidthActive,
        dashArray : this.shape.dashArray,
        strokeEmpty:  this.shape.strokeEmpty,
        strokeFull:  this.shape.strokeFull,
        strokeActive:this.shape.strokeActive
      },el);

      var _this = this;
      if(el && el.src && !el.paths){
        fabric.loadSVGFromURL(el.src,function(paths,options) {
          el.paths  = paths;
          Object.assign(el,options);
          _this._set_shape(el);
          _this.add(_this._fabric_shape);
          _this._apply_shape();
          cb && cb();
        })
      }else{
        _this._set_shape(el);
        _this.add(_this._fabric_shape);
        _this._apply_shape();
        cb && cb();
      }
    },
    setElement: function (element) {
      if(this.element){
        this.remove(this.element);
      }
      if(!element){
        return;
      }
      element.set({
        originX : 'center',
        originY : 'center'
      });
      this.add(element);
      this.element = element;
      this._init_color_array();
      this.dirty = true;
      this.canvas && this.canvas.renderAll();
    },
    updateElement: function () {
      if(this.element){
        this.element.scaleX = this.width / this.element.width;
        this.element.scaleY = this.height / this.element.height;
      }
      if(this._fabric_shape){
        this._fabric_shape.set({
          width: this.width,
          height: this.height
        });
      }
      this.dirty = true;
    },
    _render: function (ctx) {
      ctx.save();
      ctx.scale(this.element.scaleX,this.element.scaleY)
      for (var i = 0, l = this.element.paths.length; i < l; ++i) {
        this.element.paths[i].render(ctx, true);
      }
      ctx.restore();
    },
    _init_color_array: function () {

      this.processing = true;
      this._colors = this.element.extractColors();

      this.colors = this.colors || {};

      for (var _color in this.colors) {
        this.setClipartColor(_color, this.colors[_color],true)
      }
    },
    setData: function(data){
      this.setSrc(data.src)
    },
    setSrc: function(src){
      var _this = this;
      fabric.PathGroup.fromURL(src, function (el) {
        _this.setElement(el);
        _this.makeActions();
      },{
        width: this.width,
        height: this.height
      });
    },
    setClipartColor: function (key, value, preventCacheUpdate) {

      if (!value) {
        value = key;
        delete this.colors[key];
      } else {
        this.colors[key] = value;
      }
      var _colors = this._colors[key];
      for (var i in _colors) {
        if (_colors[i].color) {
          _colors[i].color.fill = value;
        }
        if (_colors[i].stop) {
          _colors[i].stop.color = value;
        }
      }

      this.dirty = true;
      this.canvas && this.canvas.renderAll();
    },
    getSrc: function(){
      return this.src || this.element && this.element.src;
    }
  }
);

/**
 * Creates fabric.PathGroup instance from an object representation
 * @static
 * @memberOf fabric.PathGroup
 * @param {Object} object Object to create an instance from
 * @param {Function} callback Callback to invoke when an fabric.PathGroup instance is created
 */
fabric.Clipart.fromObject = function (object, callback) {
  if (typeof object.src === 'string') {
    if (object.format === 'png' || object.format === "image/png" || object.format === 'jpeg' || object.format === "image/jpeg") {
      fabric.Image.fromURL(object.src, function (el) {
        object.element = el;
        object.element.src = object.src;
        callback(new fabric.Clipart(object));
      }, {
        width: object.width || fabric.Clipart.prototype.width,
        height: object.height || fabric.Clipart.prototype.height
      });
    } else {
      fabric.PathGroup.fromURL(object.src, function (el) {
        object.element = el;
        object.element.src = object.src;
        delete object.src;
        callback(new fabric.Clipart(object));
      }, {
        width: object.width || fabric.Clipart.prototype.width,
        height: object.height || fabric.Clipart.prototype.height
      });
    }
  } else {
    return new fabric.Clipart(object);
  }
};

if(!fabric.isLikelyNode) {
    fabric.util.createAccessors(fabric.Clipart);

    Object.assign(fabric.Editor.prototype, {
        svgSample: 'data:image/svg+xml;base64,' + require('base64-loader!./../media/beetle.svg'),
    });
}

if (fabric.objectsLibrary) {
  Object.assign(fabric.objectsLibrary, {
    clipart: {
      // "width": function (w, h) {
      //   var _asp = Math.min(285 / 365, w / h);
      //   return w;
      // },
      // "height": function (w, h) {
      //   var _asp = Math.min(285 / 365, w / h);
      //   return h;
      // },
      "type": "clipart",
      "src": fabric.Editor.prototype.svgSample
    },
    image: {
      type: "image",
      src: fabric.Editor.prototype.svgSample
    }
  });
}

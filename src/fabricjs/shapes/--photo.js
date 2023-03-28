
if(!fabric.Frame){
  require("./../shapes/frame");
}

fabric.Editor.prototype.configurationProperties.push("frames");

Object.assign(fabric.Editor.prototype, {
  setFrames: function(val){
    this.frames = Object.assign(val.map(item => fabric.util.defaults(item,{
      frame: false,
      shape: false,
      type: "photo",
      role: "frame"
    })))
  }
})


//fabric.DPI todo why do not use it?
/**
* @author Denis Ponomarev
* @email den.ponomarev@gmail.com
*/

fabric.Photo = fabric.util.createClass(fabric.Frame, {
  type: 'photo',
  stateProperties: fabric.Frame.prototype.stateProperties.concat(["frame"]),
  _scaling_events_enabsetDataled: true,
  updateElement: function () {
    // if(this.element){
    //   this.element.scaleX = this.width / this.element.width;
    //   this.element.scaleY = this.height / this.element.height;
    // }
    // if(this._fabric_shape){
    //   this._fabric_shape.set({
    //     width: this.width,
    //     height: this.height
    //   });
    // }
    this.dirty = true;
  },
  cloneSync: function(options){
    var _frame = new fabric.Photo(this);
    options && _frame.set(options);
    return _frame;
  },
  dpiWarning: false,
  initialize: function (options) {

    options || ( options = {});
    this.callSuper('initialize',options);

    this.dpi = 0;
    if(this.dpiWarning){
      this._create_sign();
    }
    // this._set_border(options.border , "border");
    // this._set_border(options.border2,"border2");
    // this._set_frame(options.frame);

    this.on({
      // "redraw": this._apply_frame,
      "added": function () {
        if(this.dpiWarning){
          this._check_dpi();
        }
      },
      "redraw": function () {//scaling
        this._apply_frame();
        this._update_frame();
        if(this.dpiWarning) {
          this._check_dpi();
        }
      },
      "clipping:entered": function () {
        if (this._fabric_frame) {
          if(this.frame.position !== "back"){
            this._restoreObjectState(this._fabric_frame);
            this.remove(this._fabric_frame);
            this.canvas.add(this._fabric_frame);
          }
        }
      },
      "element:modified": function () {
        if (this._fabric_frame) {
          if(this.frame.position !== "back") {
            this._fabric_frame.bringToFront();
          }
        }
      },
      "clipping:exited": function () {
        if (this._fabric_frame) {
          if(this.frame.position !== "back") {
            this.canvas.remove(this._fabric_frame);
            this.add(this._fabric_frame);
            this._apply_frame();
            this.canvas.renderAll();
          }
        }
      }
    });
  },
  _apply_frame: function () {
    this._fabric_frame && this._fabric_frame.set({
      left: 0 ,
      top: 0,
      width : this.width,
      height:  this.height
    })
  },
  _create_sign: function () {


    this._fabric_sign = new fabric.Text("", {
      fill: "yellow",
      stroke: "black",
      evented: false,
      visible: false,
      height: 20,
      fontSize: 24,
      fontFamily: "FontAwesome",
      left: this.width / 2 - 30,
      top: this.height / 2 - 35,
      textAlign: "center"
    });
    this._elements_to_update.push({
      element: this._fabric_sign,
      bottom: 35,
      right: 30
    });

    this._fabric_sign_text = new fabric.Text(Math.floor(this.dpi).toString(), {
      fill: "yellow",
      evented: false,
      visible: false,
      height: 5,
      fontSize: 10,
      left: this.width / 2 - 27,
      top: this.height / 2 - 12,
      textAlign: "center"
    });

    this._elements_to_update.push({
      element: this._fabric_sign_text,
      bottom: 12,
      right: 27
    });
    this.add(this._fabric_sign);
    this.add(this._fabric_sign_text);
  },
  _check_dpi: function () {
    //this.dpi_warning = true;
    this.dpi = this.getDPI();
    if (!this.canvas)return;//todo

    if (this.canvas.dpi && this.dpi < this.canvas.dpi) {
      this._fabric_sign.setVisible(true);
      this._fabric_sign_text.setVisible(true);
      this._fabric_sign_text.setText(Math.floor(this.dpi).toString());
      //this.slide.dpi_warning = true;
    } else {

      this._fabric_sign.setVisible(false);
      this._fabric_sign_text.setVisible(false);
      //if(!this._fabric_sign)return;
      //this.remove(this._fabric_sign);
      //delete this._fabric_sign;
      //this.slide.dpi_warning = this.slide.checkDPI();
    }
  },
  getDPI: function () {

    return;
    if (!this._original)return this.canvas.dpi;

    var INCH = 25.4; //mm

    var dims = [];

    dims.push(this._original.width / (this.width / INCH));
    dims.push(this._original.height / ( this.height / INCH));


    var _dpi = dims[0];

    for (var i = 1; i < dims.length; i++) {
      if (dims[i] < _dpi) {
        _dpi = dims[i]
      }
    }
    this.dpi = _dpi * 1;///this.canvas.scaleX;

    return _dpi;
  },
  supportedTypes: ["image"],

  _set_element: function (options, callback) {

    if (options.type == "image") {
      this._original = options.original;
      fabric.Image.fromURL((fabric.framesPath || "" ) + options.src, function (o) {
        o.on("rotating", fabric.util.stepRotating.bind(o));

        this._check_dpi();

        callback(o);
      }.bind(this));
    }

  },


  /**
   * ��������� �����
   * @param data - ����� �����
   */
  _set_border: function (border,name) {
    this[name] = border;
    if(!border)return;
    this["_fabric" + name] = new fabric.Path(this._fabric_shape.path,Object.assign({
      fill: "transparent",
      selectable: false,
      originX: "center",
      originY: "center"
    },border));

    this.add(this["_fabric" + name]);
    if(border.position == "before"){
      this._objects.unshift(this._objects.pop());
    }

    var options = {
      left:   this._fabric_shape.left + this.width/2,
      top:    this._fabric_shape.top + this.height/2,
      scaleX: this._fabric_shape.scaleX * (border.scaleX || 1),
      scaleY: this._fabric_shape.scaleY * (border.scaleY || 1)
    };

    this["_fabric" + name].set(options);
  },
  setFrame: function (frame,cb) {

    if(frame && frame.constructor ==String){
      frame = this.editor.frames[frame];
    }

    var _this = this;
    if(frame && frame.src && !frame.image){

      fabric.util.loadImage(frame.src, function (img) {
        frame.image = img;
        _this._set_frame(frame);
        _this.canvas && _this.canvas.renderAll();
        cb && cb();
      }, this, this.crossOrigin);
    }else{
      _this._set_frame(frame);
      _this.canvas && _this.canvas.renderAll();
      cb && cb();
    }
  },
  _update_frame: function () {
    if(this.frame && this.frame.image && this.frame.slice) {
      var _canvas = this._fabric_frame._element;
      _canvas.width = this.width;
      _canvas.height = this.height;
      fabric.util.drawBorderImage(_canvas, this.frame.image, this.frame);
    }
  },
  _set_frame: function (frame) {
    if(this._fabric_frame){
      this.remove(this._fabric_frame);
      delete this._fabric_frame;
    }
    if(frame && frame.image) {

      //
      //if (!frame["border_image"]) {
      //    img.width = this.width;
      //    img.height = this.height;
      //}

      if (frame.width && frame.slice) {

        //Canvas for NodeJS
        var canvas = typeof Canvas !== 'undefined' && new Canvas() || document.createElement("canvas");

        canvas.width = this.width;
        canvas.height = this.height;
        fabric.util.drawBorderImage(canvas, frame.image, frame);
        //todo
        //var _src = canvas.toDataURL();
        //var image = new Image();
        //image.src = _src;
        this._fabric_frame = new fabric.Image(canvas);
        //
        //this._fabric_frame.width = this.width;
        //this._fabric_frame.height = this.height;

        //this.add(this._fabric_frame);
      } else {
        this._fabric_frame = new fabric.Image(frame.image);
      }


      this._fabric_frame.set({
        originX: "center",
        originY: "center",
        hasControls: false,
        evented: false
      });

      this.add(this._fabric_frame);
      if(this.frame && this.frame.position == "back"){
        this._fabric_frame.sendToBack();
      }
      this._apply_frame();
    }
    this.frame = frame;
  },


  /**
   * �������� �������� �����
   * @private
   */
  _create_frame: function () {

    if (this.frame) {
      this.frame.width = this._fabric_image.width;
      this.frame.height = this._fabric_image.height;
    }

    this._fabric_frame = new fabric.Image(this.frame, {
      originX: "center",
      originY: "center",
      perPixelTargetFind: true,
      width: this.data.geometry.width,
      height: this.data.geometry.height
    });
  },
  toObject: function(propertiesToInclude){
    var object = this.callSuper('toObject',propertiesToInclude);
    delete object.element;

    if(this.element){
      var _obj2 = this.element.toObject();
      object.src = _obj2.src;
      object.filters = _obj2.filters;
    }
    object.frame = Object.assign({},this.frame);

    delete object.frame.image;
    return object;
  },
  insertPhotoFrames: false,
  insertPhotoFilters : false
});


// fabric.Photo.framesManager = {
//   activeObject: null,
//   show: function(object){
//     this.activeObject = object;
//     this.fire('show',object);
//   }
// };
// fabric.util.observable(fabric.Photo.framesManager);
//
// var _OBJ_ACT = fabric.Object.prototype.actions;
// var _PHO = fabric.Photo.prototype;



Object.assign(fabric.Photo.prototype, {
  getFramesData : function () {
    var _filters = fabric.Photo.getFramesList(this);
    for (var i in this.frames) {
      let capitalizedFrame = fabric.util.string.capitalize(this.frames[i].type);
      let _f = _filters.find(item => item.type === capitalizedFrame);
      // var _f = fabric._.findWhere(_filters,{type: fabric.util.string.capitalize(this.frames[i].type)})
      if(_f){
        _f.enabled = true;
      }
    }
    return _filters;
  },
  availableFrames: [
    "clipPath"
  ],
  insertPhotoFrames: false,
  actions : Object.assign(fabric.Photo.prototype.actions || {}, {
    photoFilters: {
      title: "фильтр",
      className: "fa fa-filter",
      action: function(){
        fabric.Image.filterManager.show(this.element);
      }
    },
    removeWhiteFromBorders: Object.assign({},fabric.Image.prototype.actions.removeWhiteFromBorders,{
      target: function(){
        return this.element;
      }
    }),
    revertChanges: Object.assign({},fabric.Image.prototype.actions.revertChanges,{
      target: function(){
        return this.element;
      }
    }),
    photoFrames: {
      title: "рамочки",
      className: "fa fa-heart",
      type: "select",
      templateSelection: function (state) {
        if (state.any) {
          return state.text;
        }
        return $('<span><span class="color-span" style="background-color:' + state.text + '"></span>' + state.text + '</span>');
      },
      templateResult: function (state, container, data) {
        var $el = $('<span>' + state.text + '</span>');
        if (state.id != "none") {
          /* var $canvas = $('<canvas>');
          fabric.util.drawFilter($canvas[0], data.target.src, state.id, {
            height: 22
          });
          $el.prepend($canvas);*/
        }
        return $el;
      },
      value: {
        set: function (val, framesData) {
          var options = false;
          if (val == "none") {
            val = false;
          } else {
            var _f = _.findWhere(framesData, {id: val});
            _f.enabled = !_f.enabled;
            for (var i in _f.options) {
              if ($.isNumeric(_f.options[i])) {
                _f.options[i] = parseFloat(_f.options[i]);
              }
            }
            if (_f.enabled) {
              options = {};
              for (var i in _f.options) {
                options[i] = _f.options[i].value;
              }
            }


          }
          this.setFrame(val);
        },
        get: function () {
          return this.frame ? this.frame.id || "custom" : "none"
        },
        options: function () {

          var _frames = this.getFramesData();
          return [{
            id: 'none',
            text: 'original',
            enabled: !this.frame
          }].concat(_frames);

        }
      }
    }
  })
});




fabric.Photo.fromObject = function(object,callback) {
  var _klass= this;
  var _app = object.editor;
  delete object.editor;
  object = fabric.util.deepClone(object);
  object.editor = _app;

  if(object.src){
    object.element = {
      type: "image",
      src: object.src,
      filters: object.filters
    };

    delete object.src;
    delete object.filters;
  }


  var cb = fabric.util.loader(3,function(){
    callback && callback(new _klass(object));
  });

  if(object.element){
    fabric.util.createObject(object.element,function(el){
      object.element = el;
      cb();
    });
  }else{
    cb();
  }


  if(object.frame && object.frame.src) {

    fabric.util.loadImage(object.frame.src, function (img) {
      object.frame.image = img;
      cb();
    }, this, this.crossOrigin);
  }else {
    cb();
  }

  if(object.shape && object.shape.src){
    fabric.loadSVGFromURL(object.shape.src,function(paths,options) {
      object.shape.paths  = paths;
      Object.assign(object.shape,options);
      cb();
    })
  }else {
    cb();
  }

};


fabric.Photo.getFramesList = function(el){

  el = el || fabric.Photo.prototype;
  var framesList = [];
  _.forEach(el.availableFrames, function(frameId){
    var _data = fabric.Photo.frames[frameId];
    framesList.push({
      text: _data.title || frameId,
      id: frameId,
      data: fabric.util.clone(_data)
    })
  });

  return framesList;
};

fabric.Photo.frames = {
  clipPath: {
    "title": "Сlip-path shape",
    "shape":{
      "path":  "M 232.000 252.000 L 252.000 266.641 L 249.321 242.000 L 272.000 232.000 L 249.321 222.000 L 252.000 197.359 L 232.000 212.000 L 212.000 197.359 L 214.679 222.000 L 192.000 232.000 L 214.679 242.000 L 212.000 266.641 z"
    }
  }
};


/**
 * Indicates that instances of this type are async
 * @static
 * @type Boolean
 * @default
 */
fabric.Photo.async = true;

fabric.util.createAccessors(fabric.Photo);

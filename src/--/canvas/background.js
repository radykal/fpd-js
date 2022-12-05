
fabric.BackgroundImage = fabric.util.createClass(fabric.Image, {
  type: "background-image",
  storeProperties: ["flipX", "flipY", "stroke", "strokeWidth", "strokeDashArray", "strokeLineCap", "strokeDashOffset", "strokeLineJoin", "strokeMiterLimit", "opacity", "clipPath","filters", "src", "crop", "fitting"],
  stateProperties: [],
});
fabric.OverlayImage = fabric.util.createClass(fabric.Image, {
  type: "background-image",
  storeProperties: ["flipX", "flipY", "stroke", "strokeWidth", "strokeDashArray", "strokeLineCap", "strokeDashOffset", "strokeLineJoin", "strokeMiterLimit", "opacity", "clipPath","filters", "src", "crop", "fitting"],
  stateProperties: [],
});

let CanvasBgMixin = {
  backgroundPosition: 'manual',
  fillBackgroundColorOverCanvas: false,

  store_backgroundImage: function () {
    if (!this.backgroundImage || this.backgroundImage.excludeFromExport) return;
    let object = this.backgroundImage.storeObject();
    if(Object.keys(object).length === 1){
      return object.src;
    }
    return object;
  },
  store_overlayImage: function () {
    if (!this.overlayImage || this.overlayImage.excludeFromExport)  return;
    return this._clean_overlay_background_stored_object(this.overlayImage);
  },
  _renderBackgroundOrOverlay: function(ctx, property) {
    let object = this[property + 'Color'];

    let _w = this.originalWidth || this.width;
    let _h = this.originalHeight || this.height;

    if ( object) {

      ctx.fillStyle = object.toLive
        ? object.toLive(ctx)
        : object;

      if(!this.fillBackgroundColorOverCanvas){
        //todo do!!!
        ctx.fillRect(
          object.offsetX||  this.viewportTransform[4],// * this.viewportTransform[0],
          object.offsetY||  this.viewportTransform[5],// * this.viewportTransform[0],
          _w *this.viewportTransform[0],
          _h * this.viewportTransform[0]);
      }else{
        ctx.fillRect(

          object.offsetX || 0,
          object.offsetY || 0,
          this.width ,
          this.height);
      }
    }
    object = this[property + 'Image'];
    if(object && object.constructor !== String &&  object.constructor !== Object){


      ctx.save();
      ctx.transform.apply(ctx, this.viewportTransform);

      object.render(ctx);

      ctx.restore();
    }
  },
  /**
   * backgroundPosition
   * @values manual | cover | contain
   */
  // setBackgroundPosition: function (src) {
  //   this.backgroundPosition = src;
  //   this._update_background_overlay_image("background");
  //   return this;
  // },
  setPageStyle(value){
    this.pageStyle = value;
    this.backgroundRect = new fabric.Rect(fabric.util.object.extend({
      width: this.width,
      height: this.height,
      fill: "#fff",
    },value));
  },
  _update_background_overlay_image: function (property) {
    let photo = this[property + "Image"];
    if(!photo)return;
    let position = this[property + "Position"];
    photo.set({
      fitting: position,
      width: this.getOriginalWidth(),
      height: this.getOriginalHeight(),
      left: 0,
      top: 0
    })
    //update fitting


    // if (!photo || photo.constructor === Object || photo.constructor === String) return;
    // let position = this[property + "Position"];
    //
    // if( position === 'resize') {
    //   if(photo.loaded){
    //     this.originalWidth = photo.width;
    //     this.originalHeight = photo.height;
    //   }
    //   else{
    //     if(photo.__waitingToBeUpdated){
    //       return;
    //     }
    //     photo.__waitingToBeUpdated = true;
    //     photo.on("element:modified",() =>{
    //       delete photo.__waitingToBeUpdated;
    //       this._update_background_overlay_image(property);
    //     });
    //   }
    // }
    // else if (position === 'manual') {
    //   // let _orig = photo.getOriginalSize();
    //   // photo.set({
    //   //   originX: 'left',
    //   //   originY: 'top',
    //   //   left: 0, //this.viewportTransform[4],
    //   //   top: 0, //this.viewportTransform[5],
    //   //   width: _orig.width,
    //   //   height: _orig.height
    //   // });
    // }
    // else{ // fill || contain || cover || center
    //   let _w  =  this.originalWidth || this.width,  _h = this.originalHeight || this.height;
    //   let originalSize =  {width: _w, height: _h};
    //   let size = originalSize;
    //
    //   if(photo.loaded){
    //     size = fabric.util.getProportions(photo._originalElement, originalSize, position);
    //   }
    //
    //   let _l = photo.originX === 'center' ? _w / 2 : (_w - size.width) / 2 ;
    //   let _t = photo.originY === 'center' ? _h / 2 : (_h - size.height) / 2;
    //   let _z = this.viewportTransform[0];
    //
    //   photo.set({
    //     left: _l - 0.5,//(_l /*+ this.viewportTransform[4]*/)*_z,
    //     top:  _t- 0.5,// /*+ this.viewportTransform[5]*/)*_z,
    //     scaleX: (_w + 1) / photo.width,//*_z,
    //     scaleY: (_h + 1 ) / photo.height//*_z
    //   });
    // }
  },
  /**
   *
   * @param value Object | HTMLImageElement | Image | String
   * @param type
   * @param callback
   */
  setBackgroundOverlayImage: function (value, type , callback) {
    let property = type + "Image";
    if(!this.processing){
      this.saveState([property]);
    }
    this.fire(type + "-image:changed");

    if (!value) {
      this[property] = null;
      callback && callback();
      return;
    }

    let backgroundOptions;

    let vType = value.constructor.name;
    switch (vType){
      case "String":
        backgroundOptions = {
          src: value
        };
        break;
      case 'HTMLCanvasElement':
      case 'HTMLImageElement':
        backgroundOptions = {
          element: value,
          width: value.naturalWidth,
          height: value.naturalHeight
        };
        break;
      case "Object":
        backgroundOptions = value;
    }

    let positionProperty = type + "Position";
    if(this[positionProperty] !== "manual"){
      // delete backgroundOptions.width;
      // delete backgroundOptions.height;
      delete backgroundOptions.scaleX;
      delete backgroundOptions.scaleY;
    }

    backgroundOptions.disableDefaultProperties = true;
    if(!backgroundOptions.type){
      backgroundOptions.type = type + "-image";
    }

    // let prototype =  this.editor && this.editor.prototypes && this.editor.prototypes[fabric.util.string.capitalize(property,true)];
    // prototype && fabric.util.object.extend(backgroundOptions,prototype);

    backgroundOptions.editor = this.editor;
    backgroundOptions.canvas = this;
    backgroundOptions.width = this.getOriginalWidth();
    backgroundOptions.height = this.getOriginalHeight();
    backgroundOptions.left = 0;
    backgroundOptions.top = 0;


    this.addProcessinProperty(property);

    this[property] = fabric.util.createObject(backgroundOptions,el => {
      this.removeProcessinProperty(property);
      this.fire(type + "-image:loaded",{target: el});
      // if (fabric.isLikelyNode) {
      // this._update_background_overlay_image(type);
      // }
      callback && callback();
    });

    if (!fabric.isLikelyNode) {
      // this._update_background_overlay_image(type);
      if(!this.processing){
        this.fire('modified');
      }
    }


  },
  setOverlayImage: function (bg, callback) {
    this.setBackgroundOverlayImage(bg,"overlay",callback);
  },
  setBackgroundImage: function (bg, callback) {
    this.setBackgroundOverlayImage(bg,"background",callback );
  },
  setBackground: function(color,callback){
    if(!this.processing){// if(!this.processingProperties.length)
      this.saveState(["backgroundColor"]);
    }


    this.backgroundColor = color;
    this._initGradient(color, "backgroundColor");
    this._initPattern(color, "backgroundColor",  () => {
      this.renderAll();
      if(!this.processingProperties.length)this.fire('modified');
      callback && callback()
    });
    return this;
  },
  setOverlay:    function(color,callback){
    if(!this.processingProperties.length) this.saveState(["overlayColor"]);

    this.overlayColor = color;
    this._initGradient(color, "overlayColor");
    this._initPattern(color, "overlayColor",  () => {
      this.renderAll();
      if(!this.processingProperties.length)this.fire('modified');
      callback && callback()
    });
    return this;
  },

  /**
   * @private
   * @param {Object} [filler] Options object
   * @param {String} [property] property to set the Pattern to
   * @param {Function} [callback] callback to invoke after pattern load
   */
  _initPattern: function(filler, property, callback) {
    if (filler && filler.source && !(filler instanceof fabric.Pattern)) {

      filler._src = filler.source;
      let src = filler.source;
      if(this.getURL){
        src = this.getURL(src,"pattern");
      }
      filler.source = fabric.util.getURL(src);
      this[property] = new fabric.Pattern(filler, callback);
    }
    else {
      callback && callback();
    }
  }
};
fabric.util.object.extend(fabric.StaticCanvas.prototype,CanvasBgMixin);
fabric.util.object.extend(fabric.Canvas.prototype,CanvasBgMixin);



fabric.util.object.extend(fabric.Canvas.prototype, {
  eventListeners: fabric.util.merge(fabric.Canvas.prototype.eventListeners, {
    "viewport:scaled": function(){
      this._update_background_overlay_image("background");
      this._update_background_overlay_image("overlay");
    }
  })
})

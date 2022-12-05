
Object.assign( fabric.Image.prototype, {
  setSrc: function (src, callback) {
    this._src = src;

    if(!src){
      this.setElement(false,true);
      callback && callback(this);
      return;
    }

    //restore Content Position on image change
    if(this.editor && this.fitting === "manual"){
      this.fitting = this.editor.getDefaultProperties(this.type).fitting || this.__proto__.fitting;
    }
    this.fire("before:load",{});

    if(this.thumbnailSourceRoot && !this.thumbnail){
      this.setThumbnail(src);
    }
    if(this.getURL){
      src = this.getURL(src,"source");
    }

    this.src = fabric.util.getURL(src, this.sourceRoot);

    fabric.util.loadImage(this.src, (img) => {

      let _processing;
      if(this.canvas){
        _processing = this.canvas.processing;
        this.canvas.processing = true;
      }
      this.setElement(img,true);
      this.fire("loaded",{});
      if(this.canvas) {
        this.canvas.processing = _processing;
      }
      callback && callback(this);
    }, this, this.crossOrigin);
    return this;
  },
  store_src: function () {
    let src;
    if (this._edited) {
      src = this._element.src;
    } else {
      src =  this._src || this.src || this._original_src || this._originalElement && this._originalElement.src || this._element && this._element.src;
    }
    if (!src) return null;

    let sourceRoot = this.sourceRoot || fabric.mediaRoot;
    if (src.indexOf(sourceRoot) === 0) {
      src = src.replace(sourceRoot, "");
    }
    return src;
  },
  toObject: fabric.Object.prototype.toObject,

  clonedProperties: fabric.Object.prototype.clonedProperties.concat(["element"]),
  cacheProperties: fabric.Image.prototype.cacheProperties.concat(["_element","elementCanvas"]),
  storeProperties: ["type","clipPath","frame","deco","filters", "resizeFilters", "originalSrc", "src", "contentOffsets"],
  // cloneSync: function () {
  //   let object = this.storeObject();
  //   object.editor = this.editor;
  //   object.type = this.type;
  //   object.element = this._element;
  //   return new fabric.Image(object)
  // },
  optionsOrder: ["loader", "sourceRoot", "thumbnailSourceRoot", "units", "width", "height", "scaleX", "scaleY", "resizable", "fitting",  "*", "crop"],
  isImage: true,
  filters: null,
  resizeFilters: null,
  originalSrc: null,
  color: "red",
  /**
   * @param filtered {true | element }
   * @returns {*}
   */
  getSvgSrc: function(filtered){
    let element;
    if(filtered){
      if(filtered.constructor === Boolean){
        element = this._element;
      } else {
        element = filtered;
      }
    } else {
      element = this._originalElement;
    }

    return fabric.util.getElementSvgSrc(element);
  },
  /**
   * @private
   * @param {Object} [options] Options object
   */
  _initConfig: function(options) {
    // options || (options = { });
    // this.setOptions(options);
    // this._setWidthHeight(options);
    if (this._element && this.crossOrigin) {
      this._element.crossOrigin = this.crossOrigin;
    }
  },
  _renderFill_overwritten: fabric.Image.prototype._renderFill,
  _renderFill: function(ctx){
    if(!this._element)return;

    if(this.fitting === "manual"){
      this._renderFill_overwritten(ctx);
    }else{
      ctx.drawImage( this._element,
        0, 0, this._element.width, this._element.height,
        - this.width / 2, - this.height / 2, this.width, this.height);
    }
  },
  setElement: function(element, doNotUpdateSrc) {
    /**
     * if lement is a SVG group then add _objects and represent SVg as an Image
     */
    // if(element.type === "svg+xml"){
    // let xml = jQuery.parseXML(atob(element.src.substr(26)));
    // fabric.parseSVGDocument(xml.documentElement, results => {
    //   this._objects = results;
    //   for(let el of this._objects){
    //     el.group = this;
    //   }
    // });
    //}

    if(!doNotUpdateSrc){
      delete this.src
      delete this._src
    }
    this.removeTexture(this.cacheKey);
    this.removeTexture(this.cacheKey + '_filtered');
    this._set("_element",element)
    // this._element = element;
    this._originalElement = element;

    let options = {width: this.width, height: this.height};
    this._setWidthHeight(options);
    if (this._element && this.crossOrigin) {
      this._element.crossOrigin = this.crossOrigin;
    }
    this.filters.length && this.applyFilters();
    this.resizeFilter && this.applyResizeFilters();
    this.fire("element:modified");
    return this;
  },
  _setElement_overwritten: fabric.Image.prototype.setElement,
  initialize: function (options, callback) {
    this.cacheKey = 'texture' + fabric.Object.__uid++;
    this.filters = [];
    this.resizeFilters = [];
    if(!options.fitting)options.fitting = this.fitting;

    fabric.Object.prototype.initialize.call(this, options, callback);
    // this.setFitting(this.fitting);
  },
  setData: function(data){
    // this.fitting = this.__proto__.fitting;
    this.setSrc(data.src);
  },
  loader: null,
  store_originalSrc: function () {
    return this._edited ? (this._original_src || this._originalElement && this._originalElement.src || this._element && this._element.src || this.src) : null;
  },
  setElementFromMenu: function (data) {
    this.setElement(data.image)
  },
  sourceRoot: "",
  thumbnailSourceRoot: "",
  store_filters: function () {
    if(!this.filters || !this.filters.length)return;
    return this.filters.filter(el=>(el.stored !== false)).map( filterObj => filterObj.toObject());
  },
  store_resizeFilters: function () {
    if(!this.resizeFilters || !this.resizeFilters.length)return;
    return this.resizeFilters.map( filterObj => filterObj.toObject());
  },
  setThumbnail: function (src) {
    if(!src || this.loaded)return;

    if(this.thumbnailSourceRoot) {
      if(this.getURL){
        src = this.getURL(src,"thumbnail");
      }
      src = fabric.util.getURL(src, this.thumbnailSourceRoot);
    }

    fabric.util.loadImage(src, img => {
      if(this.loaded)return;
      this._setElement_overwritten(img);
      // this.fitImage();
      this.canvas && this.canvas.renderAll();
    });
  },
  setOriginalSrc(value) {
    this._edited = true;
    fabric.util.__sourceRoot = this.sourceRoot;
    fabric.util.loadImage(options.originalSrc, function (img) {
      this._originalElement = img;
    }.bind(this), this, this.crossOrigin); //todo
    delete fabric.util.__sourceRoot;
  },
  /**
   * Sets crossOrigin value (on an instance and corresponding image element)
   * @return {fabric.Image} thisArg
   * @chainable
   */
  setCrossOrigin: function (value) {
    this.crossOrigin = value;
    if (this._element) {
      this._element.crossOrigin = value;
    }
    return this;
  },
  uploaderOptions: {
    onRead(image) {
      this.setElement(image);
    }
  },
  uploadImage(options){
    fabric.util.uploadDialog(options || this.uploaderOptions,this)
  },
  setAsBackgroundImage(){

    let canvas = this.canvas;
    canvas.saveState(["backgroundImage"]);
    canvas.history.processing = true;

    this._normalizeAngle();
    let _deviation = this.angle % 90;
    this.angle = Math.floor(this.angle / 90) * 90;
    if (_deviation > 45) {
      this.angle += 90;
    }
    let scaleX, scaleY;

    if (this.angle === 90 || this.angle === 270) {
      scaleX = canvas.width / this.height;
      scaleY = canvas.height / this.width;
    } else {
      scaleX = canvas.width / this.width;
      scaleY = canvas.height / this.height;
    }
    //
    // let backgroundOptions = this.storeObject();
    // delete backgroundOptions.type;
    // backgroundOptions.element = this._element;
    // backgroundOptions.src = this.src;

    this.removeFromCanvas();
    this._setOriginToCenter();
    this.set({
      scaleX: scaleX,
      scaleY: scaleY,
      left: canvas.width / 2,
      top: canvas.height / 2
    });
    this._resetOrigin();
    this.updateClipPath();
    this.updatePhoto();
    this.updateDeco();

    canvas.backgroundImage = this;
    canvas.fire("background-image:loaded",{target: this});
    canvas._update_background_overlay_image("background");

    this._history_removed_object = this;

    canvas.history.processing = false;

    canvas.fire("modified");
  }
});

import {getProportions} from "../../util/size.js";
// import {uploadDialog} from "../util/uploader.js";
import {uncapitalize} from "../../util/string.js";

export const FmImage = {
  name: "image",
  prototypes: {
    Image: {
      "+cacheProperties": ["crop","fitting","sourceRoot"],
      "+storeProperties": ["crop","fitting","sourceRoot"],
      "+stateProperties": ["crop","fitting","sourceRoot"],
      uploaderOptions: {
        onRead(image) {
          this.setElement(image);
        }
      },
      // uploadImage (options){
      //   uploadDialog(options || this.uploaderOptions, this)
      // },
      eventListeners: {
        // "dblclick": "cropPhotoStart",
        "scaling modified element:modified": "updatePhoto"
      },
      fitting: "fill", //fill to use fullsize images
      setSrc: function (src, callback) {
        this._src = src;
        this.imageLoaded = false;

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
          if(!src.endsWith(".svg")){
            this.setThumbnail(src);
          }
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
          this.dirty = true;
          this.canvas && this.canvas.requestRenderAll();
          this.fire("loaded",{});
          if(this.canvas) {
            this.canvas.processing = _processing;
          }
          callback && callback(this);
        },this);
        return this;
      },
      getSrc: function () {
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
      clone: function(propertiesToInclude,propertiesToExclude) {
        let object = this.getState(propertiesToInclude,propertiesToExclude);
        object.element = this._element;
        for(let property of this.clonedProperties){
          object[property] = this[property];
        }
        return fabric.util.createObject( object )
      },

      cacheProperties: fabric.Image.prototype.cacheProperties.concat(["_element","elementCanvas"]),
      storeProperties: ["type","clipPath","frame","deco","filters", "resizeFilters", "originalSrc", "src", "contentOffsets"],
      optionsOrder: ["timeout","loader", "sourceRoot", "thumbnailSourceRoot", "units", "width", "height", "scaleX", "scaleY", "resizable", "clipPathFitting","clipPath", "fitting",  "*", "crop"],
      isImage: true,
      filters: null,
      //property for resource loading time debugging
      timeout: null,
      resizeFilters: null,
      originalSrc: null,
      color: "red",
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
      // resizable: true,
      minWidth: 1,
      minHeight: 1,
      maxCropZoom: 10,
      minCropZoom: 0.5,

      cropZoomOut: function () {
        let options = {
          scaleX: Math.min(this.maxCropZoom, Math.max(this._cropEl.scaleX * 0.9, this.minCropZoom)),
          scaleY: Math.min(this.maxCropZoom, Math.max(this._cropEl.scaleY * 0.9, this.minCropZoom))
        };
        this.setCrop(options);
        if(this.active_cropEl){
          this.active_cropEl.set(options);
          this.active_cropEl.dirty = true;
          this.canvas.renderAll();
        }
      },
      cropZoomIn: function () {
        // Math.sqrt(this.scaleX * this.scaleY);
        let options = {
          scaleX: Math.min(this.maxCropZoom, this._cropEl.scaleX * 1.11),
          scaleY: Math.min(this.maxCropZoom, this._cropEl.scaleY * 1.11)
        };
        this.setCrop(options);
        if(this.active_cropEl){
          this.active_cropEl.set(options);
          this.active_cropEl.dirty = true;
          this.canvas.renderAll();
        }
      },
      setData: function(data){
        if(data.type === "frame"){
          this.setPhoto(data.photo);
        }
        if(data.type === "image"){
          this.setSrc(data.src);
        }
      },
      getZoom() {
        let zoomValue = this._cropEl ? Math.sqrt(this._cropEl.scaleX * this._cropEl.scaleY): 1;
        return Math.sqrt((zoomValue - this.minCropZoom)/(this.maxCropZoom -this.minCropZoom));
      },
      setZoom(val) {
        if(this.__modifiedBy){
          return;
        }
        this.__modifiedBy = "range";
        let zoomValue = (this.maxCropZoom -this.minCropZoom) * Math.pow(val,2) + this.minCropZoom;
        let options = {scaleX: zoomValue, scaleY: zoomValue};
        this.setCrop(options);
        if(this.active_cropEl){
          this.active_cropEl.set(options);
          this.active_cropEl.dirty = true;
        }
        this.canvas.renderAll();
        delete this.__modifiedBy;
      },
      getCrop(){
        if(!this._cropEl){
          return;
        }
        let data = this._cropEl.getState();
        delete data.type;
        return data;
      },
      setCrop(options){
        if(options === true){
          options = {};
        }
        if(!options){
          if(this._cropEl){
            delete this._cropEl;
            // delete this.crop;
            // this.dirty = true;
            this.fire('crop:modified');
            // this.canvas && this.canvas.renderAll();
          }
          return;
        }
        if(!this._cropEl){
          this._cropEl = new fabric.Crop(options);
          if(!this.clipPath){
            this.setClipPath(true);
          }
          this._cropEl.group = this;
        }else{
          this._cropEl.set(options);
        }
        this.updatePhoto();
        this.fire('crop:modified');
        // this.crop = options;
        this._set("crop",options)
        // this.canvas && this.canvas.renderAll();
      },
      _renderTransformedPhoto: function(ctx,helper) {
        ctx.save();
        if(helper) {
          ctx.globalAlpha *= this.cropOpacity;
        }
        let m = this._cropEl.calcOwnMatrix();
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        let crop = this._cropEl;
        ctx.drawImage(this._element, 0,0, this._element.width, this._element.height,
            -crop.width / 2, -crop.height / 2, crop.width, crop.height);
        ctx.restore();
      },
      _renderFill: function(ctx){
        if(!this._element)return;

        if(this._cropEl) {
          this._renderTransformedPhoto(ctx)
        }
        else{
          if(this.fitting === "manual"){
            this._renderFill_overwritten(ctx);
          }else{
            ctx.drawImage( this._element, 0, 0, this._element.width, this._element.height, - this.width / 2, - this.height / 2, this.width, this.height);
          }
        }
      },
      setFitting(val){
        this.fitting = val;
        if(this.fitting !== "fill"){
          if(!this.clipPath){
            this.setClipPath(true);
          }
          if(!this._cropEl){
            this.setCrop(true)
          }
        }else{
          this.setCrop(false)
        }
        this.updatePhoto();
      },
      updatePhoto(){
        if(this._cropEl && this._element){
          let size = getProportions(this._element,this,this.fitting);
          this._cropEl.width = Math.ceil(size.width);
          this._cropEl.height = Math.ceil(size.height)
        }
      },
      isOnACache: function() {
        return this.ownCaching || (this.group && this.group.isOnACache());
      },
      _getElementSvgTransform() {
        if(!this.crop) {
          return "";
        }
        let crop = this.crop;

        let drawEl = new fabric.Image({
          element: this._element,
          originX: "center",
          originY: "center",
          skewX: crop.skewX || 0,
          skewY: crop.skewY || 0,
          angle: crop.angle || 0,
          left: crop.left * this.width || 0,
          top: crop.top * this.height || 0,
          width: this.width,
          height: this.height,
          scaleX: crop.scaleX || 1,
          scaleY: crop.scaleY || 1,
        });
        drawEl.group = this;
        return drawEl.getSvgTransform();
      },
      /**
       * Returns SVG representation of an instance
       * @return {String} svg representation of an instance
       */
      _toSVG: function() {
        let x = -this.width / 2, y = -this.height / 2;

        let elementMarkup = "", shapeSvg, clipPathId, shapeMarkup = "";
        if(this._cropEl) {
          elementMarkup = `<g ${this._cropEl.getSvgTransform(false)}>
          <image preserveAspectRatio="none"
            xlink:href="${this.getSvgSrc(true)}" x="${-this._cropEl.width / 2}" y="${-this._cropEl.height / 2}"
            width="${this._cropEl.width}" height="${this._cropEl.height}">
          </image>
        </g>`
        }else{
          elementMarkup = `
        <image preserveAspectRatio="none"
          xlink:href="${this.getSvgSrc(true)}" x="${x - this.cropX}" y="${y - this.cropY}" style="${""/*styles*/}"
          width="${this.width}" height="${this.height}">
        </image>`;

          if(this.hasCrop()){
            shapeSvg = `<rect  x="${x}" y="${y}" width="${this.width}" height="${this.height}"/>`;
            clipPathId = fabric.Object.__uid++;
          }
        }

        if (this.stroke || this.strokeDashArray) {
          let origFill = this.fill;
          this.fill = null;
          shapeMarkup  = `<rect x="${x}" y="${y}" width="${this.width}" height="${this.height}" style="${this.getSvgStyles()}"/>`;
          this.fill = origFill;
        }

        let markup =`
        ${this.paintFirst === 'stroke' ? shapeMarkup: ''}
        ${clipPathId ? `<g clip-path="url(#imageCrop_${ clipPathId })">` : ""}
        <g COMMON_PARTS >${elementMarkup}</g>
        ${clipPathId ? `</g>`: ''}
        ${this.paintFirst === 'fill' ? shapeMarkup : ''}
        ${clipPathId ? `<clipPath id="imageCrop_${clipPathId}">${shapeSvg}</clipPath>` : ""}`;

        return [markup.substr(0,markup.indexOf("COMMON_PARTS")), "COMMON_PARTS", markup.substr(markup.indexOf("COMMON_PARTS") + 12)]
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
        this.imageLoaded = true;
        this.fire("element:modified");
        return this;
      },
      _setElement_overwritten: fabric.Image.prototype.setElement,

      loader: null,
      getOriginalSrc: function () {
        return this._edited ? (this._original_src || this._originalElement && this._originalElement.src || this._element && this._element.src || this.src) : null;
      },
      setElementFromMenu: function (data) {
        this.setElement(data.image)
      },
      sourceRoot: "",
      thumbnailSourceRoot: "",
      getFilters: function () {
        if(!this.filters || !this.filters.length)return;
        return this.filters.filter(el=>(el.stored !== false)).map( filterObj => filterObj.toObject());
      },
      getResizeFilters: function () {
        if(!this.resizeFilters || !this.resizeFilters.length)return;
        return this.resizeFilters.map( filterObj => filterObj.toObject());
      },
      setThumbnail: function (src) {
        if(!src || this.loaded)return;

        if(src.constructor === String){
          if(this.thumbnailSourceRoot) {
            if(this.getURL){
              src = this.getURL(src,"thumbnail");
            }
            src = fabric.util.getURL(src, this.thumbnailSourceRoot);
          }

          fabric.util.loadImage(src, img => {
            if(this.loaded)return;
            this._setElement_overwritten(img);
            this.dirty = true
            // this.fitImage();
            this.fire("element:modified");
            this.canvas && this.canvas.renderAll();
          });
        }else{
          this._setElement_overwritten(src);
          this.fire("element:modified");
          this.canvas && this.canvas.renderAll();
        }
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
      setAsBackgroundImage(){

        let canvas = this.canvas;
        canvas.saveStates(["backgroundImage"]);
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
        // let backgroundOptions = this.getState();
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
      },

      getFilter: function (filterName) {
        filterName = uncapitalize(filterName);
        for(let i in this.filters){
          if(uncapitalize(this.filters[i].type) === filterName){
            return this.filters[i];
          }
        }
        return false;
      },
      setFilters: function (filters) {

        this.saveStates(["filters"]);

        this.filters = [];
        if(filters){
          for(let filterOptions of filters){
            //todo replace with application.createObject
            let filterName = fabric.util.string.capitalize(fabric.util.string.camelize(filterOptions.type),true);
            let filter = new fabric.Image.filters[filterName](filterOptions);
            filter.image = this;
            this.filters.push(filter);
          }
        }
        if(this._originalElement){
          this.applyFilters();
        }
        if(this.canvas){
          this.canvas.fire('object:modified', {target: this});
          this.canvas.renderAll();
        }
        this.fire('modified', {} );
      },
      getFiltersOptionsList(){
        let filters = this.editor.getFiltersList(this);
        for (let i in this.filters) {
          let _f = filters.find(item => (item.type === fabric.util.string.capitalize(this.filters[i].type)));
          if(_f){
            _f.enabled = true;
          }
        }

        for (let i in filters) {
          filters[i].id = filters[i].type;
        }
        return [{
          id: 'none',
          text: 'original',
          enabled: !this.filters || !this.filters.length,
          value: false
        }].concat(filters.map(item => ({
          id: item.type,
          value: {
            id: item.type,
            options: item.options
          }
        })));
      },
      createFilterThumbnail(filters, width, height){
        if (!fabric.filterBackend) {
          fabric.filterBackend = fabric.initFilterBackend();
          fabric.isWebglSupported(fabric.textureSize);
        }

        let sourceImage = this.target._originalElement || this.target._element;

        if(!sourceImage){
          return;
        }

        let canvas = fabric.util.createCanvasElement();
        canvas.width = width;
        canvas.height = height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(sourceImage,0,0,this.dropdown.previewWidth,this.dropdown.previewHeight);

        let fImage = fabric.util.createObject({
          editor: this.target.editor,
          type: this.target.type ,
          element: canvas,
          filters: filters
        });
        return fImage._element;
      },
      setFilter: function (filter) {
        this.saveStates(["filters"]);


        let _old_filter = false;
        if(filter.replace){
          this.filters = [];
        }else{
          _old_filter = this.filters.find(item => item.type === filter.type);
          // _old_filter = fabric._.findWhere(this.filters, {type: filter.type});
          _old_filter = _old_filter && _old_filter.toObject() || false;
        }

        let _type;
        let _new_filter;

        if(filter.type){
          _type = fabric.util.string.capitalize(filter.type,true);
          _new_filter = filter.options && fabric.util.object.clone(filter.options);
        }else{
          _type = false;
          _new_filter = false;
        }
        this._set_filter(_type, _new_filter, _old_filter);

        if(this.canvas){
          this.canvas.renderAll();
          this.canvas.fire('object:modified', {target: this});
        }
        this.fire('modified', {} );
      },
      _set_filter: function (_type, _new_filter) {
        let _old_filter;

        if(_type){
          _old_filter = this.getFilter(_type);
        }

        if (_old_filter && _new_filter) {
          for (let i in _new_filter) {
            _old_filter[i] = _new_filter[i];
          }
        } else if (_old_filter && !_new_filter) {
          this.filters.splice(this.filters.indexOf(_old_filter), 1);
        }
        if (!_old_filter && _new_filter) {
          var filter = new fabric.Image.filters[_type](_new_filter);
          filter.image = this;
          this.filters.push(filter);
        }
        if(this._originalElement){
          this.applyFilters();
        }
      }
    }
  }
}
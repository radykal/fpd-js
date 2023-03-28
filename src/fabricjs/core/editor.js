/**
 * # editor
 *
 * farbic.app function is the entry point of FabricJS editor.
 * editor could be initialised with configuration object. Different extensions allows to initialize special editor attributes such as *object prototypes*, *resizable canvas*, *available fonts*, etc.
 *
 * ### option: util
 * mediaRoot - root directory for all media files in fabric editor
 *
 * ### option: resizable
 * makes canvas responsible. Canvas will be scaled to 100% of its container size
 *
 * ### option: onResize
 * function which override deafult canvas resize behavior.
 *
 * ### option: callback
 * function calls after canvas initialized
 *
 * ### option: initialize
 * function calls before canvas initialize
 *
 * @example
 *
 * new fabric.Editor({
 *      resizable: true,
 *      onResize: function(){},
 *      util: {
 *        mediaRoot: '../../media/'
 *      },
 *      canvasContainer: "fiera-canvas",
 *      prototypes: {},
 *      objects: {},
 *      eventListeners: {},
 *      callback: function(){},
 *      initialize:  function(){}
 *      customPubliceditorFunction: function(){},
 *      customPubliceditorAttribute: value
 *  })
 */

fabric.PREVIEW_MODE_OPTIONS = {
  NONE: 0,
  SINGLE: 1,
  ALL: 2
};

fabric.Editor = fabric.util.createClass(fabric.Observable,{
  initialize: function(options,callback){
    this.klasses = [];
    options = fabric.util.object.clone(options)

    //todo create setter
    if (options.plugins) {
      options.prototypes = this.initPlugins(options.plugins, options.prototypes)
      delete options.plugins
    }
    this.on(this.eventListeners)
    //todo create setter
    if (options.eventListeners) {
      this.on(options.eventListeners)
      delete options.eventListeners;
    }

    //todo create setter
    this.virtual = options.virtual || fabric.isLikelyNode
    delete options.virtual

    options =  fabric.util.object.clone(options)

    this.fire("created",{options: options})
    this.promise = this.load(options,() => {
      callback && callback()
    })
  },

  load(options,callback){
    return new Promise((resolve,reject) => {
      this.loaded = false;
      delete this.target;
      if(this.history){
        this.history.clear();
      }
      this.fire("loading:begin", {options: options});
      this.processing = true;
      this.runPreloaders(options,() =>{
        this.set(options, ()=>{
          this.runPostloaders(options,() =>{
            this.processing = false;
            setTimeout(()=> {
              this.loaded = true;
              this.fire("loaded");
              resolve(this);
              this.onLoad(this);
              callback && callback();
            });
          });
        });
        setTimeout(()=> {
          this.ready = true;
          this.fire("ready");
          this.onReady(this);
        });
      });
    }).catch(e => {
      fabric.traceError(e);
      throw(e);
    })
  },
  runPreloaders(options, callback, index){
    if(!index) index = 0;
    if(!this.preloaders[index]){
      callback();
      return;
    }
    this.preloaders[index].call(this,options,()=>{
      this.runPreloaders(options, callback, ++index);
    })
  },
  runPostloaders(options, callback, index){
    if(!index) index = 0;
    if(!this.postloaders[index]){
      callback();
      return;
    }
    this.postloaders[index].call(this,options,()=>{
      this.runPostloaders(options, callback, ++index);
    })
  },
  postloaders: [],
  preloaders: [],
  klasses: null,
  type: "editor",
  stateProperties: ["slide", "slides"],
  storeProperties: [],
  activeSlide: 0,
  ready: false,
  optionsOrder: ["mediaRoot", "prototypes", "actions", "canvasContainer", "fonts", "history", "*", "toolbars", "tools", "objects", "slide", "slides", "activeSlide"],
  onReady: function (editor) {},
  onLoad: function (editor) {},
  // initSteps: [
  //   // "preloader",
  //   "setOptions",
  //   // "postloader",
  //   "finalise"
  // ],
  previewMode: fabric.PREVIEW_MODE_OPTIONS.SINGLE,
  cacheProperties: [],
  /**
   * Additional Event Listeners couldbe used to detect activeobject changes
   *  - canvas:created
   *  - entity:load - Event fired on creation of every new fabric instance(canvas,brush,object)
   *
   *  @example
   *  'entity:load' : function(e){
   *     if(e.options.boxType == 'machine') {
   *       e.options.type = "machine-mask-rectangle";
   *     }
   *   }
   */
  eventListeners: {
    "canvas:created": [],
  },
  createObject: function (originalOptions,callback) {
    let options = Object.assign({editor: this}, this.getDefaultProperties(originalOptions.type), originalOptions);
    return fabric.util.createObject(options, callback );
  },
  setMediaRoot: function (val) {
    if (val) {
      if (val.indexOf("://" !== -1)) {
        fabric.mediaRoot = val;
        return;
      }
      let _dirname;
      if (fabric.isLikelyNode) {
        _dirname = __dirname;
      } else {
        _dirname = fabric.util.path.getParentDirectoryUrl(window.location.href);
      }
      let _last = val[val.length - 1];
      if (_last !== "/" && _last !== "\\") {
        val += "/"
      }
      val = fabric.util.path.resolve(_dirname + val);
      fabric.mediaRoot = val;
    }
  },
  createCanvas: function (data) {
    let fabricCanvas;
    let options = {editor: this};
    if (data.width) {
      options.width = data.width;
    }
    if (data.height) {
      options.height = data.height;
    }
    if (fabric.isLikelyNode) {
      fabricCanvas = new fabric.StaticCanvas(options);
    } else {
      fabricCanvas = new fabric.Canvas(options);
    }
    fabricCanvas.editor = this;

    delete data.width;
    delete data.height;

    this.fire("canvas:created");
    return fabricCanvas;
  },
  getLibraryElements: function (options) {
    return [];
  },
  _setCanvasContainer: function (el, callback) {
    this.canvasContainer = el;
  },
  setCanvasContainer: function (canvasContainer, callback) {
    //waiting while doument is ready
    if (canvasContainer.constructor === String) {
      let el = document.getElementById(canvasContainer);
      if (el) {//} || fabric.isLikelyNode) {
        this._setCanvasContainer(el);
        callback();
      } else {
        $(document).ready(() => {
          this._setCanvasContainer(document.getElementById(canvasContainer));
          callback();
        })
      }
    } else {
      this._setCanvasContainer(canvasContainer);
    }
  },
  dispose: function () {
    this.canvas.dispose();
  },
  slides: null,
  slide: null,
  setSlide: function (slide, callbackFn) {
    this._setSlidesData([slide],callbackFn);
    this.setActiveSlide(0);
  },
  setSlides: function (slides, callbackFn) {
    this._setSlidesData(slides,callbackFn);
  },
  _replaceCanvasElement(container, slideWrapper, _oldWrapper) {
    //container CANVAS
    if (container.constructor === HTMLCanvasElement) {
      container.parentNode.replaceChild(slideWrapper, container);
      container = slideWrapper;
    }
    else if (!_oldWrapper) {
      //container DIV
      container.appendChild(slideWrapper);
    }
    //container .CANVAS-CONTAINER
    else if (container === _oldWrapper) {
      _oldWrapper.parentNode.replaceChild(slideWrapper, _oldWrapper);
      container = slideWrapper;
    }
    //container DIV
    else if (_oldWrapper) {
      $(_oldWrapper).remove();
      container.appendChild(slideWrapper);
    }
  },
  _setActiveSlide(slide) {
    if (this.canvas === slide) return;
    let old = this.canvas;
    this.canvas = slide;

    if (old) {
      // old.discardActiveGroup();
      old.discardActiveObject();
      old.renderAll();
    }

    if (this.previewMode === fabric.PREVIEW_MODE_OPTIONS.SINGLE) {
      if (this.canvasContainer) {
        this._replaceCanvasElement(this.canvasContainer, slide.wrapperEl, old && old.wrapperEl);
      }
    } else {
      //container DIV
      if (old) {
        $(old.wrapperEl).removeClass("active");
      }
      $(slide.wrapperEl).addClass("active");
    }

    slide._onResize();
    this.fire("slide:changed", {canvas: this.canvas});
  },
  setActiveSlide: function (slideId) {
    this.activeSlide = slideId;
    if (fabric.isLikelyNode) {
      return;
    }
    let slide;
    if (!this.slides) {
      return false;
    }
    if (slideId.constructor === Number) {
      slide = this.slides[slideId];
    }
    else if (slideId.constructor === String) {

    } else {
      slide = slideId;
    }
    this._setActiveSlide(slide);
  },
  addSlide: function (options,callback) {
    options = fabric.util.object.clone(options);
    options.editor = this;
    let slide;
    if (fabric.isLikelyNode) {
      slide = new fabric.StaticCanvas(options,callback);
    } else {
      slide = new fabric.Canvas(options,callback);
    }
    this.slides.push(slide);
    if (this.previewMode === fabric.PREVIEW_MODE_OPTIONS.ALL) {
      if (this.canvasContainer) {
        this.canvasContainer.appendChild(slide.wrapperEl);
        slide._onResize();
      }
    } else {
      this._old = this.canvas;
    }

    slide.on("mouse:down:before", function () {
      let index = this.editor.slides.indexOf(this)
      this.editor.setActiveSlide(index);
    }, true);

    this.fire("slide:created", {target: slide});
    return slide;
  },
  removeSlide: function (slide) {
    let _s = this.slides;
    let _curPos = _s.indexOf(slide);
    _s.splice(_curPos, 1);
    slide.fire("removed");

    if (slide === this.activeSlide) {
      delete this.activeSlide;
    }

    if (this.slides.length === 0) {
      let slideData = {};
      let _slide = this.addSlide(slideData);
      _slide.load(_slide.object);
      this.setActiveSlide(0);
    } else if (this.slides.length > _curPos) {
      this.setActiveSlide(_curPos);
    } else {
      this.setActiveSlide(_curPos - 1);
    }
  },
  store_slides() {
    if (!this.slides)return;
    return this.slides.map(slide => slide.storeObject() )
  },
  store_slide() {
    if (!this.slide)return;
    return this.slide.storeObject();
  },
  _setSlidesData: function (slides,callback) {
    delete this.canvas;
    delete this.activeSlide;

    if (this.slides) {
      this.slides.forEach(slide => {
        slide.processing = true;
        let wrapper = slide.wrapperEl;
        if(wrapper.parentNode){
          wrapper.parentNode.removeChild(wrapper);
        }
        slide.dispose();
        // parent.appendChild(wrapper);
        // slide.lowerCanvasEl.parentNode.removeChild(slide.lowerCanvasEl);
      });
    }
    this.slides = [];
    this._processingSlides = true;
    for (let slide of slides) {
      this.addSlide(slide, () => {
        if (this._processingSlides) {
          return false;
        }
        for (let slide of this.slides) {
          if (!slide.loaded) return false;
        }
        this.setActiveSlide(0);
        callback && callback();
        this.fire("loading:end", {});
        return true;
      })
    }
    if(this.activeSlide){
      this.setActiveSlide(this.activeSlide);
    }
    this._processingSlides = false;
  },
  //--------------------------------------------------------------------------------------------------------------------
  // Event Listeners
  //--------------------------------------------------------------------------------------------------------------------

  setEventListeners: fabric.Object.prototype.setEventListeners,
});

/**
 * FabricJS Object Data.
 * @typedef {Object} fabric.ObjectData
 * @type String type
 * @type Number [top]
 * @type Number [left]
 * @type Number [width]
 * @type Number [height]
 * @type Number [scaleY]
 * @type Number [scaleX]
 * @type Number [angle]
 * @default
 */

/**
 * FabricJS Canvas Data.
 * @typedef {Object} fabric.CanvasData
 * @property {Array<fabric.ObjectData>} [objects]
 * @property {Number} [width]
 * @property {Number} [height]
 * @property {(String|fabric.Pattern)} [backgroundColor] Background color of canvas instance.
 * @property {(String|fabric.Image)} [backgroundImage] Background color of canvas instance.
 * @property {(String|fabric.Pattern)} [overlayColor] overlay color of canvas instance.
 * @property {(String|fabric.Image)} [overlayImage] overlay color of canvas instance.
 */

/**
 * FabricJS Editor Data.
 * @typedef {Object} fabric.EditorData
 * @property {Array<fabric.CanvasData>} [slides]
 * @property {fabric.CanvasData} [slide]
 */

/**
 * convert data to readable format
 * @param {String | Array<fabric.CanvasData> | fabric.CanvasData | Object<string,fabric.CanvasData> |  fabric.EditorData} data filename or editor data or canvas data
 * @returns {fabric.EditorData}
 */
fabric.util.formatEditorData = function(data){
  //support of <FileNameString> format
  if (data.constructor === String) {
    data = fabric.util.load(path.resolve(data), 'json');
  }
  //support of <[CanvasObject...]> format
  if(data.constructor === Array){
    data = {slides: data};
  }
  //Object
  else{
    //support of <CanvasObject> format
    if(!data["slide"] && !data["slides"]){
      data = {slides: [data]};
    }
  }
  for(let i in data.slides){
    if(data.slides[i].constructor === String){
      data.slides[i] = JSON.parse(data.slides[i]);
    }
  }
  return data;
}

export const FmInitialize = {
  name: "initializer",
  install(){

    fabric.util.createObject = function(type, originalOptions, callback, editor, canvas) {
      if (typeof type !== "string") {
        canvas = editor
        editor = callback
        callback = originalOptions
        originalOptions = type
        type = originalOptions.type
      }

      let options = Object.assign({editor,canvas},originalOptions)

      let ObjectClass = fabric.util.getKlass(type,options.editor && options.editor.klasses)

      if (!ObjectClass) {
        console.warn(`klass ${type} is undefined`);
        if(!options.text){
          options.text = type
        }
        return new fabric.Text(options, callback);
      }
      let createdObject = new ObjectClass(options, callback);

      //fabricjs fallback for syncronous objects
      if(createdObject.initialize.length === 1){
        callback && callback(createdObject)
      }
      return createdObject
    }

    fabric.Path.fromElement = function(element, callback, options) {
      let parsedAttributes = fabric.parseAttributes(element, fabric.Path.ATTRIBUTE_NAMES);
      parsedAttributes.fromSVG = true;
      options.path = parsedAttributes.d;
      callback(new fabric.Path(Object.assign(parsedAttributes, options)));
    }
  },
  prototypes: {
    StaticCanvas: {
      createObject: function (type, options, callback) {
        if (typeof type !== "string") {
          callback = options;
          options = type;
          type = options.type;
        }
        if (!options) {
          options = {};
        }

        let synqEl = fabric.util.createObject(type, options, el => {
          //native fabricjs objects support
          if (!synqEl) {
            this.add(el);
          }
          //only needed if using async objects without .ext classes
          callback && callback(el);
        },this.editor,this);
        if (synqEl) {
          this.add(synqEl);
        }
        return synqEl;
      },
      addObjects(objects, callback) {
        if(objects.constructor !== Array){
          objects = [...arguments];
          callback = null;
        }

        objects = objects.filter(o => o);

        if (!objects || !objects.length) {
          callback && callback();
          return
        }

        // if (fabric.util.loaderDebug) {
        // 	let debugInfo = objects.map((o) => {if(!o.id)o.id = o.type + "-" + fabric.util.idCounter++;return o.id;});
        // 	console.log(`${this.id}: 0/${debugInfo.length} . ${debugInfo.join(",")}`,)
        // }


        // let queueLoadCallback = new LoaderQueue({
        //   elements: objects,
        //   complete: () => {
        //     callback && callback();
        //   },
        //   progress: (l, t, el) => {
        //     this.fire("progress", {loaded: l, total: t});
        //     if (fabric.util.loaderDebug) {
        //       console.log(`${this.id}: ${l}/${t} . ${el.id} loaded`);
        //     }
        //   }
        // });
        // queueLoadCallback.data = (this.title || "") + "objects";


        let promises = []
        let parsedObjectsOptions = [];
        for (let i in objects) {
          if (!objects[i]) continue;
          if (objects[i].constructor === String) {
            if (this.editor && this.editor.objects[objects[i]]) {
              parsedObjectsOptions.push(this.editor.objects[objects[i]]);
            }
          } else if (objects[i].constructor === Object) {
            parsedObjectsOptions.push(objects[i])
            // fabric.util.object.clone
          } else {
            parsedObjectsOptions.push(objects[i])
          }
        }

        for (let object of parsedObjectsOptions) {

          if (object.constructor === Object) {
            promises.push(new Promise(resolve => {
              this.createObject(object, el => {
                resolve()
              });
            }))
          } else {
            this.add(object);
            object.setCoords()
            if (!object.loaded) {
              promises.push(new Promise(resolve => {
                object.on("loaded", () => {
                  resolve()
                })
              }))
            }
          }
        }

        Promise.all(promises).then(callback)
      }
    },
    Object: {
      optionsOrder: ["width","height","scaleX","scaleY","resizable","*"],
      initialize(options,callback){
        this.initOptions(options,callback)
        // this.setOptions(options,callback)
      },
      initOptions(options, callback) {
        this.processing = true
        if (options.type) {
          this.type = options.type
        }
        if(options.canvas){
          this.canvas = options.canvas
          if(!options.editor && options.canvas.editor){
            options.editor = options.canvas.editor
          }
        }
        if(options.editor){
          this.editor = options.editor
          let defaultProperties = this.editor.getDefaultProperties(this.type);
          for (let key in defaultProperties) {
            if (options[key] === undefined) {
              options[key] = defaultProperties[key]
            }
          }

        }
        if(this.defaultOptions){
          for (let key in this.defaultOptions) if (options[key] === undefined) options[key] = this.defaultOptions[key]
        }
        if(options.editor) {
          this.editor.fire("entity:created", {target: this, options: options});
        }

        fabric.util.fire("entity:created", {target: this, options: options})
        delete options.canvas
        delete options.editor
        delete options.type

        //todo ugly
        if(!options.resizable && this.resizable){
          this.setResizable(this.resizable)
        }

        this.set(options, () => {
          this.loaded = true
          setTimeout(() => {
            this.fire("loaded")
            this.editor && this.editor.fire("object:loaded", {target: this, type: "object"});
            callback && callback(this);
          })
        })
        this.processing = false
      },
      getTransformStoredProperties(){
        if (this.canvas && this.canvas._currentTransform) {
          return ["left", "top", "width", "height", "scaleX", "scaleY", "skewX", "skewY"];
        }
        return null;
      }
    },
    Text: {
      initializeNative: fabric.Text.prototype.initialize,
      initialize: function (options, callback) {
        //backward compatibility
        if(options.constructor !== Object){
          if(!this.initOptions){
            return this.initializeNative(options,callback)
          }
          let text = arguments[0]
          options = arguments[1] || {}
          callback = arguments[2] || null
          options.text = text;
        }

        this.styles = options ? (options.styles || {}) : {};
        this.text = options.text || "";
        this.__skipDimension = true;
        this.initOptions( options, callback);
        this.__skipDimension = false;

        this.ready = true;
        // this._clearCache();
        // this._splitText();
        // this.cleanStyle(styleName);

        if (!(this.editor && this.editor.virtual && !this.editor.ready)) {
          this.initDimensions();
        }
        this.setupState({propertySet: '_dimensionAffectingProps'});
      }
    },
    IText: {
      initialize: function (options, callback) {
        fabric.Text.prototype.initialize.call(this, options, callback);
        this.initBehavior();
      }
    },
    Group: {
      initializeNative: fabric.Group.prototype.initialize,
      initialize: function(options, callback) {
        //backward compatibility
        if(options.constructor !== Object){
          if(!this.initOptions) {
            // return this.initializeNative(options.objects, options);
            let objects = options.objects;
            delete options.objects;

            options = options || {};
            this._objects = [];
            let isAlreadyGrouped = this._isAlreadyGrouped;


            // if objects enclosed in a group have been grouped already,
            // we cannot change properties of objects.
            // Thus we need to set options to group without objects,
            isAlreadyGrouped && this.callSuper('initialize', options);
            this._objects = objects || [];
            for (var i = this._objects.length; i--; ) {
              this._objects[i].group = this;
            }

            if (!isAlreadyGrouped) {
              var center = options && options.centerPoint;
              // we want to set origins before calculating the bounding box.
              // so that the topleft can be set with that in mind.
              // if specific top and left are passed, are overwritten later
              // with the callSuper('initialize', options)
              if (options.originX !== undefined) {
                this.originX = options.originX;
              }
              if (options.originY !== undefined) {
                this.originY = options.originY;
              }
              // if coming from svg i do not want to calc bounds.
              // i assume width and height are passed along options
              center || this._calcBounds();
              this._updateObjectsCoords(center);
              delete options.centerPoint;
              this.callSuper('initialize', options);
            }
            else {
              this._updateObjectsACoords();
            }

            this.setCoords();
            return;
          }

          let objects = arguments[0]
          options = arguments[1] || {}
          callback = arguments[3] || null;
          this._isAlreadyGrouped = arguments[2] || false
          options.objects = objects;
        }


        this._objects = [];

        if(this.objects && !options.objects){
          options.objects = this.objects
        }

        // let objectsUsed = options.objects[0] && options.objects[0].constructor === Object;
        // this._isAlreadyGrouped = !objectsUsed && !!options.width;
        this._isAlreadyGrouped = !!options.width;
        // this._isAlreadyGrouped = true;
        this._centerPoint = options.centerPoint;
        this.initOptions(options, callback);

        this.on("removed", () => {
          for (let i = this._objects.length; i--;) {
            this._onObjectRemoved(this._objects[i]);
            this._objects[i].fire('removed');
          }
        });
        delete this._centerPoint;
        delete this._isAlreadyGrouped;
      }
    },
    Image: {
      initializeNative: fabric.Image.prototype.initialize,
      initialize: function (options, callback) {
        //backward compatibility
        if(options.constructor !== Object){
          if(!this.initOptions) {
            return this.initializeNative(arguments[0], arguments[1]);
          }

          let element = arguments[0]
          options = arguments[1] || {}
          callback = arguments[2] || null
          options.element = element;
        }

        this.defaultOptions = {fitting: this.fitting}
        let newOptions = Object.assign({},options)
        if(options.src && options.element){
          this.src = fabric.util.getURL(options.src, this.sourceRoot);
          delete newOptions.src;
        }

        this.cacheKey = 'texture' + fabric.Object.__uid++;
        this.filters = [];
        this.resizeFilters = [];

        this.initOptions(newOptions, callback)
      }
    },
    Path: {
      initializeNative: fabric.Path.prototype.initialize,
      initialize: function (options,callback) {
        //backward compatibility
        if(options.constructor === String) {
          if(!this.initOptions){
            return this.initializeNative(options.path,options,callback);
          }
          let path = arguments[0]
          options = arguments[1]
          callback = arguments[2]
          options.path = path;
        }

        if(!options.path){
          options.path = `M 0 0 h ${options.width} v ${options.height} h ${-options.width} z`;
        }

        this.initOptions( options, callback)
        if(this.cropPath) {
          fabric.Polyline.prototype._setPositionDimensions.call(this, options);
        }
        else{
          this.pathOffset = {
            x: this.width / 2,
            y: this.height / 2
          }
        }
      },
      cropPath: true,
      setPath (path){
        this.saveStates(["path"])
        if (!path) {
          path = [];
        }
        let fromArray = Object.prototype.toString.call(path) === '[object Array]';
        this.path = fromArray ? path
            // one of commands (m,M,l,L,q,Q,c,C,etc.) followed by non-command characters (i.e. command values)
            : path.match && path.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi);

        if (!this.path) {
          return;
        }

        if (!fromArray) {
          this.path = fabric.util.parsePath(path)
        }
        this.updateState()
        // if(this.pathCrop){
        //   fabric.Polyline.prototype._setPositionDimensions.call(this, this);
        // }
        // else{
        //   this.pathOffset = {
        //     x:  this.width / 2,
        //     y:  this.height / 2
        //   };
        // }
      },
      //todo
      // static: {
      //   fromElement: ...
      // }
    },
    Line: {
      storeProperties: ["type", "clipPath", "x1", "x2", "y1", "y2"],
      initialize: function(options, callback) {
        if (!options.points) {
          options.points = [options.x1 || 0, options.y1 || 0, options.x2 || 0, options.y2 || 0];
        }
        this.initOptions( options, callback);
        // this.callSuper('initialize', options);
        this.set('x1', options.points[0]);
        this.set('y1', options.points[1]);
        this.set('x2', options.points[2]);
        this.set('y2', options.points[3]);
        this._setWidthHeight(options);
      }
    },
    Ellipse: {
      // initialize ( options, callback) {
      //   this.initOptions( options, callback);
      // },
      setWidth(val){
        this.width = val;
        this.rx = val/2;
        this.dirty = true;
        this.fire("resized");
      },
      setHeight(val){
        this.height = val;
        this.ry = val/2;
        this.dirty = true;
        this.fire("resized");
      },
      setRx(value) {
        this.setWidth(value * 2);
      },
      setRy(value) {
        this.setHeight(value * 2);
      }
    },
    Circle: {
      storeProperties: ["type","clipPath","frame","deco", 'radius', 'startAngle', 'endAngle'],
      // initialize ( options, callback) {
      //   if(this.initOptions){
      //     this.initOptions( options, callback);
      //   }
      //   else{//backward compatibility
      //     this.callSuper('initialize', options);
      //   }
      // }
    },
    Rect: {
      initialize ( options, callback) {
        if(this.initOptions){
          this.initOptions( options, callback);
        }
        else{//backward compatibility
          this.callSuper('initialize', options);
        }
        this._initRxRy();
      }
    },
    Triangle: {},
    Polyline: {
      initialize: function(options,callback) {
        //backward compatibility
        if(options.constructor === Array) {
          if(!this.initOptions){
            this.callSuper('initialize', options);
            this._setPositionDimensions(options);
            return
          }
          let points = arguments[0]
          options = arguments[1]
          callback = arguments[2]
          options.points = points;
        }

        this.points = options.points || [];
        delete options.points;
        this.initOptions( options, callback);
        this._setPositionDimensions(options);
      }
    },
    Polygon: {
      "+stateProperties": ["points"],
      "+storeProperties": ["points"]
    }
  }
}
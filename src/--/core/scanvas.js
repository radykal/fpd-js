
/**
 ### attribute: backgroundImageProperties

 default attributes for background image

 ### freeDrawingBrush

 default active drawing brush

 ```
 freeDrawingBrush: "PaintBucketBrush" | "PaintPenBrush" | "PencilBrush"
 ```

 ### attribute: onSlideLoaded

 onSlideLoaded calls as a callback for load fucntion

 ### attribute: backgroundPosition
 ```
 backgroundPosition: 'manual' | 'resize' | 'contain' | 'cover' | 'center'
 ```

 - manual - background will ne not scaled and put at left top corner
 - resize - canvas will be resized according to image size
 - contain - will be scaled to contain canvas size
 - cover - will be scaled to cover all canvas size
 - center - backogrund will be not scaled but put in the middle

 ### method: setInteractiveMode

 switch between drawing and hand( moving cunvas by mouse) modes

 ```javascript
 canvas.setInteractiveMode( mode : "hand" | "mixed") : void
 ```

 ### drawingColor

 drawing color using by brushes

 */



const CanvasMixin = {
	processingProperties: [],

	/**
	 * @private
	 */
	getObjectByID: function(_id){
		if(this._objects){
			for (let o of this._objects) {
				if (o.id === _id) {
					return o;
				}
			}
		}
		return null;
	},
	removeProcessinProperty(property){
		this.processingProperties.splice(this.processingProperties.indexOf(property),1);
		if(!this.processing && !this.processingProperties.length){
			this.fire("processing:end")
		}
	},
	addProcessinProperty(property){
		if(!this.processing && !this.processingProperties.length){
			this.fire("processing:start")
		}
		this.processingProperties.push(property);
	},
	cacheProperties: [],
	objects: null,
	/**
	 * @values  "svg" | "canvas
	 */
	canvasType: "canvas",
	hasStateChanged: fabric.Object.prototype.hasStateChanged,
	setEventListeners: function(val){
		this.on(val);
	},
	find: function (options) {
		if (typeof options === "string"){
			options = {
				type: options
			}
		}
		return this._objects.filter(item => {
			for(let i in options){
				if(item[i] !== options[i])return false;
			}
			return true;
		});
		// return fabric._.where(this._objects,options);
	},
	onResize: function(){
		let _scale = Math.min(1,800 /this.width );
		// this.setZoom(_scale);
		this.setDimensions({width: this.width,height: this.height});
	},
	getCenter: function (el) {
		return {
			top: (this.originalHeight  || this.getHeight()) / 2,
			left: (this.originalWidth || this.getWidth()) / 2
		};
	},
	setOriginalSize: function (w, h) {
		this.originalWidth = h ? w : (w.naturalWidth || w.width);
		this.originalHeight = h ? h : (w.naturalHeight || w.height);
		this.fire('resized')
		return this;
	},
	setOriginalWidth: function (value) {
		this.originalWidth = value;
		if(!this.stretchable){
			this.setWidth(value);
		}
		this.fire('resized')
	},
	setOriginalHeight: function (value) {
		this.originalHeight = value;
		if(!this.stretchable){
			this.setHeight(value);
		}
		this.fire('resized')
	},

	// _setupCurrentTransform_overwritten: fabric.Canvas.prototype._setupCurrentTransform,

	/**
	 * @private
	//  * @param {Event} e Event object
	//  * @param {fabric.Object} target
	//  */
	// _setupCurrentTransform: function (e, target, alreadySelected) {
	// 	if (!target) {
	// 		return;
	// 	}
	// 	// target.processing = true;
	// 	this._setupCurrentTransform_overwritten(e, target, alreadySelected)
	// },

	/**
	 * @override
	 * @private
	 * @param {Event} e send the mouse event that generate the finalize down, so it can be used in the event
	 */
	_finalizeCurrentTransform: function(e) {
		let transform = this._currentTransform,
			target = transform.target,
			eventName,
			options = {e: e, target: target, transform: transform};

		if (target._scaling) {
			target._scaling = false;
		}

		target.setCoords();
		// target.processing = false;

		if (transform.actionPerformed) {
			eventName = this._addEventOptions(options, transform);
			this._fire(eventName, options);
			// this._fire('modified', options);
			target.updateState()
		}
	},
	/**
	 * @override
	 * @private
	 * @param {fabric.Object} obj Object that was added
	 */
	_onObjectAdded: function(obj) {
		// this.stateful && obj.setupState();
		obj.canvas = this;
		obj.setCoords();
		this.fire('object:added', { target: obj });
		obj.fire('added');
	},

	/**
	 * initialized width of the canvas
	 */
	width: 600 ,
	/**
	 * initialized height of the canvas
	 */
	height: 800,
	/**
	 * output quality
	 */
	dotsPerUnit: 1,
	scale: 1,
	loaded: false,
	/**
	 * required to show video
	 */
	animated: false,
	getOriginalSize: function () {
		return {
			width: this.originalWidth,
			height: this.originalHeight
		}
	},
	setAnimated: function(val){
		this.animated = val;

		let canvas = this;

		let render = function render() {
			canvas.renderAll();
			fabric.util.requestAnimFrame(render);
		};

		if(val){
			fabric.util.requestAnimFrame(render);
		}
	},
	getOriginalWidth(){
		return this.originalWidth || this.width;
	},
	getOriginalHeight(){
		return this.originalHeight || this.height;
	},
	getThumbnail({width, height, zoom, area, contentMode, cutEdges = false} = {}, output) {

		if(!area) {
			area = {left: 0, top: 0, width: this.getOriginalWidth(), height: this.getOriginalHeight()}
		}

		if (cutEdges && this.offsets) {
			area.left += this.offsets.left;
			area.top += this.offsets.top;
			area.width -= this.offsets.left + this.offsets.right;
			area.height -= this.offsets.top + this.offsets.bottom;
		}
		let size;

		if(zoom){
			size = {
				width:  area.width * zoom,
				height:  area.height * zoom,
				scaleX: zoom,
				scaleY: zoom
			}
		}else{
			if(!width) width = this.getOriginalWidth();
			if(!height) height = this.getOriginalHeight();
			size = fabric.util.getProportions(area,{width,height}, contentMode);
		}

		if(!output){
			output = fabric.util.createCanvasElement();
		}
		output.width = size.width;
		output.height = size.height;
		let ctx = output.getContext('2d');

		let vt = this.viewportTransform, rWidth = this.width, rHeight = this.height;
		// let oldScaleX = vt[0], oldScaleY = vt[3], oldX = vt[4], oldY = vt[5];
		// vt[4] = vt[5] = 0;
		// vt[0] = size.scaleX;
		// vt[3] = size.scaleY;
		this.viewportTransform = [size.scaleX, vt[1],vt[2] , size.scaleY, 0, 0];
		this.fire("export:viewport:scaled")
		this.width = size.width
		this.height = size.height


		// this.setViewportTransform([size.scaleX, vt[1],vt[2] , size.scaleY, 0, 0])

		this.skipOffscreen = false;
		this._exporting = true;
		this.renderCanvasLayers(ctx);
		delete this._exporting;
		this.skipOffscreen = true;

		this.viewportTransform = vt;
		this.fire("export:viewport:scaled")
		this.width = rWidth
		this.height = rHeight
		// this.setViewportTransform(vt)
		//
		// vt[0] = oldScaleX;
		// vt[3] = oldScaleY;
		// vt[4] = oldX;
		// vt[5] = oldY;

		return output;
	},
	initialize: function(options, callback) {
		this.processing = true;
		this.processingProperties = [];
		this.renderAndResetBound = this.renderAndReset.bind(this);
		this.requestRenderAllBound = this.requestRenderAll.bind(this);
		this._initEntity(options);
		this._objects = [];
		this.fire("before:created", options);
		if (options.canvasType) {
			this.canvasType = options.canvasType;
		}
		if (options.width) {
			options.originalWidth = options.width;
			options.originalHeight = options.height;
		}
		if (options.allowTouchScrolling) this.allowTouchScrolling = true;

		if (!fabric.isLikelyNode) {
			this.setElement(options.element);
		}
		delete options.element;
		this.processing = false;
		this.load(options,callback)
	},
	_initContextContainer: function () {
		this.contextContainer = this.lowerCanvasEl.getContext('2d');
	},
	_createLowerCanvas: function (canvasEl) {
		if (typeof canvasEl === "string") {
			this.lowerCanvasEl = fabric.util.getById(canvasEl);
		} else if (canvasEl) {
			this.lowerCanvasEl =  this._createCanvasElement(canvasEl);
		} else {
			//edited allow virtul canvas
			// this.virtual = true;
			this.lowerCanvasEl = fabric.util.createCanvasElement();
		}
		fabric.util.addClass(this.lowerCanvasEl, 'lower-canvas');

		if (this.interactive) {
			this._applyCanvasStyle(this.lowerCanvasEl);
		}
		this._initContextContainer();
	},
	renderAll: function () {
		//do not draw anything until ready on Nodejs
		if( this.editor && this.editor.virtual && !this.editor.ready){
			return;
		}


		if(this.contextTop) {
			if (this.contextTopDirty && !this._groupSelector && !this.isDrawingMode) {
				this.clearContext(this.contextTop);
				this.contextTopDirty = false;
			}
			if (this.hasLostContext) {
				this.renderTopLayer(this.contextTop);
			}
		}

		if(this.contextContainer){
			if(this.layers){
				this.renderCanvasLayers();
			}
			else{
				this.renderCanvas(this.contextContainer, this._chooseObjectsToRender());
			}
		}
		return this;
	}
}

Object.assign(fabric.StaticCanvas.prototype, CanvasMixin,{

	includeDefaultValues: false,
	store_width: function () {
		return this.originalWidth || this.width;
	},
	store_height: function () {
		return this.originalHeight || this.height;
	},
	toObject: fabric.Object.prototype.toObject,

  storeProperties: ['objects', 'backgroundColor', 'overlayColor', 'backgroundImage', 'overlayImage', 'width', 'height'],
  type: "static-canvas",
	loaded: false,
	load: function(options,callback){

		this.loaded = false;
		this.processing = true;
		this.fire("loading:before", {type: "slide", options: options});
		this.editor && this.editor.fire("slide:loading:begin", {target: this, type: "slide", options: options});

		// console.log("loading:begin",options.id);
		this.set(options, () => {
			this.loaded = true;
			// delete this.processingProperties;
			//  if(this.loader){delete this._loader;}
			//  console.log("loading:end",this.id);
			this.renderAll();
			setTimeout(() => {
				this.fire("loading:end", {type: "slide", target: this});
				this.editor && this.editor.fire("slide:loading:end", {target: this, type: "slide"});
				callback && callback();
			})
		});

		this.calcOffset();
		this.processing = false;
		this.fire("loading:after", {type: "slide", options: options});
		this.renderAll();
	},
	_initEntity: function (options) {
		this.editor = options.editor;
		fabric.fire("entity:created", {target: this, options: options});
	},
	createObjects(objects, callback) {
		objects = objects && fabric.util.object.clone(objects, true)|| [];
		if (this.editor) {
			for (let i in objects) {
				if (objects[i].constructor === String) {
					objects[i] = this.editor.objects[objects[i]];
				}
			}
		}

		if (!objects || !objects.length) {
			callback && callback();
		}

		if (objects[0] && objects[0].constructor.name === "klass") {
			callback && callback();
			return;
		}

		if (fabric.util.loaderDebug) {
			let debugInfo = objects.map((o) => {
				if(!o.id)o.id = o.type + "-" + fabric.util.idCounter++;
				return o.id;
			});
			console.log(`${this.id}: 0/${debugInfo.length} . ${debugInfo.join(",")}`,)
		}

		// let _objects = [];
		let queueLoadCallback = fabric.util.loader(objects, () => {
			callback && callback();
		}, (l, t, el) => {
			this.fire("progress", {loaded: l, total: t});
			if (fabric.util.loaderDebug) {
				console.log(`${this.id}: ${l}/${t} . ${el.id} loaded`);
			}
		});

		queueLoadCallback.data = (this.title || "") + "objects";

		for (let object of objects) {
			if (this.type === "static-canvas") {
				object.interactive = false;
			}
			object.editor = this.editor;

			let synqEl = fabric.util.createObject(object, el => {
				if(!synqEl){
					this.add(el);
				}
				el.setCoords();
				queueLoadCallback.shift(el);
			});
			if(synqEl){
				this.add(synqEl);
				synqEl.setCoords();
			}
			// _objects.push(el);
		}
	},
	createObject: function (type, options, callback) {
		if (typeof type !== "string") {
			callback = options;
			options = type;
			type = options.type;
		}
		if (!options) {
			options = {};
		}
		options.editor = this.editor;

		let synqEl = fabric.util.createObject(type, options, el=> {
			if(!synqEl){
				this.add(el);
			}
			//only needed if using async objects without .ext classes
			callback && callback(el);
		});
		if(synqEl){
			this.add(synqEl);
		}
		return synqEl;
	},
	setObjects: function (objects, callback) {
		this._objects.length = 0;
		if (this._hasITextHandlers) {
			this.off('mouse:up', this._mouseUpITextHandler);
			this._iTextInstances = null;
			this._hasITextHandlers = false;
		}
		if (this.interactive) {
			this.discardActiveObject();
			if(this.contextTop){
				this.clearContext(this.contextTop);
			}
		}
		this.createObjects(objects, callback);
		this.renderAll();
	},
	setWidth: function (value) {
		if(this.lowerCanvasEl){
			return this.setDimensions({ width: value }, {});
		}else{
			this.width = value;
		}
	},
	setHeight: function (value) {
		if(this.lowerCanvasEl){
			return this.setDimensions({ height: value }, {});
		}else{
			this.height = value;
		}
	},
	_initSize: function () {
		this.width = this.width || parseInt(this.lowerCanvasEl.width, 10) || 0;
		this.height = this.height || parseInt(this.lowerCanvasEl.height, 10) || 0;
		if (!this.lowerCanvasEl.style) {
			return;
		}
		this.lowerCanvasEl.width = this.width;
		this.lowerCanvasEl.height = this.height;

		this.lowerCanvasEl.style.width = this.width + 'px';
		this.lowerCanvasEl.style.height = this.height + 'px';

		this.viewportTransform = this.viewportTransform.slice();
	},
	_setDimensions_overwritten: fabric.Canvas.prototype.setDimensions,
	setDimensions: function (dimensions, options) {

		if(this.editor && this.editor.virtual){
			for (var prop in dimensions) {
				this._setBackstoreDimension(prop, dimensions[prop]);
			}
		}
		else{
			this._setDimensions_overwritten( dimensions, options);
		}

		if(this.backgroundImage && this.backgroundImage.constructor !== String){
			this._update_background_overlay_image("background");
		}
		if(this.overlayImage && this.overlayImage.constructor !== String){
			this._update_background_overlay_image("overlay");
		}
		//this._update_clip_rect();
		this.fire("dimensions:modified");
		this.renderAll();
	},
	store_backgroundColor: function () {
		let val = this.backgroundColor;
		if(val.toObject){
			val = this.backgroundColor.toObject();
			val.source = this.backgroundColor._src;
		}
		return val;
	},
	store_overlayColor: function () {
		let val = this.overlayColor;
		if(val.toObject){
			val = val.toObject();
			val.source = this.overlayColor._src;
		}
		return val;
	},
	store_objects: function () {
		let _objs = this.getObjects().filter(el=>(el.stored !== false));
		if (!_objs.length) return null;
		return _objs.map(instance => {
			return instance.storeObject();
		});
	},
  setElement(element){
    if(element === false)return;
    if(this.canvasType === "canvas"){
      this._createLowerCanvas(element);
      this._initSize();
      this._setImageSmoothing();
      // only initialize retina scaling once
      if (!this.interactive) {
        this._initRetinaScaling();
      }
    }
  }
});

Object.assign(fabric.Canvas.prototype, CanvasMixin,{
  type: "canvas",

	_getPointer_overwritten: fabric.Canvas.prototype.getPointer,
	/*
	 Add Custom Object Tranformations
	 */
	getPointer: function (e, ignoreZoom, upperCanvasEl) {
		let pointer = this._getPointer_overwritten( e, ignoreZoom, upperCanvasEl);
		if (e._group) {
			pointer.x *= this.viewportTransform[0]
			pointer.y *= this.viewportTransform[3]
			pointer.x += this.viewportTransform[4];// * this.viewportTransform[0]
			pointer.y += this.viewportTransform[5];// *  this.viewportTransform[3]
			//console.log(pointer);
			return this._normalizePointer(e._group, pointer);
		}
		return pointer;
	},
  setElement(element){
    if(element === false)return;
    this._createLowerCanvas(element);
    this._currentTransform = null;
    this._groupSelector = null;
    this._initWrapperElement();
    this._createUpperCanvas();
    this._initEventListeners();
    this.calcOffset();
    this.wrapperEl.appendChild(this.upperCanvasEl);
    this._createCacheCanvas();
    this._setImageSmoothing();
    this._initRetinaScaling();
    this._initSize();
  },


  /**
   * @private
   * @param {Object} target
   */
  _createGroup: function(target) {
    var objects = this._objects,
      isActiveLower = objects.indexOf(this._activeObject) < objects.indexOf(target),
      groupObjects = isActiveLower
        ? [this._activeObject, target]
        : [target, this._activeObject];
    this._activeObject.isEditing && this._activeObject.exitEditing();

    return new fabric.ActiveSelection({
      editor: this.editor,
      objects: groupObjects,
      canvas: this
    });
  },

  /** nothing modified*/
  findTarget: function (e, skipGroup) {
    if (this.skipTargetFind) {
      return;
    }

    var ignoreZoom = true,
      pointer = this.getPointer(e, ignoreZoom),
      activeObject = this._activeObject,
      aObjects = this.getActiveObjects(),
      activeTarget, activeTargetSubs;

    // first check current group (if one exists) active group does not check sub targets like normal groups. if active group just exits.
    if (aObjects.length > 1 && !skipGroup && activeObject === this._searchPossibleTargets([activeObject], pointer)) {
      return activeObject;
    }

    this.targets = [];
    //if selected objhject is part of a group.

    //check corner of active object if within a group
    // if(aObjects.length === 1 && activeObject.group){
    //   //calculate transformed pointer
    //   e._group = activeObject.group;
    //   let transformedPointer = this.getPointer(e, ignoreZoom);
    //   delete e._group;
    //   if (activeObject._findTargetCorner(transformedPointer)) {
    //     return activeObject;
    //   }
    // }

    // if we hit the corner of an activeObject, let's return that.
    if (aObjects.length === 1 &&  !activeObject.group && activeObject._findTargetCorner(pointer)) {
      return activeObject;
    }

    // check if selected the same object
    if (aObjects.length === 1 && activeObject === this._searchPossibleTargets([activeObject], pointer)) {
      if (!this.preserveObjectStacking) {
        return activeObject;
      }
      else {
        activeTarget = activeObject;
        activeTargetSubs = this.targets;
        this.targets = [];
      }
    }

    // added event option
    var target = this._searchPossibleTargets(this._objects, pointer);
    // console.log(this.targets);
    // if(this.targets.length){
    //   var target = this._searchPossibleTargets(this._objects, pointer);
    // }


    if (e[this.altSelectionKey] && target && activeTarget && target !== activeTarget) {
      target = activeTarget;
      this.targets = activeTargetSubs;
    }

    //testing
    //     if(this.targets[0]){
    //       this.setActiveObject(this.targets[0]);
    //     }
    //     else{
    //       if(target){
    //         this.setActiveObject(target);
    //       }
    //       else{
    //         // this.discardActiveObject();
    //       }
    //     }
    //     this.requestRenderAll();
    return target;
  },


  //added this.targets check
  _setCursorFromEvent: function (e, target) {
    if (!target) {
      this.setCursor(this.defaultCursor);
      return false;
    }

    var hoverCursor = target.hoverCursor || this.hoverCursor,
      activeSelection = this._activeObject && this._activeObject.type === 'activeSelection' ?
        this._activeObject : null,
      // only show proper corner when group selection is not active
      corner = (!activeSelection || !activeSelection.contains(target))
        && target._findTargetCorner(this.getPointer(e, true));

    if (!corner) {
      if(this.targets.length){
        this.setCursor(this.targets[0].hoverCursor);
      }else{
        this.setCursor(hoverCursor);
      }
    }
    else {
      this.setCursor(this.getCornerCursor(corner, target, e));
    }
  },


  /**overwrittem .
   * added event option
   */
  _searchPossibleTargets: function(objects, pointer)  {
    // Cache all targets where their bounding box contains point.
    var target, i = objects.length, subTarget;
    // Do not check for currently grouped objects, since we check the parent group itself.
    // until we call this function specifically to search inside the activeGroup
    while (i--) {
      var objToCheck = objects[i];
      var pointerToUse;
      if(objToCheck.group && objToCheck.group.type !== 'activeSelection'){
        pointerToUse = this._normalizePointer(objToCheck.group, pointer)
        //adding viewportTransform into a calculation to correctly detect subtargets
        pointerToUse.x *= this.viewportTransform[0]
        pointerToUse.y *= this.viewportTransform[3]
        pointerToUse.x += this.viewportTransform[4]
        pointerToUse.y += this.viewportTransform[5]
      }
      else{
        pointerToUse = pointer;
      }

      if (this._checkTarget(pointerToUse, objToCheck, pointer)) {
        target = objects[i];


        if (target.subTargetCheck && target instanceof fabric.Group) {

          // e._group = target;
          // let transformedPointer = this.getPointer(e, true);
          // delete e._group;

          subTarget = this._searchPossibleTargets(target._objects, pointer);
          subTarget && this.targets.push(subTarget);
        }
        break;
      }
    }
    return target;
  },

  /**
   * @private
   * @param {Event} e mouse event
   */
  _groupSelectedObjects: function (e) {

    var group = this._collectObjects(e),
      aGroup;

    // do not create group for 1 element only
    if (group.length === 1) {
      this.setActiveObject(group[0], e);
    }
    else if (group.length > 1) {
      aGroup = new fabric.ActiveSelection( {
        editor: this.editor,
        objects: group.reverse(),
        canvas: this
      });
      this.setActiveObject(aGroup, e);
    }
  },
	/**
	 * adding e._group = target for better mouse coordinate detection for subtargets
	 */
	_handleEvent: function (e, eventType, button, isClick) {
		var target = this._target,
			targets = this.targets || [],
			options = {
				e: e,
				target: target,
				subTargets: targets,
				button: button || fabric.LEFT_CLICK,
				isClick: isClick || false,
				pointer: this._pointer,
				absolutePointer: this._absolutePointer,
				transform: this._currentTransform
			};
		this.fire('mouse:' + eventType, options);
		target && target.fire('mouse' + eventType, options);

		e._group = target;
		for (var i = 0; i < targets.length; i++) {
			targets[i].fire('mouse' + eventType, options);
		}
		delete e._group;

	},

	stateful: true,
	optionsOrder: ["originalWidth","originalHeight","width","height","*"],
	originalState: {},
	stateProperties: [],
	editingObject: null,
	fitIndex: 0.8,
	originalWidth: 0,
	originalHeight: 0,
	/**
	 * Select object which is over the selected one
	 */
	frontObjectsSelectionPriority: false,
	canvasType: "canvas",
	/**
	 * allow user to interact with canvas
	 */
	interactive: true,

	contextTopImageSmoothingEnabled: true,

	//TODO BUGS IF DISABLED
	preserveObjectStacking: true,

	setBackgroundColor: function(backgroundColor, callback) {
		let value  = this.__setBgOverlayColor('backgroundColor', backgroundColor, callback);
		this.renderAll();
		return value;
	},

	/**
	 * Method that determines what object we are clicking on
	 * the skipGroup parameter is for internal use, is needed for shift+click action
	 * @param {Event} e mouse event
	 * @param {Boolean} skipGroup when true, activeGroup is skipped and only objects are traversed through
	 */
	____findTarget: function (e, skipGroup) {
		if (this.skipTargetFind) {
			return;
		}
		let ignoreZoom = true,
			pointer = this.getPointer(e, ignoreZoom),
			activeGroup = this.getActiveGroup(),
			activeObject = this.getActiveObject(),
			activeTarget, activeTargetSubs;
		// first check current group (if one exists)
		// active group does not check sub targets like normal groups.
		// if active group just exits.
		this.targets = [];
		if (activeGroup && !skipGroup && activeGroup === this._searchPossibleTargets([activeGroup], pointer)) {
			this._fireOverOutEvents(activeGroup, e);
			return activeGroup;
		}
		// if we hit the corner of an activeObject, let's return that.
		if (activeObject && activeObject._findTargetCorner(pointer)) {
			this._fireOverOutEvents(activeObject, e);
			return activeObject;
		}

		if (!this.frontObjectsSelectionPriority && activeObject && activeObject === this._searchPossibleTargets([activeObject], pointer)) {
			if (!this.preserveObjectStacking) {
				this._fireOverOutEvents(activeObject, e);
				return activeObject;
			}
			else {
				activeTarget = activeObject;
				activeTargetSubs = this.targets;
				this.targets = [];
			}
		}

		let target = this._searchPossibleTargets(this._objects, pointer);
		if (e[this.altSelectionKey] && target && activeTarget && target !== activeTarget) {
			target = activeTarget;
			this.targets = activeTargetSubs;
		}
		this._fireOverOutEvents(target, e);
		return target;
	},
	setInteractive (value) {
		this.interactive = value;
	},
	setContextTopImageSmoothingEnabled () {
		let ctx = this.contextTop;
		if(ctx.imageSmoothingEnabled){
			ctx.imageSmoothingEnabled = this.contextTopImageSmoothingEnabled;
			return;
		}
		ctx.webkitImageSmoothingEnabled = this.contextTopImageSmoothingEnabled;
		ctx.mozImageSmoothingEnabled    = this.contextTopImageSmoothingEnabled;
		ctx.msImageSmoothingEnabled     = this.contextTopImageSmoothingEnabled;
		ctx.oImageSmoothingEnabled      = this.contextTopImageSmoothingEnabled;
	},
	_onMouseUpInDrawingMode: function(e) {
		this._isCurrentlyDrawing = false;
		if (this.clipTo) {
			this.contextTop.restore();
		}
		let pointer = this.getPointer(e);
		this.freeDrawingBrush.onMouseUp(pointer);
		this._handleEvent(e, 'up');
	},
	_clearObjects: function(){
		this.discardActiveObject();

		let _removedObjects = this._objects.filter(object => (!object.permanent));
		this._objects = this._objects.filter(object => (object.permanent));

		if (this._hasITextHandlers) {
			this.off('mouse:up', this._mouseUpITextHandler);
			this._iTextInstances = null;
			this._hasITextHandlers = false;
		}
		return _removedObjects;
	},
	clear: function(){
		this.processing = true;
		this.saveState(["overlayImage","backgroundImage", "backgroundColor"]);

		let defaults = this.editor.getDefaultProperties(this.type);

		this.set({
			overlayImage: defaults.overlayImage || null,
			backgroundImage: defaults.backgroundImage || null,
			backgroundColor: defaults.backgroundColor || "#ffffff"
		});
		let _old_objects = this._clearObjects();
		this.processing = false;
		this.fire("canvas:cleared", {objects: _old_objects});
		this.renderAll();
	},
	clearObjects: function(){
		let _oldObjects = this._clearObjects();
		this.clearContext(this.contextContainer);
		this.fire('canvas:cleared',{objects: _oldObjects});
		this.renderAll();
		return this;
	},

	// eventListeners: {
	//   "modified loading:begin draw:after object:modified canvas:cleared object:added object:removed group:removed canvas:created" : function(){
	//     this.dirty = true;
	//     console.log("dirty");
	//   }
	// },
	create: function () {
		this.created = true;
		this._initInteractive();
		this._createCacheCanvas();
	},
	/**
	 * fill not the slide area, but whole canvas with background color
	 */
	deafultText: "You can add some text here",
	defaultTextType: "i-text",
	selectAll(){
		let selection = new fabric.ActiveSelection( this.getObjects(), {canvas: this } );
		this.setActiveObject(selection);
		this.renderAll();
	},
	addRect: function () {
		this.createObject({
			width: 100,
			height: 100,
			active: true,
			position: "center",
			type:   "rect",
			clipTo: this.activeArea,
			movementLimits : this.activeArea
		});
	},
	addCircle: function () {
		this.createObject({
			radius: 50,
			active: true,
			position: "center",
			type:   "circle",
			clipTo: this.activeArea,
			movementLimits : this.activeArea
		});
	},
	addTriangle: function () {
		this.createObject({
			width: 100,
			height: 100,
			active: true,
			position: "center",
			type:   "triangle",
			clipTo: this.activeArea,
			movementLimits : this.activeArea
		});
	},
	addText: function () {
		this.createObject({
			active: true,
			position: "center",
			type:   this.defaultTextType,
			clipTo: this.activeArea,
			text: this.deafultText,
			movementLimits : this.activeArea
		});
	},
	defaultImageURL: "http://",
	addImageByURL(){
		let url = window.prompt("enter image url",this.defaultImageURL);
		if(!url)return;
		this.createObject({
			active: true,
			position: "center",
			type: "image",
			clipTo: this.activeArea,
			movementLimits : this.activeArea,
			src: url,
		})
	},
	removeActive(){
		this._activeObject.removeFromCanvas()
	},
	addInActiveArea(data){
		let activeArea = this.activeArea && this.activeArea.id && "#"+this.activeArea.id;

		let center, width, height
		if(activeArea){
			center = activeArea.getCenterPoint()
			width = activeArea.width * activeArea.scaleX
			height = activeArea.height * activeArea.scaleY
		}else{
			width = this.getOriginalWidth()
			height = this.getOriginalHeight()
			center = {x: width/2, y: height/2}
		}

		let object = this.createObject(data)

		object.set({
			movementLimits: activeArea,
			clipTo: activeArea
		});

		let fitOptions = fabric.util.getProportions(
			{
				width: object.width * object.scaleX,
				height: object.height * object.scaleY
			},{ width, height },"contain");

		object.set({
			left: center.x,
			top: center.y,
			scaleX: object.scaleX * fitOptions.scale,
			scaleY: object.scaleY * fitOptions.scale,
		})

		this.setActiveObject(object)

	},
	setData: function (data) {
		// if (data.role === "frame") {
		//   if(this._activeObject.type === "photo"){
		//     this._activeObject.setFrame(data.frame);
		//     return;
		//   }
		// }
		switch(data.type){
			case "background-image":
				this.setBackgroundImage(data, this.renderAll.bind(this))
				break;
			default:

				let activeArea = this.activeArea && this.activeArea.id && "#"+this.activeArea.id;
				let options = fabric.util.deepExtend({
					position: data.left === undefined && data.top === undefined ? "center" : "manual",
					active: true,
					movementLimits: activeArea,
					clipTo: activeArea
				},data);

				this.createObject(options);
		}
	}
});

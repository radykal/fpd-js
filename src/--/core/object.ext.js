
let ALIASING_LIMIT = 2

Object.assign(fabric.Object.prototype, {

	/** added subtargetcheck support
	 */
	setCoords: function(ignoreZoom, skipAbsolute) {
		this.oCoords = this.calcCoords(ignoreZoom)
		if (!skipAbsolute) {
			this.aCoords = this.calcCoords(true)
		}

		// set coordinates of the draggable boxes in the corners used to scale/rotate the image
		ignoreZoom || (this._setCornerCoords && this._setCornerCoords())


		if(this.subTargetCheck){
			for (let object of this._objects ) {
				object.setCoords()
			}
		}
		return this
	},
  initialize(options, callback) {
	  this.processing = true
    if(options.canvas && !options.editor){
      options.editor = options.canvas.editor
    }
    this.editor = options.editor
    this.canvas = options.canvas

    if (options.type) {
      this.type = options.type
    }
    if(options.id){
      this.id = options.id
    }else{
      this.createID()
    }
    fabric.fire("entity:created", {target: this, options: options})
    delete options.id
    delete options.canvas
    delete options.editor
    delete options.type

    if(!options.resizable){
      options.resizable = this.resizable
    }

    this.set(options, () => {
      this.loaded = true
      this.fire("loaded")
      if(callback){
        setTimeout(() => {
          callback(this)
        })
      }
    })
    this.processing = false
  },
  //especially for text renderCursor function
  _getParentScaleY (){
    return this.scaleY * ( this.group ? this.group._getParentScaleY() :1)// this.canvas.viewportTransform[3])
  },
  _getParentScaleX (){
    return this.scaleX * ( this.group ? this.group._getParentScaleX()  :1)//: this.canvas.viewportTransform[0])
  },
  optionsOrder: ["width","height","scaleX","scaleY","resizable","*"],
  storeProperties: ["type"],
  useSuperClassStoreProperties: true,
  stored: true,
  clonedProperties: ["editor","type"],
  cloneSync: function () {
    let object = this.storeObject(this.clonedProperties)
    return fabric.util.createObject( object)
  },
  createID: function(){
    let regexp = new RegExp("^" + this.defaultIdPrefix + "([0-9]+)$")

    let largestNumber = 0
    if(this.editor && this.editor.slides){
      for(let slide of this.editor.slides){
        largestNumber = slide.checkLargestNumber(regexp, largestNumber)
      }
    }
    else if(this.editor && this.editor.canvas){
      largestNumber = this.editor.canvas.checkLargestNumber(regexp, largestNumber)
    }
    else if(this.canvas){
      largestNumber = this.canvas.checkLargestNumber(regexp,largestNumber)
    }
    this.id =  (this.defaultIdPrefix || this.type + "-") + (largestNumber + 1)
  },
  setPosition(value){
    let _this = this
    function _setPosition(){
      _this.center()
      _this.setCoords()
      setTimeout(()=>{
        _this.off("added",_setPosition)
      })
    }
    if(value === "center") {
      if(this.canvas){
        this.center()
        this.setCoords()
      }else{
        this.on("added",_setPosition,true)
      }
    }
  },
  beforeRender: [],
  afterRender: [],
  //overwritten
  drawObject: function(ctx, forClipping) {
    let originalFill = this.fill, originalStroke = this.stroke
    if (forClipping) {
      this.fill = 'black'
      this.stroke = ''
      this._setClippingProperties(ctx)
    }
    else {
      this._renderBackground(ctx)
      this._setStrokeStyles(ctx, this)
      this._setFillStyles(ctx, this)
    }

    for(let i = 0 ;i < this.beforeRender.length; i++){
      this[this.beforeRender[i]](ctx,forClipping)
    }

    this._render(ctx)
    if(this._objects){
      for (let i = 0, len = this._objects.length; i < len; i++) {
        this._objects[i].render(ctx,forClipping)
      }
    }
    this._drawClipPath(ctx)

    for(let i = 0 ;i < this.afterRender.length;  i++){
      this[this.afterRender[i]](ctx,forClipping)
    }
    this.fill = originalFill
    this.stroke = originalStroke
  },
  isObject: true,
  hasBoundsControls: true,
  stroke: "transparent",
  minStrokeWidth: 0,
  movementDelta: 1,
  eventListeners: {},
  setLocked (value){
    this.evented = !value
    this.selectable = !value
  },
  setActive (value){
    if(!this.canvas){
      this.on("added",() => {
        if(this.canvas.interactive) {
          // if(this.canvas._activeObject){
          //   this.canvas._handleGrouping(null, this)
          // }
          // else{
            this.canvas.setActiveObject(this)
          // }
        }
      })
    }
    else{
      if(this.canvas.interactive) {
        // if(this.canvas._activeObject){
        //   this.canvas._handleGrouping(null, this)
        // }
        // else{
        this.canvas.setActiveObject(this)
        // }
      }
    }
  },
  setLoader(value){
    if(!value)return
    this.loader = value
    this.on("loaded", ()=>{
      this.loaded = true
      if(this._loader){
        this._loader.removeFromCanvas()
      }
    })

    this.on("before:load", ()=>{
      this.loaded = false
      if(this.loader) {
        if(this.canvas){
          this._createLoader()
        }
        else{
          this.on("added",()=> {
            if(!this.loaded){
              this._createLoader()
            }
          })
        }
      }
    })
  },
  _step_Rotating: function (angle) {
    var _a = this.angle

    var x = parseInt(_a / angle) * angle
    if (_a - x < angle / angle) {
      this.setAngle(x)
    } else {
      this.setAngle(x + angle)
    }
  },
  setRotatingStep: function (value) {
    this.rotatingStep = value
    this.on("rotating", function (e) {
      if (!e.e.shiftKey) {
        this._step_Rotating(value)
      }
    })
  },
  _createLoader(){
    let _processing = this.canvas.processing
    this.canvas.processing = true


    this._loader = this.canvas.createObject(this.loader,{
      snappable: false,
      statefullCache: true,
      layer: "interface",
      originX: "center",
      originY: "center",
      stored: false,
      selectable: false,
      evented: false,
      hasControls: false
    })

    this._loader.set({
      relativeLeft: 0,
      relativeTop: 0,
      relative: this
    })

    if(this.canvas) {
      this.canvas.processing = _processing
    }
  },
  getThumbnail ({width, height, scale = 1, output = null,shadow = false}){


	  let dims = this._getTransformedDimensions()
	  if(!width){
	    width = dims.x
    }
    if(!height){
      height = dims.y
    }




    let canvas = fabric.util.createCanvasElement(this.padding * 2 + width * scale, this.padding * 2 + height * scale)
    let ctx = canvas.getContext('2d')

    if(shadow){
      this._setShadow(ctx, this)
    }
    // ctx.translate(0.5  ,0.5)
    ctx.translate(this.padding, this.padding)
    ctx.scale(scale,scale)
    ctx.translate(width/2,height/2)


    this.drawObject(ctx)

    let size = fabric.util.getProportions(canvas,{width,height},"contain-center")
    let left = (width - size.width)/2
    let top = (height - size.height)/2

    if(!output){
      output = fabric.util.createCanvasElement()
    }
    output.width = size.width
    output.height = size.height

    let ctx2 = output.getContext('2d')
    ctx2.drawImage(canvas,0,0,size.width,size.height)
    return output
  },
  //--------------------------------------------------------------------------------------------------------------------
  // Event Listeners
  // //--------------------------------------------------------------------------------------------------------------------
  //
  // initEventListeners: function(){
  //
  //     if(!this.__eventListeners){
  //         this.__eventListeners = {}
  //     }
  //     for (let event in this.eventListeners) {
  //         if(!this.__eventListeners[event]){
  //             this.__eventListeners[event] = []
  //         }
  //         this.__eventListeners[event] = this.__eventListeners[event].concat (this.eventListeners[event])
  //     }
  // },
  setEventListeners(val){
    this.on(val)
  },
  setWidth(val){
    this.width = val
    this.dirty = true
    this.fire("resized")
  },
  setHeight(val){
    this.height = val
    this.dirty = true
    this.fire("resized")
  },
  // setAngle(angle) {
  //   this.angle = angle
  // },
  id: null,
  store_id(){
    if(this.id && this.id.constructor === String){
      return this.id
    }
    else{
      return null
    }
  },
  setId(id){
    this.id = id
    if(id.constructor === String){
      if(typeof window !== "undefined" && !window[id]){
        window[id] = this
      }
    }
  },
  disable () {
    this.set({
      selectable: false,
      evented: false,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true
    })
  },
  _initEntity (options) {
    if(options.canvas && !options.editor){
      options.editor = options.canvas.editor
    }
    this.editor = options.editor
    fabric.fire("entity:created", {target: this, options: options})
  },
  add (canvas) {
    canvas.add(this)
  },
  stepRotating() {
    let b = this.angle, a = 45 * parseInt(b / 45)
    5 > b - a ? this.setAngle(a) : 40 < b - a && this.setAngle(a + 45)
  },
  onTop () {
    return this.canvas._objects.indexOf(this) === this.canvas._objects.length - 1
  },
  onBottom () {
    return this.canvas._objects.indexOf(this) === 0
  },
  // flop (value) {
  //   this.flipX = value
  //   this.canvas.requestRenderAll()
  // },
  // setFlipX (value) {
  //   this.flipX = value
  //   this.canvas.requestRenderAll()
  // },
  rotateLeft () {
    this.saveState()
    this._normalizeAngle()
    let desiredAngle = (Math.floor(this.angle / 90) - 1) * 90
    this.rotate(desiredAngle)
    this.canvas.renderAll()

    this.fire("modified",{})
    this.canvas.fire("object:modified",{target: this})
  },
  rotateRight:  function () {
    this.saveState()
    this._normalizeAngle()
    let desiredAngle = (Math.floor(this.angle / 90) + 1) * 90
    this.rotate(desiredAngle)
    this.canvas.renderAll()
    this.fire("modified",{})
    this.canvas.fire("object:modified",{target: this})
  },
  duplicate() {
    let _object = this.storeObject()
    _object.active = true
    _object.left+=10
    _object.top+=10
    let _clone = /*this.cloneSync && this.cloneSync() || */this.canvas.createObject(_object)
    return _clone
  },
  _normalizeAngle:function(){
    if(this.angle < 0){
      this.angle += 360
    }else if(this.angle > 360){
      this.angle %= 360
    }
  },
  maxStrokeWidth(){
    return Math.min(this.width,this.height) / 2
  },
  moveUp(){
    this.top -= this.movementDelta
    this.canvas.renderAll()
  },
  moveDown(){
    this.top += this.movementDelta
    this.canvas.renderAll()
  },
  moveLeft(){
    this.left -= this.movementDelta
    this.canvas.renderAll()
  },
  moveRight(){
    this.left += this.movementDelta
    this.canvas.renderAll()
  },
  removeFromCanvas (){
    //todo remove this line
    if(this.canvas)
      this.canvas.remove(this)
  },
  setCrossOrigin: function(value) {
    this.crossOrigin = value
    if(this._element){
      this._element.crossOrigin = value
    }
    return this
  },
  setDirty (value){
    if ( this.group) {
      this.group.setDirty(value)
    }
    this.dirty = value
  },
  setScaleY (value){
    //shouldConstrainValue
    value = this._constrainScale(value)
    if (value < 0) {
      this.flipY = !this.flipY
      value *= -1
    }
    // this.setState({scaleY: value})
    this._set("scaleY", value)
    // this.afterSet()
  },
  setScaleX (value){
    //shouldConstrainValue
    value = this._constrainScale(value)
    if ( value < 0) {
      this.flipX = !this.flipX
      value *= -1
    }
    // this.setState({scaleX: value})
    this._set("scaleX", value)
    // this.afterSet()
  },
  setGradient: function(property, options) {
    options || (options = { })

    var gradient = { colorStops: [] }

    gradient.type = options.type || (options.r1 || options.r2 ? 'radial' : 'linear')

    gradient.coords = options.coords || {
      x1: options.x1,
      y1: options.y1,
      x2: options.x2,
      y2: options.y2
    }

    if (options.r1 || options.r2) {
      gradient.coords.r1 = options.r1
      gradient.coords.r2 = options.r2
    }

    gradient.gradientTransform = options.gradientTransform

    if(options.colorStops.constructor === Array){
      gradient.colorStops = options.colorStops
    }else{
      fabric.Gradient.prototype.addColorStop.call(gradient, options.colorStops)
    }


    return this.set(property, fabric.Gradient.forObject(this, gradient))
  },
  store_shadow(){
    if(!this.shadow)return
    let shadow = this.shadow.toObject()
    delete shadow.nonScaling
    return shadow
  },
  setShadow(value) {

    if (value && !(value instanceof fabric.Shadow)) {
      value = new fabric.Shadow(value)
    }
    this.shadow = value
  },
  setFill(value){
    this.saveState(["fill"])
    if(value.constructor === Object){
      this.setGradient('fill',value)
      this.dirty = true
    }else{
      this.fill = value
      this.dirty = true
    }
    this.fire("modified", {})
    if (this.canvas) {
      this.canvas.fire("object:modified", {target: this})
      this.canvas.renderAll()
    }
  },
  _getCacheCanvasDimensions: function() {
    let zoom = this.canvas && this.canvas.getZoom() || 1,
      objectScale = this.getObjectScaling(),
      retina = this.canvas && this.canvas._isRetinaScaling() ? fabric.devicePixelRatio : 1,
      dim = this._getNonTransformedDimensions(),
      zoomX = Math.abs(objectScale.scaleX * zoom * retina),
      zoomY = Math.abs(objectScale.scaleY * zoom * retina),
      width = Math.abs(dim.x * zoomX) * 2,
      height = Math.abs(dim.y * zoomY) * 2

    return {
      // for sure this ALIASING_LIMIT is slightly crating problem
      // in situation in wich the cache canvas gets an upper limit
      width: width + ALIASING_LIMIT,
      height: height + ALIASING_LIMIT,
      zoomX: zoomX,
      zoomY: zoomY,
      x: dim.x,
      y: dim.y
    }
  }
})

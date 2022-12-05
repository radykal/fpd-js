'use strict';


/**
 * MaskRectangl keep selection data, monochrome mask and utility function to edit mask data.
 * @class fabric.MaskRectangle
 * @extends fabric.Rect
 */
fabric.MaskRectangle = fabric.util.createClass(fabric.Rect,fabric.ShapeMixin, {
  type: "mask-rectangle",
  resizable: true,
  mode: 'original',
  fill: "white",
  thumbElement: null,
  eventListeners: fabric.util.merge(fabric.Rect.prototype.eventListeners,{
    'added moving rotating scaling modified': function(){
      this.update();
    }
  }),
  set_original_image: function (image, cb) {
    if(!this.width)this.width = image.width;
    if(!this.height)this.height = image.height;
    this._originalElement = this._element = image || fabric.util.createCanvasElement();
    this.canvas && this.canvas.renderAll();
    cb && cb()
  },
  setImage: function (image, cb) {
    if(!image){
      cb && cb();
      return this;
    }
    if(typeof image == "string"){
      this._original_loading = true;
      fabric.util.loadImage(image,function(el){
        this.set_original_image(el,cb);
      }.bind(this));
    }else{
      this.set_original_image(image,cb);
    }
  },
  convertMask: false,
  _set_mask_image: function (mask,cb) {
    if (mask && mask instanceof HTMLCanvasElement) {
      this.maskElement = mask;
    } else {
      this.maskElement = fabric.util.createCanvasElement();
      if(!this.width)this.width = mask.width;
      if(!this.height)this.height = mask.height;

      this.maskElement.width = mask && mask.width || 0 ;
      this.maskElement.height = mask && mask.height || 0;
    }
    var ctx = this.selectionContext = this.maskElement.getContext('2d');

    if (mask && mask instanceof HTMLImageElement) {
      ctx.drawImage(mask, 0, 0);
    }

    if(this.convertMask){
      this.convertMask = false;
      var worker = fabric.util.worker(this.makeTransparentMaskWorker);
      worker.onmessage = function(e){
        ctx.putImageData(e.data, 0, 0);
        cb && cb();
      }
      worker.postMessage({
        imageData: ctx.getImageData(0, 0, mask.width, mask.height),
        transparencyConstant: this.transparencyConstant
      });
    }else{
      cb && cb();
    }
  },
  greyValue: 0,
  switchMaskBackground: function(){
    this.greyValue = this.greyValue ? 0 : 255;
    var worker = fabric.util.worker(this.switchMaskBackgroundWorker);
    worker.onmessage = function(e){
      this.selectionContext.putImageData(e.data, 0, 0);
      this.canvas.renderAll();
    }.bind(this);
    var _imgData = this.selectionContext.getImageData(0, 0, this.maskElement.width, this.maskElement.height);
    worker.postMessage({data: _imgData, color : this.greyValue });
  },
  switchMaskBackgroundWorker: function(e,postMessage){
    var _data = e.data.data;
    var _color = e.data.color;
    for (var x = 0; x < _data.width; x++) {
      for (var y = 0; y < _data.height; y++) {
        var i = (x + y * _data.width ) * 4;
        if (_data.data[i + 3] ) {
          _data.data[i] = _color;
          _data.data[i + 1] = _color;
          _data.data[i + 2] = _color;
        }
      }
    }
    postMessage(_data);
  },
  transparencyConstant: 50,
  makeTransparentMaskWorker:function(e,postMessage){
    var _data = e.data.imageData;
    for (var x = 0; x < _data.width; x++) {
      for (var y = 0; y < _data.height; y++) {
        var i = (x + y * _data.width ) * 4;
        if (_data.data[i] > e.data.transparencyConstant || _data.data[i + 1] > e.data.transparencyConstant || _data.data[i + 2] > e.data.transparencyConstant) {
          _data.data[i] = 255;
          _data.data[i + 1] = 255;
          _data.data[i + 2] = 255;
          _data.data[i + 3] = 0;
        } else {
          _data.data[i] = 0;
          _data.data[i + 1] = 0;
          _data.data[i + 2] = 0;
          _data.data[i + 3] = 255;
        }
      }
    }
    postMessage(_data);
  },
  /**
   * set mask element and apply opacity using workers
   * @param mask
   */
  setMask: function (mask,cb) {
    if(!mask){
      return;
    }
    if(typeof mask == "string"){
      this._mask_loading = true;
      fabric.util.loadImage(mask,function(el){
        this._set_mask_image(el,cb);
      }.bind(this));
    }else{
      this._set_mask_image(mask,cb);
    }
  },
  _select_inner: function () {
    this.pathfinder.smartSelection();
    this.canvas.freeDrawingBrush.enable();
  },
  selectInner: function () {
    this._select_inner();
    this.renderMonochrome();
    this.canvas.freeDrawingBrush.enable();
  },
  _renderSelection: function () {
    var ctx = this.canvas.contextTop,
      v = this.canvas.viewportTransform;
    this.canvas.clearContext(this.canvas.contextTop);
    var zoom = this.canvas.getZoom();
    ctx.save();
    ctx.translate(this.left * zoom, this.top * zoom);
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
    ctx.beginPath();
    if (this.mask) {
      ctx.drawImage(this.maskElement, 0, 0);
    }
    ctx.restore();
  },
  maskOpacity: 1,
  renderMask: function () {
    var ctx = this.apertureContext;
    ctx.beginPath();
    ctx.rect(0, 0, this.width, this.height);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.save();
    this.pathfinder.renderMask(this.apertureContext, this.mask);
  },
  renderMonochrome: function () {
    if (this.pathfinder.shouldModify) {
      this.pathfinder.modifySelection();
    }
    this.renderMask();
  },
  allowDrawing: false,
  cancelModal: function () {
    if (this.pathfinder.shouldModify) {
      this.pathfinder.modifySelection();
    }
    delete this.pathfinder.mask;
    delete this.pathfinder.oldMask;
    //this.mask = fabric.util.deepClone(this.pathfinder.mask);
    this.strokeWidth = 1;
    this.fill = this.inactiveOptions.fill;
    this.allowDrawing = false;
    this.lockMovementX = false;
    this.lockMovementY = false;
    if (this.mode === 'original') {
      this.mode = 'none';
    }
    this.canvas.renderAll();
  },
  editModal: function () {
    this.update();

    var _canvas = this.canvas;
    for (var i = 0; i < _canvas._objects.length; i++) {
      _canvas._objects[i].setVisible(false);
    }
    this.setVisible(true);
    //_canvas.deactivateAll();
    _canvas.backgroundImage.setOpacity(0.1);
    this.strokeWidth = 0;
    if (this.mode === 'none') {
      this.mode = 'original';
    }
    _canvas.renderAll();

    window.rect = this;
    window._canvas = _canvas;

    this.lockMovementX = true;
    this.lockMovementY = true;
    this.allowDrawing = true;
    this.canvas.freeDrawingBrush = this.canvas.pathfinderBrush;

    var size = {
      width: canvas.width * 0.9,
      height: canvas.height * 0.9
    };

    var pr = fabric.util.getProportions(this, size, 'contain');
    _canvas.viewportTransform = [pr.scaleX, 0, 0, pr.scaleY,
      (_canvas.width - pr.width ) / 2 - this.left * pr.scaleX,
      (_canvas.height - pr.height) / 2 - this.top * pr.scaleY
    ];

    this.setCoords();
    _canvas.renderAll();
  },
  update: function () {

    if (this.thumbElement) {
      this.thumbElement.width = this.width;
      this.thumbElement.height = this.height;
      this.renderThumb(this.thumbElement);
    }

    if (this.canvas.pathfinder) {
      this.maskElement.width = this.width;
      this.maskElement.height = this.height;
      // this.apertureElement.width = this.width;
      // this.apertureElement.height = this.height;
      if (!this.pathfinder) {

        this.pathfinder = this.canvas.pathfinder;
        var _this = this;
        this.pathfinder.on("selection:changed", function (event) {
          if (event.target == _this) {
            _this.mask = event.mask;
            _this.fire("selection:changed", event);
            //todo may influence on user expirience
          }
        })
      }
      this.pathfinder.mask = this.mask;
      this.pathfinder.target = this;
      this.pathfinder.setImage(this._originalElement);
      this.pathfinder.initCanvas(this.maskElement);
    }
  },
  run: function () {

    this.update();
    this.pathfinder.smartSelection();
    this.renderMonochrome();
  },
  getOriginalSize: function(){
    return {
      width: this._originalElement.naturalWidth || this._originalElement.width,
      height: this._originalElement.naturalHeight || this._originalElement.height
    };
  },
  _render: function (ctx, noTransform) {
    ctx.save();
    var
      x = (noTransform ? this.left : -this.width / 2),
      y = (noTransform ? this.top : -this.height / 2),
      w = this.width,
      h = this.height;

    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.closePath();
    this._renderFill(ctx);

    if (this.mode === 'original') {
      if(this.maskOpacity != 1){
        this.maskElement && ctx.drawImage(this.maskElement, x, y, w, h);
      }
      if(this._originalElement){
        ctx.globalAlpha = this.maskOpacity;
        ctx.drawImage(this._originalElement, x, y, w, h);
      }
    } else if (this.mode === 'mask') {
      if(this.maskOpacity != 1){
        this._originalElement && ctx.drawImage(this._originalElement, x, y, w, h);
      }
      if(this.maskElement){

        ctx.globalAlpha = this.maskOpacity;
        ctx.fillStyle = this.fill;
        ctx.fillRect(x, y, w, h)

        ctx.drawImage(this.maskElement, x, y, w, h);
      }
    } else if (this.mode === 'mixed') {
      this._originalElement && ctx.drawImage(this._originalElement, x, y, w, h);
      ctx.globalAlpha = this.maskOpacity;
      this.maskElement && ctx.drawImage(this.maskElement, x, y, w, h);
    }
    ctx.globalAlpha = 1;

    this._renderStroke(ctx);
  },
  controls :Object.assign({
    mbr:{visible: "{hasRotatingPoint}", x: "{width}/2",   y: "{height}+{rotatingPointOffset}/{zoom}", action: "rotate", cursor: "rotationCursor"},
    mlr:{visible: "{hasRotatingPoint}", x: "-{rotatingPointOffset}/{zoom}",   y: "{height/2}", action: "rotate", cursor: "rotationCursor"},
    mrr:{visible: "{hasRotatingPoint}", x: "{width}+{rotatingPointOffset}/{zoom}",   y: "{height/2}", action: "rotate", cursor: "rotationCursor"}
  },fabric.Object.prototype.controls),
  // drawControls: function (ctx, shape, offset) {
  //   if (!this.hasControls) {
  //     return this;
  //   }
  //   this.drawBoundsControls( ctx);
  //   this.drawExtraControls(ctx);
  // },
  renderThumb: function (_canvas) {
    _canvas.width = this.width;
    _canvas.height = this.height;
    var ctx = _canvas.getContext('2d');
    ctx.save();
    var _r = this.getBoundingRect();
    var _left, _top;
    if (this.originX == 'center' && this.originY == 'center') {
      var originPoint = this.translateToOriginPoint(
        this.getCenterPoint(),
        this.canvas._previousOriginX,
        this.canvas._previousOriginY);
      _left = originPoint.x;
      _top = originPoint.y;
    } else {
      _left = this.left;
      _top = this.top;
    }
    ctx.rotate(fabric.util.degreesToRadians(-this.angle));
    if (this._points) {
      ctx.beginPath();
      ctx.moveTo(this._points[0].x, this._points[0].y);
      for (var i = 1; i < this._points.length; i++) {
        ctx.lineTo(this._points[i].x, this._points[i].y);
      }
      ctx.closePath();
      ctx.clip();
    }

    ctx.drawImage(this.canvas.backgroundImage._element,-_left, -_top);
    ctx.restore();
  }
});

fabric.MaskRectangle.fromObject = function(options,callback){
  var _rect = new this(options);
  if(_rect.loaded){
    //  // callback && callback(_rect);
    return _rect;
  }else{
    _rect.on("loaded",function(){
      callback && callback(_rect)
    });
  }
};

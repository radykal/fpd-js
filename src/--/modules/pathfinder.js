'use strict';

var MagicWand = require('../../plugins/magicwand');

/**
 * Pathfinder (Pathfinder) Interface for MagicWand selection tool
 * @param options
 * @constructor
 */
function Pathfinder(options) {
  this.initialize(options);
}

Pathfinder.prototype = {
  type: 'pathfinder',
  keepOldSelection: true,
  alphaChannel: true,
  pathfinderMode: 'new',
  selectionTool: 'magic',
  adjacentPixels: true,
  async: false,
  pathfinderTools: false,
  blurRadius: 0,
  hatchLength: 4,
  colorThreshold: 15,
  simplifyTolerant: 0,
  simplifyCount: 30,
  hatchOffset: 0,
  imageInfo: null,
  mask: null,
  downPoint: null,
  allowDraw: false,
  shapeSelectionTools: false,
  initialize: function (options) {
    options.editor && options.editor.fire('entity:created',{target : this,options : options})
    for (var i in options) {
      this[i] = options[i];
    }
  },
  asyncronous: function (cb) {
    if (this.async) {
      setTimeout(cb);
    } else {
      cb();
    }
  },
  fillWithCurrentColor: function () {
    this.fill(this.color);
  },
  clearMemory: function () {
    delete this.resultCanvas;
    delete this.editedImageCanvas;
    delete this.test_picture;
    delete this.mask;
  },
  hide: function () {
    if (this.editedImageCanvas) {
      this.editedImageCanvas.remove();
      this.resultCanvas.remove();
      clearInterval(this.interval);
      this.clearMemory();
      this.fire('hidden');
    }
  },
  setContainer: function (container) {
    if (container.constructor === String) {
      container = document.getElementById(container);
    }
    this.container = container;

    this.test_picture = new Image();
    this.test_picture.onload = this.initCanvas.bind(this);
    return this;
  },
  getSelectionTool: function () {
    return this.selectionTool;
  },
  setSelectionTool: function (tool) {
    this.selectionTool = tool;
    this.downPoint = false ;
    this.fire('tool:changed', tool);
  },
  getThreshold: function () {
    return this.colorThreshold;
  },
  setThreshold: function (thres) {
    if(thres !== undefined){
      this.colorThreshold = thres;
    }
    if (this.downPoint) {
      this.drawMask(this.downPoint.x, this.downPoint.y, this.adjacentPixels);
    }
    this.fire('threshold:changed', {threshold: this.colorThreshold});
  },
  setPicture: function (img) {
    this.setImage(img);
    var cvs = fabric.util.createCanvasElement();

    cvs.onmouseup = this.onMouseUp.bind(this);
    cvs.onmousedown = this.onMouseDown.bind(this);
    cvs.onmousemove = this.onMouseMove.bind(this);
    cvs.oncontextmenu = function () {
      return false;
    };
    this.initCanvas(cvs);
  },
  load: function (file) {
    if (!file)return;

    if (file.constructor === String) {
      Pathfinder.test_picture.setAttribute('src',file);
    } else {
      var reader = new FileReader();
      reader.onload = function (e) {
        this.test_picture.setAttribute('src', e.target.result);
      }.bind(this);
      reader.readAsDataURL(file);
    }
  },
  initCanvas: function (cvs) {
    var img = this.editedImageCanvas;
    if(this.resultCanvas){
      $(this.resultCanvas).remove()
    }
    this.resultCanvas = cvs;
    this.createSelectionDrawCanvas();


    this.context = cvs.getContext('2d');
    cvs.width = img.width;
    cvs.height = img.height;
    //this.setImage(img);
  },
  setImage: function (img) {
    this._test_todo_img = img;
    //this.mask = null;//MagicWand.createMask(img.width,img.height);
    this.editedImageCanvas = fabric.util.createCanvasElement();
    this.editedImageCanvas.width = img.width;
    this.editedImageCanvas.height = img.height;
    this.editedImageCanvas.getContext('2d').drawImage(img, 0, 0);
    this.initCanvas(fabric.util.createCanvasElement())
  },
  getInfo: function () {

    var ctx = this.editedImageCanvas.getContext('2d');
    var imageInfo = ctx.getImageData(0, 0, this.editedImageCanvas.width, this.editedImageCanvas.height);
    imageInfo.bytes = 4;
    return imageInfo;
  },
  getMousePosition: function (e) {
    var scale = this.resultCanvas.width / $(this.resultCanvas).width();
    var target = e.target || e.srcElement,
      rect = target.getBoundingClientRect(),
      offsetX = e.clientX - rect.left,
      offsetY = e.clientY - rect.top;
    return {x: Math.round(offsetX * scale), y: Math.round(offsetY * scale)};
  },
  radius: 20,
  resetSelectionDrawCanvas: function () {
    this.selectionDrawContext.fillStyle = "black";
    //this.selectionDrawContext(0, 0, canvas.width, canvas.height);
    this.selectionDrawContext.fillRect(0,0,this.selectionDrawCanvas.width,this.selectionDrawCanvas.height);
    this.selectionDrawContext.fillStyle = "white";
    this.selectionDrawContext.strokeStyle = "white";
  },
  createSelectionDrawCanvas: function () {

    if(this.selectionDrawCanvas ){
      $(this.selectionDrawCanvas ).remove();
    }
    this.selectionDrawCanvas = fabric.util.createCanvasElement();
    this.selectionDrawCanvas.width  = this.resultCanvas.width;
    this.selectionDrawCanvas.height = this.resultCanvas.height;
    this.selectionDrawContext = this.selectionDrawCanvas.getContext("2d");
    this.resetSelectionDrawCanvas();
  },
  _onMouseDown: function (point) {
    point.x = Math.min(Math.max(0, parseInt(point.x)), this.resultCanvas.width - 1);
    point.y = Math.min(Math.max(0, parseInt(point.y)), this.resultCanvas.height - 1);
    this.allowDraw = true;
    this.drawingTools[this.selectionTool].mouseDown.call(this,point);
  },
  onMouseDown: function (e) {
    e.preventDefault();
    e.stopPropagation();
    this._onMouseDown(this.getMousePosition(e));

  },
  _onMouseMove: function (p) {
    p.x = Math.min(Math.max(0, parseInt(p.x)), this.resultCanvas.width - 1);
    p.y = Math.min(Math.max(0, parseInt(p.y)), this.resultCanvas.height - 1);
    this.drawingTools[this.selectionTool].mouseMove.call(this,p);
  },
  onMouseMove: function (e) {
    var p = this.getMousePosition(e);
    this._onMouseMove(p);
  },
  color: [255, 0, 0, 255],
  onMouseUp: function (e) {
    this.allowDraw = false;
    this.drawingTools[this.selectionTool].mouseUp.call(this,e);
  },
  applyMask: function (canvas, left, top) {
    if (canvas.width === 0 || canvas.height === 0) {
      delete this.mask;
      this.render();
      return;
    }
    var info = this.getInfo(),
      mask = MagicWand.maskSelection(canvas,left,top) ;

    this.mask = mask;
    this.fire('selection:changed', {mask: mask, target: this.target});
  },
  setPathfinderMode: function (value) {
    this.pathfinderMode = value;
  },
  getPathfinderMode: function () {
    return this.pathfinderMode;
  },
  modifySelection: function (mask, pathfinderMode, noEvents) {
    this.shouldModify = false;
    if(this.selectionObject){
      this.selectionObject.remove();
    }
    this.downPoint = false;
    if (mask === undefined) {
      mask = this.mask;
    }
    if (pathfinderMode === undefined) {
      pathfinderMode = this.pathfinderMode;
    }
    if (pathfinderMode !== 'new' && this.oldMask) {
      mask = MagicWand[pathfinderMode](mask, this.oldMask);
    }
    if (this.blurRadius) {
      mask = MagicWand.gaussBlurOnlyBorder(mask, this.blurRadius);
    }
    //if (pathfinderMode !== 'new' && this.oldMask || this.blurRadius) {
    //  mask.cacheInd = MagicWand.getBorderIndices(mask);
    //}

    if(mask && mask.count && this.keepOldSelection){
      mask.makeCache();
      this.oldMask = mask;
    }else{
      delete this.oldMask ;
    }


    this.mask = MagicWand.createMask(this.editedImageCanvas.width, this.editedImageCanvas.height);
    if (!noEvents) {
      this.fire('selection:changed', {mask: mask, target: this.target});
    }
    this.render();
  },
  createSelection: function (mask) {
    if (this.shouldModify) {
      this.modifySelection();
    }

    this.mask = mask || MagicWand.createMask(this.editedImageCanvas.width, this.editedImageCanvas.height);
    this.render();
  },
  setSelection: function (mask) {
    this.mask = mask;
    this.render();
    this.fire('selection:changed', {mask: mask, target: this.target});
  },
  fill: function (color, callback) {
    this.asyncronous(function () {
      this._fill(color, false);
      callback && callback.call(this);
    }.bind(this), 0);
  },
  _fill: function (color, invert, canvas) {


    if (!this.mask) return;


    canvas = canvas || this.editedImageCanvas;
    var ctx = canvas.getContext('2d');//b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);

    MagicWand.fillMask(ctx, this.mask, color);

    this.fire('image:changed', this.editedImageCanvas);
  },
  hatchTick: function () {
    this.hatchOffset = (this.hatchOffset + 1) % (this.hatchLength * 2);
    this.render(true);
  },
  show: function () {
    while (this.container.lastChild) {
      this.container.removeChild(this.container.lastChild);
    }
    this.container.appendChild(this.editedImageCanvas);
    this.container.appendChild(this.resultCanvas);
    this.interval = setInterval(this.hatchTick.bind(this), 300);

    this.fire('show');
  },
  clear: function (invert, canvas, callback) {
    this.asyncronous(function () {
      this._fill([0, 0, 0, 0], invert, canvas);
      callback && callback.call(this);
    }.bind(this), 0);
  },
  render: function (noBorder) {
    if (!this.context || !this.mask)return;

    var ctx = this.context;
    if (!noBorder) {
      this.mask.cacheInd = MagicWand.getBorderIndices(this.mask);
    }
    ctx.clearRect(0, 0, this.mask.width, this.mask.height);

    var _new_color = (!this.oldMask || this.pathfinderMode == "new" || this.pathfinderMode == "add"|| this.pathfinderMode == "exclude")
      ? this.newMaskColor : this.removedMaskColor;

    var _intersection_color;
    if(this.pathfinderMode == "add" || this.pathfinderMode == "new"|| this.pathfinderMode == "intersect"){
      _intersection_color = this.newMaskColor;
    }else{
      _intersection_color = this.removedMaskColor ;//intersectionRemovedMaskColor;
    }
    var _old_color;
    if(this.pathfinderMode == "exclude" || this.pathfinderMode == "substract"|| this.pathfinderMode == "add"){
      _old_color = this.newMaskColor;
    }else{
      _old_color = this.removedMaskColor;
    }

    this.oldMask && this.oldMask.render(ctx,{
      fill: _old_color
    });


    this.mask.render(ctx,{
      fill: _new_color,
      intersectionColor : _intersection_color,
      outerIntersectionColor : _old_color,
      // outerFill : "rgba(0,0,0,0.5)"
    });

    if(this.renderBorder){
      this.oldMask && this.oldMask.renderBorder(ctx,{});

      this.mask.renderBorder(ctx,{
        hatchOffset: this.hatchOffset
      });
    }

  },
  renderBorder: true,
  intersectionRemovedMaskColor: '#ffaaaa',
  removedMaskColor: '#aaaaff',
  newMaskColor:  '#aaFFaa' ,
  renderMask: function (ctx, mask, color, left, top) {
    mask = mask || this.mask;
    mask && mask.render(ctx,{
      intersectionColor: '#fff',
      outerIntersectionColor: '#000',
      fill :color || '#fff',
      left : left,
      top : top
    })
  },
  getContours: function () {
    if (!this.__cs) {
      this.__cs = MagicWand.traceContours(this.mask);
      this.__cs = MagicWand.simplifyContours(this.__cs, this.simplifyTolerant, this.simplifyCount);
    }
    return this.__cs;
  },
  traceInner: function (ctx) {

    var cs = this.getContours();
    var ctx = ctx || this.context;
    ctx.beginPath();
    for (var i = 0; i < cs.length; i++) {
      if (!cs[i].inner) continue;
      var ps = cs[i].points;
      ctx.moveTo(ps[0].x, ps[0].y);
      for (var j = 1; j < ps.length; j++) {
        ctx.lineTo(ps[j].x, ps[j].y);
      }
    }
    ctx.stroke();
  },
  getColor: function () {
    return 'rgba(' + this.color.join(', ') + ')';
  },
  setColor: function (color) {
    var _arr = color.substring(color.indexOf('(') + 1, color.length - 1).split(', ');
    for (var i in _arr) {
      _arr[i] = parseFloat(_arr[i]);
    }
    _arr[3] = Math.round(_arr[3] * 255);
    this.color = _arr;
  },
  trace: function (ctx) {
    var info = this.getInfo();
    var cs = MagicWand.traceContours(this.mask);
    cs = MagicWand.simplifyContours(cs, this.simplifyTolerant, this.simplifyCount);

    // draw contours
    var ctx = ctx || this.context;
    ctx.clearRect(0, 0, info.width, info.height);
    //inner
    ctx.beginPath();
    for (var i = 0; i < cs.length; i++) {
      if (!cs[i].inner) continue;
      var ps = cs[i].points;
      ctx.moveTo(ps[0].x, ps[0].y);
      for (var j = 1; j < ps.length; j++) {
        ctx.lineTo(ps[j].x, ps[j].y);
      }
    }
    ctx.strokeStyle = 'red';
    ctx.stroke();
    //outer
    ctx.beginPath();
    for (var i = 0; i < cs.length; i++) {
      if (cs[i].inner) continue;
      var ps = cs[i].points;
      ctx.moveTo(ps[0].x, ps[0].y);
      for (var j = 1; j < ps.length; j++) {
        ctx.lineTo(ps[j].x, ps[j].y);
      }
    }
    ctx.strokeStyle = 'blue';
    ctx.stroke();
  },
  removeNoise: function (threshold) {

    if(!this.mask || !this.mask.count)return;
    this.createSelectionDrawCanvas();
    //this.renderMask(this.selectionDrawContext, this.mask);

    var cs = MagicWand.traceContours(this.mask);
    cs = MagicWand.simplifyContours(cs, this.simplifyTolerant, this.simplifyCount);

    var ctx = this.selectionDrawContext, v = this.canvas.viewportTransform;

    //  cs = MagicWand.simplifyContours(cs, this.simplifyTolerant, this.simplifyCount);

    ctx.save();
    ctx.translate(0.5,0.5);
    ctx.fillStyle= "#fff";
    //ctx.fillStyle= "#0f0";
    ctx.strokeStyle= "#fff";
    for (var i = 0; i < cs.length; i++) {
      if (!cs[i].inner && cs[i].points.length > threshold) {
        var ps = cs[i].points;
        ctx.beginPath();
        ctx.moveTo(ps[0].x, ps[0].y);
        for (var j = 1; j < ps.length; j++) {
          ctx.lineTo(ps[j].x, ps[j].y);
        }
        ctx.closePath();
        ctx.fill();
      }

    }
    this.mask = MagicWand.maskSelection( this.selectionDrawCanvas);
    this.setSelection(this.mask);

    ctx.restore();
  },
};
fabric.util.observable(Pathfinder.prototype);


Object.assign(Pathfinder.prototype, {
    tools: [
        "adjacentPixels",
        "pathfinderRadius",
        "pathfinderThreshold",
        "selectionTool",
        "pathfinder",
        "fillWithCurrentColor",
        "clear",
        "pathfinderColor"
    ],
    actions: {

        cancelSelection: {
            key: 'Escape',
            action: function () {
                delete this.shouldModify;
                this.mask = MagicWand.createMask(this.editedImageCanvas.width, this.editedImageCanvas.height);
            }
        },
        modifySelection: {
            key: 'Enter',
            action: function () {
                if (this.shouldModify) {
                    this.modifySelection();
                }
            }
        },
        adjacentPixels: {
            className: 'button-adjacent',
            title: 'selet all',
            type: 'checkbox',
            value: 'adjacentPixels',
            visible: function () {
                return this.selectionTool === 'magic';
            },
            observe: 'tool:changed'
        },
        pathfinderRadius: {
            title: 'radius',
            type: 'range',
            value: {
                get: function () {
                    return this.radius
                },
                set: function (val) {
                    this.radius = val;
                },
                min: 1,
                max: 255
            },
            visible: function () {
                return this.selectionTool === 'brush';
            },
            observe: 'tool:changed'
        },
        pathfinderThreshold: {
            title: 'Threshold',
            type: 'range',
            value: {
                observe: 'threshold:changed',
                get: function () {
                    return this.colorThreshold
                },
                set: function (val) {
                    this.setThreshold(val);
                },
                min: 0,
                max: 255
            },
            visible: function () {
                return this.selectionTool === 'magic';
            },
            observe: 'tool:changed'
        },
        selectionTool: {
            title: 'selection-tool',
            type: 'options',
            value: 'selectionTool',
            menu: {
                selectionToolBrush: {
                    className: 'fa fa-paint-brush',
                    title: 'select-brush',
                    option: 'brush'
                },
                selectionToolRectangle: {
                    className: 'fa fa-square',
                    title: 'select-rectangle',
                    option: 'rectangle'
                },
                selectionElliptical: {
                    className: 'fa fa-circle',
                    title: 'select-circle',
                    option: 'circle'
                },
                selectionToolMagic: {
                    className: 'fa fa-magic',
                    title: 'select-magic',
                    option: 'magic'
                },
                selectionToolLasso: {
                    use: 'shapeSelectionTools',
                    title: 'select-lasso',
                    option: 'lasso',
                    icon: 'data:image/svg+xml;base64,' + require('base64-loader!./../media/lasso.svg')
                }
            }
        },
        pathfinder: {
            title: 'pathfinder',
            type: 'options',
            value: 'pathfinderMode',
            menu: {
                pathfinderNew: {
                    title: 'pathfinder-new',
                    option: 'new'
                },
                pathfinderExclude: {
                    title: 'pathfinder-exclude',
                    option: 'exclude'
                },
                pathfinderSubstract: {
                    title: 'pathfinder-substract',
                    option: 'substract'
                },
                pathfinderAdd: {
                    title: 'pathfinder-add',
                    option: 'add'
                },
                pathfinderIntersect: {
                    title: 'pathfinder-intersect',
                    option: 'intersect'
                }
            }
        },
        fillWithCurrentColor: {
            title: 'fillWithCurrentColor',
            className: 'fa fa-paint-brush'
        },
        clear: {
            className: 'fa fa-eraser',
            id: 'Pathfinder-clear',
            title: 'clear'
        },
        pathfinderColor: {
            title: 'color',
            type: 'color',
            value: 'color'
        }
    }
});

Object.assign(Pathfinder.prototype, {
  selectBackground: function (fromCorners) {
    var info = this.getInfo(), mask;

    if (fromCorners) {
      var mask1 = MagicWand.selectBackground(info, [255, 255, 255, false], this.colorThreshold);
      var mask2 = MagicWand.selectBackground(info, [false, false, false, 0], this.colorThreshold);
      mask = MagicWand.add(mask1, mask2);
    } else {
      mask = MagicWand.selectAllByColor(info, [255, 255, 255, 255], this.colorThreshold);
    }

    if (this.blurRadius) {
      mask = MagicWand.gaussBlurOnlyBorder(mask, this.blurRadius);
    }
    this.setSelection(mask);
  },
  colorSelection: function (colors, threshold) {
    var info = this.getInfo(), mask2,
      mask = MagicWand.createMask(info.width, info.height);
    for (var i in colors) {
      var _color = new fabric.Color(colors[i])._source;
      _color[3] = Math.round(_color[3] * 255);
      mask2 = MagicWand.selectAllByColor(info, _color, threshold[i])
      mask = MagicWand.add(mask, mask2);
    }
    delete this.oldMask;
    this.modifySelection(mask);
  },
  smartSelection: function (threshold) {
    var info = this.getInfo(), mask;
    mask = MagicWand.selectBackground(info, null, threshold || this.colorThreshold);
    mask = MagicWand.invertMask(mask);
    delete this.oldMask;
    this.modifySelection(mask);
  }
});

Pathfinder.prototype.drawingTools = {
  brush: {
    mouseUp: function(){
      this.modifySelection();
      this.resetSelectionDrawCanvas();
    },
    mouseMove: function(p){
      if (!this.allowDraw) return;
      this.drawCircle(p.x, p.y, this.radius);
    },
    mouseDown: function(point){
      this.createSelection();
      this.downPoint = point;
      this.createSelectionDrawCanvas();
      this.drawCircle(point.x, point.y, this.radius);
    },
    utils: {
      drawCircle: function (x, y, r) {
        var ctx = this.selectionDrawContext,
          v = this.canvas.viewportTransform;
        ctx.save();
        //  ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        MagicWand.maskSelection( this.selectionDrawCanvas, 0,0, this.mask, 'add');
        this.setSelection(this.mask);
      }
    }
  },
  magic: {
    mouseUp: function(){
      this.shouldModify = true;
    },
    mouseMove: function (p){
      if (!this.allowDraw) return;
      var dist = p.x - this.downPoint.x;

      var val = this._init_thres + dist;
      var thres = Math.min(Math.max(val, 1), 255);
      if (thres != this.colorThreshold) {
        this.setThreshold(thres);
      }
    },
    mouseDown: function (point){
      if (this.shouldModify) {
        this.modifySelection();
      }
      this.downPoint = point;
      this.colorThreshold = 15;
      this.fire('threshold:changed', {threshold: this.colorThreshold});
      this._init_thres = this.colorThreshold;
      this.drawMask(this.downPoint.x, this.downPoint.y, this.adjacentPixels);
      return false;
    },
    utils:{
      drawMask: function (x, y, adjacentPixels) {
        this.asyncronous(this._drawMask.bind(this, x, y, adjacentPixels), 0);
      },
      _drawMask: function (x, y, adjacentPixels) {
        MagicWand.alphaChannel = this.alphaChannel;
        var info = this.getInfo(), mask;
        if (adjacentPixels) {
          MagicWand.floodFill(info, x, y, this.colorThreshold,{},null,function(mask){
            this.setSelection(mask);
          }.bind(this));
        } else {
          mask = MagicWand.selectAll(info, x, y, this.colorThreshold);
          this.setSelection(mask);
        }
      }
    }
  },
  rectangle: {
    mouseDown: function(point) {
      if (this.shouldModify) {
        this.modifySelection();
      }
      this.downPoint = point;
      this.shouldModify = true;
    },
    mouseUp: function(){
      //this.modifySelection();
      //this.resetSelectionDrawCanvas();
    },
    mouseMove: function(p){
      if (!this.allowDraw) return;
      this.drawRectangle(this.downPoint.x, this.downPoint.y, p.x, p.y);
    },
    utils:{
      drawRectangle: function (x, y, x2, y2) {
        var info = this.getInfo(),
          mask = MagicWand.selectRectangle(info, x, y, x2, y2);
        this.setSelection(mask);
      }
    }
  },
  circle: {
    mouseDown: function(point) {
      if (this.shouldModify) {
        this.modifySelection();
      }
      this.downPoint = point;
      this.createSelectionDrawCanvas();
      this.selectionObject = new fabric.Ellipse({
        left: point.x + this.target.left,
        top:  point.y + this.target.top,
        rx:1,
        ry:1,
        hasBorders: false,
        originX: 'center',
        originY: 'center',
        strokeWidth: 1,
        fill: 'transparent',
        stroke: 'transparent'
      });
      this.canvas.add(this.selectionObject);
      this.updateClipPath();
    },
    mouseUp: function(){
      this.canvas.setInteractiveMode("mixed");
      this.selectionObject.setCoords();
      var _this = this;
      this.selectionObject.on('scaling moving rotating',function(){
        _this.updateClipPath();
      });
      this.canvas.setActiveObject(this.selectionObject);
      this.shouldModify = true;
      //  this.modifySelection();
      //  this.resetSelectionDrawCanvas();
    },
    mouseMove: function(p){
      if (!this.allowDraw) return;
      this.selectionObject.set({
        rx: Math.abs((p.x + this.target.left -  this.selectionObject.get('left'))) ,
        ry: Math.abs((p.y + this.target.top  - this.selectionObject.get('top')))
      });

      this.updateClipPath();

    },
    utils:{
      updateClipPath: function () {
        this.resetSelectionDrawCanvas();
        this.selectionObject.fill = 'white';
        this.selectionDrawContext.save();
        this.selectionDrawContext.translate(-this.target.left, - this.target.top);
        this.selectionObject.render(this.selectionDrawContext);
        this.selectionDrawContext.restore();
        this.selectionObject.fill = 'transparent';
        this.mask = MagicWand.maskSelection( this.selectionDrawCanvas);
        this.setSelection(this.mask);
      }
    }
  },
  lasso: {
    mouseUp: function(){
      if(this.readyToClosePath) {
        this._closePath();
      }
    },
    mouseMove: function(p){
      if (!this.allowDraw) return;
      this.drawLine(this._last_point, p)
      this._points.push(p);
      this._last_point = p;
    },
    mouseDown: function(point){
      if(!this.downPoint){
        this.createSelection();
        this.createSelectionDrawCanvas();
        this._path_out = false;
        this.downPoint = point;
        this._points = [];
        this.selectionDrawContext.beginPath();
        this.canvas.on('mouse:move', this._changeCursorOverClosePoint);
      }
      if(this._last_point){
        if(this.readyToClosePath){
          this._closePath();
        }else{
          this.drawLine(this._last_point, point)
          this._last_point = point;
          this._points.push(point);
        }
      }else{

        this.drawLine({x:point.x - 0.5,y: point.y}, {x:point.x + 0.5,y: point.y })
        this._last_point = {x:point.x + 0.5,y: point.y };
        this._points.push(point);
        this.shouldModify = true;
      }
    },
    utils: {
      drawLine: function (p1 ,p2 ) {
        var ctx = this.selectionDrawContext,
          v = this.canvas.viewportTransform;
        ctx.save();
        //ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        ctx.moveTo(p1.x,p1.y);
        ctx.lineTo(p2.x,p2.y);
        ctx.stroke();
        ctx.restore();
        MagicWand.maskSelection(this.selectionDrawCanvas,0,0,this.mask,'add');
        this.setSelection(this.mask);
      },
      _closePath:  function (e) {

        this.allowDraw = false;
        var ctx = this.selectionDrawContext;
        ctx.beginPath();
        ctx.moveTo(this._points[0].x,this._points[0].y)
        for(var i = 1 ; i < this._points.length;i ++){
          ctx.lineTo(this._points[i].x,this._points[i].y)
        }
        ctx.closePath();
        ctx.fill();
        MagicWand.maskSelection(this.selectionDrawCanvas,0,0,this.mask,'add');
        this.setSelection(this.mask);
        this.resetSelectionDrawCanvas();
        this._points = [];
        delete this.downPoint;
        delete this.readyToClosePath;
        delete this._last_point;
        this.canvas.off('mouse:move', this._changeCursorOverClosePoint);
        this.canvas.freeDrawingCursor = 'crosshair';
        this.canvas.setCursor(this.canvas.freeDrawingCursor);
        // this.drawLine(this._last_point, this.downPoint);
      },
      _changeCursorOverClosePoint:  function (e) {
        var canvas = this,
          pathfinder = canvas.pathfinder;
        if(!pathfinder.target)return;
        var ivt = fabric.util.invertTransform(canvas.viewportTransform),
          p = fabric.util.transformPoint(canvas.getPointer(e.e, true), ivt);
        p.x -= pathfinder.target.left;
        p.y -= pathfinder.target.top;
        if ( pathfinder.downPoint && pathfinder.downPoint.distanceFrom(p) < 10) {
          if(!pathfinder._path_out){
            return;
          }
          pathfinder.readyToClosePath = true;
          canvas.freeDrawingCursor = canvas.targetCursor;
          canvas.setCursor(canvas.freeDrawingCursor);
          //console.log(canvas.freeDrawingCursor);
        } else {
          pathfinder._path_out = true;
          pathfinder.readyToClosePath = false;
          canvas.freeDrawingCursor = 'crosshair';
          canvas.setCursor(canvas.freeDrawingCursor);
          // console.log(canvas.freeDrawingCursor);
        }
      }
    }
  }
};

for(var i in Pathfinder.prototype.drawingTools){
  Object.assign(Pathfinder.prototype, Pathfinder.prototype.drawingTools[i].utils)
}
fabric.Pathfinder = Pathfinder;

fabric.Pathfinder.getContours = async function(imageOrImageSrc,callback){
  let clipFiller = new fabric.Pathfinder({});
  let img;
  if(imageOrImageSrc.constructor === String){
    img = await fabric.util.loadImagePromise(imageOrImageSrc)
  }
  else{
    img = imageOrImageSrc;
  }
  clipFiller.setImage(img);
  clipFiller.mask = MagicWand.selectBackground(clipFiller.getInfo(), null, 15);

  let contours = clipFiller.getContours();
  let clipPoints = contours[1].points;
  let pathData = fabric.PencilBrush.prototype.convertPointsToSVGPath(clipPoints).join('');//todo
  callback && callback(pathData);
  return pathData;
};

Object.assign(fabric.Canvas.prototype, {
  pathfinder: false,
  setPathfinder: function (val) {
    if (val) {
      this.pathfinder = new fabric.Pathfinder('pathfinder');
      this.pathfinder.canvas = this;
    }
  },
  getPathfinder: function () {
    return this.pathfinder || this.editor && this.editor.pathfinder;
  }
});

Object.assign(fabric.Editor.prototype, {
  initPathfinder: function () {
    //if(this.pathfinder){

      this.pathfinder = new fabric.Pathfinder({
        editor: this
      });

      this.pathfinder.on("image:changed", function (img) {
        var dataUrl = img.toDataURL();
        if (!this.target._originalElement) {
          this.target._originalElement = this.target._element;
        }
        this.target._element = new Image();

        this.target._element.onload = function(){
          this.target.fire("content:modified")
          this.target.canvas && this.target.canvas.renderAll();
        }.bind(this);

        this.target._element.src = dataUrl;
        this.target._edited = true
        if(this.target.dirty !== "undefined"){
          this.target.dirty = true;
        }


      });
    //}
  }
});

Object.assign(fabric.Editor.prototype, {
  eventListeners: fabric.util.merge(fabric.Editor.prototype.eventListeners, {
    "ready": function () {
      this.initPathfinder();
    }
  })
});

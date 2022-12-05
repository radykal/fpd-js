fabric.ShapeBrushPath = fabric.util.createClass(fabric.Path,{
  type: "shape-brush-path",
  fill: "transparent",
  strokeWidth: 1,
  stroke: "black",
  objectCaching: false
});

/**
 * PencilBrush class
 * @class fabric.RectangleBrush
 * @extends fabric.BaseBrush
 */
fabric.ShapeBrush = fabric.util.createClass(fabric.BaseBrush, /** @lends fabric.ShapeBrush.prototype */ {
  shape: {
    type: "rect"
  },
  type: "shape-brush",
  /**
   * Constructor
   * @param {fabric.Canvas} canvas
   * @return {fabric.ShapeBrush} Instance of a pencil brush
   */
  initialize: function (canvas) {
    this.callSuper('initialize', canvas);
    this._shape = fabric.util.createObject({
      editor: this.editor,
      path: "M 0 0 Z",
      type: "shape-brush-path"
    });
  },
  setMode(shape){
    this.shape = shape
  },

  /**
   * Inovoked on mouse down
   * @param {Object} pointer
   */
  onMouseDown: function (pointer,options) {
    //prepare for drawing
    delete this.p2;

    this.p1 = new fabric.Point(pointer.x, pointer.y);
    this._setBrushStyles();
    this._setShadow();
    this.canvas.contextTop.moveTo(this.p1.x, this.p1.y);
    this._render();

    this.proportional = options.e.ctrlKey;


    this._onKeyDownBinded = this.onKeyDown.bind(this)
    this._onKeyUpBinded = this.onKeyUp.bind(this)
    fabric.util.addListener(fabric.window, 'keydown', this._onKeyDownBinded);
    fabric.util.addListener(fabric.window, 'keyup', this._onKeyUpBinded);
  },
  onKeyUp: function(e){
    if(e.key === "Control"){
      if(this.proportional){
        this.proportional = false;
        this.updateBrush();
        this.canvas.renderAll();
      }
    }
  },
  onKeyDown: function(e){
    if(e.key === "Control"){
      if(!this.proportional){
        this.proportional = true;
        this.updateBrush();
        this.canvas.renderAll();
      }
    }
    // if(e.key === "Escape"){
    //   this.canvas.setFreeDrawingBrush("none");
    // }
  },
  updateBrush(){

    let path;

    if(this.shape === "rect") {
      let rect = this._getRect();
      if(this.proportional){
        rect.width = rect.height = Math.min(rect.width,rect.height)
      }
      path = fabric.util.shapes.rect({
        width: rect.width,
        height: rect.height,
        units: "absolute"
      });
      this._shape.set({
        width: rect.width,
        height: rect.height,
        originX: "left",
        originY: "top",
        path: path,
        left: rect.left,
        top: rect.top,
        angle: 0
      });
    }
    if(this.shape === "roundedRect"){
      let rect = this._getRect();
      if(this.proportional){
        rect.width = rect.height = Math.min(rect.width,rect.height)
      }
      path = fabric.util.shapes.roundedRect({
        width: rect.width,
        height: rect.height,
        units: "absolute",
        radius: Math.min(rect.width,rect.height)/4
      });
      this._shape.set({
        width: rect.width,
        height: rect.height,
        originX: "left",
        originY: "top",
        path: path,
        left: rect.left,
        top: rect.top,
        angle: 0
      })

    }

    if(this.shape === "ellipse"){
      let rect = this._getRect();
      if(this.proportional){
        rect.width = rect.height = Math.min(rect.width,rect.height)
      }
      this._shape.set({
        width: rect.width * 2,
        height: rect.height * 2,
        originX: "left",
        originY: "top",
        path: `M 0,0 a ${rect.width},${rect.height} 0 1,0 1,0 Z`,
        left: this.p1.x - rect.width,
        top: this.p1.y - rect.height,
        angle: 0
      });
    }
    if(this.shape === "star"){
      let dX = this.p2.x - this.p1.x,
        dY = this.p2.y - this.p1.y;

      let outerRadius = Math.sqrt(Math.pow(dX,2) + Math.pow(dY,2));
      let startAngle;

      if(!dX){
        startAngle = dY > 0 ? 0 : Math.PI/2;
      }
      else{
        startAngle = -Math.atan2(dX, dY) + Math.PI;
      }
      // console.log(dX,dY,fabric.util.radiansToDegrees(startAngle));

      let points = fabric.util.shapes.star(outerRadius/2, outerRadius, 5, 0,outerRadius,outerRadius);
      path = fabric.util.shapes.polyline({points: points, units: "absolute"});

      // this._shape.setPath(path);
      this._shape.set({
        width: outerRadius * 2,
        height: outerRadius * 2,
        originX: "center",
        originY: "center",
        path: path,
        left: this.p1.x ,
        top: this.p1.y,
        angle: fabric.util.radiansToDegrees(startAngle)
      })
    }

    if(this.shape === "hexagon"){
      let dX = this.p2.x - this.p1.x,
        dY = this.p2.y - this.p1.y;

      let outerRadius = Math.sqrt(Math.pow(dX,2) + Math.pow(dY,2));
      let startAngle;

      if(!dX){
        startAngle = dY > 0 ? 0 : Math.PI/2;
      }
      else{
        startAngle = -Math.atan2(dX, dY) + Math.PI;
      }
      // console.log(dX,dY,fabric.util.radiansToDegrees(startAngle));

      let points = fabric.util.shapes.star(outerRadius, outerRadius, 3, 0,outerRadius,outerRadius);
      path = fabric.util.shapes.polyline({points: points, units: "absolute"});

      // this._shape.setPath(path);
      this._shape.set({
        width: outerRadius * 2,
        height: outerRadius * 2,
        originX: "center",
        originY: "center",
        path: path,
        left: this.p1.x ,
        top: this.p1.y,
        angle: fabric.util.radiansToDegrees(startAngle)
      })
    }
  },
  /**
   * Inovoked on mouse move
   * @param {Object} pointer
   */
  onMouseMove: function (pointer) {

    this.p2 = new fabric.Point(pointer.x, pointer.y);


    if (this.p1.x === this.p2.x || this.p1.y === this.p2.y) {
      delete this.p2;
    } else {
      this.updateBrush();
    }
    this.canvas.renderAll();
  },

  /**
   * Invoked on mouse up
   */
  onMouseUp: function () {

    fabric.util.removeListener(fabric.window, 'keydown', this._onKeyDownBinded);
    fabric.util.removeListener(fabric.window, 'keyup', this._onKeyUpBinded);
    if(!this.p2)return;

    let properties = this._shape.storeObject();
    properties.type = "path";
    properties.canvas = this;

    let _object = fabric.util.createObject(properties);
    this.canvas.add(_object);
    this.canvas.setActiveObject(_object);
    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.renderAll();
  },
  /**
   * Draw a smooth path on the topCanvas using quadraticCurveTo
   * @private
   */
  _render: function () {
    // this.canvas.fire("before:brush:render",{target: this});
    if (!this.p2) {
      return;
    }
    let ctx = this.canvas.contextTop;

    ctx.save();
    ctx.transform.apply(ctx, this.canvas.viewportTransform);
    // let rect = this._getRect();
    // ctx.translate(- rect.width/2, - rect.height/2);
    this._shape.render(ctx);
    ctx.restore();

    // this.canvas.fire("brush:render",{target: this})
  },
  _getRect: function () {
    let x1, x2, y1, y2;
    if (this.p1.x < this.p2.x) {
      x1 = this.p1.x, x2 = this.p2.x;
    } else {
      x2 = this.p1.x, x1 = this.p2.x;
    }
    if (this.p1.y < this.p2.y) {
      y1 = this.p1.y, y2 = this.p2.y;
    } else {
      y2 = this.p1.y, y1 = this.p2.y;
    }
    return {
      left: x1,
      top: y1,
      width: x2 - x1,
      height: y2 - y1
    };
  },
  drawingLimits: null,
  minHeight: 50,
  minWidth: 50,
  _checkRectangle: function(_rect){


    let dl = this.drawingLimits;
    if(dl && dl == "backgroundImage"){
      dl= this.canvas.backgroundImage;
    }

    _rect = {
      left: _rect.left,
      top: _rect.top,
      width: _rect.width,
      height: _rect.height,
    };

    // _rect.left  -= fabric.Rect.prototype.strokeWidth / 2;
    // _rect.top   -= fabric.Rect.prototype.strokeWidth / 2;

    if(dl){
      if(_rect.left + _rect.width < dl.left ||
        _rect.top  + _rect.height < dl.top ||
        _rect.left > dl.width ||
        _rect.top > dl.height){
        return false;
      }

      if(_rect.top < dl.top){
        _rect.height +=_rect.top ;
        _rect.top = dl.top;
      }
      if(_rect.left < dl.left){
        _rect.width += _rect.left;
        _rect.left = dl.left;
      }
    }

    if(this.minWidth && _rect.width < this.minWidth){
      _rect.width = this.minWidth;
    }
    if(this.minHeight && _rect.height < this.minHeight){
      _rect.height = this.minHeight;
    }


    if(dl) {
      let _xdiff = _rect.left + _rect.width - dl.width;
      if (_xdiff > 0) {
        _rect.width -= _xdiff;
        if (this.minWidth && _rect.width < this.minWidth) {
          _rect.left -= this.minWidth - _rect.width;
          _rect.width = this.minWidth;
        }
      }
      let _ydiff = _rect.top + _rect.height - dl.height;
      if (_ydiff > 0) {
        _rect.height -= _ydiff;
        if (this.minHeight && _rect.height < this.minHeight) {
          _rect.top -= this.minHeight - _rect.height;
          _rect.height = this.minHeight;
        }
      }
    }
    return _rect;
  }
});

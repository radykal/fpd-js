
  /**
   * PencilBrush class
   * @class fabric.RectangleBrush
   * @extends fabric.BaseBrush
   */
  fabric.PolygonBrush = fabric.util.createClass(fabric.BaseBrush, /** @lends fabric.RectangleBrush.prototype */ {
    resultObjectType: "Polyline",
    type: "polygon-brush",
    virtualObject: false,
    maximumPoints : 0,
    individualDrawing: true,
    /**
     * Constructor
     * @param {fabric.Canvas} canvas
     * @return {fabric.RectangleBrush} Instance of a pencil brush
     */
    initialize: function (canvas) {
      this.callSuper('initialize', canvas);
      this.reset();
    },
    /**
     * Inovoked on mouse down
     * @param {Object} pointer
     */
    onMouseDown: function (pointer) {


      if(this.individualDrawing || !this.target){
        var _point = {x: pointer.x, y: pointer.y};
        this.points.push(_point);
        if(!this.virtualObject){
          this.target = this.canvas.createObject(
            Object.assign({},
              this.resultObjectProperties, {
                type: this.resultObjectType,
                points: [_point],
                active: true
              }
            )
          );
        }
      }else{
        this._create_active_point(pointer);
      }

      if(this.virtualObject) {
        this._setBrushStyles();
        this._setShadow();
        this._render();
      }else{
        this.canvas.renderAll();
      }
    },

    _create_active_point: function (pointer) {
      var _point = {x: pointer.x, y: pointer.y};
      this.activePoint =  _point;
      this.activeTargetPoint =  {x: pointer.x - this.target.left, y : pointer.y - this.target.top};
      this.points.push(this.activePoint);
      this.target.addPoint(this.activeTargetPoint);
    },
    /**
     * Inovoked on mouse move
     * @param {Object} pointer
     */
    onMouseMove: function (pointer) {


      var _p =  {x: pointer.x - this.target.left, y : pointer.y - this.target.top};


      if(this.activePoint){
        this.activePoint.x = pointer.x;
        this.activePoint.y = pointer.y;
        var _order = this.target.points.length ;

        this.target.setPoint("p" + _order, {
          x : pointer.x - this.target.left,
          y : pointer.y - this.target.top
        });
      }else{
        var _dist = fabric.Point.prototype.distanceFrom.call(this.points[0],_p)
        if(_dist > 10){
          this._create_active_point(pointer);
        }
      }
      this.canvas.renderAll();
    },
    reset: function(){
      this.points = [];
      this.target = null;
      this.activePoint = null;
      this.activeTargetPoint = null;
    },
    /**
     * Invoked on mouse up
     */
    onMouseUp: function () {
      this.target.updateBbox();
      if(this.points.length == this.maximumPoints){
        this.reset();
      }
      this.activePoint = null;
      this.canvas.renderAll();
    },

    /**
     * Draw a smooth path on the topCanvas using quadraticCurveTo
     * @private
     */
    _render: function () {
      this.canvas.fire("before:brush:render",{target: this});

      var ctx = this.canvas.contextTop,
        v = this.canvas.viewportTransform;

      ctx.save();
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);

      var _klass_proto = fabric[this.resultObjectType].prototype;

      ctx.lineWidth = _klass_proto.strokeWidth;
      ctx.strokeStyle = _klass_proto.stroke;
      ctx.fillStyle = _klass_proto.fill;

      ctx.beginPath();
      ctx.moveTo(this.points[0].x,this.points[0].y);
      for(var i = 1; i < this.points.length; i++){
        ctx.lineTo(this.points[i].x,this.points[i].y)
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      this.canvas.fire("brush:render",{target: this})
    },
    drawingLimits: null, /*{
      left: 0,
      width: 0,
      height: 0,
      top: 0
    },*/
    minHeight: 50,
    minWidth: 50,
    _checkRectangle: function(_rect){


      var dl = this.drawingLimits;
      if(dl && dl == "backgroundImage"){
        dl= this.canvas.backgroundImage;
      }

      _rect = {
        left: _rect.left,
        top: _rect.top,
        width: _rect.width,
        height: _rect.height,
      };

      _rect.left  -= fabric.Rect.prototype.strokeWidth / 2;
      _rect.top   -= fabric.Rect.prototype.strokeWidth / 2;

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
        var _xdiff = _rect.left + _rect.width - dl.width;
        if (_xdiff > 0) {
          _rect.width -= _xdiff;
          if (this.minWidth && _rect.width < this.minWidth) {
            _rect.left -= this.minWidth - _rect.width;
            _rect.width = this.minWidth;
          }
        }
        var _ydiff = _rect.top + _rect.height - dl.height;
        if (_ydiff > 0) {
          _rect.height -= _ydiff;
          if (this.minHeight && _rect.height < this.minHeight) {
            _rect.top -= this.minHeight - _rect.height;
            _rect.height = this.minHeight;
          }
        }
      }
      return _rect;
    },
    resultObjectProperties: {}
  });

//
// if(!fabric.isLikelyNode){
//   fabric.Canvas.prototype.drawingTools.PolygonBrush = {
//       // icon: 'data:image/png;base64,'+ require('base64-loader!./../media/polygon.png'),
//       title: 'Polygon Brush'
//   };
//   fabric.Canvas.prototype.activeDrawingTools.push("PolygonBrush");
// }



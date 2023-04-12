import "../mixins/shapeMixin.js"
import "../mixins/bezierMixin.js"

fabric.BezierPolyline = fabric.util.createClass(fabric.Object, fabric.ShapeMixin, fabric.BezierMixin, {
  type: 'bezier-polyline',
  hasRotatingPoint: false,
  hasBoundControls: false,
  hasTransformControls: true,
  stroke: "black",
  pointsLimits: false,
  hasBoundsControls: false,
  closed: false,
  cornerSize: 16,
  enderAreaSize: 25,
  extensionAreaEnabled: false,
  cornerStyle: "rect",
  maximumPoints: 4,
  points: [],
  stateProperties: ["top", "left", "width", "height", "angle", "points"],
  eventListeners: fabric.util.merge(fabric.Object.prototype.eventListeners, {
    // "mouseup" : "handleCornerActions",
    "added": function () {
      this.setCoords();
    },
    // "mousedown": function (event) {
    //   if (this.__corner/* && this.__corner[0] == "e"*/) {
    //     this.canvas._transformObject(event.e);
    //   }
    // }
  }),
  drawControlsInterface: function (ctx) {
    this.drawBezierShapeControls(ctx);
    this._drawMagnetLine(ctx);
  },
  _render: function (ctx) {
    var x = -this.width / 2 ,
        y = -this.height / 2,
        _pc;

    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(this.points[0].x,  this.points[0].y);

    for (var i = 0; i < this.points.length - 1; i++) {

      if(this.points[i].curve) {
        if(!this.points[i].outline){
          _pc = this.points[i].curve.points;
          ctx.quadraticCurveTo( _pc[1].x,  _pc[1].y,_pc[2].x,_pc[2].y);
        }
      }else{
        ctx.lineTo( this.points[i + 1].x,  this.points[i + 1].y);
      }
    }
    if(this.closed){
      if(this.points[this.points.length - 1].curve) {
        _pc = this.points[i].curve.points;
        ctx.quadraticCurveTo(_pc[1].x,  _pc[1].y, _pc[2].x,_pc[2].y);
      }
      ctx.closePath();
    }
    this.closed && this._renderFill(ctx);

    this._renderStroke(ctx);

    ctx.beginPath();
    for (i = 0; i < this.points.length - 1; i++) {
      if (this.points[i].outline) {
        var _ci = 0;
        while(!this.points[i].outline.curves[++_ci]._linear){
          this.drawCurve(ctx, this.points[i].outline.curves[_ci]);
        }
        this.points[i].outline.__middle = _ci;
      }
    }
    for (i = this.points.length; i --;) {
      if (this.points[i].outline) {
        _ci = this.points[i].outline.__middle;
        while(this.points[i].outline.curves[++_ci]){
          this.drawCurve(ctx, this.points[i].outline.curves[_ci]);
        }
      }
    }
    ctx.closePath();
    this._renderFill(ctx);
    this._renderStroke(ctx);

    ctx.restore();
  },
  merge (polyline,pIndex1,pIndex2) {
    var i,
        _x = polyline.left - this.left,
        _y = polyline.top - this.top,
        _points = this.points,
        _action,
        _PP = polyline.points;

    if(pIndex1) {
      _action = "push";
      _points.pop();
    }else{
      _action = "unshift";
      _points.shift();
    }
    var addPoint = function (main_point,reversePoint){
      var curve_point = reversePoint && reversePoint.c;
      var new_point = {
        x: main_point.x + _x,
        y: main_point.y + _y,
      };
      if(curve_point){
        new_point.c = {
          x: curve_point.x + _x,
          y: curve_point.y + _y,
        }
      }
      _points[_action](new_point);
    };
    if(pIndex2 === 0){
      for(i = 0 ; i < _PP.length; i++){
        addPoint(_PP[i] , _PP[pIndex1 ? i :  i - 1]);
      }
    }else{
      for(i = _PP.length ; i--;){
        addPoint(_PP[i] , _PP[pIndex1 ? i - 1: i]);
      }
    }
    polyline.remove();
    for(i =0; i < _points.length; i++){
      if(_points[i].c && !_points[i].curve){
        this._makeCurve(_points[i],_points[i].c,_points[i + 1]);
      }
    }
    this.updateBbox();
    this.canvas.renderAll();
  },
  setExtraControls: function(controls){
    if(this.hasTransformControls){
      this.addPointsControls(controls);
      this.addExtensionAreaControls(controls);
      this._createInterfaceButtons(controls);
    }
  },
  addExtensionAreaControls: function(controls){
    var  pts = this.points;
    var _last = pts.length - 1;
    if(this.extensionAreaEnabled){
      controls["e1"] = {
        action: "unshift",
        cursor: "target",
        x: pts[0].x,
        y: pts[0].y,
        style: this.cornerStyle,
        area:  this.enderAreaSize,
        visible: true
      };
      controls["e2"] = {
        action: "push",
        cursor: "target",
        x: pts[_last].x,
        y: pts[_last].y,
        style: this.cornerStyle,
        area:  this.enderAreaSize,
        visible: true
      };
    }
  },
  checkMerge: function () {
    var target = this, _tlast = this.points.length - 1;
    var p1 = this.points[0],
      p2 = this.points[_tlast],
      _distance = fabric.Point.prototype.distanceFrom;
    p1 = {
      x : p1.x + this.left,
      y:  p1.y + this.top
    };
    p2 = {
      x : p2.x + this.left,
      y:  p2.y + this.top
    };

    var _dist = 10;

    this.canvas._objects.some(function(obj) {
      if (obj == target || obj.type !== "bezier-polyline")return false;
      var _olast = obj.points.length - 1;

      var p3 = obj.points[0];
      var p4 = obj.points[_olast];
      p3 = {
        x : p3.x + obj.left,
        y:  p3.y + obj.top
      };
      p4 = {
        x : p4.x + obj.left,
        y:  p4.y + obj.top
      };

      if(_distance.call(p1, p3) < _dist){
        target.merge(obj,0,0)
      }
      if(_distance.call(p1, p4) < _dist){
        target.merge(obj,0,_olast)
      }
      if(_distance.call(p2, p3) < _dist){
        target.merge(obj,_tlast,0)
      }
      if(_distance.call(p2, p4) < _dist){
        target.merge(obj,_tlast,_olast)
      }
    })
  }
});

fabric.BezierPolyline.fromObject = function (object) {
  return new this(object);
};

// fabric.util.createAccessors(fabric.BezierPolyline);

// require("./polyline.controls");
//
// if (fabric.objectsLibrary) {
//   Object.assign(fabric.objectsLibrary, {
//     shape: {
//       type: "bezier-polyline",
//       points: function (w, h) {
//           return [
//           {x: 25, y: 1},
//           {x: 31, y: 18},
//           {x: 49, y: 18},
//           {x: 35, y: 29},
//           {x: 40, y: 46},
//           {x: 25, y: 36},
//           {x: 10, y: 46},
//           {x: 15, y: 29},
//           {x: 1, y: 18},
//           {x: 19, y: 18}
//         ];
//       },
//       "stroke": "black",
//       "fill": "blue"
//     }
//   });
// }

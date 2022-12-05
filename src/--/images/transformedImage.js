

'use strict';
require("./../mixins/BezierMixin");
require("./../mixins/CacheMixin");
require("./../mixins/TransformedImageMixin");

fabric.TransformedImage = fabric.util.createClass(
fabric.Image,
fabric.BezierMixin,
fabric.CacheMixin,
fabric.TransformedImageMixin, {
  type: 'transformed-image',
  points:     null,
  _triangles: [],
  wireframe:  false,
  fixWireFrame: true,
  renderBorder:false,
  specialProperties: fabric.Image.prototype.specialProperties.concat(["points","curve"] ),
  stateProperties: ["points"].concat(fabric.Image.prototype.stateProperties),
  _editing_mode: 'scale' ,//'3d',
  initialize: function (el,options,callback) {
    options || ( options = {});

    fabric.util.object.defaults(options,{
      width : el && el.width  || 100,
      height: el && el.height || 100
    });

    if(options.points){
      this.width = 0;
      this.height = 0;
    }

    this.points = options.points || [
        {x: 0, y: 0},
        {x: options.width, y: 0},
        {x: options.width, y: options.height},
        {x: 0, y: options.height}
      ];

    if(options.renderBorder !== undefined){
      this.renderBorder     = options.renderBorder;
    }
    if(options.wireframe !== undefined){
      this.wireframe     = options.wireframe;
    }
    if(options.perspective !== undefined){
      this.perspective     = options.perspective;
    }
    if(options.verticalSubdivisions !== undefined){
      this.verticalSubdivisions     = options.verticalSubdivisions;
    }
    if(options.horizontalSubdivisions !== undefined){
      this.horizontalSubdivisions     = options.horizontalSubdivisions;
    }
    this.extraControls = {};

    this._corner_actions = this._corner_actions || {};
    this._corner_actions.curve = "curve";

    this.callSuper('initialize',el, options,callback);


    this._update_curve_point();
    this._initCurveOffset();
    this._switch_controls = this.switchControls.bind(this);
    this.on('dblclick',this._switch_controls);

    if(options.contentOffsets){
      this._update_content_offsets(options.contentOffsets);
    }
    this.on("shape:modified",function(data){
      this.dirty = true;
      this.canvas.renderAll();
    });
    this.on("content:modified",function(data){
      if(data.bounds){
        this._initCurveOffset();
        var _b =  data.bounds || {
          minX: 0,
          maxX: this._originalElement.width,
          minY: 0,
          maxY: this._originalElement.height
        };
        this._update_content_offsets(_b);
      }
      this.dirty = true;
      this.canvas.renderAll();
    });
    this.updateBbox();
  },
  optionsOrder: fabric.Image.prototype.optionsOrder.concat(["points"]),
  curve :  {x: 0.5, y: 0.5},
  drawControls: function (ctx, shape, offset) {
    if (!this.hasControls) {
      return this;
    }
    this.drawBoundsControls( ctx);
    this.drawExtraControls(ctx);
  },
  _update_curve_point: function(){
    this.extraControls.curve = this._getPointForImageCoordianate(this.width * this.curve.x,this.height * this.curve.y,true);
  },
  setCurve: function(curve){
    this.curve = curve ||  {x: 0.5, y: 0.5};
    this.dirty = true;
    this.setPoint("c1",{x: this.points[0].x - 10, y: this.points[0].y - 10 });
  },
  _performCurveAction: function (e, transform, pointer) {
    this.extraControls.curve.y = transform.point.y;
    this.extraControls.curve.x = transform.point.x;
    this.setCurve(this._getImageCoordianateForPoint(transform.point));
    transform.actionPerformed = true;
  },
  _initCurveOffset: function(){
    this._curve_point_left =     {x: 0, y: this.height /2};           //  fabric.util.transformPoint({x: 0, y: this.height /2}, transformMatrix);
    this._curve_point_middle =   {x: this.width / 2, y: this.height * this.curve.y};           //   fabric.util.transformPoint({x: this.width / 2, y: _y}, transformMatrix);
    this._curve_point_right =    {x: this.width, y:  this.height /2}   ;//   fabric.util.transformPoint({x: this.width, y:  this.height /2}, transformMatrix);
  },
  _getCurveOffsetPoint :function(t) {
    var x = (1 - t) * (1 - t) * this._curve_point_left.x + 2 * (1 - t) * t * this._curve_point_middle.x + t * t * this._curve_point_right.x;
    var y = (1 - t) * (1 - t) * this._curve_point_left.y + 2 * (1 - t) * t * this._curve_point_middle.y + t * t * this._curve_point_right.y;
    return {x: x, y: y};
  },
  setControlPoints: function () {
    this._controls = [];
    this.addPointsControls(this._controls);
    return this._controls;
  },
  _getCurveOffset: function(t) {
    var p = this._getCurveOffsetPoint(t);
    p.y -= this._curve_point_left.y;
    return p;
  },
  _show_pointers: function ()  {
    if(this._editing_mode == '3d'){

      var _default_corners = {
        tl: false,
        tr: false,
        br: false,
        bl: false,
        ml: false,
        mt: false,
        mr: false,
        mb: false,
        mtr:false,
        p : true
      };
    }else{
      var _default_corners = {
        tl: true,
        tr: true,
        br: true,
        bl: true,
        ml: true,
        mt: true,
        mr: true,
        mb: true,
        mtr:true,
        p : false
      };
    }
    for(var i in _default_corners){
      this._controlsVisibility[i] = _default_corners[i];
    }
    this.canvas && this.canvas.renderAll();
  },
  switchControls: function () {
    if(this._editing_mode == '3d'){
      this._editing_mode = 'scale';
    }else{
      this._editing_mode = '3d';
    }
    this._show_pointers();
    this.canvas.renderAll();
  },
  normalize: function(){
    this.off('dblclick',this._switch_controls);
    delete this._switch_controls;
  },
  /**
   * @private
   * @param {CanvasRenderingctx2D} ctx ctx to render on
   */
  _render: function (ctx, noTransform) {
    ctx.save();

    this.calculateGeometry();

    if (this._element) this.drawElement(ctx);
    if (this.wireframe) this.drawWireframe(ctx);
    if (this.fixWireFrame) this.fixSemiTransparentPixels(ctx);

    if (this.renderBorder) {
      var p1 = new fabric.Point(this.points[0].x,this.points[0].y);
      var p2 = new fabric.Point(this.points[1].x,this.points[1].y);
      var p3 = new fabric.Point(this.points[2].x,this.points[2].y);
      var p4 = new fabric.Point(this.points[3].x,this.points[3].y);
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      ctx.closePath();
    }


    ctx.restore();
  },
  toObject: function(propertiesToInclude) {
    var object = this.callSuper('toObject', propertiesToInclude);

    if (!this.includeDefaultValues) {
      this._removeDefaultValues(object);
    }

    var points = []
    for(var i in this.points){
      points.push(this.points[i].x);
      points.push(this.points[i].y);
    }
    object.curve = this.curve;
    object.points = points;
    return object;
  },
  update_curve_height: function () {
    if(this.extraControls.curve.y > this._original_height){
      this.height = this.extraControls.curve.y;
    }else  if(this.extraControls.curve.y < this._original_height){
      this.height = Math.max(this.extraControls.curve.y, this._original_height);
    }
  }
});

var _TRI = fabric.TransformedImage.prototype;
fabric.TransformedImage.prototype.actions = fabric.util.object.extend({}, fabric.Image.prototype.actions, {
  switchControls: {
    className: 'fa fa-cube ',
    title: 'toggle transform',
    action: _TRI.switchControls
  }
});

fabric.TransformedImage.fromObject = function(object,callback){

  object = fabric.util.object.clone(object);

  fabric.util.loadImage(object.src, function(img) {
      fabric.Image.prototype._initFilters.call(object, object.filters, function(filters) {
        object.filters = filters || [ ];
        fabric.Image.prototype._initFilters.call(object, object.resizeFilters, function(resizeFilters) {
          object.resizeFilters = resizeFilters || [ ];
          var instance = new fabric.TransformedImage(img, object,callback);
        });
      });
  }, null, object.crossOrigin);
};


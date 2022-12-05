'use strict';


  /**
   * PencilBrush class
   * @class fabric.PencilBrush
   * @extends fabric.BaseBrush
   */
  fabric.PaintPenBrush = fabric.util.createClass(fabric.BaseBrush, /** @lends fabric.PencilBrush.prototype */ {
    type: 'paint-pen-brush',

    /**
     * Constructor
     * @param {fabric.Canvas} canvas
     * @return {fabric.PencilBrush} Instance of a pencil brush
     */
    initialize: function(canvas) {
      this.callSuper('initialize', canvas);
      this._points = [];
    },
    getTarget: function(){
      return this.canvas.drawingContext;
    },
    /**
     * Inovoked on mouse down
     * @param {Object} pointer
     */
    onMouseDown: function(pointer) {
      this._reset();
      this._fill(pointer);
    },

    /**
     * Inovoked on mouse move
     * @param {Object} pointer
     */
    onMouseMove: function(pointer) {
      this._fill(pointer);
    },
    /**
     * Invoked on mouse up
     */
    onMouseUp: function() {
      this.canvas.fire("draw:after",{
        target: this.getTarget() ,
        points: this._points.slice() ,
        color: this.getColor('source')
      });
    },
    _fill: function(pointer){
      pointer = {
        x: Math.floor(pointer.x),
        y: Math.floor(pointer.y)
      };

      if(_.findWhere(this._points,pointer)){
        return;
      }

      // this.getTarget().fillRect(pointer.x , pointer.y  ,1,1);
      var _data = this.getTarget().getImageData(pointer.x , pointer.y  ,1,1);
      pointer.color = Array.prototype.slice.call(_data.data);
      this._points.push(pointer);
      var _color = this.getColor('source');




      _data.data[0] = _color[0];
      _data.data[1] = _color[1];
      _data.data[2] = _color[2];
      _data.data[3] = _color[3];

      this.getTarget().putImageData(_data, pointer.x , pointer.y);
      this.canvas.renderAll();
    },
    undoPaintAction: function(_action){
      var ctx = _action.object;
      for(var i in _action.points){
        var _p  =_action.points[i], _c = _action.brush.getActionColor(_p.color);
        if(_c[3] == 0) {
          ctx.clearRect(_p.x,_p.y  ,1,1);
        }else{
          ctx.fillStyle = "rgba(" + _c[0] + "," + _c[1] + "," + _c[2] + "," + _c[3] +  ")";
          ctx.fillRect(_p.x,_p.y  ,1,1);
        }
      }
      _action.canvas.renderAll();
    },
    redoPaintAction: function(_action){

      var ctx = _action.object, _c = _action.brush.getActionColor(_action.color);
      var pts = _action.points;
      if(_c[3] == 0) {
        for(var i in pts){
          ctx.clearRect(pts[i].x,pts[i].y  ,1,1);
        }
      }else{
        ctx.fillStyle = "rgba(" + _c[0] + "," + _c[1] + "," + _c[2] + "," + _c[3] + ")";
        for(var i in pts){
          ctx.fillRect(pts[i].x,pts[i].y ,1,1);
        }
      }
      _action.canvas.renderAll();
    },
    /**
     * Clear points array and set contextTop canvas style.
     * @private
     */
    _reset: function() {
      this._points.length = 0;
      this.getTarget().fillStyle = this.color;
    },
    getHistoryRecord: function(event){

      return {
        canvas:   this.canvas,
        type:     "draw:pen",
        object:   event.target ,
        points:   event.points ,
        brush:   this,
        color:    event.color,
        undo:     this.undoPaintAction,
        redo:     this.redoPaintAction
      }
    }
  });


// if(!fabric.isLikelyNode) {
//   fabric.Canvas.prototype.drawingTools.PaintPenBrush = {
//       className: 'fa fa-paint-brush',
//       title: 'Pen Brush'
//   };
//   fabric.Canvas.prototype.activeDrawingTools.push("PaintPenBrush");
// }

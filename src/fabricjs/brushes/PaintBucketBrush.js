'use strict';


fabric.MagicWand = require('../../plugins/magicwand');

  /**
   * PencilBrush class
   * @class fabric.PencilBrush
   * @extends fabric.BaseBrush
   */
  fabric.PaintBucketBrush = fabric.util.createClass(fabric.BaseBrush, /** @lends fabric.PencilBrush.prototype */ {
    type: 'paint-bucket-brush',
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
    onMouseUp: function() {},
    onMouseMove: function() {},
    onMouseDown: function(pointer) {
      this._fill(pointer);
    },
    _fill: function(pointer){
      pointer = {
        x: Math.floor(pointer.x),
        y: Math.floor(pointer.y)
      };

      var info = this.getTarget().getImageData(0,0,this.getTarget().canvas.width,this.getTarget().canvas.height);

      fabric.MagicWand.floodFill(info, pointer.x , pointer.y, 1,{},null,function(mask){
        var _color = this.getColor('source');
        var _target = this.getTarget();
        var _w = mask.bounds.maxX - mask.bounds.minX + 1, _h = mask.bounds.maxY - mask.bounds.minY + 1;
        var oldImageData = _target.getImageData( mask.bounds.minX,mask.bounds.minY,_w, _h);

        mask.render(_target,{
          intersectionColor : _color,
          fill : _color,
          cache: false,
          left : mask.bounds.minX,
          top : mask.bounds.minY
        });

        this.canvas.fire("draw:after",{
          target: this.getTarget() ,
          redo: _target.getImageData( mask.bounds.minX,mask.bounds.minY,_w, _h),
          undo: oldImageData ,
          left : mask.bounds.minX,
          top : mask.bounds.minY,
          color: this.getColor().slice()
        });

        this.canvas.renderAll();
      }.bind(this));
    },
    getHistoryRecord: function(event) {

      return {
        canvas:   this.canvas,
        object:   event.target ,
        type:     "draw:bucket",
        left:     event.left ,
        top:      event.top ,
        undoData: event.undo,
        redoData: event.redo,
        color:    this.convertColor(event.color,"source"  ),
        undo: function(_action){
          _action.object.putImageData(_action.undoData, _action.left,_action.top);
          _action.canvas.renderAll();
        },
        redo: function(_action){
          _action.object.putImageData(_action.redoData, _action.left,_action.top);
          _action.canvas.renderAll();
        }
      }
    }
  });

// if(!fabric.isLikelyNode) {
//     fabric.Canvas.prototype.drawingTools.PaintBucketBrush = {
//         icon: 'data:image/svg+xml;base64,' + require('base64-loader!./../media/paint-bucket.svg'),
//         title: 'Bucket Brush'
//     };
//     fabric.Canvas.prototype.activeDrawingTools.push("PaintBucketBrush");
// }

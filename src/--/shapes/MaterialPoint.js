
fabric.MaterialPoint = fabric.util.createClass(fabric.Object,{
  deactivationDisabled: true,
  type: "material-point",
  cornerSize: 5,
  width: 1,
  height: 1,
  strokeWidth: 0,
  cornerStyle: "circle",
  cornerAreaSize: 20,
  setCoords: fabric.Object.prototype.setExtraCoords,
  hasBoundsControls: false,
  hasBorders: false,
  _render: function(ctx,noTransform){
    var x = noTransform ? this.left : -this.width / 2 ,
      y = noTransform ? this.top : -this.height / 2;

    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.arc(0.5,0.5, 0.5, 0, 2 * Math.PI, false);
    this._renderFill(ctx);
    this._renderStroke(ctx);
    ctx.restore();
  },
  drawControls: function (ctx) {
    this.drawExtraControls(ctx);
  },
  setControlPoints: function () {
    return [
      {
        x: 0.5,
        y: 0.5,
        cursor: "moveCursor",
        area:  this.cornerAreaSize,
        size : this.cornerSize,
        style: this.cornerStyle,
        action: "drag",
        id: "d"
      }
    ]
  }
});

fabric.MaterialPoint.fromObject = function(options){
  return new fabric.MaterialPoint(options);
};

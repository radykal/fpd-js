

fabric.PencilBrush.prototype.initialize = function(canvas) {
  this.callSuper('initialize', canvas);
  this._points = [ ];
};
fabric.PencilBrush.prototype.type = 'pencil-brush';

fabric.PencilBrush.prototype._render = function() {
  if(this._points.length < 2)return;
  let ctx  = this.canvas.contextTop, v = this.canvas.viewportTransform, p1 = this._points[0], p2 = this._points[1];
  ctx.save();
  ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
  ctx.beginPath();
  ctx.lineWidth = 1 / this.canvas.viewportTransform[0];
  if (this._points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
    p1.x -= 0.5 / this.canvas.viewportTransform[0];
    p2.x += 0.5 / this.canvas.viewportTransform[0];
  }
  ctx.moveTo(p1.x, p1.y);
  for (let i = 1, len = this._points.length; i < len; i++) {
    let midPoint = p1.midPointFrom(p2);
    ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
    p1 = this._points[i];
    p2 = this._points[i + 1];
  }
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke();
  ctx.restore();
};

fabric.PencilBrush.prototype.createPath = function(pathData) {
  let path = new fabric.Path(pathData, {
    stroke: this.getColor(),
    strokeWidth: this.width,
    editor: this.canvas.editor
  });
  if (this.shadow) {
    this.shadow.affectStroke = true;
    path.setShadow(this.shadow);
  }
  return path;
};
fabric.PencilBrush.prototype.minLength = 3;

fabric.PencilBrush.prototype.accuracy = 0;
fabric.PencilBrush.prototype._finalizeAndAddPath = function() {
  if(this._points.length < 2)return;
  let ctx = this.canvas.contextTop;
  ctx.closePath();
  this.canvas.clearContext(this.canvas.contextTop);
  if(this.accuracy){
    for(let i in this._points){
      this._points[i].x = +this._points[i].x.toFixed(this.accuracy);
      this._points[i].y = +this._points[i].y.toFixed(this.accuracy);
    }
    for(i = this._points.length - 1; i--; ){
      if(this._points[i].x === this._points[i + 1].x &&  this._points[i].y === this._points[i + 1].y){
        this._points.splice(i,1);
      }
    }
  }
  if(this._points.length < 2)return;
  let pathData = this.convertPointsToSVGPath(this._points).join('');
  if (this._points.length < this.minLength || pathData === 'M 0 0 Q 0 0 0 0 L 0 0') {
    return this.canvas.renderAll();
  }
  let path = this.createPath(pathData);
  this.canvas.add(path);
  path.setCoords();
  this._resetShadow();
  this.canvas.renderAll();
  this.canvas.fire('path:created', { path: path });
};


// if(!fabric.isLikelyNode) {
//     fabric.Canvas.prototype.drawingTools.PencilBrush = {
//         className: 'fa fa-pencil',
//         title: 'Pencil Brush'
//     };
//     fabric.Canvas.prototype.activeDrawingTools.push("PencilBrush");
// }

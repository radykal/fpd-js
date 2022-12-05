

Object.assign(fabric.BezierPolyline.prototype,{
  controlsButtonsEnabled: false,
  _createInterfaceButtons: function(controls){
    if(!this.controlsButtonsEnabled)return;
    if(!this.magnetPoint)return;

    // var pts = this.points,
    //   _last = pts.length - 1;
    // if(this.magnetPoint && this.magnetPoint[0] !== "x"){
      // var _id = this.magnetPoint;
      // var _ender_area = (_id == "e1" || _id == "e2");
      // var _ender_points = _ender_area || (_id == "p1" || _id == "p" + pts.length);
      // var _offset = _ender_points ? 10 : 5;
      // this._xbuttons_point = _ender_area ? (_id[1] == "1" ? 0 : _last) : _id.substr(1) - 1;
      // this._xbuttons_curve = _id[0] == "c"
      //
      // ;
    let _offset = 30;
    let control = this._controls[this.magnetPoint];
    if(control.removable) {
      controls["x2"] = {
        x: control.x + _offset,
        y: control.y + _offset,
        parent: this.magnetPoint,
        size: 16,
        button: true,
        action: "remove",
        cursor: "pointer",
        intransformable: true,
        styleFunction: this._drawRemoveNodeButton
      };
    }
    if(control.curvable) {
      controls["curve"] = {
        x: control.x - _offset,
        y: control.y - _offset,
        parent: this.magnetPoint,
        size: 16,
        button: true,
        action: "toggle",
        cursor: "pointer",
        intransformable: true,
        styleFunction: this._drawCurveNodeButton
      };
    }
    if(control.insertable) {
      controls["x1"] = {
        x: control.x + _offset,
        y: control.y + _offset,
        size: 16,
        action: "add",
        cursor: "pointer",
        intransformable: true,
        styleFunction: this._drawInsertNodeButton
      }
    }
    // }else{
    //   delete this._xbuttons_point;
    //   delete this._xbuttons_curve;
    // }
  },
  _drawMagnetLine: function(ctx){
    let control = this._controls[this.magnetPoint];
    //todo adding magnetize
    if(control && control.magnetize){
      ctx.translate(-this.width/2, - this.height/2)
      ctx.beginPath();
      ctx.lineWidth = 3 ;
      ctx.strokeStyle = "red";
      ctx.moveTo(control.x, control.y);
      ctx.lineTo(this.__magnet_coordinate.x, this.__magnet_coordinate.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.__magnet_coordinate.x, this.__magnet_coordinate.y, this.cornerSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }
  },
  _drawInsertNodeButton: function (control, ctx, methodName, left, top, size, stroke) {
    left -= size/2; top -= size/2;
    ctx.save();
    ctx.fillStyle = "green";
    ctx.beginPath();
    var _size = size / 4;
    ctx.arc(left + size/2 , top + size/2 , _size * 2 , 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.translate(Math.floor(size/2),Math.floor(size/2));
    ctx.translate(0.5,0.5 );
    ctx.moveTo(left - _size , top );
    ctx.lineTo(left + _size , top );
    ctx.strokeStyle = "white";
    ctx.moveTo(left  , top + _size );
    ctx.lineTo(left  , top - _size );
    ctx.stroke();
    ctx.restore();
  },
  _drawRemoveNodeButton: function (control, ctx, methodName, left, top, size, stroke) {
    left -= size/2; top -= size/2;
    ctx.save();
    ctx.fillStyle = "red";
    ctx.beginPath();
    var _size = size / 4;
    ctx.arc(left + size/2 , top + size/2 , _size * 2 , 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.translate(size/2,size/2);
    ctx.moveTo(left - _size , top - _size);
    ctx.lineTo(left + _size , top + _size);
    ctx.strokeStyle = "white";
    ctx.moveTo(left - _size , top + _size );
    ctx.lineTo(left + _size , top - _size );
    ctx.stroke();
    ctx.restore();
  },
  _performAddAction: function (e, transform, pointer) {
    this.isMoving = false;
    var p1 = this.points[this._xbuttons_point];
    var p2 = this.points[this._xbuttons_point + 1];
    if(p1.curve){
      var new_point1 = p1.curve.get(0.25);
      var new_point2 = p1.curve.get(0.75);

      this.points.splice(this._xbuttons_point + 1,0,{
        x: p1.c.x,
        y: p1.c.y,
        c: new_point2
      });
      p1.c = new_point1;
      this._makeCurveByIndex(this._xbuttons_point);
      this._makeCurveByIndex(this._xbuttons_point + 1);
    }else{
      var new_point1 = {x : (p2.x - p1.x) / 4, y: (p2.y - p1.y) / 4};
      var new_point2 = {x : (p2.x - p1.x) / 4*3, y: (p2.y - p1.y) / 4*3};
    }
    delete this.canvas._currentTransform;
    // delete transform.action;
    // delete transform.corner;
    this.dirty = true;
    this.canvas.renderAll();
  },
  _performRemoveAction: function (e, transform, pointer) {
    if(this.points.length == 2){
      return this.remove();
    }

    var _curvepointer = this._xbuttons_curve,
      pIndex1 = this._xbuttons_point;

    if(this.points[pIndex1 - 1 ]  && this.points[pIndex1 + 1]){
      this.points[pIndex1 - 1 ].c = this.points[pIndex1];
      this.points.splice(pIndex1,1);
      this._makeCurveByIndex(pIndex1 - 1);
    }else{
      this.points.splice(pIndex1,1);
    }
    this.isMoving = false;
    this.updateBbox();
    this.dirty = true;
    this.canvas.renderAll();
    delete this.canvas._currentTransform;
    // delete transform.action;
    // delete transform.corner;
  },
  updateMagnetPoint(event){
    var pointer = this.canvas.getPointer(event.e);
    if (this.__corner) {
      if(this.__corner[0] !== "x"){
        this.magnetPoint = this.__corner;
        this.setCoords();
      }
      if (this.__corner[0] === "e") {
        this.__magnet_coordinate = {x: pointer.x - this.left, y: pointer.y - this.top};
        // this.setControlPoints();
      } else if (this.__magnet_coordinate) {
        delete this.__magnet_coordinate;
      }
    } else {
      if (this.__magnet_coordinate) {
        delete this.magnetPoint;
        delete this.__magnet_coordinate;
        this.setCoords();
      }
    }
    this.canvas.renderAll();
  },
  removeMagnetPoint(event){
    delete this.__magnet_coordinate;
    delete this.magnetPoint;
    this.canvas.renderAll();
    this.setCoords();
  },
  eventListeners: fabric.util.merge(fabric.BezierPolyline.prototype.eventListeners, {
    "mouseout": "removeMagnetPoint",
    "mousemove": "updateMagnetPoint"
  }),
  _performPushAction: function (e, transform, pointer) {
    delete this.__magnet_coordinate;
    this.points.push({
      x: pointer.x - this.left,
      y: pointer.y - this.top,
    });
    transform.action = "shape";
    transform.corner = "p" + this.points.length;
    this.canvas.setCursor(this.canvas.freeDrawingCursor);
    this.canvas.renderAll();
  },
  _performUnshiftAction: function (e, transform, pointer) {
    delete this.__magnet_coordinate;
    this.points.unshift({
      x: pointer.x - this.left,
      y: pointer.y - this.top,
    });
    transform.action = "shape";
    transform.corner = "p1";
    this.canvas.setCursor(this.canvas.freeDrawingCursor);
    this.canvas.renderAll();
  }
});

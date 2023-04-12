'use strict';


Object.assign(fabric.Canvas.prototype, {
  buttonCursor:             'pointer',
  rotationCursor:           'url(data:image/png;base64,' + require('base64-loader!./../media/rotate.png') + ') 8 8,auto',
  eyedropperCursor:         'url(data:image/svg+xml;utf8;base64,' + require('base64-loader!./../media/eyedropper.svg') + ') 0 16,default',
  targetCursor:             'url(data:image/svg+xml;utf8;base64,'+ require('base64-loader!./../media/target.svg') +  ') 8 8,default',
  cursorLines: false,
  setCursorLines: function(val){
    this.cursorLines = val;
    if(!val)return;

    this._vCursorLine = document.createElement("span");
    this._vCursorLine.className = "vertical-cursor-line";
    this._hCursorLine = document.createElement("span");
    this._hCursorLine.className = "horizontal-cursor-line";
    this._vCursorLine.style.position = "absolute";
    this._vCursorLine.style.display = "none";
    this._vCursorLine.style.height = "100%";
    this._vCursorLine.style.width = "1px";
    this._vCursorLine.style.display = "block";
    this._vCursorLine.style.background = this.cursorLines;
    this._hCursorLine.style.position = "absolute";
    this._hCursorLine.style.display = "none";
    this._hCursorLine.style.width = "100%";
    this._hCursorLine.style.height = "1px";
    this._hCursorLine.style.display = "block";
    this._hCursorLine.style.background = this.cursorLines;


    this.on('mouse:out', function(e){
      this.hideLines();
    });
    this.on('mouse:move', function(e){
      if(!this._linesAdded){
        this.wrapperEl.insertBefore(this._hCursorLine,this.upperCanvasEl);
        this.wrapperEl.insertBefore(this._vCursorLine,this.upperCanvasEl);
        this._linesAdded = true;
        this._linesVisible = false;
      }
      this.drawCursorLines(e.e);
    })
  },
  hideLines: function() {

    if (this._linesVisible) {
      this._linesVisible = false;
      this._hCursorLine.style.display = "none";
      this._vCursorLine.style.display = "none";

    }
  },
  drawCursorLines: function(e){

    if(this.isDrawingMode && !this._isCurrentlyDrawing){
      if(!this._linesVisible){
        this._linesVisible = true;
        this._hCursorLine.style.display = "block";
        this._vCursorLine.style.display = "block";
      }
      var point = this.getPointer(e);
      this._vCursorLine.style.left = this.viewportTransform[4]  + point.x * this.viewportTransform[3]  + "px";
      this._hCursorLine.style.top = this.viewportTransform[5] + point.y * this.viewportTransform[0] + "px";
    }else{
      this.hideLines();
    }
  }
});



/////////////////module responsive borders//////////////////////////////////////////////////////////////////////////////////////////

Object.assign(fabric.Object.prototype, {
  responsiveBorders: false,
  centerAndZoomOut: function() {
    this.canvas.centerOnObject(this);
  }
});

fabric.Object.prototype.updateResponsiveBorder = function(){
  if(this.responsiveBorders){
    if(!this.originalStrokeWidth){
      this.originalStrokeWidth = this.strokeWidth;
    }
    this.strokeWidth = this.canvas ? this.originalStrokeWidth / this.canvas.viewportTransform[0] : 0;
  }
};

Object.assign(fabric.Canvas.prototype, {
  eventListeners: fabric.util.merge(fabric.Canvas.prototype.eventListeners, {
    'viewport:scaled': function () {
      if (this.backgroundImage) {
        this.backgroundImage.updateResponsiveBorder();
      }
      for (var i in this._objects) {
        this._objects[i].updateResponsiveBorder();
      }
    },
    "object:added": function (event) {
      event.target.updateResponsiveBorder()
    }
  })
});

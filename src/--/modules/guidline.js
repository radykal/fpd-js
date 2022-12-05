
fabric.Guidline = fabric.util.createClass(fabric.Object,{
  top : 0,
  left : 0,
  height : 1,
  width : 1,
  griddable: false,
  responsiveBorders : true,
  groupSelectable : false,
  hasControls : false,
  hasBorders : false,
  wholeCoordinates : true,
  stored: false,
  movementLimits: "#__0",
  eventListeners: {
    "dblclick": function () {
      this.remove();
    },
    "removed": function () {
      let i = this.canvas.guidlines.indexOf(this);
      this.canvas.guidlines.splice(i,1)
    },
    "modified": function () {
      if(this.x){
        this.x = this.left + this.width / 2;
      }
      if(this.y){
        this.y = this.top + this.height / 2;
      }
    },
    "added": function () {
      if (this.x) {
        this.height = this.canvas.height;
        this.width = Math.ceil(10 / this.canvas.viewportTransform[0]);
        if(this.width % 2){
          this.width++;
        }
        this.left = this.x - this.width /2;
      }
      if (this.y) {
        this.width = this.canvas.width;
        this.height = Math.ceil(10 / this.canvas.viewportTransform[0]);
        if(this.height % 2){
          this.height++;
        }
        this.top = this.y - this.height /2;
      }
      this.setCoords();
      if(this.canvas.guidlines){
        this.canvas.guidlines.push(this);
      }else{
        this.visible = false;
      }
    }
  },
  initialize: function(options){
    this.x = Math.round(options.x);
    this.y = Math.round(options.y);

    if(this.x){
      this.lockMovementY = true;
      this.hoverCursor = "ew-resize";
    }
    if(this.y){
      this.lockMovementX = true;
      this.hoverCursor = "ns-resize";
    }
  },
  render: function(ctx){
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#000000";
    if(this.x){
      ctx.translate(this.left + this.width / 2,0);
      ctx.scale(1 / this.canvas.getZoom(), 1 / this.canvas.getZoom());
      ctx.moveTo(0,0);
      ctx.lineTo(0,this.canvas.height);
    }
    if(this.y) {
      ctx.translate(0, this.top + this.height / 2);
      ctx.scale(1 / this.canvas.getZoom(), 1 / this.canvas.getZoom());
      ctx.moveTo(0, 0);
      ctx.lineTo(this.canvas.width, 0);
    }
    ctx.stroke();
    ctx.restore();
  }
});

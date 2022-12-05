fabric.Animation = fabric.util.createClass(fabric.Object, {
  type: 'animation',
  initialize: function(options,callback) {
    options || (options = { });
    this.createTmpCanvas();
    this.on("added",this.play.bind(this));
    this.on("removed",this.stop.bind(this));
    this.callSuper('initialize', options,callback);
  },
  stop(){
    clearInterval(this.animationInterval);
  },
  play(){
    this.animationInterval = setInterval(() => {
      this.animation.angle += this.animation.speed;
      this.animationFunction(this._ctx,this.animation);
      this.dirty = true;
      if(!this.canvas.animated){
        this.canvas.renderAll();
      }
    },40)
  },
  text: "Just a moment...",
  color: 'rgba(0, 255, 255, 1)',
  width: 50,
  height: 50,
  animation: {
    size: 5,
    angle: 0,
    speed: 0.3,
    fade: 0.5
  },
  animationFunction: function(ctx,o){
      ctx.beginPath();
      ctx.fade(o.fade);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(
        this.width / 2 +  Math.sin(o.angle) * (this.width/2 - o.size - 2),
        this.height / 2 + Math.cos(o.angle) * (this.height/2 - o.size - 2 ),
        o.size, 0, 2*Math.PI);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = this.color;
      ctx.stroke();
  },
  createTmpCanvas: function() {
    let el = this._element = fabric.util.createCanvasElement();
    el.width = this.width;
    el.height = this.height;
    this._ctx = el.getContext('2d');
    this._ctx.fade = function(fade){
      this.globalCompositeOperation = "copy";
      this.globalAlpha = 1 - fade;
      this.drawImage(el,0,0);
      this.globalAlpha = 1;
      this.globalCompositeOperation = "source-over";
    }
  },
  _render: function(ctx) {
    this.animationFunction(this._ctx,this.animation);
    var w = this.width, h = this.height, x = -w / 2, y = -h / 2;
    ctx.drawImage(this._element, 0, 0, w, h, x, y, w, h);
  }
});

fabric.Animation.fromObject = function (object,callback ) {
  return fabric.Object._fromObject('Animation', object, callback);
};

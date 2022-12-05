
/**
 * PathfinderBrush class
 * @class fabric.PathfinderBrush
 * @extends fabric.BaseBrush
 */
fabric.PathfinderBrush = fabric.util.createClass(fabric.BaseBrush, /** @lends fabric.PathfinderBrush.prototype */ {

  /**
   * Constructor
   * @param {fabric.Canvas} canvas
   * @return {fabric.PathfinderBrush} Instance of a pencil brush
   */
  initialize: function(canvas,pathfinder) {
    this.canvas = canvas;
    this.pathfinder = pathfinder;

    //this.pathfinder.setImage(this.canvas.backgroundImage._originalElement);
    //this._selection_canvas = fabric.util.createCanvasElement();
    //this.pathfinder.initCanvas(this._selection_canvas);


    this.canvas.on('viewport:translate', this._render.bind(this));
    this.canvas.on('viewport:scaled', this._render.bind(this));
    this.canvas.on('after:render', function(){

      if (this.pathfinder.mask) {
        var ctx = this.contextTop;
        var v = this.viewportTransform;
        ctx.save();
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        ctx.translate(this.pathfinder.target.left, this.pathfinder.target.top);
        ctx.drawImage(this.pathfinder.resultCanvas, 0, 0);
        ctx.restore();
      }
    });

    canvas.editor.fire('entity:created',{target : this})
  },

  disable: function() {

    if(this.interval){
      clearInterval(this.interval);
      delete this.interval;
    }

    this.canvas.clearContext(this.canvas.contextTop);
  },

  enable: function() {
    if(!this.pathfinder.mask)return;
    if(!this.interval){
      this.interval = setInterval(function(){
        this.pathfinder.hatchTick();
        this._render();
      }.bind(this),300);
    }

  },
  /**
   * Inovoked on mouse down
   * @param {Object} pointer
   */
  onMouseDown: function(pointer) {

    pointer.x -= this.pathfinder.target.left;
    pointer.y -= this.pathfinder.target.top;

    this.pathfinder._onMouseDown(pointer);


    //var _this = this;
    //var _onMove =  function(e){
    //  if(e.target !== _this.target){
    //    _this.onMouseMove(e);
    //  }
    //};
    //var _onUp =  function(e){
    //  _this.onMouseUp(e);
    //  fabric.util.removeListener(window, 'mousemove',_onMove);
    //  fabric.util.removeListener(window, 'mouseup',_onUp );
    //};
    //fabric.util.addListener(window, 'mousemove',_onMove);
    //fabric.util.addListener(window, 'mouseup',_onUp );


    this.enable();
    this._setBrushStyles();
    this._setShadow();
    this._render();
  },

  /**
   * Inovoked on mouse move
   * @param {Object} pointer
   */
  onMouseMove: function(pointer) {
    pointer.x -= this.pathfinder.target.left;
    pointer.y -= this.pathfinder.target.top;

    this.pathfinder._onMouseMove(pointer);

    // redraw curve
    // clear top canvas
    this.canvas.clearContext(this.canvas.contextTop);
    this._render();
  },

  /**
   * Invoked on mouse up
   */
  onMouseUp: function() {
    this.pathfinder.onMouseUp();
    this._render();
  },

  /**
   * Draw a smooth path on the topCanvas using quadraticCurveTo
   * @private
   */
  _render: function() {
    if(!this.pathfinder.target)return;
    var ctx  = this.canvas.contextTop,
      v = this.canvas.viewportTransform;
    this.canvas.clearContext(this.canvas.contextTop);

    ctx.save();
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
    ctx.translate(this.pathfinder.target.left,this.pathfinder.target.top);
    if(this.pathfinder.mask){
      ctx.drawImage(this.pathfinder.resultCanvas,0,0);
    }
    ctx.restore();

  }
});

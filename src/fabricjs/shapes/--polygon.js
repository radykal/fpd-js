/**
 * Shape Object library for FabricJS
 * allow to change the shape of the object
 *
 *
 * @example

 objs.push(new fabric.Shape({
            left:   350,
            top:    350,
            stroke:  "black",
            fill:    'blue',
            rx: 10,
            width: 100,
            height: 100,
            points:  [
                {"x":37,"y":0},
                {"x":98,"y":30},
                {"x":90,"y":87},
                {"x":20,"y":99},
                {"x":-1,"y":43}
            ]
        }));
 *
 * @author Denis Ponomarev
 * @email den.ponomarev@gmail.com
 */

//fabric.require("Shape",["ShapeMixin"], function() {
    fabric.Polygon = fabric.util.createClass(fabric.Object, {
        type: 'polygon',
        hasRotatePoint: false,

        points: [],
        pointsLimits: false,
        stateProperties: ["top", "left", "width", "height", "angle", "points"],

        initialize: function (options) {
          options || ( options = {});
          options.points = fabric.util.deepClone(options.points);

          this.callSuper('initialize', options);
          this._initPoints(options.points);
          this.setSize();
          this.on("added",function(){
            this.setCoords();
          })
        },
        setSize: function(){
          if(this.points.length == 0){
            this.left = 0;
            this.top = 0;
            this.width = 1;
            this.height = 1;
            return;
          }
          var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          for(var i in this.points){
            minX = Math.min(minX, this.points[i].x )
            maxX = Math.max(maxX, this.points[i].x )
            minY = Math.min(minY, this.points[i].y )
            maxY = Math.max(maxY, this.points[i].y )
          }
          this.left += minX;
          this.top  += minY;
          this.width = maxX - minX + 1;
          this.height = maxY - minY + 1;

          for(var i in this.points){
            this.points[i].x -= minX;
            this.points[i].y -= minY;
          }
        },
        setPoint: function (order, _point) {
            var _points = this.points || this._points;

          if(this.pointsLimits){

            _points[order].x = Math.max(0, Math.min(_point.x, this.width));
            _points[order].y = Math.max(0, Math.min(_point.y, this.height));
          }else{

            _points[order].x = _point.x;
            _points[order].y = _point.y;
          }
          this.setSize();
          this.canvas.renderAll();
        },
        /**
         * Draws corners of an object's bounding box.
         * Requires public properties: width, height
         * Requires public options: cornerSize, padding
         * @param {CanvasRenderingctx2D} ctx ctx to draw on
         * @return {fabric.Object} thisArg
         * @chainable
         */
        drawControls: function (ctx) {
          if (!this.hasControls) {
            return this;
          }
          if(this.hasBoundsControls){
            fabric.Object.prototype.drawControls.call(this, ctx);
          }

          this.drawShapeControls(ctx);
        },

        /**
         * Render Shape Object
         * @private
         * @param {CanvasRenderingctx2D} ctx ctx to render on
         */
        _render: function (ctx, noTransform) {

            var x = noTransform ? this.left : -this.width / 2,
                y = noTransform ? this.top : -this.height / 2;

            var _points = this.points || this._points;

            if (!_points || !_points.length)return;
            ctx.beginPath();
            ctx.moveTo(x + _points[0].x, y + _points[0].y);

            for (var i = 1; i < _points.length; i++) {
                ctx.lineTo(x + _points[i].x, y + _points[i].y);
            }
            ctx.closePath();

            this._renderFill(ctx);
            this._renderStroke(ctx);
            // this.drawShapeControls(ctx);
        }
    });
    fabric.Polygon.fromObject = function (object) {
        return new fabric.Polygon(object);
    };
    Object.assign(fabric.Polygon.prototype, fabric.ShapeMixin);
    fabric.util.createAccessors(fabric.Polygon);


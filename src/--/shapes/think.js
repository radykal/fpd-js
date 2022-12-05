/**
 * Bubble Object library for FabricJS
 *
 *
 *
 * @example
 nnew fabric.Bubble({
         left: 100,
         top: 100,
         width: 800,
         height: 600
     })
 *
 * @author Denis Ponomarev
 * @email den.ponomarev@gmail.com
 */
'use strict';

//fabric.require("Think",["ShapeMixin"], function() {
    fabric.Think = fabric.util.createClass(fabric.Rect, {
        type: 'think',
        stateProperties: fabric.Group.prototype.stateProperties.concat(["speechX", "speechY", "bubbleOffsetX", "bubbleOffsetY", "bubbleSize", "drawEllipse"]),
        speechX: 0,
        speechY: 0,
        bubbleOffsetX: 0,
        bubbleSize: 30,
        bubbleOffsetY: 0,
        drawEllipse: true,
        initialize: function (options) {
            options || ( options = {});

            this.callSuper('initialize', options);


            options.bubbleSize && this.set("bubbleSize", options.bubbleSize);
            options.drawEllipse && this.set("drawEllipse", options.drawEllipse);

            this.setPoint(0, {
                x: options.speechX || -25,
                y: options.speechY || 25
            });

            this._initPoints(options.points);
        },
        drawControls: function (ctx) {
          if (!this.hasControls) {
            return this;
          }
          fabric.Object.prototype.drawControls.call(this, ctx);

          this.drawShapeControls(ctx);
        },

        setPoint: function (order, _point) {

            if (!this._points)this._points = [];
            if (!this._points[order]) {
                this._points[order] = _point;
            }

            this.speechX = this._points[order].x = _point.x;
            this.speechY = this._points[order].y = _point.y;

            var _x = this.speechX - this.width / 2, _y = this.speechY - this.height / 2;
            this._hypo = Math.sqrt(Math.pow(_x, 2) + Math.pow(_y, 2));
            var _k = this.width / this.height;
            this._bubble_angle_sin = _x / this._hypo;
            this._bubble_angle_cos = _y / this._hypo;

            this._bubble_angle = Math.acos(this._bubble_angle_cos) * 180 / ( Math.PI);


            this._bubble_offset_x = Math.sqrt(Math.pow(this._bubble_angle_sin, 2));
            this._bubble_offset_y = Math.sqrt(Math.pow(this._bubble_angle_cos, 2));

            if (_x > 0) {
                this._bubble_angle = 360 - this._bubble_angle;
            } else {
                this._bubble_offset_x *= -1;
            }
            if (_y > 0) {
                this._bubble_angle_cos *= -1;
            } else {
                this._bubble_offset_y *= -1;
            }


            //console.log(this._bubble_angle,this._x_point,this._y_point)

        },
        /**
         * @private
         * @param {CanvasRenderingContext2D} ctx Context to render on
         */
        _render: function (ctx, noTransform) {
            //    this.callSuper('_render', ctx, noTransform);


            // optimize 1x1 case (used in spray brush)
            if (this.width === 1 && this.height === 1) {
                ctx.fillRect(0, 0, 1, 1);
                return;
            }

            var x = noTransform ? this.left : -this.width / 2,
                y = noTransform ? this.top : -this.height / 2;


            ctx.beginPath();


            if (this.drawEllipse) {
                ctx.ellipse(x + this.width / 2, y + this.height / 2, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI, false);
            }


            var a = {
                    x: x + this.width / 2 + this._bubble_offset_x * this.width / 2,
                    y: y + this._bubble_offset_y * this.height / 2 + this.height / 2
                },
                b = {
                    x: x + this.speechX,
                    y: y + this.speechY
                },
                c = {
                    x: a.x + (b.x - a.x) / 3 * 2,
                    y: a.y + (b.y - a.y) / 3 * 2
                },
                d = {
                    x: a.x + (b.x - a.x) / 4,
                    y: a.y + (b.y - a.y) / 4
                };

            //ctx.moveTo(a.x + 4, a.y);
            //ctx.arc(a.x,a.y, 4, 0, 2 * Math.PI, false);


            ctx.moveTo(c.x + 6, c.y);
            ctx.arc(c.x, c.y, 6, 0, 2 * Math.PI, false);

            ctx.moveTo(d.x + 8, d.y);
            ctx.arc(d.x, d.y, 8, 0, 2 * Math.PI, false);

            ctx.moveTo(b.x + 4, b.y);
            ctx.arc(b.x, b.y, 4, 0, 2 * Math.PI, false);


            ctx.closePath();

            this._renderFill(ctx);

            this._renderStroke(ctx);
        },
        /**
         * Returns object representation of an instance
         * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
         * @return {Object} object representation of an instance
         */
        toObject: function (propertiesToInclude) {
            var object = Object.assign(this.callSuper('toObject', propertiesToInclude), {
                speechX: this.get('speechX') || 0,
                speechY: this.get('speechY') || 0,
                bubbleOffsetX: this.get('bubbleOffsetX') || 0,
                bubbleOffsetY: this.get('bubbleOffsetY') || 0,
                bubbleSize: this.get('bubbleSize'),
                drawEllipse: this.get('drawEllipse')
            });
            if (!this.includeDefaultValues) {
                this._removeDefaultValues(object);
            }
            return object;
        }
    });
    fabric.Think.fromObject = function (object) {
        return new fabric.Think(object);
    };
    Object.assign(fabric.Think.prototype, fabric.ShapeMixin);

    fabric.util.createAccessors(fabric.Think);

    Object.assign(fabric.Think.prototype, fabric.ShapeMixin);
    fabric.util.createAccessors(fabric.Think);


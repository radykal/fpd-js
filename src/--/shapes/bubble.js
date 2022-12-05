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

//fabric.require("Bubble",["ShapeMixin"], function() {
  fabric.Bubble = fabric.util.createClass(fabric.Rect, {
    type: 'bubble',


    stateProperties: fabric.Group.prototype.stateProperties.concat(["speechX", "speechY", "bubbleOffsetX", "bubbleOffsetY", "bubbleSize"]),

    /**
     * speechPoint
     * @type Number
     * @default
     */
    speechX: 0,

    /**
     * speechPoint
     * @type Number
     * @default
     */
    speechY: 0,

    /**
     * distance between corner and bubble
     * @type Number
     * @default
     */
    bubbleOffsetX: 0,
    /**
     * distance between corner and bubble
     * @type Number
     * @default
     */
    bubbleSize: 30,


    width: 150,

    height: 100,


    text: {
      fontSize: 20,
      fontFamily: 'Comic Sans'
    },

    /**
     * distance between corner and bubble
     * @type Number
     * @default
     */
    bubbleOffsetY: 0,

    initialize: function (options) {
      options || ( options = {});

      this.callSuper('initialize', options);

      this.set("bubbleOffsetX", options.bubbleOffsetX || 0);
      this.set("bubbleOffsetY", options.bubbleOffsetY || 0);
      if (options.bubbleSize) {
        this.set("bubbleSize", options.bubbleSize);
      }
      this._initRxRy();

      this.setPoint(0, {
        x: options.speechX || -25,
        y: options.speechY || 25
      });


      this._initPoints(options.points);
    },

    setPoint: function (order, _point) {

      if (!this._points)this._points = [];
      if (!this._points[order]) {
        this._points[order] = _point;
      }


      //   1 | 2
      // 8   |   3
      //----------
      // 7   |   4
      //   6 | 5


      var w = 1 / 2, h = 1 / 2, x = _point.x / this.width, y = _point.y / this.height;

      if (x < w) {
        if (y < h) {
          this._bubble_part = x < y ? 8 : 1;
        } else {
          this._bubble_part = w - x < y - h ? 6 : 7;
        }
      } else {
        if (y < h) {
          this._bubble_part = w + w - x > y ? 2 : 3;
        } else {
          this._bubble_part = w - x < h - y ? 4 : 5;
        }
      }


      if (_point.x > 0 && _point.x < this.width) {
        if (_point.y > 0 && _point.y <= this.height / 2) {
          if (this._bubble_part == 1 || this._bubble_part == 2) {
            _point.y = 0;
          }
          if (this._bubble_part == 8) {
            _point.x = 0;
          }
          if (this._bubble_part == 3) {
            _point.x = this.width;
          }
        }
        if (_point.y < this.height && _point.y >= this.height / 2) {
          if (this._bubble_part == 5 || this._bubble_part == 6) {
            _point.y = this.height;
          }
          if (this._bubble_part == 7) {
            _point.x = 0;
          }
          if (this._bubble_part == 4) {
            _point.x = this.width;
          }
        }
      }
      this.speechX = this._points[order].x = _point.x;
      this.speechY = this._points[order].y = _point.y;
      this.canvas && this.canvas.renderAll();
    },
    /**
     * Initializes rx/ry attributes
     * @private
     */
    _initRxRy: fabric.Rect.prototype._initRxRy,
    drawControls: function (ctx) {
      if (!this.hasControls) {
        return this;
      }
      fabric.Object.prototype.drawControls.call(this, ctx);

      this.drawShapeControls(ctx);
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

      var rx = this.rx ? Math.min(this.rx, this.width / 2) : 0,
        ry = this.ry ? Math.min(this.ry, this.height / 2) : 0,
        w = this.width,
        h = this.height,
        x = noTransform ? this.left : -this.width / 2,
        y = noTransform ? this.top : -this.height / 2,
        isRounded = rx !== 0 || ry !== 0,
        k = 1 - 0.5522847498 /* "magic number" for bezier approximations of arcs (http://itc.ktu.lt/itc354/Riskus354.pdf) */;

      ctx.beginPath();

      ctx.moveTo(x + rx, y);


      var _ofX = Math.max(rx, rx + this.bubbleOffsetX || w / 6);
      var _ofY = Math.max(ry, ry + this.bubbleOffsetY || h / 6);

      var maxbubbleSize = w - _ofX * 2;
      var maxBubbleHeight = h - _ofY * 2;

      if (this._bubble_part == 1) {
        ctx.lineTo(x + _ofX, y);
        ctx.lineTo(x + this.speechX, y + this.speechY);
        ctx.lineTo(x + _ofX + Math.min(w - _ofX * 2, this.bubbleSize), y);
      }

      if (this._bubble_part == 2) {
        ctx.lineTo(x - _ofX + w - Math.min(maxbubbleSize, this.bubbleSize), y);
        ctx.lineTo(x + this.speechX, y + this.speechY);
        ctx.lineTo(x - _ofX + w, y);
      }

      ctx.lineTo(x + w - rx, y);
      isRounded && ctx.bezierCurveTo(x + w - k * rx, y, x + w, y + k * ry, x + w, y + ry);


      if (this._bubble_part == 3) {
        ctx.lineTo(x + w, y + _ofY);
        ctx.lineTo(x + this.speechX, y + this.speechY);
        ctx.lineTo(x + w, y + _ofY + Math.min(maxBubbleHeight, this.bubbleSize));
      }

      if (this._bubble_part == 4) {
        ctx.lineTo(x + w, y + h - _ofY - Math.min(maxBubbleHeight, this.bubbleSize));
        ctx.lineTo(x + this.speechX, y + this.speechY);
        ctx.lineTo(x + w, y + h - _ofY);
      }

      ctx.lineTo(x + w, y + h - ry);
      isRounded && ctx.bezierCurveTo(x + w, y + h - k * ry, x + w - k * rx, y + h, x + w - rx, y + h);


      if (this._bubble_part == 5) {
        ctx.lineTo(x + w - _ofX, y + h);
        ctx.lineTo(x + this.speechX, y + this.speechY);
        ctx.lineTo(x + w - _ofX - Math.min(w - _ofX * 2, this.bubbleSize), y + h);
      }

      if (this._bubble_part == 6) {
        ctx.lineTo(x + _ofX + Math.min(w - _ofX * 2, this.bubbleSize), y + h);
        ctx.lineTo(x + this.speechX, y + this.speechY);
        ctx.lineTo(x + _ofX, y + h);
      }


      ctx.lineTo(x + rx, y + h);
      isRounded && ctx.bezierCurveTo(x + k * rx, y + h, x, y + h - k * ry, x, y + h - ry);

      if (this._bubble_part == 7) {
        ctx.lineTo(x, y + h - _ofY);
        ctx.lineTo(x + this.speechX, y + this.speechY);
        ctx.lineTo(x, y + h - _ofY - Math.min(maxBubbleHeight, this.bubbleSize));
      }

      if (this._bubble_part == 8) {
        ctx.lineTo(x, y + _ofY + Math.min(maxBubbleHeight, this.bubbleSize));
        ctx.lineTo(x + this.speechX, y + this.speechY);
        ctx.lineTo(x, y + _ofY);
      }

      ctx.lineTo(x, y + ry);
      isRounded && ctx.bezierCurveTo(x, y + k * ry, x + k * rx, y, x + rx, y);


      //ctx.moveTo(x + this.speechX + 20, y + this.speechY);
      //ctx.arc(x + this.speechX , y + this.speechY, 20, 0, 2 * Math.PI, false);

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
        bubbleSize: this.get('bubbleSize') || 30
      });
      if (!this.includeDefaultValues) {
        this._removeDefaultValues(object);
      }
      return object;
    }
  });


  fabric.Bubble.fromObject = function (object) {
    return new fabric.Bubble(object);
  };

  Object.assign(fabric.Bubble.prototype, fabric.ShapeMixin);
  fabric.util.createAccessors(fabric.Bubble);

//});



//fabric.require("Speech",["ShapeMixin","TextAreaMixin"], function() {

    fabric.Speech = fabric.util.createClass(fabric.Group, {
        type: 'speech',

        initialize: function (options) {
            options || ( options = {});

            var _path = options.path;
            delete options.path;

            this.callSuper('initialize', [], options);


            this._initBubble(options);

            this._points = this.bubble && this.bubble._points;
            if (this._points) {
                this.setPoint(0, {
                    x: this.bubble.speechX || -25,
                    y: this.bubble.speechY || 25
                });
                this._initPoints(options.points);
            }

            this.set({
                centeredScaling: true,
                hasControls: true,
                lockScalingFlip: true
            });

            this._initText(options.text);
            this.on("dblclick", this._on_text_edit);

            this._initPath(_path);

            this.setWidth(Math.max(this.getMinWidth(), this.width));
            this.setHeight(Math.max(this.getMinHeight(), this.height));

            this.initMousedownHandler();


        },
        drawControls: function (ctx) {
          if (!this.hasControls) {
            return this;
          }
          fabric.Object.prototype.drawControls.call(this, ctx);

          this.drawShapeControls(ctx);
        },

      /**
         * @private
         */
        _onObjectAdded: function (object) {
            object.group = this;
            object._set('canvas', this.canvas);
        },
        _initPath: function (options) {
            if (options) {
                var path = new fabric.Path(options.path, options);
                this.setPath(path);
            }
        },
        setPath: function (path) {
            this.path = path;
            //    this.path = new fabric.Path(this._path, options);
            this.path.set({
                originX: "center",
                originY: "center",
                left: 0,
                top: 0,
                scaleX: this.width / this.path.width,
                scaleY: this.height / this.path.height
            });

            this.add(this.path);
            this.remove(this.text);
            this.add(this.text);
            this.updatePathStrokeWidth();
//����� ������ ���������� ��� ���������, �����  ���������
        },
        setPoint: function (order, _point) {
            fabric.Bubble.prototype.setPoint.call(this, order, _point);
            this.bubble.setPoint(order, _point);
        },
        _initBubble: function (options) {
            if (options.bubble) {


                fabric.util.createObject(options.bubble, function (element) {
                    this.bubble = element;
                    this.bubble.set({
                        width: this.width,
                        height: this.height,
                        originX: "center",
                        originY: "center"
                    });
                    this.add(this.bubble);
                }.bind(this));

            }
        },
        /**
         * Initializes "mousedown" event handler
         */
        initMousedownHandler: function () {
            //this.on('mousedown', function(options) {
            //    this.text.fire("mousedown",options);
            //});
        },
        updatePathStrokeWidth: function () {

            var _sc = Math.min(this.path.scaleY, this.path.scaleX)
            this.path.set("strokeWidth", 1 / _sc);
        },
        setHeight: function (h) {

            if (this.height && this.bubble && this.bubble.setPoint && this.bubble.speechY && this.bubble.speechY > this.height) {
                var _yoff = this.bubble.speechY - this.height;
            }

            this.height = h;
            if (this.bubble) {
                this.bubble.height = this.height;
            }
            if (this.path) {
                this.path.set({
                    scaleY: this.height / this.path.height
                });
                this.updatePathStrokeWidth();
            }

            if (_yoff !== undefined) {
                this.setPoint(0, {x: this.bubble.speechX, y: this.height + _yoff});
                this.canvas && this.canvas.renderAll();
            }
        },
        setWidth: function (w) {
            if (this.width && this.bubble && this.bubble.setPoint && this.bubble.speechX && this.bubble.speechX > this.width) {
                var _xoff = this.bubble.speechX - this.width;
            }
            this.width = w;
            if (this.bubble) {
                this.bubble.width = w;
            }
            if (this.path) {
                this.path.set({
                    scaleX: this.width / this.path.width
                });
                this.updatePathStrokeWidth();
            }
            if (_xoff !== undefined) {
                this.setPoint(0, {x: this.width + _xoff, y: this.bubble.speechY});
                this.canvas && this.canvas.renderAll();
            }
        },
        _set: function (key, value) {
            if (key == "width") {
                this.setWidth(value);
            } else if (key == "height") {
                this.setHeight(value);
            } else {
                this.callSuper('_set', key, value);
            }
            return this;
        },


        /**
         * Returns object representation of an instance
         * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
         * @return {Object} object representation of an instance
         */
        toObject: function (propertiesToInclude) {

            if (this.path) {
                var path = this.path.toObject();
                path.path = this.path.path.join(" ");
            }
            var object = Object.assign(fabric.Object.prototype.toObject.call(this, propertiesToInclude), {
                bubble: this.bubble && this.bubble.toObject() || null,
                path: path || null,
                text: this.text && this.text.toObject() || null
            });
            if (!this.includeDefaultValues) {
                this._removeDefaultValues(object);
            }
            return object;
        },
        setObjectScale: fabric.util.resizeOnScaling,
        lockScalingY: false,
        lockScalingX: false,
        _setupCurrentTransform: function (e) {
            this.canvas.callSuper('_setupCurrentTransform', e, this);
            this.canvas._currentTransform.original.height = this.height;
            this.canvas._currentTransform.original.width = this.width;
        },
        textPaddingX: 25,
        textPaddingY: 15
    });

    Object.assign(fabric.Speech.prototype, fabric.ShapeMixin);
    Object.assign(fabric.Speech.prototype, fabric.TextAreaMixin);
    fabric.util.createAccessors(fabric.Speech);

    fabric.Speech.fromObject = function (object) {
        return new fabric.Speech(object);
    };


if ( fabric.objectsLibrary) {
  Object.assign(fabric.objectsLibrary, {
    speech2: {
      title: "Rect Speech",
      "type": "Speech",
      "width": function (w, h) {
        return w - 40
      },
      "height": function (w, h) {
        return h - 40
      },
      "bubble": {
        "type": "rect",
        "opacity": 0.5,
        "stroke": "black",
        "strokeWidth": 5,
        "fill": "blue",
        "rx": 20,
        "ry": 20,
        "bubbleSize": 20,
        "bubbleOffsetX": 0,
        "bubbleOffsetY": 5,
        "speechX": 23,
        "speechY": 66
      },
      "text": {
        "fontSize": 10,
        "fontFamily": "Comic Sans",
        "text": "Rect\nSpeech"
      }
    },
    speech3: {
      title: "Bubble Speech",
      "type": "Speech",
      "width": function (w, h) {
        return w - 40
      },
      "height": function (w, h) {
        return h - 40
      },
      "bubble": {
        "type": "bubble",
        "opacity": 0.5,
        "stroke": "black",
        "strokeWidth": 5,
        "fill": "blue",
        "rx": 20,
        "ry": 20,
        "bubbleSize": 20,
        "bubbleOffsetX": 0,
        "bubbleOffsetY": 5,
        "speechX": 23,
        "speechY": 66
      },
      "text": {
        "fontSize": 10,
        "fontFamily": "Comic Sans",
        "text": "I'm Bubble\nSpeech"
      }
    },
    speech4: {
      title: "Think Speech",
      "type": "Speech",
      "left": 450,
      "top": 460,
      "bubble": {
        "type": "think",
        "stroke": "black",
        "fill": "white",
        "drawEllipse": false,
        "speechX": 9,
        "speechY": 133
      },
      "path": {
        "path": "m581.077942,2.537359c-2.053223,0.047071 -4.04071,0.188348 -6.108093,0.352907c-33.05542,2.663918 -62.235901,19.640541 -77.057678,44.925953l-7.8573,19.135319c1.698822,-6.633144 4.302979,-13.065384 7.8573,-19.135319c-26.430695,-22.16293 -63.531677,-32.388445 -100.192383,-27.574373c-36.661469,4.788353 -68.503082,24.041758 -85.901978,51.935225c-49.116486,-24.490013 -110.34288,-22.999454 -157.711807,3.860092c-47.369164,26.86068 -72.61673,74.40551 -64.941162,122.38308l5.021355,19.49968c-2.263329,-6.38501 -3.960793,-12.887695 -5.021355,-19.49968l-0.761948,1.798569c-41.179165,3.625244 -74.945375,29.465134 -83.716398,64.059235c-8.771805,34.597748 9.46701,70.085876 45.185621,87.96701l55.776558,10.973114c-19.480217,1.291962 -38.915543,-2.534515 -55.776558,-10.973114c-27.5478,24.96817 -33.888516,61.935303 -15.71492,92.467834c18.173733,30.524719 56.988899,48.110687 97.030457,44.11734l24.339722,-5.21109c-7.827499,2.651611 -15.960983,4.379059 -24.339722,5.21109c22.730042,33.857269 60.428192,58.556244 104.66893,68.383514c44.2491,9.81366 91.240952,4.014771 130.425949,-16.094604c31.96701,40.793823 88.707642,62.217468 145.596313,54.99707c56.902466,-7.219666 103.833984,-41.81427 120.501343,-88.770996l5.781433,-26.239532c-0.863708,8.909546 -2.742249,17.681366 -5.781433,26.239532c39.133301,20.753662 88.353333,21.927307 128.785095,3.049316c40.439819,-18.874084 65.665771,-54.869049 66.036133,-94.078247l-14.495605,-58.580597l-57.105713,-39.630768c44.163452,22.374573 71.992615,56.467255 71.601318,98.211365c52.49707,0.448181 97.103394,-35.956573 117.112427,-77.726288c20.011597,-41.769836 12.443604,-89.396759 -19.864929,-125.164642c13.401184,-26.637695 12.609985,-56.937332 -2.183472,-83.034088c-14.786194,-26.097893 -42.065491,-45.476891 -74.873047,-53.098335c-7.341431,-34.580929 -37.602661,-62.404482 -77.600708,-71.526293c-39.998474,-9.121368 -82.584839,2.123992 -109.364807,28.926123l-16.258179,22.19817c4.157959,-8.018612 9.583923,-15.495213 16.258179,-22.19817c-18.876953,-21.060713 -48.486023,-32.954061 -79.348938,-32.155401l0,0z",
        "stroke": "black",
        "fill": "white"
      },
      "text": {
        "fontSize": 20,
        "fontFamily": "Comic Sans",
        "text": "I'm Think\nSpeech"
      },
      "width": 150,
      "height": 100
    }
  })
}

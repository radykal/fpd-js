// require("./../canvas/areas");


import {getProportions} from "../../util/size.js";

fabric.StaticCanvas.MOVEMENT_LIMIT_MODE_OPIONS  = {
  CONTAIN: "contain",
  /**
   * хотя бы  пиксель объекта должен быть внутри зоны
   */
  CONTENT: "content",
  /**
   * зона должно полностью находится внутри объекта
   */
  FIT: "fit"
};


export const FmTransformations = {
  name: "transformations",
  prototypes: {
    Object: {
      widthStep: 2,
      heightStep: 2,
      setRoundCoordinates: function(val){
        this.roundCoordinates = val;
        this.on("added modified",() => {
          if(this.roundCoordinates){

            //todo should keep strokeWidth in mind.
            this.set({
              left: Math.round(this.left),
              top: Math.round(this.top),
              width: this.width - (this.width % this.widthStep),
              height: this.height - (this.height % this.heightStep),
            })

            let tDims = this._getTransformedDimensions()

            if(tDims.x % 2 || tDims.y % 2){
              let nDims = this._getNonTransformedDimensions()

              if(tDims.x % 2 < 1){
                tDims.x += - tDims.x % 2
              }
              else{
                tDims.x += - tDims.x % 2 + 2
              }
              if(tDims.y % 2 < 1){
                tDims.y += - tDims.y % 2
              }
              else{
                tDims.y += - tDims.y % 2 + 2
              }

              this.set({
                scaleX: tDims.x / nDims.x,
                scaleY: tDims.y / nDims.y
              })
            }
          }
        })
      },
      movementLimits: null,
      getMovementLimits() {
        return this.movementLimits ? (this.movementLimits.id ? '#' + this.movementLimits.id : this.movementLimits) : null;
      },
      setResizable(val) {
        this.resizable = val;
        // if (val === true) {
        //   // if (this.scaleX !== 1) {
        //   //   this.width *= this.scaleX;
        //   //   this.scaleX = 1;
        //   // }
        //   // if (this.scaleY !== 1) {
        //   //   this.height *= this.scaleY;
        //   //   this.scaleY = 1;
        //   // }
        // }
      },
      setMovementLimits(val) {
        if (!this.movementLimits) {
          if (this.canvas && !this.canvas.interactive) return;
          this.on({
            added() {
              if (this.canvas.interactive) {
                this.canvas._check_object_position(this);
              }
            },
            rotated(event) {
              return false;

              if (this.resizable) {
                if (pos.left !== undefined) {
                  if (this.left < pos.left) {
                    this.width += this.left - pos.left;
                    this.left = pos.left;
                  } else {
                    this.width -= this.left - pos.left;
                  }
                }
                if (pos.top !== undefined) {
                  if (this.top < pos.top) {
                    this.height += this.top - pos.top;
                    this.top = pos.top;
                  } else {
                    this.height -= this.top - pos.top;
                  }
                }
              }
              this.canvas._check_object_position(this)
            },
            modified(event) {
              this.canvas && this.canvas._check_object_after_modified(this)
            }
          });
        }
        this.movementLimits = val;
      }
    },
    StaticCanvas: {
      /**
       * Объекты могут двигаться только внутри этого прямоугольника
       */
      offsets: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      },
      /**
       * на сколько пикселей объекты должны оставаться в зоне передвижения.
       */
      contentOffsets: 5,
      /**
       * @type fabric.StaticCanvas.MOVEMENT_LIMIT_MODE_OPIONS
       */
      movementLimitMode: "contain",
      fitObject(el) {
        let _rect, maxSize, o = this.offsets;

        if (!el.movementLimits || el.movementLimits === "canvas") {
          let _zoom = this.getZoom();
          let _w = this.originalWidth || this.width / _zoom;
          let _h = this.originalHeight || this.height / _zoom;
          _rect = {
            width: o ? (_w - o.left - o.right) : _w,
            height: o ? (_h - o.top - o.bottom) : _h
          };
          /* offsets = {
					 left: o && o.top ||0 ,
					 top:  o &&  o.left ||0
					 }*/
        } else if (el.movementLimits.constructor !== Function) {
          let lim = el.movementLimits;
          _rect = {
            left: lim.left * lim.scaleX,
            width: lim.width * lim.scaleX,
            top: lim.top * lim.scaleY,
            height: lim.height * lim.scaleY
          }
          //maxSize = _rect;
          //offsets = lim;
        }
        maxSize = {
          width: _rect.width * this.fitIndex,
          height: _rect.height * this.fitIndex
        }
        let size = getProportions(el, maxSize, 'contain');

        if (el.resizable) {
          el.setOptions({
            width: el.width * size.scaleX,
            height: el.height * size.scaleY
          });
          // el.updateElement();
        } else {
          el.setOptions({
            scaleX: size.scaleX,
            scaleY: size.scaleY
          });
        }
        this.centerObject(el);
        el.setCoords();
        this.fire("scaling");
      },
      _getMovementsLimitsCenter(movementLimits) {
        let o = this._getMovementsLimitsRect(movementLimits);
        return {top: o.top + (o.height - o.top - o.bottom) / 2, left: o.left + (o.width - o.left - o.right) / 2};
      },
      //fix getcenter function
      centerObject(object, axis) {
        let center;
        if (object.movementLimits) {
          center = this._getMovementsLimitsCenter(object.movementLimits);
        } else {
          center = this.getCenter();
        }
        let prev = {
          top: object.top,
          left: object.left
        };
        this._centerObject(object, new fabric.Point(center.left, center.top));

        if (axis === "y") {
          object.left = prev.left;
        }
        if (axis === "x") {
          object.top = prev.top;
        }
        this.renderAll();
        return this;
      },
      getCenter() {
        return {
          top: this.originalHeight || this.height / 2 / this.getZoom(),
          left: this.originalWidth || this.width / 2 / this.getZoom()
        };
      },
      /**
       * @param movementLimits
       * @returns {*}
       * @private
       */
      _getMovementsLimitsRect(movementLimits, absolute) {
        if (!movementLimits) {
          return false;
        }

        let o = this.offsets;
        let _w = this.originalWidth || this.width;
        let _h = this.originalHeight || this.height;

        if (movementLimits.constructor === Object) {
          return movementLimits;
        }

        let scale = this.viewportTransform[0];

        if (movementLimits === 'offsets') {

          let rect = {
            left: o.left,
            top: o.top,
            width: _w - o.left - o.right,
            height: _h - o.top - o.bottom,
            right: o.right,
            bottom: o.bottom
          };

          if (!absolute) {
            rect.left *= scale;
            rect.top *= scale;
            rect.right *= scale;
            rect.bottom *= scale;
            rect.width *= scale;
            rect.height *= scale;
          }
          return rect;
        }
        if (movementLimits === 'canvas') {

          let rect = {
            left: 0,
            top: 0,
            width: _w,
            height: _h,
            right: 0,
            bottom: 0
          };

          if (!absolute) {
            rect.width *= scale;
            rect.height *= scale;
          }
          return rect;
        }

        let obj;
        if (movementLimits.constructor === String) {
          obj = this.getObjectByID(movementLimits.substr(1));
          if (!obj) {
            return false;
          }
        } else {
          obj = movementLimits
        }

        let _stroke_width = obj.strokeWidth;
        obj.strokeWidth = 0;

        obj.setCoords();
        let rect = obj.getBoundingRect();

        obj.strokeWidth = _stroke_width;

        rect.left /= scale;
        rect.top /= scale;
        rect.width /= scale;
        rect.height /= scale;
        rect.left -= this.viewportTransform[4] / scale;
        rect.top -= this.viewportTransform[5] / scale;

        //rect.left   += sw /2;
        //rect.top    += sw /2;
        //rect.width  -= sw;
        //rect.height -= sw;

        rect.right = _w - (rect.left + rect.width);
        rect.bottom = _h - (rect.top + rect.height);

        return rect;
      },
      /**
       *
       * movementLimits
       * ┌─────────────────┐
       * |              |
       * |              |
       * |        obj   |
       * |              |
       * |              |
       * |              |
       * |              |
       * └────────────────┘
       */
      getFixedPosition(target, x, y) {

        let _translatedX = 0,
            _translatedY = 0,
            _w = this.originalWidth || this.width,
            _h = this.originalHeight || this.height,
            scale = this.viewportTransform[0];

        if (this._currentTransform) {
          _translatedX = x - this._currentTransform.lastX;
          _translatedY = y - this._currentTransform.lastY;
        }

        // console.log(_translatedX,_translatedY);

        if (x === undefined) {
          x = target.left;
        }
        if (y === undefined) {
          y = target.top;
        }
        // target.setCoords();
        // let bounds = target.getBoundingRect();

        let brect = this._currentTransform && this._currentTransform.boundingRect || target.getBoundingRect();
        let bounds = {
          left: (brect.left + _translatedX - this.viewportTransform[4]) / scale,
          top: (brect.top + _translatedY - this.viewportTransform[5]) / scale,
          width: brect.width / scale,
          height: brect.height / scale
        };

        // bounds.left -= this.viewportTransform[4] / scale;
        // bounds.top -= this.viewportTransform[5] / scale;
        bounds.right = _w - (bounds.left + bounds.width);
        bounds.bottom = _h - (bounds.top + bounds.height);

        let limits = this._currentTransform && this._currentTransform.movementLimits;
        if (!limits) {
          return {};
        }
        if (this._currentTransform.action !== "drag") {
          return {};
        }
        // let limits = rect || this.movementLimits;

        let newPos = {},
            _l = limits.left,
            _r = limits.right,
            _t = limits.top,
            _b = limits.bottom;

        if (target.movementLimitMode === "content") {
          _l -= bounds.width - this.contentOffsets;
          _r -= bounds.width - this.contentOffsets;
          _t -= bounds.height - this.contentOffsets;
          _b -= bounds.height - this.contentOffsets;
        }

        if (target.movementLimitMode === "contain" && !target.resizable) {
          if (_l !== false && _r !== false) {
            _w = _w - _l - _r;
            if (bounds.width > _w) {
              let _asp = _w / bounds.width;
              newPos.scaleX = _asp;
              newPos.scaleY = _asp;
            }
          }

          if (_t !== false && _b !== false) {
            _h = _h - _t - _b;
            if (bounds.height > _h) {
              let _asp = _h / bounds.height;
              target.scaleX *= _asp;
              target.scaleY *= _asp;
            }
          }
        }

        if (target.movementLimitMode === "contain" || target.movementLimitMode === "content") {

          if (_l !== false) {
            let _diff = _l - bounds.left;
            if (_diff > 0) {
              newPos.left = x + _diff;
            }
          }

          if (!newPos.left && _r !== false) {
            let _diff = _r - bounds.right;
            if (_diff > 0) {
              newPos.left = x - _diff;
            }
          }

          if (_t !== false) {
            let _diff = _t - bounds.top;
            if (_diff > 0) {
              newPos.top = y + _diff;
            }
          }

          if (!newPos.top && _b !== false) {
            let _diff = _b - bounds.bottom;
            if (_diff > 0) {
              newPos.top = y - _diff;
            }
          }

        }

        return newPos;
      },

      /**
       * Sets the position of the object taking into consideration the object's origin
       * @param {fabric.Point} pos The new position of the object
       * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
       * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
       * @return {void}
       */
      setPositionByOrigin(pos, originX, originY) {
        let center = this.translateToCenterPoint(pos, originX, originY),
            position = this.translateToOriginPoint(center, this.originX, this.originY);

        // if (this.wholeCoordinates) {
        //   position.x = Math.round(position.x);
        //   position.y = Math.round(position.y);
        // }
        this.set('left', position.x);
        this.set('top', position.y);
      }
    },
    Canvas: {
      _scaleObject_overwritten: fabric.Canvas.prototype._scaleObject,
      _translateObject_overwritten: fabric.Canvas.prototype._translateObject,
      _beforeScaleTransform_overwritten: fabric.Canvas.prototype._beforeScaleTransform,
      _beforeTransform_overwritten: fabric.Canvas.prototype._beforeTransform,
      _restoreOriginXYNative: fabric.Canvas.prototype._restoreOriginXY,
      _setupCurrentTransform_transformations_overwritten: fabric.Canvas.prototype._setupCurrentTransform,
      _beforeScaleTransform(e, transform) {
        this._beforeScaleTransform_overwritten(e, transform);
        if (!this._currentTransform.original.oCoords) {
          this._currentTransform.original.oCoords = fabric.util.object.clone(this._currentTransform.target.oCoords,true);
        }
      },
      _setupCurrentTransform(e, target, alreadySelected) {
        if (!target) return;
        this._setupCurrentTransform_transformations_overwritten(e, target, alreadySelected);
        if (target.resizable) {
          this._currentTransform.original.height = target.height;
          this._currentTransform.original.width = target.width;
        }
        this._currentTransform.boundingRect = target.getBoundingRect();
        this._currentTransform.movementLimits = this._getMovementsLimitsRect(target.movementLimits);
      },
      /**
       * функцию можно вызвать с евентом  'after:render'. Позволяет отображать вычисления пересечений изменяемого объекта с рамкой. выделяет красными лиинияи
       * @private
       * @example
       *  eventListeners : {
    Canvas: {
      'before:render'(){
        this.clearContext(this.contextTop);
      },
      'after:render'(){
        this._debug_intersections()
      }
    }
  }
       */
      drawInterestionLines() {
        let tr = this._currentTransform;
        if (tr && tr._intersections) {
          let ctx = this.contextTop;
          ctx.beginPath();
          ctx.strokeStyle = "red";
          for (let i in tr._intersections) {
            let _coord = tr._intersections[i];
            ctx.moveTo(_coord.x + 5, _coord.y);
            ctx.arc(_coord.x, _coord.y, 5, 0, 2 * Math.PI);
          }
          for (let i in tr.lines) {
            let _l = tr.lines[i];
            ctx.moveTo(_l[0].x, _l[0].y);
            ctx.lineTo(_l[1].x, _l[1].y);
          }
          for (let i in tr.mlLines) {
            let _l = tr.mlLines[i];
            ctx.moveTo(_l[0].x, _l[0].y);
            ctx.lineTo(_l[1].x, _l[1].y);
          }
          ctx.stroke();
        }
      },
      getMovementLimitsCoords(ml) {
        let _scale = this.getZoom();

        if (ml === this) {
          let _w = this.originalWidth || this.width;
          let _h = this.originalHeight || this.height;
          let _l = this.viewportTransform[4];
          let _t = this.viewportTransform[5];
          _w *= _scale;
          _h *= _scale;
          return {
            tl: {x: _l, y: _t},
            tr: {x: _l + _w, y: _t},
            bl: {x: _l, y: _t + _h},
            br: {x: _l + _w, y: _t + _h}
          }
        } else {
          ml.setCoords();
          return ml.oCoords;
        }
      },
      // _scaleObjectEasy (x, y, by) {
      //   //this._scaleObject_overwritten( x, y, by);
      //   let tr = this._currentTransform,
      //     target = tr.target,
      //     corner = tr.corner;
      //   if(!target.movementLimits){
      //     return this._scaleObject_overwritten( x,y, by);
      //   }
      //
      //
      //   if (target.movementLimitMode !== 'contain')return;
      //   x = Math.min(target.movementLimits.width, Math.max(0,x));
      //   y = Math.min(target.movementLimits.height, Math.max(0,y));
      //   this._scaleObject_overwritten( x,y, by);
      // },
      /**
       * Scales object by invoking its scaleX/scaleY methods
       * @private
       * @param {Number} x pointer's x coordinate
       * @param {Number} y pointer's y coordinate
       * @param {String} by Either 'x' or 'y' - specifies dimension constraint by which to scale an object.
       *                    When not provided, an object is scaled by both dimensions equally
       */
      _scaleObject: function (x, y, by) {
        let _scaled = this._scaleObject_overwritten(x, y, by);

        let tr = this._currentTransform,
            target = tr.target,
            corner = tr.corner;
        let _v = this.viewportTransform;

        if (!target.movementLimits || target.movementLimitMode !== "contain") {
          return _scaled;
        }
        target.setCoords();

        let _scale = this.getZoom();
        let _rc = this.getMovementLimitsCoords(target.movementLimits);

        if (!tr.pointerOffset) {
          tr.pointerOffset = {
            x: x * _v[0] - target.oCoords[corner].x,
            y: y * _v[3] - target.oCoords[corner].y
          };

          tr.pointCenter = target.getCenterPoint();
          tr.pointCenter.x *= _scale;
          tr.pointCenter.y *= _scale;
          tr.pointOriginal = tr.original.oCoords[corner];
        }

        tr.pointTranformed = target.oCoords[corner];

        tr.mlLines = [];
        tr.lines = [];

        function _intersection(corner, coordinate) {
          let _oc;
          if (coordinate === "x" && corner[0] !== "m") {
            _oc = tr.original.oCoords["m" + corner[0]];
          } else if (coordinate === "y" && corner[0] !== "m") {
            _oc = tr.original.oCoords["m" + corner[1]];
          } else {
            _oc = tr.pointCenter;
            _oc = {
              x: _oc.x + _v[4],
              y: _oc.y + _v[5]
            };
          }
          let _tc = target.oCoords[corner];

          tr.lines.push([_oc, _tc]);
          tr.mlLines.push([_rc.tl, _rc.tr]);
          tr.mlLines.push([_rc.tr, _rc.br]);
          tr.mlLines.push([_rc.br, _rc.bl]);
          tr.mlLines.push([_rc.bl, _rc.tl]);

          let inters = fabric.Intersection.intersectSegmentPolygon(_oc, _tc, [_rc.tl, _rc.tr, _rc.br, _rc.bl]);
          if (!inters.points.length) {
            return;
          }
          inters.points[0].coordinate = coordinate;
          tr._intersections.push(inters.points[0])

//         if (coordinate) {
//           let p1 = inters.points[0];

//           let corner2;
//           if (coordinate === "x") {
//             corner2 = (corner[0] === "t" ? "b" : "t") + corner[1];
//           } else {
//             corner2 = corner[0] + (corner[1] === "l" ? "r" : "l");
//           }
//           let _p2 = target.oCoords[corner2];
//           let _diff = {x: _tc.x - p1.x, y: _tc.y - p1.y};

//           let p2 = {
//             x: _p2.x - _diff.x,
//             y: _p2.y - _diff.y
//           };

//           let its = fabric.Intersection.intersectSegmentSegment(tr.pointCenter, tr.pointTranformed, p1, p2);
//           if (!its.points[0]) {
//             return;
//           }
//           tr._intersections.push(its.points[0]);
//         } else {
//           tr._intersections.push(inters.points[0]);
//         }


          //
          //if(inters.points.length){
          //  this._scaleObject_overwritten( inters.points[0].x,  inters.points[0].y, by);
          //  target.setCoords();
          //}else{
          //  this._scaleObject_overwritten( x, y, by);
          //}
        }


        tr._intersection = null;
        tr._intersections = [];
        switch (corner) {
          case "tl":
            _intersection("tl");
            _intersection("bl", "x");
            _intersection("tr", "y");
            break;
          case "tr":
            _intersection("tr");
            _intersection("tl", "y");
            _intersection("br", "x");
            break;
          case "br":
            _intersection("br");
            _intersection("tr", "x");
            _intersection("bl", "y");
            break;
          case "bl":
            _intersection("bl");
            _intersection("tl", "x");
            _intersection("br", "y");
            break;
          case "mt":
            _intersection("mt");
            _intersection("tl", "y");
            _intersection("tr", "y");
            break;
          case "mb":
            _intersection("mb");
            _intersection("bl", "y");
            _intersection("br", "y");
            break;
          case "mr":
            _intersection("mr");
            _intersection("tr", "x");
            _intersection("br", "x");
            break;
          case "ml":
            _intersection("ml");
            _intersection("tl", "x");
            _intersection("bl", "x");
        }

        if (!tr._intersections.length) {
          return _scaled;
        }

        let _newXY = tr._intersections[0];
        let _l = tr._intersections[0].distanceFrom(tr.pointOriginal);

        for (let i = 1; i < tr._intersections.length; i++) {
          let _l2 = tr._intersections[i].distanceFrom(tr.pointOriginal);
          if (_l2 < _l) {
            _newXY = tr._intersections[i];
            _l = _l2;
          }
        }
        tr._intersection = _newXY;


        if (by === "equally") {
          //by = false;

          let _diff2 = {x: _newXY.x - tr.pointCenter.x, y: _newXY.y - tr.pointCenter.y};
          let _l = Math.sqrt(_diff2.x * _diff2.x + _diff2.y * _diff2.y);

          _newXY.x -= _diff2.x / _l * target.strokeWidth;
          _newXY.y -= _diff2.y / _l * target.strokeWidth;
          // scrt(x*x + y*y) = atrokewidth
          let a = 1;
        }
        //return this._scaleObject_overwritten( x, y, by);
        let __x = (_newXY.x + tr.pointerOffset.x) / _v[0];
        let __y = (_newXY.y + tr.pointerOffset.y) / _v[3];
        return this._scaleObject_overwritten(__x, __y, by);

        //
        //if (corner === "br" || corner === "tr" || corner === "mr") {
        //  if (x < target.movementXMaxLimit) {
        //    x = target.movementXMaxLimit;
        //  }
        //}
        //if (corner === "bl" || corner === "tl" || corner === "ml") {
        //  if (x > target.movementXMinLimit) {
        //    x = target.movementXMinLimit;
        //  }
        //}
        //if (corner === "bl" || corner === "br" || corner === "mb") {
        //  if (y < target.movementYMaxLimit) {
        //    y = target.movementYMaxLimit;
        //  }
        //}
        //if (corner === "tl" || corner === "tr" || corner === "mt") {
        //  if (y > target.movementYMinLimit) {
        //    y = target.movementYMinLimit;
        //  }
        //}
        //
        //this._scaleObject_overwritten( x, y, by);
      },
      movementLimitsOnAddAction: 'translate',
      _check_object_after_modified(target) {
        if (!this._currentTransform) {
          return;
        }
        let pos = this.getFixedPosition(target, target.left, target.top);
        switch (this._currentTransform.corner) {
          case "mtr":
            if (pos.left !== undefined) {
              target.set('left', pos.left);
            }
            if (pos.top) {
              target.set('top', pos.top);
            }
            break;
          case "mr":
          case "br":
            let _ldiff, _tdiff;
            if (pos.left !== undefined) {
              _ldiff = target.left - pos.left;

            }
            if (pos.top !== undefined) {
              _tdiff = target.top - pos.top;
            }

            if (_ldiff && (!_tdiff || Math.abs(_ldiff) > Math.abs(_tdiff))) {
              if (_ldiff < 0) {
                target.width += _ldiff;
              } else {
                target.width -= _ldiff;
              }
            } else if (_tdiff) {
              if (_tdiff < 0) {
                target.width += _tdiff;
              } else {
                target.width -= _tdiff;
              }
            }
        }
      },
      _check_object_position(target) {

        let pos = this.getFixedPosition(target, target.left, target.top);
        if (this.movementLimitsOnAddAction === 'translate') {
          if (pos.left !== undefined) {
            target.set('left', pos.left);
          }
          if (pos.top !== undefined) {
            target.set('top', pos.top);
          }
        } else {

          if (pos.left !== undefined) {
            if (target.left < pos.left) {
              target.width += target.left - pos.left;
              target.left = pos.left;
            } else {
              target.width -= target.left - pos.left;
            }
          }
          if (pos.top !== undefined) {
            if (target.top < pos.top) {
              target.height += target.top - pos.top;
              target.top = pos.top;
            } else {
              target.height -= target.top - pos.top;
            }
          }
        }


        if (pos.scaleX) {
          target.scaleX = target.scaleX *= pos.scaleX;
        }
        if (pos.scaleY) {
          target.scaleY = target.scaleY *= pos.scaleY;
        }

        target.setCoords();

        this.renderAll();
        // if(target.wholeCoordinates){
        //   target.top = Math.round(target.top);
        //   target.left = Math.round(target.left);
        //   target.height = Math.round(target.height);
        //   target.width = Math.round(target.width);
        // }
      },
      _translateObject(x, y, limits) {
        let target = this._currentTransform.target;
        if (target.beforeTranslate) {
          let _point = target.beforeTranslate(x, y);
          if (!_point) return false;
          x = _point.x;
          y = _point.y;
        }
        let _translated = this._translateObject_overwritten(x, y, limits);

        if (this._currentTransform.movementLimits) {
          let pos = this.getFixedPosition(target, x, y);
          if (pos.scaleX) {
            target.scaleX = this._currentTransform.scaleX *= pos.scaleX;
          }
          if (pos.scaleY) {
            target.scaleY = this._currentTransform.scaleY *= pos.scaleY;
          }
          if (pos.top !== undefined || pos.left !== undefined) {
            _translated = this._translateObject_overwritten(
                pos.left !== undefined ? pos.left : x,
                pos.top !== undefined ? pos.top : y);
          }
          return _translated || pos.scaleX || pos.scaleY;
        }
        return _translated;


        /* if (!target.get('lockMovementX')) {
				 let _val = x - this._currentTransform.offsetX;

				 //left offset
				 let lim = this.movementLimits.minX.constructor === Number ? this.movementLimits.minX : -bounds.width + 1;
				 if(target.movementXMinLimit && target.movementXMinLimit.constructor === Number && target.movementXMinLimit > lim ){
				 lim = target.movementXMinLimit ;
				 }

				 _val = Math.min(lim, _val);

				 //right offset
				 let lim = this.movementLimits.maxX.constructor === Number ? this.movementLimits.maxX : this.width + bounds.width - 1;
				 if(target.movementXMaxLimit && target.movementXMaxLimit.constructor === Number && target.movementXMaxLimit > lim ){
				 lim = target.movementXMaxLimit ;
				 }
				 _val = Math.max(lim  - target.width * target.scaleX, _val);
				 target.set('left', _val);
				 }
				 if (!target.get('lockMovementY')) {
				 let _val = y - this._currentTransform.offsetY;
				 if(target.movementYMinLimit !== undefined)
				 _val = Math.min(target.movementYMinLimit, _val);
				 if(target.movementYMaxLimit !== undefined)
				 _val = Math.max(target.movementYMaxLimit  - target.height, _val);

				 target.set('top', _val);
				 }
				 */
        //movementLimits ={
        //    xmin: 0,
        //    xmax: 0,
        //    ymin: 0,
        //    ymax: 0
        //};
      },

      // _beforeTransform(e, target) {
      //   target && target._beforeTransform ?
      //     target._beforeTransform(e) :
      //     this._beforeTransform_overwritten(e, target);
      // },
      /**
       * @private
       */
      _beforeTransform: function(e) {
        var t = this._currentTransform;

        this.fire('before:transform', {e: e, transform: t,});
        // determine if it's a drag or rotate case
        if (t.corner) {
          this.stateful && t.target.saveStates(["scaleX","scaleY","width","height","angle","skewX","skewY"]);
          // this.onBeforeScaleRotate(t.target);
        }
        else{
          this.stateful && t.target.saveStates(["left","top"]);
        }
      },
      _finalizeCurrentTransform: function(e) {

        var transform = this._currentTransform,
            target = transform.target,
            eventName,
            options = {
              e: e,
              target: target,
              transform: transform,
            };

        if (target._scaling) {
          target._scaling = false;
        }

        target.setCoords();

        if (transform.actionPerformed) {
          eventName = this._addEventOptions(options, transform);
          this._fire(eventName, options);
        }
        target.updateState();

      },

      /**
       * Translates object by "setting" its left/top
       * @private
       * @param {Number} x pointer's x coordinate
       * @param {Number} y pointer's y coordinate
       * @return {Boolean} true if the translation occurred
       */
      /* _translateObject (x, y) {
				 let transform = this._currentTransform,
					 target = transform.target,
					 newLeft = x - transform.offsetX,
					 newTop = y - transform.offsetY,
					 moveX = !target.get('lockMovementX') && target.left !== newLeft,
					 moveY = !target.get('lockMovementY') && target.top !== newTop;


				 //round coordinates
				 // if (target.wholeCoordinates) {
				 //   newLeft = Math.round(newLeft);
				 //   newTop = Math.round(newTop);
				 // }

				 moveX && target.set('left', newLeft);
				 moveY && target.set('top', newTop);
				 return moveX || moveY;
			 }*/
      _setObjectScaleOverwritten: fabric.Canvas.prototype._setObjectScale,
      _setupCurrentTransformOverwritten: fabric.Canvas.prototype._setupCurrentTransform,
      _setObjectScale: function (localMouse, transform, lockScalingX, lockScalingY, by, lockScalingFlip, _dim) {

        let t = transform.target;

        if (!_dim) {
          let strokeWidth = t.stroke ? t.strokeWidth : 0;
          _dim = {
            x: (t.width + (strokeWidth / 2)),
            y: (t.height + (strokeWidth / 2))
          }
        }

        if (t.setObjectScale) {
          return t.setObjectScale(localMouse, transform,
              lockScalingX, lockScalingY, by, lockScalingFlip, _dim);
        } else {
          if (t.resizable) {
            return this._setObjectSize(localMouse, transform,
                lockScalingX, lockScalingY, by, lockScalingFlip, _dim);
          } else {
            return this._setObjectScaleOverwritten(localMouse, transform,
                lockScalingX, lockScalingY, by, lockScalingFlip, _dim);
          }
        }
      },
      _setObjectSize: function (localMouse, transform, lockScalingX, lockScalingY, by, lockScalingFlip, _dim) {

        let target = transform.target, forbidScalingX = false, forbidScalingY = false;
        let _stroke = transform.target.strokeWidth || 0;
        transform.newWidth = this.width * ((localMouse.x / transform.scaleX) / (this.width + _stroke));
        transform.newHeight = this.height * ((localMouse.y / transform.scaleY) / (this.height + _stroke));

        if (this.wholeCoordinates || target.wholeCoordinates) {
          transform.newWidth = Math.round(transform.newWidth);
          transform.newHeight = Math.round(transform.newHeight);
        }
        if (transform.newHeight < 0) {
          target.top = transform.top - transform.newHeight;
        }
        if (target.minWidth && transform.newWidth <= target.minWidth) {
          transform.newWidth = target.minWidth;
        }
        if (target.minHeight && transform.newHeight <= target.minHeight) {
          transform.newHeight = target.minHeight;
        }
        if (lockScalingFlip && transform.newWidth < target.width) {
          forbidScalingX = true;
        }
        if (lockScalingFlip && transform.newHeight < target.height) {
          forbidScalingY = true;
        }

        if (by === 'equally') {
          forbidScalingX || forbidScalingY || this._resizeObjectEqually(localMouse, target, transform, _dim);
        } else if (!by) {
          if(!forbidScalingX) target.set({width: transform.newWidth});
          if(!forbidScalingY) target.set({height: transform.newHeight})
        } else if (by === 'x' && !target.get('lockUniScaling')) {
          if(!forbidScalingX) target.set({width: transform.newWidth})
        } else if (by === 'y' && !target.get('lockUniScaling')) {
          if(!forbidScalingY) target.set({height: transform.newHeight})
        }
        return !forbidScalingX && !forbidScalingY;
      },
      _resizeObjectEqually: function (localMouse, target, transform, _dim) {

        let dist = localMouse.y + localMouse.x,
            lastDist = _dim.y * transform.original.height / target.height +
                _dim.x * transform.original.width / target.width;

        transform.newWidth = transform.original.width * dist / lastDist;
        transform.newHeight = transform.original.height * dist / lastDist;

        let ratio = transform.original.height / transform.original.width;
        if (ratio > 1) {
          if (target.minWidth && transform.newWidth <= target.minWidth) {
            transform.newWidth = target.minWidth;
            transform.newHeight = target.minHeight * ratio;
          }
        } else {
          if (target.minHeight && transform.newHeight <= target.minHeight) {
            transform.newHeight = target.minHeight;
            transform.newWidth = target.minWidth / ratio;
          }
        }

        target.set({width: transform.newWidth,height: transform.newHeight})
      }
    }
  }
}

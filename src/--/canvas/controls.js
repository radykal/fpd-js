import {getEvaluatedFunction, interpolateString} from '../../util/interpolating.js'

export const FmControls = {
  name: "controls",
  install (){
    // fabric.util.on("entity:created",( {target, options})=>{
    //
    // })
  },
  versions: {
    "3.X": {
      prototypes: {
        Canvas: {
          _performTransformAction_overwritten: fabric.Canvas.prototype._performTransformAction,
          _performTransformAction: function (e, transform, pointer) {
            if (!transform.action) return
            let t = transform.target
            let foo = t["_perform" + fabric.util.string.capitalize(transform.action) + "Action"]
            if (foo) {
              let _p = t.toLocalPoint(pointer, transform.originX, transform.originY)
              _p.x /= t.scaleX
              _p.y /= t.scaleY
              if (t.flipX) _p.x *= -1
              if (t.flipY) _p.y *= -1
              transform.point = _p
              foo.call(t, e, transform, pointer)
              return
            }
            this._performTransformAction_overwritten(e, transform, pointer)
            this.renderAll()
          },
          _getActionFromCorner: function (alreadySelected, corner, e, target) {
            if (!corner || !alreadySelected) {
              return 'drag'
            }
            let _corner = target._controls[corner]
            return e[this.altActionKey] && _corner.altAction || _corner.action
          },
          eventListeners: {
            'mouse:up:before': function (e) {
              if (this._readyForClick) {

                let target = this._hoveredTarget

                if (target) {
                  let control = target._controls && target._controls[target.__corner]

                  if (control) {
                    if (control.button) {

                      //handle corner onclick actions. select active corner.
                      target[control.action](e, control)
                      delete target.__corner
                    } else {
                      if (target.setActiveCorner(target.__corner)) {
                        this.requestRenderAll()
                      }
                    }
                  }
                }

                delete this._readyForClick
              }
            },
            'mouse:move:before': function (e) {
              delete this._readyForClick
            },
            "mouse:down:before": function (e) {
              if (this._target) {

                this._readyForClick = true
                let _control = this._target._controls && this._target._controls[this._target.__corner]
                if (_control && _control.button) {
                  //do not allow transformations
                  // this._target = null
                  // this._target._activeControl = _control
                  // delete this._target
                } else {
                  if (this._target.__corner !== this._target.activeCorner) {
                    if (this._target.setActiveCorner(false)) {
                      // shouldRender = true
                      this.requestRenderAll()
                    }
                  }
                }
              }
            }
          },

          inactiveBorder: false,
          getCornerCursor_overwritten: fabric.Canvas.prototype.getCornerCursor,
          cursors: {},
          /**
           * Add custom pointers
           * @param corner
           * @param target
           * @param e
           * @private
           */
          _setCornerCursor: function (corner, target, e) {
            let _cursor = target._controls[corner].cursor
            if (!_cursor || _cursor === "resize") {
              this.setCursor(this._getRotatedCornerCursor(corner, target, e))
            } else {
              this.setCursor(this.cursors[_cursor] || _cursor)
            }
          },
          /**
           * @override
           */
          getCornerCursor: function (corner, target, e) {
            if (target._controls[corner].cursor) {
              return target._controls[corner].cursor
            }
            return this.getCornerCursor_overwritten(corner, target, e)
          }
        },
        Object: {
          // controlsPriority: [
          //   "bl",
          //   "br",
          //   "tl",
          //   "tr",
          //   "mtr",
          //   "*",
          //   "mb",
          //   "ml",
          //   "mr",
          //   "mt"
          // ],
          /** @override **/
          _findTargetCorner: function (pointer) {
            if (!this.hasControls || this.group || !this.canvas || !this.active) {
              return false
            }
            let ex = pointer.x, ey = pointer.y, xPoints, lines
            this.__corner = false
            for (let corner in this.oCoords) {
              if (!this.isControlVisible(corner)) {
                continue
              }
              lines = this._getImageLines(this.oCoords[corner].corner)
              xPoints = this._findCrossPoints({x: ex, y: ey}, lines)
              if (xPoints !== 0 && xPoints % 2 === 1) {
                this.__corner = corner
                return corner
              }
            }
            return false
          },
          "+cacheProperties": ["borderWidth"],
          borderWidth: 1,
          activeCorner: false,
          setActiveCorner(corner) {
            if (corner && !this._controls[corner].selectable) {
              corner = false
            }
            if (corner !== this.activeCorner) {
              this.activeCorner = corner
              this.updateControls()
              return true
            }
            return false
          },
          cornerLabelColor: "black",
          cornerLabelSize: 10,
          cornerLabelFont: "Font Awesome",
          activeCornerStrokeColor: "black",
          resizableEdge: false,
          hasBoundControls: true,
          controls: {
            tl: {action: "scale", visible: "hasBoundControls", x: 0, y: 0,},
            tr: {action: "scale", visible: "hasBoundControls", x: "dimx", y: 0,},
            bl: {action: "scale", visible: "hasBoundControls", x: 0, y: "dimy",},
            br: {action: "scale", visible: "hasBoundControls", x: "dimx", y: "dimy",},
            ml: {
              action: "scaleX",
              visible: "hasBoundControls && !lockUniScaling",
              x: 0,
              y: "dimy/2",
              altAction: "skewY"
            },
            mr: {
              action: "scaleX",
              visible: "hasBoundControls && !lockUniScaling",
              x: "dimx",
              y: "dimy/2",
              altAction: "skewY"
            },
            mt: {
              action: "scaleY",
              visible: "hasBoundControls && !lockUniScaling",
              x: "dimx/2",
              y: 0,
              altAction: "skewX"
            },
            mb: {
              action: "scaleY",
              visible: "hasBoundControls && !lockUniScaling",
              x: "dimx/2",
              y: "dimy",
              altAction: "skewX"
            },
            mtr: {
              action: "rotate",
              visible: "hasRotatingPoint",
              x: "dimx/2",
              y: "-rotatingPointOffset / zoom",
              cursor: "rotationCursor"
            }
          },
          parseControls(value) {
            let parsed = {}
            for (let controlName in value) {
              let control = parsed[controlName] = Object.assign({}, value[controlName])
              if (control.visible === undefined) {
                control.visible = true
              } else if (control.visible.constructor === String) {
                control.visible = getEvaluatedFunction(control.visible)
              }
              if (!control.visible) {
                return value
              }
              if (control.x.constructor === String) {
                control.x = getEvaluatedFunction(control.x)
              }
              if (control.y.constructor === String) {
                control.y = getEvaluatedFunction(control.y)
              }
              if (control.angle && control.angle.constructor === String) {
                control.angle = getEvaluatedFunction(control.angle)
              }
              if (control.label && control.label.text.constructor === String && /{([^}]*)}/g.test(control.label.text)) {
                let text = control.label.text;
                control.label.text = function () {
                  return interpolateString(text, this)
                }
              }
            }
            return parsed
          },
          getBoundsControls: function () {
            let result = {}
            for (let control in this.controls) {
              let copy = result[control] = fabric.util.object.extend({visible: true}, this.controls[control], true)

              if (!copy.visible) {
                continue
              }
              if (copy.visible.constructor === Function) {
                copy.visible = copy.visible.call(this)
              }
              if (copy.x.constructor === Function) {
                copy.x = copy.x.call(this)
              }
              if (copy.y.constructor === Function) {
                copy.y = copy.y.call(this)
              }
              if (copy.angle && copy.angle.constructor === Function) {
                copy.angle = copy.angle.call(this)
              }
              if (copy.label && copy.label.text.constructor === Function) {
                copy.label.text = copy.label.text.call(this)
              }
            }
            return result
          },
          updateControls: function () {
            let controls = this.getBoundsControls()
            this.setExtraControls && this.setExtraControls(controls)
            this._controls = controls
          },
          setControls: function (value) {
            this.controls = this.parseControls(value)
          },
          /** @override **/
          isControlVisible: function (controlName) {

            if (this._controls) {

              if (!this._controls[controlName]) {
                return false
              }
              //intransformable means that control will not be visible when trasnformation is active.
              // it is only works  for add node and remove node control buttons
              if (this._controls[controlName].intransformable && this.canvas._currentTransform) {
                return false
              }

              if (this._controls[controlName].visible === undefined) {
                return true
              }
              return this._controls[controlName].visible
            } else {

              let _mtr = controlName === 'mtr'
              let _middle = !_mtr && controlName[0] === "m"
              let _corner = controlName === 'tl' || controlName === 'tr' || controlName === 'bl' || controlName === 'br'

              if (!this.hasBoundsControls && (_mtr || _corner || _middle)) return false
              if (!this.hasRotatingPoint && _mtr) return false
              if (this.lockUniScaling && _middle) return false

              return this._getControlsVisibility()[controlName]
            }
          },
          /**
           * Calculates and returns the .coords of an object.
           * @return {Object} Object with tl, tr, br, bl ....
           * @chainable
           */
          calcCoords: function (absolute) {

            if (this.controls && !this.controls.__parsed) {
              let parsedControls = this.parseControls(this.controls)
              for (let i in this.controls) {
                Object.assign(this.controls[i], parsedControls[i])
              }
              Object.defineProperty(this.controls, '__parsed', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: true
              })
            }

            let rotateMatrix = this._calcRotateMatrix(),
                translateMatrix = this._calcTranslateMatrix(),
                startMatrix = fabric.util.multiplyTransformMatrices(translateMatrix, rotateMatrix),
                vpt = this.getViewportTransform(),
                finalMatrix = absolute ? startMatrix : fabric.util.multiplyTransformMatrices(vpt, startMatrix),
                dim = this._getTransformedDimensions(),
                w = dim.x / 2, h = dim.y / 2

            this.dimx = dim.x
            this.dimy = dim.y
            this.zoom = this.canvas && this.canvas.getZoom() || 1
            this.updateControls()
            delete this.dimx
            delete this.dimy
            delete this.zoom

            let coords = {}


            for (let control in this._controls) {
              coords[control] = fabric.util.transformPoint(
                  {x: this._controls[control].x - w, y: this._controls[control].y - h}, finalMatrix)
              //
              // let _p = {x: this._controls[i].x * this.scaleX, y: this._controls[i].y * this.scaleY}
              // // _c = this.flipX ? (this.flipY ? "br" : "tr") : (this.flipY ? "bl" : "tl")
              // this.oCoords[i] = {
              //   x: tl.x + ((-sinTh * _p.y + cosTh * _p.x) * (this.flipX ? -1 : 1)) * zoom,
              //   y: tl.y + (( cosTh * _p.y + sinTh * _p.x) * (this.flipY ? -1 : 1)) * zoom
              // }
            }

            // if(!this.canvas)return this
            //
            // let zoom = this.canvas.viewportTransform[0],
            //   theta = fabric.util.degreesToRadians(this.angle),
            //   vpt = this.getViewportTransform(),
            //   dim = this._calculateCurrentDimensions(),
            //   currentWidth = dim.x, currentHeight = dim.y

            // If width is negative, make postive. Fixes path selection issue
            // if (currentWidth < 0) {
            //   currentWidth = Math.abs(currentWidth)
            // }
            //
            // let sinTh = Math.sin(theta),
            //   cosTh = Math.cos(theta),
            //   _angle = currentWidth > 0 ? Math.atan(currentHeight / currentWidth) : 0,
            //   _hypotenuse = (currentWidth / Math.cos(_angle)) / 2,
            //   offsetX = Math.cos(_angle + theta) * _hypotenuse,
            //   offsetY = Math.sin(_angle + theta) * _hypotenuse,
            //   coords = fabric.util.transformPoint(this.getCenterPoint(), vpt),
            //   tl = {x: coords.x - offsetX, y: coords.y - offsetY}
            return coords
          },
          /**
           * Sets the coordinates of the draggable boxes in the corners of
           * the image used to scale/rotate it.
           * @private
           */
          _setCornerCoords: function () {
            let coords = this.oCoords,
                newTheta = fabric.util.degreesToRadians(45 - this.angle),
                cornerHypotenuse,
                cosHalfOffset,
                sinHalfOffset,
                x, y

            for (let corner in coords) {
              let size = this.getCornerAreaSize(corner) || this.getCornerSize(corner)
              cornerHypotenuse = size * 0.707106
              cosHalfOffset = cornerHypotenuse * Math.cos(newTheta)
              sinHalfOffset = cornerHypotenuse * Math.sin(newTheta)

              let _corners = {tl: corner, tr: corner, bl: corner, br: corner}

              if (this.resizableEdge) {
                switch (corner) {
                  case "ml":
                    _corners = {tl: "tl", tr: "tl", bl: "bl", br: "bl"}
                    break
                  case "mt":
                    _corners = {tl: "tl", tr: "tr", bl: "tl", br: "tr"}
                    break
                  case "mr":
                    _corners = {tl: "tr", tr: "tr", bl: "br", br: "br"}
                    break
                  case "mb":
                    _corners = {tl: "bl", tr: "br", bl: "bl", br: "br"}
                    break
                }
              }

              coords[corner].corner = {
                tl: {
                  x: coords[_corners.tl].x - sinHalfOffset,
                  y: coords[_corners.tl].y - cosHalfOffset
                },
                tr: {
                  x: coords[_corners.tr].x + cosHalfOffset,
                  y: coords[_corners.tr].y - sinHalfOffset
                },
                bl: {
                  x: coords[_corners.bl].x - cosHalfOffset,
                  y: coords[_corners.bl].y + sinHalfOffset
                },
                br: {
                  x: coords[_corners.br].x + sinHalfOffset,
                  y: coords[_corners.br].y + cosHalfOffset
                }
              }
            }
          },
          getCornerAreaSize: function (control) {
            return this._controls[control].area || this.cornerAreaSize && (this.cornerAreaSize[control] || this.cornerAreaSize.all || this.cornerAreaSize)
          },
          getCornerStyle: function (control) {
            return this._controls[control].style || this.cornerStyle[control] || this.cornerStyle.all || this.cornerStyle
          },
          getCornerSize: function (control) {
            return this._controls[control].size || this.cornerSize[control] || this.cornerSize.all || this.cornerSize
          },
          rotationPointBorder: true,
          // overriiden
          _renderControls: function (ctx, styleOverride) {
            //added for rendering tempalates
            if (this.group) {
              styleOverride = {forActiveSelection: true}
            }
            //original
            let vpt = this.getViewportTransform(),
                matrix = this.calcTransformMatrix(),
                options, drawBorders, drawControls
            styleOverride = styleOverride || {}
            drawBorders = typeof styleOverride.hasBorders !== 'undefined' ? styleOverride.hasBorders : this.hasBorders
            drawControls = typeof styleOverride.hasControls !== 'undefined' ? styleOverride.hasControls : this.hasControls
            matrix = fabric.util.multiplyTransformMatrices(vpt, matrix)
            options = fabric.util.qrDecompose(matrix)
            ctx.save()
            ctx.translate(Math.round(options.translateX), Math.round(options.translateY))
            ctx.lineWidth = 1 * this.borderWidth
            if (!this.group) {
              ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1
            }
            if (this.rotationPointBorder === false) {
              styleOverride.hasRotatingPoint = false
            }
            if (styleOverride.forActiveSelection) {
              ctx.rotate(fabric.util.degreesToRadians(options.angle))
              drawBorders && this.drawBordersInGroup(ctx, options, styleOverride)
            } else {
              ctx.rotate(fabric.util.degreesToRadians(this.angle))
              drawBorders && this.drawBorders(ctx, styleOverride)
            }
            //original end

            this.drawControlsInterface && this.drawControlsInterface(ctx)

            //edited
            ctx.restore()

            this.setCoords()

            if (drawControls && !styleOverride.forActiveSelection) {
              this.drawControls(ctx, styleOverride)
            }
          },
          drawControls: function (ctx, styleOverride) {
            // ctx.save()
            // ctx.lineWidth = 1
            // ctx.strokeStyle = ctx.fillStyle = this.cornerColor
            let controlsKeys = Object.keys(this._controls)

            for (let i = controlsKeys.length; i--;) {
              let cornerName = controlsKeys[i];
              let corner = this._controls[cornerName]
              let coord = this.oCoords[cornerName]

              if (!this.isControlVisible(cornerName)) continue

              if (corner.render) {
                return corner.render.call(this, cornerName, ctx, coord.x, coord.y, styleOverride)
              } else {
                this._drawControl(cornerName, ctx, coord.x, coord.y, styleOverride);/*'fill',styleOverride*/
              }
            }
            // ctx.restore()
            return this
          },
          //todo not working for skewed objects
          drawTransformedShapeBorders: function (ctx) {
            //todo
            // return
            // if(!this.skewX && !this.skewY)return
            // ctx.save()
            // ctx.scale(this.scaleX,this.scaleY)
            // ctx.translate(-this.width/2,-this.height/2)
            //
            //
            // let _p = this.oCoords,
            //   p1 = this.oCoords.tl,
            //   p2 = this.oCoords.tr,
            //   p3 = this.oCoords.br,
            //   p4 = this.oCoords.bl
            //
            // ctx.beginPath()
            // ctx.moveTo(p1.x, p1.y)
            // ctx.lineTo(p2.x, p2.y)
            // ctx.lineTo(p3.x, p3.y)
            // ctx.lineTo(p4.x, p4.y)
            // ctx.lineTo(p1.x, p1.y)
            // ctx.stroke()
            // ctx.closePath()
            // ctx.restore()
          },
          cornerScheme: "rect",
          cornerGlobalCompositeOperation: "source-over",
          cornerOpacity: 1,
          cornerStrokeWidth: 0,
          getCornerData(cornerStyle, cornerName, cs) {

            // case "fixed": {
            //   ctx.translate(left,top)
            //   ctx.rotate(fabric.util.degreesToRadians(-this.angle))
            //   ctx.translate(-size/2, -size/2)
            //
            //   rect(0, 0, size, size)
            //   break
            // }
            switch (cornerStyle) {
              case "rect":
                return {shape: {type: "rect"}}
              case "circle":
                return {shape: {type: "circle"}}
              case "arc":
                switch (cornerName) {
                  case "mtr":
                    return {shape: {type: "circle"}}
                  case "bl":
                    return {angle: 0, shape: {type: "arcCorner"}}
                  case "tl":
                    return {angle: 90, shape: {type: "arcCorner"}}
                  case "tr":
                    return {angle: 180, shape: {type: "arcCorner"}}
                  case "br":
                    return {angle: 270, shape: {type: "arcCorner"}}
                  case "mb":
                    return {angle: 0, shape: {type: "arcSide"}}
                  case "ml":
                    return {angle: 90, shape: {type: "arcSide"}}
                  case "mt":
                    return {angle: 180, shape: {type: "arcSide"}}
                  case "mr":
                    return {angle: 270, shape: {type: "arcSide"}}
                  default:
                    return {shape: {type: "circle"}}
                }
              case "frame" :
                switch (cornerName) {
                  case "mtr":
                    return {shape: {type: "rect"}}
                  case "tl":
                    return {angle: 0, shape: {type: "bracketCorner"}}
                  case "tr":
                    return {angle: 90, shape: {type: "bracketCorner"}}
                  case "br":
                    return {angle: 180, shape: {type: "bracketCorner"}}
                  case "bl":
                    return {angle: 270, shape: {type: "bracketCorner"}}
                  case "mt":
                    return {angle: 0, shape: {type: "bracketSide"}}
                  case "mr":
                    return {angle: 90, shape: {type: "bracketSide"}}
                  case "mb":
                    return {angle: 180, shape: {type: "bracketSide"}}
                  case "ml":
                    return {angle: 270, shape: {type: "bracketSide"}}
                  default:
                    return {shape: {type: "rect"}}
                }
              case "canva":
                let wh = this._calculateCurrentDimensions()
                switch (cornerName) {
                  case "mtr":
                    return {shape: {type: "circle", size: cs * 1.2}, label: {text: "\uf021", size: cs * 0.75}}
                  case "mr":
                    return {
                      shape: {
                        type: "roundRect",
                        width: cs * 0.4,
                        height: Math.max(cs * 0.4, Math.min(cs * 6, wh.y - cs * 2)),
                        radius: cs * 0.2
                      }
                    }
                  case "ml":
                    return {
                      shape: {
                        type: "roundRect",
                        width: cs * 0.4,
                        height: Math.max(cs * 0.4, Math.min(cs * 6, wh.y - cs * 2)),
                        radius: cs * 0.2
                      }
                    }
                  case "mt":
                    return {
                      shape: {
                        type: "roundRect",
                        width: Math.max(cs * 0.4, Math.min(cs * 6, wh.x - cs * 2)),
                        height: cs * 0.4,
                        radius: cs * 0.2
                      }
                    }
                  case "mb":
                    return {
                      shape: {
                        type: "roundRect",
                        width: Math.max(cs * 0.4, Math.min(cs * 6, wh.x - cs * 2)),
                        height: cs * 0.4,
                        radius: cs * 0.2
                      }
                    }
                  default:
                    return {shape: {type: "circle"}}
                }
            }
          },
          _drawControl: function (cornerId, ctx, left, top) {/* methodName, styleOverride*/
            let cornerStyle = this.getCornerStyle(cornerId)
            let cornerSize = this.getCornerSize(cornerId)

            let cornerData = this.getCornerData(cornerStyle, cornerId, cornerSize)
            let control = this._controls[cornerId]
            let shape = control.shape || cornerData.shape
            let label = control.label || cornerData.label
            let angle = control.angle !== undefined ? control.angle : cornerData.angle || 0

            ctx.save()
            ctx.translate(left, top)
            ctx.rotate(fabric.util.degreesToRadians(this.angle + angle))


            ctx.save()
            ctx.beginPath()
            let size = shape.size ||
                (shape.width && shape.height && ((shape.width + shape.height) / 2)) ||
                shape.width ||
                shape.height ||
                shape.radius * 2 || cornerSize,
                radius = shape.radius || size / 2,
                width = shape.width || size,
                height = shape.height || size

            switch (shape.type) {
              case "bracketCorner": {
                let smallSize = size * 0.35
                ctx.translate(-smallSize, -smallSize)
                ctx.moveTo(0, 0)
                ctx.lineTo(size * 1.5, 0)
                ctx.lineTo(size * 1.5, smallSize)
                ctx.lineTo(smallSize, smallSize)
                ctx.lineTo(smallSize, size * 1.5)
                ctx.lineTo(0, size * 1.5)
                break
              }
              case "bracketSide": {
                let smallSize = size * 0.35
                ctx.translate(-size * 1.5, -smallSize)
                ctx.moveTo(0, 0)
                ctx.lineTo(size * 3, 0)
                ctx.lineTo(size * 3, smallSize)
                ctx.lineTo(0, smallSize)
                break
              }
              case "circle": {
                ctx.translate(-radius, -radius)
                ctx.arc(radius, radius, radius, 0, 2 * Math.PI, false)
                break
              }
              case "rect": {
                let x = -width / 2, y = -height / 2
                ctx.moveTo(x, y)
                ctx.lineTo(x + width, y)
                ctx.lineTo(x + width, y + height)
                ctx.lineTo(x, y + height)
                break
              }
              case "arcSide": {
                ctx.arc(0, 0, radius, 0, Math.PI, false)
                break
              }
              case "arcCorner": {
                // ctx.translate(, 0)
                // ctx.rotate(a)
                ctx.moveTo(0, 0)
                ctx.arc(0, 0, radius, 0, Math.PI * 3 / 2, false)
                ctx.lineTo(0, 0)
                break
              }
              case "roundRect": {
                let x = -width / 2, y = -height / 2
                if (typeof radius === 'undefined') {
                  radius = 0
                }
                if (typeof radius === 'number') {
                  radius = {tl: radius, tr: radius, br: radius, bl: radius}
                } else {
                  let defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0}
                  for (let side in defaultRadius) {
                    radius[side] = radius[side] || defaultRadius[side]
                  }
                }
                ctx.beginPath()
                ctx.moveTo(x + radius.tl, y)
                ctx.lineTo(x + width - radius.tr, y)
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
                ctx.lineTo(x + width, y + height - radius.br)
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
                ctx.lineTo(x + radius.bl, y + height)
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
                ctx.lineTo(x, y + radius.tl)
                ctx.quadraticCurveTo(x, y, x + radius.tl, y)
                break
              }
            }
            ctx.closePath()


            let style = {
              globalCompositeOperation: shape.globalCompositeOperation || this.cornerGlobalCompositeOperation,
              opacity: shape.opacity || this.cornerOpacity,
              shadow: shape.shadow || this.cornerShadow,
              fill: shape.fill || this.cornerColor,
              strokeWidth: shape.strokeWidth || this.cornerStrokeWidth,
              stroke: shape.stroke || (this.activeCorner === cornerId ? this.activeCornerStrokeColor : !this.transparentCorners && this.cornerStrokeColor),
              dashArray: shape.dashArray || this.cornerDashArray,
            }

            {//draw shape
              if (style.globalCompositeOperation) {
                ctx.globalCompositeOperation = style.globalCompositeOperation
              }

              if (style.opacity !== undefined) {
                ctx.globalAlpha *= style.opacity
              }

              if (style.shadow) {
                let dpr = fabric.devicePixelRatio
                ctx.shadowColor = style.shadow.color
                ctx.shadowBlur = style.shadow.blur * fabric.browserShadowBlurConstant * (dpr + dpr) / 4
                ctx.shadowOffsetX = style.shadow.offsetX * dpr
                ctx.shadowOffsetY = style.shadow.offsetY * dpr
              }

              if (style.stroke && style.strokeWidth !== 0) {
                ctx.save()
                ctx.strokeStyle = style.stroke
                this._setLineDash(ctx, style.strokeDashArray, this._renderDashedStroke)
                this._applyPatternGradientTransform(ctx, style.stroke)
                ctx.stroke()
                ctx.restore()
              }

              if (style.fill) {
                ctx.save()
                ctx.fillStyle = style.fill
                this._applyPatternGradientTransform(ctx, style.fill)
                style.fillRule ? ctx.fill(style.fillRule) : ctx.fill()
                ctx.restore()
              }
            }

            ctx.restore()
            {//draw label
              if (label) {

                ctx.shadowColor = ''
                ctx.shadowBlur = ctx.shadowOffsetX = ctx.shadowOffsetY = 0

                let cornerLabelFont = label.font || this.cornerLabelFont
                let cornerLabelSize = Math.round(label.size || this.cornerLabelSize)
                let cornerLabelFill = label.fill || this.cornerLabelColor
                let iconOffset = (size - cornerLabelSize) / 2
                ctx.font = `400 ${cornerLabelSize}px "${cornerLabelFont}"`
                ctx.fillStyle = cornerLabelFill
                ctx.textAlign = 'center'
                ctx.textBaseline = "middle"
                // ctx.fillText( label.text, size/2,  iconOffset, size)
                ctx.fillText(label.text, 0, 0, size)
              }
            }
            ctx.restore()

          },
          //Skew Points
          __setSkewControls: function () {
            this._initPoints()
            this.extraControls = this.extraControls || {}
            this.extraControls.skewTR = {x: this.width - 5, y: 0}
            this.extraControls.skewBL = {x: 5, y: this.height}

            this._corner_actions = this._corner_actions || {}
            this._corner_actions.skewTR = "skew"
            this._corner_actions.skewBL = "skew"

            this._controlsVisibility.skewTR = true
            this._controlsVisibility.skewBL = true
            //Object.assign(this, fabric.SkewObject)
          },
          ___performSkewAction: function (e, transform, pointer) {
            //this.extraControls.curve
            //this.extraControls.curve.y = transform.point.y

            if (transform.corner == "skewBL") {
              //_points[order].x = _point.x
              this.skewX = Math.atan2(transform.point.x, this.height) / Math.PI * 180
            }
            if (transform.corner == "skewTR") {
              //_points[order].y = _point.y
              this.skewY = Math.atan2(transform.point.y, this.width) / Math.PI * 180
            }
          },
          drawBorders: function (ctx, styleOverride) {
            styleOverride = styleOverride || {}
            let wh = this._calculateCurrentDimensions(),
                strokeWidth = 1 / this.borderWidth,
                width = wh.x + strokeWidth,
                height = wh.y + strokeWidth,
                drawRotatingPoint = typeof styleOverride.hasRotatingPoint !== 'undefined' ?
                    styleOverride.hasRotatingPoint : this.hasRotatingPoint,
                hasControls = typeof styleOverride.hasControls !== 'undefined' ?
                    styleOverride.hasControls : this.hasControls,
                rotatingPointOffset = typeof styleOverride.rotatingPointOffset !== 'undefined' ?
                    styleOverride.rotatingPointOffset : this.rotatingPointOffset

            ctx.save()
            ctx.strokeStyle = styleOverride.borderColor || this.borderColor
            this._setLineDash(ctx, styleOverride.borderDashArray || this.borderDashArray, null)

            if (this.hasBoundBorders) {

              ctx.strokeRect(
                  -width / 2,
                  -height / 2,
                  width,
                  height
              )
              if (drawRotatingPoint && this.isControlVisible('mtr') && hasControls) {

                let rotateHeight = -height / 2

                ctx.beginPath()
                ctx.moveTo(0, rotateHeight)
                ctx.lineTo(0, rotateHeight - rotatingPointOffset)
                ctx.stroke()
              }
            }

            //added
            this.drawTransformedShapeBorders(ctx)
            ctx.restore()
            return this
          },
          hasBoundBorders: true
        },
        ActiveSelection: {
          //fix children bounding box overlapping parent oobject controls
          _renderControls: function (ctx, styleOverride, childrenOverride) {
            ctx.save()
            ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1
            childrenOverride = childrenOverride || {}
            if (typeof childrenOverride.hasControls === 'undefined') {
              childrenOverride.hasControls = false
            }
            if (typeof childrenOverride.hasRotatingPoint === 'undefined') {
              childrenOverride.hasRotatingPoint = false
            }
            childrenOverride.forActiveSelection = true
            for (var i = 0, len = this._objects.length; i < len; i++) {
              this._objects[i]._renderControls(ctx, childrenOverride)
            }
            this.callSuper('_renderControls', ctx, styleOverride)
            ctx.restore()
          }
        }
      }
    }
  }
}

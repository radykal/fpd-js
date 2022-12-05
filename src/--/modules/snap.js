/**
 * SnapTo Module.
 */


/**
 * @name SnappingObject
 * @property {Array<{x: number, y:number}>} points
 * @property {Array<number>} x - bounding rect coordinate of Object or Guidline coordinates
 * @property {Array<number>} y
 * @property {fabric.Object} instance
 **/

/**
 * @name SnapToResult
 * @property {number} x - result X and Y coordinates of the target element
 * @property {number} y
 * @property {number} tx - origin X and Y coordinates of the target element
 * @property {number} ty
 * @property {number} dx - difference by X and Y axes. used to move Target element
 * @property {number} dy
 * @property {SnappingObject} object -
 * @property {SnappingObject} objectX -
 * @property {SnappingObject} objectY -
 * @property {number} distance - distance between origin and result point. Smaller distance has more priority
 *
 **/

/**
 * @name GridOptions
 * @property {number} x1 - Grid limit on left
 * @property {number} y1 - Grid limit on top
 * @property {number} x2 - Grid limit on riht
 * @property {number} y2 - Grid limit on bottom
 * @property {number} offsetX - X position of the first grid segment
 * @property {number} offsetY - Y position of the first grid segment
 * @property {number} size - size of grid segmenets
 **/


export default {
  name: "snap",
  prototypes() {
    return {
      Canvas: {
        snappingToArea: true,
        snappingToObjects: true,
        snappingToGrid: true,
        snapping: false,
        snappingTolerance: 10,
        renderSnappingHelperLines: true,
        renderOrder: fabric.util.a.insertBefore(fabric.Canvas.prototype.renderOrder, "controls", "snap"),
        layers: fabric.util.object.extend(fabric.Canvas.prototype.layers, {
          snap: {
            render() {
              if (this.renderSnappingHelperLines && this.snapTo) {
                this.renderSnapping(this.snapTo, "#ffaaaa")
              }
            }
          }
        }),

        /**
         * Returns Snapping to Grid Point
         * @param {SnappingObject} target
         * @param {GridOptions} grid
         * @param {number} tolerance
         * @returns {SnapToResult | null}
         */
        snapToGrid(target, grid, tolerance){
      let result = null
      for (let targetX of target.x) {
        let dX = -((targetX + grid.offsetX + tolerance/2) % grid.size - tolerance/2)
        let distance = Math.abs(dX)
        if (distance < tolerance) {
          if(!result) result = {}
          result.x = targetX + dX
          result.tx = targetX
          result.objectX = "grid"
          result.dx = dX
        }
      }
      for (let targetY of target.y) {
        let dY = -((targetY + grid.offsetY + tolerance/2) % grid.size -  tolerance/2)
        let distance = Math.abs(dY)
        if (distance < tolerance) {
          if(!result) result = {}
          result.y = targetY + dY
          result.ty = targetY
          result.objectY = "grid"
          result.dy = dY
        }
      }
      if(result) {
        result.distance = Math.abs(Math.round((result.dx && result.dy && Math.min(Math.abs(result.dx), Math.abs(result.dy)))
          || result.dx || result.dy))
      }
      return result
    },

        /**
         * Returns Snapping to Objects Control Points Point
         * @param {SnappingObject} target
         * @param {Array<SnappingObject>} objects
         * @param {number} tolerance
         * @returns {SnapToResult | null}
         */
        snapToPoints(target, objects, tolerance){
          let result = null
          let minDistance = tolerance * this.getZoom()

          //supportlines
          for(let object of objects) {
            if (object.points) {
              for (let point of object.points) {
                for (let targetPoint of target.points) {
                  let dX = point.x - targetPoint.x
                  let dY = point.y - targetPoint.y
                  let distance = (Math.abs(dX) + Math.abs(dY)) / 2
                  if (distance < minDistance) {
                    minDistance = distance
                    result = {
                      object: object,
                      x: point.x, tx: targetPoint.x, dx: dX,
                      y: point.y, ty: targetPoint.y, dy: dY,
                    }
                  }
                }
              }
            }
          }
          if(result){
            result.distance =  Math.round(Math.min(Math.abs(result.dx),Math.abs(result.dy)))
          }
          return result
        },

        /**
         * Returns Snapping to Objects Bounding Rectangles Point
         * @param {SnappingObject} target
         * @param {Array<SnappingObject>} objects
         * @param {number} tolerance
         * @returns {SnapToResult | null}
         */
        snapToBounds(target, objects, tolerance){
          let result = null
          let minDistance = tolerance

          //snap center point to vertical lines
          if(target.cx) {
            for (let object of objects) {
              if (object.cx && object.cy === undefined) {
                let dX = object.cx - target.cx
                let distance = Math.abs(dX)
                if (distance < minDistance) {
                  minDistance = distance
                  if (!result) result = {}
                  result.objectX = object
                  result.x = object.cx
                  result.tx = target.cx
                  result.dx = dX
                }
              }
            }
          }
          //snap center point to horisontal lines
          minDistance = tolerance
          if(target.cy){
            for(let object of objects) {
              if (object.cy && object.cx === undefined) {
                let dy = object.cy - target.cy
                let distance = Math.abs(dy)
                if (distance < minDistance) {
                  minDistance = distance
                  if(!result)result = {}
                  result.objectY = object
                  result.y = object.cy
                  result.ty = target.cy
                  result.dy = dy
                }
              }
            }
          }
          //snap edges to horisontal lines
          minDistance = tolerance
          for(let object of objects) {
            if (object.x) {
              for (let x of object.x.length ? object.x : [object.x]) {
                for (let targetX of target.x) {
                  let dX = x - targetX
                  let distance = Math.abs(dX)
                  if (distance < minDistance) {
                    minDistance = distance
                    if(!result)result = {}
                    result.objectX = object
                    result.x = x
                    result.tx = targetX
                    result.dx = dX
                  }
                }
              }
            }
          }
          minDistance = tolerance
          //snap edges to vertical lines
          for(let object of objects) {
            if(object.y){
              for (let y of object.y.length ? object.y : [object.y]) {
                for (let targetY of target.y) {
                  let dY = y - targetY
                  let distance = Math.abs(dY)
                  if (distance < minDistance) {
                    minDistance = distance
                    if(!result)result = {}
                    result.objectY = object
                    result.y = y
                    result.ty = targetY
                    result.dy = dY
                  }
                }
              }
            }
          }

          if(result) {
            result.distance = Math.abs(Math.round((result.dx && result.dy && Math.min(Math.abs(result.dx), Math.abs(result.dy)))
              || result.dx || result.dy))
          }
          return result
        },

        /**
         * generate SnappingObject using in snapping cache
         * @param {Array<fabric.Object>} object - FabricJS object
         * @returns {SnappingObject}
         */
        createSnapObject(object){
          let cr = object.calcCoords(true),
            xPoints = [cr.tl.x,cr.tr.x,cr.bl.x,cr.br.x],
            yPoints = [cr.tl.y,cr.tr.y,cr.bl.y,cr.br.y]

          let xMin = fabric.util.array.min(xPoints),
            xMax = fabric.util.array.max(xPoints),
            yMin = fabric.util.array.min(yPoints),
            yMax = fabric.util.array.max(yPoints)
          return {
            instance: object,
            points: [cr.tl, cr.tr, cr.br, cr.bl],
            cx: xMin + (xMax - xMin)/2,
            cy: yMin + (yMax - yMin)/2,
            x: [xMin, xMax],
            y: [yMin, yMax]
          }
        },



        /**
         * Draw Helper lines For Snapping function
         * @param {SnapToResult} snapResult
         * @param strokeStyle
         */
        renderSnapping: function (snapResult, strokeStyle) {
          // if(this._currentTransform && snapResult){
          //   this.clearContext(ctx)
          // }
          // let options = fabric.util.qrDecompose(v)
          let ctx = this.contextTop, v = this.viewportTransform
          let scale = v[0]

          ctx.save()
          ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5])
          ctx.lineWidth = 1 / scale
          ctx.strokeStyle = strokeStyle
          fabric.Path.prototype._setLineDash(ctx, [5 / scale, 5 / scale], fabric.Path.prototype._renderDashedStroke)

          // ctx.translate(options.translateX, options.translateY)

          function drawSnapObject(obj) {
            if (!obj || !obj.points) return
            let p = obj.points
            let lastPoint = p[0]
            ctx.moveTo(p[0].x, p[0].y)
            for (let i = p.length; i--;) {
              // fabric.util.drawDashedLine(ctx, lastPoint.x, lastPoint.y, p[i].x, p[i].y, [5 / scale,5 / scale ])
              ctx.lineTo(p[i].x, p[i].y)
              lastPoint = p[i]
            }
          }

          ctx.beginPath()
          drawSnapObject(snapResult.object)
          drawSnapObject(snapResult.objectX)
          drawSnapObject(snapResult.objectY)
          drawSnapObject(this.__snapCache.target)
          if (snapResult.object) {
            ctx.moveTo(snapResult.tx, snapResult.ty)
            ctx.lineTo(snapResult.x, snapResult.y)
            ctx.arc(snapResult.x, snapResult.y, 2, 0, 2 * Math.PI)
          }
          if (snapResult.objectX) {
            ctx.moveTo(snapResult.x, -v[5] / v[3])
            ctx.lineTo(snapResult.x, this.height / v[3])
          }
          if (snapResult.objectY) {
            ctx.moveTo(-v[4] / v[0], snapResult.y)
            ctx.lineTo(this.width / v[0], snapResult.y)
          }
          ctx.stroke()
          ctx.restore()
        },
        /**
         * Correct Object moving on "object:moving" event
         * @param {Object}                options           -
         * @param {fabric.Object}         options.target    - moving object
         * @param {Array<SnappingObject>} options.guidlines - other guidlines
         * @param {Array<fabric.Object>}  options.objects   - other objects
         * @param {GridOptions}           options.grid      -
         * @param {number}                options.tolerance -
         * @returns {SnapToResult | null}
         */
        gridSnapMove(options) {
          let area = options.area
          let objects = options.objects || this._objects
          if (!this.__snapCache) {
            let snapObjects = options.guidlines || []
            for (let i in objects) {
              let obj = objects[i]
              if (obj === options.target || !obj.snappable || !obj.visible) continue
              snapObjects.push(this.createSnapObject(obj))
            }

            this.__snapCache = {
              area: area,
              objects: snapObjects,
              grid: options.grid
            }
          }


          let tolerance = options.tolerance / this.getZoom()
          this.__snapCache.target = this.createSnapObject(options.target)


          let snapTo = null
          let snapPoints = this.snapToPoints(this.__snapCache.target, this.__snapCache.objects, tolerance)
          if (!snapTo) snapTo = snapPoints
          if (snapTo && snapPoints && snapPoints.distance < snapTo.distance) {
            snapTo = snapPoints
          }

          let snapRects = this.snapToBounds(this.__snapCache.target, this.__snapCache.objects, tolerance)
          if (!snapTo) snapTo = snapRects
          if (snapTo && snapRects && snapRects.distance < snapTo.distance) {
            snapTo = snapRects
          }

          if (options.grid) {
            let snapGrid = this.snapToGrid(this.__snapCache.target, this.__snapCache.grid, tolerance)
            if (!snapTo) snapTo = snapGrid
            if (snapTo && snapGrid && snapGrid.distance < snapTo.distance) {
              snapTo = snapGrid
            }
          }


          if (snapTo) {
            if (snapTo.dx) {
              options.target.left += snapTo.dx
            }
            if (snapTo.dy) {
              options.target.top += snapTo.dy
            }
            this.fire("object:snapto", {e: snapTo})
          }
          return snapTo
        },
        setSnapping(val) {
          if (val === this.snapping) return
          if (val) {
            this.on("object:moving", this.gridSnapMoveWrapper)
            this.on('mouse:up', this.clearSnapping)
            // this.on('after:render', _renderSnapping)
          } else {
            this.off("object:moving", this.gridSnapMoveWrapper)
            this.off('mouse:up', this.clearSnapping)
            // this.off('after:render', _renderSnapping)
          }
          this.snapping = val
        },
        clearSnapping() {
          delete this.__snapCache
          if(this.snapTo){
            this.contextTopDirty = true;
            this.snapTo = null
          }
        },
        getGrid() {
          return this.editor.grid
        },
        /**
         * @param object
         * @returns {{x: (false|{value, corner}|{value, corner, object2, corner2}), y: (false|{value, corner}|{value, corner, object2, corner2})}}
         */
        gridSnapMoveWrapper(options) {

          if (!this.snapping) return
          if (options.e.shiftKey || !options.target.snappable) {
            return
          }

          let w = this.getOriginalWidth();
          let h = this.getOriginalHeight();

          let snapObjects = [
            {
              cy: h / 2,
              instance: "centerVLine"
            },
            {
              cx: w / 2,
              instance: "centerHLine"
            }
          ];
          if(this.offsets){

            snapObjects.push({
              instance: "offset",
                x: [this.offsets.left, this.originalWidth - this.offsets.right],
                y: [this.offsets.top, this.originalHeight - this.offsets.bottom]
              })
          }
          if (this.supportLines) {
            for (let l of this.supportLines) {
              snapObjects.push(l.x ? {instance: l, x: l.x} : {instance: l, y: l.y})
            }
          }
          if (this.guidlines) {
            for (let l of this.guidlines) {
              snapObjects.push(l.x ? {instance: l, x: l.x} : {instance: l, y: l.y})
            }
          }

          let gridEnabled, gridSize;
          if (this.editor.grid) {
            gridEnabled = this.getGrid()
            gridSize = this.getGridSize()
          }

          let snappingArea = false;

          if(this.snappingToArea && !gridEnabled){
            snappingArea = {
              x1: this.offsets && this.offsets.left || 0,
              y1: this.offsets && this.offsets.top || 0,
              x2: w - (this.offsets && this.offsets.right || 0 ),
              y2: h - (this.offsets && this.offsets.bottom || 0 )
            }
          }

          let _oldSnap = !!this.snapTo;
          this.snapTo = this.gridSnapMove({
            tolerance: this.snappingTolerance,
            guidlines: !gridEnabled && snapObjects,
            objects: this.snappingToObjects && !gridEnabled && this._objects,
            target: options.target,
            area: snappingArea,
            grid: this.snappingToGrid && gridEnabled && {
              offsetX: (gridSize - this.originalWidth % gridSize) / 2,
              offsetY: (gridSize - this.originalHeight % gridSize) / 2,
              size: gridSize
            }
          })
          if(_oldSnap || this.snapTo){
            this.contextTopDirty = true;
          }
        },

        //snap to grid by x coordinates
        gridSnapResize(object) {

          this.setCoords()
          let x = this.gridSnapXResize(object),
              y = this.gridSnapYResize(object)
          this.snapTo = {x: x, y: y}
          this.snapCallback && this.snapCallback(this.snapTo)
          return this.snapTo
        },
        gridSnapXResize(object) {

          let self = this

          let gridSize = this.getGridSize()
          let _l = self.rect.left,
            _w = self.rect.width

          let active_corner = canvas._currentTransform.corner

          let coords = []
          let is_right = false
          switch (active_corner) {
            case "tr":
            case "br":
            case "mr":
              is_right = true
              coords = ["tr", "br"]
              break
            case "tl":
            case "bl":
            case "ml":
              coords = ["bl", "tl"]
              break
          }

          let to_radians = Math.PI / 180
          for (let i in this.snapCorners) {
            let _corner_name = this.snapCorners[i]
            if (coords.indexOf(_corner_name) == -1) continue
            let corner = object.oCoords[this.snapCorners[i]]

            let x = (corner.x - _l + self.area) % gridSize
            let _line = Math.floor((corner.x - _l + self.area) / gridSize) + 1
            if (x < -gridSize) return false
            if (x < self.area * 2) {
              if (corner.x > _l && corner.x < _w + _l) {

                if (is_right) {
                  if (_corner_name == "tr") {
                    let opt = {
                      scaleX: object.scaleX * (_line * gridSize - object.oCoords.tl.x - _l) / (corner.x - object.oCoords.tl.x)
                    }
                  }
                  if (_corner_name == "br") {
                    let opt = {
                      scaleX: object.scaleX * (_line * gridSize - object.oCoords.bl.x - _l) / (corner.x - object.oCoords.bl.x)
                    }
                  }
                  //if(_corner_name == "mr"){
                  //    let opt = {
                  //        scaleX: object.scaleX *  (_line * gridSize - object.oCoords.ml.x - _l)/(corner.x - object.oCoords.ml.x)
                  //    }
                  //}
                } else {
                  let scale2 = (corner.x + object.width * object.scaleX - ((_line - 1) * gridSize + _l)) / object.width
                  //if(_corner_name == "tl"){
                  //    let _l = (_line - 1) * gridSize + _l
                  //    let _r = object.oCoords.tr.x
                  //    let _w = _r - _l
                  //
                  //   let _scale   = _w / (object.width *Math.sin(object.angle *  to_radians ))
                  //
                  //    opt = {
                  //
                  //        scaleX: scale2
                  //    }
                  //}
                  //else{

                  let opt = {
                    left: object.oCoords.tr.x - (object.oCoords.tr.x - object.left) / object.scaleX * scale2,
                    scaleX: scale2
                  }
                  if (_corner_name != "ml") {
                    opt.top = object.oCoords.tr.y - (object.oCoords.tr.y - object.top) / object.scaleX * scale2
                  }
                  //}


                }
                object.set(opt)
                return {value: object.left + (corner.x - object.oCoords.tl.x), corner: _corner_name}
              }
            }
          }
          return false
        },


        //snap to grid by x coordinates
        gridSnapYResize(object) {

          let self = this

          let _l = self.rect.top,
            _w = self.rect.height

          let active_corner = canvas._currentTransform.corner

          let coords = []
          let is_right = false
          switch (active_corner) {
//             case "ml":
//                 coords = ["tl","bl"]
//                 break
//             case "mr":
//                 is_right = true
//                 coords = ["tr","br"]
//                 break
            case "tr":
            case "tl":
            case "mt":
              coords = ["tl", "tr"]
              break
            case "bl":
            case "mb":
            case "br":
              is_right = true
              coords = ["bl", "br"]
              break
          }

          for (let i in this.snapCorners) {
            let _corner_name = this.snapCorners[i]
            if (coords.indexOf(_corner_name) == -1) continue
            let corner = object.oCoords[this.snapCorners[i]]

            let y = (corner.y - _l + self.area) % gridSize
            let _line = Math.floor((corner.y - _l + self.area) / gridSize) + 1
            if (y < -gridSize) return false
            if (y < self.area * 2) {
              if (corner.y > _l && corner.y < _w + _l) {

                if (is_right) {
                  if (_corner_name == "bl") {
                    let opt = {
                      scaleY: object.scaleY * (_line * gridSize - object.oCoords.tl.y - _l) / (corner.y - object.oCoords.tl.y)
                    }
                  }
                  if (_corner_name == "br") {
                    let opt = {
                      scaleY: object.scaleY * (_line * gridSize - object.oCoords.tr.y - _l) / (corner.y - object.oCoords.tr.y)
                    }
                  }
                  //if(_corner_name == "mb"){
                  //    let opt = {
                  //        scaleY: object.scaleY *  (_line * gridSize - object.oCoords.tr.y - _l)/(corner.y - object.oCoords.mt.y)
                  //    }
                  //}
                } else {
                  let scale2 = (corner.y + object.width * object.scaleY - ((_line - 1) * gridSize + _l)) / object.width
                  let opt = {
                    top: object.oCoords.bl.y - (object.oCoords.bl.y - object.top) / object.scaleY * scale2,
                    scaleY: scale2
                  }
                  //if(_corner_name != "mt"){
                  //    opt.left =  object.oCoords.bl.y - (object.oCoords.bl.y - object.left)/object.scaleY * scale2
                  //}
                }
                object.set(opt)
                return {value: object.left + (corner.y - object.oCoords.tl.y), corner: _corner_name}
              }
            }
          }
          return false
        }
      },
      Object: {
        snappable: true
      }
    }
  }
}

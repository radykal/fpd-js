
import ResizeObserverPolyfill from "../../polyfills/resize-observer.js"

function isVisible(elem) {
  if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
  const style = getComputedStyle(elem);
  if (style.display === 'none') return false;
  if (style.visibility !== 'visible') return false;
  if (style.opacity < 0.1) return false;
  if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
      elem.getBoundingClientRect().width === 0) {
    return false;
  }
  const elemCenter   = {
    x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
    y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
  };
  if (elemCenter.x < 0) return false;
  if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
  if (elemCenter.y < 0) return false;
  if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
  let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
  do {
    if (pointContainer === elem) return true;
  } while (pointContainer = pointContainer.parentNode);
  return false;
}

function getElementOffset(el) {
  let rect = el.getBoundingClientRect();
  return {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft
  }
}

export const FmOuterCanvas = {
  name: "outer-canvas",
  install(){
    if(!window.ResizeObserver){
      window.ResizeObserver = ResizeObserverPolyfill;
    }
  },
  versions: {
    "4.X": {
      prototypes: {
        Object: {
          drawControls (ctx, styleOverride) {
            styleOverride = styleOverride || {};
            ctx.save();
            ctx.setTransform(this.canvas.getRetinaScaling(), 0, 0, this.canvas.getRetinaScaling(), 0, 0);

            if(fabric.__drawOuterCanvasOffset){
              ctx.translate(fabric.__drawOuterCanvasOffset.left, fabric.__drawOuterCanvasOffset.top);
            }

            ctx.strokeStyle = ctx.fillStyle = styleOverride.cornerColor || this.cornerColor;
            if (!this.transparentCorners) {
              ctx.strokeStyle = styleOverride.cornerStrokeColor || this.cornerStrokeColor;
            }
            this._setLineDash(ctx, styleOverride.cornerDashArray || this.cornerDashArray, null);
            this.setCoords();
            this.forEachControl(function(control, key, fabricObject) {
              if (control.getVisibility(fabricObject, key)) {
                control.render(ctx,
                    fabricObject.oCoords[key].x,
                    fabricObject.oCoords[key].y, styleOverride, fabricObject);
              }
            });
            ctx.restore();
            return this;
          }
        }
      }
    }
  },
  prototypes: {
    Canvas: {
      updateOuterCanvasContainer() {
        this._onOuterCanvasResize();
      },
      proxyEvents(functor, eventjsFunctor) {
        let canvas = this.outerCanvas;
        let addEventOptions = { passive: false };

        functor(canvas, 'mousedown', this._onMouseDown);
        functor(canvas, 'mousemove', this._onMouseMove, addEventOptions);
        functor(canvas, 'mouseout', this._onMouseOut);
        functor(canvas, 'mouseenter', this._onMouseEnter);
        functor(canvas, 'wheel', this._onMouseWheel);
        functor(canvas, 'contextmenu', this._onContextMenu);
        functor(canvas, 'dblclick', this._onDoubleClick);
        functor(canvas, 'touchstart', this._onMouseDown, addEventOptions);
        functor(canvas, 'touchmove', this._onMouseMove, addEventOptions);
        functor(canvas, 'dragover', this._onDragOver);
        functor(canvas, 'dragenter', this._onDragEnter);
        functor(canvas, 'dragleave', this._onDragLeave);
        functor(canvas, 'drop', this._onDrop);
        if (typeof eventjs !== 'undefined' && eventjsFunctor in eventjs) {
          eventjs[eventjsFunctor](canvas, 'gesture', this._onGesture);
          eventjs[eventjsFunctor](canvas, 'drag', this._onDrag);
          eventjs[eventjsFunctor](canvas, 'orientation', this._onOrientationChange);
          eventjs[eventjsFunctor](canvas, 'shake', this._onShake);
          eventjs[eventjsFunctor](canvas, 'longpress', this._onLongPress);
        }
      },
      /**
       * Set the cursor type of the canvas element
       * @param {String} value Cursor type of the canvas element.
       * @see http://www.w3.org/TR/css3-ui/#cursor
       */
      setCursor: function (value) {
        this.upperCanvasEl.style.cursor = value;
        if (this.outerCanvas) {
          this.outerCanvas.style.cursor = value;
        }
      },
      outerCanvasOpacity: 0,
      setOuterCanvasOpacity(value) {
        this.outerCanvasOpacity = value;
      },
      setOuterCanvasContainer(id) {
        this.outerCanvas = fabric.util.createCanvasElement();
        this.outerCanvas.style.cssText = "position: absolute; z-index: 0; left: 0px;top: 0px;";
        this.wrapperEl.style.zIndex = "1"
        this._outerCtx = this.outerCanvas.getContext("2d");

        let _parent = document.getElementById(id);
        _parent.append(this.outerCanvas);
        this._outerCanvasContainer = _parent;
        // fabric.window.addEventListener('resize', this._onOuterCanvasResize.bind(this));
        this.on('resize', "updateOuterCanvasContainer");

        this.resizeObserver = new ResizeObserver(() => this._onOuterCanvasResize())
        this.resizeObserver.observe(this._outerCanvasContainer);

        this._checkScrollWidth();
        this._onOuterCanvasResize();
        this._onBecomeVisible(this._outerCanvasContainer, this._onOuterCanvasResize.bind(this))

        this.proxyEvents(fabric.util.addListener, 'add');

        this._outerCanvasContainer.addEventListener('scroll', (e) => {
          this.drawOuterCanvas();
        })



        this.on("dispose",()=>{
          this.resizeObserver.unobserve(this._outerCanvasContainer);
          if(this._onBecomeVisibleInterval) {
            clearInterval(this._onBecomeVisibleInterval);
            delete this._onBecomeVisibleInterval
          }
        })

        return this;
      },
      _onBecomeVisible(el, callback) {
        if (isVisible(el)) {
          return callback();
        }
        this._onBecomeVisibleInterval = setInterval(function () {
              if (isVisible(el)) {
                clearInterval(this._onBecomeVisibleInterval);
                delete this._onBecomeVisibleInterval
                callback();
              }
            },
            100 // 0.1 second (wait time between checks)
        );
      },
      _checkScrollWidth() {
        let scrollDiv = document.createElement("div");
        scrollDiv.className = "scrollbar-measure";
        document.body.appendChild(scrollDiv);
// Get the scrollbar width
        this._scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        // console.warn(scrollbarWidth); // Mac:  15
// Delete the DIV
        document.body.removeChild(scrollDiv);
        this._scrollbarWidth = 0;
      },
      drawOuterCanvas: function () {
        if (!this.outerCanvas) return;
        let ctx = this._outerCtx;
        ctx.clearRect(0, 0, this.outerCanvas.width, this.outerCanvas.height);

        ctx.save();
        let innerPosition = this._getInnerPosition();
        ctx.translate(innerPosition.left, innerPosition.top);

        if (this.selection && this._groupSelector) {
          this._drawSelection(ctx);
        }

        ctx.globalAlpha = this.outerCanvasOpacity;

        this.calcViewportBoundaries();
        this.clearContext(ctx);

        if(this.outerCanvasOpacity){
          // if (this.contextContainer) {
          //   if (this.layers) {
          //     this.renderCanvasLayers();
          //   } else {
          //     this.renderCanvas(this.contextContainer, this._chooseObjectsToRender());
          //   }
          // }
          let objects = this._chooseObjectsToRender();

          this._renderBackground(ctx);
          ctx.save();
          let v = this.viewportTransform;
          ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
          this._renderObjects(ctx, objects);
          ctx.restore();
          this._renderOverlay(ctx);
        }
        ctx.globalAlpha = 1;
        fabric.__drawOuterCanvasOffset = innerPosition
        this.drawControls(ctx);
        delete fabric.__drawOuterCanvasOffset
        ctx.restore()
      },
      renderTopLayer(ctx) {
        if (this.isDrawingMode && this._isCurrentlyDrawing) {
          this.freeDrawingBrush && this.freeDrawingBrush._render();
          this.contextTopDirty = true;
        }
        if (this.outerCanvas) {
          this.drawOuterCanvas()
        }
        // we render the top context - last object
        if (this.selection && this._groupSelector) {
          this._drawSelection(ctx);
          this.contextTopDirty = true;
          if (this.outerCanvas) {
            ;
          }
        }
      },
      _getInnerPosition() {

        let parent = this._outerCanvasContainer;
        let scroll = {
          top: parent.scrollTop || 0,
          left: parent.scrollLeft || 0
        }
        let computed = getComputedStyle(parent, null)

        let canvasWrapperoffset = getElementOffset(this.wrapperEl);
        let outerWrapperOffset = getElementOffset(this._outerCanvasContainer);
        // let _innerPosition = absolutePosition(this.wrapperEl);
        // let _outerPosition = absolutePosition(this._outerCanvasContainer);
        return {
          left: canvasWrapperoffset.left - outerWrapperOffset.left + scroll.left - parseInt(computed.borderLeftWidth),
          top: canvasWrapperoffset.top - outerWrapperOffset.top + scroll.top - parseInt(computed.borderTopWidth)
        }
      },
      _onOuterCanvasResize() {
        let parent = this._outerCanvasContainer;
        this.outerCanvas.width = parseInt(parent.clientWidth);
        this.outerCanvas.height = parseInt(parent.clientHeight);
        this.drawOuterCanvas();
      },
      outerCanvas: null
    }
  }
}

//todo
//check scroll events
//set outercnavs position as $0.scrollTop and $0.scrollLeft
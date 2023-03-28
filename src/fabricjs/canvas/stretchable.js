
export default {
  name: "stretchable",
  prototypes: {
    Canvas: {
      /**
       * makes canvas responsible. Canvas will be scaled to 100% of its container size
       */
      stretchable: false,
      _onResize: function () {
        if (this.stretchable) {
          let _parent = this.getScrollContainer();
          if (!_parent) return;
          // let _margin = this.application && this.application.widthMargin || 0;
          let _margin = this.stretchable.margin || 0;
          let _w = _parent.offsetWidth - _margin * 2,
            _h = _parent.offsetHeight - _margin * 2;
          if (this.stretchable.maxWidthRate) {
            _w *= this.stretchable.maxWidthRate;
          }
          if (this.stretchable.maxHeightRate) {
            _w *= this.stretchable.maxHeightRate;
          }
          if (this.stretchable.maxWidth) {
            _w = Math.min(this.stretchable.maxWidth, _w);
          }
          if (this.stretchable.maxHeight) {
            _h = Math.min(this.stretchable.maxHeight, _h);
          }
          if (_w <= 0 || _h <= 0) return;
          if (this.editor && this.editor.onResize) {
            this.editor.onResize({
              width: _w,
              height: _h
            }, {
              width: this.originalWidth,
              height: this.originalHeight
            });
            this.calcOffset();
          } else {
            if (this.stretchable.action === "zoom") {
              let proportions = fabric.util.getProportions(
                {width: this.originalWidth, height: this.originalHeight},
                {width: _w, height: _h}
              );
              this.setZoom(proportions.scale);
              this.setDimensions(proportions);
            } else {
              //   this.canvas.centerAndZoomOut();
              this.setDimensions({
                width: _w /*- _offset.left*/,
                height: _h /*- _offset.top*/
              });
            }
          }
        } else {
          this.calcOffset();
        }
      },
      getScrollContainer() {
        if (this._scrollContainer) return this._scrollContainer;
        if (!this.wrapperEl.parentNode) return;

        function getScrollContainer(el) {
          do {
            if (window.getComputedStyle(el).overflow !== "visible") {
              return el;
            }
            el = el.parentElement;
          } while (el);
          return document.body;
        }

        this._scrollContainer = getScrollContainer(this.wrapperEl.parentNode);
        return this._scrollContainer;
      },
      setStretchable(val) {
        this.stretchable = val;
        if (this.lowerCanvasEl) {
          this._onResize();
        }
      }
    }
  }
}

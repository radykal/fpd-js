'use strict';


require("../modules/pathfinder");
//fabric.require("SlideImage",["SlideObject"/*,"Pathfinder"*/],function() {

Object.assign(fabric.Image.prototype, {
  contentOffsets: null,
  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   * @param {Boolean} noTransform
   */
  _render: function (ctx, noTransform) {
    var x, y, imageMargins = this._findMargins(), elementToDraw;

    x = (noTransform ? this.left : -this.width / 2);
    y = (noTransform ? this.top : -this.height / 2);

    if (this.meetOrSlice === 'slice') {
      ctx.beginPath();
      ctx.rect(x, y, this.width, this.height);
      ctx.clip();
    }

    if (this.isMoving === false && this.resizeFilters.length && this._needsResize()) {
      this._lastScaleX = this.scaleX;
      this._lastScaleY = this.scaleY;
      elementToDraw = this.applyFilters(null, this.resizeFilters, this._filteredEl || this._originalElement, true);
    }
    else {
      elementToDraw = this._element;
    }
  //todo fill all background
    //  this._renderFill(ctx);
    elementToDraw && ctx.drawImage(elementToDraw,
      x + imageMargins.marginX,
      y + imageMargins.marginY,
      imageMargins.width,
      imageMargins.height
    );

    this._stroke(ctx);
    this._renderStroke(ctx);
  },
  imageTools: false,
  photoshopTools: false,
  cloneSync: function () {
    var _object = this.toObject();
    delete _object.filters;
    var clone = new fabric.Image(this._element, _object);
    clone._filteredEl = this._filteredEl;
    clone.filters = this.filters;
    return clone;
  },
  revertChanges: function () {
    var pathfinder = this.canvas.getPathfinder();
    if (pathfinder.target && pathfinder.target == this) {
      pathfinder.hide();
    }

    if (this._element == this._originalElement) {
      return;
    }

    this.filters.length = 0;
    if (this._filteredEl) {
      delete this._filteredEl;
    }
    delete this._edited;
    this._element = this._originalElement;

    this.fire("content:modified", {
      bounds: {minX: 0, minY: 0, maxX: this._element.width, maxY: this._element.height}
    });


    this.canvas.renderAll();
  },
  extractColors: function() {
    var _colors = fabric.MagicWand.extractColors(this._element);
    var colors = {};
    for(var i in _colors){
      var _str = "rgb(" + _colors[i].join(",") + ")";
      colors[_str] = {};
    }
    return colors;
  },
  actions: Object.assign( fabric.Image.prototype.actions, {
    photoshopTools: {
      type: 'effect',
      effectTpl: '<div id="editor-tools" class="inline-actions compact"></div>' +
                    '<div class="checkboard" ><div id="pathfinder"></div></div>',
      className: 'fa fa-pencil-square-o',
      title: "advanced tools",
      action: function () {
        var pathfinder = this.canvas.getPathfinder();
        pathfinder.target = this;
        pathfinder.setPicture(this._element);
        pathfinder.show();
      },
      actionParameters: function (el, data) {

        var pathfinder = this.canvas.getPathfinder();
        pathfinder.canvas = this.canvas;

        new fabric.Toolbar(pathfinder, 'editor-tools');


        pathfinder.setContainer('pathfinder');

        // if (pathfinder.target)pathfinder.hide();
        pathfinder.target = this;
        pathfinder.setPicture(this._element);
        pathfinder.show();
      }
    },
    revertChanges: {
      className: 'fa fa-history',
      title: "revert to orignal image",
      action: "revertChanges",
      observe: "content:modified",
      visible: function () {
        return !!this._filteredEl || this._edited;
      }
    }
  })
});

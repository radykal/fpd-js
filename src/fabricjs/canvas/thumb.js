fabric.util.createThumb = function(slide, $canvasEl){

  var _canvas = slide,
      firstDraw = true,
      modified,
      _w = +$canvasEl.getAttribute("width"),
      _h = +$canvasEl.getAttribute("height");

  if (_h) {
    $canvasEl.style.height = $canvasEl.height;
  }

  function renderThumb() {
    if (_canvas.processing || !_canvas.loaded) {
      return false;
    }
    _canvas.renderThumb($canvasEl);
    modified = _canvas.modified;
  }

  function forceRenderThumb() {
    if (this.loaded) {
      this.renderThumb($canvasEl);
    }else if(this.thumb){
      var img = new Image();
      img.onload = function () {
        var ctx = $canvasEl.getContext("2d");
        ctx.clearRect(0, 0, $canvasEl.width, $canvasEl.height);
        ctx.drawImage(img, 0, 0, $canvasEl.width, $canvasEl.height);
        modified = this.modified;
      };
      img.src = this.thumb;
    }
    // //if (attrs.force !== "true") return;
    // var canvas = new fabric.Canvas(null, this.data, function () {
    //   canvas.renderThumb($canvasEl);
    //   //modified = slide.modified;
    // });
  }

  function scaleThumb() {

    var _fitSize = fabric.util.getProportions(
      {
        width: slide.originalWidth || slide.width,
        height: slide.originalHeight || slide.height
      },{
        width: _w,
        height: _h
      },"contain");

    $canvasEl.width = _fitSize.width;
    $canvasEl.height = _fitSize.height;

    $canvasEl.style.width = _fitSize.width + 'px';
    $canvasEl.style.height = _fitSize.height  + 'px';
    renderThumb();
  }

  slide.on({
    'after:render': renderThumb,
    'dimensions:modified': scaleThumb,
    'loading:end': scaleThumb,
    'modified': forceRenderThumb
  });


  $canvasEl.setAttribute("title", slide.title);

  scaleThumb.call(slide);
  forceRenderThumb.call(slide);
};



Object.assign(fabric.StaticCanvas.prototype, {
  ____store_thumb: function (){
    let size = fabric.util.getProportions(this.getOriginalSize(), this.thumbSize, 'contain');
    let canvas = fabric.util.createCanvasElement();
    canvas.width = size.width;
    canvas.height = size.height;
    this.renderThumb(canvas);
    return canvas.toDataURL();
  },
  renderThumb: function (canvas, options) {
    options = options || {
        objects: true,
        clipped_area_only: false,
        draw_background: true
      };

    let _zoom;
    if (options.zoom) {
      _zoom = options.zoom;
    } else {
      if (canvas.width) {
        _zoom = canvas.width / (this.originalWidth || this.width)
      } else {
        _zoom = 1;
      }
    }
    let _old_Scale = this.viewportTransform[0];
    let old_x = this.viewportTransform[4];
    let old_y = this.viewportTransform[5];
    this.viewportTransform[4] = this.viewportTransform[5] = 0;
    this.viewportTransform[0] = this.viewportTransform[3] = 1;
    this.viewportTransform[0] = this.viewportTransform[3] = _zoom;

    if (this.clipRect) {
      this.clipRect.setOpacity(0);
    }

    let size = {
      width: this.originalWidth || this.width,
      height: this.originalHeight || this.height
    };
    size.width = Math.ceil(size.width * _zoom);
    size.height = Math.ceil(size.height * _zoom);

    let _canvas = fabric.util.createCanvasElement();
    _canvas.width = size.width;
    _canvas.height = size.height;

    let canvasToDrawOn = _canvas.getContext('2d');

    this._exporting = true;
    this.renderCanvasLayers(canvasToDrawOn);
    delete this._exporting;

    if (this.clipRect) {
      this.clipRect.setOpacity(1);
    }
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let _rect;
    if (options.clipped_area_only && this.clipRect) {
      _rect = {
        left: this.clipRect.left * _zoom,
        top: this.clipRect.top * _zoom,
        width: this.clipRect.width * _zoom,
        height: this.clipRect.height * _zoom
      };
    } else {
      _rect = {
        left: options.left * _zoom || 0,
        top: options.top * _zoom || 0,
        width: options.width * _zoom || size.width,
        height: options.height * _zoom || size.height
      };
    }
    if (options.angle) {
      ctx.rotate(-options.angle * Math.PI / 180);
      ctx.drawImage(_canvas,
        0, 0, _rect.width + _rect.left + _canvas.width, _rect.height + _rect.top + _canvas.height,
        -_rect.left, -_rect.top, canvas.width + _rect.left + _canvas.width, canvas.height + _rect.top + _canvas.height);
    } else {
      ctx.drawImage(_canvas, _rect.left, _rect.top, _rect.width, _rect.height, 0, 0, canvas.width, canvas.height);
    }

    this.viewportTransform[0] = this.viewportTransform[3] = _old_Scale;
    // this._update_background_image();
    //this._update_clip_rect();
    this.viewportTransform[4] = old_x;
    this.viewportTransform[5] = old_y;


    return canvas;
  }
});

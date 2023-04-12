
Object.assign(fabric.Text.prototype, {

  rasterizeKlass: fabric.Image,
  _render_cache: function (ctx) {
    ctx.save();
    ctx.scale(
      this.scaleX * (this.flipX ? -1 : 1),
      this.scaleY * (this.flipY ? -1 : 1)
    );
    this.transform(ctx);
    this._setShadow(ctx);
    ctx.translate(-this.width / 2, -this.height / 2);
    ctx.drawImage(this._cache, 0, 0, this.width, this.height);
    ctx.restore();
  },
  updateCache: function () {
    var _multiply = fabric.DPI / 96 ;
    var size = {
      width: Math.ceil(this.width * this.scaleX * _multiply),
      height: Math.ceil(this.height * this.scaleY * _multiply)
    };

    var _clipTo = this.clipTo;
    delete this.clipTo;
    this._cache = fabric.util.createCanvasElement();
    this._cache.setAttribute('width', size.width);
    this._cache.setAttribute('height', size.height);
    var ctx = this._cache.getContext("2d");
    ctx.scale(
      this.scaleX * _multiply,
      _multiply);
    ctx.translate(this.width / 2, this.height / 2);

    this.render(ctx, true);
    // this.render = this._render_cache;
    this.clipTo = _clipTo;
  },
  replaceWithRaster: function (callback) {

    this.createRaster(img => {
      var obj = this.toObject();
      obj.width = img.width;
      obj.height = img.height;
      obj.scaleX = this.scaleX * (this.height / img.height);
      obj.scaleY = this.scaleY * (this.width / img.width );
      obj.rasterizedType = obj.type;
      delete obj.type;

      var el = new this.rasterizeKlass(img, obj);
      this.canvas.add(el);
      this.canvas.remove(this);
      setTimeout(function () {
        this.canvas.setActiveObject(el);
        this.canvas.renderAll();
        callback(el);
      }.bind(this))

    })
  },
  createRaster: function (callback) {
    this.updateCache();
    var img = fabric.util.createImage();

    img.onload = function () {
      callback(img);
    }.bind(this);
    img.src = this._cache.toDataURL();
    //this.on('modified',this.updateCache.bind(this));
  }
});

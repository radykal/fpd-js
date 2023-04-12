Object.assign(fabric.BaseBrush.prototype, {
  useDrawingColor: true,
  setOptions: function (options) {
    for (var prop in options) {
      this[prop] = options[prop];
    }
  },
  type: "base-brush",
  initialize: function (canvas, options) {
    this.canvas = canvas;
    options = options || {};

    if(this.canvas.editor){
      this.editor = this.canvas.editor;
    }
    fabric.fire("entity:created", {target: this, options: options})
    this.setOptions(options);
  },
  convertColor: function (color, type) {
    type = type || "name";
    if (color instanceof Array) {
      if (type == "source") {
        return color;
      }
      color = "#" + fabric.Color.fromSource(color).toHex();
    }
    if (type == "hex" || type == "source") {
      if (fabric.Color.colorNameMap[color]) {
        color = fabric.Color.colorNameMap[color];
      }
      if (type == "source") {
        if (color == "transparent") {
          return [0, 0, 0, 0];
        }
        var _source = fabric.Color.fromHex(color).getSource()
        _source[3] *= 255;
        return _source;
      }
    }
    return color;
  },
  getColor: function (type) {
    var color = this.useDrawingColor && this.canvas.drawingColor || this.color;
    return this.convertColor(color, type);
  }
});


fabric.CircleBrush.prototype.type = "circle-brush";
fabric.SprayBrush.prototype.type = "spray-brush";
fabric.PatternBrush.prototype.type = "pattern-brush";

var Caman = require('./../../plugins/caman').Caman;
function registerCamanFilter(filterName) {
  var cap = fabric.util.string.capitalize(filterName, true);
  fabric.Image.filters[cap] = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
    type: filterName,
    applyTo: function (canvasEl) {

      var context = canvasEl.getContext('2d');
      var _caman = Caman(canvasEl);


      _caman[fabric.util.string.uncapitalize(this.type)]();
      _caman.render(function () {
        context.putImageData(this.imageData, 0, 0);
      });


    }
  });
  fabric.Image.filters[cap].fromObject = function (o) {
    return new fabric.Image.filters[cap](o);
  };

  fabric.Image.filters[cap].prototype.caman = true;
}
registerCamanFilter("lomo");
registerCamanFilter("sinCity");
registerCamanFilter("crossProcess");
registerCamanFilter("orangePeel");
registerCamanFilter("love");
registerCamanFilter("grungy");
registerCamanFilter("jarques");
registerCamanFilter("pinhole");
registerCamanFilter("oldBoot");
registerCamanFilter("glowingSun");
registerCamanFilter("hazyDays");
registerCamanFilter("herMajesty");
registerCamanFilter("nostalgia");
registerCamanFilter("hemingway");
registerCamanFilter("concentrate");

fabric.Image.filters.Caman = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  type: 'custom',
  parameters: [
    "brightness",
    "contrast",
    "saturation",
    "vibrance",
    "exposure",
    "hue",
    "sepia",
    "gamma",
    "noise",
    "clip",
    "sharpen",
    "stackBlur"
  ],
  initialize: function (options) {
    if (options)delete options.type;
    Object.assign(this,options)
  },
  applyTo: function (canvasEl) {
    var context = canvasEl.getContext('2d');
    var _caman = Caman(canvasEl);

    for (var i in this.parameters) {
      var _par = this.parameters[i];
      if (this[_par]) {
        _caman[_par](this[_par]);
      }
    }
    _caman.render(function () {
      context.putImageData(this.imageData, 0, 0);
    });
  },
  toObject: function () {
    return this.callSuper('toObject',this.parameters);
  }
});

fabric.Image.filters.Caman.prototype.options = {
  "brightness":   {value: 0, min: -100, max: 100},
  "contrast":     {value: 0, min: -100, max: 100},
  "saturation":   {value: 0, min: 0, max: 100},
  "vibrance":     {value: 0, min: -100, max: 100},
  "exposure":     {value: 0, min: -100, max: 100},
  "hue":          {value: 0, min: 0, max: 100},
  "sepia":        {value: 0, min: 0, max: 100},
  "gamma":        {value: 0, min: 0, max: 10},
  "noise":        {value: 0, min: 0, max: 100},
  "clip":         {value: 0, min: 0, max: 100},
  "sharpen":      {value: 0, min: 0, max: 100},
  "stackBlur":    {value: 0, min: 0, max: 100}
};

fabric.Image.filters.Caman.prototype.custom = true;
fabric.Image.filters.Caman.prototype.caman = true;

fabric.Image.filters.Caman.fromObject = function (o) {
  return new fabric.Image.filters.Caman(o)
};

fabric.Image.prototype.availableFilters.concat([
  "Lomo",
  "SinCity",
  "CrossProcess",
  "OrangePeel",
  "Love",
  "Grungy",
  "Jarques",
  "Pinhole",
  "OldBoot",
  "GlowingSun",
  "HazyDays",
  "HerMajesty",
  "Nostalgia",
  "Hemingway",
  "Concentrate",
  "Caman"
]);

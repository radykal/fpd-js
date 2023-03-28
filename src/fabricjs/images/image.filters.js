{

  /*
   fabric.Image.filters.Redify = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
   type: 'Redify',
   applyTo: function (canvasEl) {
   let context = canvasEl.getContext('2d'),
   imageData = context.getImageData(0, 0,
   canvasEl.width, canvasEl.height),
   data = imageData.data;
   for (let i = 0, len = data.length; i < len; i += 4) {
   data[i + 1] = 0;
   data[i + 2] = 0;
   }
   context.putImageData(imageData, 0, 0);
   }
   });
   fabric.Image.filters.Redify.fromObject = function (object) {
   return new fabric.Image.filters.Redify(object);
   };
   */

  fabric.Image.filters.Sharpen = fabric.util.createClass(fabric.Image.filters.Convolute, {
    type: 'Sharpen',
    matrix: [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
    ]
  });


  fabric.Image.filters.Emboss = fabric.util.createClass(fabric.Image.filters.Convolute, {
    type: 'Emboss',
    matrix: [
        1,   1,   1,
        1, 0.7,  -1,
        -1,  -1,  -1
    ]
  });


  if(fabric.Image.filters.Mask){
    fabric.Image.filters.Mask.prototype.maskFilter = true;
  }

  let prototypeOptions = {
    Brightness: {
      "brightness": {value: 100, min: 0, max: 255}
    },
    Noise: {
      "noise": {value: 100, min: 0, max: 1000}
    },
    Convolute: {
      "opaque": {value: true, type: "boolean" },
      "matrix": {value: [1, 1, 1, 1, 1, 1, 1, 1, 1], type: "matrix" }
    },
    Blur: {},
    Sharpen: {},
    Emboss: {},
    Pixelate: {
      "blocksize": {value: 4, min: 2, max: 20}
    },
   /* Multiply: {
      "color": {type: 'color', value: "#F0F"}
    },
    Mask: {
      mask: {
        type: 'image',
        value: {
          src:  "photos/explosion.png"
        }
      },
      channel: { value: 0}
    },
    Tint: {
    "color":  {type: 'color', value: "#3513B0"},
    "opacity": {value: 1, min: 0, max: 1, step: 0.1}
    },
    Blend: {
    "color": {type: 'color', value: "#3513B0"},
    "mode": {
    value: "add",
    options: [
    {value: "add", title: "Add"},
    {value: "diff", title: "Diff"},
    {value: "subtract", title: "Subtract"},
    {value: "multiply", title: "Multiply"},
    {value: "screen", title: "Screen"},
    {value: "lighten", title: "Lighten"},
    {value: "darken", title: "Darken"}
    ]
    }
    }
    */
  };
  for(let i in prototypeOptions){
    fabric.Image.filters[i].prototype.options = prototypeOptions[i];
  }

}



fabric.util.object.extend(fabric.Editor.prototype, {

  getFiltersList: function(el) {

    el = el || fabric.Image.prototype;
    let filterList = [];
    for (let i in el.availableFilters) {
      let _f = fabric.Image.filters[el.availableFilters[i]];

      let _data = {
        type: el.availableFilters[i]
      };
      if (_f.prototype.custom) {
        if (!el.customFilters) {
          continue;
        }
      }
      if (_f.prototype.maskFilter) {
        if (!el.maskFilter) {
          continue;
        }
      }
      if (_f.prototype.caman) {
        if (!el.camanFilters) {
          continue;
        }
        _data.caman = true;
      } else {
        if (!el.fabricFilters) {
          continue;
        }
      }
      if (_f.prototype.options) {
        _data.options = fabric.util.clone(_f.prototype.options);
      }
      _data.text = _f.prototype.title || el.availableFilters[i];

      filterList.push(_data)
    }
    return filterList;
  }
});

Object.assign(fabric.Image.prototype, {
  camanFilters: false,
  fabricFilters: true,
  customFilters: false,
  maskFilter: false,
  availableFilters: [
    //fabricJS
    "BlackWhite",
    "BlendColor",
    "BlendImage",
    "Blur",
    "Brightness",
    "Brownie",
    "ColorMatrix",
    "Composed",
    "Contrast",
    // "Convolute",
    // "Emboss",
    "Gamma",
    "Grayscale",
    "HueRotation",
    "Invert",
    "Kodachrome",
    "Noise",
    "Pixelate",
    "Polaroid",
    "RemoveColor",
    "Saturation",
    "Sepia",
    // "Sharpen",
    "Technicolor",
    "Vintage"
  ],
  getFilter: function (filterName) {
    filterName = fabric.util.string.uncapitalize(filterName);
    for(let i in this.filters){
      if(fabric.util.string.uncapitalize(this.filters[i].type) === filterName){
        return this.filters[i];
      }
    }
    return false;
  },
  setFilters: function (filters) {

    this.saveState(["filters"]);

    this.filters = [];
    if(filters){
      for(let filterOptions of filters){
        //todo replace with application.createObject
        let filterName = fabric.util.string.capitalize(fabric.util.string.camelize(filterOptions.type),true);
        let filter = new fabric.Image.filters[filterName](filterOptions);
        filter.image = this;
        this.filters.push(filter);
      }
    }
    if(this._originalElement){
      this.applyFilters();
    }
    if(this.canvas){
      this.canvas.fire('object:modified', {target: this});
      this.canvas.renderAll();
    }
    this.fire('modified', {} );
  },
  getFiltersOptionsList(){
    let filters = this.editor.getFiltersList(this);
    for (let i in this.filters) {
      let _f = filters.find(item => (item.type === fabric.util.string.capitalize(this.filters[i].type)));
      if(_f){
        _f.enabled = true;
      }
    }

    for (let i in filters) {
      filters[i].id = filters[i].type;
    }
    return [{
      id: 'none',
      text: 'original',
      enabled: !this.filters || !this.filters.length,
      value: false
    }].concat(filters.map(item => ({
      id: item.type,
      value: {
        id: item.type,
        options: item.options
      }
    })));
  },
  createFilterThumbnail(filters, width, height){
    if (!fabric.filterBackend) {
      fabric.filterBackend = fabric.initFilterBackend();
      fabric.isWebglSupported(fabric.textureSize);
    }

    let sourceImage = this.target._originalElement || this.target._element;

    if(!sourceImage){
      return;
    }

    let canvas = fabric.util.createCanvasElement();
    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(sourceImage,0,0,this.dropdown.previewWidth,this.dropdown.previewHeight);

    let fImage = fabric.util.createObject({
      editor: this.target.editor,
      type: this.target.type ,
      element: canvas,
      filters: filters
    });
    return fImage._element;
  },
  setFilter: function (filter) {
    this.saveState(["filters"]);


    let _old_filter = false;
    if(filter.replace){
      this.filters = [];
    }else{
      _old_filter = this.filters.find(item => item.type === filter.type);
      // _old_filter = fabric._.findWhere(this.filters, {type: filter.type});
      _old_filter = _old_filter && _old_filter.toObject() || false;
    }

    let _type;
    let _new_filter;

    if(filter.type){
      _type = fabric.util.string.capitalize(filter.type,true);
      _new_filter = filter.options && fabric.util.clone(filter.options);
    }else{
      _type = false;
      _new_filter = false;
    }
    this._set_filter(_type, _new_filter, _old_filter);

    if(this.canvas){
      this.canvas.renderAll();
      this.canvas.fire('object:modified', {target: this});
    }
    this.fire('modified', {} );
  },
  _set_filter: function (_type, _new_filter) {
    let _old_filter;

    if(_type){
      _old_filter = this.getFilter(_type);
    }

    if (_old_filter && _new_filter) {
      for (let i in _new_filter) {
        _old_filter[i] = _new_filter[i];
      }
    } else if (_old_filter && !_new_filter) {
      this.filters.splice(this.filters.indexOf(_old_filter), 1);
    }
    if (!_old_filter && _new_filter) {
      var filter = new fabric.Image.filters[_type](_new_filter);
      filter.image = this;
      this.filters.push(filter);
    }
    if(this._originalElement){
      this.applyFilters();
    }
  }
});

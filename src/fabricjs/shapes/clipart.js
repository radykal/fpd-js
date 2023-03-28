fabric.Clipart = fabric.util.createClass(fabric.Group, {
  type: 'clipart',
  colors: null,
  stateProperties: fabric.Group.prototype.stateProperties.concat(["colors"]),
  initialize: function (options,callback) {
    fabric.Object.prototype.initialize.call(this, options, callback);
  },
  setElements(objects){
    let canvas_processing;
    if(this.canvas){
      canvas_processing = this.canvas.processing;
      this.canvas.processing = true;
    }
    this.fire("loaded");

    let group;

    if(objects.length === 1){
      objects[0].top = - this.height /2;
      objects[0].left = - this.width /2;
      if(!this.width){
        this.width = objects[0].width
      }
      if(!this.height){
        this.height = objects[0].height
      }
    }else{
      group = fabric.util.groupSVGElements(objects);
      if(!this.width){
        this.width = group.width
      }
      if(!this.height){
        this.height = group.height
      }
    }


    this._isAlreadyGrouped = true;
    this.setObjects(objects);

    if(this.canvas) {
      this.canvas.processing = canvas_processing;
    }
  },
  async setSvg (value, callback) {
    fabric.loadSVGFromString(value,  (objects, options) => {
      this.setElements(objects);
      callback && callback();
    });
  },
  async setSrc (src, callback) {
    this._src = src;
    this.fire("before:load");
    if(this.getURL){
      src = this.getURL(src,"source");
    }
    this.src = fabric.util.getURL(src, this.sourceRoot);

    let {objects, options} = await fabric.util.loadSvg(this.src);
    this.setElements(objects);
    callback && callback();
  },
  _onSourceLoaded(){

  },


  actions: {
    // source: {
    //   type: 'effect',
    //   className: 'fa fa-file-image-o',
    //   title: "source",
    //   actionParameters: function ($element, data) {
    //     this.editor.createElementsList($element, this.editor.getLibraryElements({category: "clipart"}) );
    //     //  data.target.editor.createGallery(data.target, $el, data);
    //   }
    // },
    colors: {
      type: 'menu',
      title: 'color menu',
      menu: function () {
        var _menu = [];
        for (var key in this._colors) {
          _menu.push({
            title: "Color (" + key + ")",
            value: {
              defaultValue: key,
              value: this.colors[key] || key,
              get: function (key) {
                return this.colors[key] || key;
              }.bind(this, key),
              set: this.setClipartColor.bind(this, key)
            },
            type: "color"
          })
        }
        return _menu;
      }
    }
  }
});

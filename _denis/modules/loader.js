

Object.assign(fabric.StaticCanvas.prototype, {
  createLoader(){
    this._loader = fabric.util.createObject(this.loader,{
      canvas: this,
      editor: this.editor,
      layer: "loader",
      statefullCache: true,
      originX: "center",
      originY: "center",
      stored: false,
      selectable: false,
      evented: false,
      hasControls: false
    });
    let position  = this.editor.getDefaultProperties(this._loader.type).position;
    if(position){
      this._loader.setPosition(position);
    }

    this.on("loading:begin processing:start", this._showMainLoaderIndicator.bind(this));
    this.on("loading:end processing:end", this._hideMainLoaderIndicator.bind(this));

    this._showMainLoaderIndicator();
  },
  setLoader(value){
    this.loader = value;
    this.createLoader();
  },
  _showMainLoaderIndicator: function (e) {
    $(this.wrapperEl).addClass("loading");
    this._loader.fire("added");
    this.renderAll();
    // if(this._loader._objects){
    //   for(let object of this._loader._objects){
    //     object.fire("added");
    //   }
    // }
  },
  _hideMainLoaderIndicator: function (e) {
    $(this.wrapperEl).removeClass("loading");
    this._loader.fire("removed");
    this.renderAll();
    // if(this._loader._objects){
    //   for(let object of this._loader._objects){
    //     object.fire("removed");
    //   }
    // }
  },
});

Object.assign(fabric.Editor.prototype, {
  pending: false,
  setPending: function(val){
    this.pending = val;
    if(val){
      if(this.canvas){
        this.canvas.interactive = false;
      }
      if(this.slides){
        for(let slide of this.slides){
          slide.interactive = false;
        }
      }
    }
  },
  loader: {
    container: "",
    template: "<div class='canvas-loader'><span class='loader-spinner fa fa-pulse fa-spinner canvas-load-spinner'></span><span class='loader-message'>Loading...</span></div>",
    // icon:   'data:image/svg+xml;base64,' + require('base64-loader!./../media/loader.svg'),
  },
  _showMainLoaderIndicator: function (e) {
    if(this.canvasContainer.constructor !== HTMLCanvasElement){
      $(this.canvasContainer).append(this._loaderElement);
    }
    $(this.canvasContainer).addClass("loading");
  },
  _hideMainLoaderIndicator: function (e) {
    if(this.pending){
      this.pending = false;
      return;
    }
    this._loaderElement.remove();
    $(this.canvasContainer).removeClass("loading");
  },
  setLoader: function (val) {
    if(!val)return;
    if(val.constructor === String){
      val = {
        id: val
      }
    }
    if(val.id){
      this._loaderElement = $(document.getElementById(val.id));
    }
    if(val.template){
      this.loader.template = val.template.replace("{loaderIcon}",this.loader.icon);
      this._loaderElement = $(this.loader.template);
    }
    if(val) {
      // this.loader.container = $(val.container);
      // this.loader.element = $(val.template).hide();
      // this.on("loading:begin", this._showMainLoaderIndicator);
      // this.on("loading:end", this._hideMainLoaderIndicator);
      if(this._loading){
        this._showMainLoaderIndicator()
      }
      if(val.pending){
        this._showMainLoaderIndicator()
      }
      this.on("loading:begin", this._showMainLoaderIndicator.bind(this));
      this.on("loading:end", this._hideMainLoaderIndicator.bind(this));
      // this.on("slide:loading:begin", this._showMainLoaderIndicator.bind(this));
      // this.on("slide:loading:end", this._hideMainLoaderIndicator.bind(this));


    }
  }
});


// Object.assign(fabric.Canvas.prototype, {
//   // loaderTemplate: "<span class='fa fa-pulse fa-spinner canvas-load-spinner'></span>",
//   setLoaderTemplate: function (val) {
//     if(this.virtual) return false;
//     this.loaderTemplate = val;
//     if(val) {
//       this.loaderEl = $(this.loaderTemplate).hide();
//       $(this.wrapperEl).append(this.loaderEl);
//       this.on("loading:begin", function () {
//         this.loaderEl.show();
//         $(this.wrapperEl).addClass("loading");
//       });
//       this.on("loading:end", function () {
//         this.loaderEl.hide();
//         $(this.wrapperEl).removeClass("loading");
//       });
//     }
//   }
// });

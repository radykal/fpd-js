

Object.assign(fabric.Canvas.prototype, {
  eventListeners: fabric.util.merge(fabric.Canvas.prototype.eventListeners, {
    'modified draw:after object:modified canvas:cleared object:added object:removed group:removed': function saveJsCallApplicationModifiedEvent(){
      // this.application.fire("modified");

      if(this.editor && this.editor.autoSave && !this.editor.processing){
        this.editor.save();
      }
    }
  })
});
Object.assign(fabric.Editor.prototype, {
  eventListeners: fabric.util.merge(fabric.Editor.prototype.eventListeners, {
    modified: function(){
      if(this.autoSave){
        this.save();
      }
    }
  }),
  autoSave:false,
  productID: fabric.window.location.href,
  _get_storage_id(){
    return this.id + "_" + this.productID;
  },
  loadState: function(){
    let productData = localStorage.getItem(this._get_storage_id());
    if (productData) {
      productData = JSON.parse(productData);
      this.set(productData);
    }
    else{
      this.set({
        slides: {}
      });
    }
  },
  saveURL: "/save",
  saveOnServer: function(){
    let data = this.getExportData();
    $.post(this.saveURL, {data: JSON.stringify(data),file: this.filename }) .fail(function (result) {
      console.error("save", result);
      return {};
    })
    .then(function (result) {
      console.log(result);
    })
  },
  saveStateInLocalStorage: function(){
    let data = this.getExportData();
    localStorage.setItem(this._get_storage_id(), JSON.stringify(data));
  }
});

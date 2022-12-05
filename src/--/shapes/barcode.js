import QRCode from '../../plugins/qrcode.js'

//todo image-rendering: pixelated; when rendering SVG iamage
fabric.Barcode = fabric.util.createClass(fabric.Image, {
  fitting: "fill",
  optionsOrder: fabric.util.a.build(fabric.Image.prototype.optionsOrder).before("correctLevel","text").array,
  initialize: function (options,callback) {
    options || (options = {});
    this.callSuper('initialize', options,callback);
  },
  type: 'barcode',
  storeProperties: fabric.Object.prototype.storeProperties,
  stateProperties: fabric.Image.prototype.stateProperties.concat(["text"]),
  correctLevel: QRCode.CorrectLevel.L,
  width:  256,
  height: 256,
  setText: function(text){
    this.text = text;
    this.qrcode = new QRCode({correctLevel: this.correctLevel});
    this.setElement(this.qrcode.makeCode(text));
    this.dirty = true;
    if(this.canvas){
      this.canvas.renderAll();
    }
  },
  actions: {
    color: {
      className: 'fa fa-paint-brush broken',
      type: 'color',
      title: "@barcode.color",
      get: function () {
        return typeof this.fill === "string" ? this.fill : "transparent";
      }
    }
  }
});

fabric.Barcode.fromObject = function(object,callback) {
  return new fabric.Barcode(object,callback);
};

Object.assign(fabric.Canvas.prototype,{
  addQrCode () {
    return this.createObject({
      active: true,
      width: 100,
      height: 100,
      position: "center",
      text: "www.avery.com",
      type: "barcode",
      clipTo: this.activeArea,
      movementLimits: this.activeArea
    });
  }
});

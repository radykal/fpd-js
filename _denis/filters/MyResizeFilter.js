'use strict';


fabric.ResizeDP =fabric.Image.filters.ResizeDP = fabric.util.createClass(fabric.Image.filters.Resize, /** @lends fabric.Image.filters.Resize.prototype */ {
  applyTo: function (canvasEl, dW, dH) {


    var oW = canvasEl.width, oH = canvasEl.height,   imageData;

    var scaleX = dW / oW;
    var scaleY = dH / oH;
    this.rcpScaleX = 1 /  scaleX;
    this.rcpScaleY = 1 / scaleY;
    if (this.resizeType === 'sliceHack') {
      imageData = this.sliceByTwo(canvasEl, oW, oH, dW, dH);
    }
    if (this.resizeType === 'hermite') {
      imageData = this.hermiteFastResize(canvasEl, oW, oH, dW, dH);
    }
    if (this.resizeType === 'bilinear') {
      imageData = this.bilinearFiltering(canvasEl, oW, oH, dW, dH);
    }
    if (this.resizeType === 'lanczos') {
      imageData = this.lanczosResize(canvasEl, oW, oH, dW, dH);
    }
    canvasEl.width = dW;
    canvasEl.height = dH;
    canvasEl.getContext('2d').putImageData(imageData, 0, 0);
  }
});

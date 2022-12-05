Object.assign(fabric.Image.prototype, {
  setMask: function (options, callback) {
    this._mask = options;
    fabric.util.loadImage(options.src, (maskImage) => {
      this.setFilter({
        type: "mask",
        options: {
          mask: maskImage,
          channel: options.channel
        }
      });
      callback();
    });
  }
});
//
  // mask_canvas_ctx.drawImage(pattern_img.getElement(),0,0,pattern_img.width, pattern_img.height, pattern_img.left -mask_img.left, pattern_img.top-mask_img.top, pattern_img.width*pattern_img.scaleX, pattern_img.height*pattern_img.scaleY);
// mask_canvas_ctx.globalCompositeOperation = "destination-in";
// mask_canvas_ctx.drawImage(mask_img.getElement(),0,0,mask_img.width, mask_img.height,0,0,mask_canvas.width,mask_canvas.height);

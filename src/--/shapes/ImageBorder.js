

fabric.ImageBorder = fabric.util.createClass(fabric.Image, {
  storeProperties: fabric.Image.prototype.storeProperties.concat(["borderSlice","borderWidth","borderRepeat"]),
  resizable: true,
  units: "mixed",
  borderSlice:  null,//[25,25,25,25],
  borderWidth:  null,//[25,25,25,25],
  borderRepeat: "round",  //["round","round"],
  // _update_frame: function () {
  //   if(this.frame && this.frame.image && this.frame.slice) {
  //     let _canvas = this._decoElement._element;
  //     _canvas.width = this.width;
  //     _canvas.height = this.height;
  //     this.drawBorderImage(_canvas, this.frame.image, this.frame);
  //   }
  // },
  _renderFill: function (ctx) {
    let w = this.width, h = this.height, x = -w / 2, y = -h / 2, elementToDraw = this._element;
    if (!elementToDraw) {return;}
    if (this.isMoving === false && this.resizeFilters.length && this._needsResize()) {
      this._lastScaleX = this.scaleX;
      this._lastScaleY = this.scaleY;
      elementToDraw = this.applyFilters(null, this.resizeFilters, this._filteredEl || this._originalElement, true);
    } else {
      elementToDraw = this._element;
    }

    if (this.borderWidth && this.borderSlice) {
      this._element.width = this.width;
      this._element.height = this.height;
      this.drawBorderImage();
    }

    ctx.drawImage(elementToDraw,
      this.cropX * this._filterScalingX,
      this.cropY * this._filterScalingY,
      elementToDraw.width,
      elementToDraw.height,
      x, y, w, h);

    this._stroke(ctx);
    this._renderStroke(ctx);
  },
  getSvgSrc(){
    if (this.borderWidth && this.borderSlice) {
      this.drawBorderImage();
      return this._element.toDataURL();
    }
    else{
      return fabric.Image.prototype.getSvgSrc.call(this);
    }
  },
  // borderOutset	:null,// [0, 0, 0, 0],
  /**
   * Draw CSS3 border image on canvas.
   * @param canvas    {HTMLCanvasElement}
   * @param img       {HTMLImageElement} border-image-source image
   * @param options   {Object}
   *      slice {Array} border-image-slice values
   *      width {Array} border-image-width values
   // *      outset {Array} border-image-outset values
   *      repeat {Array} border-image-repeat values
   * @param size      {Object}
   */
  drawBorderImage: function(){
    let img = this._filteredEl || this._originalElement;
    let w = img.width;
    let h = img.height;
    let w2 = this._element.width;
    let h2 = this._element.height;

    let ctx = this._element.getContext("2d");
    ctx.clearRect(0,0,w2, h2);
    let slice = this.borderSlice;
    let borderWidth = this.borderWidth;
    let borderRepeat = this.borderRepeat.constructor === Array ? this.borderRepeat : [this.borderRepeat,this.borderRepeat];

    if(this.units === "mixed"){
      if(slice[0] < 1)slice[0] *=  h;
      if(slice[1] < 1)slice[1] *=  w;
      if(slice[2] < 1)slice[2] *=  h;
      if(slice[3] < 1)slice[3] *=  w;
      if(borderWidth[0] < 1)borderWidth[0] *= h2 ;
      if(borderWidth[1] < 1)borderWidth[1] *= w2 ;
      if(borderWidth[2] < 1)borderWidth[2] *= h2 ;
      if(borderWidth[3] < 1)borderWidth[3] *= w2 ;
    }
    if(this.units === "percents"){
      slice[0] *=  h / 100;
      slice[1] *=  w / 100;
      slice[2] *=  h / 100;
      slice[3] *=  w / 100;
      borderWidth[0] *= h2 / 100;
      borderWidth[1] *= w2 / 100;
      borderWidth[2] *= h2 / 100;
      borderWidth[3] *= w2 / 100;
    }


    function drawSide(side,sliceOffset,sliceWidth, drawOffset,drawWidth){
      let d;
      if(side === 0) {
        d = [slice[3] + sliceOffset, 0, sliceWidth,  slice[0],
          borderWidth[3] + drawOffset, 0, drawWidth,  borderWidth[0]]
      }
      if(side === 2){
        d = [slice[3] + sliceOffset, h - slice[2] ,sliceWidth,  slice[2],
          borderWidth[3] + drawOffset, h2 - borderWidth[2],drawWidth, borderWidth[2]]
      }
      if(side === 1) {
        d = [ w - slice[1], slice[0] + sliceOffset,  slice[1], sliceWidth,
          w2 - borderWidth[1], borderWidth[0] + drawOffset,borderWidth[1], drawWidth];
      }
      if(side === 3) {
        d = [ 0, slice[0] + sliceOffset,  slice[3], sliceWidth,
          0, borderWidth[0] + drawOffset, borderWidth[3],drawWidth];
      }
      ctx.drawImage(img,d[0],d[1],d[2],d[3],d[4],d[5],d[6],d[7])
    }


    function _draw_border_side(side){
      let _top_width, _top_slice, repeat;
      if(side === 0 || side === 2){
        _top_width = w2 - borderWidth[1]- borderWidth[3];
        _top_slice  =  w - slice[1] - slice[3];
        repeat = borderRepeat[0];
      }else{
        _top_width = h2 - borderWidth[0]- borderWidth[2];
        _top_slice  =  h - slice[0] - slice[2];
        repeat = borderRepeat[1];
      }


      if(repeat === "stretch"){
        return drawSide(side, 0,  _top_slice ,  0,     _top_width);
      }

      let _aspect =   slice[side] / borderWidth[side];
      let _one_width =  _top_slice *  borderWidth[side] / slice[side] ;
      let count = 1;
      let _left = 0;

      if(repeat === "repeat"){

        let _rest = _one_width - _top_width % _one_width / 2;
        let _rest_aspect  = _aspect * _rest;
        count =  Math.floor(_top_width / _one_width);


        if(_rest > 0){
          drawSide(side, _rest_aspect ,  _top_slice - _rest_aspect,  0,     _one_width - _rest)
        }

        _left =  _one_width - _rest;

        for(let i = 0 ; i< count;i ++){
          drawSide( side,0,   _top_slice ,  _left,     _one_width);
          _left +=_one_width;
        }

        if(_rest > 0){
          drawSide(side,  0 ,    _top_slice - _rest_aspect,  _left,    _one_width - _rest );
        }
      }
      if(repeat === "round"){

        _left = 0;
        count =  Math.max(1,Math.round(_top_width / _one_width));
        _one_width = _top_width / count;

        while(_left < _top_width){
          drawSide(side,0,     _top_slice ,  _left,     _one_width );
          _left +=_one_width;
        }
      }
    }

    _draw_border_side(0);
    _draw_border_side(2);
    _draw_border_side(1);
    _draw_border_side(3);

    //top left
    ctx.drawImage(img, 0, 0, slice[3], slice[0], 0, 0, borderWidth[3], borderWidth[0]);
    //top right
    ctx.drawImage(img, w - slice[1], 0, slice[1], slice[0],
      w2 - borderWidth[1], 0, borderWidth[1], borderWidth[0]);
    //bottom left
    ctx.drawImage(img, 0, h - slice[2], slice[3], slice[2],
      0, h2 - borderWidth[2], borderWidth[3], borderWidth[2]);

    //bottom right
    ctx.drawImage(img, w - slice[1], h - slice[2], slice[1], slice[2],
      w2 - borderWidth[1], h2 - borderWidth[2], borderWidth[1], borderWidth[2]);

  },

  setElement: function (element) {

    //if (!deco["border_image"]) {
    //    img.width = this.width;
    //    img.height = this.height;
    //}

    if (this.borderWidth && this.borderSlice) {

      this.removeTexture(this.cacheKey);
      this.removeTexture(this.cacheKey + '_filtered');
      this._originalElement = element;
      if (this.filters.length !== 0) {
        this.applyFilters();
      }
      this._element = fabric.util.createCanvasElement();
      this._element.width = this.width;
      this._element.height = this.height;
      this.drawBorderImage();
    } else {
      fabric.Image.prototype.setElement.call(this, element, {width: this.width, height: this.height});
    }

    this.fire("element:modified");
    this.canvas && this.canvas.renderAll();
  }
});

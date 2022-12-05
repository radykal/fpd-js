// Magic Wand (Fuzzy Selection Tool) for Javascript
//
// The MIT License (MIT)
//
// Copyright (c) 2014, Ryasnoy Paul (ryasnoypaul@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var MagicWand = (function () {
  var lib = {};
  //var canvas = document.createElement("canvas");
  //var context = canvas.getContext("2d");

  function createCanvasElement(){
    if(typeof Canvas !== "undefined"){
      return new Canvas;
    }
    return document.createElement("canvas");
  }

  function SelectionMask(w,h,data){
    if(arguments.length == 1){
      for(var i in arguments[0] ){
        this[i] = arguments[0][i];
      }
    }else{
      this.data = new Uint8Array(data || w * h);
      this.width  = w;
      this.height = h;
      this.count  = 0;
      this.bounds = {
       minX: Infinity,
       minY: Infinity,
       maxY: -1,
       maxX: -1
      };
      // this.bounds = {
      //   minX: 0,
      //   minY: 0,
      //   maxY: h,
      //   maxX: w
      // };
    }
  }
  lib.SelectionMask = SelectionMask;

  SelectionMask.prototype.debug = function(){
    var canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    var ctx = canvas.getContext('2d');
    this.render(ctx,{
      fill : "#fff",
      outerFill : "#000"
    });
    return ctx.debug();
  };

  SelectionMask.prototype.makeCache = function(options ){
    this.cache = createCanvasElement();
    this.cache.width = this.bounds.maxX- this.bounds.minX + 1;
    this.cache.height = this.bounds.maxY- this.bounds.minY + 1;
    this.context = this.cache.getContext('2d');

    options = options || {}
    this.render(this.context,{
      fill : "#fff",
      outerFill : "#000",
      cache: false,
      left :-this.bounds.minX,
      top :-this.bounds.minY
    });

  };

  SelectionMask.prototype.add = function (mask) {
    var index, x, y;
    for (x = mask.bounds.minX; x <= mask.bounds.maxX; x++) {
      for (y = mask.bounds.minY; y <= mask.bounds.maxY; y++) {
        index = mask.width * y + x;
        if ( mask.data[index] && !this.data[index]){
          this.data[index] = 1;
          this.count++;
        }
      }
    }

    this.bounds.minX = Math.min(mask.bounds.minX, this.bounds.minX);
    this.bounds.maxX = Math.max(mask.bounds.maxX, this.bounds.maxX);
    this.bounds.minY = Math.min(mask.bounds.minY, this.bounds.minY);
    this.bounds.maxY = Math.max(mask.bounds.maxY, this.bounds.maxY);
  };

  //todo remove here and import from coolorpicker.js
  function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  SelectionMask.prototype.render = function(ctx,options ){
    if(!this.count)return;

    options             = options             || {};
    options.left        = options.left        || 0 ;
    options.top         = options.top         || 0 ;
    options.fill        = options.fill        || false ;// [0,0,0,0];
    options.intersectionColor = options.intersectionColor ||false ;//  [0,0,0,0];

    options.outerFill        = options.outerFill        || false ;// [0,0,0,0];
    options.outerIntersectionColor = options.outerIntersectionColor ||false ;//  [0,0,0,0];

    //if(this.cache && options.cache !== false){
    //
    //  var _ctx = this.context;
    //  _ctx.save();
    //  _ctx.globalCompositeOperation="source-in";
    //  _ctx.fillStyle= options.fill;
    //  _ctx.fillRect(0,0,this.cache.width,this.cache.height);
    //  _ctx.restore();
    //
    //  ctx.save();
    //  ctx.globalAlpha = options.opacity;
    //  ctx.drawImage(this.cache,this.bounds.minX,this.bounds.minY)
    //  ctx.restore();
    //  return;
    //}

    //todo do not use fabric here!
    //converting to [r,g,b,a] array. replace with  Object.values(hexToRgb). import fabric.colors
    function convertColor(color){
      if(color.constructor  == String ){
        if(color[0] == "#"){
          var _rgb = hexToRgb(color);
          return [_rgb.r,_rgb.g,_rgb.b,255];
        }
        color = new fabric.Color(color)._source;
        color[3] *= 255;
      }
      return color;
    }

    var _w = this.bounds.maxX - this.bounds.minX + 1;
    var _h = this.bounds.maxY - this.bounds.minY + 1;

    //var imgData = ctx.getImageData(options.left,options.top,_w,_h);
    var imgData = ctx.getImageData(this.bounds.minX,this.bounds.minY,_w,_h);

    var color  = convertColor(options.fill);
    var color2 = convertColor(options.intersectionColor);
    var color3 = convertColor(options.outerFill);
    var color4 = convertColor(options.outerIntersectionColor);

    for(var x = this.bounds.minX ; x <= this.bounds.maxX;x++ ){
      for(var y = this.bounds.minY ; y <= this.bounds.maxY; y++ ){
        var index = this.width * y + x;
        var index_small = _w * (y - (this.bounds.minY)) + x - (this.bounds.minX);

        if(this.data[index] ){
          var _color = imgData.data[index_small * 4 + 3]? color2 : color ;
          if(!_color)continue;

          imgData.data[index_small * 4 ]    = _color[0];
          imgData.data[index_small * 4 + 1] = _color[1];
          imgData.data[index_small * 4 + 2] = _color[2];
          imgData.data[index_small * 4 + 3] = _color[3];
        }else{
          var _color = imgData.data[index_small * 4 + 3]? color4 : color3 ;
          if(!_color)continue;

          imgData.data[index_small * 4 ]    = _color[0];
          imgData.data[index_small * 4 + 1] = _color[1];
          imgData.data[index_small * 4 + 2] = _color[2];
          imgData.data[index_small * 4 + 3] = _color[3];
        }
      }
    }

    // ctx.putImageData(imgData, options.left  , options.top  );
    ctx.putImageData(imgData, this.bounds.minX,this.bounds.minY  );
  };

  /**
   * get array with begin and end indices of filled 1 intervals
   * @param ctx
   * @param options
   * @returns {Array}
   */
  SelectionMask.prototype.getIntervalsArray = function (ctx, options) {
    var _newData = [];
    for (var i = 0, _val = 0; i < array.length; i++) {
      if (_val != array[i]) {
        _newData.push(i);
        _val = array[i];
      }
    }
    return _newData;
  };

  SelectionMask.prototype.renderBorder = function (ctx, options) {

    options             = options             || {};
    options.left        = options.left        || 0 ;
    options.top         = options.top         || 0 ;
    options.hatchOffset = options.hatchOffset || 0 ;
    options.hatchLength = options.hatchLength || 4 ;
    options.opacity = options.opacity || 1 ;

    var imgData = ctx.getImageData(0,0,this.width,this.height);

    if(!this.cacheInd){
      this.cacheInd = MagicWand.getBorderIndices(this);
    }

    var x, y, i, j, k,
      w = imgData.width,
      h = imgData.height;
    var res = imgData.data;

    var len = this.cacheInd.length;
    for (j = 0; j < len; j++) {
      i = this.cacheInd[j];
      x = i % w; // calc x by index
      y = (i - x) / w; // calc y by index
      k = (y * w + x) * 4;

      if ((x + y + options.hatchOffset) % (options.hatchLength * 2) < options.hatchLength) { // detect hatch color

        res[k] = 0;
        res[k + 1] = 0;
        res[k + 2] = 0;
        res[k + 3] = 255; // black, change only alpha
      } else {
        res[k] = 255; // white
        res[k + 1] = 255;
        res[k + 2] = 255;
        res[k + 3] = 255;
      }
    }
    ctx.save();
    ctx.globalAlpha = options.opacity;
    ctx.putImageData(imgData, options.left || 0 , options.top || 0 );
    ctx.restore();
  };

  lib.createMask = function (w, h,data) {
    return new SelectionMask(w,h,data);
  };

  lib.difference = function (a, b) {
    return Math.max(
      b[0] !== false ? Math.abs(b[0] - a[0]): 0,
      b[1] !== false ? Math.abs(b[1] - a[1]): 0,
      b[2] !== false ? Math.abs(b[2] - a[2]): 0,
      b[3] !== false ? Math.abs(b[3] - a[3]): 0);
  };

  lib.acceptable = function (x, y, image, visited, sampleColor, colorThreshold) {
// check whether the point has been visited
    if (visited[y * image.width + x] === 1) {
      return false;
    }
    var i = (y * image.width + x) * lib.bytes,
      color2 = [image.data[i], image.data[i + 1], image.data[i + 2], image.data[i + 3]];


    if (sampleColor[0] !== false && Math.abs(sampleColor[0] - color2[0]) > colorThreshold)return false;
    if (sampleColor[1] !== false && Math.abs(sampleColor[1] - color2[1]) > colorThreshold)return false;
    if (sampleColor[2] !== false && Math.abs(sampleColor[2] - color2[2]) >colorThreshold)return false;
    if (sampleColor[3] !== false && Math.abs(sampleColor[3] - color2[3]) > colorThreshold)return false;
    return true;
  };

  lib.selectAll = function (image, px, py, colorThreshold) {
    var i = (py * image.width + px) * lib.bytes,
      data = image.data,
      sampleColor = [data[i], data[i + 1], data[i + 2], data[i + 3]]; // start point color (sample)
    return lib.selectAllByColor(image, sampleColor, colorThreshold)
  };

  //todo impro fomr colorpicker.js
  /**
   * Converts an RGB color value to HSL. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes r, g, and b are contained in the set [0, 255] and
   * returns h, s, and l in the set [0, 1].
   *
   * @param   Number  r       The red color value
   * @param   Number  g       The green color value
   * @param   Number  b       The blue color value
   * @return  Array           The HSL representation
   */
  lib.rgbToHsl = function(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
      h = s = 0; // achromatic
    }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h, s, l];
  }

  lib.isAcceptableColor = function(image, index, options){
    let i = index * lib.bytes;

    if (options.aMin !== undefined && image.data[i + 3] < options.aMin)return false;
    if (options.aMax !== undefined && image.data[i + 3] > options.aMax)return false;

    if(options.sMin !== undefined || options.sMax !== undefined || options.bMin !== undefined || options.bMax !== undefined) {
      let hsl = rgbToHsl(image.data[i], image.data[i + 1], image.data[i + 2]);

      if (options.sMin !== undefined && hsl[1] < options.sMin) return false;
      if (options.sMax !== undefined && hsl[1] > options.sMax) return false;
      if (options.bMin !== undefined && hsl[2] < options.bMin) return false;
      if (options.bMax !== undefined && hsl[2] > options.bMax) return false;
    }
    return true;
  };

  lib.selectColored = function (image, options) {

    let mask = new SelectionMask(image.width, image.height);

    mask.bounds = {
      minX: image.width,
      minY: image.height,
      maxY: -1,
      maxX: -1
    };

    let x, y, index, i;
    for (y = 0; y < image.height; y++) {
      for (x = 0; x < image.width; x++) {
        index = y * image.width + x;
        //if (!image.data[i + 3]) continue;

        if(lib.isAcceptableColor(image,index, options)){
          mask.data[index] = 1;
          mask.count++;
          mask.bounds.minX = Math.min(mask.bounds.minX, x);
          mask.bounds.maxX = Math.max(mask.bounds.maxX, x);
          mask.bounds.minY = Math.min(mask.bounds.minY, y);
          mask.bounds.maxY = Math.max(mask.bounds.maxY, y);
        }



      }
    }
    return mask;
  };

  lib.selectAllByColor = function (ctx, sampleColor, colorThreshold) {
    var image = _getImageData(ctx);

    var mask = new SelectionMask(image.width, image.height);

    mask.bounds = {
      minX: Infinity,
      minY: Infinity,
      maxY: -1,
      maxX: -1
    };


    var visited = new Uint8Array( image.width * image.height);
    var x, y;
    for (y = 0; y < image.height; y++) {
      for (x = 0; x < image.width; x++) {
        if(lib.acceptable(x, y, image, mask.data, sampleColor, colorThreshold)){
          MagicWand.floodFill(image, x, y, colorThreshold, {
            sampleColor:    sampleColor,
            activeMask :    mask,
            visitedPoints : visited
          });
        }
      }
    }
    return mask;
  };

  lib.drawImage = function (ctx,canvas, mask ,left, top) {

    var ctx2 = canvas.getContext('2d');


    var imgData = ctx.getImageData(0, 0, mask.width, mask.height);
    var imgDataOriginal = ctx2.getImageData(left, top, mask.width, mask.height);


    var b = mask.bounds;
    for (var x = b.minX; x <= b.maxX; x++)for (var y = b.minY; y <= b.maxY; y++) {
      var i = (y * mask.width + x);// * bytes; // point index in the image data
      if (mask.data[i]) {
        imgData.data[i * 4]     = imgDataOriginal.data[i * 4];
        imgData.data[i * 4 + 1] = imgDataOriginal.data[i * 4 + 1];
        imgData.data[i * 4 + 2] = imgDataOriginal.data[i * 4 + 2];
        imgData.data[i * 4 + 3] = imgDataOriginal.data[i * 4 + 3];
      }
    }
    ctx.putImageData(imgData,0, 0);
  };

  function _getImageData(ctx){
    if(ctx.constructor.name == "ImageData"){
      return ctx;
    }else{
      return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  lib.fillMask = function (ctx, mask, color) {
    var imgData = _getImageData(ctx);
    var b = mask.bounds;
    var w = imgData.width,
      h = imgData.height;

    for (var x = b.minX; x <= b.maxX; x++)for (var y = b.minY; y <= b.maxY; y++) {
      var i = (y * w + x);// * bytes; // point index in the image data
      if (mask.data[i]) {
        imgData.data[i * 4]     = color[0];
        imgData.data[i * 4 + 1] = color[1];
        imgData.data[i * 4 + 2] = color[2];
        imgData.data[i * 4 + 3] = color[3];
      }
    }
    if(ctx.constructor.name != "ImageData") {
      ctx.clearRect(0, 0, w, h);
      ctx.putImageData(imgData, 0, 0);
    }
  };

  lib.selectBackground = function (ctx, sampleColor, colorThreshold) {
    var image = _getImageData(ctx);

    colorThreshold = colorThreshold || 15;

    var mask = new SelectionMask(image.width, image.height);
    mask.bounds = {
      minX: Infinity,
      minY: Infinity,
      maxY: -1,
      maxX: -1
    };

    var data = image.data;

    sampleColor = sampleColor ||[data[0], data[1], data[2], data[3]]; // start point color (sample)

    var color = sampleColor;

    function add(x, y) {
      if (!lib.acceptable(x, y, image, mask.data, sampleColor, colorThreshold))return;
      if (!sampleColor) {
        var index = (y * image.width + x) * 4;
        color = [data[index], data[index + 1], data[index + 2], data[index + 3]];
      }
      var mask2 = MagicWand.floodFill(image, x, y, colorThreshold, null, color);
      mask = MagicWand.add(mask, mask2);
    }

    var x, y;

    for (x = 0; x < image.width; x++) {
      add(x, 0);
    }
    for (x = 0; x < image.width; x++) {
      add(x, image.height - 1);
    }
    for (y = 0; y < image.height; y++) {
      add(image.width - 1, y);
    }
    for (y = 0; y < image.height; y++) {
      add(0, y);
    }
    return mask;

  };

  lib.extractColors = function(mixedType,threshold) {
    threshold= threshold || 60;
    var imgData = lib.getImageData(mixedType);
    var _colors = [];
    var c1;
    for(var x = 1; x <imgData.width;x+=3){
      for(var y = 1; y <imgData.height;y+=3) {
        var iii = (x + y * imgData.width) * 4;
        var iiA = (x - 1 + y * imgData.width) * 4;
        var iiB = (x + 1 + y * imgData.width) * 4;
        var iiC = (x - 1 + (y + 1) * imgData.width) * 4;
        var iiD = (x + 1 + (y + 1) * imgData.width) * 4;
        if(imgData.data[iii + 3] < 255)continue;

        c1 = [ imgData.data[iii], imgData.data[iii + 1], imgData.data[iii + 2]];
        var cA = [ imgData.data[iiA], imgData.data[iiA + 1], imgData.data[iiA + 2]];
        var cB = [ imgData.data[iiB], imgData.data[iiB + 1], imgData.data[iiB + 2]];
        var cC = [ imgData.data[iiC], imgData.data[iiC + 1], imgData.data[iiC + 2]];
        var cD = [ imgData.data[iiD], imgData.data[iiD + 1], imgData.data[iiD + 2]];

        if(
          c1[0] != cA[0] || cA[0] != cB[0] || cB[0] != cC[0] || cC[0] != cD[0] ||
          c1[1] != cA[1] || cA[1] != cB[1] || cB[1] != cC[1] || cC[1] != cD[1] ||
          c1[2] != cA[2] || cA[2] != cB[2] || cB[2] != cC[2] || cC[2] != cD[2]
        ){
          continue;
        }

        var isNewColor = true;

        for(var i in _colors){
          if(MagicWand.difference(_colors[i], c1) < threshold){
            isNewColor = false;
            break;
          }
        }
        if(isNewColor){
          _colors.push(c1);
        }
      }
    }
    return _colors;
  };

  /**
   * image
   * canvas - черно блое изображение.
   *
   * mask- предыдущая маска. на нее будет накладывать новая
   * mode - способ наложения.
   */
  lib.maskSelection = function ( canvas, left, top, mask ,mode) {
    left = left || 0;
    top = top || 0;
    if(canvas.constructor.name === "HTMLImageElement"){

      var __canvas = createCanvasElement();
      __canvas.width = canvas.width;
      __canvas.height = canvas.height;
      var __ctx = __canvas.getContext('2d');
      __ctx.drawImage(canvas, 0, 0);
      canvas = __canvas;
    }


    var ctx = canvas.getContext('2d'),
      imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    mask = mask || MagicWand.createMask(canvas.width, canvas.height);

    var _x1 = Math.max(0, - left),
      _y1 = Math.max(0, - top),
      _x2 = Math.min(mask.width - left,canvas.width),
      _y2 = Math.min(mask.height - top,canvas.height);

    for (var x = _x1; x < _x2; x++) {
      for (var y = _y1; y < _y2; y++) {
        var index = (canvas.width * y + x) * 4;

        if (imgData.data[index] > 20) {
          var index2 = mask.width * (y + top) + x + left;
          mask.data[index2] = 1;
          mask.count++;
        }
      }
    }
    return mask;
  };

  lib.selectRectangle = function (image, x1, y1, x2, y2) {

      var mask = new SelectionMask(image.width, image.height);
      var minX = Math.min(x1, x2);
      var maxX = Math.max(x1, x2);
      var minY = Math.min(y1, y2);
      var maxY = Math.max(y1, y2);

      var w = image.width, h = image.height;

      var data = image.data;
      for (var y = minY; y <= maxY; y++) {
        for (var x = minX; x <= maxX; x++) {
          if (data[(y * w + x) * 4 + 3]) {
            mask.data[y * w + x] = 1;
            mask.count++;
          }
        }
      }

      mask.bounds = {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
      };

      return mask;
    };

  lib.bytes = 4;

  lib.__floodFill = function (e,postMessage) {

    data = e.data;
    var image = data[0], px = data[1], py = data[2], colorThreshold = data[3], options = data[4];

    options = options || {};
    /*{
     visitedPointsArray,
     sampleColor,
     resultMask
     }*/

    var c, x, newY, el, xr, xl, dy, dyl, dyr, checkY,
      data = image.data, w = image.width, h = image.height, bytes = lib.bytes,
      i = py * w + px; // start point index in the mask data
    i = i * bytes; // start point index in the image data

    var visited     = options.visitedPoints || new Uint8Array( w * h), // mask of visited points
      sampleColor = options.sampleColor   || [data[i], data[i + 1], data[i + 2], data[i + 3]], // start point color (sample)
      result      = options.activeMask;

    function acceptable(x, y) {
// check whether the point has been visited
      if (visited[y * image.width + x] === 1) {
        return false;
      }
      var i = (y * image.width + x) * lib.bytes,
        color2 = [image.data[i], image.data[i + 1], image.data[i + 2], image.data[i + 3]];
      if (sampleColor[0] !== false && Math.abs(sampleColor[0] - color2[0]) > colorThreshold)return false;
      if (sampleColor[1] !== false && Math.abs(sampleColor[1] - color2[1]) > colorThreshold)return false;
      if (sampleColor[2] !== false && Math.abs(sampleColor[2] - color2[2]) > colorThreshold)return false;
      if (sampleColor[3] !== false && Math.abs(sampleColor[3] - color2[3]) > colorThreshold)return false;
      return true;
    };



    if (visited[i] === 1) return null;


    var first = true;
    var stack = [{y: py, left: px - 1, right: px + 1, dir: 1}]; // first scanning line

    var mode = 'strict';
    var _ci;
    do {
      el = stack.shift(); // get line for scanning

      checkY = false;
      for (x = el.left + 1; x < el.right; x++) {
        dy = el.y * w;

        if(mode == 'gradient' && !first) {
          _ci = (dy + x + (el.dir == -1 ? w: - w))*4;
          sampleColor = [data[_ci],data[_ci+1],data[_ci+2],data[_ci+3]];
        }
        if (!acceptable(x, el.y, image, visited, sampleColor, colorThreshold))continue;

        first = false;

        checkY = true; // if the color of the new point(x,y) is similar to the sample color need to check minmax for Y

        result.count++;

        result.data[dy + x] = 1; // mark a new point in mask
        visited[dy + x] = 1; // mark a new point as visited

        xl = x - 1;
        // walk to left side starting with the left neighbor
        while (xl > -1) {
          dyl = dy + xl;

          if(mode == 'gradient') {
            _ci = (dyl + 1)*4;
            sampleColor = [data[_ci], data[_ci + 1], data[_ci + 2], data[_ci + 3]];
          }
          if (!acceptable(xl, el.y, image, visited, sampleColor, colorThreshold)) break;

          result.count++;
          result.data[dyl] = 1;
          visited[dyl] = 1;

          xl--;
        }
        xr = x + 1;
        // walk to right side starting with the right neighbor
        while (xr < w) {
          dyr = dy + xr;

          if(mode == 'gradient') {
            _ci = (dyr - 1)*4;
            sampleColor = [data[_ci], data[_ci + 1], data[_ci + 2], data[_ci + 3]];
          }
          if (!acceptable(xr, el.y, image, visited, sampleColor, colorThreshold)){
            break;
          }

          result.count++;
          result.data[dyr] = 1;
          visited[dyr] = 1;
          xr++;
        }

        // check minmax for X
        if (xl < result.bounds.minX) result.bounds.minX = xl + 1;
        if (xr > result.bounds.maxX) result.bounds.maxX = xr - 1;

        newY = el.y - el.dir;
        if (newY >= 0 && newY < h) {
          if (xl < xr) stack.push({y: newY, left: xl, right: xr, dir: -el.dir}); // from "new left" to "new right"
          // add two scanning lines in the opposite direction (y - dir) if necessary
          // if (xl <= el.left) stack.push({y: newY, left: xl, right: el.left, dir: -el.dir}); // from "new left" to "current left"
          // if (el.right <= xr) stack.push({y: newY, left: el.right, right: xr, dir: -el.dir}); // from "current right" to "new right"
        }
        newY = el.y + el.dir;
        if (newY >= 0 && newY < h) { // add the scanning line in the direction (y + dir) if necessary
          if (xl < xr) stack.push({y: newY, left: xl, right: xr, dir: el.dir}); // from "new left" to "new right"
        }
      }
      // check minmax for Y if necessary
      if (checkY) {
        if (el.y < result.bounds.minY) result.bounds.minY = el.y;
        if (el.y > result.bounds.maxY) result.bounds.maxY = el.y;
      }
    } while (stack.length > 0);

    postMessage && postMessage(result);
    return result;
  };

  lib.extendMask = function (mask, value) {

    var mask2 = new SelectionMask(mask.width + 2, mask.height + 2);
    if(value){
      mask2.data.fill(value);
    }

    for(var y = 0;y < mask.height ; y++){
      for(var x = 0;x < mask.width ; x++){
        mask2.data[ (y + 1) * mask2.width + x + 1 ] = mask.data[y * mask.width + x ];
      }
    }
    mask2.count  = mask.count;

    if(!value) {
      mask2.bounds = {
        minX: mask.bounds.minX + 1,
        maxX: mask.bounds.maxX + 1,
        maxY: mask.bounds.maxY + 1,
        minY: mask.bounds.minY + 1
      };
    }else{
      mask2.bounds = mask.bounds;
    }
    return mask2;
  };

  /** Create a binary mask on the image by color threshold
   * Algorithm: Scanline flood fill (http://en.wikipedia.org/wiki/Flood_fill)
   * @param {Object} image: {Uint8Array} data, {int} width, {int} height, {int} bytes
   * @param {int} x of start pixel
   * @param {int} y of start pixel
   * @param {int} color threshold
   * @param {Uint8Array} mask of visited points (optional)
   * @return {Object} mask: {Uint8Array} data, {int} width, {int} height, {Object} bounds
   */
  lib.floodFill = function (image, px, py, colorThreshold, options,color,callback) {
    options = options || {};
    options.activeMask = options.activeMask  || new SelectionMask(image.width, image.height);

    return lib.__floodFill({data: [image, px, py, colorThreshold, options, color]},callback);

    /*
    var worker = _.worker(lib.__floodFill);
    worker.onmessage = function(e){
      var mask = new SelectionMask(e.data);
      callback && callback(mask);
    };
    worker.postMessage([image, px, py, colorThreshold, options]);
*/

  };

  lib.substract = function (mask, mask2) {
    var minX, maxX, minY, maxY;

    var result = new SelectionMask(mask.width, mask.height);
    var bounds = mask2.bounds;

    var minX = false, minY = mask.height, maxX = false, maxY = -1;

    for (var x = bounds.minX; x <= bounds.maxX; x++) {
      for (var y = bounds.minY; y <= bounds.maxY; y++) {
        var index = mask.width * y + x;

        if (!mask.data[index] && mask2.data[index]) {
          result.data[index] = 1;
          result.count++;
          if (result.bounds.minY > y)result.bounds.minY = y;
          if (result.bounds.maxY < y)result.bounds.maxY = y;
          if (result.bounds.minX > x)result.bounds.minX = x;
          if (result.bounds.maxX < x)result.bounds.maxX = x;
        }
      }
    }

    return result;
  }

  lib.getImageData  = function(mixedType){
    var canvas;
    if (mixedType.constructor.name == "Image" || mixedType.constructor.name == "HTMLImageElement") {
      var _canvas = createCanvasElement();
      _canvas.width = mixedType.width;
      _canvas.height = mixedType.height;
      var ctx = _canvas.getContext("2d");
      ctx.drawImage(mixedType, 0, 0);
      canvas = _canvas;
    }else{
      canvas = mixedType;
    }
    if (canvas.constructor.name == "HTMLCanvasElement" || canvas.constructor.name == "Canvas") {
      var imgData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    }else{
      imgData = mixedType;
    }
    return imgData;
  };

  lib.getColoredPixels = function (mixedType) {
    var imgData = lib.getImageData(mixedType);
    var data = imgData.data;
    var pixels = 0;
    for (var i = 3; i < data.length; i += 4) {
      if (data[i]) {
        pixels+= data[i] / 255;
      }
    }
    return pixels;
  };

  lib.invertMask = function (mask) {
    var result = new SelectionMask(mask.width, mask.height);
    result.bounds = {
      minX: Infinity,
      minY: Infinity,
      maxY: -1,
      maxX: -1
    };


    for (var x = 0; x < mask.width; x++) {
      for (var y = 0; y < mask.height; y++) {
        var index = mask.width * y + x;
        if (!mask.data[index]) {
          result.data[index] = 1;
          result.count++;
          if (result.bounds.minY > y)result.bounds.minY = y;
          if (result.bounds.maxY < y)result.bounds.maxY = y;
          if (result.bounds.minX > x)result.bounds.minX = x;
          if (result.bounds.maxX < x)result.bounds.maxX = x;
        }
      }
    }
    return result;
  };

  lib.exclude = function (mask, mask2) {
    var result = new SelectionMask(mask.width, mask.height);
    var bounds = {
      minX: Math.min(mask.bounds.minX, mask2.bounds.minX),
      maxX: Math.max(mask.bounds.maxX, mask2.bounds.maxX),
      minY: Math.min(mask.bounds.minY, mask2.bounds.minY),
      maxY: Math.max(mask.bounds.maxY, mask2.bounds.maxY)
    };

    var minX = false, minY = mask.height, maxX = false, maxY = -1;

    for (var x = bounds.minX; x <= bounds.maxX; x++) {
      for (var y = bounds.minY; y <= bounds.maxY; y++) {
        var index = mask2.width * y + x;

        if (mask.data[index] ^ mask2.data[index]) {
          result.data[index] = 1;
          result.count++;
          maxX = x;
          if (minY > y)minY = y;
          if (maxY < y)maxY = y;
          if (minX === false) {
            minX = x;
          }
        }
      }
    }

    result.bounds = {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY
    }

    return result;
  };

  lib.intersect = function (mask, mask2) {
    var minX, maxX, minY, maxY;

    var result = new SelectionMask(mask.width, mask.height);
    var bounds = {
      minX: Math.max(mask.bounds.minX, mask2.bounds.minX),
      maxX: Math.min(mask.bounds.maxX, mask2.bounds.maxX),
      minY: Math.max(mask.bounds.minY, mask2.bounds.minY),
      maxY: Math.min(mask.bounds.maxY, mask2.bounds.maxY)
    };

    var minX = false, minY = mask.height, maxX = false, maxY = -1;

    for (var x = bounds.minX; x <= bounds.maxX; x++) {
      for (var y = bounds.minY; y <= bounds.maxY; y++) {
        var index = mask2.width * y + x;

        if (mask.data[index] && mask2.data[index]) {
          result.data[index] = 1;
          result.count++;
          maxX = x;
          if (minY > y)minY = y;
          if (maxY < y)maxY = y;
          if (minX === false) {
            minX = x;
          }
        }
      }
    }

    result.bounds = {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY
    }

    return result;
  };

  lib.add = function (mask, mask2) {
    var result = new SelectionMask(mask.width, mask.height);

    result.bounds = {
      minX: Math.min(mask.bounds.minX, mask2.bounds.minX),
      maxX: Math.max(mask.bounds.maxX, mask2.bounds.maxX),
      minY: Math.min(mask.bounds.minY, mask2.bounds.minY),
      maxY: Math.max(mask.bounds.maxY, mask2.bounds.maxY)
    };

    for (var x = result.bounds.minX; x <= result.bounds.maxX; x++) {
      for (var y = result.bounds.minY; y <= result.bounds.maxY; y++) {
        var index = mask2.width * y + x;

        if (mask.data[index] || mask2.data[index]) {
          result.data[index] = 1;
          result.count++;
        }
      }
    }

    return result;
  };

  /** Apply the gauss-blur filter to binary mask
   * Algorithms: http://blog.ivank.net/fastest-gaussian-blur.html
   * http://www.librow.com/articles/article-9
   * http://elynxsdk.free.fr/ext-docs/Blur/Fast_box_blur.pdf
   * @param {Object} mask: {Uint8Array} data, {int} width, {int} height, {Object} bounds
   * @param {int} blur radius
   * @return {Object} mask: {Uint8Array} data, {int} width, {int} height, {Object} bounds
   */
  lib.gaussBlur = function (mask, radius) {

    var i, k, k1, x, y, val, start, end,
      n = radius * 2 + 1, // size of the pattern for radius-neighbors (from -r to +r with the center point)
      s2 = radius * radius,
      wg = new Float32Array(n), // weights
      total = 0, // sum of weights(used for normalization)
      w = mask.width,
      h = mask.height,
      data = mask.data,
      minX = mask.bounds.minX,
      maxX = mask.bounds.maxX,
      minY = mask.bounds.minY,
      maxY = mask.bounds.maxY,
      count = 0;

    // calc gauss weights
    for (i = 0; i < radius; i++) {
      var dsq = (radius - i) * (radius - i);
      var ww = Math.exp(-dsq / (2.0 * s2)) / (2 * Math.PI * s2);
      wg[radius + i] = wg[radius - i] = ww;
      total += 2 * ww;
    }
    // normalization weights
    for (i = 0; i < n; i++) {
      wg[i] /= total;
    }

    var result = new Uint8Array(w * h), // result mask
      endX = radius + w,
      endY = radius + h;

    //walk through all source points for blur
    for (y = minY; y < maxY + 1; y++)
      for (x = minX; x < maxX + 1; x++) {
        val = 0;
        k = y * w + x; // index of the point
        start = radius - x > 0 ? radius - x : 0;
        end = endX - x < n ? endX - x : n; // Math.min((((w - 1) - x) + radius) + 1, n);
        k1 = k - radius;
        // walk through x-neighbors
        for (i = start; i < end; i++) {
          val += data[k1 + i] * wg[i];
        }
        start = radius - y > 0 ? radius - y : 0;
        end = endY - y < n ? endY - y : n; // Math.min((((h - 1) - y) + radius) + 1, n);
        k1 = k - radius * w;
        // walk through y-neighbors
        for (i = start; i < end; i++) {
          val += data[k1 + i * w] * wg[i];
        }
        if (val > 0.5) {
          result[k] = 1;
          count++;
        } else {
          result[k] = 0;
        }
      }

    return {
      count: count,
      data: result,
      width: w,
      height: h,
      bounds: {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
      }
    };
  };

  /** Create a border index array of boundary points of the mask with radius-neighbors
   * @param {Object} mask: {Uint8Array} data, {int} width, {int} height, {Object} bounds
   * @param {int} radius: blur radius
   * @param {Uint8Array} visited: mask of visited points (optional)
   * @return {Array} border index array of boundary points with radius-neighbors (only points need for blur)
   */
  function createBorderForBlur(mask, radius, visited) {

    var x, i, j, y, k, k1, k2,
      w = mask.width,
      h = mask.height,
      data = mask.data,
      visitedData = new Uint8Array(data),
      minX = mask.bounds.minX,
      maxX = mask.bounds.maxX,
      minY = mask.bounds.minY,
      maxY = mask.bounds.maxY,
      len = w * h,
      temp = new Uint8Array(len), // auxiliary array to check uniqueness
      border = [], // only border points
      x0 = Math.max(minX, 1),
      x1 = Math.min(maxX, w - 2),
      y0 = Math.max(minY, 1),
      y1 = Math.min(maxY, h - 2);

    if (visited && visited.length > 0) {
      // copy visited points (only "black")
      for (k = 0; k < len; k++) {
        if (visited[k] === 1) visitedData[k] = 1;
      }
    }

    // walk through inner values except points on the boundary of the image
    for (y = y0; y < y1 + 1; y++)
      for (x = x0; x < x1 + 1; x++) {
        k = y * w + x;
        if (data[k] === 0) continue; // "white" point isn't the border
        k1 = k + w; // y + 1
        k2 = k - w; // y - 1
        // check if any neighbor with a "white" color
        if (visitedData[k + 1] === 0 || visitedData[k - 1] === 0 ||
          visitedData[k1] === 0 || visitedData[k1 + 1] === 0 || visitedData[k1 - 1] === 0 ||
          visitedData[k2] === 0 || visitedData[k2 + 1] === 0 || visitedData[k2 - 1] === 0) {
          //if (visitedData[k + 1] + visitedData[k - 1] +
          //    visitedData[k1] + visitedData[k1 + 1] + visitedData[k1 - 1] +
          //    visitedData[k2] + visitedData[k2 + 1] + visitedData[k2 - 1] == 8) continue;
          border.push(k);
        }
      }

    // walk through points on the boundary of the image if necessary
    // if the "black" point is adjacent to the boundary of the image, it is a border point
    if (minX == 0)
      for (y = minY; y < maxY + 1; y++)
        if (data[y * w] === 1)
          border.push(y * w);

    if (maxX == w - 1)
      for (y = minY; y < maxY + 1; y++)
        if (data[y * w + maxX] === 1)
          border.push(y * w + maxX);

    if (minY == 0)
      for (x = minX; x < maxX + 1; x++)
        if (data[x] === 1)
          border.push(x);

    if (maxY == h - 1)
      for (x = minX; x < maxX + 1; x++)
        if (data[maxY * w + x] === 1)
          border.push(maxY * w + x);

    var result = [], // border points with radius-neighbors
      start, end,
      endX = radius + w,
      endY = radius + h,
      n = radius * 2 + 1; // size of the pattern for radius-neighbors (from -r to +r with the center point)

    len = border.length;
    // walk through radius-neighbors of border points and add them to the result array
    for (j = 0; j < len; j++) {
      k = border[j]; // index of the border point
      temp[k] = 1; // mark border point
      result.push(k); // save the border point
      x = k % w; // calc x by index
      y = (k - x) / w; // calc y by index
      start = radius - x > 0 ? radius - x : 0;
      end = endX - x < n ? endX - x : n; // Math.min((((w - 1) - x) + radius) + 1, n);
      k1 = k - radius;
      // walk through x-neighbors
      for (i = start; i < end; i++) {
        k2 = k1 + i;
        if (temp[k2] === 0) { // check the uniqueness
          temp[k2] = 1;
          result.push(k2);
        }
      }
      start = radius - y > 0 ? radius - y : 0;
      end = endY - y < n ? endY - y : n; // Math.min((((h - 1) - y) + radius) + 1, n);
      k1 = k - radius * w;
      // walk through y-neighbors
      for (i = start; i < end; i++) {
        k2 = k1 + i * w;
        if (temp[k2] === 0) { // check the uniqueness
          temp[k2] = 1;
          result.push(k2);
        }
      }
    }

    return result;
  };

  /** Apply the gauss-blur filter ONLY to border points with radius-neighbors
   * Algorithms: http://blog.ivank.net/fastest-gaussian-blur.html
   * http://www.librow.com/articles/article-9
   * http://elynxsdk.free.fr/ext-docs/Blur/Fast_box_blur.pdf
   * @param  {Object}     mask:     {Uint8Array} data, {int} width, {int} height, {Object} bounds
   * @param  {int}        radius:   blur radius
   * @param  {Uint8Array} visited:  mask of visited points (optional)
   * @return {Object}     mask:     {Uint8Array} data, {int} width, {int} height, {Object} bounds
   */
  lib.gaussBlurOnlyBorder = function (mask, radius, visited) {

    var border = createBorderForBlur(mask, radius, visited), // get border points with radius-neighbors
      ww, dsq, i, j, k, k1, x, y, val, start, end,
      n = radius * 2 + 1, // size of the pattern for radius-neighbors (from -r to +r with center point)
      s2 = 2 * radius * radius,
      wg = new Float32Array(n), // weights
      total = 0, // sum of weights(used for normalization)
      w = mask.width,
      h = mask.height,
      data = mask.data,
      minX = mask.bounds.minX,
      maxX = mask.bounds.maxX,
      minY = mask.bounds.minY,
      maxY = mask.bounds.maxY,
      len = border.length;

    // calc gauss weights
    for (i = 0; i < radius; i++) {
      dsq = (radius - i) * (radius - i);
      ww = Math.exp(-dsq / s2) / Math.PI;
      wg[radius + i] = wg[radius - i] = ww;
      total += 2 * ww;
    }
    // normalization weights
    for (i = 0; i < n; i++) {
      wg[i] /= total;
    }

    var result = new SelectionMask(w,h,data), // copy the source mask
      endX = radius + w,
      endY = radius + h;

    //walk through all border points for blur
    for (i = 0; i < len; i++) {
      k = border[i]; // index of the border point
      val = 0;
      x = k % w; // calc x by index
      y = (k - x) / w; // calc y by index
      start = radius - x > 0 ? radius - x : 0;
      end = endX - x < n ? endX - x : n; // Math.min((((w - 1) - x) + radius) + 1, n);
      k1 = k - radius;
      // walk through x-neighbors
      for (j = start; j < end; j++) {
        val += data[k1 + j] * wg[j];
      }
      if (val > 0.5) {
        result.data[k] = 1;
        result.count++;
        // check minmax
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        continue;
      }
      start = radius - y > 0 ? radius - y : 0;
      end = endY - y < n ? endY - y : n; // Math.min((((h - 1) - y) + radius) + 1, n);
      k1 = k - radius * w;
      // walk through y-neighbors
      for (j = start; j < end; j++) {
        val += data[k1 + j * w] * wg[j];
      }
      if (val > 0.5) {
        result.data[k] = 1;
        result.count++;
        // check minmax
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      } else {
        result.data[k] = 0;
      }
    }
    result.bounds = {
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY
    };

    return result;
  };

  /** Create a border mask (only boundary points)
   * @param {Object} mask: {Uint8Array} data, {int} width, {int} height, {Object} bounds
   * @return {Object} border mask: {Uint8Array} data, {int} width, {int} height, {Object} offset
   */
  lib.createBorderMask = function (mask) {

    var x, y, k, k1, k2,
      w = mask.width,
      h = mask.height,
      data = mask.data,
      minX = mask.bounds.minX,
      maxX = mask.bounds.maxX,
      minY = mask.bounds.minY,
      maxY = mask.bounds.maxY,
      rw = maxX - minX + 1, // bounds size
      rh = maxY - minY + 1,
      result = new Uint8Array(rw * rh), // reduced mask (bounds size)
      x0 = Math.max(minX, 1),
      x1 = Math.min(maxX, w - 2),
      y0 = Math.max(minY, 1),
      y1 = Math.min(maxY, h - 2),
      count = 0;

    // walk through inner values except points on the boundary of the image
    for (y = y0; y < y1 + 1; y++)
      for (x = x0; x < x1 + 1; x++) {
        k = y * w + x;
        if (data[k] === 0) continue; // "white" point isn't the border
        k1 = k + w; // y + 1
        k2 = k - w; // y - 1
        // check if any neighbor with a "white" color
        if (data[k + 1] === 0 || data[k - 1] === 0 ||
          data[k1] === 0 || data[k1 + 1] === 0 || data[k1 - 1] === 0 ||
          data[k2] === 0 || data[k2 + 1] === 0 || data[k2 - 1] === 0) {
          //if (data[k + 1] + data[k - 1] +
          //    data[k1] + data[k1 + 1] + data[k1 - 1] +
          //    data[k2] + data[k2 + 1] + data[k2 - 1] == 8) continue;
          result[(y - minY) * rw + (x - minX)] = 1;
          count++;
        }
      }

    // walk through points on the boundary of the image if necessary
    // if the "black" point is adjacent to the boundary of the image, it is a border point
    if (minX == 0)
      for (y = minY; y < maxY + 1; y++)
        if (data[y * w] === 1) {
          result[(y - minY) * rw] = 1;
          count++;
        }

    if (maxX == w - 1)
      for (y = minY; y < maxY + 1; y++)
        if (data[y * w + maxX] === 1) {
          result[(y - minY) * rw + (maxX - minX)] = 1;
          count++;
        }

    if (minY == 0)
      for (x = minX; x < maxX + 1; x++)
        if (data[x] === 1) {
          result[x - minX] = 1;
          count++;
        }

    if (maxY == h - 1)
      for (x = minX; x < maxX + 1; x++)
        if (data[maxY * w + x] === 1) {
          result[(maxY - minY) * rw + (x - minX)] = 1;
          count++;
        }

    return {
      count: count,
      data: result,
      width: rw,
      height: rh,
      offset: {x: minX, y: minY}
    };
  };

  /** Create a border index array of boundary points of the mask
   * @param {Object} mask: {Uint8Array} data, {int} width, {int} height
   * @return {Array} border index array boundary points of the mask
   */
  lib.getBorderIndices = function (mask) {

    var x, y, k, k1, k2,
      w = mask.width,
      h = mask.height,
      data = mask.data,
      border = [], // only border points
      x1 = w - 1,
      y1 = h - 1;

    // walk through inner values except points on the boundary of the image
    for (y = 1; y < y1; y++)
      for (x = 1; x < x1; x++) {
        k = y * w + x;
        if (data[k] === 0) continue; // "white" point isn't the border
        k1 = k + w; // y + 1
        k2 = k - w; // y - 1
        // check if any neighbor with a "white" color
        if (data[k + 1] === 0 || data[k - 1] === 0 ||
          data[k1] === 0 || data[k1 + 1] === 0 || data[k1 - 1] === 0 ||
          data[k2] === 0 || data[k2 + 1] === 0 || data[k2 - 1] === 0) {
          //if (data[k + 1] + data[k - 1] +
          //    data[k1] + data[k1 + 1] + data[k1 - 1] +
          //    data[k2] + data[k2 + 1] + data[k2 - 1] == 8) continue;
          border.push(k);
        }
      }

    // walk through points on the boundary of the image if necessary
    // if the "black" point is adjacent to the boundary of the image, it is a border point
    for (y = 0; y < h; y++)
      if (data[y * w] === 1)
        border.push(y * w);

    for (x = 0; x < w; x++)
      if (data[x] === 1)
        border.push(x);

    k = w - 1;
    for (y = 0; y < h; y++)
      if (data[y * w + k] === 1)
        border.push(y * w + k);

    k = (h - 1) * w;
    for (x = 0; x < w; x++)
      if (data[k + x] === 1)
        border.push(k + x);

    return border;
  };

  /** Create a compressed mask with a "white" border (1px border with zero values) for the contour tracing
   * @param {Object} mask: {Uint8Array} data, {int} width, {int} height, {Object} bounds
   * @return {Object} border mask: {Uint8Array} data, {int} width, {int} height, {Object} offset
   */
  function prepareMask(mask) {
    var x, y,
      w = mask.width,
      data = mask.data,
      minX = mask.bounds.minX,
      maxX = mask.bounds.maxX,
      minY = mask.bounds.minY,
      maxY = mask.bounds.maxY,
      rw = maxX - minX + 3, // bounds size +1 px on each side (a "white" border)
      rh = maxY - minY + 3,
      result = new Uint8Array(rw * rh); // reduced mask (bounds size)

    // walk through inner values and copy only "black" points to the result mask
    for (y = minY; y < maxY + 1; y++)
      for (x = minX; x < maxX + 1; x++) {
        if (data[y * w + x] === 1)
          result[(y - minY + 1) * rw + (x - minX + 1)] = 1;
      }

    return {
      data: result,
      width: rw,
      height: rh,
      offset: {x: minX - 1, y: minY - 1}
    };
  };

  /** Create a contour array for the binary mask
   * Algorithm: http://www.sciencedirect.com/science/article/pii/S1077314203001401
   * @param {Object} mask: {Uint8Array} data, {int} width, {int} height, {Object} bounds
   * @return {Array} contours: {Array} points, {bool} inner, {int} label
   */
  lib.traceContours = function (mask) {
    if(!mask.count)return [];
    var m = prepareMask(mask),
      contours = [],
      label = 0,
      w = m.width,
      w2 = w * 2,
      h = m.height,
      src = m.data,
      dx = m.offset.x,
      dy = m.offset.y,
      bounds,_p,
      dest = new Uint8Array(src), // label matrix
      i, j, x, y, k, k1, c, inner, dir, first, second, current, previous, next, d;

    // all [dx,dy] pairs (array index is the direction)
    // 5 6 7
    // 4 X 0
    // 3 2 1
    var directions = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

    for (y = 1; y < h - 1; y++)
      for (x = 1; x < w - 1; x++) {
        k = y * w + x;
        if (src[k] === 1) {
          for (i = -w; i < w2; i += w2) { // k - w: outer tracing (y - 1), k + w: inner tracing (y + 1)
            if (src[k + i] === 0 && dest[k + i] === 0) { // need contour tracing
              inner = i === w; // is inner contour tracing ?
              label++; // label for the next contour

              c = [];
              bounds = {
                minX : mask.width,
                minY : mask.height,
                maxX : -1,
                maxY : -1,
              };
              dir = inner ? 2 : 6; // start direction
              current = previous = first = {x: x, y: y};
              second = null;
              while (true) {
                dest[current.y * w + current.x] = label; // mark label for the current point
                // bypass all the neighbors around the current point in a clockwise
                for (j = 0; j < 8; j++) {
                  dir = (dir + 1) % 8;

                  // get the next point by new direction
                  d = directions[dir]; // index as direction
                  next = {x: current.x + d[0], y: current.y + d[1]};

                  k1 = next.y * w + next.x;
                  if (src[k1] === 1) // black boundary pixel
                  {
                    dest[k1] = label; // mark a label
                    break;
                  }
                  dest[k1] = -1; // mark a white boundary pixel
                  next = null;
                }
                if (next === null) break; // no neighbours (one-point contour)
                current = next;
                if (second) {
                  if (previous.x === first.x && previous.y === first.y && current.x === second.x && current.y === second.y) {
                    break; // creating the contour completed when returned to original position
                  }
                } else {
                  second = next;
                }
                _p = {x: previous.x + dx, y: previous.y + dy};
                if(bounds.minX > _p.x)bounds.minX = _p.x;
                if(bounds.maxX < _p.x)bounds.maxX = _p.x;
                if(bounds.minY > _p.y)bounds.minY = _p.y;
                if(bounds.maxY < _p.y)bounds.maxY = _p.y;
                c.push(_p);
                previous = current;
                dir = (dir + 4) % 8; // next dir (symmetrically to the current direction)
              }

              if (next != null) {
                _p = {x: first.x + dx, y: first.y + dy};
                if(bounds.minX >  _p.x)bounds.minX =  _p.x;
                if(bounds.maxX <  _p.x)bounds.maxX =  _p.x;
                if(bounds.minY >  _p.y)bounds.minY =  _p.y;
                if(bounds.maxY <  _p.y)bounds.maxY =  _p.y;
                c.push(_p); // close the contour
                contours.push({inner: inner, label: label, points: c,bounds : bounds}); // add contour to the list
              }
            }
          }
        }
      }

    return contours;
  };

  //todo import from colorpicker.js
  function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
      h = s = 0; // achromatic
    }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 255, s* 255, l* 255];
  }

  lib.simplifyContour = function (c, simplifyTolerant, simplifyCount) {
    var
      i, j, k, c, points, len, resPoints, lst, stack, ids,
      maxd, maxi, dist, r1, r2, r12, dx, dy, pi, pf, pl;

    points = c.points;
    len = c.points.length;

    if (len < simplifyCount) { // contour isn't simplified
      resPoints = [];
      for (k = 0; k < len; k++) {
        resPoints.push({x: points[k].x, y: points[k].y});
      }
      return {
        bounds: c.bounds, inner: c.inner, label: c.label, points: resPoints, initialCount: len};
    }

    lst = [0, len - 1]; // always add first and last points
    stack = [{first: 0, last: len - 1}]; // first processed edge

    do {
      ids = stack.shift();
      if (ids.last <= ids.first + 1) // no intermediate points
      {
        continue;
      }

      maxd = -1.0; // max distance from point to current edge
      maxi = ids.first; // index of maximally distant point

      for (i = ids.first + 1; i < ids.last; i++) // bypass intermediate points in edge
      {
        // calc the distance from current point to edge
        pi = points[i];
        pf = points[ids.first];
        pl = points[ids.last];
        dx = pi.x - pf.x;
        dy = pi.y - pf.y;
        r1 = Math.sqrt(dx * dx + dy * dy);
        dx = pi.x - pl.x;
        dy = pi.y - pl.y;
        r2 = Math.sqrt(dx * dx + dy * dy);
        dx = pf.x - pl.x;
        dy = pf.y - pl.y;
        r12 = Math.sqrt(dx * dx + dy * dy);
        if (r1 >= Math.sqrt(r2 * r2 + r12 * r12)) dist = r2;
        else if (r2 >= Math.sqrt(r1 * r1 + r12 * r12)) dist = r1;
        else dist = Math.abs((dy * pi.x - dx * pi.y + pf.x * pl.y - pl.x * pf.y) / r12);

        if (dist > maxd) {
          maxi = i; // save the index of maximally distant point
          maxd = dist;
        }
      }

      if (maxd > simplifyTolerant) // if the max "deviation" is larger than allowed then...
      {
        lst.push(maxi); // add index to the simplified list
        stack.push({first: ids.first, last: maxi}); // add the left part for processing
        stack.push({first: maxi, last: ids.last}); // add the right part for processing
      }

    } while (stack.length > 0);

    resPoints = [];
    len = lst.length;
    lst.sort(function (a, b) {
      return a - b;
    }); // restore index order
    for (k = 0; k < len; k++) {
      resPoints.push({x: points[lst[k]].x, y: points[lst[k]].y}); // add result points to the correct order
    }
    return {
      bounds: c.bounds,
      inner: c.inner, label: c.label, points: resPoints, initialCount: c.points.length
    };
  };

  /** Simplify contours
   * Algorithms: http://psimpl.sourceforge.net/douglas-peucker.html
   * http://neerc.ifmo.ru/wiki/index.php?title=%D0%A3%D0%BF%D1%80%D0%BE%D1%89%D0%B5%D0%BD%D0%B8%D0%B5_%D0%BF%D0%BE%D0%BB%D0%B8%D0%B3%D0%BE%D0%BD%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B9_%D1%86%D0%B5%D0%BF%D0%B8
   * @param {Array} contours: {Array} points, {bool} inner, {int} label
   * @param {float} simplify tolerant
   * @param {int} simplify count: min number of points when the contour is simplified
   * @return {Array} contours: {Array} points, {bool} inner, {int} label, {int} initialCount
   */
  lib.simplifyContours = function (contours, simplifyTolerant, simplifyCount) {
    var lenContours = contours.length,
      result = [];

    // walk through all contours
    for (var j = 0; j < lenContours; j++) {

      result.push(lib.simplifyContour(contours[j], simplifyTolerant, simplifyCount));
    }

    return result;
  };

  return lib;
})();

// if (typeof exports !== 'undefined') {
//   module.exports = MagicWand;
// }
export default MagicWand;

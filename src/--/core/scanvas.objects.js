fabric.StaticCanvas.prototype.checkLargestNumber = function(regexp, largestNumber){
  for(var i in this._objects){
    var result = regexp.exec(this._objects[i].id);
    if(result){
      var number = + result[1];
      if(number > largestNumber){
        largestNumber = number;
      }
    }
  }
  return largestNumber;
}


Object.assign(fabric.Object.prototype,{

  getTransformStoredProperties(){
    if( this.canvas && this.canvas._currentTransform) {
      return ["left", "top", "width", "height", "scaleX", "scaleY", "skewX", "skewY"];
    }
    return null;
  },
});

Object.assign(fabric.Path.prototype,{
  cropPath: true,
  initialize: function (options,callback) {
    if(!options.path){
      options.path = `M 0 0 h ${options.width} v ${options.height} h ${-options.width} z`;
    }
    fabric.Object.prototype.initialize.call(this, options, callback);

    if(this.cropPath) {
      fabric.Polyline.prototype._setPositionDimensions.call(this, this);
    }
    else{
      this.pathOffset = {
        x: this.width / 2,
        y: this.height / 2
      };
    }
  },
  setPath (path){
    if (!path) {
      path = [];
    }
    var fromArray = Object.prototype.toString.call(path) === '[object Array]';
    this.path = fromArray ? path
      // one of commands (m,M,l,L,q,Q,c,C,etc.) followed by non-command characters (i.e. command values)
      : path.match && path.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi);

    if (!this.path) {
      return;
    }

    if (!fromArray) {
      this.path = this._parsePath();
    }
    // if(this.pathCrop){
    //   fabric.Polyline.prototype._setPositionDimensions.call(this, this);
    // }
    // else{
    //   this.pathOffset = {
    //     x:  this.width / 2,
    //     y:  this.height / 2
    //   };
    // }
  }
});
fabric.Path.fromElement = function(element, callback, options) {
  var parsedAttributes = fabric.parseAttributes(element, fabric.Path.ATTRIBUTE_NAMES);
  parsedAttributes.fromSVG = true;
  options.path = parsedAttributes.d;
  callback(new fabric.Path(Object.assign(parsedAttributes, options)));
};

Object.assign(fabric.Ellipse.prototype,{
  initialize ( options, callback) {
    fabric.Object.prototype.initialize.call(this, options, callback);
  },
  setWidth(val){
    this.width = val;
    this.rx = val/2;
    this.dirty = true;
    this.fire("resized");
  },
  setHeight(val){
    this.height = val;
    this.ry = val/2;
    this.dirty = true;
    this.fire("resized");
  },
  setRx(value) {
    this.setWidth(value * 2);
  },
  setRy(value) {
    this.setHeight(value * 2);
  }
});

Object.assign(fabric.Circle.prototype,{
  storeProperties: ["type","clipPath","frame","deco", 'radius', 'startAngle', 'endAngle']
});

Object.assign(fabric.Rect.prototype,{
  initialize ( options, callback) {
    fabric.Object.prototype.initialize.call(this, options, callback);
    this._initRxRy();
  }
});

Object.assign(fabric.Triangle.prototype,{});

Object.assign(fabric.Line.prototype,{
  storeProperties: ["type", "clipPath", "x1", "x2", "y1", "y2"],
  initialize: function(options, callback) {
    if (!options.points) {
      options.points = [options.x1 || 0, options.y1 || 0, options.x2 || 0, options.y2 || 0];
    }
    fabric.Object.prototype.initialize.call(this, options, callback);
    // this.callSuper('initialize', options);
    this.set('x1', options.points[0]);
    this.set('y1', options.points[1]);
    this.set('x2', options.points[2]);
    this.set('y2', options.points[3]);

    this._setWidthHeight(options);
  }
});

Object.assign(fabric.Pattern.prototype,{
  /* _TO_SVG_START_ */
  /**
   * Returns SVG representation of a pattern
   * @param {fabric.Object} object
   * @return {String} SVG representation of a pattern
   */
  toSVG: function(object) {
    let patternSource = typeof this.source === 'function' ? this.source() : this.source,
      patternWidth = patternSource.width / object.width,
      patternHeight = patternSource.height / object.height,
      patternOffsetX = this.offsetX / object.width,
      patternOffsetY = this.offsetY / object.height,
      patternImgSrc = '';
    if (this.repeat === 'repeat-x' || this.repeat === 'no-repeat') {
      patternHeight = 1;
      if (patternOffsetY) {
        patternHeight += Math.abs(patternOffsetY);
      }
    }
    if (this.repeat === 'repeat-y' || this.repeat === 'no-repeat') {
      patternWidth = 1;
      if (patternOffsetX) {
        patternWidth += Math.abs(patternOffsetX);
      }

    }

    patternImgSrc = fabric.util.getElementSvgSrc(patternSource);

    return '<pattern id="SVGID_' + this.id +
      '" x="' + patternOffsetX +
      '" y="' + patternOffsetY +
      '" width="' + patternWidth +
      '" height="' + patternHeight + '">\n' +
      '<image x="0" y="0"' +
      ' width="' + patternSource.width +
      '" height="' + patternSource.height +
      '" xlink:href="' + patternImgSrc +
      '"></image>\n' +
      '</pattern>\n';
  }
});

Object.assign(fabric.Polyline.prototype, {
  initialize: function(options,callback) {
    options = options || {};
    this.points = options.points || [];
    delete options.points;
    fabric.Object.prototype.initialize.call(this, options, callback);
    this._setPositionDimensions(options);
  }
});

Object.assign(fabric.Polygon.prototype, {
  initialize: function(options,callback) {
    options = options || {};
    this.points = options.points || [];
    delete options.points;
    fabric.Object.prototype.initialize.call(this, options, callback);
    this._setPositionDimensions(options);
  }
});



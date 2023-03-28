'use strict';


Object.assign(fabric.Path.prototype, {
  accuracy: -1,
  translate: function (path, translateX, translateY) {
    var current;
    //if(this.path[0][0] === "m"){
    //  return;
    //}
    for (var i = 0, len = path.length; i < len; ++i) {

      current = path[i];

      switch (current[0]) { // first letter
        case 'L': // lineto, absolute
          current[1] += translateX;
          current[2] += translateY;
          break;
        case 'H':
          current[1] += translateX;
          break;
        case 'V': // verical lineto, absolute
          current[1] += translateY;
          break;
        case 'M':
          current[1] += translateX;
          current[2] += translateY;
          break;
        case 'C':
          current[1] += translateX;
          current[2] += translateY;
          current[3] += translateX;
          current[4] += translateY;
          current[5] += translateX;
          current[6] += translateY;
          break;
        case 'S':
          current[1] += translateX;
          current[2] += translateY;
          current[3] += translateX;
          current[4] += translateY;
          break;
        case 'Q': // quadraticCurveTo, absolute
          current[1] += translateX;
          current[2] += translateY;
          current[3] += translateX;
          current[4] += translateY;
          break;
        case 'T':
          current[1] += translateX;
          current[2] += translateY;
          break;
        case 'A':
          current[1] += translateX;//todo??
          current[2] += translateY;//todo ??
          current[6] += translateX;
          current[7] += translateY;
      }
    }
  },
  _set_accuracy: function (accuracy, path) {
    for (var i =0 ; i < path.length; i++) {
      for (var j = 1; j < path[i].length; j++) {
        path[i][j] = +path[i][j].toFixed(this.accuracy);
      }
    }
  },
  setAccuracy: function (accuracy) {
    this.accuracy = accuracy;
    if(!this._points)return;
    this._set_accuracy(accuracy, this.path);
  },
  storePathAsString: false,
  _toObject_overwritten: fabric.Path.prototype.toObject,
//todo use event "before:object";
  toObject: function (propertiesToInclude) {

    if(this.accuracy !== -1){
      this._set_accuracy(this.accuracy,this.path);
      this.left = +this.left.toFixed(this.accuracy);
      this.top  = +this.top.toFixed(this.accuracy);
      this.pathOffset.x = +this.pathOffset.x.toFixed(this.accuracy);
      this.pathOffset.y = +this.pathOffset.y.toFixed(this.accuracy);
    }

    var _obj = this._toObject_overwritten(propertiesToInclude);

    if (_obj.pathOffset && this.storeProperties.indexOf("pathOffset") === -1) {
      this.translate(_obj.path, _obj.pathOffset.x, _obj.pathOffset.y);
      this._set_accuracy(this.accuracy,_obj.path);
    }

    for (var i in _obj) {
      if (this.storeProperties.indexOf(i) === -1) {
        delete _obj[i];
      }
    }

    if (this.storePathAsString) {
      _obj.path = _obj.path.join('')
    }
    return _obj;
  }
});

/**
 * Creates an instance of fabric.Path from an object
 * @static
 * @memberOf fabric.Path
 * @param {Object} object
 * @param {Function} callback Callback to invoke when an fabric.Path instance is created
 */
fabric.Path.fromObject = function (object, callback) {
  /* if (typeof object.path === 'string') {
   fabric.loadSVGFromURL(object.path, function (elements) {
   var path = elements[0],
   pathUrl = object.path;

   delete object.path;

   Object.assign(path, object);
   path.setSourcePath(pathUrl);

   callback(path);
   });
   }
   else {*/

  var _scaled = object.scaleX || object.scaleY;

  var path = new fabric.Path(object.path, object);

  if(!_scaled){
    if(object.width){
      path.scaleX = object.width / path.width;
    }
    if(object.height){
      path.scaleY = object.height / path.height;
    }
  }

  callback && callback(path);
  return path;
  // }
};

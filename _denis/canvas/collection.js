/**
 *
 *
 * @example
 *
 colletion("mask-rectangle",{left: ">100"}).remove()

 colletion(fabric.MaskRectangle",{left: ">100"}).remove()

 colletion({type: "mask-rectangle" , left: ">100"}).remove()

 rectangles = this.canvas.collection(fabric.Rect,{color: 'red'});

 //makes all rectangles with attribute "color = 'red'" visible.
 rectangles.updateCollection().set({visible: true});

 */
Object.assign(fabric.Canvas.prototype, {
  collection: function (type, options) {
    let classPrototype;
    let _applicationPrototype;
    if (typeof type === "function") {
      classPrototype = type.prototype;
    } else if (typeof type === "string") {
      classPrototype = this.editor.getKlass(type).prototype;
    } else if (type.type) {
      classPrototype = this.editor.getKlass(type.type).prototype;
      options = type;
    } else {
      options = type;
    }
    options = options || {type: classPrototype.type};

    function makeFunction(foo) {
      return function () {
        let options = arguments;
        this.forEach(function (obj) {
          foo.apply(obj, options)
        });
        return this;
      }
    }

    let collectionProto;
    let _array = this.find(options);
    _array.canvas = this;
    _array.options = options;

    if (classPrototype) {
      if (this.editor) {
        _applicationPrototype = this.editor.getDefaultProperties(classPrototype, {});
      }
      collectionProto = [];
      for (let i in classPrototype) {
        if (typeof classPrototype[i] === "function") {
          collectionProto[i] = classPrototype[i];
        }
      }
      for (let i in _applicationPrototype) {
        if (typeof _applicationPrototype[i] === "function") {
          collectionProto[i] = _applicationPrototype[i];
        }
      }
    } else {
      _array.forEach(function (_obj) {
        if (!collectionProto) {
          collectionProto = [];
          for (let i in _obj) {
            if (typeof _obj[i] === "function") {
              collectionProto[i] = _obj[i];
            }
          }
        } else {
          for (let i in collectionProto) {
            if (!_obj[i] || typeof _obj[i] !== "function") {
              delete collectionProto[i];
            }
          }
        }
      })
    }

    for (let i in collectionProto) {
      collectionProto[i] = makeFunction(collectionProto[i]);
    }
    collectionProto.__proto = _array.__proto__;
    _array.__proto__ = collectionProto;

    _array.setCollection = function (_arr) {
      this.length = 0;
      for (let i in _arr) {
        this.push(_arr[i]);
      }
      return this;
    };
    _array.updateCollection = function () {
      let _arr = this.canvas.find(this.options);
      this.setCollection(_arr)
      return this;
    };

    _array.filter = function () {
      let _arr = this.__proto__.filter.apply(this, arguments);
      this.setCollection(_arr)
      return this;
    };

    return _array;
  }
});


fabric.util.createCanvasElement = function(a, b) {
  let canvas = fabric.document.createElement('canvas');
  if (a && b) {
    canvas.width = a;
    canvas.height = b;
  } else if (a) {
    canvas.width = a.width;
    canvas.height = a.height;
  }
  return canvas;
}

fabric.media = {};

fabric.util.createID = function createID(object) {
  let prefix = (object.idPrefix || object.type + "-")
  let regexp = new RegExp("^" + prefix + "([0-9]+)$")
  let largestNumber = 0
  if(object.type === "canvas" || object.type === "static-canvas"){
    let slides = object.editor && object.editor.slides ;
    if(slides){
      for(let slide of slides) {
        let result = regexp.exec(slide.id);
        if (result) {
          let number = +result[1];
          if (number > largestNumber) {
            largestNumber = number;
          }
        }
      }
    }
  }
  else{
    let slides = object.editor ?
        object.editor.slides || object.editor.canvas && [object.editor.canvas] :
        object.canvas && [object.canvas]
    if(!slides)return
    for(let slide of slides){
      if(!slide._objects)continue;
      for (let obj of slide._objects) {
        let result = regexp.exec(obj.id);
        if (result) {
          let number = +result[1];
          if (number > largestNumber) {
            largestNumber = number;
          }
        }
      }
    }
  }
  return  prefix + (largestNumber + 1)
}

fabric.util.idCounter  = 1;

fabric.util.on({
  "entity:created": function (e) {
    if(!e.options.id){
      e.options.id = fabric.util.createID(e.target)
    }
    fabric.util.initEventListeners(e.target)

    // if (e.options.eventListeners) {
    //   for (let eventName in e.options.eventListeners) {
    //     e.target.on(eventName, e.options.eventListeners[eventName]);
    //   }
    // }
    // delete e.options.eventListeners;
    // if (e.target._default_event_listeners) {
    //   for (let eventName in e.target._default_event_listeners) {
    //     e.target.on(eventName, e.target._default_event_listeners[eventName]);
    //   }
    // }
  }
});


const CanvasMixin = {
  /**
   * @private
   */
  getObjectByID: function (_id) {
    if (this._objects) {
      for (let o of this._objects) {
        if (o.id === _id) {
          return o;
        }
      }
    }
    return null;
  }
}


Object.assign(fabric.StaticCanvas.prototype, CanvasMixin,{})

Object.assign(fabric.Canvas.prototype, CanvasMixin, {})
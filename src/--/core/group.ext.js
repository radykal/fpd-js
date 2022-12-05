
import {toGroupCoords} from './../util/util.js'

let SyncGroupMixin = {
  setObjects (objects,callback){


    if(!objects || !objects.length ){
      this._objects = [];
      callback();
      return this;
    }

    if(this.editor){
      for(let i in objects){
        if(objects[i].constructor === String){
          objects[i] = this.editor.objects[objects[i]];
        }
      }
    }


    if (fabric.util.loaderDebug) {
      let debugInfo = objects.map((o) => {
        if(!o.id)o.id = o.type + "-" + fabric.util.idCounter++;
        return o.id;
      });
      console.log(`${this.id}: 0/${debugInfo.length} . ${debugInfo.join(",")}`);
    }

    this._objects = [];
    let queueLoadCallback = new fabric.util.Loader({
      elements: objects,
      active: false,
      complete: () => {
        this.dirty = true;
        if (this.canvas) this.canvas.renderAll();
        callback && callback();
      },
      progress: ( l, t, el, done, togo) => {
        this.fire("progress", { loaded : l, total : t });
        if (fabric.util.loaderDebug) {
          console.log(`${this.id}: ${l}/${t} . ${el.id} loaded`);
        }
      }
    });

    for (let object of objects) {
      let el = object
      if(object.constructor === Object){
        object = Object.assign({},object);
        object.editor = this.editor;
        el = fabric.util.createObject(object, (el)=>{queueLoadCallback.shift(object)});
      }else{
        queueLoadCallback.shift(object);
      }
      this._objects.push(el);
      this._onObjectAdded(el);
    }

    this.on("added",()=> {
      this._objects.forEach(object => {
        object.canvas = this.canvas;
        object.fire('added');
      })
    });

    if (!this._isAlreadyGrouped) {
      let center = this._centerPoint;
      center || this._calcBounds();
      this._updateObjectsCoords(center);
    }
    else {
      this._updateObjectsACoords();
    }

    this.setCoords();
    queueLoadCallback.activate();
    return this;
  },
  initialize: function(options, callback) {
    this._objects = [];
    this._isAlreadyGrouped = !!options.width;
    // this._isAlreadyGrouped = true;
    this._centerPoint = options.centerPoint;

    fabric.Object.prototype.initialize.call(this, options, callback);

    this.on("removed",() => {
      for (let i = this._objects.length; i--; ) {
        this._onObjectRemoved(this._objects[i]);
        this._objects[i].fire('removed');
      }
    });
    delete this._centerPoint;
    delete this._isAlreadyGrouped;
  }
};

Object.assign(fabric.Group.prototype, SyncGroupMixin, {
  optionsOrder: ["width","height","scaleX","scaleY","resizable","objects","*"],
  storeProperties: ["type","clipPath","frame","deco",'objects'],
  store_objects: function () {
    let _objs = this.getObjects().filter(el=>(el.stored !== false));
    if (!_objs.length)return;
    return _objs.map(instance => {
      return instance.storeObject();
    });
  },
  cloneSync: function () {
    let object = this.storeObject();
    object.objects = this._objects.map(object => {
      return object.cloneSync();
    });
    delete object.type;
    return new fabric.Group(object);
  },
  /* _TO_SVG_START_ */
  /**
   * Returns svg representation of an instance
   * @param {Function} [reviver] Method for further parsing of svg representation.
   * @return {String} svg representation of an instance
   */
  toSVG: function(reviver) {
    var svgString = [];
    if(this.fill && this.fill !== "transparent"){
      var x = -this.width / 2, y = -this.height / 2;
      svgString.push('<rect ', 'COMMON_PARTS', 'x="', x, '" y="', y, '" width="', this.width, '" height="', this.height, '" />\n');
    }

    for (var i = 0, len = this._objects.length; i < len; i++) {
      svgString.push('\t', this._objects[i].toSVG(reviver));
    }

    return this._createBaseSVGMarkup(svgString, { reviver: reviver,/* noStyle: true,*/ withShadow: true });
  },
  fill: "transparent",
  isPossibleTarget: function (e, object) {
    return this.searchPossibleTargets(e, [object]).target !== null;
  },
  /**
   * return inner target and group of targets under the cursor
   * @param e
   * @param objects
   * @returns {{target: null, group: Array}}
   */
  searchPossibleTargets: function (e, objects) {

    if (!objects)objects = this._objects;
    var pointer = this.canvas.getPointer(e, true);
    var i = objects.length,
      normalizedPointer = this.canvas._normalizePointer(this, pointer);

    var targets = {
      target: null,
      group: []
    };
    while (i--) {
      if (this.canvas._checkTarget(normalizedPointer, objects[i])) {
        if (!targets.target) targets.target = objects[i];
        targets.group.push(objects[i]);
      }
    }
    return targets;
  },
  /** todo i tihnk we can unify this method with Object class*/
  drawObject(ctx,forClipping) {
    // if(!forClipping){
    //   this._renderBackground(ctx);
    //   this._setStrokeStyles(ctx, this);
    //   this._setFillStyles(ctx, this);
    //   this._render(ctx);
    // }

    for(let i = 0 ;i < this.beforeRender.length; i++){
      this[this.beforeRender[i]](ctx,forClipping)
    }
    for (let i = 0, len = this._objects.length; i < len; i++) {
      this._objects[i].render(ctx,forClipping);
    }
    this._drawClipPath(ctx);

    for(let i = 0 ;i < this.afterRender.length;  i++){
      this[this.afterRender[i]](ctx,forClipping)
    }
    // //todo
    // if(this._deco){
    //   this._deco.render(ctx,forClipping);
    // }
    // this.drawDeco(ctx,forClipping);
  },
  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  _render(ctx) {
    fabric.Rect.prototype._render.call(this,ctx);
  },
  ungroup () {
    let _canvas = this.canvas;
    _canvas.discardActiveObject();
    this._restoreObjectsState();
    for(let i in this._objects){
      _canvas.add(this._objects[i]);
      this._objects[i].setCoords();
      this._objects[i].clipTo = this.clipTo;
    }
    _canvas.remove(this);
    _canvas.renderAll();
  },
  addWithoutUpdate(object,toBack){
    if(!object)return;
    toGroupCoords(object,this);
    if(object.canvas){
      object.canvas.remove(object);
    }
    if(toBack){
      this._objects.unshift(object);
    }
    else{
      this._objects.push(object);
    }
    object.group = this;
    this.dirty = true;
    this.canvas && this.canvas.renderAll();
    return this;
  },
  eventListeners: {
    'mouseup': function (e) {
      // var target = this.searchPossibleTargets(e.e).target;
      // if (target) {
      //   target.fire("mouseup",e)
      // }
    },
    'mousedown': function (e) {
      // e.e._group = this;
      // for(let subtarget of e.subTargets){
      //   subtarget.fire("mousedown",e)
      // }
      // delete   e.e._group;
    },
    'mousemove': function (e) {
      //
      //if(e.target == this || e.target == this.element &&  this.isPossibleTarget(e.e,this.submit)){
      //    this.canvas.hoverCursor = 'pointer';
      //}else{
      //    this.canvas.hoverCursor = 'move';
      //}
    }
  }
})

Object.assign(fabric.ActiveSelection.prototype, SyncGroupMixin,{
  /**
   * If returns true, deselection is cancelled.
   * @since 2.0.0
   * @return {Boolean} [cancel]
   */
  onDeselect: function() {
    this.destroy();
    this.fire("group:removed")
    return false;
  },
  removeFromCanvas() {
    this.canvas.processing = true;
    this.canvas.discardActiveObject();
    for (let o of this._objects) {
      this.canvas.remove(o);
    }
    this.canvas.processing = false;
    this.canvas.fire("group:removed", {target: this});
    this.canvas.renderAll();
  },
  duplicate() {

    this.canvas.fire('before:selection:cleared', {target: this, e: null});
    this.canvas.discardActiveGroup();
    this.duplicate(function (el) {
      el.ungroup();
    });

    this.canvas.renderAll();

    // this.canvas._discardActiveObject();
    // let group = [];
    // for(let o of this._objects){
    //   let clone = o.duplicate();
    //   group.push(clone);
    //   this.canvas.add(clone);
    // }
    //
    // let aGroup = new fabric.ActiveSelection(group, {
    //   canvas: this.canvas
    // });
    // // this.fire('selection:created', { target: group });
    // this.canvas.setActiveObject(aGroup, e);
  },
  groupElements (){
    let group = this._groupElements();
    this.canvas.add(group);
    this.canvas.setActiveObject(group);
  },
  _groupElements (){
    this._restoreObjectsState();
    let objects = this._objects;
    delete this._objects;
    let object = this.storeObject();
    delete object.type;
    object.canvas = this.canvas;
    let group = new fabric.Group(object);

    this.canvas.discardActiveObject();

    for(let i in objects){
      this.canvas.remove(objects[i]);
      group.addWithoutUpdate(objects[i]);
    }
    return group;
  }
})

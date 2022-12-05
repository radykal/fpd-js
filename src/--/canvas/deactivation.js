
Object.assign(fabric.Canvas.prototype, {
  /**
   * не позволяет снимать выделение с объектов
   */
  deactivationDisabled: false,
  /**
   * Discards currently active object and fire events
   * @param {event} e
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  discardActiveObject: function (e) {
    var activeObject = this._activeObject;
    if(!activeObject)return this;

    this.fire('before:selection:cleared', { target: activeObject, e: e });

    this._discardActiveObject();

    this.fire('selection:cleared', { e: e });
    activeObject && activeObject.fire('deselected', { e: e });
    return this;
  },
  _discardActiveObject: function(){
    if (this._activeObject && !this.deactivationDisabled && !this._activeObject.deactivationDisabled) {
      this._activeObject.set('active', false);
    }
    this._activeObject = null;
  },

  /**
   * Discards currently active group and fire events
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  discardActiveGroup: function (e) {
    var g = this.getActiveGroup();
    if(!g)return this;
    this.fire('before:selection:cleared', { e: e, target: g });

    if (this.deactivationDisabled || g.deactivationDisabled) {
      this._activeGroup = null;
    }else{
      this._discardActiveGroup();
    }

    this.fire('selection:cleared', { e: e });
    return this;
  },

  /**
   * Deactivates all objects on canvas, removing any active group or object
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  deactivateAll: function () {
    if (!this.deactivationDisabled) {
      var allObjects = this.getObjects(),
        i = 0,
        len = allObjects.length;
      for (; i < len; i++) {
        !allObjects[i].deactivationDisabled && allObjects[i].set('active', false);
      }
      var g = this.getActiveGroup();
      g && !g.deactivationDisabled &&  this._discardActiveGroup();
      this._activeObject && !this._activeObject.deactivationDisabled && this._discardActiveObject();
    }else{
      this._activeGroup = null;
      this._activeObject = null;
    }
    return this;
  },
  setActiveObject: function (object, e) {
    if(object){
      this._setActiveObject(object);
      this.renderAll();
      this.fire('object:selected', { target: object, e: e });
      object.fire('selected', { e: e });
    }else{
      this.discardActiveObject();
    }
    return this;
  },
  /**
   * @private
   * @param {Object} object
   */
  _setActiveObject: function(object) {
    if (!this.deactivationDisabled) {
      if (this._activeObject && !this._activeObject.deactivationDisabled) {
        this._activeObject.set('active', false);
      }
    }
    this._activeObject = object;

    if(object){
      object.set('active', true);
    }
  }
});

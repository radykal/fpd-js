/**
 * InteractiveMode mixin. Allow to switch between pan/edit/drawing canvas modes.
 */
let _mouse_down_overwritten = fabric.Canvas.prototype._onMouseDown;

fabric.RIGHT_CLICK = 3;
fabric.MIDDLE_CLICK = 2;
fabric.LEFT_CLICK = 1;

Object.assign(fabric.Object.prototype, {
  deactivationDisabled: false
})
Object.assign(fabric.Canvas.prototype, {
  /**
   * не позволяет снимать выделение с объектов
   */
  deactivationDisabled: false,
  discardActiveObject: function (e) {
    var currentActives = this.getActiveObjects(), activeObject = this.getActiveObject();
    if (currentActives.length) {
      this.fire('before:selection:cleared', {target: activeObject, e: e});
      this._discardActiveObject(e);
      this._fireSelectionEvents(currentActives, e);
    }
    return this;
  },
  _discardActiveObject: function(e, object) {
    if (this.deactivationDisabled) {//deactivationDisabled added
      return;
    }
    var obj = this._activeObject;
    if (obj && !obj.deactivationDisabled) { //deactivationDisabled added
      // onDeselect return TRUE to cancel selection;
      if (obj.onDeselect({ e: e, object: object })) {
        return false;
      }
      obj._set('active', false); //added
      this._activeObject = null;
    }
    return true;
  },
  _setActiveObject: function(object, e) {
    if (this._activeObject === object) {
      return false;
    }
    if (!this._discardActiveObject(e, object)) {
      return false;
    }
    if (object.onSelect({ e: e })) {
      return false;
    }
    this._activeObject = object;
    object._set('active', true); //added
    return true;
  },
  hover: false,
  _initEventListeners_overwritten: fabric.Canvas.prototype._initEventListeners,
  _initEventListeners: function () {
    this._initEventListeners_overwritten();
    this.___onMouseOutHandleHover = this._onMouseOutHandleHover.bind(this);
    this.___onMouseOverHandleHover = this._onMouseOverHandleHover.bind(this);
    this.___onKeyDownHandleHover = this._onKeyDownHandleHover.bind(this);
    this.___onKeyUpHandleHover = this._onKeyUpHandleHover.bind(this);
    fabric.util.addListener(this.upperCanvasEl, 'mouseout', this.___onMouseOutHandleHover);
    fabric.util.addListener(this.upperCanvasEl, 'mouseover', this.___onMouseOverHandleHover);
    fabric.util.addListener(fabric.window, 'keydown', this.___onKeyDownHandleHover);
    fabric.util.addListener(fabric.window, 'keyup', this.___onKeyUpHandleHover);
  },
  _removeListeners_overwritten: fabric.Canvas.prototype.removeListeners,
  removeListeners: function () {
    this._removeListeners_overwritten();
    fabric.util.removeListener(this.upperCanvasEl, 'mouseout', this.___onMouseOutHandleHover);
    fabric.util.removeListener(this.upperCanvasEl, 'mouseover', this.___onMouseOverHandleHover);
    fabric.util.removeListener(fabric.window, 'keydown', this.___onKeyDownHandleHover);
    fabric.util.removeListener(fabric.window, 'keyup', this.___onKeyUpHandleHover);
  },
  _onMouseOutHandleHover: function (e) {
    this.hover = false;
  },
  _onMouseOverHandleHover: function (e) {
    this.hover = true;
  },
  _onKeyDownHandleHover: function (e) {
    if(!this.hover)return;
    if(this.interactiveMode === "mixed") {
      if (this.handModeEnabled && !this.isHandMode && !this._isCurrentlyDrawing && !this._currentTransform && e.key === this.handModeKey) {
        this.isHandMode = true;
        this.isDrawingMode = false;
        this.setCursor('grab');
      }
    }
  },
  _onKeyUpHandleHover: function (e) {
    if(this.interactiveMode === "mixed") {
      if (this.isHandMode && e.key === this.handModeKey) {
        this.isHandMode = false;
        this._updateMixedInteractiveMode(e);
      }
    }
  },
  getInteractiveMode: function () {
    return this.interactiveMode;
  },
  setInteractiveMode: function (tool) {
    this.isDrawingMode = (tool === 'draw');
    this.isHandMode = (tool === 'hand');
    this.interactive = (tool !== 'disabled');
    this.isMixedMode = (tool === 'mixed');

    if(tool === "draw"){
      this.setCursor(this.freeDrawingCursor);
    }
    if(tool === "hand") {
      this.setCursor('grab');
    }

    if (!this.interactive) {
      this.upperCanvasEl.style.cursor = 'default';
    }
    this.interactiveMode = tool;
  },
  /**
   *  current mode
   *  @values default | hand | selection
   *  @comment
   *      hand      - moving canvas
   *      draw - drawing reactangles
   *      selection - default behavior
   */
  interactiveMode: 'default',
  handScrollContainer: false,
  scrollTarget: "viewport", // "container
  _handModeMouseMove: function (e) {
    this._handModeData.state = "move";

    if (e.pageY === this._handModeData.dragCursorPosition.y && e.pageX === this._handModeData.dragCursorPosition.x) {
      return;
    }

    if(this.scrollTarget === "container"){
      this.editor.dragScrollContainer(e);
    }

    if(this.scrollTarget === "viewport") {
      let scroll = {x: this.viewportTransform[4], y: this.viewportTransform[5]};

      let newScroll = {
        x: scroll.x - (this._handModeData.dragCursorPosition.x - e.pageX),
        y: scroll.y - (this._handModeData.dragCursorPosition.y - e.pageY)
      };
      //
      // let dims = {
      //   width: this.size.width * this.zoom - this.lowerCanvasEl.width,
      //   height: this.size.height * this.zoom - this.lowerCanvasEl.height
      // };
      /*  todo need to add some restrictions later
			 //Math.max(Math.min(0,newScroll.x),-dims.width);
			 //Math.max(Math.min(0,newScroll.y),-dims.height);
			 */
      this.viewportTransform[4] = newScroll.x;
      this.viewportTransform[5] = newScroll.y;

      this.fire('viewport:translate',{x: this.viewportTransform[4], y : this.viewportTransform[5]});

      this.renderAll();
      for (let i = 0, len = this._objects.length; i < len; i++) {
        this._objects[i].setCoords();
      }

      this._handModeData.dragCursorPosition.y = e.pageY;
      this._handModeData.dragCursorPosition.x = e.pageX;
    }
  },
  _handModeMouseUp: function () {
    delete this._handModeData;
  },
  _handModeMouseDown: function (e) {

    this._handModeData = {
      state: "down",
      dragCursorPosition:  {
        y: e.pageY,
        x: e.pageX
      }
    };

    if(this.scrollTarget === "container"){
      this.editor.initScrollContainerDragging();
    }
  },
  freeHandModeEnabled: false,
  handModeEnabled: true,
  handModeKey: "Alt",
  _onMouseMove: function (e) {
    if (!this.interactive) {
      return;
    }

    //
    // if(this._currentTransform) {
    //   this._cacheTransformEventData(e);
    //   this._transformObject(e);
    //   this._handleEvent(e, 'move');
    //   this._resetTransformEventData();
    // }
    // else{
    if(this._activeObject || !this.allowTouchScrolling) {
      e.preventDefault && e.preventDefault();
    }
    let _lastHoveredTarget = this._hoveredTarget;
    this._hoveredTarget = this.findTarget(e) || null;
    if(_lastHoveredTarget !== this._hoveredTarget){
      if(_lastHoveredTarget){
        let obj = _lastHoveredTarget;
        obj.fire("blur")
        this.fire("object:blur",{target:obj})
      }
      if(this._hoveredTarget){
        let obj = this._hoveredTarget;
        obj.fire("focus")
        this.fire("object:focus",{target:obj})
      }
    }

    this.updateInteractiveMode(e);
    // this._applyMixedMode(e);

    if (this._handModeData) {
      return this._handModeMouseMove(e);
    } else {
      this.__onMouseMove(e);
    }
    // }

  }, /**
   * @private
   */
  _onScale: function (e, transform, x, y) {

    let useUniScale = e.shiftKey ^ this.shiftInverted;
    // rotate object only if shift key is not pressed
    // and if it is not a group we are transforming
    if ((useUniScale || this.uniScaleTransform) && !transform.target.get('lockUniScaling')) {
      transform.currentAction = 'scale';
      return this._scaleObject(x, y);
    }
    else {
      // Switch from a normal resize to proportional
      if (!transform.reset && transform.currentAction === 'scale') {
        this._resetCurrentTransform(e);
      }

      transform.currentAction = 'scaleEqually';
      return this._scaleObject(x, y, 'equally');
    }
  },
  shiftInverted: false,
  _setCursorFromEvent_overwritten: fabric.Canvas.prototype._setCursorFromEvent,
  _setCursorFromEvent: function (e, target) {
    if (this.isHandMode) {
      this.setCursor('grab');
    } else {
      this._setCursorFromEvent_overwritten(e, target);
    }
  },
  _updateMixedInteractiveMode(e){
    if (e.altKey ) {
      this.isHandMode = true
    }
    if(this.isHandMode){
      if ( !e.altKey ) {
        if(this._hoveredTarget){
          this.isHandMode = false;
          this.isDrawingMode = false;
          this.setCursor(this.defaultCursor);
        }
      }
    }
    else if (this.freeHandModeEnabled && !this._hoveredTarget && !this._isCurrentlyDrawing ){
      this.isHandMode = true;
      this.isDrawingMode = false;
      this.setCursor('grab');
    }
    else if (this.drawingModeEnabled ) {


      if(!this._isCurrentlyDrawing && !this._currentTransform) {
        this.isHandMode = false;

        if (this._hoveredTarget) {
          if (this.freeDrawingBrush && this._hoveredTarget.allowDrawing) {
            let corner = this._hoveredTarget._findTargetCorner(this.getPointer(e, true));
            if (!corner) {
              this.isDrawingMode = true;
              this.setCursor(this.freeDrawingCursor);
            } else {
              this.isDrawingMode = false;
              this.setCursor(this.defaultCursor);
            }
          } else if (this.isDrawingMode) {
            this.isDrawingMode = false;
            this.setCursor(this.defaultCursor);
          }


        } else {
          if (this.freeDrawingBrush && !this.isDrawingMode) {
            this.isDrawingMode = true;
            this.setCursor(this.freeDrawingCursor);
          }
        }
      }
    } else {
      this.isHandMode = false;
      this.isDrawingMode = false;
      this.setCursor(this.defaultCursor);
    }
  },
  updateInteractiveMode(e){
    switch(this.interactiveMode){
      case "hand":
        this.isHandMode = true;
        this.isDrawingMode = false;
        return;
      case "default":
        this.isHandMode = false;
        this.isDrawingMode = false;
        return;
      case "draw":
        this.isHandMode = false;
        this.isDrawingMode = true;
        return;
      case "mixed":
        this._updateMixedInteractiveMode(e);
    }
  },
  drawingModeEnabled: false,
  __onMouseDown: function (e) {

    //controls.js this._ready_for_click_action = true;
    if (!this.interactive) {
      return;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //ORIGINAL MOUSEDOWN
    function checkClick(e, value) {return 'which' in e ? e.which === value : e.button === value - 1;}
    this._cacheTransformEventData(e);
    this._handleEvent(e, 'down:before');
    let target = this._hoveredTarget;

    if(this.targets[0]){
      target = this.targets[0]
    }

    if (checkClick(e, fabric.RIGHT_CLICK)) {
      if (this.fireRightClick) {
        this._handleEvent(e, 'down', fabric.RIGHT_CLICK);
      }
      return;
    }

    if (checkClick(e, fabric.MIDDLE_CLICK)) {
      if (this.fireMiddleClick) {
        this._handleEvent(e, 'down', fabric.MIDDLE_CLICK);
      }
      return;
    }

    if (this.isHandMode){
      this._handModeMouseDown(e);
      return;
    }
////////////////////ORIGINAL
    if (this.isDrawingMode) {
      this._onMouseDownInDrawingMode(e);
      return;
    }

    // ignore if some object is being transformed at this moment
    if (this._currentTransform) {
      return;
    }

    let pointer = this._pointer;
    // save pointer for check in __onMouseUp event
    this._previousPointer = pointer;
    let shouldRender = this._shouldRender(target),
        shouldGroup = this._shouldGroup(e, target);
    if (this._shouldClearSelection(e, target)) {
      this.discardActiveObject(e);
    }
    else if (shouldGroup) {
      this._handleGrouping(e, target);
      target = this._activeObject;
    }

    if (this.selection && (!target ||
        (!target.selectable && !target.isEditing && target !== this._activeObject))) {
      this._groupSelector = {
        ex: pointer.x,
        ey: pointer.y,
        top: 0,
        left: 0
      };
    }

    if (target) {
      let alreadySelected = target === this._activeObject;
      if (!alreadySelected && target.selectable) {
        this.setActiveObject(target, e);
      }
      if(target === this._activeObject){
        if(target.hasControls && target.__corner){
          if(target.isEditing){
            target.exitEditing();
          }
          this._setupCurrentTransform(e, target, alreadySelected || target.active);
        }
        else if(!target.isEditing && !shouldGroup && target.draggable) {
          this._setupCurrentTransform(e, target, alreadySelected || target.active);
        }
      }
      // if(!target.isEditing){
      //   if (target === this._activeObject && (target.__corner || !shouldGroup)) {
      //     this._setupCurrentTransform(e, target, alreadySelected || target.active);
      //   }
      // }
    }
    this._handleEvent(e, 'down');
    // we must renderAll so that we update the visuals
    (shouldRender || shouldGroup) && this.requestRenderAll();
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //END ORIGINAL MOUSEDOWN
  },
  _onMouseUp_overwritten: fabric.Canvas.prototype._onMouseUp,
  _onMouseUp: function (e) {
    if (!this.interactive) {
      return;
    }
    this.updateInteractiveMode(e);
    // e.preventDefault();
    e.stopPropagation();

    let shouldRender = false;
    this._onMouseUp_overwritten.call(this, e);

    if (this._handModeData) {
      this._handModeMouseUp();
    }
    shouldRender && this.requestRenderAll();
  }
});


function focusNextElement(previos) {
  //add all elements we want to include in our selection
  var focussableElements = 'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), textarea:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
  // if (document.activeElement ) {
  var focussable = Array.prototype.filter.call(document.querySelectorAll(focussableElements),
    function (element) {
      //check for visibility while always include the current activeElement
      return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
    });

  var index = focussable.indexOf(document.activeElement);
  var nextElement;
  if(previos){
    nextElement = focussable[index - 1] || focussable[focussable.length - 1];
  }else{
    nextElement = focussable[index + 1] || focussable[0];
  }
  nextElement.focus();
  // }
};

fabric.IText.prototype.activateNextObject = function(e){
  this.exitEditing();
  var _prev = e.shiftKey;
  this.canvas.activateNextObject(_prev);
};

fabric.IText.prototype.keysMap[9] = "activateNextObject";

fabric.focusedCanvas = null;
fabric.util.addListener(fabric.window, 'keydown', function(e){
  if(e.code === "Tab"){
    fabric._tabbableSetToLast = e.shiftKey;
  }
});

Object.assign(fabric.Canvas.prototype,{
  tabbable: false,
  activateFirstObject: function () {
    // this.discardActiveGroup();
    this.discardActiveObject();
    if(this._objects.length > 0){
      this.setActiveObject(this._objects[0]);
    }
  },
  activateLastObject: function () {
    // this.discardActiveGroup();
    this.discardActiveObject();
    if(this._objects.length > 0){
      this.setActiveObject(this._objects[this._objects.length - 1]);
    }
  },
  activateNextObject: function (previos) {
    var _active =  this.getActiveObject();
    var _index = this._objects.indexOf(_active);
    var next = this._objects[_index + (previos ? - 1 : 1)];
    if(next){
      this.setActiveObject(next);
    }else{
      // this.discardActiveGroup();
      this.discardActiveObject();

      this._ignoreFocusEvent = true;
      $(this.inputElement).focus();
      fabric._tabbableSetToLast = previos;
      focusNextElement(previos);
    }
  },
  setTabbable: function(value) {
    if(this.tabbable === value){
      return;
    }
    this.tabbable = value;
    if(!this.lowerCanvasEl)return;
    if(!value){
      $(this.inputElement).remove();
      delete this.inputElement;
      return;
    }
    var _this = this;

    this.inputElement = fabric.document.createElement('input');
    this.inputElement.setAttribute("type","text");
    this.inputElement.style.cssText = 'position: absolute; z-index: -999; opacity: 0; width: 1px; height: 1px; font-size: 1px;';
    this.wrapperEl.appendChild(this.inputElement);
    fabric.util.addListener(this.inputElement, 'focus', this.focus.bind(this));

    $(this.inputElement).bind({
      focus : function() {
        if(_this._ignoreFocusEvent){
          delete _this._ignoreFocusEvent;
          return false;
        }
        _this.focus();
        // fabric.focusedCanvas = _this;
        fabric._tabbableSetToLast ? _this.activateLastObject() : _this.activateFirstObject();
        // $(_this.wrapperEl).css('border','1px dotted #000');
      },
      blur : function() {
        // fabric.focusedCanvas = null;
        // $(this.wrapperEl).css('border','none');
      }
    });
    this.on("mouse:down", this.focus.bind(this))

  },
  onkeyUp: function(e){
    console.log(e);
  },
  blur: function(){
    if(this._activeObject){
      if(this._activeObject.isEditing){
        this._activeObject.exitEditing();
      }
    }
    // this.discardActiveGroup();
    this.discardActiveObject();
    this.renderAll();
    return this;
  },
  focus: function(){
    if(fabric.focusedCanvas == this){
      return;
    }
    if(fabric.focusedCanvas){
      fabric.focusedCanvas.blur();
    }
    fabric.focusedCanvas = this;
    return this;
    // this.activateNextObject();
    // $(this.wrapperEl).css('border','1px dotted #000');
    // $(this.wrapperEl).focus();
  }
});

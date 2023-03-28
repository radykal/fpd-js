let SyncTextMixin = {
  set(key, value , callback) {
		fabric.Object.prototype.set.call(this, key, value, callback);
    var needsDims = false;
    if (typeof key === 'object') {
      for (var _key in key) {
        needsDims = needsDims || this._dimensionAffectingProps.indexOf(_key) !== -1;
      }
    } else {
      needsDims = this._dimensionAffectingProps.indexOf(key) !== -1;
    }
    if (needsDims) {
      this.initDimensions();
      this.setCoords();
    }
    return this;
  },
  onInput_overwritten: fabric.IText.prototype.onInput,
  onInput: function(e) {
    this.saveState(["text","styles"]);
    this.onInput_overwritten(e);
  },
  toObject: fabric.Object.prototype.toObject,
  accepts: {
    role: "fontFamily"
  },
  setData: function (data) {
    if (data.role === "fontFamily") {
      this.setFontFamily(data.fontFamily)
    }
  },
  getStyle: function (styleName) {
    if (this.getSelectionStyles && this.isEditing){
      let selectionPosition;
      if(this.selectionStart === this.selectionEnd){
        selectionPosition = this.selectionStart > 0 ? this.selectionStart - 1 : this.selectionStart;
      }else{
        selectionPosition = this.selectionStart;
      }
      let style = this.getStyleAtPosition(selectionPosition)[styleName];
      return style !== undefined ? style : this[styleName];
    }else{
      return (this[styleName] === undefined ? this['__' + styleName] : this[styleName]);
    }
  },
  getPattern: function (url) {
    let _fill = this.getStyle('fill ');
    return _fill && _fill.source;
  },
  setPattern: function (url) {
    if (!url) {
      this.setStyle('fill');
    } else {
      // var _texture = _.findWhere(this.project.textures, {id: url});
      fabric.util.loadImage(url,  (img) => {
        this.setStyle('fill', new fabric.Pattern({
          source: img,
          repeat: 'repeat'
        }));
      }, this, this.crossOrigin); //todo
    }
  },
  /* getOpacity: function () {
    return this.getStyle('opacity') * 100;
  },
  setOpacity: function (value) {
    this.setStyle('opacity', parseInt(value, 10) / 100);
  },*/
  // getRadius: function () {
  //   return this.get('radius');
  // },
  setShadow: function (options) {
    return this.setProperty('shadow', options ? new fabric.Shadow(options) : null);
  },
  // setRadius: function (value) {
  //   this.setProperty('radius', value);
  // },
  getSpacing: function () {
    return this.get('spacing');
  },
  setSpacing: function (value) {
    this.setProperty('spacing', value);
  },
  getReverted: function () {
    return this.get('reverted');
  },
  setReverted: function (value) {
    this.setProperty('reverted', value);
  },
  getText: function () {
    return this.get('text');
  },
  setText: function (value) {
    this.setProperty('text', "" + value);
  },
  getTextAlign: function () {
    return this.get('textAlign');
  },
  setTextAlign: function (value) {
    this.setProperty('textAlign', value.toLowerCase());
  },
  setStyles: function(val){
    this.styles = val || {};
  },
  getStyles: function () {
    return {
      fill: this.fill,
      fontSize: this.fontSize,
      textBackgroundColor: this.textBackgroundColor,
      fontFamily: this.fontFamily,
      fontWeight: this.fontWeight,
      fontStyle: this.fontStyle,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth
    };
  },
  getBgColor: function () {
    return this.get('backgroundColor');
  },
  setBgColor: function (value) {
    this.setProperty('backgroundColor', value);
  },
  getTextBgColor: function () {
    return this.get('textBackgroundColor');
  },
  setTextBgColor: function (value) {
    this.setProperty('textBackgroundColor', value);
  },
  decreaseFontSize: function () {
    this.setStyle('fontSize', parseInt(this.getStyle('fontSize')) - 1);
  },
  increaseFontSize: function () {
    this.setStyle('fontSize', parseInt(this.getStyle('fontSize')) + 1);
  },
  minFontSize: 2,
  maxFontSize: 250,
  minLineHeight: 2,
  maxLineHeight: 200,
  maxStrokeWidth: function () {
    return Math.ceil(this.getFontSize() / 10);
  },
  addText: function (text, options) {
    let match = this.text.match(/\n/g);
    let lineIndex = match && match.length || 0;
    let charIndex = this.text.length - this.text.lastIndexOf("\n") - 1;

    if (!this.styles[lineIndex]) {
      this.styles[lineIndex] = {}
    }

    if (!this.styles[lineIndex][charIndex]) {
      this.styles[lineIndex][charIndex] = {}
    }
    Object.assign(this.styles[lineIndex][charIndex], options);
    this.text += text;
    // this.styles;
  },
  // _checkModifiedText: function (prop, value) {
  //   if (this.isEditing) {
  //     var isTextChanged = (this._textBeforeEdit !== this.text);
  //     if (isTextChanged) {
  //       this.canvas.fire("object:modified", {target: this});
  //     }
  //   }
  // },


  /*
  @override

   */
  renderCursor: function(boundaries, ctx) {
    var cursorLocation = this.get2DCursorLocation(),
      lineIndex = cursorLocation.lineIndex,
      charIndex = cursorLocation.charIndex > 0 ? cursorLocation.charIndex - 1 : 0,
      charHeight = this.getValueOfPropertyAt(lineIndex, charIndex, 'fontSize'),
      multiplier = this._getParentScaleX() * this.canvas.getZoom(), //overriden
      cursorWidth = this.cursorWidth / multiplier,
      topOffset = boundaries.topOffset,
      dy = this.getValueOfPropertyAt(lineIndex, charIndex, 'deltaY');

    topOffset += (1 - this._fontSizeFraction) * this.getHeightOfLine(lineIndex) / this.lineHeight
      - charHeight * (1 - this._fontSizeFraction);

    if (this.inCompositionMode) {
      this.renderSelection(boundaries, ctx);
    }

    ctx.fillStyle = this.getValueOfPropertyAt(lineIndex, charIndex, 'fill');
    ctx.globalAlpha = this.__isMousedown ? 1 : this._currentCursorOpacity;
    ctx.fillRect(
      boundaries.left + boundaries.leftOffset - cursorWidth / 2,
      topOffset + boundaries.top + dy,
      cursorWidth,
      charHeight);
  },

  setProperty: function (property, value) {
    if (this.canvas && this.canvas.stateful) {
      // this._checkModifiedText();
      this.saveState([property]);
    }

    this[property] = value;

    this.updateState();

    // this.fire("modified", {});
    // if (this.canvas) {
    //   this.canvas.fire("object:modified", {target: this});
    //   this.canvas.renderAll();
    // }
    this._textBeforeEdit = this.text;
  },
  _removeStyle: function (styleName) {
    for(let row in this.styles) {
      for (let index in this.styles[row]) {
        delete this.styles[row][index][styleName]
      }
    }
  },
  _removeStyleAt: function (propertyToRemove,index) {
    var loc = this.getStylePosition(index);
    if (!this._getLineStyle(loc.lineIndex) || !this._getStyleDeclaration(loc.lineIndex, loc.charIndex)) {
      return;
    }
    let style = this.styles[loc.lineIndex][loc.charIndex];
    delete style[propertyToRemove];
    if(!Object.keys(style).length ){
      delete this.styles[loc.lineIndex][loc.charIndex];
      if(!this.styles[loc.lineIndex].length ){
        delete this.styles[loc.lineIndex];
      }
    }
  },
  _modifyObjectStyleProperty (styleName,value){
    let count = 0;
    for(let row in this.styles) {
      for (let index in this.styles[row]) {
        if(this.styles[row][index] === undefined || this.styles[row][index][styleName] === value){
          count++;
        }else{
          return;
        }
      }
    }
    if(count === this.text.length){
      this._removeStyle(styleName);
      this[styleName] = value;
    }
  },
  setStyleInterval: function (styleName, value, start ,end) {
    if (value === undefined || this[styleName] === value){
      for (let i = start; i < end; i++) {
        this._removeStyleAt(styleName,i);
      }
      this._forceClearCache = true;
    }else{
      this.setSelectionStyles({[styleName]: value}, start, end);
    }
    this._modifyObjectStyleProperty(styleName,value);
    this.setCoords();
  },
  setStyle: function (styleName, value) {
    if (this.canvas && this.canvas.stateful) {
      // this._checkModifiedText();
      this.saveState(["styles",styleName]);
    }
    this.__selectionStart = this.selectionStart;
    this.__selectionEnd = this.selectionEnd;
    this.__changedProperty = styleName;

    let _old = this.getStyles();

    _old.styles = this.styles;

    if (this.setSelectionStyles && this.isEditing && this.selectionStart !== this.selectionEnd) {
      this.setStyleInterval(styleName, value,this.selectionStart,this.selectionEnd)
    }
    else {
      if (value !== undefined) {
        this._removeStyle(styleName);
        this[styleName] = value;
      } else {
        delete this[styleName];
      }
      if (!this._textLines && this.ready) {
        this._clearCache();
        this._splitText();
      }
      // this.cleanStyle(styleName);
    }

    this.setCoords();

    if (this.caching) {
      this.dirty = true;
    }

    this.updateState();

    // this.fire("modified", {});
    // if (this.canvas) {
    //   this.canvas.fire("object:modified", {target: this});
    //   this.canvas.renderAll();
    // }
    delete this.__changedProperty;
    delete this.__selectionStart;
    delete this.__selectionEnd;
  },
  generateTextStyle: function () {
    return {
      'font-style': this.getStyle('fontStyle'),
      'font-weight': this.getStyle('bold'),
      'text-decoration':
        ( this.getStyle('linethrough') ? 'line-through ' : '') +
        ( this.getStyle('overline') ? 'overline ' : '') +
        ( this.getStyle('underline') ? 'underline ' : '')
    }
  }
}

Object.assign(fabric.Text.prototype, SyncTextMixin, {
  /**
   * re- redner group when text is modified
   * @private
   */
  _shouldClearDimensionCache: function() {
    var shouldClear = this._forceClearCache;
    shouldClear || (shouldClear = this.hasStateChanged('_dimensionAffectingProps'));
    if (shouldClear) {
      this.dirty = true;
      this._forceClearCache = false;
      if(this.group){
        this.group.dirty = true;
      }
    }
    return shouldClear;
  },
  storeProperties: ["type", "clipPath","frame","deco",'textLines'],
  eventListeners: {
    changed: function(e) {
      this.fire("modified", {});
      if (this.canvas) {
        this.canvas.fire("object:modified", {target: this});
        this.canvas.renderAll();
      }
    },
  },
  initialize: function (options,callback) {
    this.styles = options ? (options.styles || { }) : { };
    this.text = options.text || "";
    this.__skipDimension = true;
    fabric.Object.prototype.initialize.call(this, options, callback);
    this.__skipDimension = false;

    this.ready = true;
    // this._clearCache();
    // this._splitText();
    // this.cleanStyle(styleName);

    if(!(this.editor && this.editor.virtual && !this.editor.ready)){
      this.initDimensions();
    }
    if(this.replaceIncompatibleSymbolsEnabled){
      this.replaceIncompatibleSymbols();
    }

    // this.setCoords();
    this.setupState({ propertySet: '_dimensionAffectingProps' });
  },
  textCase: "none",
  isText: true,
  getStylePosition(index){
    return this.get2DCursorLocation(index);
  },
  store_textLines(){
    return this.textLines.map(line => line.length);
  },
  setTextLines (val){
    // console.log("text lines",val,this.textLines);
  },
  /**
   * Check if characters in a text have a value for a property
   * whose value matches the textbox's value for that property.  If so,
   * the character-level property is deleted.  If the character
   * has no other properties, then it is also deleted.  Finally,
   * if the line containing that character has no other characters
   * then it also is deleted.
   *
   * @param {string} property The property to compare between characters and text.
   */
  cleanStyle: function (property) {
    if (!this.styles || !property || property === '') {
      return false;
    }
    var obj = this.styles, stylesCount = 0, letterCount, stylePropertyValue,
      allStyleObjectPropertiesMatch = true, graphemeCount = 0, styleObject;
    // eslint-disable-next-line
    for (var p1 in obj) {
      letterCount = 0;
      // eslint-disable-next-line
      for (var p2 in obj[p1]) {
        var styleObject = obj[p1][p2],
          stylePropertyHasBeenSet = styleObject.hasOwnProperty(property);

        stylesCount++;

        if (stylePropertyHasBeenSet) {
          if (!stylePropertyValue) {
            stylePropertyValue = styleObject[property];
          }
          else if (styleObject[property] !== stylePropertyValue) {
            allStyleObjectPropertiesMatch = false;
          }

          if (styleObject[property] === this[property]) {
            delete styleObject[property];
          }
        }
        else {
          allStyleObjectPropertiesMatch = false;
        }

        if (Object.keys(styleObject).length !== 0) {
          letterCount++;
        }
        else {
          delete obj[p1][p2];
        }
      }

      if (letterCount === 0) {
        delete obj[p1];
      }
    }
    // if every grapheme has the same style set then
    // delete those styles and set it on the parent
    for (var i = 0; i < this._textLines.length; i++) {
      graphemeCount += this._textLines[i].length;
    }

    if (allStyleObjectPropertiesMatch && stylesCount === graphemeCount) {

      //edited:  visceroid
      if (stylePropertyValue !== undefined) {
        this[property] = stylePropertyValue;
      }
      this.removeStyle(property);
    }
  },
  fontSizeOptions: [6,7,8,9,10,12,14,18,24,36,48,64],
  //overwritten. Assign _measuringContext property to Editor. not to global Fabric. To avoid text measuring problems on Nodes.
  //_measuringContext will be individual for every editor.
  getMeasuringContext: function() {
    let context = this.editor || fabric;
    // if we did not return we have to measure something.
    if (!context._measuringContext) {
      context._measuringContext = this.canvas && this.canvas.contextCache ||
        fabric.util.createCanvasElement().getContext('2d');
    }
    return context._measuringContext;
  },
  /**
   * Calculate height of line at 'lineIndex'
   * @param {Number} lineIndex index of line to calculate
   * @return {Number}
   */
  getHeightOfLine: function(lineIndex) {
    if(!this.__lineHeights){
      this.initDimensions();
    }
    if (this.__lineHeights[lineIndex]) {
      return this.__lineHeights[lineIndex];
    }

    var line = this._textLines[lineIndex],
      // char 0 is measured before the line cycle because it nneds to char
      // emptylines
      maxHeight = this.getHeightOfChar(lineIndex, 0);
    for (var i = 1, len = line.length; i < len; i++) {
      maxHeight = Math.max(this.getHeightOfChar(lineIndex, i), maxHeight);
    }

    return this.__lineHeights[lineIndex] = maxHeight * this.lineHeight * this._fontSizeMult;
  },
  _render: function(ctx) {
    if(!this.__lineHeights){
      this.initDimensions();
    }
    this._setTextStyles(ctx);
    this._renderTextLinesBackground(ctx);
    this._renderTextDecoration(ctx, 'underline');
    this._renderText(ctx);
    this._renderTextDecoration(ctx, 'overline');
    this._renderTextDecoration(ctx, 'linethrough');
  }
});

Object.assign(fabric.IText.prototype,SyncTextMixin,  {
  initialize: function(options,callback) {
    fabric.Text.prototype.initialize.call(this, options,callback);
    this.initBehavior();
  },
  /**
   * @private aded options.e._group for editing texts inside groups
   */
  mouseMoveHandler: function(options) {
    if (!this.__isMousedown || !this.isEditing) {
      return;
    }

    if(this.group){
      options.e._group = this.group;
    }
    var newSelectionStart = this.getSelectionStartFromPointer(options.e),
      currentStart = this.selectionStart,
      currentEnd = this.selectionEnd;
    if (
      (newSelectionStart !== this.__selectionStartOnMouseDown || currentStart === currentEnd)
      &&
      (currentStart === newSelectionStart || currentEnd === newSelectionStart)
    ) {
      return;
    }
    if (newSelectionStart > this.__selectionStartOnMouseDown) {
      this.selectionStart = this.__selectionStartOnMouseDown;
      this.selectionEnd = newSelectionStart;
    }
    else {
      this.selectionStart = newSelectionStart;
      this.selectionEnd = this.__selectionStartOnMouseDown;
    }
    if (this.selectionStart !== currentStart || this.selectionEnd !== currentEnd) {
      this.restartCursorIfNeeded();
      this._fireSelectionChanged();
      this._updateTextarea();
      this.renderCursorOrSelection();
    }

    if(this.group){
      delete options.e._group;
    }
  },
  // stateProperties: fabric.IText.prototype.stateProperties.concat(["styles"]),
  store_styles: function () {
    if (!Object.keys(this.styles).length) return null;
    let _styles = {};
    let _is_not_empty = false;
    for (let row in this.styles) {
      if (Object.keys(this.styles[row]).length) {
        var _row_empty = true;
        for (let char in this.styles[row]) {
          if (Object.keys(this.styles[row][char]).length) {
            if (_row_empty) {
              _styles[row] = {};
              _row_empty = false;
            }
            _styles[row][char] = fabric.util.object.clone(this.styles[row][char]);
          }
        }
        if (!_row_empty) {
          _is_not_empty = true;
        }
      }
    }
    return _is_not_empty && _styles || null;
  },
  initHiddenTextarea_native: fabric.IText.prototype.initHiddenTextarea,
  initHiddenTextarea: function () {
    this.initHiddenTextarea_native();
    this.hiddenTextarea.style.width = "9999px";
    this.hiddenTextarea.style["margin-left"] = "-9999px";
  },
  /**
   * Exits from editing state
   * @return {fabric.IText} thisArg
   * @chainable
   */
  /* exitEditing: function() {

		 var isTextChanged = (this._textBeforeEdit !== this.text);
		 this.selected = false;
		 this.isEditing = false;
		 this.selectable = true;

		 this.selectionEnd = this.selectionStart;

		 if (this.hiddenTextarea) {
			 this.hiddenTextarea.blur && this.hiddenTextarea.blur();
			 this.canvas && this.hiddenTextarea.parentNode.removeChild(this.hiddenTextarea);
			 this.hiddenTextarea = null;
		 }

		 this.abortCursorAnimation();
		 this._restoreEditingProps();
		 this._currentCursorOpacity = 0;

		 this.fire('editing:exited');
		 isTextChanged && this.fire('modified');
		 if (this.canvas) {
			 this.canvas.off('mouse:move', this.mouseMoveHandler);
			 this.canvas.fire('text:editing:exited', { target: this });
			 isTextChanged && this.canvas.fire('object:modified', { target: this });
			 // this.canvas.fireModifiedIfChanged(this);
		 }
		 return this;
	 },*/
});

Object.assign(fabric.Textbox,SyncTextMixin,{
  initialize: function(options,callback) {
    fabric.Text.prototype.initialize.call(this, options,callback);
    this.initBehavior();
  },
  getStylePosition(index){
    var loc = this.get2DCursorLocation(index);
    if (this._styleMap && !this.isWrapping) {
      var map = this._styleMap[loc.lineIndex];
      if (!map) {
        return null;
      }
      loc.lineIndex = map.line;н
      loc.charIndex = map.offset + loc.charIndex;
    }
    return loc;
  }
});

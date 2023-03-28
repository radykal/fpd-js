
//----------------------------------------------------------------------------------------------------------------------
// ListStyle

Object.assign(fabric.Textbox.prototype, {
  stateProperties: fabric.Textbox.prototype.stateProperties.concat(["listStyleType","listStyleFormat","listTextPadding","textPadding"]),
  listStyleType: "none",
  listStyleFormat: "N.",
  listTextPadding: 40,
  textPadding: 0,
  setTextPadding: function(val){
    this.textPadding = val;
    this._initDimensions();
  },
  setListStyleType: function(val){
    this.listStyleType = val;
    this.setTextPadding(val === "none" ? 0: this.listTextPadding);
  },
  /**
   * Wraps text using the 'width' property of Textbox. First this function
   * splits text on newlines, so we preserve newlines entered by the user.
   * Then it wraps each line using the width of the Textbox by calling
   * _wrapLine().
   * @param {CanvasRenderingContext2D} ctx Context to use for measurements
   * @param {String} text The string of text that is split into lines
   * @returns {Array} Array of lines
   */
  _wrapText: function(ctx, text) {
    var lines = text.split(this._reNewline), wrapped = [], i;

    this._paragraphs = {};

    for (i = 0; i < lines.length; i++) {
      this._paragraphs[wrapped.length] = this.listStyleFormat.replace("N",i + 1)
      wrapped = wrapped.concat(this._wrapLine(ctx, lines[i], i));
    }

    return wrapped;
  },


  /**
   * Wraps a line of text using the width of the Textbox and a context.
   * @param {CanvasRenderingContext2D} ctx Context to use for measurements
   * @param {String} text The string of text to split into lines
   * @param {Number} lineIndex
   * @returns {Array} Array of line(s) into which the given text is wrapped
   * to.
   * ponomarevtlt:
   * textPadding added
   */
  _wrapLine: function(ctx, text, lineIndex) {
    var lineWidth        = 0,
      lines            = [],
      line             = '',
      words            = text.split(' '),
      word             = '',
      offset           = 0,
      infix            = ' ',
      wordWidth        = 0,
      infixWidth       = 0,
      largestWordWidth = 0,
      lineJustStarted = true,
      additionalSpace = this._getWidthOfCharSpacing();



    var _textAreaWidth = this.width;
    if(this.textPadding){
      _textAreaWidth -= this.textPadding
    }
    for (var i = 0; i < words.length; i++) {
      word = words[i];
      wordWidth = this._measureText(ctx, word, lineIndex, offset);

      offset += word.length;

      lineWidth += infixWidth + wordWidth - additionalSpace;

      if (lineWidth >= _textAreaWidth && !lineJustStarted) {
        lines.push(line);
        line = '';
        lineWidth = wordWidth;
        lineJustStarted = true;
      }
      else {
        lineWidth += additionalSpace;
      }

      if (!lineJustStarted) {
        line += infix;
      }
      line += word;

      infixWidth = this._measureText(ctx, infix, lineIndex, offset);
      offset++;
      lineJustStarted = false;
      // keep track of largest word
      if (wordWidth > largestWordWidth) {
        largestWordWidth = wordWidth;
      }
    }

    i && lines.push(line);

    if (largestWordWidth > this.dynamicMinWidth) {
      this.dynamicMinWidth = largestWordWidth - additionalSpace;
    }

    return lines;
  },
  /**
   * @private
   * @param {Number} lineWidth Width of text line
   * @return {Number} Line left offset
   */
  _getLineLeftOffset: function(lineWidth) {
    if (this.textAlign === 'center') {
      return (this.width - lineWidth) / 2 + this.textPadding/2;
    }
    if (this.textAlign === 'right') {
      return this.width - lineWidth;
    }
    return this.textPadding;
  },
  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   * @param {String} method Method name ("fillText" or "strokeText")
   */
  _renderTextCommon: function(ctx, method) {

    var lineHeights = 0, left = this._getLeftOffset(), top = this._getTopOffset();

    for (var i = 0, len = this._textLines.length; i < len; i++) {
      var heightOfLine = this._getHeightOfLine(ctx, i),
        maxHeight = heightOfLine / this.lineHeight,
        lineWidth = this._getLineWidth(ctx, i),
        leftOffset = this._getLineLeftOffset(lineWidth);


      this._renderTextLine(
        method,
        ctx,
        this._textLines[i],
        left + leftOffset,
        top + lineHeights + maxHeight,
        i
      );
      lineHeights += heightOfLine;
    }
  },


  /**
   * @private
   * @param {String} method Method name ("fillText" or "strokeText")
   * @param {CanvasRenderingContext2D} ctx Context to render on
   * @param {String} line Text to render
   * @param {Number} left Left position of text
   * @param {Number} top Top position of text
   * @param {Number} lineIndex Index of a line in a text
   */
  _renderTextLine: function(method, ctx, line, left, top, lineIndex) {



    // lift the line by quarter of fontSize
    top -= this.fontSize * this._fontSizeFraction;

    switch(this.listStyleType){
      case "decimal":
        if( this._paragraphs[lineIndex]){
          // lift the line by quarter of fontSize
          this._renderChars(method, ctx, this._paragraphs[lineIndex] , left - this.textPadding , top  , lineIndex, 0);
        }
    }


    // short-circuit
    var lineWidth = this._getLineWidth(ctx, lineIndex);
    if (this.textAlign !== 'justify' || this.width < lineWidth) {

      this._renderChars(method, ctx, line, left, top, lineIndex);
      return;
    }


    // stretch the line
    var words = line.split(/\s+/),
      charOffset = 0,
      wordsWidth = this._getWidthOfWords(ctx, words.join(''), lineIndex, 0),
      widthDiff = this.width - wordsWidth - this.textPadding,
      numSpaces = words.length - 1,
      spaceWidth = numSpaces > 0 ? widthDiff / numSpaces : 0,
      leftOffset = 0, word;

    for (var i = 0, len = words.length; i < len; i++) {
      while (line[charOffset] === ' ' && charOffset < line.length) {
        charOffset++;
      }
      word = words[i];
      this._renderChars(method, ctx, word, left + leftOffset, top, lineIndex, charOffset);
      leftOffset += this._getWidthOfWords(ctx, word, lineIndex, charOffset) + spaceWidth;
      charOffset += word.length;
    }
  },
  toggleListStyleType: function(){
    this.setListStyleType(this.listStyleType == "none" ? "decimal" : "none");
    this.canvas.renderAll();
  }

})

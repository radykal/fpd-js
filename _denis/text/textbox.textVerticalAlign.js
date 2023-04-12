
Object.assign(fabric.Textbox.prototype, {
  stateProperties: fabric.Textbox.prototype.stateProperties.concat(["textVerticalAlign","maxLines", "maxWidth", "fixedWidth", "maxHeight"]),
  _dimensionAffectingProps: fabric.Textbox.prototype._dimensionAffectingProps.concat(["textVerticalAlign"]),
  maxLines: 0,
  maxWidth: 0,
  fixedWidth: false,
  maxHeight: 0,
  textVerticalAlign: "top", //"top","middle","bottom"
  setTextVerticalAlign(value){
    if (this.canvas && this.canvas.stateful) {
      this.saveState();
    }
    this.textVerticalAlign = value;

    this.fire("modified", {});
    if (this.canvas) {
      this.canvas.fire("object:modified", {target: this});
      this.canvas.renderAll();
    }
  },
  _textHeight: 0,
  /**
   * @private
   * @return {Number} Top offset
   */
  _getTopOffset: function() {
    let offset = 0;
    let h2 = -this.height / 2;
    if(!this.textVerticalAlign) {
      return h2;
    }
    offset = this.height - this._textHeight;

    switch (this.textVerticalAlign) {
      case "top":
        return h2;
      case "middle":
        return h2 + offset / 2;
      case "bottom":
        return h2 + offset;
    }
  },
  //overwritten
  getSelectionStartFromPointer: function(e) {
    var mouseOffset = this.getLocalPointer(e),
      prevWidth = 0,
      width = 0,
      height = this._getTopOffset() + this.height / 2,//overwritten
      charIndex = 0,
      lineIndex = 0,
      lineLeftOffset,
      line;

    for (var i = 0, len = this._textLines.length; i < len; i++) {
      if (height <= mouseOffset.y) {
        height += this.getHeightOfLine(i) * this.scaleY;
        lineIndex = i;
        if (i > 0) {
          charIndex += this._textLines[i - 1].length + this.missingNewlineOffset(i - 1);
        }
      }
      else {
        break;
      }
    }
    lineLeftOffset = this._getLineLeftOffset(lineIndex);
    width = lineLeftOffset * this.scaleX;
    line = this._textLines[lineIndex];
    for (var j = 0, jlen = line.length; j < jlen; j++) {
      prevWidth = width;
      width += this.__charBounds[lineIndex][j].kernedWidth * this.scaleX;
      if (width <= mouseOffset.x) {
        charIndex++;
      }
      else {
        break;
      }
    }
    return this._getNewSelectionStartFromOffset(mouseOffset, prevWidth, width, charIndex, jlen);
  },
  /**
   * Unlike superclass's version of this function, Textbox does not update
   * its width.
   * @private
   * @override
   */
  initDimensions: function () {
    if (this.__skipDimension) {
      return;
    }
    this.isEditing && this.initDelayedCursor();
    this.clearContextTop();
    this._clearCache();
    // clear dynamicMinWidth as it will be different after we re-wrap line
    this.dynamicMinWidth = 0;
    // wrap lines
    this._styleMap = this._generateStyleMap(this._splitText());
    // if after wrapping, the width is smaller than dynamicMinWidth, change the width and re-wrap
    if (this.dynamicMinWidth > this.width) {
      this._set('width', this.dynamicMinWidth);
    }
    if (this.textAlign.indexOf('justify') !== -1) {
      // once text is measured we need to make space fatter to make justified text.
      this.enlargeSpaces();
    }
    // clear cache and re-calculate height

    this._textHeight = this.calcTextHeight();

    //@edited
    if(!this.textVerticalAlign || this.height < this._textHeight){
      this.height = this._textHeight;
    }
    this.saveState({propertySet: '_dimensionAffectingProps'});
  },
  /**
   * @private
   * Divides text into lines of text and lines of graphemes.
   */
  _splitText: function() {
    let newLines = this._splitTextIntoLines(this.text);

    this.textLines = newLines.lines;
    this._textLines = newLines.graphemeLines;

    if(this.maxHeight){
      let lineHeight, height = 0;
      for (let i = 0; i < newLines.lines.length; i++) {
          lineHeight = this.getHeightOfLine(i);
          height += (i === newLines.lines.length - 1 ? lineHeight / this.lineHeight : lineHeight);
          if(height > this.maxHeight){
            newLines.lines.length = i;
            newLines.graphemeLines.length = i;
            this.textLines = newLines.lines;
            this._textLines = newLines.graphemeLines;
            break;
          }
      }
    }

    this._unwrappedTextLines = newLines._unwrappedLines;
    this._text = newLines.graphemeText;
    return newLines;
  },
  _renderTextOversize: function (ctx) {
    let lineHeight = 0;
    for (let i = 0, len = this._textLines.length; i < len; i++) {
      let lineWidth = this.measureLine(i).width;
      let lineLeftOffset = this._getLineLeftOffset(i);
      let heightOfLine = this.getHeightOfLine(i);
      if (this._longLines[i]) {
        ctx.fillRect(this._getLeftOffset() + lineLeftOffset + lineWidth + 2, this._getTopOffset() + lineHeight + heightOfLine / 2 - 1, 5, this.fontSize / 15);
      }
      lineHeight += heightOfLine;
    }
  },
  /* using for _longLines
  get2DCursorLocation: function (selectionStart, skipWrapping) {
    if (typeof selectionStart === "undefined") {
      selectionStart = this.selectionStart;
    }
    let lines = skipWrapping ? this._unwrappedTextLines : this._textLines;
    let len = lines.length;
    let i;
    for (i = 0; i < len; i++) {
      if (selectionStart <= lines[i].length) {
        return {
          lineIndex: i,
          charIndex: selectionStart
        };
      }
      if (this._longLines[i]) {
        selectionStart++;
      }
      selectionStart -= lines[i].length + 1;
    }
    if( selectionStart >= 0 ){
      return {
        lineIndex: i - 1,
        charIndex: lines[i - 1].length
      };
    }
    return {
      lineIndex: i - 1,
      charIndex: lines[i - 1].length < selectionStart ? lines[i - 1].length : selectionStart
    };
  },*/
  _renderText: function (ctx) {
    if (this.paintFirst === "stroke") {
      this._renderTextStroke(ctx);
      this._renderTextFill(ctx);
    } else {
      this._renderTextFill(ctx);
      this._renderTextStroke(ctx);
    }
    if (this.hyphenation) {
      this._renderTextOversize(ctx);
    }
  },
  _getNewSelectionStartFromOffset: function (mouseOffset, prevWidth, width, index, jlen) {
    var distanceBtwLastCharAndCursor = mouseOffset.x - prevWidth,
      distanceBtwNextCharAndCursor = width - mouseOffset.x,
      offset = distanceBtwNextCharAndCursor > distanceBtwLastCharAndCursor
      || distanceBtwNextCharAndCursor < 0 ? 0 : 1,
      newSelectionStart = index + offset;

    if (this.flipX) {
      newSelectionStart = jlen - newSelectionStart;
    }
    // the index passed into the function is padded by the amount of lines from _textLines (to account for \n)
    // we need to remove this padding, and pad it by actual lines, and / or spaces that are meant to be there
    var tmp = 0,
      removed = 0,
      _long = 0; //modified @den.ponomarev

    // account for removed characters
    for (var i = 0; i < this._textLines.length; i++) {
      tmp += this._textLines[i].length;
      if (tmp + removed >= newSelectionStart) {
        break;
      }
      //modified @den.ponomarev
      if (this._longLines[i]) {
        newSelectionStart--;
        _long++;
      }
      if (this.text[tmp + removed] === '\n' || this.text[tmp + removed] === ' ') {
        removed++;
      }
    }
    if (newSelectionStart > this.text.length) {
      newSelectionStart = this.text.length;
    }
    //modified @den.ponomarev
    return newSelectionStart - i + removed + _long;
    //return newSelectionStart + _long;
  },
  _wrapText: function(lines, desiredWidth) {
    let wrapped = [], i;
    this.isWrapping = true;
    this._longLines = []; //added @ponomarevtlt
    for (i = 0; i < lines.length; i++) {
      wrapped = wrapped.concat(this._wrapLine(lines[i], i, desiredWidth));
    }
    this.isWrapping = false;
    return wrapped;
  },
  _wrapLine: function (_line, lineIndex, desiredWidth) {

    let lineWidth = 0,
      graphemeLines = [],
      line = [],
      words = _line.split(this._reSpaceAndTab),
      word = "",
      offset = 0,
      infix = " ",
      wordWidth = 0,
      infixWidth = 0,
      largestWordWidth = 0,
      lineJustStarted = true,
      additionalSpace = this._getWidthOfCharSpacing();


    //todo desiredWidth
    let _maxWidth = this.maxWidth || this.fixedWidth && this.width;
    let isLongWord = false;
    let i;
    for (i = 0; i < words.length; i++) {
      word = fabric.util.string.graphemeSplit(words[i]);
      wordWidth = this._measureWord(word, lineIndex, offset);

      if (!this.breakWords) {
        let _isLong = _maxWidth && wordWidth > _maxWidth;

        if (_isLong) {
          if (line.length !== 0) {
            graphemeLines.push(line);
            this._longLines.push(isLongWord);
            isLongWord = false;
            lineWidth = 0;
            line = [];
          }

          let _hypheSize = 0;
          let _bigWordWidth = 0;// lineWidth + infixWidth;
          let k = 0, len = word.length;
          while (k < len && _bigWordWidth <= _maxWidth - _hypheSize) {
            _bigWordWidth += this._measureWord(word[k], lineIndex, k + offset);
            _hypheSize = this._measureWord("-", lineIndex, k + offset);
            k++
          }
          let new_word = word.splice(0, k - 1);
          isLongWord = true;
          words.splice(i, 1, new_word.join(""), word.join(""));
          i--;
          lineJustStarted = true;
          continue;
        }
      }
      lineWidth += infixWidth + wordWidth - additionalSpace;

      if (lineWidth >= this.width) {

        if (this.breakWords) {
          lineWidth -= wordWidth;
          line.push(infix);
          let wordLetters = word.splice(0);

          while (wordLetters.length) {
            if (lineWidth + letterWidth > this.width) {
              graphemeLines.push(line);
              this._longLines.push(true);
              line = [];
              lineWidth = 0;
            }
            line.push(wordLetters.shift());
            offset++;
            lineWidth += letterWidth;
          }
        } else if (!lineJustStarted) {
          graphemeLines.push(line);
          this._longLines.push(isLongWord);
          isLongWord = false;
          line = [];
          lineWidth = wordWidth;
          lineJustStarted = true;
        }
      }
      else {
        lineWidth += additionalSpace;
      }
      offset += word.length;

      if (!lineJustStarted) {
        line.push(infix);
      }
      line = line.concat(word);

      infixWidth = this._measureWord(infix, lineIndex, offset);
      offset++;

      // keep track of largest word
      if (wordWidth > largestWordWidth) {
        largestWordWidth = wordWidth;
      }
      lineJustStarted = false;
    }

    i && graphemeLines.push(line);
    this._longLines.push(false);

    if (this.breakWords) {
      this.dynamicMinWidth = 0;
    } else if (largestWordWidth > this.dynamicMinWidth) {
      this.dynamicMinWidth = largestWordWidth - additionalSpace;
    }
    return graphemeLines;
  },
  // _splitTextIntoLines: function(text) {
  //   let newLines = fabric.Text.prototype._splitTextIntoLines.call(this, text);
  //   // this.textLines = newLines.lines;
  //
  //   let ___textLines = this._textLines;
  //
  //   // this._textLines = newLines.graphemeLines;
  //   // this._unwrappedTextLines =. newLines._unwrappedLines;
  //   // this._text = newLines.graphemeText;
  //
  //   let graphemeLines = this._wrapText(newLines.lines, this.width);
  //   let lines = new Array(graphemeLines.length);
  //
  //   this._textLines = [];
  //   let lineHeight, height = 0;
  //   for (let i = 0; i < graphemeLines.length; i++) {
  //     this._textLines[i] = lines[i] = graphemeLines[i].join('');
  //
  //     if(this.maxHeight){
  //       lineHeight = this.getHeightOfLine(i);
  //       height += (i === lines.length - 1 ? lineHeight / this.lineHeight : lineHeight);
  //
  //       if(height > this.maxHeight){
  //         graphemeLines.length = i;
  //         lines.length = i;
  //         break;
  //       }
  //     }
  //   }
  //
  //   newLines.lines = lines;
  //   newLines.graphemeLines = this._textLines;
  //
  //   this._textLines = ___textLines;
  //   return newLines;
  // },
   /**
   * @private
   */
  _getSVGLeftTopOffsets: function() {
    return {
      textLeft: -this.width / 2,
      textTop: this._getTopOffset(),//edited
      lineTop: this.getHeightOfLine(0)
    };
  }
});

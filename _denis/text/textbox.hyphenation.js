
Object.assign(fabric.Textbox.prototype, {
  hyphenation: false,
  _longLines: [],
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
});



Object.assign(fabric.Textbox.prototype, {
    stateProperties: fabric.Textbox.prototype.stateProperties.concat(["maxLines", "maxWidth", "fixedWidth", "maxHeight"]),
    maxLines: 0,
    maxWidth: 0,
    fixedWidth: false,
    maxHeight: 0,
    _longLines: [],
    _splitTextIntoLines: function(text) {
      let newLines = fabric.Text.prototype._splitTextIntoLines.call(this, text);
      // this.textLines = newLines.lines;

      let ___textLines = this._textLines;

      // this._textLines = newLines.graphemeLines;
      // this._unwrappedTextLines =. newLines._unwrappedLines;
      // this._text = newLines.graphemeText;

      let graphemeLines = this._wrapText(newLines.lines, this.width);
      let lines = new Array(graphemeLines.length);

      this._textLines = [];
      let lineHeight, height = 0;
      for (let i = 0; i < graphemeLines.length; i++) {
        this._textLines[i] = lines[i] = graphemeLines[i].join('');

          if(this.maxHeight){
              lineHeight = this.getHeightOfLine(i);
              height += (i === lines.length - 1 ? lineHeight / this.lineHeight : lineHeight);

              if(height > this.maxHeight){
                  graphemeLines.length = i;
                  lines.length = i;
                  break;
              }
          }
      }

      newLines.lines = lines;
      newLines.graphemeLines = this._textLines;

      this._textLines = ___textLines;
      return newLines;
    },

    /**
     * do not alow to select hiden text
     * convert from textarea to grapheme indexes
     */
    // fromStringToGraphemeSelection: function(start, end, text) {
    //     // if(start > this._text.length ){
    //     //     start = this._text.length;
    //     //     this.hiddenTextarea.selectionStart = start ;
    //     // }
    //     // if(end > this._text.length ){
    //     //     end = this._text.length;
    //     //     this.hiddenTextarea.selectionEnd = end ;
    //     // }
    //     var smallerTextStart = text.slice(0, start),
    //         graphemeStart = fabric.util.string.graphemeSplit(smallerTextStart).length;
    //
    //     if (start === end) {
    //         return { selectionStart: graphemeStart, selectionEnd: graphemeStart };
    //     }
    //     var smallerTextEnd = text.slice(start, end),
    //         graphemeEnd = fabric.util.string.graphemeSplit(smallerTextEnd).length;
    //     return { selectionStart: graphemeStart, selectionEnd: graphemeStart + graphemeEnd };
    // },
    /**
     * @private
     * Divides text into lines of text and lines of graphemes.
     */
    // _splitText: function() {
    //     var newLines = this._splitTextIntoLines(this.text);
    //     var newLines = this._splitTextIntoLines(this.text);
    //     this.textLines = newLines.lines;
    //     this._textLines = newLines.graphemeLines;
    //
    //     if(this.maxHeight){
    //         var lineHeight, height = 0;
    //         for (var i = 0, len = this._textLines.length; i < len; i++) {
    //             lineHeight = this.getHeightOfLine(i);
    //             height += (i === len - 1 ? lineHeight / this.lineHeight : lineHeight);
    //             if(height > this.maxHeight){
    //                 this._textLines.length = i;
    //                 this.textLines.length = i;
    //                 break;
    //             }
    //         }
    //     }
    //
    //
    //     this._unwrappedTextLines = newLines._unwrappedLines;
    //
    //     this._text = newLines.graphemeText;
    //     return newLines;
    // },
    // /**
    //  * Handles onInput event
    //  * @param {Event} e Event object
    //  */
    // onInput: function(e) {
    //     var fromPaste = this.fromPaste;
    //     this.fromPaste = false;
    //     e && e.stopPropagation();
    //     if (!this.isEditing) {
    //         return;
    //     }
    //     // decisions about style changes.
    //     var nextText = this._splitTextIntoLines(this.hiddenTextarea.value).graphemeText,
    //         charCount = this._text.length,
    //         nextCharCount = nextText.length,
    //         removedText, insertedText,
    //         charDiff = nextCharCount - charCount;
    //     if (this.hiddenTextarea.value === '') {
    //         this.styles = { };
    //         this.updateFromTextArea();
    //         this.fire('changed');
    //         if (this.canvas) {
    //             this.canvas.fire('text:changed', { target: this });
    //             this.canvas.requestRenderAll();
    //         }
    //         return;
    //     }
    //
    //     var textareaSelection = this.fromStringToGraphemeSelection(
    //         this.hiddenTextarea.selectionStart,
    //         this.hiddenTextarea.selectionEnd,
    //         this.hiddenTextarea.value
    //     );
    //     var backDelete = this.selectionStart > textareaSelection.selectionStart;
    //
    //     if (this.selectionStart !== this.selectionEnd) {
    //         removedText = this._text.slice(this.selectionStart, this.selectionEnd);
    //         charDiff += this.selectionEnd - this.selectionStart;
    //     }
    //     else if (nextCharCount < charCount) {
    //         if (backDelete) {
    //             removedText = this._text.slice(this.selectionEnd + charDiff, this.selectionEnd);
    //         }
    //         else {
    //             removedText = this._text.slice(this.selectionStart, this.selectionStart - charDiff);
    //         }
    //     }
    //     insertedText = nextText.slice(textareaSelection.selectionEnd - charDiff, textareaSelection.selectionEnd);
    //     if (removedText && removedText.length) {
    //         if (this.selectionStart !== this.selectionEnd) {
    //             this.removeStyleFromTo(this.selectionStart, this.selectionEnd);
    //         }
    //         else if (backDelete) {
    //             // detect differencies between forwardDelete and backDelete
    //             this.removeStyleFromTo(this.selectionEnd - removedText.length, this.selectionEnd);
    //         }
    //         else {
    //             this.removeStyleFromTo(this.selectionEnd, this.selectionEnd + removedText.length);
    //         }
    //     }
    //     if (insertedText.length) {
    //         if (fromPaste && insertedText.join('') === fabric.copiedText) {
    //             this.insertNewStyleBlock(insertedText, this.selectionStart, fabric.copiedTextStyle);
    //         }
    //         else {
    //             this.insertNewStyleBlock(insertedText, this.selectionStart);
    //         }
    //     }
    //
    //     this.updateFromTextArea();
    //     //
    //     // if(this.maxHeight){
    //     //     while(this.height > this.maxHeight){
    //     //         this.height -= this.__lineHeights[--this._textLines.length];
    //     //     }
    //     // }
    //     this.fire('changed');
    //
    //     if (this.canvas) {
    //         this.canvas.fire('text:changed', { target: this });
    //         this.canvas.requestRenderAll();
    //     }
    // },


});

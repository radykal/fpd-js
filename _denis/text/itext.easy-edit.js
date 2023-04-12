
export default {
  name: "easy-edit",
  prototypes: {
    IText: {
      stateProperties: fabric.IText.prototype.stateProperties.concat(["easyEdit"]),

      /**
       * Default event handler for the basic functionalities needed on _mouseDown
       * can be overridden to do something different.
       * Scope of this implementation is: find the click position, set selectionStart
       * find selectionEnd, initialize the drawing of either cursor or selection area
       */
      _mouseDownHandler: function (options) {
        if (!this.canvas || !this.editable || (options.e.button && options.e.button !== 1)) {
          return;
        }

        this.__isMousedown = true;

        if (!this.selected && this.easyEdit) {
          this.enterEditing();
        }
        if (this.selected || this.easyEdit) {
          this.setCursorByClick(options.e);
        }

        if (this.isEditing || this.easyEdit) {
          this.__selectionStartOnMouseDown = this.selectionStart;
          if (this.selectionStart === this.selectionEnd) {
            this.abortCursorAnimation();
          }
          this.renderCursorOrSelection();
        }
      },
      easyEdit: false,
      setEasyEdit: function (val) {
        this.easyEdit = val;
        if (val) {
          this.hoverCursor = "text"
          this._enterEditing = this.enterEditing.bind(this);
          this.on('selected', this._enterEditing);
        } else {
          this.hoverCursor = "move"
          this.off('selected', this._enterEditing);
          delete this._enterEditing;
        }
      }
    }
  }
}



fabric.util.object.extend(fabric.IText.prototype, {

  /**
   * For functionalities on keyUp + ctrl || cmd
   */
  ctrlKeysMapUp: {
    67: 'copy',
    88: 'cut',
    90: 'disableUndo'
  },

  /**
   * For functionalities on keyDown + ctrl || cmd
   */
  ctrlKeysMapDown: {
    65: 'selectAll',
    90: 'disableUndo'
  },
  eventListeners: fabric.util.merge(fabric.IText.prototype.eventListeners, {
    'editing:entered': function() {
      this.saveState(["text"]);
    },
    // 'changed': function(){
    //
    //   this.fire("modified", {});
    //   if (this.canvas) {
    //     this.canvas.fire("object:modified", {target: this});
    //     this.canvas.renderAll();
    //   }
    // }
    // this.on("changed",this.updateHistory.bind(this))
  }),
  // updateHistory() {
  //   const difference = this._getDifference(this.originalState.text, this.text);
  //   // console.log('TCL: difference', difference);
  //   const lastVersionIndex = this.history.count();
  //   if ((difference.length === 1 && /\W/.test(difference)) || difference.length > 1 || lastVersionIndex === 0) {
  //     console.log("Saving latest history version...");
  //
  //     this.fire('modified');
  //     if (this.canvas) {
  //       this.canvas.fire('object:modified', { target: this });
  //     }
  //   } else {
  //     // update last history version
  //     //todo
  //     this.history.stack[lastVersionIndex] = this.text;
  //   }
  //   this.originalState.text = this.text;
  // },
  disableUndo(e) {
      e.preventDefault();
  }
});

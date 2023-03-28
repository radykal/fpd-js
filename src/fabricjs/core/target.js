export const FmTarget = {
  name: "target",
  prototypes: {
    Object: {
      _editor(){
        return this.editor || this.canvas.editor || this.canvas;
      },
    },
    Canvas: {
      _editor(){
        return this.editor || fabric.util;
      },
      handleTargetEvent() {
        let app = this._editor()
        let deselectedTarget = app.__deselected, selectedTarget = app.__selected;
        if (!deselectedTarget && !selectedTarget) return;
        delete app.__deselected;
        delete app.__selected;
        app.target = selectedTarget;
        let deselectedTargets =deselectedTarget ? deselectedTarget.constructor === Array ? deselectedTarget: [deselectedTarget] : null;
        this.fire('target:changed', {selected: selectedTarget, deselected: deselectedTargets});
        app.fire('target:changed', {selected: selectedTarget, deselected: deselectedTargets});
      },
      eventListeners:{
        'object:modified': function targetModifed(e) {
          let app = this._editor()
          if (app.target === e.target) {
            this.fire('target:modified', {target: e.target, canvas: this})
            app.fire('target:modified', {target: e.target, canvas: this})
          }
        },
        'mouse:down': function mouseDownTargetEventHandler() {
          // 'mouse:down:before': function mouseDownTargetEventHandler() {  //todo bug with image cropping
          this.handleTargetEvent();
        },
        // 'mouse:down': function mouseDownTargetEventHandler() {
        //   let app = this.application || this;
        //   this.handleTargetEvent();
        // },
        'canvas:cleared': function canvasCleared() {
          let app = this._editor()
          app.__deselected = this.getActiveObjects();
          this.handleTargetEvent();
        },
        'selection:cleared': function targetClear(event) {
          let app = this._editor()
          app.__deselected = event.deselected || event.target;
          if (!event.e) {
            this.handleTargetEvent();
          }
        },
        'selection:created selection:updated': function targetChanged(event) {
          let app = this._editor()
          app.__selected = event.target;
          if (event.deselected) app.__deselected = event.deselected;
          if (!event.e) {
            this.handleTargetEvent();
          }
        },
        'group:selected': function targetChanged(event) {
          let app = this._editor()
          app.__selected = event.selected;
          app.__deselected = event.deselected;
          if (!event.e) {
            this.handleTargetEvent();
          }
        }
      }
    }
  }
}

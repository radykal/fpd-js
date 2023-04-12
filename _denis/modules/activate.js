/**
 *
 */
Object.assign(fabric.Object.prototype, {
  inactiveOptions: null,
  activeOptions: null,
  eventListeners: fabric.util.merge(fabric.Object.prototype.eventListeners, {
    added: function () {
      if(this.active){
        this.activeOptions && this.set(this.activeOptions);
      }else{
        this.inactiveOptions && this.set(this.inactiveOptions);
      }
    },
    deselected: function () {
      this.inactiveOptions && this.set(this.inactiveOptions);
    },
    selected: function () {
      this.activeOptions && this.set(this.activeOptions);
    }
  })
});


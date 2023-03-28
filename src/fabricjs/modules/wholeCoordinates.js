
Object.assign(fabric.Object.prototype, {
  setWholeCoordinates: function(val){
    this.wholeCoordinates = val;
    this.on("added modified",function(){
      if(this.wholeCoordinates){
        this.set({
          left: Math.round(this.left),
          top: Math.round(this.top),
          width: Math.round(this.width),
          height: Math.round(this.height)
        })
      }
    },true)
  }
// setTop: function(val){
//   if(this.wholeCoordinates){
//     val = Math.round(val);
//   }
//   this.top = val;
// },
// setLeft: function(val){
//   if(this.wholeCoordinates){
//     val = Math.round(val);
//   }
//   this.left = val;
// },
// setWidth: function(w){
//   if(this.wholeCoordinates){
//     w = Math.round(w);
//   }
//   this.width = w;
// },
// setHeight: function(h){
//   if(this.wholeCoordinates){
//     h = Math.round(h);
//   }
//   this.height = h;
// }
});

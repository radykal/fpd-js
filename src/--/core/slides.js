Object.assign(fabric.Editor.prototype, {
  /**
   * move slide to another position
   * @param slide
   * @param newPosition
   */
  moveSlide: function (slide,newPosition) {
    var _s = this.slides;

    var _curPos = _s.indexOf(slide);
    newPosition = parseInt(newPosition);

    if (_curPos < newPosition) {
      _s.splice(_curPos, 1);
      _s.splice(newPosition,0, slide);
    } else {
      _s.splice(_curPos, 1);
      _s.splice(newPosition, 0, slide);
    }
  },
  /**
   * replace slide
   * @param slide
   * @param newPosition - position of the second slide
   */
  replaceSlide: function (slide,newPosition) {
    var _s = this.slides;
    var _replacedSlide = _s[newPosition];
    var _curPos = _s.indexOf(slide);
    if (_curPos < newPosition) {
      _s.splice(newPosition, 1, slide);
      _s.splice(_curPos, 1, _replacedSlide);
    } else {
      _s.splice(_curPos, 1, _replacedSlide);
      _s.splice(newPosition, 1, slide);
    }
  },
  setActiveSlideByIndex: function(index){
    this.setActiveSlide(this.slides[index])
  },
  setActiveSlideById: function(id){
    this.setActiveSlide(  this.slides.find(slide => slide.id === id))
  },
  duplicateSlide: function (slideData) {
    slideData = slideData.toObject();
    var _slide = this.addSlide(slideData);
    _slide.load(_slide.object);
  },
  nextSlide: function () {
    var i = this.slides.indexOf(this.activeSlide);
    if (i < this.slides.length - 1) {
      this.setActiveSlide(i + 1);
    }
  },
  prevSlide: function () {
    var i = this.slides.indexOf(this.activeSlide);
    if (i > 0) {
      this.setActiveSlide(i - 1);
    }
  },
  gotoSlide: function (slide) {
    this.setActiveSlide(slide);
  },
  nextSlideAvailable: function () {
    var i = this.slides.indexOf(this.activeSlide);
    return i < this.slides.length - 1
  },
  prevSlideAvailable: function () {
    var i = this.slides.indexOf(this.activeSlide);
    return i > 0
  },
  updateThumbs: function(){
    this.slides.forEach(slide => {
      slide.canvas.setDimensions({width: this.canvas.width, height: this.canvas.height})
    })
  }
});

Object.assign(fabric.Canvas.prototype, {
  title: "New Slide",
  unique: false,
  required: false,
  // stateProperties: ["unique","required"],
  removeSlide: function(){
    this.editor.removeSlide(this)
  },
  duplicateSlide: function(){
    this.editor.duplicateSlide(this)
  }
  // eventListeners: fabric.util.merge(fabric.Canvas.prototype.eventListeners, {
  //   "modified" : function(e){
  //     if(this.canvas){
  //       this.canvas.canvas.set(e.states.modified);
  //       this.canvas.fire("modified");
  //     }
  //   },
  //   "object:modified" : function(){
  //     if(this.canvas){
  //       this.canvas.fire("modified");
  //     }
  //   }
  // })
});

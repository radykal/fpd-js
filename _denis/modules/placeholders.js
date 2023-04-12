import MagicWand from './../../plugins/magicwand.js'

fabric.util.object.extend(fabric.Canvas.prototype, {
  layers: fabric.util.object.extend(fabric.Canvas.prototype.layers,{
    placeholders: {
      export: false,
      objects: true
    }
  }),
  eventListeners: fabric.util.merge(fabric.Canvas.prototype.eventListeners, {
    //Photo Collage  for Overlay images
    "overlay-image:changed": function() {
      if(this.placeholders){
        this.removePlaceholders();
      }
    },
    "overlay-image:loaded": function() {
      if(this.placeholders){
        let element = new Image();
        element.onload = function(){
          this.createPlaceholders(element);
        }.bind(this);
        element.crossOrigin = "Anonymous";
        element.src = this.overlayImage._element.src;
      }
    }
  }),
  placeholders: false,
  placeholderMinSize: 250,
  // placeholderMinAlpha: 200,
  placeholderMaxAlpha: 200,
  removePlaceholders: function(element){
    if(this.layers.placeholders){
      this.layers.placeholders.objects.length = 0;
    }
  },
  createPlaceholders: function(element){

    if(!element){
      element = this.overlayImage._element;
    }

    //possible to use "before:drop" event
    let xCanvas, xContext, xImgData, mask, contours, width = this.originalWidth, height = this.originalHeight;

    //detect all transparent zones on the overlay image using Fuzzy Selection Tool
    xCanvas = fabric.util.createCanvasElement(width, height);
    xContext = xCanvas.getContext("2d");
    xContext.drawImage(element, 0, 0, width, height);
    xImgData = xContext.getImageData(0, 0, xCanvas.width, xCanvas.height);
    // console.log(xImgData.data[0]);
    mask = MagicWand.selectColored(xImgData, {aMax: this.placeholderMaxAlpha});
    // mask.debug();
    //exclude little transparent areas (it is decorative elements, not photo frames)

    // let invertedMask = MagicWand.invertMask(mask);

    contours = MagicWand.traceContours(mask).filter((contour )=> {
      return (contour.points.length > this.placeholderMinSize)
    });
    // Undo/redo are not applicable
    this.processing = true;//todo processingPropertiees?
    this.photoFrames = [];
    this.activePhotoFrame = 0;

    let number = 1;
    //create invisible placeholder for photos
    contours.forEach((contour)=>{
      let photoFrame = this.createObject({type: "PhotoPlaceholder"});
      photoFrame.set({
        left: contour.bounds.minX - 2,
        top: contour.bounds.minY - 2,
        width: contour.bounds.maxX - contour.bounds.minX+4,
        height: contour.bounds.maxY - contour.bounds.minY + 4 ,
        text: number
      });
      // this.add(photoFrame);
      photoFrame.setCoords();

      number++;

      this.photoFrames.push(photoFrame);
    });
    this.processing = false;//todo processingPropertiees?
  },
  getPhotoPlaceholder: function (data) {
    var size = fabric.util.getProportions(data, {width: this.originalWidth, height: this.originalHeight});
    if (this.photoFrames && this.photoFrames.length && this.activePhotoFrame < this.photoFrames.length) {
      var frame = this.photoFrames[this.activePhotoFrame];

      this.activePhotoFrame++;
      if (this.activePhotoFrame === this.photoFrames.length) {
        this.activePhotoFrame = 0;
      }
      return {
        left: frame.left,
        top: frame.top,
        width: frame.width,
        height: frame.height
      };
    }

    return {
      width: size.width,
      height: size.height
    }
  },
});


fabric.PhotoPlaceholder = fabric.util.createClass(fabric.Group, {
  selectable: false,
  stored: false,
  hoverCursor: "defaultCursor",
  controls: false,
  permanent: true,
  layer: "placeholders",
  accepts: {
    type: "image"
  },
  setText: function(text){
    this._objects[0].setText(text);
    this.dirty = true;
  },
  setData: function (data) {
    this.canvas.setData(fabric.util.object.extend(data, {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height
    }))
  }
});

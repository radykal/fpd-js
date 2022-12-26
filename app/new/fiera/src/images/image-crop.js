import {getGroupCoords} from '../util/matrix.js'
import {FmCLipPath} from "../objects/object.clippath.js";
import {FmControls} from "../canvas/controls.js";
import {FmTransformations} from "../modules/transformations.js"
import {FmTarget} from "../core/target.js";
import {FmImage} from "../core/image.ext.js";
//todo fromURL dep
//todo base.js dep

//todo cant disable image-crop module
export const FmCrop = {
  name: "crop",
  deps: [ FmImage, FmCLipPath, FmTransformations, FmTarget, FmControls ],
  versions: {
    "3.X": {
      prototypes: {

      }
    },
    "4.X": {
      prototypes: {

      }
    }
  },
  prototypes: {
    Crop: {
      opacity:  0.25,
      drawControlsInterface(ctx){
        var wh = this._calculateCurrentDimensions(),
            strokeWidth = 1 / this.borderScaleFactor,
            width = wh.x + strokeWidth,
            height = wh.y + strokeWidth;

        ctx.restore();
        ctx.save();
        ctx.scale(this.canvas.viewportTransform[0],this.canvas.viewportTransform[3])
        ctx.globalAlpha = this.opacity;
        let m = this.calcOwnMatrix();
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        let el = this.parent._element
        ctx.drawImage(el, 0,0, el.width, el.height, -this.width / 2, -this.height / 2, this.width, this.height);
      },
      cropEnd(){
        this.parent.cropPhotoEnd()
      },
      useSuperClassStoreProperties: false,
      prototype: "object",
      type: "crop",
      stateProperties: [],
      storeProperties: ["top","left","skewX","skewY","scaleX","scaleY","angle"],
      eventListeners: {
        // "mousewheel": function (e){
        //   this.parent.__modifiedBy = "wheel";
        //   if (e.e.deltaY < 0) {
        //     this.parent.cropZoomIn();
        //   } else {
        //     this.parent.cropZoomOut();
        //   }
        //   e.e.stopPropagation();
        //   e.e.preventDefault();
        //   delete this.parent.__modifiedBy;
        // },
      },
      actions: {
        cropZoom: {
          type: "range",
          className: "fa fa-search-plus ",
          title: "@image.cropZoom",
          observe: "parent.crop:modified",
          get: function () {
            return this.target.parent.getZoom();
          },
          set: function (val) {
            return this.target.parent.setZoom(val);
          },
          min: 0,
          max: 1,
          step: 0.01
        },
        cropZoomIn: {
          className: "fa fa-search-plus ",
          title: "@image.cropZoomIn",
          action() {
            this.target.parent.cropZoomIn();
          }
        },
        cropZoomOut: {
          className: "fa fa-search-minus",
          title: "@image.cropZoomOut",
          action() {
            this.target.parent.cropZoomOut();
          }
        },
        cropEnd: {
          className: "fa fa-crop fbs fb-check",
          title: "crop End"
        }
      },
      minWidth: 1,
      minHeight: 1,
      // cornerSize:  20,
      cornerStyle:  "circle",
      originX: "center",
      originY: "center",
      movementLimitMode: "content",
      snappable: false,
      stored: false,
      left: 0,
      top: 0
    },
    Image:  {
      "+cacheProperties": ["inCropMode"],
      "+storeProperties": ["crop"],
      "+stateProperties": [],
      eventListeners: {
        // "mousedblclick": "cropPhotoStart"
      },
      "+afterRender": "renderCropPhoto",//fabric.Object.prototype.afterRender.slice().concat(["renderCropPhoto"]),
      // afterRender: fabric.Object.prototype.afterRender.slice().concat(["renderCropPhoto"]),
      inCropMode: false,
      cropPhotoStart: function(){
        if(!this._element){
          return;
        }
        this.saveStates(["crop"]);
        this.canvas.stateful = false;

        this.canvas.fire("before:crop",{target: this });

        if(!this._cropEl){
          this.setCrop({})
        }

        this.activeCrop = fabric.util.createObject({
          editor: this.editor,
          type: "crop",
          movementLimits: this,// todo Bugged on Nymbl!
          width: this._cropEl.width,
          height: this._cropEl.height,
        });
        // let _crop = this._cropEl.getState();

        this.activeCrop.set({
          angle:  this._cropEl.angle,
          left:   this._cropEl.left,
          scaleX: this._cropEl.scaleX,
          scaleY: this._cropEl.scaleY,
          skewX:  this._cropEl.skewX,
          top:    this._cropEl.top
        });
        this.activeCrop.group = this;
        this.activeCrop.canvas = this.canvas;
        this.activeCrop.parent = this;

        this.setMovementLimits(this.activeCrop)


        // this.activeCrop.on("rotating moving scaling skewing modified" , function ()  {
        //   this.parent.__modifiedBy = "controls";
        //   this.parent.dirty = true;
        //   let options = getGroupCoords(this,this.parent);
        //   let center = new fabric.Point(options.translateX, options.translateY);
        //   options.left = center.x;
        //   options.top = center.y;
        //   this.parent.setCrop(options);
        //   delete this.parent.__modifiedBy;
        // })

        this.on("activeCrop.rotating activeCrop.moving activeCrop.scaling activeCrop.skewing rotating moving scaling skewing" ,"__updateCrop")

        this._restoreObjectState(this.activeCrop);

        this.__cornerStyle = this.cornerStyle
        this.__hasRotatingPoint = this.hasRotatingPoint
        this.set({
          selectable: false,
          hasControls: false,
          cornerStyle: "frame",
          hasRotatingPoint: false
        })
        this.canvas.setActiveObject(this.activeCrop);
        this.__cropPhotoEnd_binded = this.cropPhotoEnd.bind(this);
        this.active = true;
        let app = this._editor()
        app.on("target:changed", this.__cropPhotoEnd_binded);
        this._set("inCropMode",true);
      },
      __updateCrop(){
        this.__modifiedBy = "controls";
        this.dirty = true;
        let options = getGroupCoords(this.activeCrop,this);
        let center = new fabric.Point(options.translateX, options.translateY);
        options.left = center.x;
        options.top = center.y;
        this.setCrop(options);
        delete this.__modifiedBy;
      },
      cropPhotoEnd: function(){
        let app = this._editor()
        if(this.canvas._activeObject === this || this.canvas._activeObject === this.activeCrop){
          this.activeCrop.active = true;
          this.active = true;
          return
        }
        else{
          this.activeCrop.active = false;
          this.active = false;
        }
        this.off("activeCrop.rotating activeCrop.moving activeCrop.scaling activeCrop.skewing rotating moving scaling skewing" ,"__updateCrop")
        this.set({
          selectable: true,
          hasControls: true,
          cornerStyle: this.__cornerStyle,
          hasRotatingPoint: this.__hasRotatingPoint
        })

        this.set({
          movementLimits: null
        })
        // this.inCropMode = false;
        app.off("target:changed", this.__cropPhotoEnd_binded);
        delete this.__cropPhotoEnd_binded;
        this.canvas.remove(this.activeCrop);
        delete this.activeCrop;
        this._set("inCropMode",false)
        this.canvas.stateful = true;
        // this.canvas && this.canvas.fire('object:modified', {target: this});
        // this.fire('modified');

        this.updateState()
        // this.dirty = true;
        // this.canvas && this.canvas.renderAll();
      },
      applyClipPath(clipPath){
        this.canvas.remove(clipPath);

        let shapeObjects;
        if(clipPath.type === "activeSelection") {
          clipPath = clipPath._groupElements();
          shapeObjects = clipPath.getState().objects;
        }else{
          shapeObjects = [clipPath.getState()];
        }

        let size = this._getPhotoSize(clipPath, this._element);
        this.set({
          width: size.width ,
          height: size.height,
          scaleX: this.width * this.scaleX / size.width,
          scaleY: this.height * this.scaleY / size.height,
        });

        let options = getGroupCoords(this,clipPath);
        let center = new fabric.Point(options.translateX, options.translateY);
        options.left = center.x;
        options.top = center.y;

        this.set({
          left: clipPath.left,
          top: clipPath.top,
          scaleX: 1,
          scaleY: 1,
          width: clipPath.width,
          height: clipPath.height,
          clipPath: {objects: shapeObjects}
        });

        this.setCrop(options);
        this.canvas.renderAll();
      },
    },
    ActiveSelection:  {
      hasImage(){
        for(let i = this._objects.length;i--; ){
          let object = this._objects[i];
          if(object.type === "image"){
            return object;
          }
        }
        return false;
      },
      applyMask(){
        let image = this.hasImage();
        if(image){
          this.removeWithUpdate(image);
          image.applyClipPath(this);
          this.canvas.setActiveObject(image);
        }else{
          this.canvas.startMasking(this);
        }
      },
    },
    Object: {
      "+actions": {
        applyMask: {
          title: "apply mask",
          className: "fas fa-bookmark"
        }
      },
      applyMask(){
        this.canvas.startMasking(this);
      }
    },
    /**
     * and here is 5 Canvas functions
     *  canvas.startMasking()    grouping selected objects and activate "masking" mode. In this mode user can select a target object . Grouped objects will be applied to it as a mask
     *  canvas.cancelMasking()   if masking mode is active
     *  canvas.startCrop()       ungroup active MaskGroup and enable "cropping" mode. user can move/resize photo. user can click on another object or empty space to finish cropping
     *  canvas.endCrop()         finish cropping with a button
     *  canvas.ungroupMasking()  ungroup active MaskGroup object.
     */
    Canvas: {
      maskingOpacity: 0.5,
      startMasking(object){
        if(!object){
          object = this._activeObject;
        }
        this.fire("mode:changed",{mode : "masking", before: this.mode});
        this.mode = "masking";

        if(object.type === "activeSelection") {
          for(let sub_object of object._objects){
            sub_object.set({
              evented: false,
              opacity: sub_object.opacity * this.maskingOpacity
            });
          }
        }
        object.set({
          opacity: object.opacity * this.maskingOpacity,
          evented: false,
          hasControls: false,
          __hasControls: object.hasControls
        });

        this.renderAll();

        this.__maskObjectGroup = object;
        let app = this._editor()
        this._endMaskingBinded = this._endMasking.bind(this);
        app.on("target:changed",this._endMaskingBinded);
      },
      ungroupMasking(){
        let obj = this._activeObject;
        let activeSelection = obj.toActiveSelection();
        this._discardActiveObject()
      },
      _endMasking(e){
        let app = this._editor()
        app.off("target:changed",this._endMaskingBinded);
        delete this._endMaskingBinded;

        this.fire("mode:changed",{mode : "normal", before: this.mode});
        this.mode = "normal";

        let maskObject = this.__maskObjectGroup;

        if(maskObject.type === "activeSelection") {
          for(let sub_object of maskObject._objects){
            sub_object.set({
              evented: true,
              opacity: sub_object.opacity * (1 / this.maskingOpacity)
            });
          }
        }
        maskObject.set({
          opacity: maskObject.opacity * (1 / this.maskingOpacity),
          hasControls: maskObject.hasControls,
          evented: true
        });
        delete maskObject.__hasControls;

        let photo = e.selected;
        let frame = this.createFrame(maskObject,photo);
        this.setActiveObject(frame);
        delete this.__maskObjectGroup;
      },
      cancelMasking(){
        let app = this._editor()
        app.off("target:changed",this._endMasking);
        this.fire("mode:changed",{mode : "normal", before: this.mode});
        this.mode = "normal";

        this.discardActiveObject();
        delete this.__maskObjectGroup;
      }
    }
  }
}
import {toGroupCoords} from './../util/util.js'

/**
 * and here is 5 Canvas functions
 *  canvas.startMasking()    grouping selected objects and activate "masking" mode. In this mode user can select a target object . Grouped objects will be applied to it as a mask
 *  canvas.cancelMasking()   if masking mode is active
 *  canvas.startCrop()       ungroup active MaskGroup and enable "cropping" mode. user can move/resize photo. user can click on another object or empty space to finish cropping
 *  canvas.endCrop()         finish cropping with a button
 *  canvas.ungroupMasking()  ungroup active MaskGroup object.
 */
fabric.util.object.extend(fabric.Canvas.prototype, {
  mode: "normal",
  createClipPathGroup(obj){

    let clipPath;
    if(obj.type === "activeSelection") {
      clipPath = obj.groupSelectedElements();
    }
    if(obj.type === "group") {
      clipPath = obj.cloneSync();
    }
    else {
      clipPath = new fabric.Group([obj]);
    }

    let _left = clipPath.left, _top = clipPath.top;
    clipPath.top = -clipPath.height/2;
    clipPath.left = -clipPath.width/2;

    return new fabric.Group({
      clipPath: clipPath,
      objects: [],
      width: clipPath.width ,
      height: clipPath.height,
      // fill: "black",
      top: _top,
      left: _left
    });
  },
  startMasking(){
    this.fire("mode:changed",{mode : "masking", before: this.mode});
    this.mode = "masking";
    if(this._activeObject.type === "activeSelection"){
      this.__maskObjectGroup = this._activeObject.groupSelectedElements();
      this.__maskObjectGroup.__wasGroupedBeforeMasking = true;
      this.add(this.__maskObjectGroup);
    }else{
      this.__maskObjectGroup = this._activeObject;
    }
    this.setActiveObject(this.__maskObjectGroup);
    this.on("target:changed",this._endMasking);
  },
  ungroupMasking(){
    let obj = this._activeObject;
    let activeSelection = obj.toActiveSelection();
    this._discardActiveObject()
  },
  _endMasking(e){
    this.off("target:changed",this._endMasking);

    this.fire("mode:changed",{mode : "normal", before: this.mode});
    this.mode = "normal";
    let clipPathGroup = this.createClipPathGroup(this.__maskObjectGroup);
    this.remove(this.__maskObjectGroup);
    delete this.__maskObjectGroup;
    this.add(clipPathGroup);

    clipPathGroup.addWithoutUpdate(e.target);
    clipPathGroup._clipPathGroup = true;
    clipPathGroup.on("dblclick",function () {
      this.canvas.startCrop(this);
    });
    this.setActiveObject(clipPathGroup);
  },
  cancelMasking(){
    this.off("target:changed",this._endMasking);
    this.fire("mode:changed",{mode : "normal", before: this.mode});
    this.mode = "normal";


    if(this.__maskObjectGroup.__wasGroupedBeforeMasking){
      this.__maskObjectGroup.ungroup();
    }
    this.discardActiveObject();
    delete this.__maskObjectGroup;
  },
  startCrop(){
    let group = this._activeObject;


    this.fire("mode:changed",{mode : "cropping", before: this.mode});
    this.mode = "cropping";
    this.__croppingImage = group._objects.splice(0,1)[0];
    this.__croppingImage.parent = group;


    group._restoreObjectState(this.__croppingImage);
    group.dirty = true;

    group.clipPath.absolutePositioned = true;
    group.clipPath.group = group;
    group._restoreObjectState(group.clipPath);
    this.__croppingImage.clipPath = group.clipPath;

    // this.add(this.__croppingImage);
    this.setActiveObject(this.__croppingImage);
    this.renderAll();
    this.on("target:changed", this.endCrop);
  },
  endCrop(){
    let group = this.__croppingImage.parent;
    toGroupCoords(group.clipPath,group);
    delete group.clipPath.absolutePositioned;

    this.off("target:changed", this.endCrop);
    this.fire("mode:changed",{mode : "normal", before: this.mode});
    this.mode = "normal";

    delete this.__croppingImage.clipPath;
    group.addWithoutUpdate(this.__croppingImage);
    delete this.__croppingImage.parent;
    delete this.__croppingImage;
  }
});

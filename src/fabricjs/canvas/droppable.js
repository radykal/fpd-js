'use strict';
// require('./../modules/canvas.events');

fabric.util.object.extend(fabric.Canvas.prototype, {
  setDroppable(val){
    if(!this.droppable && val){
      this.droppable = true;
      this.initDragAndDrop();
    }
  },
  accepts: {},
  droppable: false,
  isAccepts (accepts, data) {
    for (var i in accepts) {
      if (accepts[i].constructor === Array) {
        if (accepts[i].indexOf(data[i]) === -1)return false;
      } else {
        if(accepts[i] === "*")continue;
        if (accepts[i] !== data[i]) return false;
      }
    }
    return true;
    //return (this.supportedTypes == "*" || this.supportedTypes.indexOf(type)!= -1)
  },
  ___handleDrop(e) {
    this.file = e.dataTransfer.files[0];
    const reader = new FileReader();

    reader.onload = (imgFile) => {
      console.log(imgFile)
      const data = imgFile.target["result"];
      fabric.Image.fromURL(data, (img) => {
        let oImg = img.set({
          left: 0,
          top: 0,
          angle: 0
        }).scale(1);
        this.canvas.add(oImg).renderAll();
        var a = this.canvas.setActiveObject(oImg);
        var dataURL = this.canvas.toDataURL({format: 'png', quality: 0.8});
      });
    };
    reader.readAsDataURL(this.file);
    return false;
  },
  //
// <div
//   (dragover)="false"
//   (dragend)="false"
//   (drop)="___handleDrop($event)">
//   <canvas id="canvas" class="canvas" width="500" height="500">
//   </canvas>
// </div>
  initDragAndDrop () {

    this.on({
      "dragenter": ({e,target}) => {
        console.log("DragEnter", e);
        // highlight potential drop target when the draggable element enters it
        // if (event.target.className === "dropzone") {
        //   event.target.style.background = "purple";
        // }
        if (target && target.accepts && this.isAccepts(target.accepts, e.data)) {
          if(target.activate){
            target.activate();
          }
          // e.e.helper.css("cursor", "alias");
          this.setCursor("alias");
        } else {
          // e.e.helper.css("cursor", "not-allowed");
          this.setCursor("not-allowed");
        }
      },
      "dragleave": ({e,target}) => {
        // reset background of potential drop target when the draggable element leaves it
        // if (event.target.className == "dropzone") {
        //   event.target.style.background = "";
        // }
        console.log("DragLeave",e);
        delete this.lastDragOffsetX;
        delete this.lastDragOffsetY;

        if (target && target.accepts) {
          if (this.isAccepts(target.accepts, e.data)) {
            this._activated = false;
            if(target.deactivate){
              target.deactivate();
            }
          }
          e.e.helper.css("cursor", "pointer");
        }
      },
      "dragover": ({e,target}) => {
        // prevent default to allow drop
        e.preventDefault();
        if(this.lastDragOffsetX === e.offsetX && this.lastDragOffsetY === e.offsetY){
          return;
        }
        this.lastDragOffsetX = e.offsetX;
        this.lastDragOffsetY = e.offsetY;

        // let dataText = e.dataTransfer.getData("text");
        // let dataJson = dataText && JSON.parse(dataText);
        // let dataFiles = event.dataTransfer.files;
        let data = fabric.dataTransfer;

        // console.log("DragOver", {e,dataText, target});
        if (target && !this.isDrawingMode) {
          target.fire('dragover',  {e, data});
        }

        if (target !== this.dragTarget ){
          if (this.dragTarget) {
            this.dragTarget.fire('dragleave', {e,data});
          }
          if (target) {
            target.fire('dragenter', {e,data});
          }
          this.dragTarget = target;
        }
      },
      "drop": ({e,target}) => {
        // e.stopPropagation();
        e.preventDefault();

        let dataText = e.dataTransfer && e.dataTransfer.getData("text"),
            dataFiles = e.dataTransfer && e.dataTransfer.files,
            zoom = this.getZoom();


        let dt;
        if (fabric.dataTransfer){
          dt = fabric.dataTransfer;
        }
        else if(dataText){
          dt = {
            width: 300,
            offsetX: 150,
            offsetY: -30,
            data:{
              type: "textbox",
              text: dataText
            }
          }
        }
        else if(dataFiles){
          let file = e.dataTransfer.files[0];


          dt = {
            width: 150,
            height: 150,
            offsetX: 75,
            offsetY: 75,
            data: {
              type: "photo",
              file: file
            }
          }
        }

        if (target && !this.isDrawingMode) {
          if (target.accepts && this.isAccepts(target.accepts, dt.data)) {
            target.deactivate && target.deactivate();
            target.setData(data);
          }
        }
        else if (this.isAccepts(this.accepts, dt.data)) {

          let objectData = Object.assign({
            left:  (e.offsetX - dt.offsetX) / zoom,
            top:  (e.offsetY - dt.offsetY) / zoom
          },dt.data);

          if(dt.data.scaleX || dt.data.scaleY){
            objectData.scaleX = (dt.data.scaleX || 1) / zoom;
            objectData.scaleY = (dt.data.scaleY || 1) / zoom;
          }else{
            if(dt.width){
              objectData.width = dt.width / zoom;
            }
            if(dt.height){
              objectData.height = dt.height / zoom;
            }
          }

          this.setData(objectData);
        }
      }
    });
  }
});

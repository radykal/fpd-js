
import '../util/util.shapes.js'

export default {
  name: "frames",
  prototypes: {
    Editor:{

      startCropOnFrameSelect: false,
      setFrames: function (frames) {
        let output = {};
        for(let key in frames){
          let frame = frames[key];
          let type = fabric.util.string.capitalize(fabric.util.string.camelize(frame.id), true);
          output[type] = fabric.util.defaults(frame, {
            frame: false,
            shape: false,
            type: "photo",
            role: "frame"
          });
        }
        this.frames = output;
      },
      getFrame: function (value) {
        let dashedValue = fabric.util.string.toDashed(value);
        return this.frames.find(item => item.id === dashedValue );
        // return fabric._.findWhere(this.frames,{"id": fabric.util.string.toDashed(value)});
      },
      getFramesList: function (el) {
        el = el || fabric.Image.prototype;
        let framesList = [];

        if(el.availableFrames){

          for(let frameId of el.availableFrames){
            let frame = fabric.Image.frames[frameId];
            framesList.push({
              text: frame.title || frameId,
              id: frameId,
              data: fabric.util.clone(frame)
            })
          }
        }else {
          for(let key in this.frames){
            let frame = this.frames[key];
            framesList.push({
              text: frame.title || frame.id,
              id: frame.id,
              data: fabric.util.clone(frame)
            })
          }
        }
        return framesList;
      }
    },
    Object:{
      "+actions": {
        frame: {
          title: "frames",
          itemClassName: "images-selector",
          className: "far fa-heart",
          type: "select",
          dropdown: {
            previewWidth: 60,
            previewHeight: 60,
            templateSelection: function (state) {
              if (state.any) {
                return state.text
              }
              return $(`<span><span class="color-span" style="background-color: ${state.text}"></span>${state.text}</span>`)
            },
            templateResult: function (state) {
              let $el = $(`<span title="${state.text}"><span class="filter-preview"></span><span class="filter-name">${state.text}</span></span>`)
              let thumbnail = this.target.createFrameThumbnail(state.id, target.dropdown.previewWidth, target.dropdown.previewHeight)
              $el.find(".filter-preview").append($(thumbnail))
              return $el
            },
          },
          set (target,value) {
            target.setFrame(value)
            if (target._element && target.startCropOnFrameSelect ) {
              target.cropPhotoStart()
            }
          },
          get (target) {
            return target.frame ? target.frame.id || "custom" : "none"
          },
          options: "getFramesOptions"
        }
      },
      setFrame: function (value, callback) {
        if (this.canvas) {
          this.saveState(["frame"]);
          this.canvas.stateful = false;
        }
        let shapeReady, decoReady;

        if (value) {
          this.frame = this.editor.getFrame(value);
          this.setClipPath(this.frame.clipPath, () => {
            shapeReady = true;
            if (decoReady){
              this.fire('frame:modified');
              callback && callback();
            }
          });
          this.setDeco(this.frame.deco, () => {
            decoReady = true;
            if (shapeReady){
              this.fire('frame:modified');
              callback && callback();
            }
          });
        } else {
          this.frame = false;
          this.setClipPath(false);
          this.setDeco(false);
          this.fire('frame:removed');
          callback && callback();
        }
        this.dirty = true;
        if (this.canvas) {
          this.canvas.stateful = true;
          this.canvas.fire('object:modified', {target: this});
          this.canvas.renderAll();
        }
        this.fire('modified');
      },
      store_frame: function () {
        if (!this.frame) return;
        if (this.frame.id) {
          return this.frame.id;
        }
        return this.frame;
      },
      getFramesOptions(){
        let list = [{
          id: 'none',
          text: 'original',
          enabled: !this.frame
        }];
        let _frames = this.editor.getFramesList && this.editor.getFramesList(this);
        if(_frames){
          for (let i in this.frames) {
            let _f = _frames.find(item => (item.type === fabric.util.string.capitalize(this.frames[i].type)));
            if (_f) {
              _f.enabled = true;
            }
          }
          list = list.concat(_frames);
        }

        return list;
      },
      createFrameThumbnail(frame, w, h){
        this.___decoEl = this.deco;
        this.__clipPath = this.clipPath;
        delete this.deco;
        delete this.clipPath;
        let thumbnail = this.thumbnail({width:w,height: h},"canvas");
        this.deco = this.___decoEl;
        this.clipPath = this.__clipPath;
        delete this.___decoEl;
        delete this.__clipPath;

        if(frame && frame !== "none"){
          let canvas2 = fabric.util.createCanvasElement(w,h);
          let fImage = fabric.util.createObject({
            editor:  this.editor,
            type:         "image",
            units:        this.units,
            element:      thumbnail,
            width:        w,
            height:       h,
            frame:        frame
          },() => {
            let ctx2 = canvas2.getContext("2d");
            ctx2.translate(w/2,h/2);
            fImage.drawObject(ctx2);
          });
          return canvas2;
        }else{
          return thumbnail;
        }
      }
    }
  }
}


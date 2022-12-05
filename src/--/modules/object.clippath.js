import '../util/util.shapes.js'

export const ClipPath = {
  name: "clippath",
  prototypes: {
    Object:  {
      noScaleCache: false,
      _restoreObjectState: function(object){
        object.group = this;
        fabric.Group.prototype.realizeTransform.call(this,object);
        delete object.group;
        object.setCoords();
        this.canvas.add(object);
      },
      _drawClipPath: function(ctx) {
        var path = this.clipPath;
        if (!path) { return; }
        path.canvas = this.canvas;

        let parentScaleX = path.parent._getParentScaleX(),
          parentScaleY = path.parent._getParentScaleY();

        let origZoomX = path.scaleX, origZoomY = path.scaleY;
        if(path.parent) {
          //todo рассчитывать zooom у всех родителей групп
          path.scaleX *= parentScaleX;
          path.scaleY *= parentScaleY;
        }
        path.shouldCache();
        path._transformDone = true;
        path.renderCache({ forClipping: true });

        if(path.parent) {
          path.scaleX = origZoomX
          path.scaleY = origZoomY
        }
        ctx.save()
        ctx.translate(-0.5,-0.5)
        this.drawClipPathOnCache(ctx);
        ctx.restore()
      },
      resolveClipingMask: function(){
        this.clipPath.group = this;
        this.clipPath.scaleX /= this.scaleX;
        this.clipPath.scaleY /= this.scaleY;


        this._restoreObjectState(this.clipPath);
        delete this.clipPath.group;
        if(this.clipPath.type === "group"){
          this.clipPath.ungroup();
        }
        delete this.setClipPath({});
      },
      setClipPath(clipPath, callback) {
        //keep default clippath for cropped images
        if(clipPath === true){
          clipPath = {};
        }
        if(!clipPath && this.crop){
          clipPath = {};
        }
        if (!clipPath) {
          delete this.clipPath;
          delete this._clipPath;
          callback && callback();
          return;
        }

        if(clipPath.constructor === Object){
          clipPath = Object.assign({},clipPath);
          if (!clipPath.offsets) delete clipPath.offsets;
          if(!clipPath.units){
            clipPath.units = this.units;
          }

          //native clipPath
          if (clipPath.type) {
            clipPath = {
              object: clipPath
            }
          }

          if (clipPath.src) {
            fabric.util.shapes.loadShape(clipPath, () => {
              this._clipPath = clipPath;
              this.updateClipPath();
              callback && callback();
            });
          } else {
            this._clipPath = clipPath;
            this.updateClipPath();
            callback && callback();
          }
        }else{
          //native clipPath
          this.clipPath = clipPath;
          this.updateClipPath();
        }
      },
      updateClipPath() {
        let sh = this._clipPath;
        if (!sh) return;

        sh.width = this.width;
        sh.height = this.height;

        if (sh.object) {
          this.clipPath = fabric.util.createObject(sh.object);
          this.clipPath.scaleX = (this.width * this.scaleX) / this.clipPath.width;
          this.clipPath.scaleY = (this.height * this.scaleY) / this.clipPath.height;
          this.clipPath.left = -this.width / 2 - 1;
          this.clipPath.top = -this.height / 2 - 1;
        }
        else if (sh.objects) {
          this.clipPath = new fabric.Group({objects: sh.objects});
          this.clipPath.scaleX = (this.width * this.scaleX) / this.clipPath.width;
          this.clipPath.scaleY = (this.height * this.scaleY) / this.clipPath.height;
          this.clipPath.left = -this.width / 2 - 1;
          this.clipPath.top = -this.height / 2 - 1;
        }
        else {
          if (!Object.keys(sh).length) {
            let path = `M ${0} ${0} h ${sh.width} v ${sh.height} h ${-sh.width} z`;
            this.clipPath = new fabric.Path({path: path});
          }
          else {
            let path = fabric.util.shapes.makePath(sh);
            this.clipPath = new fabric.Path({path: path});
          }
          this.clipPath.left -= (this.width / 2 );
          this.clipPath.top -= (this.height / 2 );
          this.clipPath.scaleX = this.width  / this.clipPath.width ;
          this.clipPath.scaleY = this.height  / this.clipPath.height ;
        }
        this.clipPath.parent = this;
        this.dirty = true;
        this.canvas && this.canvas.renderAll();
      },
      store_clipPath() {
        if (this.frame) return;
        if(!this.clipPath)return;
        if(!this._clipPath) {
          return this.clipPath.storeObject();
        }

        let shape = fabric.util.object.clone(this._clipPath);
        if(!shape.units)delete shape.units;
        delete shape.width;
        delete shape.height;
        return shape;
      },
      "+eventListeners": {
        "resized scaling": "updateClipPath"
      }
    }
  }
}

import '../util/util.shapes.js'

function getParentScaleY(el) {
  return el.scaleY * (el.group ? getParentScaleY(el.group) : 1)// this.canvas.viewportTransform[3])
}
function getParentScaleX(el) {
  return el.scaleX * (el.group ? getParentScaleX(el.group) : 1)//: this.canvas.viewportTransform[0])
}
export const FmCLipPath = {
  name: "clip-path",
  prototypes: {
    Image: {
      "+cacheProperties": ["clipPathFitting"],
      "+storeProperties": ["clipPathFitting"],
      "+stateProperties": ["clipPathFitting"],
    },
    Object:  {
      // "+optionsOrder{^fitting}": ["clipPathFitting","clipPath"],
      "+cacheProperties": ["clipPathFitting"],
      "+storeProperties": ["clipPathFitting"],
      "+stateProperties": ["clipPathFitting"],
      noScaleCache: false,
      _restoreObjectState: function(object){
        object.group = this;
        fabric.Group.prototype.realizeTransform.call(this,object);
        delete object.group;
        object.setCoords();
        this.canvas.add(object);
      },
      /**
       * Execute the drawing operation for an object clipPath
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      drawClipPathOnCache: function(ctx, transformations) {
        var path = this.clipPath;
        ctx.save();
        // DEBUG: uncomment this line, comment the following
        // ctx.globalAlpha = 0.4
        if (path.inverted) {
          ctx.globalCompositeOperation = 'destination-out';
        }
        else {
          ctx.globalCompositeOperation = 'destination-in';
        }
        //ctx.scale(1 / 2, 1 / 2);
        if (path.absolutePositioned) {
          var m = fabric.util.invertTransform(this.calcTransformMatrix());
          ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
          // ctx.transform(...this.canvas.viewportTransform);
        }

        //TODO ! bugged check Fiera/Demos/Crop
        // if(transformations){
        //   path.drawObject(ctx, true, transformations)
        // }else{

        path.transform(ctx);
        ctx.scale(1 / path.zoomX, 1 / path.zoomY);
        ctx.drawImage(path._cacheCanvas, -path.cacheTranslationX, -path.cacheTranslationY);

        // }

        ctx.restore();
      },
      _drawClipPath: function(ctx, transformations) {
        if (!this.clipPath) return;
        let path = this.clipPath;
        path.canvas = this.canvas;
        let origZoomX, origZoomY;
        // if(transformations && path.parent && !path.absolutePositioned){
        //   let parentScaleX = getParentScaleX(path.parent),
        //       parentScaleY = getParentScaleY(path.parent);
        //
        //   origZoomX = path.scaleX;
        //   origZoomY = path.scaleY;
        //   //todo рассчитывать zooom у всех родителей групп
        //   path.scaleX *= parentScaleX;
        //   path.scaleY *= parentScaleY;
        // }

        ctx.save();


        //TODO ! bugged check Fiera/Demos/Crop
        if(transformations){
          ctx.globalCompositeOperation = path.inverted ? 'destination-out' :'destination-in';
          if (path.absolutePositioned) {
            var m = fabric.util.invertTransform(this.calcTransformMatrix());
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
          }
          path.transform(ctx);
          ctx.scale(1 / path.zoomX, 1 / path.zoomY);
          // ctx.translate( -path.cacheTranslationX, -path.cacheTranslationY);
          path.drawObject(ctx, true, transformations)

          // ctx.globalCompositeOperation = path.inverted ? 'destination-out':'destination-in';
          // if (path.absolutePositioned) {
          //   // let m = fabric.util.invertTransform(this.calcTransformMatrix());
          //   // ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
          //   // var m = fabric.util.invertTransform(this.calcTransformMatrix());
          //   // ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
          //
          //   ctx.save()
          //   var m = this.canvas.viewportTransform;
          //   ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
          //
          //
          //
          //   path.scaleX = path.scaleX || 1
          //   path.scaleY = path.scaleY || 1
          //   //
          //   path.transform(ctx);
          //   // ctx.scale(1 / path.zoomX, 1 / path.zoomY);
          //   //  ctx.drawImage(path._cacheCanvas, -path.cacheTranslationX, -path.cacheTranslationY);
          //
          //
          //   path.drawObject(ctx, true, transformations)
          //   ctx.restore()
          //
          // }
          // else{
          //   path.transform(ctx);
          //   // ctx.scale(1 / path.zoomX, 1 / path.zoomY)
          //   ctx.translate( -path.cacheTranslationX, -path.cacheTranslationY);
          //   path.drawObject(ctx, true, transformations)
          // }
        }else{
          path.shouldCache();
          path._transformDone = true;
          path.renderCache({
            forClipping: true
          });
          ctx.translate(-0.5 * path.scaleX, -0.5* path.scaleY);
          this.drawClipPathOnCache(ctx);
        }



        // if(transformations && path.parent) {
        //   path.scaleX = origZoomX;
        //   path.scaleY = origZoomY;
        // }
        ctx.restore();
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
      async setClipPath(clipPath, callback) {
        if (!clipPath) {
          delete this.clipPath;
          delete this._clipPath;
          callback && callback();
          return;
        }
        this.__clipPath = clipPath
        //keep default clippath for cropped images
        if(clipPath === true || !clipPath && this.crop){
          clipPath = {};
        }
        //native clipPath
        else if (clipPath.type) {
          clipPath = {
            object: clipPath
          }
        }

        if(clipPath.constructor === Object){
          clipPath = Object.assign({},clipPath);
          if (!clipPath.offsets) delete clipPath.offsets;
          if(!clipPath.units){
            clipPath.units = this.units;
          }

          if (clipPath.object && clipPath.object.constructor === Object) {


            clipPath.object = await new Promise(resolve => {
              fabric.util.createObject(Object.assign({},clipPath.object), (object)=>{
                resolve(object)
              },this.editor)
            })
            // console.log(clipPath.object)
          }
          else if (clipPath.objects) {

            clipPath.object = await new Promise(resolve => {
              fabric.util.createObject({type: "group", objects: clipPath.objects}, (object)=>{
                resolve(object)
              },this.editor)
            })


            // clipPath.object = new fabric.Group({objects: clipPath.object});
            // console.log(clipPath.object)
          }

          else if (clipPath.src && clipPath.src.endsWith(".svg")) {
            let data = await fabric.util.loadSvg(clipPath.src);
            // clipPath.objects = data.objects;
            // clipPath.width =  data.options.width;
            // clipPath.height = data.options.height;
            // clipPath.object = await fabric.util.createObjectPromise({type: "group", objects: clipPath.objects},this.editor)

            clipPath.object = fabric.util.groupSVGElements(data.objects, {
              width: data.options.width,
              height: data.options.height
            });

          } else if (clipPath.src) {
            clipPath = await fabric.util.shapes.loadShape(clipPath);
            // clipPath.type = shapeObject;
          }
        }
        else if(clipPath.constructor === String){
          if(/^url\(.*\)$/.test(clipPath)) {
            //todo
            //DO NOTHING! ELEMENTS PARSER WORKING
            this.clipPath = clipPath;
            callback && callback();
            return
          }
          else if(clipPath.startsWith("#")){
            //todo
            console.log("clipath reference")
            return;
            // clipPath = this.editor.getObjectByID(clipPath.substr(1));
          }
        }

        this._clipPath = clipPath;
        this.updateClipPath();
        callback && callback();
      },
      clipPathFitting: "fit",
      updateClipPath() {
        let sh = this._clipPath;
        if (!sh) return;

        sh.width = this.width;
        sh.height = this.height;

        if (sh.object) {
          this.clipPath = sh.object
          if(!this.clipPath.absolutePositioned){

            // this.clipPath.scaleX = (this.width * this.scaleX) / this.clipPath.width
            // this.clipPath.scaleY = (this.height * this.scaleY) / this.clipPath.height

            if(this.clipPathFitting === "fill"){
              this.clipPath.scaleX = (this.width ) / this.clipPath.width
              this.clipPath.scaleY = (this.height ) / this.clipPath.height
              this.clipPath.left = -this.width / 2
              this.clipPath.top = -this.height / 2
            }
            if(this.clipPathFitting === "fit"){
              let scale = Math.min(
                  (this.width * this.scaleX ) / this.clipPath.width,
                  (this.height * this.scaleY) / this.clipPath.height)

              this.clipPath.scaleY = scale * 1/this.scaleY
              this.clipPath.scaleX = scale *  1/this.scaleX

              this.clipPath.left = - this.clipPath.width * this.clipPath.scaleX / 2
              this.clipPath.top = -this.clipPath.height * this.clipPath.scaleY / 2
            }



            // this.clipPath.scaleX = this.scaleX
            // this.clipPath.scaleY = this.scaleY

          }
        }
        else if (sh.objects) {
          this.clipPath = sh
          // this.clipPath.scaleX = (this.width * this.scaleX) / this.clipPath.width
          // this.clipPath.scaleY = (this.height * this.scaleY) / this.clipPath.height
          this.clipPath.scaleX = (this.width ) / this.clipPath.width
          this.clipPath.scaleY = (this.height ) / this.clipPath.height
          // this.clipPath.scaleX = this.scaleX
          // this.clipPath.scaleY = this.scaleY
          this.clipPath.left = -this.width / 2
          this.clipPath.top = -this.height / 2
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
          this.clipPath.scaleX = this.width  / this.clipPath.width
          this.clipPath.scaleY = this.height  / this.clipPath.height
          // this.clipPath.scaleX = this.scaleX
          // this.clipPath.scaleY = this.scaleY
          this.clipPath.left -= this.width / 2
          this.clipPath.top -= this.height / 2
        }
        this.clipPath.parent = this;
        this.dirty = true;
        // this.canvas && this.canvas.renderAll();
        this.canvas && this.canvas.requestRenderAll()
      },
      getClipPath() {
        if (this.frame) return;
        if(!this.clipPath)return;
        if(this._clipPath.object){
          return this._clipPath.object.getState();
        }
        let shape = fabric.util.object.clone(this._clipPath);
        if(!shape.units)delete shape.units;
        delete shape.width;
        delete shape.height;
        return shape;
      },
      eventListeners: {
        "scaling modified": "updateClipPath"
      }
    },
    StaticCanvas:{
      setClipPath (value,callback){
        if(value && value.constructor === Object){
          this.clipPath = fabric.util.createObject(value,callback);
        }
        else{
          this.clipPath = value;
          callback();
        }
      }
    }
  }
}

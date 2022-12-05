// import './layers.js'
import '../util/util.shapes.js'


export default {
  name: "areas",
  prototypes: {
    Area: {
      prototype: "path",
      type: "area",
      originX: 'left',
      originY: 'top',
      fill: 'transparent',
      resizable: true,
      setArea (area,callback){
        this.area = area;
        fabric.util.shapes.loadShape(this.area, ()=> {
          let path = fabric.util.shapes.makePath(this.area);

          // this._set("path", path)
          this.stretchArea(path,area);
          callback && callback()
        });
      },
      stretchArea () {

        // var scale = this.canvas.viewportTransform[0];
        // let _scale = geometry.width / el.width;
        // shape.width = this.originalWidth;// * scale;
        // shape.height = this.originalHeight ;//* scale;

        this.path = fabric.util.shapes.makePath(this.area);
        this.left = 0;
        this.top = 0;


        // let _w = this.originalWidth || this.width;
        // let _h = this.originalHeight || this.height;
        //
        // let geometry = fabric.util.getRect(_w, _h, options);

        // options.width = options.width || el.width;

        // let _path = fabric.util.deepClone(el.originalPath);
        //
        // for (let inst of _path) {
        //   switch (inst[0]) {
        //     case "M":
        //     case "L":
        //       inst[1] *= _scale;
        //       inst[2] *= _scale;
        //       break;
        //     case "H":
        //     case "V":
        //       inst[1] *= _scale;
        //       break;
        //   }
        // }

        // el.set({
        //   path: _path,
        //   left: geometry.left,///* el.left * _scale*/,
        //   top: geometry.top,//+ el.top * _scale,
        //   // width: geometry.width ,///* el.left * _scale*/,
        //   // height: geometry.height ,///* el.left * _scale*/,
        //   // strokeWidth: this.areaProperties.strokeWidth / _scale,
        //   scaleX: _scale,
        //   scaleY: _scale
        // });

        // let geometry = fabric.util.getRect(_w,_h,options);

        // if(options.src){
        //   let _scale = geometry.width / img.width;
        //   el.set({
        //     left: geometry.left,// + el.left * _scale,
        //     top: geometry.top ,//+ el.top * _scale,
        //     strokeWidth: this.areaProperties.strokeWidth / _scale,
        //     scaleX: _scale,
        //     scaleY: _scale
        //   });
        // }else{
        //   // geometry.width -= el.strokeWidth * 2;
        //   // geometry.height -= el.strokeWidth * 2;
        //   el.set(geometry);
        // }
      },
      eventListeners : {
        "canvas.viewport:scaled canvas.dimensions:modified": "stretchArea"
      }
    },
    Canvas :{
      offsets: {top: 0 , left: 0 , bottom: 0 , right: 0 },
      store_offsets:function(){
        if(!this.offsets)return 0;
        if(this.offsets.left === this.offsets.right && this.offsets.right === this.offsets.top && this.offsets.top === this.offsets.bottom){
          return this.offsets.left;
        }
        else{
          return this.offsets;
        }
      },
      optionsOrder: fabric.util.a.build(fabric.StaticCanvas.prototype.optionsOrder).find("*").after("areas","offsets").array,

      /**
       * @param offsets : {top: number, right: number, bottom: number, left: number} | number | [?number,?number,?number,?number]
       * @param callback
       */
      setOffsets: function (offsets) {
        if(offsets === false){
          return;
        }
        if(offsets === 0 ){
          this.offsets = {top: 0, right: 0, bottom: 0, left: 0};
        }else if (offsets.constructor === Number) {
          this.offsets = {top: offsets, right: offsets, bottom: offsets, left: offsets};
        }else if (offsets.constructor === Array) {
          switch(offsets.length){
            case 0: this.offsets = {top: 0, right: 0, bottom: 0, left: 0}; break;
            case 1: this.offsets = {top: offsets[0], right: offsets[0], bottom: offsets[0], left: offsets[0]}; break;
            case 2: this.offsets = {top: offsets[0], right: offsets[1], bottom: offsets[0], left: offsets[1]}; break;
            case 3: this.offsets = {top: offsets[0], right: offsets[1], bottom: offsets[2], left: offsets[1]}; break;
            case 4: this.offsets = {top: offsets[0], right: offsets[1], bottom: offsets[2], left: offsets[3]}; break;
          }
        }else{
          this.offsets = offsets;
        }

        this.setAreas([{
          offsets: fabric.util.object.clone(this.offsets),
          width :  this.originalWidth,
          height:  this.originalHeight
        }]);
        this.renderAll();
      },
      _areasObjects: null,
      _update_clip_rect: function () {
        //todo
        return;
        if (this.areas || !this._areasObjects[0]) return;
        let geometry = fabric.util.getRect(this.width,this.height,this.offsets);
        this._areasObjects[0].set(geometry);
      },
      // storeProperties: fabric.StaticCanvas.prototype.storeProperties && fabric.StaticCanvas.prototype.storeProperties.concat(["offsets","areas"]),
      areaActivating: false,
      addElementsInsideActiveArea: false,
      setAreaProperty: function (property, value) {
        this["area_" + property] = value;
        for (let object of this._areasObjects) {
          object[property] = value;
        }
        this.renderAll();
      },
      setActiveArea: function (area) {
        if (this.activeArea) {
          this.activeArea.setStroke("#000");
        }
        this.activeArea = area;
        if (area) {
          area.setStroke("#B7F1ED");
        }
      },
      setAreaActivating: function (value/*, force*/) {
        //todo force
        let force = true;
        if (force || (value && !this.areaActivating)) {
          this.areaActivating = true;
          this.on("object:modified", function (e) {
            if(!this._areasObjects)return;
            if(this.editingObject){
              return;
            }
            //todo event! не ъотел бы это тут испольовать,но работает
            let pointer = this.getPointer(event, true);
            let target = this._searchPossibleTargets(this._areasObjects, pointer);
            if(this._currentTransform && target && this.editor.target.movementLimits != target){
              this.editor.target.set({
                movementLimits: target,
                clipTo: target
              });
              this.setActiveArea(target);
            }
          });
          this.on("mouse:down", function (e) {
            if(!this._areasObjects)return;
            let pointer = this.getPointer(e.e, true);
            let target = this._searchPossibleTargets(this._areasObjects, pointer);
            if (target) {
              this.setActiveArea(target);
            }
          })
        }
      },
      createArea: async function (area, callback) {

        let areaEl = new fabric.Area({
          editor: this.editor,
          id: area.id,
          area: area,
          layer: "areas",
          evented: false,
          canvas: this
        });


        if (this.areaActivating) {
          this.setActiveArea(areaEl || null);
        }

        this._areasObjects.push(areaEl);

        if(( area.right || area.bottom || area.path ) && (!this.originalWidth  || !this.originalHeight) ){
          this.on("background-image:loaded",function(){
            this.stretchArea(path,area);
            this.renderAll();
          }.bind(this))
        }

        callback(areaEl);
      },
      renderOrder: fabric.util.a.insertBefore(fabric.Canvas.prototype.renderOrder,"controls","areas"),
      layers: fabric.util.object.extend(fabric.Canvas.prototype.layers,{
        areas: {
          render(ctx){
            if(this._areasObjects && this._areasObjects.length) {
              ctx.save();
              let v = this.viewportTransform;
              let scale = v[0];
              ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);

              ctx.lineWidth = this._areasObjects[0].strokeWidth / scale;

              ctx.strokeStyle = this._areasObjects[0].stroke;

              let dashArray = this._areasObjects[0].strokeDashArray;
              if(dashArray){
                dashArray = dashArray.map(item => (item /= scale));
                fabric.Path.prototype._setLineDash(ctx, dashArray, fabric.Path.prototype._renderDashedStroke);
              }

              for (let path of this._areasObjects) {
                ctx.save();
                ctx.translate(path.left + path.pathOffset.x, path.top + path.pathOffset.y);
                path._renderPathCommands(ctx);
                ctx.stroke();
                ctx.restore();
              }
              ctx.stroke();
              ctx.restore();
            }
          },
          objects: "_areasObjects"
        }
      }),
      setAreas: function (areas, callback) {

        this._areasObjects = [];
        areas = areas || [];
        if (this.areas) {
          for (let i = this.areas.length; i--;) {
            this.removeArea(this.areas[i].instance);
          }
        }

        let loader = new fabric.util.Loader({
          elements: areas,
          active: false,
          complete: ()=> {
            if (this.areaActivating) {
              this.setActiveArea(this._areasObjects[0] || null);
            }
            callback && callback.call(this);
          }
        });

        for (let i in areas) {
          if (!areas[i].id) {
            areas[i].id = "__" + i;
          }
          areas[i].instance = this.createArea(areas[i], () =>{
            loader.shift(areas[i]);
          });
        }
        loader.activate();

        this.areas = areas;
        this.renderAll();
      },
      eventListeners: fabric.util.merge(fabric.Canvas.prototype.eventListeners, {
        "before:drop": function(e){
          //todo;
          if(!this._backgroundLayer){
            return;
          }
          let pointer = this.getPointer(e.originalEvent, true);
          let target = this._searchPossibleTargets(this._backgroundLayer, pointer);
          if (target) {
            this.setActiveArea(target);
            e.data.clipTo = "#" + target.id;
            e.data.movementLimits = "#" + target.id;
          }
        }
      })
    }
  }
}





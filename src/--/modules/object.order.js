
export default {
  name: "order",
  prototypes: {
    StaticCanvas:{
      "+actions": {


        objectsOrder: {
          closeOnBlur: false,
          className: "fas fa-layer-group",
          title: "layers",
          variable: "objectsOrder",
          panel: "layers-panel"
          // observe: layersPanelOptions.observe,
          // tree: layersPanelOptions.tree
        }
      },
      // orderGroups: [
      //   {parent: "objects",id: "group-x",text: "group-x",data: {visible: true, "locked": false}}
      // ],
      defaultIdPrefix: "layer",
      setObjectsOrder(value){
        switch(value.type){
          case "removed": {
            let object = this.getObjectByID(value.node.id);
            this.remove(object);
            break;
          }
          case "checked": {
            this.discardActiveObject();
            let objects = [];
            if(value.checked.length > 1){
              for(let id of value.checked){
                objects.push(this.getObjectByID(id));
              }
              let selection = new fabric.ActiveSelection( objects, {canvas: this } );
              this.setActiveObject(selection);
            }else{
              let object = this.getObjectByID(value.checked[0]);
              this.setActiveObject(object);
            }
            this.renderAll();
            break;
          }
          case "modified": {
            for(let item of value.modified){
              if(item.node.type === "root"){
                if(this.layers){
                  let layer = this.layers[item.node.id];
                  for(let property in item.modified){
                    layer[property] = item.modified[property];
                  }
                }else{

                }
              }
              else{
                let object = this.getObjectByID(item.node.id);
                if(item.modified.zIndex !== undefined){
                  object.setZIndex(item.modified.zIndex);
                }
                else{
                  for(let property in item.modified){
                    let setFoo = "set" + fabric.util.string.capitalize(property);
                    if(object[setFoo]){
                      object[setFoo](item.modified[property]);
                    }else{
                      object.set(property,item.modified[property]);
                    }
                  }
                }
              }
            }
          }
            break;
        }
        this.renderAll();
      },
      getObjectsOrder(){
        let showLayers = false;

        let value = [];
        if(false && this.layers){
          for(let layerName of this.renderOrder){
            let layer = this.layers[layerName];
            if(!layer)continue;

            value.push({
              id : layerName,
              parent : "#",
              text : layerName,
              type: "root",
              data: {visible: layer.visible !== false, "locked": layer.locked !== true}
            });

            let layerObjects = layer.getObjects();

            if(layerObjects){
              for(let object of layerObjects){

                if(!object.id){
                  object.id = (this.defaultIdPrefix || object.type + "-") + fabric.Object.__uid++;
                }
                value.push({
                  id: object.id,
                  parent: object.orderGroup || layerName,
                  text: object.id,
                  type: "object",
                  data: {visible: object.visible, "locked": !object.selectable},
                  state : { checked : object.active }
                });
              }
            }
          }
        }else{
          let visible = false;
          for(let object of this._objects){
            if(object.visible){
              visible = true;
              break;
            }
          }
          let locked = true;
          for(let object of this._objects){
            if(!object.selectable){
              locked = false;
              break;
            }
          }

          let activesel = this.getActiveObject() || [];

          if(activesel){
            if(activesel.type !== "activeSelection"){
              activesel = [activesel];
            }else{
              activesel = activesel._objects;
            }
          }

          let active = true;
          for(let object of this._objects){
            if(activesel.includes(object)){
            }else{
              active = false;
              break;
            }
          }

          if(showLayers){
            value.push({
              id : "objects",
              parent : "#",
              text : "objects",
              type: "objectsroot",
              data: {visible: visible, "locked": locked},
              state : { checked : active }
            });
          }

          for(let i = this._objects.length ; i--;){
            let object = this._objects[i];
            if(!object.id){
              object.id =  (this.defaultIdPrefix || object.type + "-") + fabric.Object.__uid++;
            }
            value.push({
              id: object.id,
              parent: showLayers ? "objects" : "#",
              text: object.id,
              type: "object",
              data: {visible: object.visible, "locked": !object.selectable},
              state : { checked : activesel.includes(object) }
            });
          }
        }
        return value;
      },
      getLayerIndex: function (objectLayer){
        let layerIndex = 0;
        for(let layerName of this.renderOrder){
          if(layerName === objectLayer)break;
          for(; layerIndex < this._objects.length ; layerIndex++){
            let anotherObjectLayer = this._objects[layerIndex].layer || "objects";
            if(anotherObjectLayer !== layerName){
              break;
            }
          }
        }
        return layerIndex;
      },
      _toFront(obj){
        if(obj.layer) {
          let layer = this.layers[obj.layer];
          let objectsArray = layer.getObjectsArray();

          let layerIndex = this.renderOrder.indexOf(obj.layer);
          let i;
          for (i = 0; i < objectsArray.length; i++) {
            if (objectsArray[i].layer && this.renderOrder.indexOf(objectsArray[i].layer) > layerIndex) {
              break;
            }
          }
          objectsArray.splice(i, 0, obj);
        }
        else {
          this._objects.push(obj);
        }
      },
      _toBack(obj){
        if(obj.layer) {
          let layer = this.layers[obj.layer];
          let objectsArray = layer.getObjectsArray();
          let layerIndex = this.renderOrder.indexOf(obj.layer);
          for (let i = objectsArray.length; i--;) {
            if (objectsArray[i].layer && this.renderOrder.indexOf(objectsArray[i].layer) < layerIndex) {
              objectsArray.splice(i + 1, 0, obj);
              return;
            }
          }
        }
        else {
          this._objects.unshift(obj);
        }
      },
      add () {
        for (let obj of [...arguments]) {

          this._toFront(obj);

          if (this._onObjectAdded) {
            this._onObjectAdded(obj);
          }
        }
        this.renderOnAddRemove && this.renderAll();
        return this;
      },

      /**
       * Moves an object or the objects of a multiple selection
       * to the bottom of the stack of drawn objects
       * @param {fabric.Object} object Object to send to back
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      sendToBack: function (object) {
        if (!object) {
          return this;
        }
        var activeSelection = this._activeObject,
          i, obj, objs;
        if (object === activeSelection && object.type === 'activeSelection') {
          objs = activeSelection._objects;
          for (i = objs.length; i--;) {
            obj = objs[i];
            fabric.util.removeFromArray(this._objects, obj);
            this._objects.unshift(obj);
          }
        }
        else {
          fabric.util.removeFromArray(this._objects, object);
          this._objects.unshift(object);
        }
        this.fire("object:replaced",{target:object });
        this.renderOnAddRemove && this.requestRenderAll();
        return this;
      },

      /**
       * Moves an object or the objects of a multiple selection
       * to the top of the stack of drawn objects
       * @param {fabric.Object} object Object to send
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      bringToFront: function (object) {
        if (!object) {
          return this;
        }
        var activeSelection = this._activeObject,
          i, obj, objs;
        if (object === activeSelection && object.type === 'activeSelection') {
          objs = activeSelection._objects;
          for (i = 0; i < objs.length; i++) {
            obj = objs[i];
            fabric.util.removeFromArray(this._objects, obj);
            this._objects.push(obj);
          }
        }
        else {
          fabric.util.removeFromArray(this._objects, object);
          this._objects.push(object);
        }
        this.fire("object:replaced",{target:object });
        this.renderOnAddRemove && this.requestRenderAll();
        return this;
      },
    },
    Object: {
      "+actions": {
        order: {
          title: "order",
          className: "fa fa-layer-group",
          menu: [
            "bringForward",
            "sendBackwards",
            "bringToFront",
            "sendToBack"
          ]
        },
        bringForward: {
          title: "bring forward",
          className: "fas fa-bring-forward",
          enabled: "not onTop",
          observe: "canvas.object:added canvas.object:removed canvas.object:replaced",
        },
        sendBackwards: {
          title: "send backwards",
          className: "fas fa-send-backward",
          enabled: "not onBottom",
          observe: "canvas.object:added canvas.object:removed canvas.object:replaced",
        },
        bringToFront: {
          title: "bring to front",
          className: "fas fa-bring-front",
          enabled: "not onTop",
          observe: "canvas.object:added canvas.object:removed canvas.object:replaced",
        },
        sendToBack: {
          title: "send to back",
          className: "fas fa-send-back",
          enabled: "not onBottom",
          observe: "canvas.object:added canvas.object:removed canvas.object:replaced"
        },
      },
      setZIndex(value){
        fabric.util.removeFromArray(this.canvas._objects, this);
        if(this.canvas.layers){
          let layerIndex = this.canvas.getLayerIndex(this.layer || "objects");
          value = layerIndex + value;
        }
        this.canvas._objects.splice(value, 0, this);
      },
      onTop () {
        let objs = this.canvas._objects;
        let index = objs.indexOf(this);
        if(index === objs.length - 1){
          return true;
        }
        else if(this.layer){
          // If above object is on another layer we could not bring our object forward
          if(objs[index + 1].layer && objs[index + 1].layer !== this.layer){
            return true;
          }
        }
        return false;
      },
      onBottom () {
        let objs = this.canvas._objects;
        let index = objs.indexOf(this);
        if(index === 0){
          return true;
        }
        else if(this.layer){
          // If above object is on another layer we could not bring our object forward
          if(objs[index - 1].layer && objs[index - 1].layer != this.layer){
            return true;
          }
        }
        return false;
      },
      /**
       * Moves an object down in stack of drawn objects
       * @param {Boolean} [intersecting] If `true`, send object behind next lower intersecting object
       * @return {fabric.Object} thisArg
       * @chainable
       */
      sendBackwards (intersecting) {
        if (this.group) {
          fabric.StaticCanvas.prototype.sendBackwards.call(this.group, this, intersecting);
        }
        else {
          this.canvas.sendBackwards(this, intersecting);
        }
        this.canvas.fire("object:replaced",{target:this });
        return this;
      },
      /**
       * Moves an object up in stack of drawn objects
       * @param {Boolean} [intersecting] If `true`, send object in front of next upper intersecting object
       * @return {fabric.Object} thisArg
       * @chainable
       */
      bringForward (intersecting) {
        if (this.group) {
          fabric.StaticCanvas.prototype.bringForward.call(this.group, this, intersecting);
        }
        else {
          this.canvas.bringForward(this, intersecting);
        }
        this.canvas.fire("object:replaced",{target:this });
        return this;
      }
    },
    ActiveSelection: {
      onTop () {
        return false;
      },
      onBottom () {
        return false;
      },
    }
  }
}



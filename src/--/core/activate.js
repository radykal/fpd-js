export const FmActivate = {
  name: "activate",
  prototypes: {
    Object: {
      inactiveOptions: null,
      activeOptions: null,
      "+eventListeners":  {
        added: function () {
          if(this.active){
            this.activeOptions && this.set(this.activeOptions);
          }else{
            this.inactiveOptions && this.set(this.inactiveOptions);
          }
        },
        deselected: function () {
          this.inactiveOptions && this.set(this.inactiveOptions);
        },
        selected: function () {
          this.activeOptions && this.set(this.activeOptions);
        }
      }
    },
    Canvas: {
      preserveObjectStackingSelection: false,
      //overwritten
      findTarget: function (e, skipGroup) {
        if (this.skipTargetFind) {
          return;
        }

        let ignoreZoom = true,
            activeObject = this._activeObject,
            aObjects = this.getActiveObjects(),
            activeTarget, activeTargetSubs;

        //check subtargets corners
        // if(this._activeObject && this._activeObject.group){
        //   e._group = this._activeObject.group
        // }

        let pointer = this.getPointer(e, ignoreZoom);
        let allObjects = this.layers ? this.renderOrder.reduce((acc,l) => acc.concat(this.layers[l].getObjects() || []),[]) : this._objects
        let activeObjects = allObjects.filter(o => o.active === true && o !== activeObject).concat([activeObject])

        this.targets = [];
        if(aObjects.length){
          if (aObjects.length > 1 && !skipGroup && activeObject === this._searchPossibleTargets([activeObject], pointer)) {
            return activeObject;
          }

          for(let i = activeObjects.length; i--;){
            if(activeObjects[i]._findTargetCorner(pointer)){
              return activeObjects[i];
            }
          }

          if(!this.preserveObjectStackingSelection ){
            if (activeObject === this._searchPossibleTargets(activeObjects, pointer)) {
              return activeObject;
              //todo check why it is needed here?? probably for subObjects. selection inside groups. or maybe select object which are in front of selected object
              if (!this.preserveObjectStacking) {
                return activeObject;
              }
              else {
                activeTarget = activeObject;
                activeTargetSubs = this.targets;
                this.targets = [];
              }
            }
          }
        }
        //restore check subtargets corners
        // if(this._activeObject && this._activeObject.group){
        //   delete e._group;
        // }


        let target = this._searchPossibleTargets(allObjects, pointer);

        if (e[this.altSelectionKey] && target && activeTarget && target !== activeTarget) {
          target = activeTarget;
          this.targets = activeTargetSubs;
        }
        return target;
      },
      /**
       * Draws objects' controls (borders/controls)
       * @param {CanvasRenderingContext2D} ctx Context to render controls on
       */
      drawControls: function (ctx) {
        for (let object of this._objects) {

          if (object !== this._activeObject && object.active) {
            object._renderControls(ctx)
          } else if (object.inactiveBorder && !object.group) {
            let options = fabric.util.qrDecompose(
                fabric.util.multiplyTransformMatrices(object.getViewportTransform(), object.calcTransformMatrix()))
            ctx.save()
            ctx.translate(Math.round(options.translateX), Math.round(options.translateY))
            ctx.lineWidth = object.borderWidth
            ctx.rotate(fabric.util.degreesToRadians(object.angle))
            object.drawBorders(ctx, {hasRotatingPoint: false})
            ctx.restore()
          }

        }
        if (this._activeObject) {
          // if (active.type === 'activeSelection') {
          this._activeObject._renderControls(ctx)
          // }
        }
      }
    }
  }
}
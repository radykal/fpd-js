import History from './../../plugins/history.js';

// source: https://stackoverflow.com/a/29574724/6798201
//assuming "b" contains a subsequence containing
//all of the letters in "a" in the same order
function _getDifference(a, b) {
  let i = 0;
  let j = 0;
  let result = "";

  while (j < b.length) {
    if (a[i] != b[j] || i == a.length)
      result += b[j];
    else
      i++;
    j++;
  }
  return result;
}

export default {
  name: "undo",
  prototypes: {
    Canvas: {
      _restoreGroup (object,objectsStates){
        if(this._activeObject !== object){
          this.setActiveObject(object);

          if(object._objects[0].group !== object){
            let objs = object._objects;
            object._objects = [];
            for(let i in objs){
              object.add(objs[i]);
              objs[i].set(objectsStates[i])
            }
          }
        }
      },
      onCanvasModified (e) {
        if (!this._isHistoryActive())return;
        let states = e.original ? e : this.getModifiedStates();
        if(!states && !this._history_removed_object)return;
        this.editor.fire("modified",e);

        this.history.add({
          canvas:  this,
          object: this._history_removed_object,
          // thumbnail: this.storeHistoryThumbnail &&  this._history_removed_object.thumbnail(32),
          originalState:  states.original,
          modifiedState:  states.modified,
          type: 'canvas:modified',
          undo: a => {
            if(a.object){
              this.undoDeleting(a)
            }
            this.undoChanges(a);
          },
          redo: a => {
            if(a.object){
              this.redoDeleting(a)
            }
            this.redoChanges(a);
          }
        });
        delete this._history_removed_object;
      },
      onCanvasCleared (e) {
        if (!this._isHistoryActive())return;
        let states = this.getModifiedStates();
        if(!e.objects.length && ! states){return;}
        this.editor.fire("modified",e);

        this.history.add({
          originalState:  states && states.original,
          modifiedState:  states && states.modified,
          originalObjects: e.objects,
          type: 'canvas:cleared',
          redo: a => {
            this.discardActiveObject();
            this._clearObjects();
            if(a.originalState){
              this.set(a.modifiedState)
                .fire('modified')
            }
            this.renderAll();
          },
          undo: a => {
            Array.prototype.push.apply(this._objects, a.originalObjects);
            if(a.modifiedState){
              this.set(a.originalState)
                .fire('modified')
            }
            this.renderAll();
          }
        });
      },


      //source: https://stackoverflow.com/a/29574724/6798201
      //assuming "b" contains a subsequence containing
      //all of the letters in "a" in the same order
      _getTextDifference : function (a, b) {
        let i = 0;
        let j = 0;
        let result = "";

        while (j < b.length) {
          if (a[i] != b[j] || i == a.length)
            result += b[j];
          else
            i++;
          j++;
        }
        return result;
      },
      onObjectModified ({target, canvas, original, modified}) {
        if (!this._isHistoryActive())return;
        let meta = null;

        if(target.type === "activeSelection"){
          target.includeDefaultValues = true;

          let objectsStates = target.toObject().objects.map( (item) => {
            // _.pick(item, "left", "top", "angle", "scaleX", "scaleY") Using Object Destructuring and Property Shorthand
            return (({ left, top, angle, scaleX, scaleY }) => ({ left, top, angle, scaleX, scaleY }))(item);
          });
          /**
           * была изменена группа объектов
           */
          this.history.add({
            canvas:   canvas,
            objectsStates: objectsStates,
            originalState:  original,
            modifiedState:  modified,
            object: target,
            thumbnail: this.storeHistoryThumbnail && target.getThumbnail(32),
            type: 'group:modified',
            undo: function (a) {
              a.canvas._restoreGroup(a.object,a.objectsStates);

              a.object.set(a.originalState);
              a.object.setCoords();
              a.object.fire('modified');
              a.canvas.fire('object:modified', { target: a.object });
              a.canvas.renderAll();
            },
            redo: function (a) {
              a.canvas._restoreGroup(a.object,a.objectsStates);

              a.object.set(a.modifiedState);
              a.object.setCoords();
              a.canvas.fire('object:modified', { target: a.object });
              a.object.fire('modified');
              a.canvas.renderAll();
            }
          });

        }else{

          let lastState = this.history.last();
          //CHECK IF wecontinously modify the same object property. text or fill
          if(lastState.object === target && lastState.type === 'object:modified') {

            let modifiedKeys = Object.keys(modified);
            let lastModifiedKeys = Object.keys(lastState.modifiedState);

            //Do not add history item if user modifng Text
            if ((modifiedKeys.includes("text") && lastModifiedKeys.includes("text")) && (
              (modifiedKeys.length === 2 && modifiedKeys.includes("styles") && lastModifiedKeys.length === 2 && lastModifiedKeys.includes("styles")) ||
              (modifiedKeys.length === 1 && lastModifiedKeys.length === 1 ))) {

              const difference = _getDifference(lastState.modifiedState.text,modified.text);
              if ((difference.length === 1 && /\s/.test(difference)) || difference.length > 1) {
                // console.log("Saving latest history version...");
              } else {
                // console.log("update last history version");
                lastState.modifiedState.text = modified.text;
                target.saveState(["text"]);
                return;
              }
            }

            //Do not add history item if user modifng Fill
            //todo should work with other properties too
            if (modifiedKeys.length === 1 && modifiedKeys.includes("fill") && lastModifiedKeys.length === 1 && lastModifiedKeys.includes("fill")) {
              lastState.modifiedState.fill = modified.fill;
              target.saveState(["fill"]);
              return;
            }

            if (lastState.meta && modifiedKeys.includes("styles") && lastModifiedKeys.includes("styles") &&
              target.__changedProperty === lastState.meta.property &&
              target.__selectionStart === lastState.meta.start &&
              target.__selectionEnd === lastState.meta.end) {
              lastState.modifiedState = modified;
              return;
            }
          }

          if(target.__selectionEnd !== undefined && target.__selectionStart !== undefined ){
            meta = {
              property: target.__changedProperty,
              end: target.__selectionEnd,
              start: target.__selectionStart
            }
          }

          this.history.add({
            meta: meta,
            canvas:   canvas,
            originalState:  original,
            modifiedState:  modified,
            object: target,
            thumbnail: this.storeHistoryThumbnail && target.getThumbnail(32),
            type: 'object:modified',
            undo: function (a) {
              a.canvas.setActiveObject(a.object);
              a.object.set(a.originalState);
              a.object.dirty = true;//todo
              a.object.setCoords();
              a.object.fire('modified');
              a.canvas.fire('object:modified', { target: a.object });
              a.canvas.renderAll();
            },
            redo: function (a) {
              a.canvas.setActiveObject(a.object);
              a.object.set(a.modifiedState);
              a.object.dirty = true;//todo
              a.object.setCoords();
              a.canvas.fire('object:modified', { target: a.object });
              a.object.fire('modified');
              a.canvas.renderAll();
            }
          });
        }
      },
      clearHistory () {
        this.history.clear();
      },
      disableHistory () {
        this.history.enabled = false;
      },
      undoChanges (a) {
        this.set(a.originalState)
          .fire('modified')
          .renderAll();
      },
      redoChanges (a) {
        this.set(a.modifiedState)
          .fire('modified')
          .renderAll();
      },
      undoDeleting (a) {
        a.canvas.add(a.object);
        a.canvas.setActiveObject(a.object);
        a.canvas.renderAll();
      },
      redoDeleting (a) {
        a.canvas.remove(a.object);
        a.canvas._discardActiveObject();
        a.canvas.renderAll();
      },
      _isHistoryActive(){
        return this.stateful && this.history.enabled && !this.processing && !this.history.processing;
      },
      onGroupRemoved (e) {
        if (!this._isHistoryActive())return;
        this.editor.fire("modified",e);
        this.history.add({
          canvas:  e.target.canvas,
          object: e.target,
          thumbnail: this.storeHistoryThumbnail && e.target.getThumbnail(32),
          type: 'group:removed',
          redo: function(a){
            a.object._objects.forEach((o) => {
              a.canvas.remove(o);
            });
            a.canvas.discardActiveObject();
            a.canvas.renderAll();
          },
          undo: function(a){
            a.object._objects.forEach((o) => {
              a.canvas.add(o);
            });
            a.canvas.setActiveObject(a.object);
            a.canvas.renderAll();
          }
        });
      },
      onObjectRemoved (e) {
        if (!this._isHistoryActive())return;
        this.editor.fire("modified",e);
        this.history.add({
          canvas:  e.target.canvas,
          object: e.target,
          thumbnail: this.storeHistoryThumbnail && e.target.getThumbnail(32),
          type: 'object:removed',
          redo: this.redoDeleting,
          undo: this.undoDeleting
        });
      },
      onDrawAfter (event){
        if (!e.target.canvas.stateful || !this.history.enabled || this.processing || this.history.processing) {
          return false;
        }
        this.editor.fire("modified",e);
        this.history.add(this.freeDrawingBrush.getHistoryRecord(event))
      },
      storeHistoryThumbnail: false,
      onObjectAdded (e) {
        if (!this._isHistoryActive())return;
        this.editor.fire("modified",e);

        this.history.add({
          canvas:  e.target.canvas,
          object: e.target,
          thumbnail: this.storeHistoryThumbnail && e.target.getThumbnail(32),
          type: 'object:added',
          undo: this.redoDeleting,
          redo: this.undoDeleting
        });
      },
      initHistory (history) {
        if(!history){
          history = new History(this);
        }
        this.stateful = true;
        this.history = history;

        this.on({
          'modified':         this.onCanvasModified,
          'loading:begin':    this.clearHistory,
          'draw:after':       this.onDrawAfter,
          'object:modified':  this.onObjectModified,
          'canvas:cleared':   this.onCanvasCleared,
          'object:added':     this.onObjectAdded,
          'object:removed':   this.onObjectRemoved,
          'group:removed':    this.onGroupRemoved
        });

        // let _this = this;
        // this.history.on('changed', function(e){
        // });
        let proto = this.editor.prototypes && this.editor.prototypes.History;
        if(proto){
          if(proto.eventListeners){
            history.on(proto.eventListeners);
          }
        }
      },
      enableHistory () {
        this.history.enabled = true;
      }
    },
    Editor: {
      getHistoryStates() {
        return this.history.stack.map(state => {
          let original = state.originalState;
          let modified = state.modifiedState;
          let keys = original && Object.keys(original).join(',') || '';
          let oId = state.object && state.object.id || '';

          let title = "";
          for(let i in original){
            title += `${i}: ${JSON.stringify(original[i])} > ${JSON.stringify(modified[i])}\n`
          }

          return {
            id: "" + state.id,
            parent: "#",
            icon : state.thumbnail,
            text: `${oId}(${keys})`,
            data: {title: title, state: state},
            state : { selected : this.history.stack[this.history.current].id === state.id }
          }
        });
      },
      setHistoryState(val) {
        this.history.goto(val);
      },
      getHistoryState(){
        return this.history.records[this.current].id;
      },
      history: null,
      // _default_event_listeners : {
      //   "slide:change:begin" : function(){
      //     this.processing = true ;
      //     if(this.history){
      //       this.history.processing = true ;
      //     }
      //   },
      //   "slide:changed" : function(){
      //     this.processing = false;
      //     if(this.history){
      //       this.history.processing = false;
      //     }
      //   }
      // },
      setHistory (historyOption){
        if(historyOption === true){
          historyOption = "global";
        }
        if(historyOption === "global"){
          this.history = new History(this);
          this.enableHistory();

          this.on("slide:created",(e) => {
            e.target.initHistory(this.history);
          });
          // this.on("ready",() => {
          //   if (this.slides) {
          //     this.slides.forEach(slide => {
          //       slide.initHistory(this.history);
          //     })
          //   }
          // })
        }
        /* if(historyOption === fabric.HISTORY_MODE.INDIVIDUAL){
					 if(this.canvas){
						 this.history = new History(this);
						 this.enableHistory();
						 this.canvas.initHistory(this.history);
					 }
					 //todo unsupported
				 }*/
      },
      enableHistory () {
        this.history.enabled = true;
      }
    }
  }
}


// fabric.HISTORY_MODE = {
//   INDIVIDUAL: "slide",
//   SHARED: "global"
// };


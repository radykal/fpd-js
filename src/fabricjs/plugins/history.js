import deepClone from './../src/util/util.js';
import Observable from "./observable.js";

/***********************************************************************************************************************
 ** DPHistory
 ***********************************************************************************************************************/


var DPHistory = function (editor, initAction) {
    this.editor = editor;
    this.clear(initAction);
};

DPHistory.prototype.last = function () {
  return this.stack[this.stack.length - 1];
};
DPHistory.prototype.count = function () {
  return this.stack.length;
};

DPHistory.prototype.setStack = function (stack,current) {
  this.canUndo = stack.length;
  this.canRedo = false;

  if(!stack.length){
    stack = [{
      type: 'initialized',
      id: 0,
      text : 'initialized'
    }]
  }
  this.stack = stack;
  // this.length = this.stack.length ;
  this.current = current === undefined ? stack.length - 1 : current;
  this.activeAction = this.stack[this.current];
  this.fire("changed",{action: this.activeAction});
  return this;
};

DPHistory.prototype.restore = function () {
  this.setStack(this.saved.stack,this.saved.current);
  return this;
};

DPHistory.prototype.save = function () {
  this.saved = {
    current: this.current,
    stack: deepClone(this.stack)
  };
  return this;
};

DPHistory.prototype.clear = function (initAction) {
    if (initAction) {
        initAction.id = 0;
    } else {
        initAction = {
            type: 'initialized',
            id: 0,
          text : 'initialized'
        }
    }
    this.stack = [initAction];
    this.current = 0;
    this.canUndo = false;
    this.canRedo = false;
    this.activeAction = this.stack[this.current];
  this.fire("changed",{action: this.activeAction});
  return this;
};

DPHistory.prototype.add = function(action){

    if (!this.enabled || this.processing) {
      return false;
    }
    action.moment = new Date().getTime();
    this.canUndo = true;
    this.canRedo = false;
    this.stack.splice(this.current+ 1);
    this.stack.push(action);
    // this.length = this.stack.length;
    action.id = this.stack.length - 1;
    action.text = action.type || action.text;
    this.current = this.stack.length - 1;

  this.activeAction = this.stack[this.current];
  this.fire("changed",{action: action});
  return this;
};

DPHistory.prototype.disable = function(){
  this.enabled = false;
  return this;
};

DPHistory.prototype.enable = function(){
  this.enabled = true;
  return this;
};

DPHistory.prototype.undo = function(noFire){
    this.canRedo = true;
    var _action = this.stack[this.current];
    this.current--;
  this.processing = true;
    _action.undo.call(this.editor,_action);
  this.processing = false;
    if(this.current == 0){
        this.canUndo = false;
    }
    if(!noFire){
      this.activeAction = this.stack[this.current];
      this.fire("changed",{action: _action});
    }
  return this;
};

DPHistory.prototype.goto = function(index){
    if(index == this.current)return;
    if(index < this.current){
        for(var i = this.current - index ;i--; ){
            this.undo(true);
        }
    }if(index > this.current){
        for(var i = index - this.current ;i--; ){
            this.redo(true);
        }
    }
  this.activeAction = this.stack[this.current];
  this.fire("changed",{action: this.activeAction});
  return this;
};

DPHistory.prototype.redo = function(noFire){
    if(this.current == this.stack.length - 1){
        return;
    }
  this.processing = true;
    this.canUndo = true;
    this.current++;
    var _action = this.stack[this.current];

    _action.redo.call(this.editor,_action);

    if(this.current == this.stack.length - 1){
        this.canRedo = false;
    }
  this.processing = false;
  if(!noFire) {
    this.activeAction = this.stack[this.current];
    this.fire("changed",{action: _action});
  }
  return this;
};

Object.assign(DPHistory.prototype, Observable)
// module.exports = DPHistory;
export default DPHistory;

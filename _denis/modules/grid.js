'use strict';

/**
 * Aligment library for FabricJS
 *
 *
 *
 * @author Denis Ponomarev
 * @email den.ponomarev@gmail.com
 */
fabric.Grid = function (options){
  // this.canvas = canvas;
  // let w = canvas.originalWidth || canvas.width;
  // let h = canvas.originalHeight || canvas.height;
  //
  // this.rect = fabric.util.getRect(w,h,canvas.offsets);
  //
  // for(let prop in options){
  //   this[prop] = options[prop];
  // }
  //
  // this.createAligmentLines(canvas);
  //
  // // for(let i in this.canvas._objects){
  // //   this.applySnap(this.canvas._objects[i]);
  // // }
  //
  // let _gs = this;
  //
  // (this.canvas.wrapperEl || this.canvas.lowerCanvasEl).addEventListener("mousedown",function(){
  //   window.addEventListener("mouseup",_gs._window_mouse_up.bind(_gs));
  // });
};


fabric.util.object.extend(fabric.Canvas.prototype, {
  grid: false,
  getGrid(){
    return this.editor ? this.editor.grid : this.grid;
  },
  getGridSize(){
    return this.editor.gridSize;
  },
  renderGrid (ctx){
    ctx.save();
    ctx.beginPath();
    let w = this.originalWidth || this.width;
    let h = this.originalHeight || this.height;
    let v = this.viewportTransform;
    let scale = v[0];
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
    ctx.lineWidth = 1 / scale;
    ctx.globalAlpha = .4;
    ctx.strokeStyle = this.editor.gridColor;

    let size = this.getGridSize();

    let _gridOffsetY = (size - h % size) / 2,
        _gridOffsetX = (size - w % size) / 2;

    for (let y = size - _gridOffsetY; y  <= h - 1; y += size) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }

    for (let x = size - _gridOffsetX; x <= w - 1; x += size) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    //
    // ctx.moveTo(this.offsets.left,0);
    // ctx.lineTo(this.offsets.left,h);
    //
    // ctx.moveTo(w - this.offsets.right,0);
    // ctx.lineTo(w - this.offsets.right,h);
    //
    // ctx.moveTo(0,this.offsets.top);
    // ctx.lineTo(w,this.offsets.top);
    //
    // ctx.moveTo(0,h - this.offsets.bottom);
    // ctx.lineTo(w,h - this.offsets.bottom);

    ctx.stroke();
    ctx.restore();
  },
  renderOrder: fabric.util.a.insertBefore(fabric.Canvas.prototype.renderOrder,"controls","grid"),
  layers: Object.assign(fabric.Canvas.prototype.layers,{
    grid: {
      render: function (ctx) {
        if(this.editor && this.editor.grid){
          this.renderGrid(ctx);
        }
      }
    }
  })
});

Object.assign(fabric.Editor.prototype, {
  grid: false,
  gridSize: 100,
  gridColor: "#777777",
  setGrid(value){
    this.grid = value;
    this.canvas.renderAll();
  }
});

// WEBPACK FOOTER //
// src/modules/grid.js

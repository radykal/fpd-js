const rIntervals = [];
for (let i = 0.1; i < 1E5; i *= 10) {
  rIntervals.push(i);
  rIntervals.push(2 * i);
  rIntervals.push(5 * i);
}

fabric.Ruler = fabric.util.createClass({
  initialize: function (options) {
    this.canvas =options.canvas;
    this.type = options.type;
    if(options.size)this.size = options.size;
    if(options.color)this.color = options.color;
    let size;
    if (options.type === "vertical") {
      size = {
        height:  $(this.canvas.wrapperEl).height(),
        width: this.size
      };
    } else {
      size = {
        width:  $(this.canvas.wrapperEl).width(),
        height: this.size
      };
    }
    this.canvasElement = fabric.util.createCanvasElement(size);
    this.canvasElement.classList.add("ruler-" + options.type);
    this.canvas.wrapperEl.appendChild(this.canvasElement);
    // this.rulerContext = this.canvasElement.getContext('2d');
    // let corner = document.createElement("div");
    // // corner.classList.add("ruler-corner");
    // this.canvas.wrapperEl.appendChild(corner);

    // this.render();
    this.render();
    this.canvas.on({
      'viewport:scaled changed modified loading:end viewport:translate' : () =>{
        this.render();
      }
    })
  },
  size: 15,
  orientation: "revert",
  font: "9px sans-serif",
  delimeters: [50, 10, 5, 1],
  render: function () {
    this.position = $(this.canvasElement).position();

    let dim = (this.type === "vertical" ? "y" : "x"),
      zoom = this.canvas.getZoom(),
      offset = (this.type === "vertical" ? this.canvas.viewportTransform[5] : this.canvas.viewportTransform[4]);

    // const units = getTypeMap();
    const unit = 1;//units["px"]; // 1 = 1px

    const isX = (dim === "x");
    const lentype = isX ? 'width' : 'height';
    const contentDim = this.canvas[lentype];
    this.canvasElement[lentype] = this.canvas[lentype];

    // Set the canvas size to the width of the container
    const totalLen = this.canvasElement[lentype];
    let ctx = this.canvasElement.getContext('2d');
    ctx.fillStyle = this.color;

    const uMulti = unit * zoom;

    // Calculate the main number interval
    const rawM = 50 / uMulti;
    let multi = 1;
    for (let i = 0; i < rIntervals.length; i++) {
      let num = rIntervals[i];
      multi = num;
      if (rawM <= num) {
        break;
      }
    }

    const bigInt = multi * uMulti;

    ctx.font = this.font;

    let rulerD = ((offset  / uMulti) % multi ) * uMulti - bigInt ;//((offset / uMulti) % multi) * uMulti + offset;
    let labelPos = rulerD  - bigInt + contentDim - offset;

    // draw big intervals
    // let ctxNum = 0;
    while (rulerD < totalLen) {
      labelPos += bigInt;

      const curD = Math.round(rulerD) - 0.5;
      if (isX) {
        ctx.moveTo(curD, 15);
        ctx.lineTo(curD, 0);
      } else {
        ctx.moveTo(15, curD);
        ctx.lineTo(0, curD);
      }

      let num = (labelPos - contentDim) / uMulti;
      let label;
      if (multi >= 1) {
        label = Math.round(num);
      } else {
        const decs = String(multi).split('.')[1].length;
        label = num.toFixed(decs);
      }

      // Change 1000s to Ks
      if (label !== 0 && label !== 1000 && label % 1000 === 0) {
        label = (label / 1000) + 'K';
      }

      if (isX) {
        ctx.fillText(label, rulerD + 2, 8);
      } else {
        // draw label vertically
        const str = String(label).split('');
        for (let i = 0; i < str.length; i++) {
          ctx.fillText(str[i], 1, (rulerD + 9) + i * 9);
        }
      }

      const part = bigInt / 10;
      // draw the small intervals
      for (let i = 1; i < 10; i++) {
        let subD = Math.round(rulerD + part * i) + 0.5;

        // odd lines are slighly longer
        const lineNum = (i % 2) ? 12 : 10;
        if (isX) {
          ctx.moveTo(subD, 15);
          ctx.lineTo(subD, lineNum);
        } else {
          ctx.moveTo(15, subD);
          ctx.lineTo(lineNum, subD);
        }
      }
      rulerD += bigInt;
    }
    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.fill();
  }
});

Object.assign(fabric.StaticCanvas.prototype,{
  guidlinesEnabled: false,
  createGuidline: function(data){
    if(data.y !== undefined){
      if(fabric.Guidline.prototype.wholeCoordinates){
        data.y = data.y && Math.round(data.y);
      }

      // if(!fabric._.findWhere(this.guidlines,{y: data.y})){
      if(!this.guidlines.find(item => item.y === data.y )){
        let gl = new fabric.Guidline({y: data.y});
        this.add(gl);
      }
    }else if(data.x !== undefined){
      if(fabric.Guidline.prototype.wholeCoordinates){
        data.x = data.x && Math.round(data.x);
      }
      if(!this.guidlines.find(item => item.x === data.x )){
        let gl = new fabric.Guidline({x: data.x});
        this.add(gl);
      }
    }
  },
  setGuidlines: function(guidlines){
    this.guidlines = guidlines;
    if(guidlines && this.guidlinesEnabled){
      // this.guidlines = [];
      for(let i in guidlines){
        this.createGuidline(guidlines[i])
      }
    }
  },
  guidlines: false,
  eventListeners:{
    "viewport:scaled" : function(){
      this.guidlines.forEach(function(gl){
        if(gl.x){
          gl.width = Math.ceil(10 / gl.canvas.viewportTransform[0]);
          if(gl.width % 2){
            gl.width++;
          }
          gl.left = gl.x - gl.width/2;
        }
        if(gl.y){
          gl.height = Math.ceil(10 / gl.canvas.viewportTransform[0]);
          if(gl.height % 2){
            gl.height++;
          }
          gl.top = gl.y - gl.height/2;
        }
      })
    }
  },
  setRulers: function(value){
    if(!value){
      this.wrapperEl.classList.remove("rulers-enabled");
      if(this.vRuler){
        this.wrapperEl.removeChild(this.vRuler.canvasElement);
        delete this.vRuler;
      }
      if(this.hRuler){
        this.wrapperEl.removeChild(this.hRuler.canvasElement);
        delete this.hRuler;
      }
      return;
    }
    if(!this.wrapperEl){
      return;
    }
    this.wrapperEl.classList.add("rulers-enabled");
    this.rulers = value;
    if(value === true || value.vertical){

      this.vRuler = new fabric.Ruler({
        canvas: this,
        type: "vertical",
        color: value.vertical && value.vertical.color || "black"
      });
    }
    if(value === true || value.horizontal) {
      this.hRuler = new fabric.Ruler({
        canvas: this,
        type: "horizontal",
        color: value.horizontal && value.horizontal.color || "black"
      });
    }

    this.guidlines = [];

    let _canvas = this;

    if(this.guidlinesEnabled){
      this.hRuler.canvasElement.onclick  = function(e){
        let pointer = _canvas.getPointer(e);
        _canvas.createGuidline({x : pointer.x })
      };

      this.vRuler.canvasElement.onclick  = function(e){
        let pointer = _canvas.getPointer(e);
        _canvas.createGuidline({y : pointer.y })
      };
    }
  }
});

Object.assign(fabric.Editor.prototype, {
  rulers: false,
  setRulers(value){
    this.rulers = value;
    this.canvas.setRulers(value)
  }
});

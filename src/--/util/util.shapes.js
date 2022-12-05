import {traceContour} from "../../plugins/potrace.js";
import {roundPathCorners} from "../../plugins/rounding.js";


let lib = {
  parsePath: function(path) {
    var commandLengths = {
          m: 2,
          l: 2,
          h: 1,
          v: 1,
          c: 6,
          s: 4,
          q: 4,
          t: 2,
          a: 7
        },
        repeatedCommands = {
          m: 'l',
          M: 'L'
        };

    let pathArray = path.constructor === String? path.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi): path;

    var result = [],
        coords = [],
        currentPath,
        parsed,
        re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/ig,
        match,
        coordsStr;

    for (var i = 0, coordsParsed, len = pathArray.length; i < len; i++) {
      currentPath = pathArray[i];

      coordsStr = currentPath.slice(1).trim();
      coords.length = 0;

      while ((match = re.exec(coordsStr))) {
        coords.push(match[0]);
      }

      coordsParsed = [currentPath.charAt(0)];

      for (var j = 0, jlen = coords.length; j < jlen; j++) {
        parsed = parseFloat(coords[j]);
        if (!isNaN(parsed)) {
          coordsParsed.push(parsed);
        }
      }

      var command = coordsParsed[0],
          commandLength = commandLengths[command.toLowerCase()],
          repeatedCommand = repeatedCommands[command] || command;

      if (coordsParsed.length - 1 > commandLength) {
        for (var k = 1, klen = coordsParsed.length; k < klen; k += commandLength) {
          result.push([command].concat(coordsParsed.slice(k, k + commandLength)));
          command = repeatedCommand;
        }
      }
      else {
        result.push(coordsParsed);
      }
    }

    return result;
  },
  scalePath: function (path, x, y) {

    if(y === undefined){
      y = x
    }

    for (let inst of path) {
      switch (inst[0]) {
        case "M":
        case "L":
          inst[1] *= x;
          inst[2] *= y;
          break;
        case "C":
          //C x1 y1, x2 y2, x y (or c dx1 dy1, dx2 dy2, dx dy)
          inst[1]  *= x;
          inst[3]  *= x;
          inst[5]  *= x;

          inst[2]  *= y;
          inst[4]  *= y;
          inst[6]  *= y;
          break;
        case "S":
        case "Q":
          //S x2 y2, x y (or s dx2 dy2, dx dy)
          //Q x1 y1, x y (or q dx1 dy1, dx dy)
          inst[1] *= x;
          inst[3] *= x;
          inst[2] *= y;
          inst[4] *= y;
          break;
        case "A":
          //A rx ry x-axis-rotation large-arc-flag sweep-flag x y
          inst[1] *= x;
          inst[2] *= y;
          inst[6] *= x;
          inst[7] *= y;
          break;
        case "H":
          inst[1] *= x;
          break;
        case "V":
          inst[1] *= y;
          break;
      }
    }
    return path;
  },
  translatePath: function (path, x,y) {

    for (let inst of path) {
      switch (inst[0]) {
        case "M":
        case "L":
          inst[1] += x;
          inst[2] += y;
          break;
        case "C":
          //C x1 y1, x2 y2, x y (or c dx1 dy1, dx2 dy2, dx dy)
          inst[1]  += x;
          inst[3]  += x;
          inst[5]  += x;

          inst[2]  += y;
          inst[4]  += y;
          inst[6]  += y;
          break;
        case "S":
        case "Q":
          //S x2 y2, x y (or s dx2 dy2, dx dy)
          //Q x1 y1, x y (or q dx1 dy1, dx dy)
          inst[1] += x;
          inst[3] += x;
          inst[2] += y;
          inst[4] += y;
          break;
        case "A":
          //A rx ry x-axis-rotation large-arc-flag sweep-flag x y
          inst[1]  += x;
          inst[2] += y;
          inst[6]  += x;
          inst[7] += y;
          break;
        case "H":
          inst[1]  += x;
          break;
        case "V":
          inst[1]  += y;
          break;
      }
    }
    return path;
  },
  parse(path) {
    return fabric.Path.prototype._parsePath.call({path: path.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi)});
  },
  loadShape: async function (shape) {

      if (shape.src && shape.src.endsWith(".svg")) {
        let data = await fabric.util.loadSvg(shape.src);
        // return {
        //   type: "group",
        //   objects: data.objects,
        //   width:  data.options.width,
        //   height: data.options.height
        // }

        return fabric.util.groupSVGElements(data.objects, {
          width: data.options.width,
          height: data.options.height
        });

      } else if (shape.src) {
        //accept colors and shadow parts using alpha channel
        let colorMatch = [ 0, 0, 0, 0.8];
        // remove paths less then 1 px,
        let image = await fabric.util.loadImage(shape.src);
        //get image contour path ,completely smooth
        let originalObjectContourPath
        // fabric.Pathfinder.getContours(shape.src, originalObjectContourPath => {
        let path = traceContour(image,{turdsize: 1, colorMatch, alphamax: 0 })

        return {
          type: "path",
          path: path
        }
      }
      return shape;
  },
  makePath: function (shape) {

    let path;
    if (shape.path) {
      path = shape.path;
    }
    else if (shape.paths) {
      let _fabric_shape = fabric.util.groupSVGElements(shape.paths, shape);
      //todo
      path = _fabric_shape.getCombinedPath();
    }
    if (shape.shape === "star") {
      path = lib.star(shape);
    }
    if (shape.points) {
      path = lib.polyline(shape);
    } else if (shape.radius) {
      path = lib.roundedRect(shape);
    } else {
      path = lib.rect(shape);
    }
    if (path.constructor === String) {
      return lib.parse(path);
    } else {
      return path
    }
  },
  circle: function(shape){
    //  https://www.smashingmagazine.com/2019/03/svg-circle-decomposition-paths/
    let R = shape.radius;
    return ["M", shape.offsetX, shape.offsetY, "a", R, R, 0,1,0, -(R * 2), 0, "a", R, R ,0 ,1,0 ,R * 2, 0]

  },
  /**
   * Generate Star-shape SVG Path
   * @param innerRadius
   * @param outerRadius
   * @param rays
   * @param startAngle
   * @param offsetX
   * @param offsetY
   * @returns {Array}
   */
  star: function (shape) {
    let inner = shape.innerRadius !== undefined
    let angle = Math.PI;
    let path = [];
    if (shape.angle ) {
      angle += shape.angle;
    }
    let step = 2 * Math.PI / (inner ? shape.rays * 2: shape.rays );
    for (let i = 0; i < shape.rays; i++) {
      path.push(i ? "L" : "M")
      path.push( Math.sin(angle) * shape.outerRadius + shape.offsetX, Math.cos(angle) * shape.outerRadius + shape.offsetY);
      angle += step;
      if(inner){
        path.push("L")
        path.push( Math.sin(angle) * shape.innerRadius + shape.offsetX, Math.cos(angle) * shape.innerRadius + shape.offsetY);
        angle += step;
      }
    }
    path.push("Z");

    if(shape.cornerRadius){
      path =  roundPathCorners(path,shape.cornerRadius )
    }

    return path;
  },
  /**
   *
   * @param o {number,number,number,number}- offsets from top.right.bottom and left
   * @returns {string}
   //  */
  // innerRect: function(o) {
  //   return ['M', o[3], o[0], 'L', 100 - o[1], o[0], 'L', 100 - o[1], 100 - o[2], 'L', o[3], 100 - o[2], 'z'].join(" ");
  // },

  /**
   *
   * @param options.radius          [0,0,0,0,0,0,0,0]
   * @param options.radius_units   [1,1,1,1,1,1,1,1];
   * @param options.width
   * @param options.height
   * @returns {string}
   */
  rect: function (options) {
    let o = lib._getOffsetsData(options);


    if(options.left){
      o.l += options.left;
    }

    if(options.top){
      o.t += options.top;
    }

    return `M ${o.l} ${o.t} h ${o.w} v ${o.h} h ${-o.w} z`;
  },
  _get_point(value, relativeWidth) {
    if (value < 0) {
      value = w - r - value;
    }
    else if (value > 1) {
      value += l;
    }
    else {
      value *= w;
    }
  },
  /**
   *
   * @param x
   * @param o {offsetsData}
   * @private
   */
  _getXPoint(x, o) {
    if(o.u === "mixed"){
      if (x < 0) return o.w - o.r - x; //absolute negative
      if (x > 1) return x + o.l; //absolute
      return x * o.w;
    }
    if(o.u === "absolute"){
      if (x < 0) return o.w - o.r - x;
      return x + o.l; //absolute
    }
    if(o.u === "relative"){
      return x * o.w;
    }
    if(o.u === "percents"){
      return x/100 * o.w;
    }
  },
  /**
   *
   * @param y
   * @param o {offsetsData}
   * @private
   */
  _getYPoint(y, o) {

    if(o.u === "mixed"){
      if (y < 0) return o.h - o.b - y;
      if (y > 1) return y + o.t;
      return y * o.h;
    }
    if(o.u === "absolute"){
      if (y < 0) return o.h - o.b - y;
      return y + o.t;
    }
    if(o.u === "relative"){
      return y * o.h;
    }
    if(o.u === "percents"){
      return y/100 * o.h;
    }
  },
  _getOffsetsData(options) {
    let o = options.offsets;
    let units = options.units || "mixed";
    if(!options.height){options.height = 100}
    if(!options.width){options.width = 100}
    if(!o){
      o = [0, 0, 0, 0];
    }
    else if(o.constructor === Number){
      o = [o, o, o, o]
    }
    else if(o.constructor === Object){
      o = [o.top || 0, o.right || 0, o.bottom || 0, o.left || 0]
    }


    let t, r, b, l;
    if(units === "mixed"){
      t = o[0] < 1 ? o[0] * options.height : o[0];
      r = o[1] < 1 ? o[1] * options.width : o[1];
      b = o[2] < 1 ? o[2] * options.height : o[2];
      l = o[3] < 1 ? o[3] * options.width : o[3];
    }else if(units === "absolute"){
      t = o[0];
      r = o[1];
      b = o[2];
      l = o[3];
    }else if(units === "relative"){
      t = o[0] * options.height;
      r = o[1] * options.width ;
      b = o[2] * options.height;
      l = o[3] * options.width ;
    }else if(units === "percents"){
      t = o[0]/100 * options.height;
      r = o[1]/100 * options.width ;
      b = o[2]/100 * options.height;
      l = o[3]/100 * options.width ;
    }


    let w = options.width - l - r,
        h = options.height - t - b;

    return {t: t, r: r, b: b, l: l, w: w, h: h, u: units}

  },
  /**
   *
   * @param options
   * @param options.offsets {Array<[top,right,bottom,left]>} - массив координат x ,y.   При величине <= 1, величина считается заданной в относительных координатах. todo роблема при оффсет = 1px
   * @param options.points {Array<number>} - массив координат x ,y.   При величине <= 1, величина считается заданной в относительных координатах. todo роблема при оффсет = 1px
   * @param options.height {number} - высота поля, описанного вокруг фигуры
   * @param options.width  {number}  - ширина поля, описанного вокруг фигуры
   * @returns {string}
   */
  polyline: function (options) {
    let offsetsData = lib._getOffsetsData(options);
    let p = options.points.slice();

    //при 0<=x<=1 - относительные координаты/ >1 , <0 - абсолютные относительно ширины и высоты
    for (let i = 0; i < options.points.length; i += 2) {
      p[i] = lib._getXPoint(p[i], offsetsData);
      p[i + 1] = lib._getYPoint(p[i + 1], offsetsData);
    }

    let path = "M " + p[0] + " " + p[1];
    for (let i = 2; i < p.length; i += 2) {
      path += " L " + p[i] + " " + p[i + 1]
    }
    path += "z";
    return path;
  },
  /**
   *
   * @param options
   * @param options.points {Array<number>} - массив координат x ,y.   При величине <= 1, величина считается заданной в относительных координатах. todo роблема при оффсет = 1px
   * @param options.height {number} - высота поля, описанного вокруг фигуры
   * @param options.width  {number}  - ширина поля, описанного вокруг фигуры
   * @returns {string}
   */
  roundedRect: function (options) {
    let o = lib._getOffsetsData(options);
    let br = options.radius;
    // let bru = options.radius_units || [1,1,1,1,1,1,1,1];
    // let o = options.offsets || [0,0,0,0];

    if (br.constructor === Number) {
      br = [br, br, br, br, br, br, br, br]
    }
    // if(bru.constructor === Number){
    //   bru = [bru,bru,bru,bru,bru,bru,bru,bru]
    // }

    var x1 = o.l, y1 = o.t;
    var x2 = options.width - o.r, y2 = options.height - o.b;
    // let s = {
    //   "top-left-h":     lib._getYPoint( br[0],o), //br[0] * (bru[0] ? h / 100 : 1) + o[0],
    //   "top-left-w":     lib._getXPoint( br[1],o) , //br[1] * (bru[1] ? w / 100 : 1) + o[1],
    //   "top-right-h":    lib._getYPoint( br[2],o), //br[2] * (bru[2] ? h / 100 : 1) + o[0],
    //   "top-right-w":    o.w - lib._getXPoint(br[3],o), //br[3] * (bru[3] ? w / 100 : 1) + o[1],
    //
    //   "bottom-right-w": o.w - lib._getXPoint(br[4],o), //br[4] * (bru[4] ? w / 100 : 1) + o[1],
    //   "bottom-right-h": o.h - lib._getYPoint(br[5],o), //br[5] * (bru[5] ? h / 100 : 1) + o[0],
    //   "bottom-left-w":  lib._getXPoint( br[6],o), //br[6] * (bru[6] ? w / 100 : 1) + o[1],
    //   "bottom-left-h":  o.h - lib._getYPoint(br[7],o), //br[7] * (bru[7] ? h / 100 : 1) + o[0]
    // };

    // return [
    //   "M", x1, s["top-left-h"],
    //   "C", x1, s["top-left-h"], x1, y1, s["top-left-w"], y1,
    //   "H", s["top-right-w"],
    //   "C", s["top-right-w"], y1, x2, y1, x2, s["top-right-h"],
    //   "V", s["bottom-right-h"],
    //   "C", x2, s["bottom-right-h"], x2, y2, s["bottom-right-w"], y2,
    //   "H", s["bottom-left-w"],
    //   "C", s["bottom-left-w"], y2, x1, y2, x1, s["bottom-left-h"],
    //   "Z"
    // ].join(" ");


 // <path d="M100,100 h200 a20,20 0 0 1 20,20 v200 a20,20 0 0 1 -20,20 h-200 a20,20 0 0 1 -20,-20 v-200 a20,20 0 0 1 20,-20 z" />
  //    m100,100: move to point(100,100)
    //h200: draw a 200px horizontal line from where we are
  //  a20,20 0 0 1 20,20: draw an arc with 20px X radius, 20px Y radius, clockwise, to a point with 20px difference in X and Y axis
   // v200: draw a 200px vertical line from where we are
  ///  a20,20 0 0 1 -20,20: draw an arc with 20px X and Y radius, clockwise, to a point with -20px difference in X and 20px difference in Y axis
   // h-200: draw a -200px horizontal line from where we are
   // a20,20 0 0 1 -20,-20: draw an arc with 20px X and Y radius, clockwise, to a point with -20px difference in X and -20px difference in Y axis
  //  v-200: draw a -200px vertical line from where we are
   // a20,20 0 0 1 20,-20: draw an arc with 20px X and Y radius, clockwise, to a point with 20px difference in X and -20px difference in Y axis
  //  z: close the path




    let height = o.h, width = o.w;
      var s = {
        "top-left-h":     lib._getYPoint( br[0],o),//* height,
        "top-left-w":     lib._getXPoint( br[1],o),//* width ,
        "top-right-h":    lib._getYPoint( br[2],o),//* height,
        "top-right-w":    lib._getXPoint( br[3],o),//* width ,
        "bottom-right-w": lib._getXPoint( br[4],o),//* width ,
        "bottom-right-h": lib._getYPoint( br[5],o),//* height,
        "bottom-left-w":  lib._getXPoint( br[6],o),//* width ,
        "bottom-left-h":  lib._getYPoint( br[7],o),// * height
      };

      let path = [
        ["M", 0, s["top-left-h"]],
        ["C", 0, s["top-left-h"], 0, 0,s["top-left-w"], 0],
        ["H", width - s["top-right-w"]],
        ["C", width - s["top-right-w"], 0, width, 0, width, s["top-right-h"]],
        ["V", height - s["bottom-right-h"]],
        ["C", width, height - s["bottom-right-h"], width, height, width - s["bottom-right-w"], height],
        ["H", s["bottom-left-w"]],
        ["C", s["bottom-left-w"], height, 0, height, 0, height - s["bottom-left-h"]],
        ["Z"]
      ];

      lib.translatePath(path,o.l,o.t);

      if(options.left || options.top){
        lib.translatePath(path,options.left || 0, options.top || 0);
      }

      return path.join(" ");
  }
}

fabric.util.shapes = lib
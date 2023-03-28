
fabric.util.svgMediaRoot = "";

export function getElementSvgSrc(element) {

  if (!element) {
    return '';//fallback
  }
  let _src = element._src || element.src;

  if (!_src && element.toDataURL) {
    return element.toDataURL();
  }
  if (!_src) {
    console.error("SRC IS UNDEFINED!");
    return '';
  }

  if (_src.startsWith("data:image")) {
    return _src;
  }


  if (fabric.inlineSVG) {

    if(fabric.resources && fabric.resources[element.src]){
      return fabric.resources[element.src].url;
    }

    let canvas = fabric.util.createCanvasElement();
    canvas.width = element.width;
    canvas.height = element.height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(element, 0, 0);
    return canvas.toDataURL();
  }
  //
  //
  // fetch(element.src)
  //     .then( response => response.blob() )
  //     .then( blob =>{
  //       var reader = new FileReader() ;
  //       reader.onload = function(){
  //         console.log(this.result)
  //       }
  //       reader.readAsDataURL(blob) ;
  //     }) ;


  // fetch(element.src)
  //     .then(response => response.text())
  //     .then(data => {
  //       console.log(data)
  //
  //       function b64EncodeUnicode(str) {
  //         return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
  //           return String.fromCharCode(parseInt(p1, 16))
  //         }))
  //       }
  //       let encoded = "data:image/svg+xml;base64," + b64EncodeUnicode(data);
  //       console.log(encoded)
  //     });


  if (_src.startsWith(fabric.util.svgMediaRoot)) {
    _src = _src.replace(fabric.util.svgMediaRoot, "");
  }
  return fabric.util.string.escapeXml(_src);
}

fabric.Editor && Object.assign(fabric.Editor.prototype, {
  async exportSVGData(){
    fabric.Text.prototype.replaceIncompatibleSymbolsEnabled = true;

    if(!fabric.isLikelyNode){
      let fList = this.getUsedFonts()
      fabric.fonts.fallbacks.forEach(fi => {
        if(!fList.includes(fi)){
          fList.push(fi)
        }
      })
      await fabric.fonts.waitForWebfontsTobeLoaded(fList)
      await fabric.fonts.loadBinaryFonts(fList);
      // editor = await this.getExportEditor();
    }
    // else{
    //   editor = this
    // }

    fabric.pdf.setupSvgExport();

    let svgArray = []
    for (let pageNum = 0; pageNum < this.slides.length; pageNum++) {
      let slide = this.slides[pageNum]
      svgArray.push({
        width: slide.width,
        height: slide.height,
        svg: slide.toSVG()
      })
    }

    fabric.pdf.resolveSvgExport();
    fabric.Text.prototype.replaceIncompatibleSymbolsEnabled = false;

    return svgArray;
  },
  toSVG: function (options, reviver) {

    let slide = this.slides[0];
    if (this.slides.length === 1) {
      return slide.toSVG(options, reviver);
    }

    let _w = slide.originalWidth || slide.width,
      _h = slide.originalHeight || slide.height;

    if (slide.originalWidth) {
      this.svgViewportTransformation = false;
    }

    options || (options = {});

    let markup = [];
    if (!slide.suppressPreamble) {
      slide._setSVGPreamble(markup, options);
    }
    slide._setSVGHeader(markup, options);

    markup.push("<pageSet>");

    for (let i in this.slides) {
      markup.push("<page>");
      markup.push(this.slides[i].getSVGBody(options, reviver));
      markup.push("</page>");
    }

    markup.push("</pageSet>");

    markup.push('</svg>');

    if (this.originalWidth) {
      this.width = _w;
      this.height = _h;
    }
    return markup.join('');

  }
});


fabric.Object.prototype.rasterizeSvgShadow = false;
fabric.Object.prototype.svgShadowPadding = 0;


/**
 * Returns filter for svg shadow
 * @return {String}
 */
fabric.Object.prototype.getSvgFilter = function () {
  return (this.shadow && !this.rasterizeSvgShadow) ? 'filter: url(#SVGID_' + this.shadow.id + ');' : '';
};


fabric.Shadow.prototype.toSVGRaster = function (target) {
  let padding = target.svgShadowPadding;
  let shadowWidth = target.width + this.blur * 2 + padding * 2;
  let shadowHeight = target.height + this.blur * 2 + padding * 2;

  let canvas = fabric.document.createElement("canvas");
  let ctx = canvas.getContext('2d');
  let scaling = target.getObjectScaling();

  canvas.width = shadowWidth * scaling.scaleX;
  canvas.height = shadowHeight * scaling.scaleY;
  ctx.scale(scaling.scaleX, scaling.scaleY);

  ctx.translate(
      target.width / 2 + this.blur - this.offsetX + padding,
      target.height / 2 + this.blur - this.offsetY + padding);

  target.drawObject(ctx);

  let canvas2 = fabric.document.createElement("canvas");
  canvas2.width = canvas.width;
  canvas2.height = canvas.height;
  let ctx2 = canvas2.getContext('2d');

  //translate to draw only shadow without object
  this.offsetX += canvas.width;
  this.offsetY += canvas.height;
  target._setShadow(ctx2, target);
  ctx2.drawImage(canvas, -canvas.width, -canvas.height);
  this.offsetX -= canvas.width;
  this.offsetY -= canvas.height;
  let url = canvas2.toDataURL();

  return `
    <g transform="matrix(1 0 0 1 ${this.offsetX} ${this.offsetY})">
      <image preserveAspectRatio="none" xlink:href="${url}" ${target.getSvgTransform(false)}
          x="${-padding - target.width / 2 - this.blur}" y="${-padding - target.height / 2 - this.blur}"
          width="${shadowWidth}" height="${shadowHeight}">
      </image>
    </g>`
};



Object.assign(fabric.StaticCanvas.prototype, {
  creatorString: `Created with Fabric.js ${fabric.version}`,
  /**
   * @private
   */
  _setSVGHeader: function (markup, options) {
    let width = options.width || this.width,
      height = options.height || this.height,
      vpt, viewBox = 'viewBox="0 0 ' + this.width + ' ' + this.height + '" ',
      NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;

    if (options.viewBox) {
      viewBox = 'viewBox="' +
        options.viewBox.x + ' ' +
        options.viewBox.y + ' ' +
        options.viewBox.width + ' ' +
        options.viewBox.height + '" ';
    }
    else {
      if (this.svgViewportTransformation) {
        vpt = this.viewportTransform;
        viewBox = 'viewBox="' +
          fabric.util.toFixed(-vpt[4] / vpt[0], NUM_FRACTION_DIGITS) + ' ' +
          fabric.util.toFixed(-vpt[5] / vpt[3], NUM_FRACTION_DIGITS) + ' ' +
          fabric.util.toFixed(this.width / vpt[0], NUM_FRACTION_DIGITS) + ' ' +
          fabric.util.toFixed(this.height / vpt[3], NUM_FRACTION_DIGITS) + '" ';
      }
    }

    markup.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
            version="1.1" xml:space="preserve" 
            width="${width}" height="${height}" ${viewBox}>
        <desc>${this.creatorString}</desc>
        <defs>
          ${this.createSVGFontFacesMarkup()}
          ${this.createSVGRefElementsMarkup()}
          ${this.createSVGClipPathMarkup(options)}
        </defs>`
    );
  },
  _toSVG_overwritten: fabric.StaticCanvas.prototype.toSVG,
  suppressPreamble: true,
  toSVG: function (options, reviver) {
    let _w = this.width, _h = this.height;
    if (this.originalWidth) {
      this.svgViewportTransformation = false;
      this.width = this.originalWidth;
      this.height = this.originalHeight;
    }

    options || (options = {});

    let markup = [];

    if (!this.suppressPreamble) {
      this._setSVGPreamble(markup, options);
    }
    this._setSVGHeader(markup, options);
    markup.push(this.getSVGBody(options, reviver));

    markup.push('</svg>');

    if (this.originalWidth) {
      this.width = _w;
      this.height = _h;
    }
    return markup.join('');
  },
  _setSVGLayers(markup, reviver) {
    let forExport = true;
    for (let layerName of this.renderOrder) {
      let l = this.layers[layerName];
      if (!l) continue;
      if (l.visible === false || (forExport && !l.export)) {
        continue;
      }
      l.renderSvg(markup, reviver);
    }
  },
  getSVGBody(options, reviver) {

    let _w = this.width,
      _h = this.height;

    if (this.originalWidth) {
      this.width = this.originalWidth;
      this.height = this.originalHeight;
    }
    options = options || {};

    let scaleX = options.scaleX || (options.width ? options.width / this.width : 1),
      scaleY = options.scaleY || (options.height ? options.height / this.height : 1),
      _l = (options.left || 0),
      _t = (options.top || 0),
      angle = (options.angle || 0),
      clipPath = "";

    if (options.clipPath) {
      clipPath = `clip-path: url(#${options.clipPath});`;
    }

    let transform = "";
    if (angle !== 0) {
      transform += `rotate(${angle}) `;

      if (angle == -180 || anglr == 180) {
        transform += `translate(-${this.width} -${this.height}) `;

      }
    }
    let transleteTransform = "";
    if (_l !== 0 || _t !== 0) {
      transleteTransform += `translate(${_l} ${_t}) `;
    }
    let scaleTransform = "";
    if (scaleX !== 1 || scaleY !== 1) {
      scaleTransform += `scale(${scaleX} ${scaleY}) `;
    }

    let markup = [`<g transform="${scaleTransform} ${transleteTransform}"><g transform="${transform}" style="${clipPath}" id="${options.clipPath}">`];

    if (this.layers) {
      this._setSVGLayers(markup, reviver);
    } else {
      this._setSVGBgOverlayColor(markup, 'background');
      this._setSVGBgOverlayImage(markup, 'backgroundImage', reviver);
      this._setSVGObjects(markup, reviver);
      this._setSVGBgOverlayColor(markup, 'overlay');
      this._setSVGBgOverlayImage(markup, 'overlayImage', reviver);
    }

    markup.push('</g></g>');

    if (this.originalWidth) {
      this.width = _w;
      this.height = _h;
    }
    return markup.join("");
  }
});

fabric.inlineSVG = false;


fabric.util.object.extend(fabric.Object.prototype, {
  _createBaseSVGMarkup: function (objectMarkup, options) {
    options = options || {};

    let shadowInfo = "";
    if (this.shadow/* && options.withShadow*/) { // if(options.withShadow){
      if (!this.rasterizeSvgShadow) {
        shadowInfo = `style="filter: url(#SVGID_${this.shadow.id })"`;
      }
    }

    let absoluteClipPath = this.clipPath && this.clipPath.absolutePositioned;

    if (this.clipPath) {
      this.clipPath.clipPathId = 'CLIPPATH_' + fabric.Object.__uid++;
    }

    let commonPieces = [
      options.noStyle ? '' : 'style="' + this.getSvgStyles(true) + '" ',  //styleInfo
      this.strokeUniform ? 'vector-effect="non-scaling-stroke" ' : '', //vectorEffect
      options.noStyle ? '' : this.addPaintOrder(), ' ',
      options.additionalTransform ? 'transform="' + options.additionalTransform + '" ' : '',
    ].join('');
    // insert commons in the markup, style and svgCommons
    objectMarkup[objectMarkup.indexOf('COMMON_PARTS')] = commonPieces;


    let clipPathString = "";
    if (this.clipPath) {
      this.clipPath.scaleX /= this.scaleX;
      this.clipPath.scaleY /= this.scaleY;


      // let additionalTransformMatrix = `scale(${1 / this.scaleX}, ${1 / this.scaleY})`;
      // let additionalTransformTranslate = `translate(${-this.clipPath.cacheTranslationX}, ${-this.clipPath.cacheTranslationY})`;
      clipPathString =
        `<clipPath id="${this.clipPath.clipPathId}">
            ${this.clipPath.toClipPathSVG(options.reviver)}
        </clipPath>`;

      this.clipPath.scaleX *= this.scaleX;
      this.clipPath.scaleY *= this.scaleY;
    }

    let clipPathInfo = this.clipPath ? 'clip-path="url(#' + this.clipPath.clipPathId + ')" ' : '';

    let baseMarkup = `
      ${this.shadow ? this.rasterizeSvgShadow ? this.shadow.toSVGRaster(this) : this.shadow.toSVG(this) : ""}
      ${clipPathString}
      <g ${shadowInfo}>
        ${this.deco && this.deco.bottom ? this._decoEl.toSVG() : ""}
        <g ${clipPathInfo}>
          ${this.fill && this.fill.toLive && this.fill.toSVG(this) || ""}
          ${this.stroke && this.stroke.toLive && this.stroke.toSVG(this) || ""}
          ${objectMarkup.join('')}
        </g>
        ${this.deco && !this.deco.bottom ? this._decoEl.toSVG() : ""}
      </g>
        `

    let markup = ``
    if(this._puzzleOptions){
      let tilesWidth = this._calc.xvectorsAbs.reduce((acc,cur) => acc + cur.x,0)
      let tilesHeight = this._calc.yvectorsAbs.reduce((acc,cur) => acc + cur.y,0)
      for(let y =0 ;y < this._puzzleOptions.offsetsY.length; y++) {
        for (let x = 0; x < this._puzzleOptions.offsetsX.length; x++) {
          let offset = this._getPuzzleOffset(x,y,true)
          // rotate(${this.angle}) translate(${offset.x} ${offset.y})

          let matrix = this.calcOwnMatrix().slice();

          matrix[4] += offset.x - this.width/2
          matrix[5] += offset.y - this.height/2
          let svgTransform = fabric.util.matrixToSVG(matrix);

          markup += `
              <pattern id="tile-${this.id}-${x}-${y}" x="0" y="0" width="${tilesWidth}" height="${tilesHeight}" patternUnits="userSpaceOnUse" patternTransform="${svgTransform}">
                <g transform="translate(${this.width/2} ${this.height/2})">
                  ${baseMarkup}
                </g>
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#tile-${this.id}-${x}-${y})"/>
          `
        }
      }
    }
    else{
        markup += `<g ${this.getSvgTransform(false)} >${baseMarkup}</g>`;
    }

    markup = `<g ${this.id ? `id="${this.id}"` : ''}>${markup}</g>`


    //todo if (absoluteClipPath) {
    //   markup = `<g ${shadowInfo} ${}  >${markup}</g>`;
    // }

    return options.reviver ? options.reviver(markup) : markup;
  }
});



Object.assign(fabric.Image.prototype,{
  /**
   * @param filtered {true | element }
   * @returns {*}
   */
  getSvgSrc: function(filtered){
    let element;
    if(filtered){
      if(filtered.constructor === Boolean){
        element = this._element;
      } else {
        element = filtered;
      }
    } else {
      element = this._originalElement;
    }

    return getElementSvgSrc(element);
  }
});

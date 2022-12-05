//copy from fabric.js
function getSvgColorString(prop, value) {
  if (!value) {
    return prop + ': none; ';
  }
  else if (value.toLive) {
    return prop + ': url(#SVGID_' + value.id + '); ';
  }
  else {
    var color = new fabric.Color(value),
      str = prop + ': ' + color.toRgb() + '; ',
      opacity = color.getAlpha();
    if (opacity !== 1) {
      //change the color in rgb + opacity
      str += prop + '-opacity: ' + opacity.toString() + '; ';
    }
    return str;
  }
}


function loadOpenTypeFont(){

  opentype.load('data:font/opentype;base64,' + fObjects[_index].DescryptedFont + '',
    function(err, font) {
      if (err) {
        console.log(err);
      }

      var fItem = {
        FontName: fObjects[_index].FontName,
        fObject: font
      };

      fabric.fontArrayList.push(fItem);

      _index = _index + 1;
      if (_index < fObjects.length) {
        LoadSvgPathFonts(_index);
      }
    });
}



fabric.util.object.extend(fabric.Text.prototype, {
  exportAsPath: false,
  _wrapSVGTextAndBgAsText: fabric.Text.prototype._wrapSVGTextAndBg,
  _wrapSVGTextAndBgAsPath:  function(textAndBg) {
    var noShadow = true;
    return [
      textAndBg.textBgRects.join(''),
      '\t\t<g style="', this.getSvgStyles(noShadow), '"', this.addPaintOrder(), ' >',
        textAndBg.textSpans.join(''),
      '</g>\n'
    ];
  },
  /**
   * @private
   */
  _wrapSVGTextAndBg: function (textAndBg) {
    if(this.exportAsPath){
      return this._wrapSVGTextAndBgAsPath(textAndBg);
    }else{
      return this._wrapSVGTextAndBgAsText(textAndBg)
    }
  },
  _replaceSpecialCharacter: function (text) {
    text = text.replace('&lt;', '<');
    text = text.replace('&gt;', '>');
    text = text.replace('&amp;', '&');
    text = text.replace('&quot;', '"');
    text = text.replace("&apos;", "'");
    return text;
  },
  _createTextCharSpanAsText: fabric.Text.prototype._createTextCharSpan,
  _createTextCharSpanAsPath: function (_char, styleDecl, left, top) {
    var style = fabric.util.object.clone(styleDecl);

    var _x = fabric.util.toFixed(left, fabric.Object.NUM_FRACTION_DIGITS);
    var _y = fabric.util.toFixed(top, fabric.Object.NUM_FRACTION_DIGITS);
    var text = fabric.util.string.escapeXml(_char);

    var svgPath = '';

    if (!style.fontFamily)   style.fontFamily = this.fontFamily;
    if (!style.fontSize)     style.fontSize = this.fontSize;
    if (!style.fontStyle)    style.fontStyle = this.fontStyle;
    if (!style.fontWeight)   style.fontWeight = this.fontWeight;
    if (!style.fill)         style.fill = this.fill;
    if (!style.stroke)       style.stroke = this.stroke;
    if (!style.strokeWidth)  style.strokeWidth = this.strokeWidth;

    var opentypeFont = null;
    for (var i = 0; i < fabric.fontArrayList.length; i++) {
      if (style.fontFamily === fabric.fontArrayList[i].FontName) {
        opentypeFont = fabric.fontArrayList[i].fObject;break;
      }
    }

    if (opentypeFont != null) {
      var txt = this._replaceSpecialCharacter(text);
      var path = opentypeFont.getPath(txt, _x, _y, style.fontSize);
      svgPath = path.toSVG();
    }

    var term = '; ',
        strokeWidth = styleDecl.strokeWidth ? 'stroke-width: ' + styleDecl.strokeWidth + term : '',
        fill = styleDecl.fill ? getSvgColorString('fill', styleDecl.fill) : '',
        stroke = styleDecl.stroke ? getSvgColorString('stroke', styleDecl.stroke) : '';
    var styleProps = [stroke, strokeWidth, fill].join(''),
        fillStyles = styleProps ? 'style="' + styleProps + '"' : '';

    return [
      '<g ',
      // x="', toFixed(left, NUM_FRACTION_DIGITS), '" y="', toFixed(top, NUM_FRACTION_DIGITS), '" ',
      fillStyles, '>',
      svgPath,
      '</g>'
    ].join('');
  },
  _createTextCharSpan: function (_char, styleDecl, left, top) {
    if(this.exportAsPath) {
      return this._createTextCharSpanAsPath(_char, styleDecl, left, top);
    }else{
      return this._createTextCharSpanAsText(_char, styleDecl, left, top);
    }
  }
});








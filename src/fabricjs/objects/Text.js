import { fabric } from 'fabric';
fabric.Text.prototype.initialize = (function (originalFn) {

    return function (...args) {

        originalFn.call(this, ...args);
        this._TextInit();
        return this;

    }

})(fabric.Text.prototype.initialize);

fabric.Text.prototype.toSVG = (function (originalFn) {

    return function (...args) {

        if (this.curved && this.path) {
            
            let fontFamily = this.fontFamily.replace(/"/g, "'");
            let fontSize = this.fontSize;
            let fontStyle = this.fontStyle;
            let fontWeight = this.fontWeight;
            let fill = this.fill;
            let letterSpacing = this.letterSpacing / 10 * fontSize;
            let textDecoration = this.textDecoration
            let opacity = this.opacity
            let textStroke = this.stroke
            let textStrokeWidth = this.strokeWidth
            let path = this.path;
            let fillPath = path.fill ? path.fill : "none";
            let strokePath = path.stroke ? path.stroke : "none";
            let strokeWidth = path.strokeWidth ? path.strokeWidth : 0;
            let display = path.visible ? 'block' : 'none';
            // get path length
            let pathData = this.path.path;
            let pathInfo = fabric.util.getPathSegmentsInfo(pathData);
            let pathLength = pathInfo[pathInfo.length - 1].length;

            // reverse pathdata to emulate side="right"
            if (this.pathSide === "right") {
                // clone pathdata for reversing
                pathData = JSON.parse(JSON.stringify(pathData));
                pathData = reversePathData(pathData);
            }
            // get pathdata d string
            let d = pathData.flat().join(" ");

            let id = Math.random().toString(36).substr(2, 9);
            let dominantbaseline = "auto";
            let pathStartOffset = this.pathStartOffset;
            let dy = 0;

            // translate fabric.js baseline offsets to svg dominant baseline values
            if (this.pathAlign === "center") {
                dominantbaseline = "middle";
            } else if (this.pathAlign === "baseline") {
                dominantbaseline = "auto";
            } else if (this.pathAlign === "ascender") {
                dominantbaseline = "hanging";
            } else if (this.pathAlign === "descender") {
                dominantbaseline = "auto";
                dy = (fontSize / 100) * -22;
            }

            let textAnchor = "start";
            if (this.textAlign == "center") {
                textAnchor = "middle";
                pathStartOffset += pathLength / 2;
            }

            if (this.textAlign == "right") {
                textAnchor = "end";
                pathStartOffset += pathLength;
            }

            //----------------------------------------------

            let textPaths = "";
            let offset = pathStartOffset;
            for (let i = 0; i < this.text.length; i++) {
                let letter = this.text[i];
                let text = new fabric.Text(letter, {
                    fontFamily, // Font family
                    fontSize, // Font size in pixels
                  });
                let textPathEl = `<textPath 
                  xlink:href="#textOnPath${id}" 
                  startOffset="${offset < 0 ? offset + pathLength : offset}"
                  dominant-baseline="${dominantbaseline}"
                  dy="${dy}"
                  style="
                    stroke: ${textStroke};
                    stroke-width: ${textStrokeWidth};
                  "
                >
                  ${letter}
                </textPath>`;
                offset += (text.width + 1 + letterSpacing)
                textPaths += textPathEl;
              }

            //----------------------------------------------
            // append texpath to defs or as rendered element
            let textPathEl

            if (
                (fillPath && fillPath !== "none") ||
                (!strokePath && strokePath !== "none")
            ) {
                textPathEl = `<path id="textOnPath${id}" display="${display}" fill="${fillPath}" stroke="${strokePath}" stroke-width="${strokeWidth}" d="${d}" style="display: none"/>`;
            } else {
                textPathEl = `<defs>
          <path id="textOnPath${id}" d="${d}" />
        </defs>`;
            }

            return this._createBaseSVGMarkup(
                this.path?.path
                    ? [
                        textPathEl,
                        `<text 
                font-family="${fontFamily.replace(/"/g, "'")}" 
                fill="${fill}"
                font-size="${fontSize}" 
                font-style="${fontStyle}" 
                font-weight="${fontWeight}"
                letter-spacing="${letterSpacing}"
                style="
                text-decoration: ${textDecoration};
                opacity: ${opacity};
                "
                >
                  ${textPaths}
                </text>`
                    ]
                    : [
                        `<text 
              xml:space="preserve" 
              font-family="${fontFamily}" 
              font-size="${fontSize}" 
              font-style="${fontStyle}" 
              font-weight="${fontWeight}" 
              > 
              ${this.addPaintOrder()}
              ${this.text}
              </text>`
                    ],
                { reviver: args[0], noStyle: true, withShadow: true }
            );


        } else {
            return originalFn.call(this, ...args);
        }

    }

})(fabric.Text.prototype.toSVG);

/**
 * Reverse pathdata
 */
function reversePathData(pathData) {
    // start compiling new path data
    let pathDataNew = [];

    // helper to rearrange control points for all command types
    const reverseControlPoints = (values) => {
        let controlPoints = [];
        let endPoint = [];
        for (let p = 0; p < values.length; p += 2) {
            controlPoints.push([values[p], values[p + 1]]);
        }
        endPoint = controlPoints.pop();
        controlPoints.reverse();
        return [controlPoints, endPoint];
    };

    let closed =
        pathData[pathData.length - 1][0].toLowerCase() === "z" ? true : false;
    if (closed) {
        // add lineto closing space between Z and M
        pathData = addClosePathLineto(pathData);
        // remove Z closepath
        pathData.pop();
    }

    // define last point as new M if path isn't closed
    let valuesLast = pathData[pathData.length - 1];
    let valuesLastL = valuesLast.length;
    let M = closed
        ? pathData[0]
        : ["M", valuesLast[valuesLastL - 2], valuesLast[valuesLastL - 1]];
    // starting M stays the same – unless the path is not closed
    pathDataNew.push(M);

    // reverse path data command order for processing
    pathData.reverse();
    for (let i = 1; i < pathData.length; i++) {
        let com = pathData[i];
        let values = com.slice(1);
        let comPrev = pathData[i - 1];
        let typePrev = comPrev[0];
        let valuesPrev = comPrev.slice(1);
        // get reversed control points and new end coordinates
        let [controlPointsPrev, endPointsPrev] = reverseControlPoints(valuesPrev);
        let [controlPoints, endPoints] = reverseControlPoints(values);

        // create new path data
        let newValues = [];
        newValues = controlPointsPrev.flat().concat(endPoints);
        pathDataNew.push([typePrev, ...newValues]);
    }

    // add previously removed Z close path
    if (closed) {
        pathDataNew.push(["z"]);
    }
    return pathDataNew;
}

/**
 * Add closing lineto:
 * needed for path reversing or adding points
 */
function addClosePathLineto(pathData) {
    let pathDataL = pathData.length;
    let closed = pathData[pathDataL - 1][0] === "Z";
    let M = pathData[0];
    let [x0, y0] = [M[1], M[2]];
    let lastCom = closed ? pathData[pathDataL - 2] : pathData[pathDataL - 1];
    let lastComL = lastCom.length;
    let [xE, yE] = [lastCom[lastComL - 2], lastCom[lastComL - 1]];
    if (closed && (x0 !== xE || y0 !== yE)) {
        pathData.pop();
        pathData.push(["L", x0, y0], ["Z"]);
    }
    return path;
}


fabric.Text.prototype._constrainScale = (function (originalFn) {

    return function (value) {

        value = originalFn.call(this, value);

        if (this.minFontSize !== undefined) {

            const scaledFontSize = parseFloat(Number(value * this.fontSize).toFixed(0));
            if (scaledFontSize < this.minFontSize) {
                return this.minFontSize / this.fontSize;
            }
        }

        if (this.maxFontSize !== undefined) {

            const scaledFontSize = parseFloat(Number(value * this.fontSize).toFixed(0));
            if (scaledFontSize > this.maxFontSize) {
                return this.maxFontSize / this.fontSize;
            }
        }

        return value;

    }

})(fabric.Text.prototype._constrainScale);


fabric.Text.prototype._TextInit = function () {

    const _updateFontSize = (elem) => {

        if (!elem.curved && !elem.uniScalingUnlockable) {

            let newFontSize = elem.fontSize * elem.scaleX;
            newFontSize = parseFloat(Number(newFontSize).toFixed(0));

            elem.scaleX = 1;
            elem.scaleY = 1;
            elem._clearCache();
            elem.set('fontSize', newFontSize);

            if (elem.canvas)
                elem.canvas.fire('elementModify', { element: elem, options: { fontSize: newFontSize } })

        }
    }

    this.on({
        'modified': (opts) => {

            _updateFontSize(this);

        },
    })

}

fabric.Text.prototype._createTextCharSpan = function (_char, styleDecl, left, top) {

    const multipleSpacesRegex = /  +/g;

    //FPD: add text styles to tspan
    styleDecl.fontWeight = this.fontWeight;
    styleDecl.fontStyle = this.fontStyle;

    var shouldUseWhitespace = _char !== _char.trim() || _char.match(multipleSpacesRegex),
        styleProps = this.getSvgSpanStyles(styleDecl, shouldUseWhitespace);

    //FPD: add underlined text
    styleProps += this.textDecoration === 'underline' ? ' text-decoration: underline;' : '';

    let fillStyles = styleProps ? 'style="' + styleProps + '"' : '',
        dy = styleDecl.deltaY, dySpan = '',
        NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;

    if (dy) {
        dySpan = ' dy="' + fabric.util.toFixed(dy, NUM_FRACTION_DIGITS) + '" ';
    }
    return [
        '<tspan x="', fabric.util.toFixed(left, NUM_FRACTION_DIGITS), '" y="',
        fabric.util.toFixed(top, NUM_FRACTION_DIGITS), '" ', dySpan,
        fillStyles, '>',
        fabric.util.string.escapeXml(_char),
        '</tspan>'
    ].join('');


}

fabric.Text.prototype._renderChars = (function (originalFn) {

    return function (...args) {

        originalFn.call(this, ...args);

        //fix for rtl site
        if(this.canvas)
            this.canvas.lowerCanvasEl.setAttribute('dir', 'ltr')


    }

})(fabric.Text.prototype._renderChars);
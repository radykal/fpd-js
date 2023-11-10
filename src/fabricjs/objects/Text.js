fabric.Text.prototype.initialize = (function (originalFn) {

    return function (...args) {

        originalFn.call(this, ...args);
        this._TextInit();
        return this;

    }

})(fabric.Text.prototype.initialize);


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
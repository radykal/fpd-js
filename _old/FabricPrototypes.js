//---- Modify tspan in SVG otherwise text styles are not displayed in PDF
fabric.util.object.extend(fabric.Text.prototype, {

    _createTextCharSpan: function _createTextCharSpan(_char, styleDecl, left, top) {

        //FPD: add text styles to tspan
        styleDecl.fontWeight = this.fontWeight;
        styleDecl.fontStyle = this.fontStyle;

        var shouldUseWhitespace = _char !== _char.trim() || _char.match(/  +/g),
            styleProps = this.getSvgSpanStyles(styleDecl, shouldUseWhitespace);

        //FPD: add underlined text
        styleProps += this.textDecoration === 'underline' ? ' text-decoration: underline;' : '';

        var fillStyles = styleProps ? 'style="' + styleProps + '"' : '',
            dy = styleDecl.deltaY,
            dySpan = '',
            NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;

        if (dy) {
            dySpan = ' dy="' + fabric.util.toFixed(dy, NUM_FRACTION_DIGITS) + '" ';
        }

        return ['<tspan x="', fabric.util.toFixed(left, NUM_FRACTION_DIGITS), '" y="', fabric.util.toFixed(top, NUM_FRACTION_DIGITS), '" ', dySpan, fillStyles, '>', fabric.util.string.escapeXml(_char), '</tspan>'].join('');
    }
});

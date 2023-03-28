fabric.Object.prototype.offsetCorner = 12;

//Start: Textbox with a max width
fabric.util.object.extend(fabric.Textbox.prototype, {
    maxWidth: 0,
    fixedWidth: true,
    hyphenation: false,
    get2DCursorLocation: function get2DCursorLocation(selectionStart, skipWrapping) {
        if (typeof selectionStart === "undefined") {
            selectionStart = this.selectionStart;
        }
        var lines = skipWrapping ? this._unwrappedTextLines : this._textLines;
        var len = lines.length;
        for (var i = 0; i < len; i++) {
            if (selectionStart <= lines[i].length) {
                return {
                    lineIndex: i,
                    charIndex: selectionStart
                };
            }
            if (this._longLines[i]) {
                selectionStart++;
            }
            selectionStart -= lines[i].length + 1;
        }
        return {
            lineIndex: i - 1,
            charIndex: lines[i - 1].length < selectionStart ? lines[i - 1].length : selectionStart
        };
    },
    _renderText: function _renderText(ctx) {
        if (this.paintFirst === "stroke") {
            this._renderTextStroke(ctx);
            this._renderTextFill(ctx);
        } else {
            this._renderTextFill(ctx);
            this._renderTextStroke(ctx);
        }
        if (this.hyphenation) {
            this._renderTextOversize(ctx);
        }
    },
    _renderTextOversize: function _renderTextOversize(ctx) {
        var lineHeight = 0;
        for (var i = 0, len = this._textLines.length; i < len; i++) {
            var lineWidth = this.measureLine(i).width;
            var lineLeftOffset = this._getLineLeftOffset(i);
            var heightOfLine = this.getHeightOfLine(i);
            if (this._longLines[i]) {
                ctx.fillRect(this._getLeftOffset() + lineLeftOffset + lineWidth + 2, this._getTopOffset() + lineHeight + heightOfLine / 2 - 1, 5, this.fontSize / 15);
            }
            lineHeight += heightOfLine;
        }
    },
    _getNewSelectionStartFromOffset: function _getNewSelectionStartFromOffset(mouseOffset, prevWidth, width, index, jlen) {
        var distanceBtwLastCharAndCursor = mouseOffset.x - prevWidth,
            distanceBtwNextCharAndCursor = width - mouseOffset.x,
            offset = distanceBtwNextCharAndCursor > distanceBtwLastCharAndCursor || distanceBtwNextCharAndCursor < 0 ? 0 : 1,
            newSelectionStart = index + offset;

        if (this.flipX) {
            newSelectionStart = jlen - newSelectionStart;
        }
        // the index passed into the function is padded by the amount of lines from _textLines (to account for \n)
        // we need to remove this padding, and pad it by actual lines, and / or spaces that are meant to be there
        var tmp = 0,
            removed = 0,
            _long = 0; //modified @den.ponomarev

        // account for removed characters
        for (var i = 0; i < this._textLines.length; i++) {
            tmp += this._textLines[i].length;
            if (tmp + removed >= newSelectionStart) {
                break;
            }
            //modified @den.ponomarev
            if (this._longLines[i]) {
                newSelectionStart--;
                _long++;
            }
            if (this.text[tmp + removed] === '\n' || this.text[tmp + removed] === ' ') {
                removed++;
            }
        }
        if (newSelectionStart > this.text.length) {
            newSelectionStart = this.text.length;
        }
        //modified @den.ponomarev
        return newSelectionStart - i + removed + _long;
        //return newSelectionStart + _long;
    },
    _wrapLine: function _wrapLine(_line, lineIndex, desiredWidth) {
        var lineWidth = 0,
            graphemeLines = [],
            line = [],
            words = _line.split(this._reSpaceAndTab),
            word = "",
            offset = 0,
            infix = " ",
            wordWidth = 0,
            infixWidth = 0,
            largestWordWidth = 0,
            lineJustStarted = true,
            additionalSpace = this._getWidthOfCharSpacing();

        this._longLines = [];
        //todo desiredWidth
        var _maxWidth = this.maxWidth || this.fixedWidth && this.width;
        var isLongWord = false;

        for (var i = 0; i < words.length; i++) {
            word = fabric.util.string.graphemeSplit(words[i]);
            wordWidth = this._measureWord(word, lineIndex, offset);

            if (!this.breakWords) {
                var _isLong = _maxWidth && wordWidth > _maxWidth;

                if (_isLong) {
                    if (line.length != 0) {
                        graphemeLines.push(line);
                        this._longLines.push(isLongWord);
                        isLongWord = false;
                        lineWidth = 0;
                        line = [];
                    }

                    var _hypheSize = 0;
                    var _bigWordWidth = 0; // lineWidth + infixWidth;
                    for (var k = 0, len = word.length; k < len && _bigWordWidth <= _maxWidth - _hypheSize; k++) {
                        _bigWordWidth += this._measureWord(word[k], lineIndex, k + offset);
                    }
                    var new_word = word.splice(0, k - 1);
                    isLongWord = true;
                    words.splice(i, 1, new_word.join(""), word.join(""));
                    i--;
                    lineJustStarted = true;
                    continue;
                }
            }
            lineWidth += infixWidth + wordWidth - additionalSpace;

            if (lineWidth >= this.width) {

                if (this.breakWords) {
                    lineWidth -= wordWidth;
                    line.push(infix);
                    var wordLetters = word.splice(0);

                    while (wordLetters.length) {
                        var letterWidth = this._measureWord(wordLetters[0], lineIndex, offset);
                        if (lineWidth + letterWidth > this.width) {
                            graphemeLines.push(line);
                            this._longLines.push(true);
                            line = [];
                            lineWidth = 0;
                        }
                        line.push(wordLetters.shift());
                        offset++;
                        lineWidth += letterWidth;
                    }
                } else if (!lineJustStarted) {
                    graphemeLines.push(line);
                    this._longLines.push(isLongWord);
                    isLongWord = false;
                    line = [];
                    lineWidth = wordWidth;
                    lineJustStarted = true;
                }
            } else {
                lineWidth += additionalSpace;
            }
            offset += word.length;

            if (!lineJustStarted) {
                line.push(infix);
            }
            line = line.concat(word);

            infixWidth = this._measureWord(infix, lineIndex, offset);
            offset++;

            // keep track of largest word
            if (wordWidth > largestWordWidth) {
                largestWordWidth = wordWidth;
            }
            lineJustStarted = false;
        }

        i && graphemeLines.push(line);
        this._longLines.push(false);

        if (this.breakWords) {
            this.dynamicMinWidth = 0;
        } else if (largestWordWidth > this.dynamicMinWidth) {
            this.dynamicMinWidth = largestWordWidth - additionalSpace;
        }
        return graphemeLines;
    }
});
//End: Textbox with a max width

//Start: Snapping
fabric.util.snapToGrid = function (target, grid, tolerance) {
    if (typeof Symbol === 'undefined') {
        return;
    }
    var result = null;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = target.x[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var targetX = _step.value;

            var dX = (targetX + grid.offsetX - tolerance) % grid.size - tolerance / 2;
            var distance = Math.abs(dX);
            if (distance < tolerance) {
                if (!result) result = {};
                result.x = targetX + distance;
                result.tx = targetX;
                result.dx = dX;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = target.y[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var targetY = _step2.value;

            var dY = (targetY + grid.offsetY - tolerance) % grid.size - tolerance / 2;
            var _distance = Math.abs(dY);
            if (_distance < tolerance) {
                if (!result) result = {};
                result.y = targetY + _distance;
                result.ty = targetY;
                result.dy = dY;
            }
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    if (result) {
        result.distance = Math.abs(Math.round(result.dx && result.dy && Math.min(Math.abs(result.dx), Math.abs(result.dy)) || result.dx || result.dy));
    }
    return result;
};

/**
 * Returns Snapping to Objects Control Points Point
 * @param {SnappingObject} target
 * @param {Array<SnappingObject>} objects
 * @param {number} tolerance
 * @returns {SnapToResult | null}
 */
fabric.util.snapToPoints = function (target, objects, tolerance) {
    if (typeof Symbol === 'undefined') {
        return;
    }
    var result = null;
    var minDistance = tolerance;
//supportlines
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = objects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var object = _step3.value;

            if (object.points) {
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = object.points[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var point = _step4.value;
                        var _iteratorNormalCompletion5 = true;
                        var _didIteratorError5 = false;
                        var _iteratorError5 = undefined;

                        try {
                            for (var _iterator5 = target.points[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                var targetPoint = _step5.value;

                                var dX = point.x - targetPoint.x;
                                var dY = point.y - targetPoint.y;
                                var distance = (Math.abs(dX) + Math.abs(dY)) / 2;
                                if (distance < minDistance) {
                                    minDistance = distance;
                                    result = {
                                        object: object,
                                        x: point.x, tx: targetPoint.x, dx: dX,
                                        y: point.y, ty: targetPoint.y, dy: dY
                                    };
                                }
                            }
                        } catch (err) {
                            _didIteratorError5 = true;
                            _iteratorError5 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }
                            } finally {
                                if (_didIteratorError5) {
                                    throw _iteratorError5;
                                }
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    if (result) {
        result.distance = Math.round(Math.min(Math.abs(result.dx), Math.abs(result.dy)));
    }
    return result;
};

/**
 * Returns Snapping to Objects Bounding Rectangles Point
 * @param {SnappingObject} target
 * @param {Array<SnappingObject>} objects
 * @param {number} tolerance
 * @returns {SnapToResult | null}
 */
fabric.util.snapToBounds = function (target, objects, tolerance) {
    if (typeof Symbol === 'undefined') {
        return;
    }
    var result = null;
    var minDistance = tolerance;

//snap center point to vertical lines
    if (target.cx) {
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
            for (var _iterator6 = objects[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var object = _step6.value;

                if (object.cx && object.cy === undefined) {
                    var dX = object.cx - target.cx;
                    var distance = Math.abs(dX);
                    if (distance < minDistance) {
                        minDistance = distance;
                        if (!result) result = {};
                        result.objectX = object;
                        result.x = object.cx;
                        result.tx = target.cx;
                        result.dx = dX;
                    }
                }
            }
        } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                    _iterator6.return();
                }
            } finally {
                if (_didIteratorError6) {
                    throw _iteratorError6;
                }
            }
        }
    }
//snap center point to horisontal lines
    minDistance = tolerance;
    if (target.cy) {
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
            for (var _iterator7 = objects[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var _object = _step7.value;

                if (_object.cy && _object.cx === undefined) {
                    var dy = _object.cy - target.cy;
                    var _distance2 = Math.abs(dy);
                    if (_distance2 < minDistance) {
                        minDistance = _distance2;
                        if (!result) result = {};
                        result.objectY = _object;
                        result.y = _object.cy;
                        result.ty = target.cy;
                        result.dy = dy;
                    }
                }
            }
        } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                    _iterator7.return();
                }
            } finally {
                if (_didIteratorError7) {
                    throw _iteratorError7;
                }
            }
        }
    }
//snap edges to horisontal lines
    minDistance = tolerance;
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
        for (var _iterator8 = objects[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var _object2 = _step8.value;

            if (_object2.x) {
                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                    for (var _iterator10 = (_object2.x.length ? _object2.x : [_object2.x])[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                        var x = _step10.value;
                        var _iteratorNormalCompletion11 = true;
                        var _didIteratorError11 = false;
                        var _iteratorError11 = undefined;

                        try {
                            for (var _iterator11 = target.x[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                var targetX = _step11.value;

                                var _dX = x - targetX;
                                var _distance3 = Math.abs(_dX);
                                if (_distance3 < minDistance) {
                                    minDistance = _distance3;
                                    if (!result) result = {};
                                    result.objectX = _object2;
                                    result.x = x;
                                    result.tx = targetX;
                                    result.dx = _dX;
                                }
                            }
                        } catch (err) {
                            _didIteratorError11 = true;
                            _iteratorError11 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                                    _iterator11.return();
                                }
                            } finally {
                                if (_didIteratorError11) {
                                    throw _iteratorError11;
                                }
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError10 = true;
                    _iteratorError10 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }
                    } finally {
                        if (_didIteratorError10) {
                            throw _iteratorError10;
                        }
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
            }
        } finally {
            if (_didIteratorError8) {
                throw _iteratorError8;
            }
        }
    }

    minDistance = tolerance;
//snap edges to vertical lines
    var _iteratorNormalCompletion9 = true;
    var _didIteratorError9 = false;
    var _iteratorError9 = undefined;

    try {
        for (var _iterator9 = objects[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var _object3 = _step9.value;

            if (_object3.y) {
                var _iteratorNormalCompletion12 = true;
                var _didIteratorError12 = false;
                var _iteratorError12 = undefined;

                try {
                    for (var _iterator12 = (_object3.y.length ? _object3.y : [_object3.y])[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                        var y = _step12.value;
                        var _iteratorNormalCompletion13 = true;
                        var _didIteratorError13 = false;
                        var _iteratorError13 = undefined;

                        try {
                            for (var _iterator13 = target.y[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                                var targetY = _step13.value;

                                var dY = y - targetY;
                                var _distance4 = Math.abs(dY);
                                if (_distance4 < minDistance) {
                                    minDistance = _distance4;
                                    if (!result) result = {};
                                    result.objectY = _object3;
                                    result.y = y;
                                    result.ty = targetY;
                                    result.dy = dY;
                                }
                            }
                        } catch (err) {
                            _didIteratorError13 = true;
                            _iteratorError13 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion13 && _iterator13.return) {
                                    _iterator13.return();
                                }
                            } finally {
                                if (_didIteratorError13) {
                                    throw _iteratorError13;
                                }
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError12 = true;
                    _iteratorError12 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion12 && _iterator12.return) {
                            _iterator12.return();
                        }
                    } finally {
                        if (_didIteratorError12) {
                            throw _iteratorError12;
                        }
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
                _iterator9.return();
            }
        } finally {
            if (_didIteratorError9) {
                throw _iteratorError9;
            }
        }
    }

    if (result) {
        result.distance = Math.abs(Math.round(result.dx && result.dy && Math.min(Math.abs(result.dx), Math.abs(result.dy)) || result.dx || result.dy));
    }
    return result;
};

/**
 * generate SnappingObject using in snapping cache
 * @param {Array<fabric.Object>} object - FabricJS object
 * @returns {SnappingObject}
 */
fabric.util.createSnapObject = function (object) {
    var cr = object.calcCoords(true),
        xPoints = [cr.tl.x, cr.tr.x, cr.bl.x, cr.br.x],
        yPoints = [cr.tl.y, cr.tr.y, cr.bl.y, cr.br.y];

    var xMin = fabric.util.array.min(xPoints),
        xMax = fabric.util.array.max(xPoints),
        yMin = fabric.util.array.min(yPoints),
        yMax = fabric.util.array.max(yPoints);
    return {
        instance: object,
        points: [cr.tl, cr.tr, cr.br, cr.bl],
        cx: xMin + (xMax - xMin) / 2,
        cy: yMin + (yMax - yMin) / 2,
        x: [xMin, xMax],
        y: [yMin, yMax]
    };
};

/**
 * Draw Helper lines For Snapping function
 * @param {SnapToResult} snapResult
 * @param strokeStyle
 */
fabric.Canvas.prototype.renderSnapping = function (snapResult, strokeStyle) {
    var ctx = this.contextTop,
        v = this.viewportTransform;
    if (this._currentTransform && snapResult) {
        this.clearContext(ctx);
    }
    ctx.save();
    ctx.strokeStyle = strokeStyle;
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);

    function drawSnapObject(obj) {
        if (!obj || !obj.points) return;
        var p = obj.points;
        ctx.moveTo(p[0].x, p[0].y);
        for (var i = p.length; i--;) {
            ctx.lineTo(p[i].x, p[i].y);
        }
    }

    ctx.beginPath();
    drawSnapObject(snapResult.object);
    drawSnapObject(snapResult.objectX);
    drawSnapObject(snapResult.objectY);
    drawSnapObject(this.__snapCache.target);
    if (snapResult.object) {
        ctx.moveTo(snapResult.tx, snapResult.ty);
        ctx.lineTo(snapResult.x, snapResult.y);
        ctx.arc(snapResult.x, snapResult.y, 2, 0, 2 * Math.PI);
    }
    if (snapResult.objectX) {
        ctx.moveTo(snapResult.x, 0);
        ctx.lineTo(snapResult.x, this.originalHeight);
    }
    if (snapResult.objectY) {
        ctx.moveTo(0, snapResult.y);
        ctx.lineTo(this.originalWidth, snapResult.y);
    }
    ctx.stroke();
    ctx.restore();
};

/**
 * Correct Object moving on "object:moving" event
 * @param {Object}                options           -
 * @param {fabric.Object}         options.target    - moving object
 * @param {Array<SnappingObject>} options.guidlines - other guidlines
 * @param {Array<fabric.Object>}  options.objects   - other objects
 * @param {GridOptions}           options.grid      -
 * @param {number}                options.tolerance -
 * @returns {SnapToResult | null}
 */
fabric.Canvas.prototype.gridSnapMove = function (options) {
    var area = options.area;
    var objects = options.objects || this._objects;
    if (!this.__snapCache) {
        var snapObjects = options.guidlines || [];
        for (var i in objects) {
            var obj = objects[i];
            if (obj === options.target || !obj.snappable || !obj.visible) continue;
            snapObjects.push(fabric.util.createSnapObject(obj));
        }

        if (area) {
            snapObjects.push({
                instance: this,
                x: [area.x1, area.x2],
                y: [area.y1, area.y2]
            });
        }

        this.__snapCache = {
            area: area,
            objects: snapObjects,
            grid: options.grid
        };
    }

    this.__snapCache.target = fabric.util.createSnapObject(options.target);

    var snapTo = null;
    var snapPoints = fabric.util.snapToPoints(this.__snapCache.target, this.__snapCache.objects, options.tolerance);
    if (!snapTo) snapTo = snapPoints;
    if (snapTo && snapPoints && snapPoints.distance < snapTo.distance) {
        snapTo = snapPoints;
    }

    var snapRects = fabric.util.snapToBounds(this.__snapCache.target, this.__snapCache.objects, options.tolerance);
    if (!snapTo) snapTo = snapRects;
    if (snapTo && snapRects && snapRects.distance < snapTo.distance) {
        snapTo = snapRects;
    }

    if (options.grid) {
        var snapGrid = fabric.util.snapToGrid(this.__snapCache.target, this.__snapCache.grid, options.tolerance);
        if (!snapTo) snapTo = snapGrid;
        if (snapTo && snapGrid && snapGrid.distance < snapTo.distance) {
            snapTo = snapGrid;
        }
    }

    if (snapTo) {
        if (snapTo.dx) {
            options.target.left += snapTo.dx;
        }
        if (snapTo.dy) {
            options.target.top += snapTo.dy;
        }
        this.fire("object:snapto", {e: snapTo});
    }
    return snapTo;
};

fabric.util.object.extend(fabric.Object.prototype, {
    snappable: true
});

fabric.util.object.extend(fabric.Canvas.prototype, {
    tolerance: 10,
    renderSnappingHelperLines: true,
    setSnapping: function setSnapping(val) {
        function _renderSnapping() {
            if (this.renderSnappingHelperLines && this.snapTo) {
                this.renderSnapping(this.snapTo, "#ffaaaa");
            }
        }

        if (val) {
            this.on("object:moving", this.gridSnapMoveWrapper);
            this.on('mouse:up', this.clearSnapping);
            this.on('after:render', _renderSnapping);
        } else {
            this.off("object:moving", this.gridSnapMoveWrapper);
            this.off('mouse:up', this.clearSnapping);
            this.off('after:render', _renderSnapping);
        }
        this.snapping = val;
    },

    snapping: false,
    clearSnapping: function clearSnapping() {
        delete this.__snapCache;
        this.clearContext(this.contextTop);
        this.snapTo = null;
    },
    /**
     * @param object
     * @returns {{x: (false|{value, corner}|{value, corner, object2, corner2}), y: (false|{value, corner}|{value, corner, object2, corner2})}}
     */
    gridSnapMoveWrapper: function gridSnapMoveWrapper(options) {

        if (typeof Symbol === 'undefined') {
            return;
        }

        if (options.e.shiftKey || !options.target.snappable) {
            return;
        }

        var snapObjects = [{cx: this.originalWidth / 2}, {cy: this.originalHeight / 2}];
        if (this.supportLines) {
            var _iteratorNormalCompletion14 = true;
            var _didIteratorError14 = false;
            var _iteratorError14 = undefined;

            try {
                for (var _iterator14 = this.supportLines[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                    var l = _step14.value;

                    snapObjects.push(l.x ? {instance: l, x: l.x} : {instance: l, y: l.y});
                }
            } catch (err) {
                _didIteratorError14 = true;
                _iteratorError14 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion14 && _iterator14.return) {
                        _iterator14.return();
                    }
                } finally {
                    if (_didIteratorError14) {
                        throw _iteratorError14;
                    }
                }
            }
        }
        if (this.guidlines) {
            var _iteratorNormalCompletion15 = true;
            var _didIteratorError15 = false;
            var _iteratorError15 = undefined;

            try {
                for (var _iterator15 = this.guidlines[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                    var _l = _step15.value;

                    snapObjects.push(_l.x ? {instance: _l, x: _l.x} : {instance: _l, y: _l.y});
                }
            } catch (err) {
                _didIteratorError15 = true;
                _iteratorError15 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion15 && _iterator15.return) {
                        _iterator15.return();
                    }
                } finally {
                    if (_didIteratorError15) {
                        throw _iteratorError15;
                    }
                }
            }
        }

        this.snapTo = this.gridSnapMove({
            tolerance: this.tolerance,
            guidlines: snapObjects,
            objects: this._objects,
            target: options.target,
            area: {
                x1: this.offsets.left,
                y1: this.offsets.top,
                x2: this.originalWidth - this.offsets.right,
                y2: this.originalHeight - this.offsets.bottom
            },
            grid: this.grid && {
                offsetX: this.offsets.left - this.grid._gridOffset.x,
                offsetY: this.offsets.top - this.grid._gridOffset.y,
                size: this.gridSize
            }
        });
    }
});
//End: Snapping






fabric.Text.prototype._constrainScale = function (value) {

    if (Math.abs(value) < this.minScaleLimit) {
        if (value < 0) {
            return -this.minScaleLimit;
        } else {
            return this.minScaleLimit;
        }
    }

    //FPD: minimum font size
    if (this.minFontSize !== undefined) {

        var scaledFontSize = parseFloat(Number(value * this.fontSize).toFixed(0));
        if (scaledFontSize < this.minFontSize) {
            return this.minFontSize / this.fontSize;
        }
    }

    //FPD: maximum font size
    if (this.maxFontSize !== undefined) {

        var scaledFontSize = parseFloat(Number(value * this.fontSize).toFixed(0));
        if (scaledFontSize > this.maxFontSize) {
            return this.maxFontSize / this.fontSize;
        }
    }

    return value;
};

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

/**
 * modified to use with `offsetCorner` property
 * @param absolute
 * @returns {{tl: *|fabric.Point, tr: *|fabric.Point, br: *|fabric.Point, bl: *|fabric.Point}}
 */
fabric.Object.prototype._fpdBasicCalcCoords = function (absolute) {

    var multiplyMatrices = fabric.util.multiplyTransformMatrices,
        transformPoint = fabric.util.transformPoint,
        degreesToRadians = fabric.util.degreesToRadians,
        rotateMatrix = this._calcRotateMatrix(),
        translateMatrix = this._calcTranslateMatrix(),
        startMatrix = multiplyMatrices(translateMatrix, rotateMatrix),
        vpt = this.getViewportTransform(),
        finalMatrix = absolute ? startMatrix : multiplyMatrices(vpt, startMatrix),
        dim = this._getTransformedDimensions(),
        w = dim.x / 2,
        h = dim.y / 2,
        tl = transformPoint({
            x: -w,
            y: -h
        }, finalMatrix),
        tr = transformPoint({
            x: w,
            y: -h
        }, finalMatrix),
        bl = transformPoint({
            x: -w,
            y: h
        }, finalMatrix),
        br = transformPoint({
            x: w,
            y: h
        }, finalMatrix);


    //FPD: modified to use with `offsetCorner` property
    if (this.offsetCorner) {
        var cornerCenterW = dim.x / 2 + this.offsetCorner,
            cornerCenterH = dim.y / 2 + this.offsetCorner;
        tl._corner = transformPoint({x: -cornerCenterW, y: -cornerCenterH}, finalMatrix);
        tr._corner = transformPoint({x: cornerCenterW, y: -cornerCenterH}, finalMatrix);
        bl._corner = transformPoint({x: -cornerCenterW, y: cornerCenterH}, finalMatrix);
        br._corner = transformPoint({x: cornerCenterW, y: cornerCenterH}, finalMatrix);
    }
    //FPD: end

    if (!absolute) {
        if (this.padding) {

            var padding = this.padding,
                angle = degreesToRadians(this.angle),
                cos = fabric.util.cos(angle),
                sin = fabric.util.sin(angle),
                cosP = cos * padding,
                sinP = sin * padding,
                cosPSinP = cosP + sinP,
                cosPMinusSinP = cosP - sinP;

            tl.x -= cosPMinusSinP;
            tl.y -= cosPSinP;
            tr.x += cosPSinP;
            tr.y -= cosPMinusSinP;
            bl.x -= cosPSinP;
            bl.y += cosPMinusSinP;
            br.x += cosPMinusSinP;
            br.y += cosPSinP;

            //FPD: modified to use with `offsetCorner` property
            if (this.offsetCorner) {
                tl._corner.x -= cosPMinusSinP;
                tl._corner.y -= cosPSinP;
                tr._corner.x += cosPSinP;
                tr._corner.y -= cosPMinusSinP;
                bl._corner.x -= cosPSinP;
                bl._corner.y += cosPMinusSinP;
                br._corner.x += cosPMinusSinP;
                br._corner.y += cosPSinP;
            }
            //FPD: end
        }

        var ml = new fabric.Point((tl.x + bl.x) / 2, (tl.y + bl.y) / 2),
            mt = new fabric.Point((tr.x + tl.x) / 2, (tr.y + tl.y) / 2),
            mr = new fabric.Point((br.x + tr.x) / 2, (br.y + tr.y) / 2),
            mb = new fabric.Point((br.x + bl.x) / 2, (br.y + bl.y) / 2),

            //FPD: Adjust calculation for top/right position
            mtrX = tr.x,
            mtrY = tr.y,
            mtr = new fabric.Point(mtrX + sin * this.rotatingPointOffset, mtrY - cos * this.rotatingPointOffset);

        // modified to use with `offsetCorner` property
        if (this.offsetCorner) {
            mtr._corner = new fabric.Point(tr._corner.x, tr._corner.y);
        }
        //FPD: end
    }

    var coords = {
        tl: tl,
        tr: tr,
        br: br,
        bl: bl
    };

    if (!absolute) {
        coords.ml = ml;
        coords.mt = mt;
        coords.mr = mr;
        coords.mb = mb;
        coords.mtr = mtr;
    }

    return coords;
};

/**
 * Sets the coordinates of the draggable boxes in the corners of
 * the image used to scale/rotate it.
 * Edited : modified to use with `offsetCorner` property
 * @private
 */
fabric.Object.prototype._fpdBasicsetCornerCoords = function () {
    var coords = this.oCoords,
        newTheta = fabric.util.degreesToRadians(45 - this.angle),
        cornerHypotenuse = this.cornerSize * 0.707106,
        cosHalfOffset = cornerHypotenuse * fabric.util.cos(newTheta),
        sinHalfOffset = cornerHypotenuse * fabric.util.sin(newTheta),
        x, y;

    for (var point in coords) {
        //modified to use with `offsetCorner` property
        if (coords[point]._corner) {
            x = coords[point]._corner.x;
            y = coords[point]._corner.y;
        } else {
            x = coords[point].x;
            y = coords[point].y;
        }


        coords[point].corner = {
            tl: {
                x: x - sinHalfOffset,
                y: y - cosHalfOffset
            },
            tr: {
                x: x + cosHalfOffset,
                y: y - sinHalfOffset
            },
            bl: {
                x: x - cosHalfOffset,
                y: y + sinHalfOffset
            },
            br: {
                x: x + sinHalfOffset,
                y: y + cosHalfOffset
            }
        };
    }
};

fabric.Canvas.prototype._fpdBasicgetRotatedCornerCursor = function (corner, target, e) {
    var n = Math.round(target.angle % 360 / 45);

    //FPD: add CursorOffset
    var cursorOffset = {
        mt: 0, // n
        tr: 1, // ne
        mr: 2, // e
        br: 3, // se
        mb: 4, // s
        bl: 5, // sw
        ml: 6, // w
        tl: 7 // nw
    };

    if (n < 0) {
        n += 8; // full circle ahead
    }
    n += cursorOffset[corner];
    n %= 8;

    //FPD: set cursor for copy and remove
    switch (corner) {
        case 'tl':
            return target.copyable ? 'copy' : 'default';
            break;
        case 'bl':
            return 'pointer';
            break;
    }
    return this.cursorMap[n];
};

/**
 * modified to use with `offsetCorner` property
 * @param control
 * @param ctx
 * @param methodName
 * @param left
 * @param top
 * @private
 */
fabric.Object.prototype._fpdBasicdrawControl = function (control, ctx, methodName, left, top) {
    var size = this.cornerSize,
        iconOffset = 4,
        iconSize = size - iconOffset * 2,
        offsetCorner = this.offsetCorner,
        dotSize = 4,
        icon = false;


    if (this.isControlVisible(control)) {

        var wh = this._calculateCurrentDimensions(),
            width = wh.x,
            height = wh.y;

        if (control == 'br' || control == 'mtr' || control == 'tl' || control == 'bl' || control == 'ml' || control == 'mr' || control == 'mb' || control == 'mt') {
            switch (control) {

                case 'tl':
                    //copy
                    left = left - offsetCorner;
                    top = top - offsetCorner;
                    icon = this.__editorMode || this.copyable ? String.fromCharCode('0xe942') : false;
                    break;
                case 'mtr':
                    // rotate
                    var rotateRight = width / 2;
                    left = left + rotateRight + offsetCorner;
                    top = top - offsetCorner;
                    icon = (this.__editorMode || this.rotatable) ? String.fromCharCode('0xe923') : false;
                    break;
                case 'br':
                    // resize
                    left = left + offsetCorner;
                    top = top + offsetCorner;
                    icon = (this.__editorMode || this.resizable) && this.type !== 'textbox' ? String.fromCharCode('0xe922') : false;
                    break;
                case 'bl':
                    //remove
                    left = left - offsetCorner;
                    top = top + offsetCorner;
                    icon = this.__editorMode || this.removable ? String.fromCharCode('0xe926') : false;
                    break;
            }
        }

        this.transparentCorners || ctx.clearRect(left, top, size, size);

        var extraLeftOffset = control == 'mt' || control == 'mb' ? 5 : 0;
        ctx.fillStyle = this.cornerColor;

        if (((control == 'ml' || control == 'mr') && !this.lockScalingX) || ((control == 'mt' || control == 'mb') && !this.lockScalingY)) {
            ctx.beginPath();
            left += dotSize * 3;
            top += dotSize * 3;
            ctx.arc(left, top, dotSize, 0, 2 * Math.PI);
            ctx.fillStyle = this.cornerIconColor;
            ctx.fill();
        } else if (icon) {
            ctx.fillRect(left, top, size, size);
            ctx.font = iconSize + 'px FontFPD';
            ctx.fillStyle = this.cornerIconColor;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(icon, left + iconOffset + extraLeftOffset, top + iconOffset);
        }

    }
};
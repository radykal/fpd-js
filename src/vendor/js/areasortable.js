/**
*  area-sortable.js
*  A simple js class to sort elements of an area smoothly using drag-and-drop (desktop and mobile)
*  @VERSION: 1.2.2
*
*  https://github.com/foo123/area-sortable.js
*
**/
!function(root, name, factory) {
"use strict";
if ('object' === typeof exports)
    // CommonJS module
    module.exports = factory();
else if ('function' === typeof define && define.amd)
    // AMD. Register as an anonymous module.
    define(function(req) {return factory();});
else
    root[name] = factory();
}('undefined' !== typeof self ? self : this, 'AreaSortable', function(undef) {
"use strict";

var VERSION = '1.2.2', $ = '$areaSortable',
    RECT = 'rect', SCROLL = 'scroll', STYLE = 'style',
    MARGIN = 'margin', PADDING = 'padding',
    LEFT = 'left', RIGHT = 'right', WIDTH = 'width',
    TOP = 'top', BOTTOM = 'bottom', HEIGHT = 'height',
    NEXT = 'nextElementSibling', PREV = 'previousElementSibling',
    STOP = 'scrollTop', SLEFT = 'scrollLeft',
    VERTICAL = 1, HORIZONTAL = 2,
    UNRESTRICTED = VERTICAL + HORIZONTAL,
    stdMath = Math, Str = String, int = parseInt,
    hasProp = Object.prototype.hasOwnProperty,
    toString = Object.prototype.toString,
    trim_re = /^\s+|\s+$/g, mouse_evt = /mousedown|pointerdown/,
    trim = Str.prototype.trim
        ? function(s) {return s.trim();}
        : function(s) {return s.replace(trim_re, '');},
    eventOptionsSupported = null
;

// add custom property to Element.prototype to avoid browser issues
if (
    window.Element
    && !hasProp.call(window.Element.prototype, $)
)
    window.Element.prototype[$] = null;

function sign(x, signOfZero)
{
    return 0 > x ? -1 : (0 < x ? 1 : (signOfZero || 0));
}
function is_callable(x)
{
    return 'function' === typeof x;
}
function is_string(x)
{
    return '[object String]' === toString.call(x);
}
function concat(a)
{
    for (var i = 1, args = arguments, n = args.length; i < n; ++i)
        a.push.apply(a, args[i]);
    return a;
}
function throttle(f, interval)
{
    var inThrottle = false;
    return function() {
        if (!inThrottle)
        {
            f.apply(this, arguments);
            inThrottle = true;
            setTimeout(function() {inThrottle = false;}, interval);
        }
    };
}
function hasEventOptions()
{
    var passiveSupported = false, options = {};
    try {
        Object.defineProperty(options, 'passive', {
            get: function(){
                passiveSupported = true;
                return false;
            }
        });
        window.addEventListener('test', null, options);
        window.removeEventListener('test', null, options);
    } catch(e) {
        passiveSupported = false;
    }
    return passiveSupported;
}
function addEvent(target, event, handler, options)
{
    if (null == eventOptionsSupported) eventOptionsSupported = hasEventOptions();
    if (target.attachEvent) target.attachEvent('on' + event, handler);
    else target.addEventListener(event, handler, eventOptionsSupported ? options : ('object' === typeof(options) ? !!options.capture : !!options));
}
function removeEvent(target, event, handler, options)
{
    if (null == eventOptionsSupported) eventOptionsSupported = hasEventOptions();
    // if (el.removeEventListener) not working in IE11
    if (target.detachEvent) target.detachEvent('on' + event, handler);
    else target.removeEventListener(event, handler, eventOptionsSupported ? options : ('object' === typeof(options) ? !!options.capture : !!options));
}
function hasClass(el, className)
{
    return el.classList
        ? el.classList.contains(className)
        : -1 !== (' ' + el.className + ' ').indexOf(' ' + className + ' ')
    ;
}
function addClass(el, className)
{
    if (el.classList) el.classList.add(className);
    else if (!hasClass(el, className)) el.className = '' === el.className ? className : (el.className + ' ' + className);
}
function removeClass(el, className)
{
    if (el.classList) el.classList.remove(className);
    else el.className = trim((' ' + el.className + ' ').replace(' ' + className + ' ', ' '));
}
function scrollingElement(document)
{
    return document.scrollingElement || document.documentElement || document.body;
}
function canScroll(el, scrollAxis)
{
    if (0 === el[scrollAxis])
    {
        el[scrollAxis] = 1;
        if (1 === el[scrollAxis])
        {
            el[scrollAxis] = 0;
            return true;
        }
        else
        {
            return false;
        }
    }
    else
    {
        return true;
    }
}
function computedStyle(el)
{
    return (is_callable(window.getComputedStyle) ? window.getComputedStyle(el, null) : el.currentStyle) || {};
}
function elementsAt(document, x, y)
{
    return document.elementsFromPoint(x, y);
}
function closestElement(el, className)
{
    if (el.closest) return el.closest('.' + className);
    while (el)
    {
        if (hasClass(el, className)) return el;
        el = el.parentNode;
    }
}
function storeStyle(el, props)
{
    return props.reduce(function(style, prop){
        style[prop] = el[STYLE].getPropertyValue(prop);
        return style;
    }, {});
}
function restoreStyle(el, props, style)
{
    style = style || el[$][STYLE];
    props.forEach(function(prop){
        if (hasProp.call(style, prop) && ('' !== style[prop])) el[STYLE][prop] = style[prop];
        else el[STYLE].removeProperty(prop);
    });
}
function repaint(el)
{
    return el.offsetWidth;
}
function animate(el, ms, offset)
{
    if (0 < ms)
    {
        if (el[$] && el[$].animation) el[$].animation.stop();
        var trs = 'transform ' + Str(ms) + 'ms',
            trf = 'translate3d(0,0,0)',
            time = null,
            stop = function stop() {
                if (time) clearTimeout(time);
                time = null;
                if (el[$] && el[$].animation && (stop === el[$].animation.stop)) el[$].animation = null;
                if (el[STYLE].transform === trf && el[STYLE].transition === trs)
                {
                    el[STYLE].transition = 'none';
                    el[STYLE].transform = 'none';
                }
            }
        ;
        el[STYLE].transition = 'none';
        el[STYLE].transform = 'translate3d(' + Str(-(offset[LEFT] || 0)) + 'px,' + Str(-(offset[TOP] || 0)) + 'px,0)';
        repaint(el);
        el[STYLE].transform = trf;
        el[STYLE].transition = trs;
        time = setTimeout(stop, ms);
        el[$].animation = {stop: stop};
    }
    return el;
}
function intersect1D(nodeA, nodeB, scroll, axis, size)
{
    var rectA = nodeA[$].r, rectB = nodeB[$][RECT];
    return stdMath.max(
        0.0,
        stdMath.min(
            1.0,
            stdMath.max(
                0,
                stdMath.min(
                    rectA[axis] + rectA[size],
                    rectB[axis] - scroll[axis] + rectB[size]
                )
                -
                stdMath.max(
                    rectA[axis],
                    rectB[axis] - scroll[axis]
                )
            )
            /
            stdMath.min(
                rectA[size],
                rectB[size]
            )
        )
    );
}
function intersect2D(nodeA, nodeB, scroll, axis, size)
{
    var rectA = nodeA[$].r, rectB = nodeB[$][RECT],
        overlapX = 0, overlapY = 0;
    overlapX = stdMath.max(
        0,
        stdMath.min(
            rectA[LEFT] + rectA[WIDTH],
            rectB[LEFT] - scroll[LEFT] + rectB[WIDTH]
        )
        -
        stdMath.max(
            rectA[LEFT],
            rectB[LEFT] - scroll[LEFT]
        )
    );
    overlapY = stdMath.max(
        0,
        stdMath.min(
            rectA[TOP] + rectA[HEIGHT],
            rectB[TOP] - scroll[TOP] + rectB[HEIGHT]
        )
        -
        stdMath.max(
            rectA[TOP],
            rectB[TOP] - scroll[TOP]
        )
    );
    return stdMath.max(
        0.0,
        stdMath.min(
            1.0,
            (overlapX * overlapY)
            /
            (
                stdMath.min(
                    rectA[WIDTH],
                    rectB[WIDTH]
                )
                *
                stdMath.min(
                    rectA[HEIGHT],
                    rectB[HEIGHT]
                )
            )
        )
    );
}
function updateIndex(el, limit, dir, placeholder)
{
    el = el[(0 > dir ? NEXT : PREV)];
    while (el)
    {
        if (el !== placeholder) el[$].index += (0 > dir ? 1 : -1);
        if (el === limit) return;
        el = el[(0 > dir ? NEXT : PREV)];
    }
}
function lineStart(el, line)
{
    var next;
    //while ((el[$].line < line) && (next = el[NEXT])) el = next;
    while ((next = el[PREV]) && (next[$] && next[$].line >= line)) el = next;
    return el;
}
function layout1(el, line, parent, movedNode, placeholder, scroll, axis, size, axis_opposite)
{
    // layout "horizontal" positions and lines
    // to compute which "visual" line {el} is placed
    // assume no absolute or fixed positioning
    // and row-first ordering instead of column-first (default browser element ordering)
    var runningEnd = 0, end;
    while (el)
    {
        if (el !== placeholder)
        {
            if (el[$] && el[$].animation) el[$].animation.stop();
            end = el[$][MARGIN][axis] + el[$][RECT][size] + el[$][MARGIN][axis_opposite];
            if ((0 < runningEnd) && (parent[$][PADDING][axis] + runningEnd + end + parent[$][PADDING][axis_opposite] > parent[$][RECT][size]))
            {
                line++;
                runningEnd = 0;
            }
            el[$].line = line;
            el[$].prev[axis] = el[$][RECT][axis];
            el[$][RECT][axis] = parent[$][RECT][axis] - parent[$][SCROLL][axis] + parent[$][PADDING][axis] + runningEnd + el[$][MARGIN][axis];
            (el === movedNode ? placeholder : el)[STYLE][axis] = Str(el[$][RECT][axis] - parent[$][RECT][axis] + parent[$][SCROLL][axis] - (el === movedNode ? 0 : el[$][MARGIN][axis])) + 'px';
            runningEnd += end;
        }
        el = el[NEXT];
    }
}
function layout2(el, lines, parent, movedNode, placeholder, scroll, axis, size, axis_opposite)
{
    // layout "vertical" positions
    // to compute which "visual" line {el} is placed
    // assume no absolute or fixed positioning
    // and row-first ordering instead of column-first (default browser element ordering)
    var o = el, currentLine = el[$].line, lineSize = 0, line, lineTop, end;
    while (el)
    {
        if (el !== placeholder)
        {
            line = el[$].line;
            end = el[$][MARGIN][axis] + el[$][RECT][size] + el[$][MARGIN][axis_opposite];
            if (line === currentLine)
            {
                lineSize = stdMath.max(lineSize, end);
            }
            else
            {
                lines[line] = lines[currentLine] + lineSize;
                currentLine = line;
                lineSize = end;
            }
        }
        el = el[NEXT];
    }
    if (0 < lineSize) lines[currentLine + 1] = lines[currentLine] + lineSize;
    el = o;
    while (el)
    {
        if (el !== placeholder)
        {
            line = el[$].line;
            lineTop = lines[line];
            el[$].prev[axis] = el[$][RECT][axis];
            switch(el[$].$.verticalAlign)
            {
                case 'bottom':
                    el[$][RECT][axis] = parent[$][RECT][axis] - parent[$][SCROLL][axis] + lines[line + 1] - el[$][RECT][size] - el[$][MARGIN][axis_opposite];
                    break;
                case 'top':
                default:
                    el[$][RECT][axis] = parent[$][RECT][axis] - parent[$][SCROLL][axis] + lineTop + el[$][MARGIN][axis];
                    break;
            }
            (el === movedNode ? placeholder : el)[STYLE][axis] = Str(el[$][RECT][axis] - (el === movedNode ? 0 : el[$][MARGIN][axis]) - parent[$][RECT][axis] + parent[$][SCROLL][axis]) + 'px';
        }
        el = el[NEXT];
    }
}
function computeScroll(parent, scrollParent)
{
    return scrollParent ? {
        top: (scrollParent[STOP] - scrollParent[$][SCROLL].top0) || 0,
        left: (scrollParent[SLEFT] - scrollParent[$][SCROLL].left0) || 0
    } : {
        top: 0,
        left: 0
    };
}

function setup(self, TYPE)
{
    var attached = false, canHandle = false, isDraggingStarted = false, isTouch = false,
        placeholder, dragged, handler, closest, dragTimer = null,
        first, last, items, lines, scrollEl, scrollParent, parent,
        X0, Y0, lastX, lastY, lastDeltaX, lastDeltaY, dirX, dirY, curX, curY,
        scrolling = null, scroll, dir, overlap, moved,
        delay = 60, fps = 60, dt = 1000 / fps, move, intersect, hasSymmetricItems = false,
        size = HORIZONTAL === TYPE ? WIDTH : HEIGHT,
        axis = HORIZONTAL === TYPE ? LEFT : TOP,
        axis_opposite = LEFT === axis ? RIGHT : BOTTOM, DOC
    ;

    var clear = function() {
        placeholder = null;
        dragged = null;
        handler = null;
        closest = null;
        first = null;
        last = null;
        scrollEl = null;
        scrollParent = null;
        parent = null;
        items = null;
        lines = null;
        DOC = null;
        moved = false;
        overlap = 0;
    };

    var prepare = function() {
        var line = 0, runningEnd = 0, mrg = 0,
            axis = LEFT, size = WIDTH, axis_opposite = RIGHT,
            tag = (parent.tagName || '').toLowerCase();

        scrollEl = scrollingElement(DOC);
        scrollParent = null;
        if (self.options.autoscroll)
        {
            scrollParent = parent;
            while (scrollParent)
            {
                if (
                    (scrollEl === scrollParent)
                    || ((HORIZONTAL !== TYPE)
                    && (scrollParent.scrollHeight > scrollParent.clientHeight)
                    && canScroll(scrollParent, STOP))
                    || ((VERTICAL !== TYPE)
                    && (scrollParent.scrollWidth > scrollParent.clientWidth)
                    && canScroll(scrollParent, SLEFT))
                ) break;
                scrollParent = scrollParent.parentNode;
            }
        }
        parent[$] = {
            rect: parent.getBoundingClientRect(),
            scroll: {
                top: parent[STOP] || 0,
                left: parent[SLEFT] || 0,
                width: parent.scrollWidth,
                height: parent.scrollHeight,
                top0: parent[STOP] || 0,
                left0: parent[SLEFT] || 0
            },
            $: computedStyle(parent),
            style: storeStyle(parent, ['width', 'height', 'max-width', 'max-height', 'box-sizing', 'padding-left', 'padding-top', 'padding-right', 'padding-bottom'])
        };
        parent[$][PADDING] = {
            left: int(parent[$].$.paddingLeft) || 0,
            right: int(parent[$].$.paddingRight) || 0
        };
        if (scrollParent && (scrollParent !== parent))
        {

            scrollParent[$] = {
                rect: scrollParent.getBoundingClientRect(),
                scroll: {
                    top: scrollParent[STOP] || 0,
                    left: scrollParent[SLEFT] || 0,
                    width: scrollParent.scrollWidth,
                    height: scrollParent.scrollHeight,
                    top0: scrollParent[STOP] || 0,
                    left0: scrollParent[SLEFT] || 0
                }
            };
        }
        items = [].map.call(parent.children, function(el, index) {
            var end, r = el.getBoundingClientRect(), style = computedStyle(el);
            el[$] = {
                index: index,
                line: 0,
                prev: {},
                rect: {
                    top: r[TOP],
                    left: r[LEFT],
                    width: r[WIDTH],
                    height: r[HEIGHT]
                },
                r: {
                    top: r[TOP],
                    left: r[LEFT],
                    width: r[WIDTH],
                    height: r[HEIGHT]
                },
                margin: {
                    top: int(style.marginTop) || 0,
                    right: int(style.marginRight) || 0,
                    bottom: int(style.marginBottom) || 0,
                    left: int(style.marginLeft) || 0
                },
                $: style,
                style: storeStyle(el, [
                    'position',
                    'box-sizing',
                    'overflow',
                    'top',
                    'left',
                    'width',
                    'height',
                    'transform',
                    'transition'
                ]),
                animation: null
            };
            // to compute which "visual" line {el} is placed
            // assume no absolute or fixed positioning
            // and row-first ordering instead of column-first (default browser element ordering)
            end = el[$][MARGIN][axis] + el[$][RECT][size] + el[$][MARGIN][axis_opposite];
             // does not miss lines
            if ((0 < runningEnd) && (parent[$][PADDING][axis] + runningEnd + end + parent[$][PADDING][axis_opposite] > parent[$][RECT][size]))
            {
                line++;
                runningEnd = 0;
                mrg = 0;
            }
            el[$].line = line;
            runningEnd += end /*+ mrg*/;
            //mrg += el[$][MARGIN][axis_opposite];
            return el;
        });
        if (items.length)
        {
            first = items[0];
            last = items[items.length-1];
        }

        axis = TOP; size = HEIGHT; axis_opposite = BOTTOM;
        // at most so many lines as items, pre-allocate mem to avoid changing array size all the time
        lines = new Array(items.length);
        items.forEach(function(el) {
            // take 1st (highest) element of each line to define the visual line start position
            // take care of margin bottom/top collapse between siblings and parent/child
            var lineNum = el[$].line, lineStart = el[$][RECT][axis] - el[$][MARGIN][axis] - parent[$][RECT][axis] + parent[$][SCROLL][axis];
            lines[lineNum] = null == lines[lineNum] ? lineStart : stdMath.min(lineStart, lines[lineNum]);
        });

        addClass(parent, self.options.activeArea || 'dnd-sortable-area');
        parent[STYLE].boxSizing = 'border-box';
        parent[STYLE][WIDTH] = Str(parent[$][RECT][WIDTH]) + 'px';
        parent[STYLE][HEIGHT] = Str(parent[$][RECT][HEIGHT]) + 'px';
        parent[STYLE].maxWidth = Str(parent[$][RECT][WIDTH]) + 'px';
        parent[STYLE].maxHeight = Str(parent[$][RECT][HEIGHT]) + 'px';
        dragged.draggable = false; // disable native drag
        addClass(dragged, self.options.activeItem || 'dnd-sortable-dragged');
        hasSymmetricItems = true;
        items.forEach(function(el) {
            var ref = items[0];
            el[STYLE].position = 'absolute';
            el[STYLE].boxSizing = 'border-box';
            el[STYLE].overflow = 'hidden';
            el[STYLE][TOP] = Str(el[$][RECT][TOP] - parent[$][RECT][TOP] + parent[$][SCROLL][TOP] - el[$][MARGIN][TOP]) + 'px';
            el[STYLE][LEFT] = Str(el[$][RECT][LEFT] - parent[$][RECT][LEFT] + parent[$][SCROLL][LEFT] - el[$][MARGIN][LEFT]) + 'px';
            el[STYLE][WIDTH] = Str(el[$][RECT][WIDTH]) + 'px';
            el[STYLE][HEIGHT] = Str(el[$][RECT][HEIGHT]) + 'px';
            if (
                (el[$][RECT][WIDTH] !== ref[$][RECT][WIDTH])
                || (el[$][RECT][HEIGHT] !== ref[$][RECT][HEIGHT])
                || (el[$][MARGIN][TOP] !== ref[$][MARGIN][TOP])
                || (el[$][MARGIN][BOTTOM] !== ref[$][MARGIN][BOTTOM])
                || (el[$][MARGIN][LEFT] !== ref[$][MARGIN][LEFT])
                || (el[$][MARGIN][RIGHT] !== ref[$][MARGIN][RIGHT])
            )
                hasSymmetricItems = false;
        });
        placeholder = DOC.createElement('ul' === tag || 'ol' === tag ? 'li' : ('tr' === tag ? 'td' : ('tbody' === tag || 'thead' === tag || 'tfoot' === tag || 'table' === tag ? 'tr' : 'span')));
        addClass(placeholder, self.options.placeholder || 'dnd-sortable-placeholder');
        placeholder[STYLE].position = 'absolute';
        placeholder[STYLE].display = 'block';
        placeholder[STYLE].boxSizing = 'border-box';
        placeholder[STYLE].margin = '0';
        if (parent === scrollParent)
        {
            // make parent keep its scroll dimensions
            parent[STYLE].paddingLeft = Str(parent[$][SCROLL][WIDTH] - parent[$][RECT][WIDTH]) + 'px';
            parent[STYLE].paddingTop = Str(parent[$][SCROLL][HEIGHT] - parent[$][RECT][HEIGHT]) + 'px';
            parent[STYLE].paddingRight = '0px';
            parent[STYLE].paddingBottom = '0px';
            parent[SLEFT] = parent[$][SCROLL][LEFT];
            parent[STOP] = parent[$][SCROLL][TOP];
        }
        if (isTouch)
        {
            addEvent(DOC, 'touchmove', dragMove, false);
            addEvent(DOC, 'touchend', dragEnd, false);
            addEvent(DOC, 'touchcancel', dragEnd, false);
        }
        else
        {
            addEvent(DOC, 'mousemove', dragMove, false);
            addEvent(DOC, 'mouseup', dragEnd, false);
        }
        dragTimer = setInterval(actualDragMove, delay);
    };

    var restore = function() {
        if (isDraggingStarted)
        {
            if (scrolling)
            {
                clearInterval(scrolling);
                scrolling = null;
            }
            if (isTouch)
            {
                removeEvent(DOC, 'touchmove', dragMove, false);
                removeEvent(DOC, 'touchend', dragEnd, false);
                removeEvent(DOC, 'touchcancel', dragEnd, false);
            }
            else
            {
                removeEvent(DOC, 'mousemove', dragMove, false);
                removeEvent(DOC, 'mouseup', dragEnd, false);
            }
            if (dragTimer)
            {
                clearInterval(dragTimer);
                dragTimer = null;
            }
            if (placeholder && placeholder.parentNode)
            {
                placeholder.parentNode.removeChild(placeholder);
                placeholder[$] = null;
            }
            removeClass(parent, self.options.activeArea || 'dnd-sortable-area');
            restoreStyle(parent, ['width', 'height', 'max-width', 'max-height', 'box-sizing', 'padding-left', 'padding-top', 'padding-right', 'padding-bottom'], parent[$].style);
            if (closest) removeClass(closest, self.options.closestItem || 'dnd-sortable-closest');
            removeClass(dragged, self.options.activeItem || 'dnd-sortable-dragged');
            items.forEach(function(el) {
                restoreStyle(el, [
                    'position',
                    'box-sizing',
                    'overflow',
                    'top',
                    'left',
                    'width',
                    'height',
                    'transform',
                    'transition'
                ]);
                /*if ('absolute' === el[$].$.position)
                {
                    // item has probably moved, update the final position
                    el[STYLE][TOP] = Str(el[$][RECT][TOP] - parent[$][RECT][TOP] + parent[$][SCROLL][TOP] - el[$][MARGIN][TOP]) + 'px';
                    el[STYLE][LEFT] = Str(el[$][RECT][LEFT] - parent[$][RECT][LEFT] + parent[$][SCROLL][LEFT] - el[$][MARGIN][LEFT]) + 'px';
                }
                else if ('fixed' === el[$].$.position)
                {
                    // item has probably moved, update the final position
                    el[STYLE][TOP] = Str(el[$][RECT][TOP] - el[$][MARGIN][TOP]) + 'px';
                    el[STYLE][LEFT] = Str(el[$][RECT][LEFT] - el[$][MARGIN][LEFT]) + 'px';
                }*/
                el[$] = null;
            });
            parent[$] = null;
            if (scrollParent) scrollParent[$] = null;
            isDraggingStarted = false;
        }
    };

    var moveTo = function(movedNode, refNode, dir) {
        if (0 > dir)
        {
            // Move `movedNode` before the `refNode`
            if (first === refNode) first = movedNode;
            if (last === movedNode) last = placeholder[PREV]; // placeholder is right before movedNode
            parent.insertBefore(movedNode, refNode);
        }
        else if (0 < dir)
        {
            // Move `movedNode` after the `refNode`
            if (first === movedNode) first = movedNode[NEXT];
            if (refNode[NEXT])
            {
                parent.insertBefore(movedNode, refNode[NEXT]);
            }
            else
            {
                parent.appendChild(movedNode);
                last = movedNode;
            }
        }
        movedNode[$].index = refNode[$].index;
        parent.insertBefore(placeholder, movedNode);
        
        if (is_callable(self.options.onChange))
            self.options.onChange(movedNode);
        
    };

    var move1D = function(movedNode, refNode, dir, ms) {
        var target = refNode, next, limitNode, offset, delta = 0, margin = 0;
        if (0 > dir)
        {
            limitNode = movedNode[NEXT];
            moveTo(movedNode, refNode, dir);
            movedNode[$].prev[axis] = movedNode[$][RECT][axis];
            margin = movedNode[$][MARGIN][axis] - refNode[$][MARGIN][axis];
            movedNode[$][RECT][axis] = refNode[$][RECT][axis] + margin;
            placeholder[STYLE][axis] = Str(movedNode[$][RECT][axis] - parent[$][RECT][axis] + parent[$][SCROLL][axis]) + 'px';
            delta = movedNode[$][RECT][size] - refNode[$][RECT][size];
            margin += movedNode[$][MARGIN][axis_opposite] - refNode[$][MARGIN][axis_opposite];
            while ((next = refNode[NEXT]) && (next !== limitNode))
            {
                if (refNode[$].animation) refNode[$].animation.stop();
                refNode[$].index++;
                refNode[$].prev[axis] = refNode[$][RECT][axis];
                margin += refNode[$][MARGIN][axis] - next[$][MARGIN][axis];
                refNode[$][RECT][axis] = next[$][RECT][axis] + delta + margin;
                margin += refNode[$][MARGIN][axis_opposite] - next[$][MARGIN][axis_opposite];
                refNode[STYLE][axis] = Str(refNode[$][RECT][axis] - parent[$][RECT][axis] + parent[$][SCROLL][axis] - refNode[$][MARGIN][axis]) + 'px';
                delta += refNode[$][RECT][size] - next[$][RECT][size];
                refNode = next;
            }
            if (refNode[$].animation) refNode[$].animation.stop();
            refNode[$].index++;
            refNode[$].prev[axis] = refNode[$][RECT][axis];
            refNode[$][RECT][axis] = movedNode[$].prev[axis] + delta + margin - movedNode[$][MARGIN][axis] + refNode[$][MARGIN][axis];
            refNode[STYLE][axis] = Str(refNode[$][RECT][axis] - parent[$][RECT][axis] + parent[$][SCROLL][axis] - refNode[$][MARGIN][axis]) + 'px';
        }
        else if (0 < dir)
        {
            limitNode = movedNode[NEXT];
            moveTo(movedNode, refNode, dir);
            refNode = limitNode;
            next = movedNode;
            margin = 0;
            delta = 0;
            next[$].prev[axis] = next[$][RECT][axis];
            do
            {
                if (refNode[$].animation) refNode[$].animation.stop();
                refNode[$].index--;
                refNode[$].prev[axis] = refNode[$][RECT][axis];
                margin += refNode[$][MARGIN][axis] - next[$][MARGIN][axis];
                refNode[$][RECT][axis] = next[$].prev[axis] + delta + margin;
                refNode[STYLE][axis] = Str(refNode[$][RECT][axis] - parent[$][RECT][axis] + parent[$][SCROLL][axis] - refNode[$][MARGIN][axis]) + 'px';
                delta += -(next[$][RECT][size] - refNode[$][RECT][size]);
                margin += refNode[$][MARGIN][axis_opposite] - next[$][MARGIN][axis_opposite];
                next = refNode;
                refNode = refNode[NEXT];
            }
            while ((refNode) && (refNode !== placeholder));
            movedNode[$][RECT][axis] = next[$].prev[axis] + delta + margin - next[$][MARGIN][axis] + movedNode[$][MARGIN][axis];
            placeholder[STYLE][axis] = Str(movedNode[$][RECT][axis] - parent[$][RECT][axis] + parent[$][SCROLL][axis]) + 'px';
        }
        offset = {};
        offset[axis] = target[$][RECT][axis] - target[$].prev[axis];
        animate(target, ms, offset);
    };

    var move2D = function(movedNode, refNode, dir, ms) {
        var target = refNode, line, next, limitNode;
        if (hasSymmetricItems)
        {
            // simpler, faster algorithm for symmetric items
            if (0 > dir)
            {
                limitNode = movedNode[NEXT];
                moveTo(movedNode, refNode, dir);
                movedNode[$].prev.line = movedNode[$].line;
                movedNode[$].prev[TOP] = movedNode[$][RECT][TOP];
                movedNode[$].prev[LEFT] = movedNode[$][RECT][LEFT];
                movedNode[$].line = refNode[$].line;
                movedNode[$][RECT][TOP] = refNode[$][RECT][TOP];
                movedNode[$][RECT][LEFT] = refNode[$][RECT][LEFT];
                placeholder[STYLE][TOP] = Str(movedNode[$][RECT][TOP] - parent[$][RECT][TOP] + parent[$][SCROLL][TOP]) + 'px';
                placeholder[STYLE][LEFT] = Str(movedNode[$][RECT][LEFT] - parent[$][RECT][LEFT] + parent[$][SCROLL][LEFT]) + 'px';
                while ((next = refNode[NEXT]) && (next !== limitNode))
                {
                    if (refNode[$].animation) refNode[$].animation.stop();
                    refNode[$].index++;
                    refNode[$].prev.line = refNode[$].line;
                    refNode[$].prev[TOP] = refNode[$][RECT][TOP];
                    refNode[$].prev[LEFT] = refNode[$][RECT][LEFT];
                    refNode[$].line = next[$].line;
                    refNode[$][RECT][TOP] = next[$][RECT][TOP];
                    refNode[$][RECT][LEFT] = next[$][RECT][LEFT];
                    refNode[STYLE][TOP] = Str(refNode[$][RECT][TOP] - parent[$][RECT][TOP] + parent[$][SCROLL][TOP] - refNode[$][MARGIN][TOP]) + 'px';
                    refNode[STYLE][LEFT] = Str(refNode[$][RECT][LEFT] - parent[$][RECT][LEFT] + parent[$][SCROLL][LEFT] - refNode[$][MARGIN][LEFT]) + 'px';
                    refNode = next;
                }
                if (refNode[$].animation) refNode[$].animation.stop();
                refNode[$].index++;
                refNode[$].prev.line = refNode[$].line;
                refNode[$].prev[TOP] = refNode[$][RECT][TOP];
                refNode[$].prev[LEFT] = refNode[$][RECT][LEFT];
                refNode[$].line = movedNode[$].prev.line;
                refNode[$][RECT][TOP] = movedNode[$].prev[TOP];
                refNode[$][RECT][LEFT] = movedNode[$].prev[LEFT];
                refNode[STYLE][TOP] = Str(refNode[$][RECT][TOP] - parent[$][RECT][TOP] + parent[$][SCROLL][TOP] - refNode[$][MARGIN][TOP]) + 'px';
                refNode[STYLE][LEFT] = Str(refNode[$][RECT][LEFT] - parent[$][RECT][LEFT] + parent[$][SCROLL][LEFT] - refNode[$][MARGIN][LEFT]) + 'px';
            }
            else if (0 < dir)
            {
                limitNode = movedNode[NEXT];
                moveTo(movedNode, refNode, dir);
                refNode = limitNode;
                next = movedNode;
                next[$].prev.line = next[$].line;
                next[$].prev[TOP] = next[$][RECT][TOP];
                next[$].prev[LEFT] = next[$][RECT][LEFT];
                do
                {
                    if (refNode[$].animation) refNode[$].animation.stop();
                    refNode[$].index--;
                    refNode[$].prev.line = refNode[$].line;
                    refNode[$].prev[TOP] = refNode[$][RECT][TOP];
                    refNode[$].prev[LEFT] = refNode[$][RECT][LEFT];
                    refNode[$].line = next[$].prev.line;
                    refNode[$][RECT][TOP] = next[$].prev[TOP];
                    refNode[$][RECT][LEFT] = next[$].prev[LEFT];
                    refNode[STYLE][TOP] = Str(refNode[$][RECT][TOP] - parent[$][RECT][TOP] + parent[$][SCROLL][TOP] - refNode[$][MARGIN][TOP]) + 'px';
                    refNode[STYLE][LEFT] = Str(refNode[$][RECT][LEFT] - parent[$][RECT][LEFT] + parent[$][SCROLL][LEFT] - refNode[$][MARGIN][LEFT]) + 'px';
                    next = refNode;
                    refNode = refNode[NEXT];
                }
                while ((refNode) && (refNode !== placeholder));
                movedNode[$].line = next[$].prev.line;
                movedNode[$][RECT][TOP] = next[$].prev[TOP];
                movedNode[$][RECT][LEFT] = next[$].prev[LEFT];
                placeholder[STYLE][TOP] = Str(movedNode[$][RECT][TOP] - parent[$][RECT][TOP] + parent[$][SCROLL][TOP]) + 'px';
                placeholder[STYLE][LEFT] = Str(movedNode[$][RECT][LEFT] - parent[$][RECT][LEFT] + parent[$][SCROLL][LEFT]) + 'px';
            }
            animate(target, ms, {
                top: target[$][RECT][TOP] - target[$].prev[TOP],
                left: target[$][RECT][LEFT] - target[$].prev[LEFT]
            });
        }
        else
        {
            // general algorithm for asymmetric items
            if (0 > dir)
            {
                next = placeholder[PREV];
                limitNode = refNode[PREV] || refNode;
                moveTo(movedNode, refNode, dir);
            }
            else if (0 < dir)
            {
                next = movedNode[NEXT];
                limitNode = placeholder[PREV] || movedNode[NEXT];
                moveTo(movedNode, refNode, dir);
            }
            updateIndex(movedNode, next, dir, placeholder);
            line = limitNode[$].line;
            limitNode = lineStart(limitNode, line);
            // update layout
            layout1(limitNode, line, parent, movedNode, placeholder, scroll, LEFT, WIDTH, RIGHT);
            layout2(limitNode, lines, parent, movedNode, placeholder, scroll, TOP, HEIGHT, BOTTOM);
            animate(target, ms, {
                top: target[$][RECT][TOP] - target[$].prev[TOP],
                left: target[$][RECT][LEFT] - target[$].prev[LEFT]
            });
        }
    };

    move = UNRESTRICTED === TYPE ? move2D : move1D;
    intersect = UNRESTRICTED === TYPE ? intersect2D : intersect1D;

    var dragStart = function(e) {
        if (!canHandle || isDraggingStarted || !self.options.container) return;
        // not with right click
        if (mouse_evt.test(e.type) && (0 !== e.button)) return;

        clear();

        handler = e.target;
        if (
            !handler
            || !hasClass(handler, self.options.handle || 'dnd-sortable-handle')
        )
        {
            clear();
            return;
        }

        dragged = closestElement(handler, self.options.item || 'dnd-sortable-item');
        if (!dragged)
        {
            clear();
            return;
        }

        parent = dragged.parentNode;
        if (
            !parent
            || (is_string(self.options.container)
            && (parent.id !== self.options.container))
            || (!is_string(self.options.container)
            && (parent !== self.options.container))
        )
        {
            clear();
            return;
        }

        if (is_callable(self.options.onStart))
            self.options.onStart(dragged);

        if (is_callable(self.options.itemFilter))
        {
            dragged = self.options.itemFilter(dragged);
            if (!dragged)
            {
                clear();
                return;
            }
        }

        isDraggingStarted = true;
        DOC = dragged.ownerDocument || document;
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        e.stopImmediatePropagation && e.stopImmediatePropagation();

        isTouch = e.touches && e.touches.length;

        prepare();

        curX = lastX = isTouch ? e.touches[0].clientX : e.clientX;
        curY = lastY = isTouch ? e.touches[0].clientY : e.clientY;
        X0 = lastX;
        Y0 = lastY;
        lastDeltaX = 0;
        lastDeltaY = 0;
        dirX = 0;
        dirY = 0;

        parent.insertBefore(placeholder, dragged);
        placeholder[STYLE][WIDTH] = Str(dragged[$][RECT][WIDTH]) + 'px';
        placeholder[STYLE][HEIGHT] = Str(dragged[$][RECT][HEIGHT]) + 'px';
        placeholder[STYLE][TOP] = Str(dragged[$][RECT][TOP] - parent[$][RECT][TOP] + parent[$][SCROLL][TOP]) + 'px';
        placeholder[STYLE][LEFT] = Str(dragged[$][RECT][LEFT] - parent[$][RECT][LEFT] + parent[$][SCROLL][LEFT]) + 'px';

        if (HORIZONTAL !== TYPE) dragged[STYLE][TOP] = Str(lastY - Y0 + dragged[$][RECT][TOP] - parent[$][RECT][TOP] + parent[$][SCROLL][TOP] - dragged[$][MARGIN][TOP]) + 'px';
        if (VERTICAL !== TYPE) dragged[STYLE][LEFT] = Str(lastX - X0 + dragged[$][RECT][LEFT] - parent[$][RECT][LEFT] + parent[$][SCROLL][LEFT] - dragged[$][MARGIN][LEFT]) + 'px';
    };

    var dragMove = throttle(function(e) {
        curX = isTouch ? e.touches[0].clientX : e.clientX;
        curY = isTouch ? e.touches[0].clientY : e.clientY;
    }, delay);

    var actualDragMove = function() {
        var hovered, p = 0.0, Y, X, deltaX, deltaY, delta, centerX, centerY,
            c = TOP, s = HEIGHT, zc = LEFT, zs = WIDTH, z,
            d = 25, d1, d2, d3, d4, sx, sy, tX = 0, tY = 0,
            changedDirX = false, changedDirY = false;

        if (VERTICAL === TYPE)
        {
            zc = TOP;
            zs = HEIGHT;
        }

        X = curX;
        Y = curY;
        deltaX = X - lastX;
        deltaY = Y - lastY;
        lastDeltaX = 0 === lastDeltaX ? deltaX : lastDeltaX;
        lastDeltaY = 0 === lastDeltaY ? deltaY : lastDeltaY;
        dirX = 0 !== deltaX ? sign(deltaX) : (0 !== lastDeltaX ? sign(lastDeltaX) : dirX);
        dirY = 0 !== deltaY ? sign(deltaY) : (0 !== lastDeltaY ? sign(lastDeltaY) : dirY);
        lastX = X;
        lastY = Y;

        scroll = computeScroll(parent, scrollParent);
        if (HORIZONTAL !== TYPE)
        {
            dragged[$].r[TOP] = lastY - Y0 + dragged[$][RECT][TOP];
            dragged[STYLE][TOP] = Str(dragged[$].r[TOP] - parent[$][RECT][TOP] + parent[$][SCROLL][TOP] - dragged[$][MARGIN][TOP] + scroll[TOP]) + 'px';
            changedDirY = 0 > deltaY*lastDeltaY;
        }
        if (VERTICAL !== TYPE)
        {
            dragged[$].r[LEFT] = lastX - X0 + dragged[$][RECT][LEFT];
            dragged[STYLE][LEFT] = Str(dragged[$].r[LEFT] - parent[$][RECT][LEFT] + parent[$][SCROLL][LEFT] - dragged[$][MARGIN][LEFT] + scroll[LEFT]) + 'px';
            changedDirX = 0 > deltaX*lastDeltaX;
        }

        if (self.options.autoscroll && scrollParent && (!scrolling || changedDirX || changedDirY))
        {
            if (scrolling)
            {
                clearInterval(scrolling);
                scrolling = null;
            }
            if (scrollEl === scrollParent)
            {
                d1 = scrollParent[$][RECT][WIDTH];
                d2 = 0;
                d3 = scrollParent[$][RECT][HEIGHT];
                d4 = 0;
                sx = 1.5;
                sy = 1.5;
            }
            else
            {
                d1 = scrollParent[$][RECT][RIGHT];
                d2 = scrollParent[$][RECT][LEFT];
                d3 = scrollParent[$][RECT][BOTTOM];
                d4 = scrollParent[$][RECT][TOP];
                sx = 1.2;
                sy = 1.2;
            }
            if (
                (VERTICAL !== TYPE)
                && ((0 < dirX
                && scrollParent[SLEFT] + scrollParent[$][RECT][WIDTH] < scrollParent[$][SCROLL][WIDTH]
                && dragged[$].r[LEFT] + dragged[$].r[WIDTH] >= d1)
                || (0 > dirX
                && 0 < scrollParent[SLEFT]
                && dragged[$].r[LEFT] <= d2))
            )
            {
                tX = stdMath.round(dirX * sx * dragged[$].r[WIDTH]);
            }
            if (
                (HORIZONTAL !== TYPE)
                && ((0 < dirY
                && scrollParent[STOP] + scrollParent[$][RECT][HEIGHT] < scrollParent[$][SCROLL][HEIGHT]
                && dragged[$].r[TOP] + dragged[$].r[HEIGHT] >= d3)
                || (0 > dirY
                && 0 < scrollParent[STOP]
                && dragged[$].r[TOP] <= d4))
            )
            {
                tY = stdMath.round(dirY * sy * dragged[$].r[HEIGHT]);
            }
            if (tX || tY) scrolling = (function(tX, tY, tS, dt) {
                    var sT = scrollParent[STOP] || 0, sL = scrollParent[SLEFT] || 0,
                        duration = 0, vX = tX / (tS || dt), vY = tY / (tS || dt);
                    return setInterval(function() {
                        duration += dt;
                        sT += vY * dt;
                        sL += vX * dt;
                        scrollParent[STOP] = stdMath.min(stdMath.max(0, sT), scrollParent[$][SCROLL][HEIGHT] - scrollParent[$][RECT][HEIGHT]);
                        scrollParent[SLEFT] = stdMath.min(stdMath.max(0, sL), scrollParent[$][SCROLL][WIDTH] - scrollParent[$][RECT][WIDTH]);
                        if (scrolling && (duration >= tS))
                        {
                            clearInterval(scrolling);
                            scrolling = null;
                        }
                    }, dt);
                })(stdMath.abs(tX) > stdMath.abs(tY) ? tX : 0, stdMath.abs(tY) >= stdMath.abs(tX) ? tY : 0, self.options.scrollAnimationMs || 0, dt);
        }

        lastDeltaX = deltaX;
        lastDeltaY = deltaY;
        // correct
        centerX = dragged[$].r[LEFT] + dragged[$].r[WIDTH] / 2;
        centerY = dragged[$].r[TOP] + dragged[$].r[HEIGHT] / 2;
        z = dragged[$].r[zc];

        hovered = concat(
                elementsAt(DOC, X, Y), // current mouse pos
                VERTICAL === TYPE ? [] : elementsAt(DOC, dragged[$].r[LEFT]  + 2, centerY), // left side
                VERTICAL === TYPE ? [] : elementsAt(DOC, dragged[$].r[LEFT]  + dragged[$].r[WIDTH] - 2, centerY), // right side
                HORIZONTAL === TYPE ? [] : elementsAt(DOC, centerX, dragged[$].r[TOP] + 2), // top side
                HORIZONTAL === TYPE ? [] : elementsAt(DOC, centerX, dragged[$].r[TOP] + dragged[$].r[HEIGHT] - 2) // bottom side
                ).reduce(function(candidate, el) {
                    if ((el !== dragged) && (el !== placeholder) && (el.parentNode === parent))
                    {
                        var pp = intersect(dragged, el, scroll, axis, size);
                        if (pp > p)
                        {
                            p = pp;
                            candidate = el;
                        }
                    }
                    return candidate;
                }, null);


        if (UNRESTRICTED === TYPE)
        {
            if (
                !hovered
                && (dragged !== first)
                && (0 <= first[$][RECT][zc] - scroll[zc] - (z + dragged[$][RECT][zs]))
                && (first[$][RECT][zc] - scroll[zc] - (z + dragged[$][RECT][zs]) < d)
                && (0.7 < (p = intersect1D(dragged, first, scroll, c, s)))
            )
                hovered = first;

            if (
                !hovered
                && (dragged !== last)
                && (0 <= z - (last[$][RECT][zc] - scroll[zc] + last[$][RECT][zs]))
                && (z - (last[$][RECT][zc] - scroll[zc] + last[$][RECT][zs]) < d)
                && (0.7 < (p = intersect1D(dragged, last, scroll, c, s)))
            )
                hovered = last;

            delta = hovered ? hovered[$].index - dragged[$].index : (stdMath.abs(dirY) >= stdMath.abs(dirX) ? dirY : dirX);
        }
        else
        {
            if (
                !hovered
                && (dragged !== first)
                && (first[$][RECT][zc] - scroll[zc] > (z + dragged[$][RECT][zs]))
            )
                hovered = first;

            if (
                !hovered
                && (dragged !== last)
                && (z > (last[$][RECT][zc] - scroll[zc] + last[$][RECT][zs]))
            )
                hovered = last;

            delta = HORIZONTAL === TYPE ? dirX : dirY;
        }

        if (
            closest
            && (
                (0 > dir && 0 < delta && overlap < 0.5)
                || (0 < dir && 0 > delta && overlap < 0.5)
                || (hovered && (closest !== hovered) && (overlap < p))
                || (!intersect(dragged, closest, scroll, axis, size))
            )
        )
        {
            removeClass(closest, self.options.closestItem || 'dnd-sortable-closest');
            overlap = 0; closest = null;
        }

        if (!closest && hovered && p)
        {
            closest = hovered;
            dir = 0 < delta ? 1 : -1;
            overlap = p;
            moved = false;
        }

        if (closest)
        {
            p = p || intersect(dragged, closest, scroll, axis, size);
            if (p)
            {
                overlap = p;
                if (p > 0.2)
                {
                    addClass(closest, self.options.closestItem || 'dnd-sortable-closest');
                    if ((p > 0.5) && !moved)
                    {
                        X0 -= dragged[$][RECT][LEFT];
                        Y0 -= dragged[$][RECT][TOP];
                        moved = true;
                        move(dragged, closest, dir, self.options.animationMs || 0);
                        X0 += dragged[$][RECT][LEFT];
                        Y0 += dragged[$][RECT][TOP];
                    }
                }
                else
                {
                    removeClass(closest, self.options.closestItem || 'dnd-sortable-closest');
                }
            }
            else
            {
                removeClass(closest, self.options.closestItem || 'dnd-sortable-closest');
                overlap = 0; closest = null;
            }
        }
    };

    var dragEnd = function(e) {
        var el = dragged;
        restore();
        clear();
        if (is_callable(self.options.onEnd))
            self.options.onEnd(el);
    };

    self.start = self.options.callable ? function() {
        if (canHandle) return;
        attached = false;
        canHandle = true;
        self.handle = dragStart;
    } : function() {
        if (canHandle) return;
        canHandle = true;
        if (!attached)
        {
            attached = true;
            addEvent(document, 'touchstart', dragStart, {capture:true, passive:false});
            addEvent(document, 'mousedown', dragStart, {capture:true, passive:false});
        }
    };

    self.stop = function() {
        self.handle = null;
        canHandle = false;
        if (attached)
        {
            removeEvent(document, 'touchstart', dragStart, {capture:true, passive:false});
            removeEvent(document, 'mousedown', dragStart, {capture:true, passive:false});
            attached = false;
        }
        restore();
        clear();
    };
}

function AreaSortable(type, options)
{
    var self = this;
    if (!(self instanceof AreaSortable)) return new AreaSortable(type, options);
    self.options = options || {};
    type = Str(type);
    switch (type.toLowerCase())
    {
        case 'unrestricted':
            setup(self, UNRESTRICTED);
            break;
        case 'horizontal':
            setup(self, HORIZONTAL);
            break;
        case 'vertical':
            setup(self, VERTICAL);
            break;
        default:
            throw new TypeError('AreaSortable invalid sort mode:' + type);
            break;
    }
    self.start();
}
AreaSortable.VERSION = VERSION;
AreaSortable.prototype = {
    constructor: AreaSortable
    ,options: null
    ,start: null
    ,handle: null
    ,stop: null
    ,dispose: function() {
        var self = this;
        if (self.stop) self.stop();
        self.options = null;
        self.start = null;
        self.handle = null;
        self.stop = null;
        return self;
    }
};

return AreaSortable;
});

export function getProportions (photo, container, mode = 'contain') {
  let _w = photo.naturalWidth || photo.width;
  let _h = photo.naturalHeight || photo.height;
  if (mode === "manual" || (!container.height && !container.width)) {
    return {
      scaleX: 1,
      scaleY: 1,
      scale: 1,
      width: _w,
      height: _h
    };
  }
  if (!photo.height && !photo.width) {
    return {
      scaleX: 0.001,
      scaleY: 0.001,
      scale:  0.001,
      width: container.width,
      height: container.height
    };
  }
  let scaleX = container.width && container.width / _w || 999;
  let scaleY = container.height && container.height / _h || 999;

  if (mode === 'fill') {
    //scale = Math.max(scaleX, scaleY);
  }
  if (mode === 'cover') {
    scaleX = scaleY = Math.max(scaleX, scaleY);
  }
  if (mode === 'contain') {
    scaleX = scaleY = Math.min(scaleX, scaleY);
  }
  if (mode === 'contain-center') {
    scaleX = scaleY = Math.min(scaleX, scaleY,1);
  }
  if (mode === 'center') {
    scaleX = scaleY = 1;
  }
  let output = {
    scaleX: scaleX,
    scaleY: scaleY,
    width: _w * scaleX,
    height: _h * scaleY
  };

  if (scaleX === scaleY) {
    output.scale = scaleX;
  }

  return output;
};

export function getRect (width, height, options) {
  let rect = {}, _flexArray;
  _flexArray = fabric.util.flex(width, [{value: options.left, flex: 0}, {
    value: options.width,
    flex: 1
  }, {value: options.right, flex: 0}]);
  rect.left = _flexArray[0];
  rect.width = _flexArray[1];
  rect.right = _flexArray[2];

  _flexArray = fabric.util.flex(height, [{value: options.top, flex: 0}, {
    value: options.height,
    flex: 1
  }, {value: options.bottom, flex: 0}]);
  rect.top = _flexArray[0];
  rect.height = _flexArray[1];
  rect.bottom = _flexArray[2];
  return rect;
};

/**stretchable
 * will divide total width for every object in columnts array
 *
 *
 * @example
 *     let _flexArray = fabric.util.flex(200 , [{flex: 0},{value: 100, flex: 1},{flex: 0}] );
 * @param total
 * @param columns
 * @returns {Array}
 * @example [50,100,50]
 */

export function flex (total, columns) {
  let _return = [];
  let split = 0;
  columns.forEach(function (column, index) {
    if (column.value === undefined) {
      split++;
    } else {
      total -= column.value;
    }
  });
  let _w = total / split;
  columns.forEach(function (column) {
    _return.push(column.value === undefined ? _w : column.value);
  });
  return _return;
}

export default {
  getProportions,
  getRect,
  flex
}

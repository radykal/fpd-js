// require("core-js/modules/es.object.values");
// require('./plugins/default-passive-events.js');


import fabric from './fiera.js'

/**
 * freedrawing
 */
import './canvas/freeDrawingBrush.js'
import './fabric/brushes/base_brush.class.js'
import './fabric/brushes/pencil_brush.class.js'
import './fabric/brushes/circle_brush.class.js'
import './fabric/brushes/spray_brush.class.js'
import './fabric/brushes/pattern_brush.class.js'
import './brushes/BaseBrush.js'
import './brushes/PencilBrush.js'
import './brushes/ShapeBrush.js'
import './brushes/PolygonBrush.js'
// require('./brushes/PaintPenBrush');
// require('./brushes/PaintBucketBrush');
// require('./brushes/PointsBrush');

import './canvas/thumb.js'
import './canvas/outer-canvas.js'
import './canvas/areas.js'
import './canvas/alignment.js'
import './modules/snap.js'
import './canvas/droppable.js'
import './canvas/paste.js'
import './modules/upload.js'
import './modules/grid.js'
import './modules/transformations.js'
import './modules/undo.js'
import './modules/fabric.tabbable.js'
import './modules/object.order.js'
import './modules/loader.js'
import './modules/ruler.js'
import './modules/zoom.js'
import './modules/export.js'
import './canvas/stretchable.js'
import './text/staticBorderColor.js'

export default fabric;

// fabric.media.sample = require("!url-loader!./media/sample.jpg");
// fabric.media.error  = require("!url-loader!./media/missing.png");
// fabric.media.wanted = require("!svg-inline-loader!./media/wanted.svg");

// import './plugins/debugObjects.js'
import './modules/editor.debug.js'

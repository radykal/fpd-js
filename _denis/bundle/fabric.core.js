

import fabric from './fabric/main.js'
import './polyfills/canvas.toblob.js'


import './fabric/mixins/observable.mixin.js'
import './fabric/mixins/collection.mixin.js'
import './fabric/mixins/shared_methods.mixin.js'
import './fabric/util/misc.js'
import './fabric/util/arc.js'
import './fabric/util/lang_array.js'
import './fabric/util/lang_object.js'


import './fabric/util/lang_string.js'
import StringUtils from './util/string.js'
Object.assign(fabric.util.string, StringUtils)


import './fabric/util/lang_class.js'
import './fabric/util/dom_event.js'
import './fabric/util/dom_style.js'
import './fabric/util/dom_misc.js'
import './fabric/util/dom_request.js'
import './fabric/util/named_accessors.mixin.js'
import './fabric/util/parser.js'
import './fabric/util/elements_parser.js'

/** core logic **/
import './fabric/classes/point.class.js'
import './fabric/classes/intersection.class.js'
import './fabric/classes/color.class.js'
import './fabric/classes/static_canvas.class.js'
import './fabric/classes/canvas.class.js'
import './fabric/mixins/canvas_events.mixin.js'
import './fabric/mixins/canvas_grouping.mixin.js'
import './fabric/mixins/canvas_dataurl_exporter.mixin.js'
import './fabric/mixins/canvas_serialization.mixin.js'
import './fabric/shapes/object.class.js'

import './fabric/mixins/object_origin.mixin.js'
import './fabric/mixins/object_geometry.mixin.js'
import './fabric/mixins/object_stacking.mixin.js'
import './fabric/mixins/object.svg_export.js'
import './fabric/mixins/stateful.mixin.js'

/* animations */
import './fabric/util/animate.js'
import './fabric/util/animate_color.js'
import './fabric/util/anim_ease.js'
import './fabric/mixins/animation.mixin.js'


/** interaction and gestures **/
import './fabric/mixins/object_interactivity.mixin.js'
import './fabric/mixins/canvas_gestures.mixin.js'


/** basic classes **/
import './fabric/shapes/line.class.js'
import './fabric/shapes/circle.class.js'
import './fabric/shapes/triangle.class.js'
import './fabric/shapes/ellipse.class.js'
import './fabric/shapes/rect.class.js'
import './fabric/shapes/polyline.class.js'
import './fabric/shapes/polygon.class.js'
import './fabric/shapes/path.class.js'
import './fabric/shapes/group.class.js'
import './fabric/shapes/image.class.js'
import './fabric/shapes/active_selection.class.js'
import './fabric/mixins/object_straightening.mixin.js'


/** Text **/
import './fabric/shapes/text.class.js'
import './fabric/mixins/text_style.mixin.js'
import './fabric/shapes/itext.class.js'
import './fabric/mixins/itext_behavior.mixin.js'
import './fabric/mixins/itext_click_behavior.mixin.js'
import './fabric/mixins/itext_key_behavior.mixin.js'
import './fabric/mixins/itext.svg_export.js'
import './fabric/shapes/textbox.class.js'
// require('./fabric/mixins/textbox_behavior.mixin.js');

/* additional classes */
import './fabric/classes/gradient.class.js'
import './fabric/classes/pattern.class.js'
import './fabric/classes/shadow.class.js'

import './fabric/lib/event.js'

export default fabric;

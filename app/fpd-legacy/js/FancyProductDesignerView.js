
import FancyProductDesignerOptions from './Options.js'
import {FPDUtil, FPDPathGroupName, FPDDisallowChars} from './Util.js'

/**
 * The class to create a view. A view contains the canvas. You need to call {{#crossLink "FancyProductDesignerView/setup:method"}}{{/crossLink}} to set up the canvas with all elements, after setting an instance of {{#crossLink "FancyProductDesignerView"}}{{/crossLink}}.
 *
 * @class FancyProductDesignerView
 * @constructor
 * @param {jQuery} elem - jQuery object holding the container.
 * @param {Object} view - The default options for the view.
 * @param {Function} callback - This function will be called as soon as the view and all initial elements are loaded.
 * @param {Object} fabricjsCanvasOptions - Options for the fabricjs canvas.
 */
export default function FancyProductDesignerView ($productStage, view, callback, fabricCanvasOptions) {

	'use strict';

	$ = jQuery;

	fabricCanvasOptions = typeof fabricCanvasOptions === 'undefined' ? {} : fabricCanvasOptions;

	var $this = $(this),
		instance = this,
		mouseDownStage = false,
		initialElementsLoaded = false,
		tempModifiedParameters = null,
		modifiedType = null,
		limitModifyParameters = {},
		fpdOptions = new FancyProductDesignerOptions();

	var _initialize = function() {

		/**
		 * The view title.
		 *
		 * @property title
		 * @type String
		 */
		instance.title = view.title;
		/**
		 * The view thumbnail.
		 *
		 * @property thumbnail
		 * @type String
		 */
		instance.thumbnail = view.thumbnail;
		/**
		 * The view elements.
		 *
		 * @property elements
		 * @type Object
		 */
		instance.elements = [];
		/**
		 * The view options.
		 *
		 * @property options
		 * @type Object
		 */
		instance.options = view.options;
		/**
		 * The view undos.
		 *
		 * @property undos
		 * @type Array
		 * @default []
		 */
		instance.undos = [];
		/**
		 * The view redos.
		 *
		 * @property redos
		 * @type Array
		 * @default []
		 */
		instance.redos = [];
		/**
		 * The total price for the view without max. price.
		 *
		 * @property totalPrice
		 * @type Number
		 * @default 0
		 */
		instance.totalPrice = 0;
		/**
		 * The total price for the view including max. price and corrert formatting.
		 *
		 * @property truePrice
		 * @type Number
		 * @default 0
		 */
		instance.truePrice = 0;
		/**
		 * Additional price for the view.
		 *
		 * @property additionalPrice
		 * @type Number
		 * @default 0
		 */
		instance.additionalPrice = 0;
		/**
		 * The set zoom for the view.
		 *
		 * @property zoom
		 * @type Number
		 * @default 0
		 */
		instance.zoom = 1;
		/**
		 * The responsive scale.
		 *
		 * @property responsiveScale
		 * @type Number
		 * @default 1
		 */
		instance.responsiveScale = 1;
		/**
		 * The current selected element.
		 *
		 * @property currentElement
		 * @type fabric.Object
		 * @default null
		 */
		instance.currentElement = null;
		/**
		 * The current selected bounding box object.
		 *
		 * @property currentBoundingObject
		 * @type fabric.Object
		 * @default null
		 */
		instance.currentBoundingObject = null;
		/**
		 * The title of the current selected upload zone.
		 *
		 * @property currentUploadZone
		 * @type String
		 * @default null
		 */
		instance.currentUploadZone = null;
		/**
		 * An instance of fabricjs canvas class. <a href="http://fabricjs.com/docs/fabric.Canvas.html" target="_blank">It allows to interact with the fabricjs API.</a>
		 *
		 * @property stage
		 * @type fabric.Canvas
		 * @default null
		 * @deprecated since version 4.7.7, use fCanv instead
		 */
		instance.stage = null;
		/**
		 * An instance of fabricJS canvas class. <a href="http://fabricjs.com/docs/fabric.Canvas.html" target="_blank">It allows to interact with the fabricjs API.</a>
		 *
		 * @property fCanv
		 * @type fabric.Canvas
		 * @default null
		 */
		instance.fCanv = null;
		/**
		 * The properties for the mask object (url, left, top, width, height).
		 *
		 * @property mask
		 * @type Object
		 * @default null
		 */
		instance.mask = view.mask ? view.mask : null;
		/**
		 * The image object that is going to be used as mask for this view.
		 *
		 * @property maskObject
		 * @type fabric.Image
		 * @default null
		 */
		instance.maskObject = null;
		/**
		 * A fabric.Rect representing the printing box.
		 *
		 * @property printingBoxObject
		 * @type fabric.Rect
		 * @default null
		 */
		instance.printingBoxObject = null;
		/**
		 * The locked state of the view.
		 *
		 * @property locked
		 * @type Boolean
		 * @default false
		 */
		instance.locked = view.locked !== undefined ? view.locked : view.options.optionalView;
		instance.dragStage = false;
		instance.isCustomized = false;

		//PLUS
		instance.textPlaceholder = null;
		instance.numberPlaceholder = null;
		instance.names_numbers = view.names_numbers ? view.names_numbers : null;

		//replace old width option with stageWidth
		if(instance.options.width) {
			instance.options.stageWidth = instance.options.width;
			delete instance.options['width'];
		}

		//add new canvas
		$productStage.append('<canvas></canvas>');

		$this.on('elementAdd', function(evt, element){

			if(!element) {
				return;
			}

			//check for other topped elements
			_bringToppedElementsToFront();

			if(element.isCustom && !element.hasUploadZone && !element.replace) {
				element.copyable = element.originParams.copyable = true;
				instance.stage.renderAll();
			}

		});

		//create fabric stage
		var selectionColor = '#54dfe6',
			canvas = $productStage.children('canvas:last').get(0),
			canvasOptions = $.extend({}, {
				containerClass: 'fpd-view-stage fpd-hidden',
				selection: instance.options.multiSelection,
				selectionBorderColor: selectionColor,
				selectionColor: FPDUtil.convertHexToRGBA(selectionColor, 10),
				hoverCursor: 'pointer',
				controlsAboveOverlay: true,
				centeredScaling: true,
				allowTouchScrolling: true,
				preserveObjectStacking: true
			}, fabricCanvasOptions);

		instance.fCanv = instance.stage = new fabric.Canvas(canvas, canvasOptions).on({
			'object:added': function(opts) {

				var element = opts.target,
					price = element.price;

				if(instance.options.cornerControlsStyle !== 'basic') {

					element.calcCoords = element._fpdBasicCalcCoords;
					element._setCornerCoords = element._fpdBasicsetCornerCoords;
					element._getRotatedCornerCursor = element._fpdBasicgetRotatedCornerCursor;
					element._drawControl = element._fpdBasicdrawControl;

				}

				//if element is added into upload zone, use upload zone price if one is set
				if((element._addToUZ && element._addToUZ != '')) {

					var uploadZoneObj = instance.getElementByTitle(element._addToUZ);
					price = uploadZoneObj && uploadZoneObj.price ? uploadZoneObj.price : price;

				}

				if(price !== undefined &&
					price !== 0 &&
					!element.uploadZone &&
					!element._ignore &&
					(!element.chargeAfterEditing || element._isPriced)
				) {
					element.setCoords();
					instance.changePrice(price, '+');

				}

				$this.trigger('fabricObject:added', [element]);

			},
			'object:removed': function(opts) {

				var element = opts.target;

				if(element.price !== undefined && element.price !== 0 && !element.uploadZone
					&& (!element.chargeAfterEditing || element._isPriced)) {
					instance.changePrice(element.price, '-');
				}

				$this.trigger('fabricObject:removed', [element]);

			},
			'selection:created': _selectionUpdated,
			'selection:updated': _selectionUpdated
		});

		instance.stage.setDimensions({width: instance.options.stageWidth, height: instance.options.stageHeight});

		if(instance.mask) {
			instance.setMask(instance.mask);
		}

		instance.renderPrintingBox();

	};

	/**
	* modified to use with `offsetCorner` property
	* @param absolute
	* @returns {{tl: *|fabric.Point, tr: *|fabric.Point, br: *|fabric.Point, bl: *|fabric.Point}}
	*/
	var calcCoords = function (absolute) {

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
		if(this.offsetCorner){
		  var cornerCenterW = dim.x / 2 + this.offsetCorner,
		    cornerCenterH = dim.y / 2 + this.offsetCorner;
		  tl._corner = transformPoint({x: -cornerCenterW, y: -cornerCenterH}, finalMatrix);
		  tr._corner = transformPoint({x:   cornerCenterW, y: -cornerCenterH}, finalMatrix);
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
		    if(this.offsetCorner) {
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
		  if(this.offsetCorner) {
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
	var _setCornerCoords = function() {
		var coords = this.oCoords,
		  newTheta = fabric.util.degreesToRadians(45 - this.angle),
		  cornerHypotenuse = this.cornerSize * 0.707106,
		  cosHalfOffset = cornerHypotenuse * fabric.util.cos(newTheta),
		  sinHalfOffset = cornerHypotenuse * fabric.util.sin(newTheta),
		  x, y;

		for (var point in coords) {
		  //modified to use with `offsetCorner` property
		  if(coords[point]._corner){
		    x = coords[point]._corner.x;
		    y = coords[point]._corner.y;
		  }else{
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


	var _getRotatedCornerCursor = function (corner, target, e) {
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
	    case 'bl':
	      return 'pointer';
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
	var _drawControl = function (control, ctx, methodName, left, top) {

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

	    if (control === 'br' || control === 'mtr' || control === 'tl' || control === 'bl' || control === 'ml' || control === 'mr' || control === 'mb' || control === 'mt') {
	      switch (control) {

	        case 'tl':
	          //copy
	          left = left -  offsetCorner;
	          top = top -  offsetCorner;
	          icon = this.__editorMode || this.copyable ? String.fromCharCode('0xe942') : false;
	          break;
	        case 'mtr':
	          // rotate
	          var rotateRight = width / 2;
	          left = left + rotateRight +  offsetCorner;
	          top = top -  offsetCorner;
	          icon = (this.__editorMode || this.rotatable) ? String.fromCharCode('0xe923') : false;
	          break;
	        case 'br':
	          // resize
	          left = left +  offsetCorner;
	          top = top +  offsetCorner;
	          icon = (this.__editorMode || this.resizable) && this.type !== 'textbox' ? String.fromCharCode('0xe922') : false;
	          break;
	        case 'bl':
	          //remove
	          left = left -  offsetCorner;
	          top = top +  offsetCorner;
	          icon = this.__editorMode || this.removable ? String.fromCharCode('0xe926') : false;
	          break;
	      }
	    }

	    this.transparentCorners || ctx.clearRect(left, top, size, size);

	    var extraLeftOffset = control === 'mt' || control === 'mb' ? 5 : 0;
	    ctx.fillStyle = this.cornerColor;

	   if (((control === 'ml' || control === 'mr') && !this.lockScalingX) || ((control === 'mt' || control === 'mb') && !this.lockScalingY)) {
		    ctx.beginPath();
		    left += dotSize * 3;
		    top += dotSize * 3;
		    ctx.arc(left, top, dotSize, 0, 2 * Math.PI);
		    ctx.fillStyle = this.cornerIconColor;
		    ctx.fill();
		  }
		  else if(icon) {
		    ctx.fillRect(left, top, size, size);
		    ctx.font = iconSize + 'px FontFPD';
		    ctx.fillStyle = this.cornerIconColor;
		    ctx.textAlign = 'left';
		    ctx.textBaseline = 'top';
		    ctx.fillText(icon, left + iconOffset + extraLeftOffset, top + iconOffset);
		  }

	  }
	};

	var _selectionUpdated = function(opts) {

		if(instance.options.multiSelection && opts.target && opts.target.type === 'activeSelection') {

			opts.target.set({
				cornerColor: instance.options.selectedColor,
		        lockScalingX: true,
		        lockScalingY: true,
		        lockRotation: true,
		        hasControls: false,
		        borderColor: instance.options.selectedColor,
				borderDashArray: [2,2],
				rotatingPointOffset: 60,
				cornerStyle: 'circle',
				cornerSize: 16,
				transparentCorners: false,
				cornerStrokeColor: '#333f48',
				borderScaleFactor: 1.5,
		    });

		    opts.target._objects.forEach(function(obj) {

			    if(!obj.draggable || obj.locked) {
					opts.target.removeWithUpdate(obj);
			    }

			    obj.set({
		        	borderColor: instance.options.selectedColor
		    	});
		    })

		}

	};

	var _afterSetup = function() {

		callback.call(callback, instance);

		initialElementsLoaded = true;

		if(instance.options.keyboardControl) {

			$(document).on('keydown', function(evt) {

				var $target = $(evt.target);

				if(instance.currentElement && !$target.is('textarea,input[type="text"],input[type="number"]')) {

					switch(evt.which) {
						case 8:
							//remove element
							if(instance.currentElement.removable && $('.fpd-image-editor-container').length === 0) {
								instance.removeElement(instance.currentElement);
							}

						break;
				        case 37: // left

					        if(instance.currentElement.draggable) {
						        instance.setElementParameters({left: instance.currentElement.left - 1});
					        }

				        break;
				        case 38: // up

				        	if(instance.currentElement.draggable) {
						        instance.setElementParameters({top: instance.currentElement.top - 1});
					        }

				        break;
				        case 39: // right

				        	if(instance.currentElement.draggable) {
						        instance.setElementParameters({left: instance.currentElement.left + 1});
					        }

				        break;
				        case 40: // down

				        	if(instance.currentElement.draggable) {
						        instance.setElementParameters({top: instance.currentElement.top + 1});
					        }

				        break;

				        default: return; //other keys
				    }

				    evt.preventDefault();

				}

			});

		}

		//attach handlers to stage
		var lastTouchX,
			lastTouchY;

		instance.stage.on({
			'after:render': function() {

				if(instance.options.highlightEditableObjects.length > 3) {

					instance.stage.contextContainer.strokeStyle = instance.options.highlightEditableObjects;
					instance.stage.forEachObject(function(obj) {

						if(obj !== instance.stage.getActiveObject() && !obj.isMoving
							&& ((FPDUtil.getType(obj.type) === 'text' && obj.editable) || obj.uploadZone)) {

							var bound = obj.getBoundingRect();
							instance.stage.contextContainer.setLineDash([5, 15]);
							instance.stage.contextContainer.strokeRect(
				                bound.left,
				                bound.top,
				                bound.width,
				                bound.height
							);

						}
						else {
							instance.stage.contextContainer.setLineDash([]);
						}

		            });

				}

			},
			'mouse:over': function(opts) {

				if(instance.currentElement && instance.currentElement.draggable && opts.target === instance.currentElement) {
					instance.stage.hoverCursor = 'move';
				}
				else {
					instance.stage.hoverCursor = 'pointer';
				}

				/**
			     * Gets fired when the mouse gets over on fabricJS canvas.
			     *
			     * @event FancyProductDesignerView#canvas:mouseOver
			     * @param {Event} event
			     * @param {String} instance - The view instance.
			     * @param {Event} opts - FabricJS event options.
			     */
				$this.trigger('canvas:mouseOver', [instance, opts]);

			},
			'mouse:out': function(opts) {

				/**
			     * Gets fired when the mouse gets over on fabricJS canvas.
			     *
			     * @event FancyProductDesignerView#canvas:mouseOut
			     * @param {Event} event
			     * @param {String} instance - The view instance.
			     * @param {Event} opts - FabricJS event options.
			     */
				$this.trigger('canvas:mouseOut', [instance, opts]);

			},
			'mouse:down': function(opts) {

				if(opts.e.touches) {
					lastTouchX = opts.e.touches[0].clientX;
					lastTouchY = opts.e.touches[0].clientY;
				}

				mouseDownStage = true;

				//fix: when editing text via textarea and doing a modification via corner controls
				if(opts.target && opts.target.__corner && typeof opts.target.exitEditing === 'function') {
					opts.target.exitEditing();
				}

				if(opts.target === undefined) {
					instance.deselectElement();
				}
				else {

					var targetCorner = opts.target.__corner;

					//remove element
					if(instance.options.cornerControlsStyle !== 'basic' && targetCorner === 'bl' && (opts.target.removable || instance.options.editorMode)) {
						instance.removeElement(opts.target);
					}
					//copy element
					else if(instance.options.cornerControlsStyle !== 'basic' && targetCorner === 'tl' && (opts.target.copyable || instance.options.editorMode) && !opts.target.hasUploadZone) {

						instance.duplicate(opts.target);

					}
					else {
						tempModifiedParameters = instance.getElementJSON();
					}


				}

				/**
			     * Gets fired when the mouse/touch gets down on fabricJS canvas.
			     *
			     * @event FancyProductDesignerView#canvas:mouseDown
			     * @param {Event} event
			     * @param {String} instance - The view instance.
			     * @param {Event} opts - FabricJS event options.
			     */
				$this.trigger('canvas:mouseDown', [instance, opts]);

			},
			'mouse:up': function(opts) {

				$productStage.siblings('.fpd-snap-line-v, .fpd-snap-line-h').hide();

				mouseDownStage = false;

				/**
			     * Gets fired when the mouse/touch gets up on fabricJS canvas.
			     *
			     * @event FancyProductDesignerView#canvas:mouseUp
			     * @param {Event} event
			     * @param {String} instance - The view instance.
			     * @param {Event} opts - FabricJS event options.
			     */
				$this.trigger('canvas:mouseUp', [instance, opts]);

			},
			'mouse:move': function(opts) {

				if(mouseDownStage && instance.dragStage) {

					//mobile fix: touch pan
					if(opts.e.touches) {
						var currentTouchX = opts.e.touches[0].clientX,
							currentTouchY = opts.e.touches[0].clientY;
					}

					instance.stage.relativePan(new fabric.Point(
						opts.e.touches ? (currentTouchX - lastTouchX) : opts.e.movementX,
						opts.e.touches ? (currentTouchY - lastTouchY) : opts.e.movementY
					));

					//mobile fix: touch pan
					if(opts.e.touches) {
						lastTouchX = currentTouchX;
						lastTouchY = currentTouchY;
					}

				}

				/**
			     * Gets fired when the mouse/touch is moving on fabricJS canvas.
			     *
			     * @event FancyProductDesignerView#canvas:mouseMove
			     * @param {Event} event
			     * @param {String} instance - The view instance.
			     * @param {Event} opts - FabricJS event options.
			     */
				$this.trigger('canvas:mouseMove', [instance, opts]);

			},
			'text:editing:entered': function(opts) {
				$this.trigger('textEditEnter', [opts.target]);
			},
			'text:changed': function(opts) {

				instance.setElementParameters({text: opts.target.text});
				$this.trigger('textChange', [opts.target]);

			},
			'text:editing:exited':  function(opts) {
				$this.trigger('textEditExit', [opts.target]);
			},
			'object:moving': function(opts) {

				modifiedType = 'moving';

				if(!opts.target.lockMovementX || !opts.target.lockMovementY) {

					_snapToGrid(opts.target);

					if(instance.options.smartGuides) {
						_smartGuides(opts.target);
					}

				}

				instance.stage.contextContainer.strokeStyle = '#990000';

				_checkContainment(opts.target);

				/**
			     * Gets fired when an element is changing via drag, resize or rotate.
			     *
			     * @event FancyProductDesignerView#elementChange
			     * @param {Event} event
			     * @param {String} modifiedType - The modified type.
			     * @param {fabric.Object} element - The fabricJS object.
			     */
				$this.trigger('elementChange', [modifiedType, opts.target]);

			},
			'object:scaling': function(opts) {

				modifiedType = 'scaling';
				_checkContainment(opts.target);

				$productStage.siblings('.fpd-snap-line-v, .fpd-snap-line-h').hide();

				$this.trigger('elementChange', [modifiedType, opts.target]);

			},
			'object:rotating': function(opts) {

				modifiedType = 'rotating';
				_checkContainment(opts.target);

				$this.trigger('elementChange', [modifiedType, opts.target]);

			},
			'object:modified': function(opts) {

				var element = opts.target;

				if(tempModifiedParameters) {

					if(!opts.target._ignore) {
						_setUndoRedo({element: element, parameters: tempModifiedParameters, interaction: 'modify'});
						tempModifiedParameters = null;
					}

				}

				if(FPDUtil.getType(element.type) === 'text' && element.type !== 'curvedText' && !element.uniScalingUnlockable) {

					var newFontSize = opts.target.fontSize * opts.target.scaleX;

					newFontSize = parseFloat(Number(newFontSize).toFixed(0));
		            element.scaleX = 1;
		            element.scaleY = 1;
		            element._clearCache();
		            element.set('fontSize', newFontSize);
		            element.fontSize = newFontSize;

				}

				if(modifiedType !== null) {

					var modifiedParameters = {};

					switch(modifiedType) {
						case 'moving':
							modifiedParameters.left = Number(element.left);
							modifiedParameters.top = Number(element.top);
						break;
						case 'scaling':
							if(FPDUtil.getType(element.type) === 'text' && element.type !== 'curvedText' && !element.uniScalingUnlockable) {
								modifiedParameters.fontSize = parseInt(element.fontSize);
							}
							else {
								modifiedParameters.scaleX = parseFloat(element.scaleX);
								modifiedParameters.scaleY = parseFloat(element.scaleY);
							}
						break;
						case 'rotating':
							modifiedParameters.angle = element.angle;
						break;
					}

					/**
				     * Gets fired when an element is modified.
				     *
				     * @event FancyProductDesignerView#elementModify
				     * @param {Event} event
				     * @param {fabric.Object} element - The fabricJS object.
				     * @param {Object} modifiedParameters - The modified parameters.
				     */
					$this.trigger('elementModify', [element, modifiedParameters]);
				}

				modifiedType = null;

			},
			'selection:updated': _elementSelect, //Fabric V2.1
			'object:selected': _elementSelect,
		});

		instance.stage.renderAll();

		//trigger price change after view has been created to get initial price
		$this.trigger('priceChange', [0, instance.truePrice]);

	};

	var _dragStage = function(x, y) {

		instance.stage.relativePan(new fabric.Point(x, y));

	};

	var _elementSelect = function(opts) {

		var selectedElement = opts.target;

		instance.deselectElement(false);

		//dont select anything when in dragging mode
		if(instance.dragStage) {
			instance.deselectElement();
			return false;
		}

		instance.currentElement = selectedElement;

		/**
	     * Gets fired as soon as an element is selected.
	     *
	     * @event FancyProductDesignerView#elementSelect
	     * @param {Event} event
	     * @param {fabric.Object} currentElement - The current selected element.
	     */
		$this.trigger('elementSelect', [selectedElement]);

		if(instance.options.cornerControlsStyle !== 'basic') {
			selectedElement.setControlVisible('tr', false);
		}

		if(!selectedElement._ignore) {

			selectedElement.set({
				borderColor: instance.options.selectedColor,
				cornerIconColor: instance.options.cornerIconColor,
				cornerColor: instance.options.cornerControlsStyle === 'basic' ? instance.options.cornerIconColor : instance.options.selectedColor,
				borderDashArray: [2,2],
				rotatingPointOffset: instance.options.cornerControlsStyle === 'basic' ? 60 : 0,
				cornerStyle: instance.options.cornerControlsStyle === 'basic' ? 'circle' : 'rect',
				cornerSize: instance.options.cornerControlsStyle === 'basic' ? 16 : 24,
				transparentCorners: instance.options.cornerControlsStyle === 'basic' ? false : true,
				cornerStrokeColor: instance.options.cornerControlsStyle === 'basic' ? instance.options.selectedColor : null,
				borderScaleFactor: 1.5,
			});
		}

		//change cursor to move when element is draggable
		selectedElement.draggable ? instance.stage.hoverCursor = 'move' : instance.stage.hoverCursor = 'pointer';

		//check for a boundingbox
		if(selectedElement.boundingBox && !selectedElement.uploadZone) {
			instance.renderElementBoundingBox(selectedElement);
		}

	};

	var _setUndoRedo = function(undo, redo, trigger) {

		trigger = typeof trigger === 'undefined' ? true : trigger;

		if(undo) {
			instance.undos.push(undo);

			if(instance.undos.length > 20) {
				instance.undos.shift();
			}
		}

		if(redo) {
			instance.redos.push(redo);
		}

		instance.isCustomized = true;

		if(trigger) {

			/**
		     * Gets fired when the canvas has been saved in the undos or redos array.
		     *
		     * @event FancyProductDesignerView#undoRedoSet
		     * @param {Event} event
		     * @param {Array} undos - An array containing all undo objects.
		     * @param {Array} redos - An array containing all redos objects.
		    */

			$this.trigger('undoRedoSet', [instance.undos, instance.redos]);

		}

	};

	//brings all topped elements to front
	var _bringToppedElementsToFront = function() {

		var objects = instance.stage.getObjects(),
			bringToFrontObj = [];

		for(var i = 0; i < objects.length; ++i) {
			var object = objects[i];
			if(object.topped || (object.uploadZone && instance.options.uploadZonesTopped)) {
				bringToFrontObj.push(object);
			}
		}

		for(var i = 0; i < bringToFrontObj.length; ++i) {
			bringToFrontObj[i].bringToFront();
		}

		//bring all elements inside a upload zone to front
		/*for(var i = 0; i < objects.length; ++i) {
			var object = objects[i];
			if(object.hasUploadZone) {
				object.bringToFront().setCoords();
			}
		}*/

		if(instance.currentBoundingObject) {
			instance.currentBoundingObject.bringToFront();
		}

		if(instance.printingBoxObject) {
			instance.printingBoxObject.bringToFront();
		}

		var snapLinesGroup = instance.getElementByID('_snap_lines_group');
		if(snapLinesGroup) {
			snapLinesGroup.bringToFront();
		}

		instance.stage.renderAll();

	};

	var _snapToGrid = function(element) {

		if(instance._snapElements) {

			var gridX = instance.options.snapGridSize[0] ? instance.options.snapGridSize[0] : 50,
				gridY = instance.options.snapGridSize[1] ? instance.options.snapGridSize[1] : 50,
				currentPosPoint = element.getPointByOrigin('left', 'top'),
				point = new fabric.Point(element.padding + (Math.round(currentPosPoint.x / gridX) * gridX), element.padding + (Math.round(currentPosPoint.y / gridY) * gridY));

				element.setPositionByOrigin(point, 'left', 'top');

		}

	};

	var _smartGuides = function(targetObj) {

		$productStage.siblings('.fpd-snap-line-v, .fpd-snap-line-h').hide();

		var allElements = instance.stage.getObjects().filter(function(t){
			return t.hasRotatingPoint;
		});

	    var bb = instance.currentBoundingObject;

	    if(!bb) {
		    bb = {
			    left: 0,
			    top: 0,
			    width: instance.options.stageWidth,
			    height: instance.options.stageHeight,
		    }
	    }

	    var point = instance.stage.gridSnapMove({
			tolerance: 8,
			guidlines: [
				{cx: bb.left+bb.width/2},
				{cy: bb.top+bb.height/2}
			],
			objects: allElements,
			target: targetObj
	    });

	    delete instance.stage.__snapCache;

	    if(point) {

			if(point.x !== undefined){
				$productStage.siblings('.fpd-snap-line-v')
				.css('left', $productStage.position().left + point.x * instance.responsiveScale ).show();
			}
			if(point.y !== undefined) {
				$productStage.siblings('.fpd-snap-line-h')
				.css('top', $productStage.position().top + (point.y * instance.responsiveScale) ).show();
			}

	    }

	};

	//checks if an element is in its containment (bounding box)
	var _checkContainment = function(target) {

		if(instance.currentBoundingObject && !target.hasUploadZone) {

			target.setCoords();

			if(target.boundingBoxMode === 'limitModify') {

				var targetBoundingRect = target.getBoundingRect(),
					bbBoundingRect = instance.currentBoundingObject.getBoundingRect(),
					minX = bbBoundingRect.left,
					maxX = bbBoundingRect.left+bbBoundingRect.width-targetBoundingRect.width,
					minY = bbBoundingRect.top,
					maxY = bbBoundingRect.top+bbBoundingRect.height-targetBoundingRect.height;

				//check if target element is not contained within bb
			    if(!target.isContainedWithinObject(instance.currentBoundingObject)) {

					//check if no corner is used, 0 means its dragged
					if(target.__corner === 0) {
						if(targetBoundingRect.left > minX && targetBoundingRect.left < maxX) {
						   limitModifyParameters.left = target.left;
					    }

					    if(targetBoundingRect.top > minY && targetBoundingRect.top < maxY) {
						   limitModifyParameters.top = target.top;
					    }
					}

			        target.setOptions(limitModifyParameters);


			    } else {

				    limitModifyParameters = {left: target.left, top: target.top, angle: target.angle, scaleX: target.scaleX, scaleY: target.scaleY};
				    if(FPDUtil.getType(target.type) === 'text') {
					    limitModifyParameters.fontSize = target.fontSize;
					     limitModifyParameters.lineHeight = target.lineHeight;
					    limitModifyParameters.charSpacing = target.charSpacing;
				    }

			    }

				/**
			     * Gets fired when the containment of an element is checked.
			     *
			     * @event FancyProductDesignerView#elementCheckContainemt
			     * @param {Event} event
			     * @param {fabric.Object} target
			     * @param {Boolean} boundingBoxMode
			     */
			    $this.trigger('elementCheckContainemt', [target, 'limitModify']);

			}
			else if(target.boundingBoxMode === 'inside' || target.boundingBoxMode === 'clipping') {

				var isOut = false,
					tempIsOut = target.isOut;

					isOut = !target.isContainedWithinObject(instance.currentBoundingObject);

				if(isOut) {

					if(target.boundingBoxMode === 'inside') {
						target.borderColor = instance.options.outOfBoundaryColor;
					}

					target.isOut = true;

				}
				else {

					if(target.boundingBoxMode === 'inside') {
						target.borderColor = instance.options.selectedColor;
					}

					target.isOut = false;

				}

				if(tempIsOut != target.isOut && tempIsOut != undefined) {
					if(isOut) {

						/**
					     * Gets fired as soon as an element is outside of its bounding box.
					     *
					     * @event FancyProductDesignerView#elementOut
					     * @param {Event} event
					     */
						$this.trigger('elementOut', [target]);
					}
					else {

						/**
					     * Gets fired as soon as an element is inside of its bounding box again.
					     *
					     * @event FancyProductDesignerView#elementIn
					     * @param {Event} event
					     */
						$this.trigger('elementIn', [target]);
					}
				}

				$this.trigger('elementCheckContainemt', [target, target.boundingBoxMode]);

			}

		}

		instance.stage.renderAll();

	};

	//center object
	var _centerObject = function(object, hCenter, vCenter) {

		var boundingBox = instance.getBoundingBoxCoords(object),
			left = object.left,
			top = object.top;

		if(hCenter) {

			if(boundingBox) {
				left = boundingBox.cp ? boundingBox.cp.x : boundingBox.left + boundingBox.width * 0.5;
			}
			else {
				left = instance.options.stageWidth * 0.5;
			}

		}

		if(vCenter) {
			if(boundingBox) {
				top = boundingBox.cp ? boundingBox.cp.y : boundingBox.top + boundingBox.height * 0.5;
			}
			else {
				top = instance.options.stageHeight * 0.5;
			}

		}

		object.setPositionByOrigin(new fabric.Point(left, top), 'center', 'center');

		instance.stage.renderAll();
		object.setCoords();

		_checkContainment(object);

	};

	//sets the price for the element if it has color prices
	var _setColorPrice = function(element, hex) {

		//only execute when initial elements are loaded and element has color prices and colors is an object
		if(initialElementsLoaded && element.colorPrices && typeof element.colors === 'object' && element.colors.length > 1) {

			//subtract current color price, if set and is hex
			if(element.currentColorPrice !== undefined) {
				element.price -= element.currentColorPrice;
				instance.changePrice(element.currentColorPrice, '-');
			}

			if(typeof hex === 'string') {

				var hexKey = hex.replace('#', '');

				if(element.colorPrices.hasOwnProperty(hexKey) || element.colorPrices.hasOwnProperty(hexKey.toUpperCase())) {

					var elementColorPrice = element.colorPrices[hexKey] === undefined ? element.colorPrices[hexKey.toUpperCase()] : element.colorPrices[hexKey];

					element.currentColorPrice = elementColorPrice;
					element.price += element.currentColorPrice;
					instance.changePrice(element.currentColorPrice, '+');

				}
				else {
					element.currentColorPrice = 0;
				}

			}
			else {
				element.currentColorPrice = 0;
			}

		}

	};

	//sets the pattern for a svg image or text
	var _setPattern = function(element, url) {

		var _loadFromScript = instance.options._loadFromScript ? instance.options._loadFromScript : '';
		if(url) {
			url = _loadFromScript + url;
		}
		if(FPDUtil.isSVG(element)) {

			if(url) {

				fabric.util.loadImage(url, function(img) {

					if(typeof element.getObjects == 'function') { //multi-path svg
						var paths = element.getObjects();
						for(var i=0; i < paths.length; ++i) {
							paths[i].set('fill', new fabric.Pattern({
								source: img,
								repeat: 'repeat'
							}));
						}
					}
					else { //single path SVG
						element.set('fill', new fabric.Pattern({
							source: img,
							repeat: 'repeat'
						}));
					}

					instance.stage.renderAll();

				});
			}

		}
		else if(FPDUtil.getType(element.type) === 'text') {

			if(url) {
				fabric.util.loadImage(url, function(img) {

					element.set('fill', new fabric.Pattern({
						source: img,
						repeat: 'repeat'
					}));
					instance.stage.renderAll();
				});
			}
			else {
				var color = element.fill ? element.fill : element.colors[0];
				color = color ? color : '#000000';
				element.set('fill', color);
			}

		}

		element.pattern = url;

	};

	//defines the clipping area
	var _clipElement = function(element) {

		var bbCoords = instance.getBoundingBoxCoords(element) || element.clippingRect;
		if(bbCoords) {

			element.clippingRect = bbCoords;

			if(fabric.version.indexOf('3.') === 0) {

				var clipRect = new fabric.Rect({
					originX: 'left',
					originY: 'top',
					angle: bbCoords.angle || 0,
					left: bbCoords.left,
					top: bbCoords.top,
					width: bbCoords.width,
					height: bbCoords.height,
					fill: '#DDD',
					absolutePositioned: true,
				});

				element.clipPath = clipRect;

			}
			else {

				element.clipTo = function(ctx) {
					_clipById(ctx, this);
				};

			}

		}

	};

	//draws the clipping
	var _clipById = function (ctx, _this, scale) {

		scale = scale === undefined ? 1 : scale;

		var clipRect = _this.clippingRect;

	    ctx.save();

	    var m = _this.calcTransformMatrix(),
			iM = fabric.util.invertTransform(m);

		ctx.transform.apply(ctx, iM);
		//ctx.rotate(20 * Math.PI / 180);
		ctx.translate(0, 0);
	    ctx.beginPath();
	    ctx.rect(
	        clipRect.left,
	        clipRect.top,
	        clipRect.width * scale,
	        clipRect.height * scale
	    );
	    ctx.fillStyle = 'transparent';
	    ctx.fill();
	    ctx.closePath();
	    ctx.restore();

	};

	var _elementHasUploadZone = function(element) {

		if(element && element.hasUploadZone) {

			//check if upload zone contains objects
			var objects = instance.stage.getObjects(),
				uploadZoneEmpty = true;

			for(var i=0; i < objects.length; ++i) {

				var object = objects[i];
				if(object.replace === element.replace) {
					uploadZoneEmpty = false;
					break;
				}

			}

			var uploadZoneObject = instance.getUploadZone(element.replace);
			if(uploadZoneObject) {
				uploadZoneObject.set('opacity', uploadZoneEmpty ? 1 : 0);
				uploadZoneObject.evented = uploadZoneEmpty;
			}

			instance.stage.renderAll();
		}

	};

	var _maxTextboxLines = function(textbox, text) {

		textbox.set('text', text); //render text

		//loop: remove chars as long as lineHeights = maxLines
		while(textbox.__lineHeights.length > textbox.maxLines) {
			text = textbox.text;
			text = text.slice(0, -1);
			textbox.set('text', text);
			//if lineHeights are ok, exit editing
			if(textbox.__lineHeights.length <= textbox.maxLines) {
				textbox.exitEditing();
			}
		}

		return text;

	};

	//return an element by ID
	this.getElementByID = function(id) {

		var objects = instance.stage.getObjects();
		for(var i=0; i < objects.length; ++i) {
			if(objects[i].id === id) {
				return objects[i];
				break;
			}
		}

		return false;

	};

	/**
	 * Adds a new element to the view.
	 *
	 * @method addElement
	 * @param {string} type The type of an element you would like to add, 'image' or 'text'.
	 * @param {string} source For image the URL to the image and for text elements the default text.
	 * @param {string} title Only required for image elements.
	 * @param {object} [parameters] An object with the parameters, you would like to apply on the element.
	 */
	this.addElement = function(type, source, title, params) {

		if(type === undefined || source === undefined || title === undefined) {
			return;
		}

		/**
	     * Gets fired as soon as an element has beed added.
	     *
	     * @event FancyProductDesignerView#beforeElementAdd
	     * @param {Event} event
	     * @param {String} type - The element type.
	     * @param {String} source - URL for image, text string for text element.
	     * @param {String} title - The title for the element.
	     * @param {Object} params - The default properties.
	     */
		$this.trigger('beforeElementAdd', [type, source, title, params]);

		params = typeof params !== 'undefined' ? params : {};
		if(type === 'text') {
			//strip HTML tags
			source = source.replace(/(<([^>]+)>)/ig,"");
            source = source.replace(FPDDisallowChars, '');
			title = title.replace(/(<([^>]+)>)/ig,"");
		}

		if(typeof params != "object") {
			FPDUtil.showModal("The element "+title+" does not have a valid JSON object as parameters! Please check the syntax, maybe you set quotes wrong.");
			return false;
		}

		//check that fill is a string
		if(typeof params.fill !== 'string' && !$.isArray(params.fill)) {
			params.fill = false;
		}

		//replace depraceted keys
		params = FPDUtil.rekeyDeprecatedKeys(params);

		//merge default options
		if(FPDUtil.getType(type) === 'text') {
			params = $.extend({}, instance.options.elementParameters, instance.options.textParameters, params);
		}
		else {
			params = $.extend({}, instance.options.elementParameters, instance.options.imageParameters, params);
		}

		var pushTargetObject = false,
			targetObject = null;

		//store current color and convert colors in string to array
		if(params.colors && typeof params.colors == 'string') {

			//check if string contains hex color values
			if(params.colors.indexOf('#') === 0) {
				//convert string into array
				var colors = params.colors.replace(/\s+/g, '').split(',');
				params.colors = colors;
			}

		}

		params._isInitial = !initialElementsLoaded;

		if(FPDUtil.getType(type) === 'text') {
			var defaultTextColor = params.colors[0] ? params.colors[0] : '#000000';
			params.fill = params.fill ? params.fill : defaultTextColor;
		}

		var fabricParams = {
			source: source,
			title: title,
			id: String(new Date().getTime()),
			cornerColor: instance.options.selectedColor,
			cornerIconColor: instance.options.cornerIconColor
		};

		if(!instance.options.editorMode) {

			$.extend(fabricParams, {
				selectable: false,
				lockRotation: true,
				hasRotatingPoint: false,
				lockScalingX: true,
				lockScalingY: true,
				lockMovementX: true,
				lockMovementY: true,
				hasControls: false,
				evented: false,
				lockScalingFlip: true
			});

		}
		else {
			params.__editorMode = instance.options.editorMode;
			fabricParams.selectable = fabricParams.evented = true;
		}

		fabricParams = $.extend({}, params, fabricParams);

		if(fabricParams.isCustom) {
			instance.isCustomized = true;
		}

		if(instance.options.usePrintingBoxAsBounding && !fabricParams.boundingBox && FPDUtil.objectHasKeys(instance.options.printingBox, ['left','top','width','height'])) {

			fabricParams.boundingBox = {
				x: instance.options.printingBox.left-1,
				y: instance.options.printingBox.top-1,
				width: instance.options.printingBox.width+1,
				height: instance.options.printingBox.height+1
			};
		}

		if(type === 'image' || type === 'path' || type === FPDPathGroupName) {

			fabricParams.crossOrigin = '';
			fabricParams.lockUniScaling = instance.options.editorMode ? false : !fabricParams.uniScalingUnlockable;

			//remove url parameters
			if(source.search('<svg ') === -1) {
				var splitURLParams = source.split('?');
				source = fabricParams.source = splitURLParams[0];
			}

			var _fabricImageLoaded = function(fabricImage, params, vectorImage, originParams) {

				if(fabricImage) {

					originParams = originParams === undefined ? {} : originParams;

					$.extend(params, {
						originParams: $.extend({}, params, originParams)
					});

					fabricImage.setOptions(params);
					instance.stage.add(fabricImage);
					instance.setElementParameters(params, fabricImage, false);

					fabricImage.originParams.angle = fabricImage.angle;
					fabricImage.originParams.z = instance.getZIndex(fabricImage);

					if(instance.options.improvedResizeQuality && !vectorImage) {

						fabricImage.resizeFilter = new fabric.Image.filters.Resize({type: 'hermite'});

					}

					if(!fabricImage._isInitial && !fabricImage._ignore) {

						_setUndoRedo({
							element: fabricImage,
							parameters: params,
							interaction: 'add'
						});

					}

				}
				else {

					FPDUtil.showModal("The image with the URL<br /><i style='font-size: 10px;'>"+params.source+"</i><br />can not be loaded into the canvas. <p><br />Troubleshooting<br/><ul><li>The URL is not correct!</li><li>The image has been blocked by <a href='https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS' target='_blank'>CORS policy</a>. You need to host the image under the same protocol and domain or enable 'Access-Control-Allow-Origin' on the server where you host the image. <a href='http://enable-cors.org/' target='_blank'>Read more about it here.</a></li></ul></p>");

				}

				/**
			     * Gets fired as soon as an element has beed added.
			     *
			     * @event FancyProductDesignerView#elementAdd
			     * @param {Event} event
			     * @param {fabric.Object} object - The fabric object.
			     */
				$this.trigger('elementAdd', [fabricImage]);

			};


			if(source === undefined || source.length === 0) {
				FPDUtil.log('No image source set for: '+ title);
				return;
			}

			//add SVG from XML document
			if(source.search('<svg') !== -1) {

				fabric.loadSVGFromString(source, function(objects, options) {
					var svgGroup = fabric.util.groupSVGElements(objects, options);

					//replace fill prop with svgFill
					if(fabricParams.fill) {

						if(!fabricParams.svgFill) {
							fabricParams.svgFill = fabricParams.fill;
						}

						delete fabricParams['fill'];
					}
					//if no default colors are set, use the initial path colors
					else if(!fabricParams.fill && !fabricParams.svgFill) {

						if(objects) {
							params.colors = [];
							for(var i=0; i < objects.length; ++i) {
								var color = objects[i].fill.length > 0 ? tinycolor(objects[i].fill).toHexString() : 'transparent';
								params.colors.push(color);
							}
							params.svgFill = params.colors;
						}

						fabricParams.svgFill = params.svgFill;
					}


					delete fabricParams['clippingRect'];
					delete fabricParams['boundingBox'];
					delete fabricParams['originParams'];
					delete fabricParams['colors'];
					delete fabricParams['svgFill'];
					delete fabricParams['width'];
					delete fabricParams['height'];
					delete fabricParams['originX'];
					delete fabricParams['originY'];
					delete fabricParams['objectCaching'];


					_fabricImageLoaded(svgGroup, fabricParams, true, {svgFill: params.svgFill});
				});

			}
			//load svg from url
			else if($.inArray('svg', source.split('.')) != -1) {

				var timeStamp = Date.now().toString(),
					_loadFromScript = instance.options._loadFromScript ? instance.options._loadFromScript : '',
					url = FPDUtil.isUrl(source) ? new URL(_loadFromScript + source) : source;

				//add timestamp when option enabled or is cloudfront url
				if((source.includes('.cloudfront.net/') || instance.options.imageLoadTimestamp)
					&& !instance.options._loadFromScript) {

					url.searchParams.append('t', timeStamp);

				}

				if(typeof url === 'object') {
					url = url.toString();
				}

				fabric.loadSVGFromURL(url, function(objects, options) {

					//if objects is null, svg is loaded from external server with cors disabled
					var svgGroup = objects ? fabric.util.groupSVGElements(objects, options) : null;

					//replace fill prop with svgFill
					if(fabricParams.fill) {

						if(!fabricParams.svgFill) {
							fabricParams.svgFill = fabricParams.fill;
						}

						delete fabricParams['fill'];
					}
					//if no default colors are set, use the initial path colors
					else if(!fabricParams.fill && !fabricParams.svgFill) {

						if(objects) {
							params.colors = [];
							for(var i=0; i < objects.length; ++i) {
								var color = objects[i].fill.length > 0 ? tinycolor(objects[i].fill).toHexString() : 'transparent';
								params.colors.push(color);
							}
							params.svgFill = params.colors;
						}

						fabricParams.svgFill = params.svgFill;
					}
					_fabricImageLoaded(svgGroup, fabricParams, true, {svgFill: params.svgFill});

				});

			}
			//load png/jpeg from url
			else {

				var timeStamp = Date.now().toString(),
					_loadFromScript = instance.options._loadFromScript ? instance.options._loadFromScript : '',
					url;

				if(source.indexOf('data:image/') == -1) {//do not add timestamp to data URI

					url = FPDUtil.isUrl(source) ? new URL(_loadFromScript + source) : source

					//add timestamp when option enabled or is cloudfront url
					if((source.includes('.cloudfront.net/') || instance.options.imageLoadTimestamp)
						&& !instance.options._loadFromScript) {
						url.searchParams.append('t', timeStamp);
					}

					if(typeof url === 'object') {
						url = url.toString();
					}

				}
				else {
					url = source;
				}

				new fabric.Image.fromURL(url, function(fabricImg) {

					//if src is empty, image is loaded from external server with cors disabled
					fabricImg = fabricImg.getSrc() === '' ? null : fabricImg;
					_fabricImageLoaded(fabricImg, fabricParams, false);

				}, {crossOrigin: 'anonymous'});

			}

		}
		else if(FPDUtil.getType(type) === 'text') {

			source = source.replace(/\\n/g, '\n');
			params.text = params.text ? params.text : source;
			fabricParams._initialText = params.hasOwnProperty('_initialText') ? params._initialText : params.text;

			$.extend(fabricParams, {
				spacing: params.curveSpacing,
				radius: params.curveRadius,
				reverse: params.curveReverse,
				originParams: $.extend({}, params)
			});

			//ensure origin text is always the initial text, even when action:save
			if(params.originParams && params.originParams.text) {
				fabricParams.originParams.text = fabricParams._initialText;
			}

			//make text curved
			var fabricText;
			if(params.curved && typeof fabric.CurvedText !== 'undefined') {

				var _tempText = fabricParams.text; //fix: text property gets empty, when creating curved text
				fabricText = new fabric.CurvedText(source, fabricParams);
				fabricParams.text = _tempText;

			}
			//make text box
			else if(params.textBox) {

				fabricParams.lockUniScaling = !instance.options.editorMode;

				if(instance.options.setTextboxWidth) {
					fabricParams.lockUniScaling = false;
					fabricParams.lockScalingX = false;
				}

				fabricParams.lockScalingY = true;

				fabricText = new fabric.Textbox(source, fabricParams);
				fabricText.setControlVisible('bl', true);

				if(!instance.options.inCanvasTextEditing) {
					fabricText.on({'editing:entered': function() {
						this.exitEditing();
					}});
				}

			}
			//just interactive text
			else {
				fabricText = new fabric.IText(source, fabricParams);

				if(!instance.options.inCanvasTextEditing) {
					fabricText.on({'editing:entered': function() {
						this.exitEditing();
					}});
				}

			}

			if(fabricParams.textPlaceholder || fabricParams.numberPlaceholder) {

				if(fabricParams.textPlaceholder) {
					instance.textPlaceholder = fabricText;
					fabricParams.removable = false;
					fabricParams.editable = false;
				}

				if(fabricParams.numberPlaceholder) {
					instance.numberPlaceholder = fabricText;
					fabricParams.removable = false;
					fabricParams.editable = false;
				}

			}

			instance.stage.add(fabricText);
			instance.setElementParameters(fabricParams, fabricText, false);

			fabricText.originParams = $.extend({}, fabricText.toJSON(), fabricText.originParams);
			delete fabricText.originParams['clipTo'];
			fabricText.originParams.z = instance.getZIndex(fabricText);

			if(!fabricText._isInitial && !fabricText._ignore) {
				_setUndoRedo({
					element: fabricText,
					parameters: fabricParams,
					interaction: 'add'
				});
			}

			$this.trigger('elementAdd', [fabricText]);

		}
		else {

			FPDUtil.showModal('Sorry. This type of element is not allowed!');

		}

	};

	/**
	 * Returns an fabric object by title.
	 *
	 * @method getElementByTitle
	 * @param {string} title The title of an element.
	 * @return {Object} FabricJS Object.
	 */
	this.getElementByTitle = function(title) {

		var objects = instance.stage.getObjects();
		for(var i = 0; i < objects.length; ++i) {
			if(objects[i].title === title) {
				return objects[i];
				break;
			}
		}

	};

	/**
	 * Deselects the current selected element.
	 *
	 * @method deselectElement
	 * @param {boolean} [discardActiveObject=true] Discards the active element.
	 */
	this.deselectElement = function(discardActiveObject) {

		discardActiveObject = typeof discardActiveObject == 'undefined' ? true : discardActiveObject;

		if(instance.currentBoundingObject) {

			instance.stage.remove(instance.currentBoundingObject);
			$this.trigger('boundingBoxToggle', [instance.currentBoundingObject, false]);
			instance.currentBoundingObject = null;

		}

		if(discardActiveObject) {
			instance.stage.discardActiveObject();
		}

		instance.currentElement = null;
		instance.stage.renderAll().calcOffset();

		$this.trigger('elementSelect', [null]);

	};

	/**
	 * Removes an element using the fabric object or the title of an element.
	 *
	 * @method removeElement
	 * @param {object|string} element Needs to be a fabric object or the title of an element.
	 */
	this.removeElement = function(element) {

		if(typeof element === 'string') {
			element = instance.getElementByTitle(element);
		}

		if(!element._ignore) {

			var params = instance.getElementJSON(element);
			params.z = instance.getZIndex(element);

			_setUndoRedo({
				element: element,
				parameters: params,
				interaction: 'remove'
			});

		}

		this.deselectElement();

		setTimeout(function() {

			instance.stage.remove(element);
			_elementHasUploadZone(element);

			/**
		     * Gets fired as soon as an element has been removed.
		     *
		     * @event FancyProductDesignerView#elementRemove
		     * @param {Event} event
		     * @param {fabric.Object} element - The fabric object that has been removed.
		     */
			$this.trigger('elementRemove', [element]);

		}, 1);


	};

	/**
	 * Sets the parameters for a specified element.
	 *
	 * @method setElementParameters
	 * @param {object} parameters An object with the parameters that should be applied to the element.
	 * @param {fabric.Object | string} [element] A fabric object or the title of an element. If no element is set, the parameters will be applied to the current selected element.
	 * @param {Boolean} [saveUndo=true] Save new parameters also in undos.
	 */
	this.setElementParameters = function(parameters, element, saveUndo) {

		element = typeof element === 'undefined' ? instance.stage.getActiveObject() : element;
		saveUndo = typeof saveUndo === 'undefined' ? true : saveUndo;

		if(!element || parameters === undefined) {
			return false;
		}

		//if element is string, get by title
		if(typeof element == 'string') {
			element = instance.getElementByTitle(element);
		}

		var elemType = FPDUtil.getType(element.type);

		//store undos
		if(saveUndo && initialElementsLoaded) {

			var undoParameters = instance.getElementJSON();

			if(element._tempFill) {
				undoParameters.fill = element._tempFill;
				element._tempFill = undefined;
			}

			if(!element._ignore) {
				_setUndoRedo({
					element: element,
					parameters: undoParameters,
					interaction: 'modify'
				});
			}

		}

		//scale image into bounding box (cover or fit)
		if(FPDUtil.getType(element.type) == 'image' && !element._isInitial && !element._addToUZ && element.scaleX === 1) {


			var scale = null;
			 if(!FPDUtil.isZero(element.resizeToW) || !FPDUtil.isZero(element.resizeToH)) {

				var scaleToWidth = element.resizeToW,
				 	scaleToHeight = element.resizeToH;

				scaleToWidth = isNaN(scaleToWidth) ? (parseFloat(scaleToWidth) / 100) *  instance.options.stageWidth : parseInt(scaleToWidth);
				scaleToHeight = isNaN(scaleToHeight) ? (parseFloat(scaleToHeight) / 100) * instance.options.stageHeight : parseInt(scaleToHeight);

				scale = FPDUtil.getScalingByDimesions(
					element.width,
					element.height,
					scaleToWidth,
					scaleToHeight,
					element.scaleMode
				);

			}
			//only scale to bb when no scale value is set
			else if(element.boundingBox) {

				var bb = instance.getBoundingBoxCoords(element);

				scale = FPDUtil.getScalingByDimesions(
					element.width,
					element.height,
					bb.width,
					bb.height,
					element.scaleMode
				);

			}
			else if(instance.options.fitImagesInCanvas) {

				var iconTolerance = element.cornerSize * 3;

				if((element.width * element.scaleX) + iconTolerance > instance.options.stageWidth
					|| (element.height * element.scaleY) + iconTolerance > instance.options.stageHeight) {

					scale = FPDUtil.getScalingByDimesions(
						element.width,
						element.height,
						instance.options.stageWidth - iconTolerance,
						instance.options.stageHeight - iconTolerance
					);

				}
			}

			if(scale !== null) {
				$.extend(parameters, {scaleX: scale, scaleY: scale});
			}

		}

		//adds the element into a upload zone
		if((element._addToUZ && element._addToUZ != '')) {

			parameters.z = -1;
			var uploadZoneObj = instance.getElementByTitle(element._addToUZ),
				scale = 1;

			if(FPDUtil.getType(element.type) == 'image') {
				scale = FPDUtil.getScalingByDimesions(
					element.width,
					element.height,
					uploadZoneObj.width * uploadZoneObj.scaleX,
					uploadZoneObj.height * uploadZoneObj.scaleY,
					uploadZoneObj.scaleMode
				);
			}

			$.extend(parameters, {
					boundingBox: element._addToUZ,
					boundingBoxMode: 'clipping',
					scaleX: scale,
					scaleY: scale,
					autoCenter: true,
					removable: true,
					zChangeable: false,
					autoSelect: false,
					copyable: false,
					hasUploadZone: true,
					z: instance.getZIndex(instance.getElementByTitle(element._addToUZ)),
					rotatable: uploadZoneObj.rotatable,
					draggable: uploadZoneObj.draggable,
					resizable: uploadZoneObj.resizable,
					price: uploadZoneObj.price ? uploadZoneObj.price : parameters.price,
					replace: element._addToUZ,
					lockUniScaling: uploadZoneObj.lockUniScaling,
					uniScalingUnlockable: uploadZoneObj.uniScalingUnlockable,
					advancedEditing: uploadZoneObj.advancedEditing,
					originX: uploadZoneObj.originX,
					originY: uploadZoneObj.originY,
					angle: uploadZoneObj.angle
				}
			);

			//set some origin params that are needed when resetting element in UZ
			$.extend(parameters.originParams, {
				boundingBox: parameters.boundingBox,
				replace: parameters.replace,
				rotatable: parameters.rotatable,
				draggable: parameters.draggable,
				resizable: parameters.resizable,
				lockUniScaling: parameters.lockUniScaling,
				uniScalingUnlockable: parameters.uniScalingUnlockable,
				price: parameters.price,
				scaleX: parameters.scaleX,
				scaleY: parameters.scaleY,
				hasUploadZone: true,
				autoCenter: true,
				originX: parameters.originX,
				originY: parameters.originY,
				angle: parameters.angle
			});

			delete parameters[''];
			delete element['_addToUZ'];

		}

		//if topped, z-index can not be changed
		if(parameters.topped) {
			parameters.zChangeable = false;
		}

		//new element added
		if(FPDUtil.elementIsEditable(parameters)) {
			parameters.isEditable = parameters.evented = parameters.selectable = true;
		}

		//upload zones have no controls
		if(!parameters.uploadZone || instance.options.editorMode) {
			if(parameters.draggable) {
				parameters.lockMovementX = parameters.lockMovementY = false;
			}

			if(parameters.rotatable) {
				parameters.lockRotation = false;
				parameters.hasRotatingPoint = true;
			}

			if(parameters.resizable) {
				parameters.lockScalingX = parameters.lockScalingY = false;
			}

			if((parameters.resizable || parameters.rotatable || parameters.removable)) {
				parameters.hasControls = true;
			}

		}

		if(parameters.uploadZone) {

			if(!instance.options.editorMode) {

				if(parameters.uploadZoneMovable) {
					parameters.lockMovementX = parameters.lockMovementY = false;
				}

				if(parameters.uploadZoneRemovable) {
					parameters.removable = true;
					parameters.copyable = false;
					parameters.hasControls = true;
				}

			}

			if(fabric.version !== '3.0.0') {
				parameters.lockRotation = true;
				parameters.hasRotatingPoint = false;
			}

		}

		if(parameters.fixed) {

			if(FPDUtil.isEmpty(parameters.replace)) {
				parameters.replace = element.title;
			}

		}

		if(parameters.replace && parameters.replace != '') {

			var replacedElement = instance.getElementByReplace(parameters.replace);

			//element with replace in view found and replaced element is not the new element
			if(replacedElement !== null && replacedElement !== element ) {
				parameters.z = instance.getZIndex(replacedElement);
				parameters.left = element.originParams.left = replacedElement.left;
				parameters.top = element.originParams.top =  replacedElement.top;
				parameters.autoCenter = false;
				if(instance.options.applyFillWhenReplacing) {
					parameters.fill = replacedElement.fill;
				}
				instance.removeElement(replacedElement);
			}

		}

		//needs to before setOptions
		if(typeof parameters.text === 'string') {

			var text = parameters.text;

            text = text.replace(FPDDisallowChars, '');

			//remove emojis
			if(instance.options.disableTextEmojis) {
				text = text.replace(FPDEmojisRegex, '');
				text = text.replace(String.fromCharCode(65039), ""); //fix: some emojis left a symbol with char code 65039
			}

			if(element.maxLength != 0 && text.length > element.maxLength) {
				text = text.substr(0, element.maxLength);
				element.selectionStart = element.maxLength;
			}

			//check lines length
			if(element.maxLines != 0) {

				if(element.type == 'textbox' && element.__lineHeights) {
					text = _maxTextboxLines(element, text);
				}
				else if(text.split("\n").length > element.maxLines) {
					text = text.replace(/([\s\S]*)\n/, "$1");
					element.exitEditing(); //exit editing when max lines are reached
				}

			}

			element.set('text', text);
			parameters.text = text;

			if(initialElementsLoaded && element.chargeAfterEditing) {

				if(!element._isPriced) {
					instance.changePrice(element.price, '+');
					element._isPriced = true;
				}

				if( element._initialText === text && element._isPriced) {
					instance.changePrice(element.price, '-');
					element._isPriced = false;
				}

			}

		}

		if(elemType === 'text') {

			if(parameters.hasOwnProperty('textDecoration')) {
				parameters.underline = parameters.textDecoration === 'underline';
			}

			if(parameters.letterSpacing !== undefined) {
				parameters.charSpacing = parameters.letterSpacing * 100;
			}

			if(parameters.fontSize && parameters.fontSize < element.minFontSize) {
				parameters.fontSize = element.minFontSize;
			}
			else if(parameters.fontSize && parameters.fontSize > element.maxFontSize) {
				parameters.fontSize = element.maxFontSize;
			}

			if(parameters.text) {

				if(element.textTransform === 'uppercase') {
					text = text.toUpperCase()
				}
				else if(element.textTransform === 'lowercase') {
					text = text.toLowerCase()
				}

				element.set('text', text);
				parameters.text = text;

			}

			if(parameters.textTransform) {

				var text = element.text;
				if(parameters.textTransform === 'uppercase') {
					text = text.toUpperCase()
				}
				else if(parameters.textTransform === 'lowercase') {
					text = text.toLowerCase()
				}

				element.set('text', text);
				parameters.text = text;

			}

			if((parameters.shadowColor || parameters.shadowBlur || parameters.shadowOffsetX || parameters.shadowOffsetY) && !element.shadow) {

				var shadowObj = {
					color: parameters.shadowColor ? parameters.shadowColor: 'rgba(0,0,0,0)'
				}

				element.setShadow(shadowObj);

			}

			if(element.shadow && parameters.hasOwnProperty('shadowColor')) {
				if(parameters.shadowColor) {
					element.shadow.color = parameters.shadowColor;
				}
				else {
					element.setShadow(null);
				}
			}

			if(element.shadow) {

				if(parameters.shadowBlur) {
					element.shadow.blur = parameters.shadowBlur;
				}

				if(parameters.shadowOffsetX) {
					element.shadow.offsetX = parameters.shadowOffsetX;
				}

				if(parameters.shadowOffsetY) {
					element.shadow.offsetY = parameters.shadowOffsetY;
				}

			}

		}

		delete parameters['paths']; //no paths in parameters
		element.setOptions(parameters);

		if(element.type == 'i-text' && element.widthFontSize && element.text.length > 0) {

			var resizedFontSize;
			if(element.width > element.widthFontSize) {
				resizedFontSize = element.fontSize * (element.widthFontSize / (element.width + 1)); //decrease font size
			}
			else {
				resizedFontSize = element.fontSize * (element.widthFontSize / (element.width - 1)); //increase font size
			}

			if(resizedFontSize < element.minFontSize) {
				resizedFontSize = element.minFontSize;
			}
			else if(resizedFontSize > element.maxFontSize) {
				resizedFontSize = element.maxFontSize;
			}

			resizedFontSize = parseInt(resizedFontSize);
			parameters.fontSize = resizedFontSize;
			element.set('fontSize', resizedFontSize);

		}

		//clip element
		if((element.boundingBox && parameters.boundingBoxMode === 'clipping') || parameters.hasUploadZone) {
			_clipElement(element);
		}

		if(parameters.autoCenter) {
			instance.centerElement(true, true, element);
		}

		//change element color
		if(parameters.fill !== undefined || parameters.svgFill !== undefined) {
			var fill = parameters.svgFill !== undefined ? parameters.svgFill : parameters.fill;
			instance.changeColor(element, fill);
			element.pattern = undefined;
		}

		//set pattern
		if(parameters.pattern !== undefined) {
			_setPattern(element, parameters.pattern);
			_setColorPrice(element, parameters.pattern);
		}

		//set filter
		if(parameters.filter) {

			element.filters = [];
			var fabricFilter = FPDUtil.getFilter(parameters.filter);

			if(fabricFilter != null) {
				element.filters.push(fabricFilter);
			}
			if(typeof element.applyFilters !== 'undefined') {
				element.applyFilters();
			}

		}

		//set z position, check if element has canvas prop, otherwise its not added into canvas
		if(element.canvas && parameters.z >= 0) {
			element.moveTo(parameters.z);
			_bringToppedElementsToFront();
		}

		if(element.curved) {

			if(parameters.curveRadius) {
				element.set('radius', parameters.curveRadius);
			}

			if(parameters.curveSpacing) {
				element.set('spacing', parameters.curveSpacing);
			}

			if(parameters.curveReverse !== undefined) {
				element.set('reverse', parameters.curveReverse);
			}

		}

		if(element.uploadZone) {
			element.evented = element.opacity !== 0;
		}
		else if(element.isEditable && !instance.options.editorMode) {
			element.evented = !parameters.locked;
		}

		if(instance.options.cornerControlsStyle == 'basic' && element.lockScalingX && element.lockScalingY) {

			element.setControlsVisibility({
		         mt: false,
		         mb: false,
		         ml: false,
		         mr: false,
		         bl: false,
		         br: false,
		         tl: false,
		         tr: false,
		    });

		}


		//check if a upload zone contains an object
		var objects = instance.stage.getObjects();
		for(var i=0; i < objects.length; ++i) {

			var object = objects[i];

			if(object.uploadZone && object.title == parameters.replace) {
				object.opacity = 0;
				object.evented = false;
			}

		}

		element.setCoords();
		instance.stage.renderAll().calcOffset();

		$this.trigger('elementModify', [element, parameters]);

		_checkContainment(element);

		//select element
		if(parameters.autoSelect && element.isEditable && !instance.options.editorMode && $(instance.stage.getElement()).is(':visible')) {

			setTimeout(function() {
				instance.stage.setActiveObject(element);
				instance.stage.renderAll();
			}, 350);

		}

	};

	/**
	 * Returns the bounding box of an element.
	 *
	 * @method getBoundingBoxCoords
	 * @param {fabric.Object} element A fabric object
	 * @return {Object | Boolean} The bounding box object with x,y,width and height or false.
	 */
	this.getBoundingBoxCoords = function(element) {

		if(element.boundingBox || element.uploadZone) {

			if(typeof element.boundingBox == "object") {


				if( element.boundingBox.hasOwnProperty('x') &&
					element.boundingBox.hasOwnProperty('y') &&
					element.boundingBox.width &&
					element.boundingBox.height
				) {
					return {
						left: element.boundingBox.x,
						top: element.boundingBox.y,
						width: element.boundingBox.width,
						height: element.boundingBox.height
					};
				}
				else {
					return false;
				}

			}
			else {

				var objects = instance.stage.getObjects();

				for(var i=0; i < objects.length; ++i) {

					//get all layers from first view
					var object = objects[i];
					if(element.boundingBox == object.title) {

						var topLeftPoint = object.getPointByOrigin('left', 'top');

						return {
							left: topLeftPoint.x,
							top: topLeftPoint.y,
							width: object.width * object.scaleX,
							height: object.height * object.scaleY,
							angle: object.angle || 0,
							cp: object.getCenterPoint()
						};

						break;
					}

				}

			}

		}

		return false;

	};

	/**
	 * Creates a data URL of the view.
	 *
	 * @method toDataURL
	 * @param {Function} callback A function that will be called when the data URL is created. The function receives the data URL.
	 * @param {String} [backgroundColor=transparent] The background color as hexadecimal value. For 'png' you can also use 'transparent'.
	 * @param {Object} [options] See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toDataURL.
	 * @param {Boolean} [options.onlyExportable=false] If true elements with excludeFromExport=true are not exported in the image.
	 * @param {fabric.Image} [watermarkImg=null] A fabricJS image that includes the watermark image.
	 * @param {Boolean} [deselectElement=true] Deselect current selected element.
	 */
	this.toDataURL = function(callback, backgroundColor, options, watermarkImg, deselectElement) {

		callback = callback === undefined ? function() {} : callback;
		backgroundColor = backgroundColor === undefined ? 'transparent' : backgroundColor;
		options = options === undefined ? {} : options;
		options.onlyExportable = options.onlyExportable === undefined ? false : options.onlyExportable;
		options.multiplier = options.multiplier === undefined ? 1 : options.multiplier;
		options.enableRetinaScaling = options.enableRetinaScaling === undefined ? false : options.enableRetinaScaling;
		watermarkImg = watermarkImg === undefined ? false : watermarkImg;
		deselectElement = deselectElement === undefined ? true : deselectElement;

		var invisibleObjs = ['_snap_lines_group', '_ruler_hor', '_ruler_ver'],
			hiddenObjs = [],
			 tempHighlightEditableObjects = instance.options.highlightEditableObjects;

		instance.options.highlightEditableObjects = 'transparent';
		instance.stage.getObjects().forEach(function(obj) {

			if(invisibleObjs.indexOf(obj.id) !== -1 || (obj.excludeFromExport && options.onlyExportable)) {

				obj.visible = false;
				hiddenObjs.push(obj);

			}

		});

		if(deselectElement) {
			instance.deselectElement();
		}

		var tempDevicePixelRatio = fabric.devicePixelRatio;
		fabric.devicePixelRatio = 1;

		instance.stage.setDimensions({width: instance.options.stageWidth, height: instance.options.stageHeight}).setZoom(1);

		//scale view mask to multiplier
		if(instance.maskObject && instance.maskObject._originParams) {
			instance.maskObject.left = instance.maskObject._originParams.left * options.multiplier;
			instance.maskObject.top = instance.maskObject._originParams.top * options.multiplier;
			instance.maskObject.scaleX = instance.maskObject._originParams.scaleX * options.multiplier;
			instance.maskObject.scaleY = instance.maskObject._originParams.scaleY * options.multiplier;
			instance.maskObject.setCoords();
		}

		instance.stage.setBackgroundColor(backgroundColor, function() {

			if(watermarkImg) {
				instance.stage.add(watermarkImg);
				watermarkImg.center();
				watermarkImg.bringToFront();
			}

			//get data url
			callback(instance.stage.toDataURL(options));

			if(watermarkImg) {
				instance.stage.remove(watermarkImg);
			}

			if($(instance.stage.wrapperEl).is(':visible')) {
				instance.resetCanvasSize();
			}

			instance.stage.setBackgroundColor('transparent', function() {
				instance.stage.renderAll();
			});

			for(var i=0; i<hiddenObjs.length; ++i) {
				hiddenObjs[i].visible = true;
			}

			instance.stage.renderAll();

			fabric.devicePixelRatio = tempDevicePixelRatio;
			instance.options.highlightEditableObjects = tempHighlightEditableObjects;

		});

	};

	/**
	 * Returns the view as SVG.
	 *
	 * @method toSVG
	 * @param {Object} options See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toSVG
	 * @param {Function} reviver See fabricjs documentation http://fabricjs.com/docs/fabric.Canvas.html#toSVG
	 * @param {Boolean} respectPrintingBox Only generate SVG from printing box
	 * @param {fabric.Image} [watermarkImg=null] A fabricJS image that includes the watermark image.
	 * @param {Array} [fontsToEmbed=[]] Aan array containing fonts to embed in the SVG. You can use <a href="https://jquerydoc.fancyproductdesigner.com/classes/FancyProductDesigner.html#method_getUsedColors" target="_blank">getUsedFonts method</a>
	 * @return {String} A XML representing a SVG.
	 */
	this.toSVG = function(options, reviver, respectPrintingBox, watermarkImg, fontsToEmbed) {

		options = options === undefined ? {} : options;
		respectPrintingBox = respectPrintingBox === undefined ? false : respectPrintingBox;
		watermarkImg = watermarkImg === undefined ? null : watermarkImg;
		fontsToEmbed = fontsToEmbed === undefined ? [] : fontsToEmbed;

		var svg;

		instance.deselectElement();
		if(respectPrintingBox && FPDUtil.objectHasKeys(instance.options.printingBox, ['left','top','width','height'])) {

			var offsetX = 0,
				offsetY = 0;

			if(FPDUtil.objectHasKeys(instance.options.output, ['bleed', 'width', 'height'])) {
				offsetX = (instance.options.output.bleed / instance.options.output.width) * instance.options.printingBox.width,
				offsetY = (instance.options.output.bleed / instance.options.output.height) * instance.options.printingBox.height;
			}

			options.viewBox = {
				x: instance.options.printingBox.left - offsetX,
				y: instance.options.printingBox.top - offsetY,
				width: instance.options.printingBox.width + (offsetX * 2),
				height: instance.options.printingBox.height  + (offsetY * 2)
			};

			instance.stage.setDimensions({width: instance.options.printingBox.width, height: instance.options.printingBox.height}).setZoom(1);
		}
		else {
			instance.stage.setDimensions({width: instance.options.stageWidth, height: instance.options.stageHeight}).setZoom(1);
		}

		//remove background, otherwise unneeeded rect is added in the svg
		var tempCanvasBackground = instance.stage['backgroundColor'];
		if(tempCanvasBackground == 'transparent') {
			instance.stage['backgroundColor'] = false;
		}

		if(watermarkImg) {
			instance.stage.add(watermarkImg);
			watermarkImg.center();
			watermarkImg.bringToFront();
		}

		svg = instance.stage.toSVG(options, reviver);

		if(watermarkImg) {
			instance.stage.remove(watermarkImg);
		}

		instance.stage['backgroundColor'] = tempCanvasBackground;

		if($(instance.stage.wrapperEl).is(':visible')) {
			instance.resetCanvasSize();
		}

		var $svg = $(svg);

		//move clipPath to defs section
		$svg.find('clipPath').appendTo($svg.children('defs'));

		//store fonts in style tag
		$svg.children('defs').append('<style type="text/css"></style>');
		var googleFontsUrl = '',
			customFontsStr = '';

		fontsToEmbed.forEach(function(fontItem) {

			if(fontItem.hasOwnProperty('url')) {

				if(fontItem.url == 'google') {
					googleFontsUrl += fontItem.name.replace(/\s/g, "+") + ':ital,wght@0,400;0,700;1,700&';
				}
				else {
					customFontsStr += FPDUtil.parseFontsToEmbed(fontItem);
				}

			}
		})

		if(googleFontsUrl.length > 0) {
			$svg.find('defs > style').append('@import url("https://fonts.googleapis.com/css2?family='+googleFontsUrl.replace(/&/g, "&amp;")+'display=swap");');
		}
		if(customFontsStr.length > 0) {
			$svg.find('defs > style').append(customFontsStr);
		}

		svg = $('<div>').append(
			$svg.clone()).html()
			//replace all newlines
			.replace(/(?:\r\n|\r|\n)/g, '')
			//replace & with escaped string for google fonts url, otherwise syntax error
			.replace(/700&/g, "700&amp;"
		);

		return svg;

	};

	/**
	 * Removes the canvas and resets all relevant view properties.
	 *
	 * @method duplicate
	 * @param {fabric.Object} [element] The element to duplicate. If not set, it duplicates the current selected element.
	 */
	this.duplicate = function(element) {

		element = element === undefined ? instance.stage.getActiveObject() : element;

		var newOpts = instance.getElementJSON(element);

		newOpts.top = newOpts.top + 30;
		newOpts.left = newOpts.left + 30;

		if(!instance.options.editorMode) {
			newOpts.autoSelect = true;
		}

		instance.addElement(
			FPDUtil.getType(element.type),
			element.source,
			'Copy '+element.title,
			newOpts
		);

	};

	/**
	 * Removes the canvas and resets all relevant view properties.
	 *
	 * @method reset
	 */
	this.reset = function(removeCanvas) {

		removeCanvas = removeCanvas === undefined ? true : removeCanvas;

		instance.undos = [];
		instance.redos = [];
		instance.elements = [];
		instance.totalPrice = instance.truePrice = instance.additionalPrice = 0;
		instance.stage.clear();

		if(removeCanvas) {
			instance.stage.wrapperEl.remove();
		}

		$this.trigger('clear');
		$this.trigger('priceChange', [0, 0]);

	};

	/**
	 * Undo the last change.
	 *
	 * @method undo
	 */
	this.undo = function() {

		if(instance.undos.length > 0) {

			var last = instance.undos.pop();

			//check if element was removed
			if(last.interaction === 'remove') {
				instance.stage.add(last.element);
				last.interaction = 'add';
				$this.trigger('elementAdd', [last.element]);
			}
			else if(last.interaction === 'add') {

				var hasReplace = last.element.replace;
				instance.stage.remove(last.element);
				last.interaction = 'remove';
				$this.trigger('elementRemove', [last.element]);

				if(hasReplace && instance.undos.length && instance.undos[instance.undos.length-1].element.replace == hasReplace) {
					last = instance.undos.pop();
					instance.stage.add(last.element);
					$this.trigger('elementAdd', [last.element]);
				}

			}

			if(!last.element._ignore) {
				_setUndoRedo(false, {
					element: last.element,
					parameters: instance.getElementJSON(last.element),
					interaction: last.interaction
				});
			}

			instance.setElementParameters(last.parameters, last.element, false);

			this.deselectElement();
			_elementHasUploadZone(last.element);

		}

		return instance.undos;

	};

	/**
	 * Redo the last change.
	 *
	 * @method redo
	 */
	this.redo = function() {

		if(instance.redos.length > 0) {

			var last = instance.redos.pop();

			if(last.interaction === 'remove') {
				instance.stage.add(last.element);
				last.interaction = 'add';
				$this.trigger('elementAdd', [last.element]);
			}
			else if(last.interaction === 'add') {
				instance.stage.remove(last.element);
				last.interaction = 'remove';
				$this.trigger('elementRemove', [last.element]);
			}

			if(!last.element._ignore) {
				_setUndoRedo({
					element: last.element,
					parameters: instance.getElementJSON(last.element),
					interaction: last.interaction
				});
			}

			instance.setElementParameters(last.parameters, last.element, false);

			this.deselectElement();
			_elementHasUploadZone(last.element);

		}

		return instance.redos;

	};

	/**
	 * Get the canvas(stage) JSON.
	 *
	 * @method getJSON
	 * @return {Object} An object with properties.
	 */
	this.getJSON = function() {

		var parameterKeys = fpdOptions.getParameterKeys();

		parameterKeys = parameterKeys.concat(FancyProductDesignerView.propertiesToInclude);

		return instance.stage.toJSON(parameterKeys);

	};

	/**
	 * Resizes the canvas responsive.
	 *
	 * @method resetCanvasSize
	 */
	this.resetCanvasSize = function() {

		instance.responsiveScale = $productStage.outerWidth() < instance.options.stageWidth ? $productStage.outerWidth() / instance.options.stageWidth : 1;

		if(!isNaN(instance.options.maxCanvasHeight) && instance.options.maxCanvasHeight !== 1) {

			var maxHeight = window.innerHeight * parseFloat(instance.options.maxCanvasHeight);
			if(instance.options.stageHeight > instance.options.stageWidth && (instance.options.stageHeight * instance.responsiveScale) > maxHeight) {
				instance.responsiveScale = maxHeight / instance.options.stageHeight;
			}

		}

		instance.responsiveScale = parseFloat(Number(instance.responsiveScale.toFixed(7)));
		instance.responsiveScale = Math.min(instance.responsiveScale, 1);

		if(!instance.options.responsive) {
			instance.responsiveScale = 1;
		}

		if(!instance.options.editorMode && instance.maskObject && instance.maskObject._originParams) {
			instance.maskObject.left = instance.maskObject._originParams.left * instance.responsiveScale;
			instance.maskObject.top = instance.maskObject._originParams.top * instance.responsiveScale;
			instance.maskObject.scaleX = instance.maskObject._originParams.scaleX * instance.responsiveScale;
			instance.maskObject.scaleY = instance.maskObject._originParams.scaleY * instance.responsiveScale;

		}
		else if(instance.maskObject) {
			instance.maskObject.setCoords();
		}


		instance.stage
		.setDimensions({
			width: $productStage.width(),
			height: instance.options.stageHeight * instance.responsiveScale
		})
		.setZoom(instance.responsiveScale)
		.calcOffset()
		.renderAll();

		$productStage.height(instance.stage.height)
		.parent('.fpd-main-wrapper').css('min-height', instance.stage.height);

		var $container = $productStage.parents('.fpd-container:first');
		if($container.length > 0) {
			$container.height($container.hasClass('fpd-sidebar') ? instance.stage.height : 'auto');
			$container.width($container.hasClass('fpd-topbar') ? instance.options.stageWidth : 'auto');
		}

		return instance.responsiveScale;

	};

	/**
	 * Gets an elment by replace property.
	 *
	 * @method getElementByReplace
	 */
	this.getElementByReplace = function(replaceValue) {

		var objects = instance.stage.getObjects();
		for(var i = 0; i < objects.length; ++i) {
			var object = objects[i];
			if(object.replace === replaceValue) {
				return object;
				break;
			}
		}

		return null;

	};

	/**
	 * Gets the JSON of an element.
	 *
	 * @method getElementJSON
	 * @param {String} [element] The target element. If not set, it it will use the current selected.
	 * @param {Boolean} [addPropertiesToInclude=false] Include the properties from {{#crossLink "FancyProductDesignerView/propertiesToInclude:property"}}{{/crossLink}}.
	 * @return {Object} An object with properties.
	 */
	this.getElementJSON = function(element, addPropertiesToInclude) {

		element = element === undefined ? instance.stage.getActiveObject() : element;
		addPropertiesToInclude = addPropertiesToInclude === undefined ? false : addPropertiesToInclude;

		if(!element) { return {}; }

		var properties = Object.keys(instance.options.elementParameters),
			additionalKeys  = FPDUtil.getType(element.type) === 'text' ? Object.keys(instance.options.textParameters) : Object.keys(instance.options.imageParameters);

		properties = $.merge(properties, additionalKeys);

		if(addPropertiesToInclude) {
			properties = $.merge(properties, FancyProductDesignerView.propertiesToInclude);
		}

		if(element.uploadZone) {
			properties.push('customAdds');
			properties.push('designCategories');
			properties.push('designCategories[]'); //fpd-admin
		}

		if(FPDUtil.getType(element.type) === 'text') {
			properties.push('text');
			properties.push('_initialText');
		}

		if(element.type === FPDPathGroupName) {
			properties.push('svgFill');
		}

		properties.push('width');
		properties.push('height');
		properties.push('isEditable');
		properties.push('hasUploadZone');
		properties.push('clippingRect');
		properties.push('evented');
		properties.push('isCustom');
		properties.push('currentColorPrice');
		properties.push('_isPriced');
		properties.push('originParams');
		properties.push('originSource');
		properties.push('depositphotos');
		properties = properties.sort();

		var topLeftPoint = element.getPointByOrigin('left', 'top');
		if(addPropertiesToInclude) {

			var json = element.toJSON(properties);
			json.topLeftX = topLeftPoint.x;
			json.topLeftY = topLeftPoint.y;

			return json;

		}
		else {

			var json = {};
			for(var i=0; i < properties.length; ++i) {
				var prop = properties[i];
				if(element[prop] !== undefined) {
					json[prop] = element[prop];
				}

			}

			json.topLeftX = topLeftPoint.x;
			json.topLeftY = topLeftPoint.y;

			return json;
		}

	};

	/**
	 * Centers an element horizontal or/and vertical.
	 *
	 * @method centerElement
	 * @param {Boolean} h Center horizontal.
	 * @param {Boolean} v Center vertical.
	 * @param {fabric.Object} [element] The element to center. If not set, it centers the current selected element.
	 */
	this.centerElement = function(h, v, element) {

		element = typeof element === 'undefined' ? instance.stage.getActiveObject() : element;

		_centerObject(element, h, v);
		element.autoCenter = false;

	};

	/**
	 * Aligns an element.
	 *
	 * @method alignElement
	 * @param {String} pos Allowed values: left, right, top or bottom.
	 * @param {fabric.Object} [element] The element to center. If not set, it centers the current selected element.
	 */
	this.alignElement = function(pos, element) {

		element = typeof element === 'undefined' ? instance.stage.getActiveObject() : element;

		var localPoint = element.getPointByOrigin('left', 'top'),
			boundingBox = instance.getBoundingBoxCoords(element),
			posOriginX = 'left',
			posOriginY = 'top';

		if(pos === 'left') {

			localPoint.x = boundingBox ? boundingBox.left : 0;
			localPoint.x += element.padding + 1;

		}
		else if(pos === 'top') {

			localPoint.y = boundingBox ? boundingBox.top : 0;
			localPoint.y += element.padding + 1;

		}
		else if(pos === 'right') {

			localPoint.x = boundingBox ? boundingBox.left + boundingBox.width - element.padding : instance.options.stageWidth - element.padding;
			localPoint.x -= FPDUtil.getType(element.type) == 'text' ? 4 : 0;
			posOriginX = 'right';

		}
		else {

			localPoint.y = boundingBox ? boundingBox.top + boundingBox.height - element.padding : instance.options.stageHeight;
			localPoint.y -= FPDUtil.getType(element.type) == 'text' ? 4 : 0;
			posOriginY = 'bottom';

		}

		element.setPositionByOrigin(localPoint, posOriginX, posOriginY);

		instance.stage.renderAll();
		element.setCoords();

		_checkContainment(element);

	};

	/**
	 * Gets the z-index of an element.
	 *
	 * @method getZIndex
	 * @param {fabric.Object} [element] The element to center. If not set, it centers the current selected element.
	 * @return {Number} The index.
	 */
	this.getZIndex = function(element) {

		element = typeof element === 'undefined' ? instance.stage.getActiveObject() : element;

		var objects = instance.stage.getObjects();
		return objects.indexOf(element);
	};

	/**
	 * Changes the color of an element.
	 *
	 * @method changeColor
	 * @param {fabric.Object} element The element to colorize.
	 * @param {String} hex The color.
	 * @param {Boolean} colorLinking Use color linking.
	 */
	this.changeColor = function(element, hex, colorLinking) {

		colorLinking = typeof colorLinking === 'undefined' ? true : colorLinking;

		var colorizable = FPDUtil.elementIsColorizable(element);

		//check if hex color has only 4 digits, if yes, append 3 more
		if(typeof hex === 'string' && hex.length == 4) {
			hex += hex.substr(1, hex.length);
		}

		//text
		if(FPDUtil.getType(element.type) === 'text') {

			hex = hex === false ? '#000000' : hex;
			if(typeof hex == 'object') {
				hex = hex[0];
			}

			//set color of a text element
			element.set('fill', hex);
			instance.stage.renderAll();

			element.pattern = null;
			element.fill = hex;

		}
		//path groups (svg)
		else if(element.type == FPDPathGroupName && typeof hex == 'object') {

			for(var i=0; i < hex.length; ++i) {
				if(element.getObjects()[i]) {
					element.getObjects()[i].set('fill', hex[i]);
				}

			}

			instance.stage.renderAll();

			element.svgFill = hex;
			delete element['fill'];

		}
		//image
		else {

			if(typeof hex == 'object') {
				hex = hex[0];
			}

			if(typeof hex !== 'string') {
				hex = false;
			}

			//colorize png or dataurl image
			if(colorizable == 'png' || colorizable == 'dataurl') {

				element.filters = [];

				//fix: fabricjs 2.+ when element is custom element and changing base products
				setTimeout(function() {

					if(hex) {
						element.filters.push(new fabric.Image.filters.BlendColor({mode: 'tint', color: hex}));
					}

					element.applyFilters();
					instance.stage.renderAll();

					$this.trigger('elementColorChange', [element, hex, colorLinking]);

				}, 1);

				element.fill = hex;

			}
			//colorize svg (single path)
			else if(colorizable == 'svg') {

				element.set('fill', hex);
				instance.stage.renderAll();

				$this.trigger('elementColorChange', [element, hex, colorLinking]);

			}


		}

		_setColorPrice(element, hex);

		/**
	     * Gets fired when the color of an element is changing.
	     *
	     * @event FancyProductDesignerView#elementColorChange
	     * @param {Event} event
	     * @param {fabric.Object} element
	     * @param {String} hex
	     * @param {Boolean} colorLinking
	     */
		$this.trigger('elementColorChange', [element, hex, colorLinking]);

	};

	/**
	 * Gets the index of the view.
	 *
	 * @method getIndex
	 * @return {Number} The index.
	 */
	this.getIndex = function() {

		return $productStage.children('.fpd-view-stage').index(instance.stage.wrapperEl);

	};

	/**
	 * Gets an upload zone by title.
	 *
	 * @method getUploadZone
	 * @param {String} title The target title of an element.
	 * @return {fabric.Object} A fabric object representing the upload zone.
	 */
	this.getUploadZone = function(title) {

		var objects = instance.stage.getObjects();

		for(var i=0; i < objects.length; ++i) {

			if(objects[i].uploadZone && objects[i].title == title) {
				return objects[i];
				break;
			}

		}

	};

	/**
	 * Changes the price by an operator, + or -.
	 *
	 * @method changePrice
	 * @param {Number} price Price as number.
	 * @param {String} operator "+" or "-".
	 * @return {Number} The total price of the view.
	 */
	this.changePrice = function(price, operator, additionalPrice) {

		additionalPrice = additionalPrice === undefined ? null : additionalPrice;

		if(typeof price !== 'number') {
			price = Number(price);
		}

		if(operator === '+') {
			instance.totalPrice += price;
		}
		else {
			instance.totalPrice -= price;
		}

		if(additionalPrice !== null) {

			var tempAdditionalPrice = instance.additionalPrice;
			instance.totalPrice -= tempAdditionalPrice;

			instance.additionalPrice = additionalPrice;
			instance.totalPrice += additionalPrice;

		}

		instance.truePrice = instance.totalPrice;

		//consider max. view price
		if(typeof instance.options.maxPrice === 'number' && instance.options.maxPrice != -1 && instance.truePrice > instance.options.maxPrice) {
			instance.truePrice = Number(instance.options.maxPrice);
		}

		//price has decimals, set max. decimals to 2
		if(instance.truePrice % 1 != 0) {
			instance.truePrice = Number(instance.truePrice.toFixed(2));
		}

		/**
	     * Gets fired as soon as the price has changed.
	     *
	     * @event FancyProductDesignerView#priceChange
	     * @param {Event} event
	     * @param {number} elementPrice - The price of the added element.
	     * @param {number} truePrice - The total price.
	     */
		$this.trigger('priceChange', [price, instance.truePrice]);

		return instance.truePrice;

	};

	/**
	 * Use a SVG image as mask for the whole view. The image needs to be a SVG file with only one path. The method toSVG() does not include the mask.
	 *
	 * @method setMask
	 * @param {Object|Null} maskOptions An object containing the URL to the svg. Optional: scaleX, scaleY, left and top.
	 */
	this.setMask = function(maskOptions, callback) {

		callback = typeof callback !== 'undefined' ? callback : function() {};

		if(maskOptions && maskOptions.url && $.inArray('svg', maskOptions.url.split('.')) != -1) {

			instance.mask = maskOptions;

			var timeStamp = Date.now().toString(),
				_loadFromScript = instance.options._loadFromScript ? instance.options._loadFromScript : '',
				url = _loadFromScript + maskOptions.url;

			if(instance.options.imageLoadTimestamp && !instance.options._loadFromScript) {
				url += '?'+timeStamp;
			}

			//check if url is available
			$.get(url)
			.done(function(data) {

				fabric.loadSVGFromURL(url, function(objects, options) {

					var svgGroup = null;
					if(objects) {
						//if objects is null, svg is loaded from external server with cors disabled
						svgGroup = objects ? fabric.util.groupSVGElements(objects, options) : null;

						svgGroup.setOptions({
							left: maskOptions.left ? Number(maskOptions.left) :  0,
							top: maskOptions.top ? Number(maskOptions.top) :  0,
							scaleX: maskOptions.scaleX ? Number(maskOptions.scaleX) :  1,
							scaleY: maskOptions.scaleY ? Number(maskOptions.scaleY) :  1,
							selectable: true,
							evented: false,
							resizable: true,
							lockUniScaling: false,
							lockRotation: true,
							borderColor: 'transparent',
							fill: 'rgba(0,0,0,0)',
							transparentCorners: true,
							cornerColor: instance.options.selectedColor,
							cornerIconColor: instance.options.cornerIconColor,
							cornerSize: 24,
							originX: 'left',
							originY: 'top',
							name: "view-mask",
							objectCaching: false,
							excludeFromExport: true,
							_ignore: true,
							_originParams: {
								left: maskOptions.left ? Number(maskOptions.left) :  0,
								top: maskOptions.top ? Number(maskOptions.top) :  0,
								scaleX: maskOptions.scaleX ? Number(maskOptions.scaleX) :  1,
								scaleY: maskOptions.scaleY ? Number(maskOptions.scaleY) :  1,
							}
						})

						instance.stage.clipTo = function(ctx) {
						  svgGroup.render(ctx);
						};
						instance.stage.renderAll();

						instance.maskObject = svgGroup;
						instance.resetCanvasSize();
					}

					callback(svgGroup);

				});

			})
			.fail(callback);

		}
		else {
			instance.stage.clipTo = instance.maskObject = instance.mask = null;
			instance.stage.renderAll();
		}

	};

	/**
	 * Returns all options with the keys that are set in FancyProductDesignerView.relevantOptions property.
	 *
	 * @method getOptions
	 * @return {Object} An object containing all relevant options.
	 */
	this.getOptions = function() {

		var options = {};

		if(typeof FancyProductDesignerView.relevantOptions === 'object') {

			FancyProductDesignerView.relevantOptions.forEach(function(key) {
				options[key] = instance.options[key];
			});

		}

		return options;

	};

	/**
	 * Toggles the lockment of view. If the view is locked, the price of the view will not be added to the total product price.
	 *
	 * @method toggleLock
	 * @param {Boolean} toggle The toggle state.
	 * @return {Boolean} The toggle state.
	 */
	this.toggleLock = function(toggle) {

		toggle = toggle === undefined ? true : toggle;

		instance.locked = toggle;

		$this.trigger('priceChange', [0, instance.truePrice]);

		return toggle;

	};

	/**
	 * Removes the current elements and loads a set of new elements into the view.
	 *
	 * @param {Array} elements An array containing elements.
	 * @param {Function} callback A function that will be called when all elements have beed added.
	 * @method loadElements
	 */
	this.loadElements = function(elements, callback) {

		if(initialElementsLoaded) {
			instance.reset(false);
		}

		instance.elements = [];

		instance.addElements(elements, callback);

	};

	/**
	 * Adds a set of elements into the view.
	 *
	 * @param {Array} elements An array containing elements.
	 * @param {Function} callback A function that will be called when all elements have beed added.
	 * @method addElements
	 */
	this.addElements = function(elements, callback) {

		var countElements = 0;

		//iterative function when element is added, add next one
		function _onElementAdded() {

			countElements++;

			//add all elements of a view
			if(countElements < elements.length) {
				var element = elements[countElements];
				if(!_removeNotValidElementObj(element)) {
					instance.addElement( element.type, element.source, element.title, element.parameters);
				}

			}
			//all initial elements are added, view is created
			else {

				instance.undos = [];
				instance.redos = [];
				$this.trigger('undoRedoSet', [instance.undos, instance.redos]);

				$this.off('elementAdd', _onElementAdded);
				if(typeof callback !== 'undefined') {
					callback.call(callback, instance);
				}

			}

		};

		function _removeNotValidElementObj(element) {

			if(element.type === undefined || element.source === undefined || element.title === undefined) {

				var removeInd = elements.indexOf(element)
				if(removeInd !== -1) {
					FPDUtil.log('Element index '+removeInd+' from elements removed, its not a valid element object!', 'info');
					_onElementAdded();
					return true;
				}

			}
			else {
				instance.elements.push(element);
			}

			return false;

		};

		var element = elements[0];
		//check if view contains at least one element
		if(element) {

			//listen when element is added
			$this.on('elementAdd', _onElementAdded);
			//add first element of view
			if(!_removeNotValidElementObj(element)) {
				instance.addElement( element.type, element.source, element.title, element.parameters);
			}

		}
		//no elements in view, view is created without elements
		else {
			if(typeof callback !== 'undefined') {
				callback.call(callback, instance);
			}
		}

	};


	this.renderElementBoundingBox = function(element) {

		if(instance.currentBoundingObject) {
			instance.stage.remove(instance.currentBoundingObject);
			instance.currentBoundingObject = null;
		}

		if(element) {

			var bbCoords = instance.getBoundingBoxCoords(element);
			if(bbCoords) {

				var boundingBoxProps = {
					left: bbCoords.left,
					top: bbCoords.top,
					width: bbCoords.width,
					height: bbCoords.height,
					angle: bbCoords.angle || 0,
					stroke: instance.options.boundingBoxColor,
					strokeWidth: 1,
					strokeLineCap: 'square',
					strokeDashArray: [10, 10],
					fill: false,
					selectable: false,
					evented: false,
					originX: 'left',
					originY: 'top',
					name: "bounding-box",
					excludeFromExport: true,
					_ignore: true
				};

				boundingBoxProps = $.extend({}, boundingBoxProps, instance.options.boundingBoxProps);
				instance.currentBoundingObject = new fabric.Rect(boundingBoxProps);

				instance.stage.add(instance.currentBoundingObject);
				instance.currentBoundingObject.bringToFront();

				/**
			     * Gets fired when bounding box is toggling.
			     *
			     * @event FancyProductDesignerView#boundingBoxToggle
			     * @param {Event} event
			     * @param {fabric.Object} currentBoundingObject - The current bounding box object.
			     * @param {Boolean} state
			     */
				$this.trigger('boundingBoxToggle', [instance.currentBoundingObject, true]);

			}
			else {
				element.clipTo = null;
			}

			_checkContainment(element);

		}

	};

	this.renderPrintingBox = function() {

		if(instance.printingBoxObject) {
			instance.stage.remove(instance.printingBoxObject);
			instance.printingBoxObject = null;
		}

		if(FPDUtil.objectHasKeys(instance.options.printingBox, ['left','top','width','height'])) {

			var printingBox = new fabric.Rect({
				left: 0,
				top: 0,
				width: instance.options.printingBox.width,
				height: instance.options.printingBox.height,
				stroke: instance.options.printingBox.visibility || instance.options.editorMode ? '#db2828' : 'transparent',
				strokeWidth: 1,
				strokeLineCap: 'square',
				fill: false,
				originX: 'left',
				originY: 'top',
				name: "printing-box",
				excludeFromExport: true,
				_ignore: true
			});

			instance.printingBoxObject = new fabric.Group([printingBox], {
				left: instance.options.printingBox.left,
				top: instance.options.printingBox.top,
				evented: false,
				resizable: true,
				lockUniScaling: true,
				lockRotation: true,
				borderColor: 'transparent',
				transparentCorners: true,
				cornerColor: instance.options.selectedColor,
				cornerIconColor: instance.options.cornerIconColor,
				cornerSize: 24,
				originX: 'left',
				originY: 'top',
				name: "printing-boxes",
				excludeFromExport: true,
				selectable: false,
				_ignore: true
			});

			instance.stage.add(instance.printingBoxObject);
			instance.printingBoxObject.setCoords();
			instance.stage.renderAll();

		}

	}

	/**
	 * This method needs to be called after the instance of {{#crossLink "FancyProductDesignerView"}}{{/crossLink}} is set.
	 *
	 * @method setup
	 */
	this.setup = function() {

		this.loadElements(view.elements, _afterSetup);

	};

	_initialize();

};

/**
 * Relevant options for the view when saving order data.
 *
 * @property relevantOptions
 * @type Array
 * @static
 * @default ['stageWidth',
	'stageHeight',
	'customAdds',
	'customImageParameters',
	'customTextParameters',
	'maxPrice',
	'optionalView',
	'designCategories',
	'printingBox',
	'output',
	'layouts',
	'usePrintingBoxAsBounding']
 */
FancyProductDesignerView.relevantOptions = [
	'stageWidth',
	'stageHeight',
	'customAdds',
	'customImageParameters',
	'customTextParameters',
	'maxPrice',
	'optionalView',
	'designCategories',
	'printingBox',
	'output',
	'layouts',
	'usePrintingBoxAsBounding',
	'threeJsPreviewModel'
];

/**
 * Properties to include when using the {{#crossLink "FancyProductDesignerView/getJSON:method"}}{{/crossLink}} or {{#crossLink "FancyProductDesignerView/getElementJSON:method"}}{{/crossLink}}.
 *
 * @property propertiesToInclude
 * @type Array
 * @static
 * @default ['_isInitial', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'lockScalingFlip', 'lockUniScaling', 'resizeType', 'clipTo', 'clippingRect', 'boundingBox', 'boundingBoxMode', 'selectable', 'evented', 'title', 'editable', 'cornerColor', 'cornerIconColor', 'borderColor', 'isEditable', 'hasUploadZone']
 */
FancyProductDesignerView.propertiesToInclude = ['_isInitial', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'lockScalingFlip', 'lockUniScaling', 'resizeType', 'clipTo', 'clippingRect', 'boundingBox', 'boundingBoxMode', 'selectable', 'evented', 'title', 'editable', 'cornerColor', 'cornerIconColor', 'borderColor', 'isEditable', 'hasUploadZone'];
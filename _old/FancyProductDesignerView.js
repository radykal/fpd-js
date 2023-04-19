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
var FancyProductDesignerView = function($productStage, view, callback, fabricCanvasOptions) {

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

		//PLUS
		instance.textPlaceholder = null;
		instance.numberPlaceholder = null;
		instance.names_numbers = view.names_numbers ? view.names_numbers : null;


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



		if(instance.mask) {
			instance.setMask(instance.mask);
		}

		instance.renderPrintingBox();

	};


	var _selectionUpdated = function(opts) {

		if(instance.options.multiSelection && opts.target && opts.target.type == 'activeSelection') {

			opts.target.set({
				cornerColor: instance.options.selectedColor,
		        lockScalingX: true,
		        lockScalingY: true,
		        lockRotation: true,
		        hasControls: false,
		        rotatingPointOffset: 0,
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
				cornerColor: instance.options.cornerControlsStyle == 'basic' ? instance.options.cornerIconColor : instance.options.selectedColor,
				borderDashArray: [2,2],
				rotatingPointOffset: instance.options.cornerControlsStyle == 'basic' ? 60 : 0,
				cornerStyle: instance.options.cornerControlsStyle == 'basic' ? 'circle' : 'rect',
				cornerSize: instance.options.cornerControlsStyle == 'basic' ? 16 : 24,
				transparentCorners: instance.options.cornerControlsStyle == 'basic' ? false : true,
				cornerStrokeColor: instance.options.cornerControlsStyle == 'basic' ? instance.options.selectedColor : null,
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
				    if(FPDUtil.getType(target.type) == 'text') {
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

				
			}

		}
		else if(FPDUtil.getType(element.type) === 'text') {

			if(url) {
				fabric.util.loadImage(url, function(img) {

					
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

			if(fabric.version.indexOf('3.') == 0) {

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
				if(object.replace == element.replace) {
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





	/**
	 * Deselects the current selected element.
	 *
	 * @method deselectElement
	 * @param {boolean} [discardActiveObject=true] Discards the active element.
	 */
	this.deselectElement = function(discardActiveObject) {


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


/**
 * Properties to include when using the {{#crossLink "FancyProductDesignerView/getJSON:method"}}{{/crossLink}} or {{#crossLink "FancyProductDesignerView/getElementJSON:method"}}{{/crossLink}}.
 *
 * @property propertiesToInclude
 * @type Array
 * @static
 * @default ['_isInitial', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'lockScalingFlip', 'lockUniScaling', 'resizeType', 'clipTo', 'clippingRect', 'boundingBox', 'boundingBoxMode', 'selectable', 'evented', 'title', 'editable', 'cornerColor', 'cornerIconColor', 'borderColor', 'isEditable', 'hasUploadZone']
 */
FancyProductDesignerView.propertiesToInclude = ['_isInitial', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'lockScalingFlip', 'lockUniScaling', 'resizeType', 'clipTo', 'clippingRect', 'boundingBox', 'boundingBoxMode', 'selectable', 'evented', 'title', 'editable', 'cornerColor', 'cornerIconColor', 'borderColor', 'isEditable', 'hasUploadZone'];
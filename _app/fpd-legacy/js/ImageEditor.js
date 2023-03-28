export default function FPDImageEditor ($container, targetElement, fpdInstance) {

	'use strict';

	$ = jQuery;

	var options = fpdInstance.mainOptions.imageEditorSettings;

	var borderColor = '#2ecc71',
		instance = this,
		canvasWidth = 0,
		canvasHeight = 0,
		$canvasContainer = $container.children('.fpd-image-editor-main'),
		$loader = $container.children('.fpd-loader-wrapper'),
		$svgGroupObjects = $container.children('.fpd-svg-group-objects'),
		$svgGroupTools = $container.children('.fpd-svg-group-tools'),
		fabricCanvas,
		customMaskEnabled = false,
		clippingObject = null,
		fabricImage,
		isEdited = 'none',
		ajaxSettings = fpdInstance.mainOptions.customImageAjaxSettings,
		saveOnServer = ajaxSettings.data && ajaxSettings.data.saveOnServer ? 1 : 0,
		uploadsDir = (ajaxSettings.data && ajaxSettings.data.uploadsDir) ? ajaxSettings.data.uploadsDir : '',
		uploadsDirURL = (ajaxSettings.data && ajaxSettings.data.uploadsDirURL) ? ajaxSettings.data.uploadsDirURL : '',
		isGroup = false,
		imageLoaded = false,
		allowedImageExts = ['jpeg', 'jpg', 'png', 'svg'],
		defaultProps = {
			rotatable: true,
			lockRotation: false,
			resizable: true,
			hasRotatingPoint: true,
			hasControls: true,
			lockUniScaling: false,
			centeredScaling: true,
			objectCaching: false,
			padding: 0,
			cornerColor: fpdInstance.mainOptions.cornerColor ? fpdInstance.mainOptions.cornerColor : fpdInstance.mainOptions.selectedColor,
			borderColor: '#333f48',
			borderDashArray: [2,2],
			rotatingPointOffset: 40,
			cornerStyle: 'circle',
			cornerSize: 16,
			transparentCorners: false,
			cornerStrokeColor: '#333f48',
			borderScaleFactor: 1.5,
		},
		fabricMaskOptions = {
			opacity: 0.3,
			borderColor: '#333f48',
			borderDashArray: [3,3],
			cornerStyle: 'circle',
			cornerSize: 16,
			transparentCorners: false,
			cornerStrokeColor: '#333f48',
	        cornerColor: '#fff',
	        borderScaleFactor: 2,
	        hasRotatingPoint: true,
	        centeredScaling: true,
	        objectCaching: false,
	        __editorMode: true,
	        __imageEditor: true
		};

	var _initialize = function() {

		fpdInstance.deselectElement();

		targetElement.originSource = targetElement.originSource ? targetElement.originSource : targetElement.source;

		instance.responsiveScale = 1;

		$container.addClass('fpd-container')

		$canvasContainer.append('<canvas>');

		var canvasOptions = {
			containerClass: 'fpd-image-editor-canvas-wrapper',
			selection: false,
			hoverCursor: 'pointer',
			controlsAboveOverlay: true,
			centeredScaling: true,
			allowTouchScrolling: true,
			preserveObjectStacking: true,
			enableRetinaScaling: false,
			objectCaching: false,
			renderOnAddRemove: true
		};

		fabricCanvas = new fabric.Canvas($canvasContainer.children('canvas:last').get(0), canvasOptions);

		var startCoords = {},
			drawClipping = false;

		fabricCanvas.on({
			'mouse:down': function(opts) {

				if(!clippingObject && customMaskEnabled) {

					drawClipping = true;

					var mouse = fabricCanvas.getPointer(opts.e);

					startCoords.x = mouse.x;
					startCoords.y = mouse.y;

					clippingObject = new fabric.Rect($.extend({}, {
				        width: 0,
				        height: 0,
				        left: mouse.x / instance.responsiveScale,
				        top: mouse.y / instance.responsiveScale,
				        fill: '#000'
				    }, fabricMaskOptions));

				     _resizeCanvas();

				    fabricCanvas.add(clippingObject);
				    fabricCanvas.renderAll();
				    fabricCanvas.setActiveObject(clippingObject);

				}

			},
			'mouse:move': function(opts) {

				if(drawClipping) {

					var mouse = fabricCanvas.getPointer(opts.e),
						w = Math.abs(mouse.x - startCoords.x),
				    	h = Math.abs(mouse.y - startCoords.y);

				    if (!w || !h) {
				        return false;
				    }

				    clippingObject.setOptions({
						width: w / instance.responsiveScale,
						height: h / instance.responsiveScale
					});

					clippingObject.setCoords();
				    fabricCanvas.renderAll();

				}

			},
			'mouse:up': function(opts) {

				drawClipping = false;
			},
			'object:selected': function(opts) {

				if(isGroup) {
					$svgGroupTools.children('.fpd-action-svg-remove-path').removeClass('fpd-disabled');
				}

			},
			'selection:cleared': function(opts) {

				if(isGroup) {
					$svgGroupTools.children('.fpd-action-svg-remove-path').addClass('fpd-disabled');
				}

			},
			'object:modified': function(opts) {
				isEdited = 'yes';
			},
			'object:removed': function(opts) {

				if(imageLoaded) {
					isEdited = 'yes';
				}

			}
		});

		//main menu
		$container.on('click', '.fpd-image-editor-menu > span', function() {

			var $this = $(this),
				id = $this.data('id');

			$this.addClass('fpd-active').siblings().removeClass('fpd-active');
			$container.find('.fpd-tab-content > div').removeClass('fpd-active')
			.filter('[data-id="'+id+'"]').addClass('fpd-active');

		});


		//--- MASK

		if(options.masks && $.isArray(options.masks)) {

			options.masks.forEach(function(svgURL) {

				var title = svgURL.split(/[\\/]/).pop(); //get basename
				title = title.substr(0,title.lastIndexOf('.')); //remove extension

				$container.find('.fpd-mask-selection').append('<span data-mask="'+svgURL+'" class="fpd-tooltip" title="'+title+'" style="background-image: url('+svgURL+')"></span>')
			});

		}

		//mask gets selected
		$container.on('click', '.fpd-mask-selection > span', function() {

			if(!fabricImage) {
				return false;
			}

			var $this = $(this),
				mask = $this.data('mask');

			fabricCanvas.discardActiveObject();
			fabricImage.evented = false;

			fabricCanvas.clipTo = null;
			clippingObject = null;

			if(mask === 'custom-rect') {
				customMaskEnabled = true;
			}
			else {

				fabric.loadSVGFromURL(mask, function(objects, options) {

					//if objects is null, svg is loaded from external server with cors disabled
					var svgGroup = objects ? fabric.util.groupSVGElements(objects, options) : null;

					fabricCanvas.add(svgGroup);

					svgGroup.setOptions($.extend({}, fabricMaskOptions, {opacity: 1, fill: "rgba(0,0,0,0)"}));
					if(fabricCanvas.width > fabricCanvas.height) {
						svgGroup.scaleToHeight((fabricCanvas.height - 80) / instance.responsiveScale);
					}
					else {
						svgGroup.scaleToWidth((fabricCanvas.width - 80) / instance.responsiveScale);
					}

					svgGroup.set('stroke', borderColor).set('strokeWidth', 3 / svgGroup.scaleX);

					clippingObject = svgGroup;
					_resizeCanvas();

					svgGroup.left = 0;
					svgGroup.top = 0;
					svgGroup.setPositionByOrigin(new fabric.Point(canvasWidth * 0.5, canvasHeight * 0.5), 'center', 'center');

					svgGroup.setCoords();
					fabricCanvas.renderAll();

				});

			}

			fabricCanvas.renderAll();
			$container.addClass('fpd-show-secondary');



		});

		//mask: cancel, save
		$container.on('click', '.fpd-mask-cancel, .fpd-mask-save', function() {

			if(!fabricImage) {
				return false;
			}

			fabricImage.evented = true;
			customMaskEnabled = false;

			fabricCanvas.discardActiveObject();

			if(clippingObject) {

				if($(this).hasClass('fpd-mask-save')) {

					_resizeCanvas();

					clippingObject.set('strokeWidth', 0);
					clippingObject.set('fill', 'transparent');
					fabricCanvas.clipTo = function(ctx) {
					  clippingObject.render(ctx);
					};

				}

				fabricCanvas.remove(clippingObject);

			}

			$container.removeClass('fpd-show-secondary');

			isEdited = 'yes';

		});


		//--- FILTERS

		var availableFilters = [
			'none',
			'grayscale',
			'sepia',
			'cold',
			'black_white',
			'old',
			'milk',
			'purple',
			'yellow',
			'monochrome'
		];

		availableFilters.forEach(function(filterName) {

			$container.find('.fpd-content-filters').append('<div data-type="'+filterName+'" style="background-image: url('+FPDFilters[filterName].preview+')" data-defaulttext="'+FPDFilters[filterName].name+'" title="image_editor.filter_'+filterName+'" class="fpd-tooltip"></div>');

		});

		$container.find('.fpd-content-filters [data-defaulttext]').each(function(index, filterElement) {

			fpdInstance.translateElement($(filterElement));

		});

		$container.on('click', '.fpd-content-filters > div', function() {

			if(!fabricImage) {
				return false;
			}

			var removeFilters = [
				'Grayscale',
				'Sepia',
				'Sepia2',
				'ColorMatrix'
			];

			//only one filter is allowed from filters tab
			fabricImage.filters = fabricImage.filters.filter(function(filterItem) {
				return filterItem && removeFilters.indexOf(filterItem.type) === -1;
			});

			fabricImage.filters.push(FPDUtil.getFilter($(this).data('type')));
			_applyFilterRender();

			isEdited = 'yes';

		});


		//--- COLOR MANIPULATION

		$container.on('click', '.fpd-switch-container', function() {

			if(!fabricImage) {
				return false;
			}

			var $this = $(this),
				filterType = $this.data('filter');

			$this.toggleClass('fpd-enabled');
			$this.nextAll('.fpd-range-tooltip:first').toggleClass('fpd-enabled', $this.hasClass('fpd-enabled'));

			if($this.hasClass('fpd-enabled')) {

				//initial values
				var valueObj = {};
				$this.parent().find('.fpd-input-range').each(function(i, input) {
					valueObj[input.name] = parseFloat(input.value);
				});

				_applyFilterValue(filterType, valueObj);

			}
			else {
				_removeFilter(filterType);
			}

		});

		var tooltipTimer = null;
		$container.on('input change', '.fpd-input-range', function() {

			if(!fabricImage) {
				return false;
			}

			var $this = $(this),
				$switchContainer = $this.parent('.fpd-range-tooltip').siblings('.fpd-switch-container:first'),
				filterType = $switchContainer.data('filter'),
				min = parseFloat(this.min),
				max = parseFloat(this.max),
				value = parseFloat(this.value),
				pos = (this.value - min) / (max - min);

			$switchContainer.parent().siblings('.fpd-left').find('.fpd-range-tooltip').removeClass('fpd-moving');

			$this.parent('.fpd-range-tooltip').addClass('fpd-moving')
			.children('.fpd-tooltip').text(value.toFixed(2))
			.css('left', String(pos * 100) + '%');

			var valueObj = {};

			valueObj['color'] = '#fff';
			valueObj[$this.attr('name')] = value;

			_applyFilterValue(filterType, valueObj);

			//hide tooltip after 2 secs
			if(tooltipTimer) {
				clearTimeout(tooltipTimer);
				tooltipTimer = null;
			}

			tooltipTimer = setTimeout(function() {
				$this.parent('.fpd-range-tooltip').removeClass('fpd-moving');
				clearTimeout(tooltipTimer);
				tooltipTimer = null;
			}, 2000);

			isEdited = 'yes';

		});


		//--- SVG Group

		$svgGroupTools.on('click', '.fpd-action-svg-remove-path', function() {

			if(isGroup && fabricCanvas.getActiveObject()) {
				fabricCanvas.remove(fabricCanvas.getActiveObject());
			}

		})

		//--- ACTIONS

		$(document).on('keydown', function(evt) {

			if($container.is(':visible')) {

				if(isGroup && fabricCanvas.getActiveObject()) {

					if(evt.which == 8) {

						fabricCanvas.remove(fabricCanvas.getActiveObject());

					}

				}

			}

		})

		$container.on('click', '.fpd-action-restore', function() {

			if(isGroup) {

				fabric.loadSVGFromURL(targetElement.originSource, function(objects, options) {

					var svgGroup = fabric.util.groupSVGElements(objects, options);

					fabricCanvas.clear();
					instance.loadImage(targetElement.originSource, svgGroup);
					isEdited = 'restored';

				})
			}
			else {

				if(!fabricImage) {
					return false;
				}

				fabricCanvas.clear();
				instance.loadImage(targetElement.originSource);

				isEdited = 'restored';

			}

		});

		$container
		.on('click', '.fpd-action-save', function() {

			fpdInstance.toggleSpinner(true);
			$container.parent().siblings('.fpd-modal-close').click();

			var imageSrc = instance.getImage();

			if(isEdited == 'none') {
				fpdInstance.toggleSpinner(false);
				return false;
			}
			else if(isEdited == 'restored') {
				imageSrc = targetElement.originSource;
			}

			_getSource(imageSrc, function(data) {

				if(data.error) {
					fpdInstance.toggleSpinner(false);
					FPDUtil.showModal(data.error);
					return;
				}

				if($.inArray('svg', targetElement.originSource.split('.')) !== -1) {

					fpdInstance.toggleSpinner(false);

					var elemJSON = fpdInstance.currentViewInstance.getElementJSON(targetElement);
					delete elemJSON['fill'];
					delete elemJSON['svgFill'];
					delete elemJSON['width'];
					delete elemJSON['height'];


					fpdInstance.currentViewInstance.removeElement(targetElement.title, targetElement);
					fpdInstance.currentViewInstance.addElement('image', data.src, targetElement.title, elemJSON);

				}
				else {

					targetElement.source = data.src;
					targetElement.setSrc(data.src, function() {

						fpdInstance.toggleSpinner(false);

						targetElement.setCoords();
						targetElement.canvas.renderAll();

					}, {crossOrigin:'anonymous'});

				}

			})

		})

		$container.parents('.fpd-modal-wrapper:first')
		.on('click', '.fpd-modal-close', function() {

		})

		FPDUtil.updateTooltip($container);

	};

	var _getSource = function(imageSrc, callback) {

		var ext = FPDUtil.getFileExtension(imageSrc);

		//check if save on server is enabled and image source is not a url/path
		if(saveOnServer && !allowedImageExts.includes(ext)) {

			var uploadAjaxSettings  = $.extend({}, ajaxSettings);
			uploadAjaxSettings.success = function(data) {

				if(data && data.error === undefined) {

					callback({src: data.image_src});

				}
				else {

					callback({error: data.error});

				}

			};

			uploadAjaxSettings.data = {
				url: imageSrc,
				uploadsDir: uploadsDir,
				uploadsDirURL: uploadsDirURL,
				saveOnServer: saveOnServer
			};

			//ajax post
			$.ajax(uploadAjaxSettings)
			.fail(function(evt) {

				callback({error: evt.statusText});

			});


		}
		else {

			callback({src: imageSrc});

		}

	};

	var _removeFilter = function(type) {

		if(type == 'RemoveWhite') {
			type = 'RemoveColor';
		}

		fabricImage.filters = fabricImage.filters.filter(function(filterItem) {
			return filterItem.type !== type;
		});

		_applyFilterRender();

	};

	var _applyFilterValue = function(type, valueObj) {

		valueObj = valueObj === undefined ? {} : valueObj;

		var existingType = type;
		if(type == 'RemoveWhite') {
			existingType = 'RemoveColor';
		}

		var filterExist = fabricImage.filters.filter(function(filterItem) {
			return filterItem.type === existingType;
		});

		if(filterExist.length > 0) {
			$.extend(filterExist[0], valueObj);
		}
		else {
			var filter = FPDUtil.getFilter(type, valueObj);
			fabricImage.filters.push(filter);
		}

		_applyFilterRender();

	};

	var _resizeCanvas = function () {

		var $canvasWrapper = $container.children('.fpd-image-editor-main');

		instance.responsiveScale = $canvasWrapper.outerWidth() < canvasWidth ? $canvasWrapper.outerWidth() / canvasWidth : 1;
		instance.responsiveScale = parseFloat(Number(instance.responsiveScale.toFixed(7)));
		instance.responsiveScale = instance.responsiveScale > 1 ? 1 : instance.responsiveScale;

		if(clippingObject) {
			clippingObject.left = clippingObject.left * instance.responsiveScale;
			clippingObject.top = clippingObject.top * instance.responsiveScale;
			clippingObject.scaleX = clippingObject.scaleX * instance.responsiveScale;
			clippingObject.scaleY = clippingObject.scaleY * instance.responsiveScale;
			clippingObject.setCoords();
		}

		fabricCanvas
		.setDimensions({
			width: $canvasWrapper.width(),
			height: canvasHeight * instance.responsiveScale
		})
		.setZoom(instance.responsiveScale)
		.calcOffset()
		.renderAll();

	};

	var _applyFilterRender = function() {

		fabricImage.applyFilters();
		fabricCanvas.renderAll();

	};

	this.loadImage = function(imageURL, svgGroup) {

		svgGroup = svgGroup == undefined ? targetElement : svgGroup;

		isGroup = Boolean(fpdInstance.mainOptions.splitMultiSVG) && svgGroup.type == 'group';

		$loader.toggle(true);
		this.reset();

		$container.toggleClass('fpd-is-svg-group', isGroup);

		if(isGroup) {

			isGroup = true;

			svgGroup.clone(function(cloneGroup) {

				cloneGroup.setOptions({
					scaleX: 1,
					scaleY: 1
				})

				var groupObjects = cloneGroup.getObjects();

				canvasWidth = svgGroup.width;
				canvasHeight = svgGroup.height;

				fabricCanvas
				.setDimensions({
					width: canvasWidth,
					height: canvasHeight
				})

				fabricCanvas.add(cloneGroup);
				cloneGroup.center();

				cloneGroup._restoreObjectsState();
		        cloneGroup._objects.forEach(function(item) {

			        fabricCanvas.add(item);
			        item.setOptions(defaultProps);
			        item.setCoords();

		        });

		        fabricCanvas.remove(cloneGroup);

				$loader.toggle(false);
				_resizeCanvas();

				imageLoaded = true;

			})

		}
		else {

			isGroup = false;

			new fabric.Image.fromURL(imageURL, function(fabricImg) {

				fabricImage = fabricImg;
				canvasWidth = fabricImg.width;
				canvasHeight = fabricImg.height;

				FPDUtil.log('AIE - Canvas Width: '+ canvasWidth);
				FPDUtil.log('AIE - Canvas Height: '+ canvasHeight);

				fabricImage.setOptions({
					borderColor: '#333f48',
					borderDashArray: [3,3],
					cornerStyle: 'circle',
					cornerSize: 16,
					transparentCorners: false,
					cornerStrokeColor: '#333f48',
			        cornerColor: '#fff',
			        borderScaleFactor: 2,
			        __editorMode: true,
			        __imageEditor: true
				});

				fabricCanvas.setDimensions({
					width: canvasWidth,
					height: canvasHeight,
				});

				fabricCanvas.add(fabricImg);

				_resizeCanvas();

				$loader.toggle(false);

				imageLoaded = true;

			}, {crossOrigin: "anonymous"});

		}

	};

	this.getImage = function() {

		if(isGroup) {

			return fabricCanvas.toSVG({suppressPreamble: false});

		}

		var maxDimensionSize = parseInt(fabric.textureSize),
			multiplier = 1;

		if(canvasWidth > canvasHeight) {
			multiplier = canvasWidth > maxDimensionSize ? (maxDimensionSize / canvasWidth) : 1;
		}
		else {
			multiplier = canvasHeight > maxDimensionSize ? (maxDimensionSize / canvasHeight) : 1;
		}

		FPDUtil.log('AIE - Data URI Width: '+ (canvasWidth * multiplier));
		FPDUtil.log('AIE - Data URI Height: '+ (canvasHeight * multiplier));

		fabricCanvas.setDimensions({width: canvasWidth, height: canvasHeight}).setZoom(1);

		if(clippingObject) {
			clippingObject.left = (clippingObject.left / instance.responsiveScale) * multiplier;
			clippingObject.top = (clippingObject.top / instance.responsiveScale) * multiplier;
			clippingObject.scaleX = (clippingObject.scaleX / instance.responsiveScale) * multiplier;
			clippingObject.scaleY = (clippingObject.scaleY / instance.responsiveScale) * multiplier;
			clippingObject.setCoords();
		}

		fabricCanvas.renderAll();

		var dataURL = fabricCanvas.toDataURL({format: 'png', multiplier: multiplier});

		FPDUtil.log('AIE - Data URI Size: '+ FPDUtil.getDataUriSize(dataURL));

		_resizeCanvas();

		return dataURL;

	};

	this.reset = function() {

		$container.find('.fpd-switch-container').removeClass('fpd-enabled');

		fabricCanvas.clipTo = null;
		clippingObject = null;
		fabricCanvas.discardActiveObject();

		if(fabricImage) {
			fabricImage.setOptions({
				scaleX: 1,
				scaleY: 1,
				angle: 0,
				left: 0,
				top: 0
			})
			fabricImage.filters = [];

			_applyFilterRender();
		}

	};

	_initialize();

};
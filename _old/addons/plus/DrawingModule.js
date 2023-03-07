var FPDDrawingModule = function(fpdInstance, $module) {

	'use strict';

	$ = jQuery;

	this.drawCanvas = null;

	var instance = this,
		currentLineColor = '#000000',
		currentBrushType = 'Pencil';

	var _getCustomBrush = function(canvas, type) {

		if(type === 'vLine') {

			var vLinePatternBrush = new fabric.PatternBrush(canvas);
		    vLinePatternBrush.getPatternSrc = function() {

		      var patternCanvas = fabric.document.createElement('canvas');
		      patternCanvas.width = patternCanvas.height = 10;
		      var ctx = patternCanvas.getContext('2d');

		      ctx.strokeStyle = this.color;
		      ctx.lineWidth = 5;
		      ctx.beginPath();
		      ctx.moveTo(0, 5);
		      ctx.lineTo(10, 5);
		      ctx.closePath();
		      ctx.stroke();

		      return patternCanvas;
		    };

			return vLinePatternBrush;
		}
		else if(type === 'hLine') {

			var hLinePatternBrush = new fabric.PatternBrush(canvas);
		    hLinePatternBrush.getPatternSrc = function() {

		      var patternCanvas = fabric.document.createElement('canvas');
		      patternCanvas.width = patternCanvas.height = 10;
		      var ctx = patternCanvas.getContext('2d');

		      ctx.strokeStyle = this.color;
		      ctx.lineWidth = 5;
		      ctx.beginPath();
		      ctx.moveTo(5, 0);
		      ctx.lineTo(5, 10);
		      ctx.closePath();
		      ctx.stroke();

		      return patternCanvas;
		    };

		    return hLinePatternBrush;

		}

	};

	var _initialize = function() {

		$module.find('.fpd-drawing-brush-type .fpd-item').click(function(evt) {

			evt.stopPropagation();

			var $this = $(this),
				$current = $this.parent().prevAll('.fpd-dropdown-current:first'),
				value = $this.data('value');

			$current.html($this.clone()).data('value', value);
			currentBrushType = value;

			instance.drawCanvas.freeDrawingBrush = _getFabricBrush(value);

			if (instance.drawCanvas.freeDrawingBrush) {
			    instance.drawCanvas.freeDrawingBrush.color = currentLineColor;
				instance.drawCanvas.freeDrawingBrush.width = $module.find('.fpd-drawing-line-width').val();
		    }

		    $this.parents('.fpd-dropdown:first').removeClass('fpd-active');

		});

		$module.find('.fpd-drawing-line-color').spectrum({
			color: currentLineColor,
			showButtons: false,
			preferredFormat: "hex",
			showInput: true,
			showInitial: true,
			showPalette: fpdInstance.mainOptions.colorPickerPalette && fpdInstance.mainOptions.colorPickerPalette.length > 0,
			palette: fpdInstance.mainOptions.colorPickerPalette,
			move: function(color) {

				currentLineColor = color.toHexString();
				if(instance.drawCanvas) {
					instance.drawCanvas.freeDrawingBrush.color = currentLineColor;
				}

			},
			change: function(color) {

				currentLineColor = color.toHexString();
				if(instance.drawCanvas) {
					instance.drawCanvas.freeDrawingBrush.color = currentLineColor;
				}

			}
		});

		$module.find('.fpd-slider-range').rangeslider({
			polyfill: false,
			rangeClass: 'fpd-range-slider',
			disabledClass: 'fpd-range-slider--disabled',
			horizontalClass: 'fpd-range-slider--horizontal',
		    verticalClass: 'fpd-range-slider--vertical',
		    fillClass: 'fpd-range-slider__fill',
		    handleClass: 'fpd-range-slider__handle',
		    onSlide: function(pos, value) {
			    this.$element.parent().siblings('.fpd-slider-number').val(value).change();
		    }
		});

		$module.find('.fpd-slider-number').change(function() {

			var $this = $(this);

			if( this.value > Number($this.attr('max')) ) {
				this.value = Number($this.attr('max'));
			}

			if( this.value < Number($this.attr('min')) ) {
				this.value = Number($this.attr('min'));
			}

			$this.next('.fpd-range-wrapper').children('input').val(this.value)
			.rangeslider('update', true, false);

			if($this.hasClass('fpd-drawing-line-width') && instance.drawCanvas) {
				instance.drawCanvas.freeDrawingBrush.width = this.value;
			}

		});

		$module.on('click', '.fpd-clear-drawing', function() {

			instance.drawCanvas.dispose();
			_createDrawCanvas();

		});

		$module.on('click', '.fpd-add-drawing', function() {

			var drawingProps = {
				autoCenter: true,
				draggable: true,
				resizable: true,
				removable: true,
				rotatable: true,
				autoSelect: true,
				colors: false,
				patterns: false,
				isCustom: true
			};

			var drawSVG = instance.drawCanvas.toSVG({suppressPreamble: true}).replace(/(?:\r\n|\r|\n)/g, '');

			fpdInstance.addElement(
				'image',
				drawSVG,
				new Date().getTime(),
				$.extend({}, fpdInstance.currentViewInstance.options.customImageParameters, drawingProps)
			);

			instance.drawCanvas.clear();

		});

		var _getFabricBrush = function(type) {

			if(type === 'hline') {
			    return _getCustomBrush(instance.drawCanvas, 'hLine');
		    }
		    else if(type === 'vline') {
		      	return _getCustomBrush(instance.drawCanvas, 'vLine');
		    }
		    else {
			    return new fabric[type + 'Brush'](instance.drawCanvas);
		    }

		};

		var _createDrawCanvas = function() {

			var drawCanvasWidth = $module.parents('.fpd-draggable-dialog:first').length > 0 ? $module.parents('.fpd-draggable-dialog:first').width() : $module.parent('.fpd-content').width();

			drawCanvasWidth = drawCanvasWidth ? drawCanvasWidth : 300;
			drawCanvasWidth -= (parseInt($module.css('paddingLeft')) * 2);

			instance.drawCanvas = new fabric.Canvas($module.find('.fpd-drawing-canvas').get(0), {
				containerClass: 'fpd-drawing-container',
				isDrawingMode: true,
				width: drawCanvasWidth,
				height: 150
		  	});

		  	instance.drawCanvas.freeDrawingBrush = _getFabricBrush(currentBrushType);
		  	instance.drawCanvas.freeDrawingBrush.color = currentLineColor;
		  	instance.drawCanvas.freeDrawingBrush.width = $module.find('input.fpd-drawing-line-width').val();

		}

		_createDrawCanvas();

	};

	_initialize();

};
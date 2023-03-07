var FPDActions = function(fpdInstance, $actions) {

	'use strict';

	$ = jQuery;

	var instance = this,
		snapLinesGroup,
		downloadFilename = fpdInstance.mainOptions.downloadFilename;

	this.currentActions = fpdInstance.mainOptions.actions;

	var _initialize = function() {

		//add set action buttons
		if($actions) {

			instance.setup(instance.currentActions);

			//action click handler
			fpdInstance.$container.on('click', '.fpd-actions-wrapper .fpd-action-btn', function() {

				var $this = $(this);

				if($this.hasClass('tooltipstered')) {
					$this.tooltipster('hide');
				}

				instance.doAction($this);

				//doyle
				$this.parents('.fpd-dropdown-btn:first').removeClass('fpd-active')

			});

			//doyle
			fpdInstance.$container.on('click', '.fpd-actions-wrapper .fpd-dropdown-btn >  .fpd-label', function() {

				$(this).parent().toggleClass('fpd-active')
				.parents('.fpd-actions-wrapper:first').siblings().find('.fpd-dropdown-btn').removeClass('fpd-active')

			});

		}

		fpdInstance.$container.on('viewSelect', function(evt, viewIndex, viewInstance) {

			instance.resetAllActions();

			fpdInstance.$mainWrapper.find('[data-action="previous-view"], [data-action="next-view"]').toggleClass('fpd-hidden', fpdInstance.viewInstances.length <= 1);
			fpdInstance.$mainWrapper.find('[data-action="previous-view"]').toggleClass('fpd-disabled', viewIndex === 0);
			fpdInstance.$mainWrapper.find('[data-action="next-view"]').toggleClass('fpd-disabled', viewIndex === fpdInstance.viewInstances.length - 1);

		});

	};

	//set action button to specific position
	var _setActionButtons = function(pos) {

		fpdInstance.$container.find('.fpd-actions-container').append('<div class="fpd-actions-wrapper fpd-pos-'+pos+'"></div>');

		var posActions = instance.currentActions[pos];

		if(fpdInstance.mainOptions.uiTheme == 'doyle') {

			if(pos == 'left') {

				var $targetWrapper = fpdInstance.$container.find('.fpd-actions-wrapper.fpd-pos-'+pos).append('<div class="fpd-dropdown-btn"><span class="fpd-label">'+fpdInstance.getTranslation('actions', 'menu_file', 'File')+'</span><div class="fpd-dropdown-menu"></div></div>').find('.fpd-dropdown-menu');

				for(var i=0; i < posActions.length; ++i) {

					var actionName = posActions[i],
						$action = $actions.children('[data-action="'+actionName+'"]');

					$action = $action.clone().removeClass('fpd-tooltip');
					$action.append($action.attr('title'))

					$targetWrapper.append($action);
				}

			}

			if(pos == 'right') {

				var $targetWrapper = fpdInstance.$container.find('.fpd-actions-wrapper.fpd-pos-'+pos).append('<div class="fpd-dropdown-btn"><span class="fpd-label">'+fpdInstance.getTranslation('actions', 'menu_tools', 'Tools')+'</span><div class="fpd-dropdown-menu"></div></div>').find('.fpd-dropdown-menu');

				for(var i=0; i < posActions.length; ++i) {

					var actionName = posActions[i],
						$action = $actions.children('[data-action="'+actionName+'"]');

					$action = $action.clone().removeClass('fpd-tooltip');
					$action.append($action.attr('title'))

					$targetWrapper.append($action);
				}

			}

			if(pos == 'top') {

				var $targetWrapper = fpdInstance.$container.find('.fpd-actions-wrapper.fpd-pos-'+pos);

				for(var i=0; i < posActions.length; ++i) {

					var actionName = posActions[i],
						$action = $actions.children('[data-action="'+actionName+'"]');

					$action = $action.clone().removeClass('fpd-tooltip');
					$action.append('<span>'+$action.attr('title')+'</span>')

					$targetWrapper.append($action);
				}

			}

		}
		else {

			for(var i=0; i < posActions.length; ++i) {

				var actionName = posActions[i],
					$action = $actions.children('[data-action="'+actionName+'"]');

				fpdInstance.$container.find('.fpd-actions-wrapper.fpd-pos-'+pos).append($action.clone());
			}

		}

	};

	//returns an object with the saved products for the current showing product
	var _getSavedProducts = function() {

		return FPDUtil.localStorageAvailable() ? JSON.parse(window.localStorage.getItem(fpdInstance.$container.attr('id'))) : false;

	};

	//download png, jpeg or pdf
	this.downloadFile = function(type, onlyCurrentView) {

		if(!fpdInstance.currentViewInstance) { return; }

		onlyCurrentView = onlyCurrentView === undefined ? false : onlyCurrentView;

		if(type === 'jpeg' || type === 'png') {

			var a = document.createElement('a'),
				background = type === 'jpeg' ? '#fff' : 'transparent';

			if(typeof a.download !== 'undefined') {

				if(onlyCurrentView) {

					fpdInstance.currentViewInstance.toDataURL(function(dataURL) {

						download(dataURL, downloadFilename+'.'+type, 'image/'+type);

					}, background, {format: type}, fpdInstance.watermarkImg);

				}
				else {

					fpdInstance.getProductDataURL(function(dataURL) {

						download(dataURL, downloadFilename+'.'+type, 'image/'+type);

					}, background, {format: type});

				}

			}
			else {
				fpdInstance.createImage(true, false, background, {format: type}, onlyCurrentView);
			}

		}
		else if(type === 'svg') {

			download(
				fpdInstance.currentViewInstance.toSVG({suppressPreamble: false}, null, false, fpdInstance.watermarkImg),
				'Product_'+fpdInstance.currentViewIndex+'.svg',
				'image/svg+xml'
			);

		}
		else {

			var _createPDF = function(dataURLs) {

				dataURLs = typeof dataURLs === 'string' ? [dataURLs] : dataURLs;

				var doc;
				for(var i=0; i < dataURLs.length; ++i) {

					var viewWidth = fpdInstance.viewInstances[i].options.stageWidth,
						viewHeight = fpdInstance.viewInstances[i].options.stageHeight,
						orien = viewWidth > viewHeight ? 'l' : 'p';

					if(i != 0) { //non-first pages
						doc.addPage([viewWidth, viewHeight], orien);
					}
					else { //first page
						doc = new jspdf.jsPDF({orientation: orien, unit: 'px', format: [viewWidth, viewHeight]})
					}

					doc.addImage(dataURLs[i], 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());

				}

				doc.save(downloadFilename+'.pdf');

			};

			onlyCurrentView ? fpdInstance.currentViewInstance.toDataURL(_createPDF, 'transparent', {format: 'png'}, fpdInstance.watermarkImg) : fpdInstance.getViewsDataURL(_createPDF, 'transparent', {format: 'png'});

		}

	};

	this.setup = function(actions) {

		this.currentActions = actions;

		fpdInstance.$container.find('.fpd-actions-container').empty();

		var keys = Object.keys(actions);
		for(var i=0; i < keys.length; ++i) {

			var posActions = actions[keys[i]];
			if(typeof posActions === 'object' && posActions.length > 0) {
				_setActionButtons(keys[i]);
			}

		}

	};

	this.doAction = function($this) {

		if(!fpdInstance.currentViewInstance) { return; }

		var action = $this.data('action');

		fpdInstance.deselectElement();

		if(action === 'print') {

			fpdInstance.print();

		}
		else if(action === 'reset-product') {

			var confirmReset = confirm(fpdInstance.getTranslation('misc', 'reset_confirm'));
			if(confirmReset) {
				fpdInstance.loadProduct(fpdInstance.currentViews);
			}

		}
		else if(action === 'undo') {

			fpdInstance.currentViewInstance.undo();

		}
		else if(action === 'redo') {

			fpdInstance.currentViewInstance.redo();

		}
		else if(action === 'info') {

			FPDUtil.showModal($this.children('.fpd-info-content').text(), false, '', fpdInstance.$modalContainer);

		}
		else if(action === 'preview-lightbox') {

			fpdInstance.getProductDataURL(function(dataURL) {

				var image = new Image();
				image.src = dataURL;

				image.onload = function() {
					FPDUtil.showModal('<div style="text-align: center;"><img src="'+this.src+'" download="product.png" /></div>', true);
				}

			});

		}
		else if(action === 'save') {

			fpdInstance.mainBar.toggleDialog(false);

			var $prompt = FPDUtil.showModal(fpdInstance.getTranslation('actions', 'save_placeholder'), false, 'prompt', fpdInstance.$modalContainer);
			$prompt.find('.fpd-btn').text(fpdInstance.getTranslation('actions', 'save')).click(function() {

				fpdInstance.doUnsavedAlert = false;

				var title = $(this).siblings('input:first').val(),
					scaling = FPDUtil.getScalingByDimesions(fpdInstance.currentViewInstance.options.stageWidth, fpdInstance.currentViewInstance.options.stageHeight, 300, 300, 'cover');

				fpdInstance.currentViewInstance.toDataURL(function(thumbnail) {

					//get key and value
					var product = fpdInstance.getProduct();

					if(product && fpdInstance.mainOptions.saveActionBrowserStorage) {

						//check if there is an existing products array
						var savedProducts = _getSavedProducts();
						if(!savedProducts) {
							//create new
							savedProducts = [];
						}

						savedProducts.push({thumbnail: thumbnail, product: product, title: title});
						window.localStorage.setItem(fpdInstance.$container.attr('id'), JSON.stringify(savedProducts));

						FPDUtil.showMessage(fpdInstance.getTranslation('misc', 'product_saved'));

					}

					$prompt.find('.fpd-modal-close').click();
					fpdInstance.$container.trigger('actionSave', [title, thumbnail, product]);

				}, 'transparent', {multiplier: scaling, format: 'png'});

			});

		}
		else if(action === 'load') {

			fpdInstance.mainBar.$content.find('.fpd-saved-designs-panel .fpd-grid').empty();

			//load all saved products into list
			if(fpdInstance.mainOptions.saveActionBrowserStorage) {

				var savedProducts = _getSavedProducts();
				if(savedProducts && savedProducts.length > 0) {

					for(var i=0; i < savedProducts.length; ++i) {

						var savedProduct = savedProducts[i];
						instance.addSavedProduct(savedProduct.thumbnail, savedProduct.product, savedProduct.title);

					}

					FPDUtil.createScrollbar(fpdInstance.mainBar.$content.find('.fpd-saved-designs-panel .fpd-scroll-area'));
					fpdInstance.mainBar.$content.find('.fpd-saved-designs-panel .fpd-scroll-area').mCustomScrollbar('update');

				}
				else {
					fpdInstance.mainBar.$content.find('.fpd-saved-designs-panel .fpd-empty-saved-designs').toggleClass('fpd-hidden', false);
				}

			}

			fpdInstance.$container.trigger('actionLoad');

			fpdInstance.mainBar.callSecondary('fpd-saved-designs-panel');


		}
		else if(action === 'manage-layers') {

			fpdInstance.mainBar.callModule('manage-layers');

		}
		else if(action === 'snap') {

			$this.toggleClass('fpd-active');
			fpdInstance.currentViewInstance._snapElements = $this.hasClass('fpd-active');

			fpdInstance.$mainWrapper.children('.fpd-snap-line-h, .fpd-snap-line-v').hide();

			if($this.hasClass('fpd-active')) {

				var lines = [],
					gridX = fpdInstance.mainOptions.snapGridSize[0] ? fpdInstance.mainOptions.snapGridSize[0] : 50,
					gridY = fpdInstance.mainOptions.snapGridSize[1] ? fpdInstance.mainOptions.snapGridSize[1] : 50,
					linesXNum = Math.ceil(fpdInstance.currentViewInstance.options.stageWidth / gridX),
					linesYNum = Math.ceil(fpdInstance.currentViewInstance.options.stageHeight / gridY);

				//add x-lines
				for(var i=0; i < linesXNum; ++i) {

					var lineX = new fabric.Rect({
						width: 1,
						height: fpdInstance.currentViewInstance.options.stageHeight,
						fill: '#ccc',
						opacity: 0.6,
						left: i * gridX,
						top: 0
					});

					lines.push(lineX);

				}

				//add y-lines
				for(var i=0; i < linesYNum; ++i) {

					var lineY = new fabric.Rect({
						width: fpdInstance.currentViewInstance.options.stageWidth,
						height: 1,
						fill: '#ccc',
						opacity: 0.6,
						top: i * gridY,
						left: 0
					});

					lines.push(lineY);

				}

				snapLinesGroup = new fabric.Group(lines, {id: '_snap_lines_group', left: 0, top: 0, evented: false, selectable: false, _ignore: true});
				fpdInstance.currentViewInstance.stage.add(snapLinesGroup);

			}
			else {

				if(snapLinesGroup) {
					fpdInstance.currentViewInstance.stage.remove(snapLinesGroup);
				}

			}

		}
		else if(action === 'qr-code') {

			var $internalModal = FPDUtil.showModal($this.children('.fpd-modal-context').clone(), false, '', fpdInstance.$modalContainer),
				$colorPickers = $internalModal.find('.fpd-qrcode-colors input').spectrum({
					preferredFormat: "hex",
					showInput: true,
					showInitial: true,
					showButtons: false,
					replacerClassName: 'fpd-spectrum-replacer',
				});

			$internalModal.find('.fpd-add-qr-code').click(function() {

				var text = $internalModal.find('.fpd-modal-context > input').val();

				if(text && text.length !== 0) {

					var $qrcodeWrapper = $internalModal.find('.fpd-qrcode-wrapper').empty(),
						qrcode = new QRCode($qrcodeWrapper.get(0), {
					    text: text,
					    width: 256,
					    height: 256,
					    colorDark : $colorPickers.filter('.fpd-qrcode-color-dark').spectrum('get').toHexString(),
					    colorLight : $colorPickers.filter('.fpd-qrcode-color-light').spectrum('get').toHexString(),
					    correctLevel : QRCode.CorrectLevel.H
					});

					$qrcodeWrapper.find('img').on('load', function() {

						fpdInstance.addElement(
							'image',
							this.src,
							'QR-Code - '+text,
							fpdInstance.currentViewInstance.options.qrCodeProps
						);

						$internalModal.find('.fpd-modal-close').click();

					});

				}

			});

			$internalModal.on('modalRemove', function() {
				$colorPickers.spectrum('destroy');
			});

		}
		else if(action === 'zoom') {

			if(!$this.hasClass('fpd-active')) {

				var $contextClone = $this.children('.fpd-action-context').clone();
				fpdInstance.$mainWrapper.append($contextClone);

				var startVal = fpdInstance.currentViewInstance.stage.getZoom() / fpdInstance.currentViewInstance.responsiveScale;

				$contextClone.find('.fpd-zoom-slider')
				.attr('step', fpdInstance.mainOptions.zoomStep).attr('max', fpdInstance.mainOptions.maxZoom)
				.val(startVal).rangeslider({
					polyfill: false,
					rangeClass: 'fpd-range-slider',
					disabledClass: 'fpd-range-slider--disabled',
					horizontalClass: 'fpd-range-slider--horizontal',
				    verticalClass: 'fpd-range-slider--vertical',
				    fillClass: 'fpd-range-slider__fill',
				    handleClass: 'fpd-range-slider__handle',
				    onSlide: function(pos, value) {
						fpdInstance.setZoom(value);
				    }
				});

				$contextClone.find('.fpd-stage-pan').click(function() {

					fpdInstance.currentViewInstance.dragStage = !fpdInstance.currentViewInstance.dragStage;
					fpdInstance.$productStage.toggleClass('fpd-drag');

				});

			}
			else {

				fpdInstance.currentViewInstance.dragStage = false;
				fpdInstance.$productStage.removeClass('fpd-drag');
				fpdInstance.$mainWrapper.children('.fpd-action-context').remove();

			}

			$this.toggleClass('fpd-active');

		}
		else if(action === 'download') {

			var $internalModal = FPDUtil.showModal($this.children('.fpd-modal-context').clone(), false, '', fpdInstance.$modalContainer);

			$internalModal.find('.fpd-modal-context span[data-value]').click(function() {

				var $this = $(this);

				instance.downloadFile($this.data('value'), $this.siblings('.fpd-checkbox:first').children('input').is(':checked'));
				$internalModal.find('.fpd-modal-close').click();

			});


		}
		else if(action === 'magnify-glass') {

			fpdInstance.resetZoom();

			if($this.hasClass('fpd-active')) {

				$(".fpd-zoom-image,.zoomContainer").remove();
				fpdInstance.$productStage.children('.fpd-view-stage').eq(fpdInstance.currentViewIndex).removeClass('fpd-hidden');

			}
			else {

				fpdInstance.toggleSpinner();

				var scaling = Number(2000 / fpdInstance.currentViewInstance.options.stageWidth).toFixed(2),
					dataURL = fpdInstance.currentViewInstance.stage.toDataURL({multiplier: scaling, format: 'png'});

				fpdInstance.$productStage.append('<img src="'+dataURL+'" class="fpd-zoom-image" />')
				.children('.fpd-zoom-image').elevateZoom({
					scrollZoom: true,
					borderSize: 1,
					zoomType: "lens",
					lensShape: "round",
					lensSize: 200,
					responsive: true,
					onZoomedImageLoaded: function($elem) {
						$('.zoomContainer').appendTo('.fpd-modal-product-designer .fpd-main-wrapper'); //set zoom container inside main wrapper in modal mode
						fpdInstance.toggleSpinner(false);
					}
				});


				fpdInstance.$productStage.children('.fpd-view-stage').addClass('fpd-hidden');

			}

			$this.toggleClass('fpd-active');

		}
		else if(action === 'ruler') {

			if($this.hasClass('fpd-active')) {

				var rulerHor = fpdInstance.currentViewInstance.getElementByID('_ruler_hor');
				if(rulerHor) {
					fpdInstance.currentViewInstance.stage.remove(rulerHor);
				}

				var rulerVer = fpdInstance.currentViewInstance.getElementByID('_ruler_ver');
				if(rulerVer) {
					fpdInstance.currentViewInstance.stage.remove(rulerVer);
				}

			}
			else {

				var pixelUnitsOptions = {
					fill: '#979797',
					fontSize: 10,
					fontFamily: 'Arial'
				};

				fabric.util.loadImage(FPDActions.rulerHorImg, function (img) {

					var groupRulerHor = new fabric.Group([], {
						left: 0,
						top: 0,
						originX: 'left',
						originY: 'top',
						evented: false,
						selectable: false,
						id: '_ruler_hor'
					});

					var rect = new fabric.Rect({
					    width: fpdInstance.currentViewInstance.options.stageWidth,
					    height: 30
					});

					rect.setPatternFill({
				        source: img,
				        repeat: 'repeat-x'
				    });

				    groupRulerHor.addWithUpdate(rect);

					var loopX = Math.ceil(fpdInstance.currentViewInstance.options.stageWidth / 100);
				    for(var i=1; i < loopX; ++i) {
					    var text = new fabric.Text(String(i*100), $.extend({}, pixelUnitsOptions, {top: 3, left: (i*100)+3}));
					    groupRulerHor.addWithUpdate(text);
					}

					fpdInstance.currentViewInstance.stage.add(groupRulerHor).renderAll();

				});

				fabric.util.loadImage(FPDActions.rulerVerImg, function (img) {

					var groupRulerVer = new fabric.Group([], {
						left: 0,
						top: 0,
						originX: 'left',
						originY: 'top',
						evented: false,
						selectable: false,
						id: '_ruler_ver'
					});

					var rect = new fabric.Rect({
					    width: 30,
					    height: fpdInstance.currentViewInstance.options.stageHeight
					});

					rect.setPatternFill({
				        source: img,
				        repeat: 'repeat-y'
				    });

				    groupRulerVer.addWithUpdate(rect);

					var loopX = Math.ceil(fpdInstance.currentViewInstance.options.stageWidth / 100);
				    for(var i=1; i < loopX; ++i) {
					    var text = new fabric.Text(String(i*100), $.extend({}, pixelUnitsOptions, {
						    top: (i*100)+3,
						    left: 12,
						    angle: 90,
						    originY: 'bottom'})
						);
					    groupRulerVer.addWithUpdate(text);
					}

					fpdInstance.currentViewInstance.stage.add(groupRulerVer).renderAll();

				});

			}

			$this.toggleClass('fpd-active');

		}
		else if(action === 'previous-view') {
			fpdInstance.selectView(fpdInstance.currentViewIndex - 1);
		}
		else if(action === 'next-view') {
			fpdInstance.selectView(fpdInstance.currentViewIndex + 1);
		}
		else if(action === 'guided-tour') {

			if(fpdInstance.mainOptions.guidedTour && Object.keys(fpdInstance.mainOptions.guidedTour).length > 0) {
				var firstKey = Object.keys(fpdInstance.mainOptions.guidedTour)[0];
				fpdInstance.selectGuidedTourStep(firstKey);
			}

		}

	};

	this.resetAllActions = function() {

		$(".fpd-zoom-image,.zoomContainer").remove();
		fpdInstance.$productStage.children('.fpd-view-stage').eq(fpdInstance.currentViewIndex).removeClass('fpd-hidden');

		fpdInstance.$mainWrapper.find('.fpd-action-btn').removeClass('fpd-active');

	};

	this.hideAllTooltips = function() {

		fpdInstance.$mainWrapper.find('.fpd-action-btn.tooltipstered').tooltipster('hide');

	};

	//add a saved product to the load dialog
	this.addSavedProduct = function(thumbnail, product, title) {

		title = title ? title : '';

		//create new list item
		var $gridWrapper = fpdInstance.mainBar.$content.find('.fpd-saved-designs-panel .fpd-grid'),
			htmlTitle = title !== '' ? 'title="'+title+'"' : '';

		$gridWrapper.append('<div class="fpd-item fpd-tooltip" '+htmlTitle+'><picture style="background-image: url('+thumbnail+')" ></picture><div class="fpd-remove-design"><span class="fpd-icon-remove"></span></div></div>')
		.children('.fpd-item:last').click(function(evt) {

			fpdInstance.loadProduct($(this).data('product'));
			fpdInstance.currentProductIndex = -1;

		}).data('product', product)
		.children('.fpd-remove-design').click(function(evt) {

			evt.stopPropagation();

			var $item = $(this).parent('.fpd-item'),
				index = $item.parent('.fpd-grid').children('.fpd-item').index($item);

			if(fpdInstance.mainOptions.saveActionBrowserStorage) {

					var savedProducts = _getSavedProducts();
					savedProducts.splice(index, 1);

				window.localStorage.setItem(fpdInstance.$container.attr('id'), JSON.stringify(savedProducts));

			}

			fpdInstance.$container.trigger('actionLoad:Remove', [index, $item]);

			$item.remove();

		});

		FPDUtil.updateTooltip($gridWrapper);

		return $gridWrapper.children('.fpd-item:last');

	};

	_initialize();

};

FPDActions.availableActions = [
	'print',
	'reset-product',
	'undo',
	'redo',
	'info',
	'save',
	'load',
	'manage-layers',
	'snap',
	'qr-code',
	'zoom',
	'download',
	'magnify-glass',
	'preview-lightbox',
	'ruler',
	'previous-view',
	'next-view',
	'guided-tour'
];

FPDActions.rulerHorImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAeCAYAAADaW7vzAAAAAXNSR0IArs4c6QAAAMtJREFUaAXt0bENAkEMBVGgJVranja5lq4myH50wUr+wQRDZCHWWPPee+/fdV33yw+iwAdxhUekgCBJwRgEYTjkCkGSgjEIwnDIFYIkBWMQhOGQKwRJCsYgCMMhVwiSFIxBEIZDrhAkKRiDIAyHXCFIUjAGQRgOuUKQpGAMgjAccoUgScEYjkHWWt+Tk/3dc6XTLscgz3/jt+0CgrSLDvcJMgzYfi5Iu+hwnyDDgO3ngrSLDvcJMgzYfi5Iu+hwnyDDgO3ngrSLDvf9ARH1Efg/D4CQAAAAAElFTkSuQmCC';

FPDActions.rulerVerImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAABkCAYAAACRiYAFAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAAA40lEQVRoBe2UwQ3CUBTD+KzUYXvpSHQmECzgIlk8CbnXRonqvGZt2/a4DTz3gcxPZME/Ix/q/0e99n1/Xv3M4zjOq1rSrZaLEFnv+48tkugTakRkCVouiyT6dNWIyBKE2iKJPmOoWy7sxhKMdVywVSH6hBoRWYKWyyKJPl01IrIEobZIos8Y6pYLu7EEYx0XbFWIPqFGRJag5bJIok9XjYgsQagtkugzhrrlwm4swVjHBVsVok+oEZElaLkskujTVSMiSxBqiyT6jKFuubAbSzDWccFWhegTakRkCb5aLiv07fMCuAVB+Jp9DBgAAAAASUVORK5CYII=';

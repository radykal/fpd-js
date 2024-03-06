import '../../ui/view/ActionsBar.js';
import Modal from '../../ui/view/comps/Modal.js';
import QRCodeModule from './modules/QRCode.js';
import download from 'downloadjs';
import SaveLoadModule from './modules/SaveLoad.js';

import {
	addEvents,
	toggleElemClasses,
	removeElemClasses,
	getScript,
	addElemClasses,
	fireEvent
} from '../../helpers/utils.js';

export default class ActionsBar extends EventTarget {

	static toggleActions = [
		'snap',
		'ruler',
		'zoom'
	];

	static availableActions = {
		'print': {
			icon: 'fpd-icon-print',
			title: 'Print'
		},
		'reset-product': {
			icon: 'fpd-icon-reset',
			title: 'Reset Product'
		},
		'undo': {
			icon: 'fpd-icon-undo',
			title: 'Undo'
		},
		'redo': {
			icon: 'fpd-icon-redo',
			title: 'Redo'
		},
		'info': {
			icon: 'fpd-icon-info',
			title: 'Info'
		},
		'zoom': {
			icon: 'fpd-icon-zoom-in',
			title: 'Zoom'
		},
		'download': {
			icon: 'fpd-icon-download',
			title: 'Download'
		},
		'preview-lightbox': {
			icon: 'fpd-icon-preview-lightbox',
			title: 'Preview Lightbox'
		},
		'ruler': {
			icon: 'fpd-icon-ruler',
			title: 'Ruler'
		},
		'previous-view': {
			icon: 'fpd-icon-back',
			title: 'Previous View'
		},
		'next-view': {
			icon: 'fpd-icon-forward',
			title: 'Next View'
		},
		'guided-tour': {
			icon: 'fpd-icon-guided-tour',
			title: 'Guided Tour'
		},
		'qr-code': {
			icon: 'fpd-icon-qrcode',
			title: 'QR-Code'
		},
		'save-load': {
			icon: 'fpd-icon-save',
			title: 'Saved Designs'
		}
	};

	currentActions = {};

	constructor(fpdInstance) {

		super();

		this.fpdInstance = fpdInstance;

		this.container = document.createElement("fpd-actions-bar");
		fpdInstance.container.append(this.container);

		this.leftActionsMenu = this.container.querySelector('[data-pos="left"] fpd-actions-menu');
		this.leftActionsMenu.setAttribute('placeholder', this.fpdInstance.translator.getTranslation('actions', 'menu_file'));

		this.centerActionsMenu = this.container.querySelector('[data-pos="center"] fpd-actions-menu');

		this.rightActionsMenu = this.container.querySelector('[data-pos="right"] fpd-actions-menu');
		this.rightActionsMenu.setAttribute('placeholder', this.fpdInstance.translator.getTranslation('actions', 'menu_more'));

		addEvents(
			fpdInstance.container.querySelectorAll('.fpd-close'),
			'click',
			(evt) => {

				removeElemClasses(
					this.fpdInstance.modalWrapper,
					['fpd-show']
				)

				/**
				 * Gets fired when the modal with the product designer closes.
				 *
				 * @event FancyProductDesigner#modalDesignerClose
				 * @param {Event} event
				 */
				this.fpdInstance.dispatchEvent(
					new CustomEvent('modalDesignerClose')
				);

			}
		)

		addEvents(
			fpdInstance.container.querySelector('.fpd-done'),
			'click',
			(evt) => {

				/**
				 * Gets fired when the modal with the product designer closes.
				 *
				 * @event FancyProductDesigner#modalDesignerDone
				 * @param {Event} event
				 */
				this.fpdInstance.dispatchEvent(
					new CustomEvent('modalDesignerDone')
				);

			}
		)

		addEvents(
			fpdInstance,
			['viewSelect'],
			(evt) => {

				this.reset();

			}
		)

		addEvents(
			window,
			'resize',
			(evt) => {

				if(fpdInstance.inTextField) return;
				
				this.reset();

			}
		)
		
		addEvents(
            window,
            ['resize', 'fpdModalDesignerOpen'],
            () => {
                
				if(this.leftActionsMenu)
                	this.leftActionsMenu.toggleMenus();

				if(this.rightActionsMenu)
                	this.rightActionsMenu.toggleMenus();

            }
        )

		this.setup(fpdInstance.mainOptions.actions)

	}

	#setPosActions(pos, actions) {
		
		if (Array.isArray(actions) && actions.length) {

			actions.forEach(action => {

				let wrapper;
				if (pos == 'left') {

					wrapper = this.leftActionsMenu;

				}
				else if (pos == 'center') {

					wrapper = this.centerActionsMenu;

				}
				else if (pos == 'right') {

					wrapper = this.rightActionsMenu;

				}

				if (wrapper)
					this.addActionBtn(wrapper, action, true);

			})

		}
		else {

			//hide actions wrapper			
			if (pos == 'left' || pos == 'right') {

				addElemClasses(
					this.container.querySelector('[data-pos="'+pos+'"]'), 
					['fpd-visible-hidden']
				)

			}	

		}

	}

	addActionBtn(wrapper, action, smartMenu=false) {

		if (ActionsBar.availableActions.hasOwnProperty(action)) {

			const actionData = ActionsBar.availableActions[action];
			const label = this.fpdInstance.translator.getTranslation(
				'actions', 
				action.replace(/-/g, '_'),
				actionData.title
			);
			
			if(smartMenu) {

				actionData.type = action;
				actionData.title = label;
				actionData.handler = (evt) => {

					const switchElem = evt.currentTarget.querySelector('.fpd-switch');
					if (switchElem && !evt.target.classList.contains('fpd-switch')) {
						switchElem.checked = !switchElem.checked;
					}

					this.doAction(evt.currentTarget.dataset.action)
				}
							
				wrapper.items = [...wrapper.items, actionData];

			}
			else {

				const actionBtn = document.createElement('div');
				actionBtn.className = 'fpd-btn fpd-tooltip';
				actionBtn.setAttribute('aria-label', label);
				actionBtn.dataset.action = action;
				actionBtn.innerHTML = `<i class="${actionData.icon}"></i><span>${label}</span>`;

				if (ActionsBar.toggleActions.includes(action)) {

					actionBtn.insertAdjacentHTML(
						'beforeend',
						'<input type="checkbox" class="fpd-switch" />'
					)

				}

				wrapper.append(actionBtn);

				addEvents(
					actionBtn,
					'click',
					(evt) => {

						const switchElem = evt.currentTarget.querySelector('.fpd-switch');
						if (switchElem && !evt.target.classList.contains('fpd-switch')) {
							switchElem.checked = !switchElem.checked;
						}

						this.doAction(evt.currentTarget.dataset.action)

					}
				)

			}

		}

	}

	doAction(action) {

		if (!this.fpdInstance.currentViewInstance) { return; }

		this.fpdInstance.deselectElement();

		if (action === 'print') {

			this.fpdInstance.print();

		}
		else if (action === 'reset-product') {

			var confirmModal = Modal(
				this.fpdInstance.translator.getTranslation(
					'misc',
					'reset_confirm'
				),
				false,
				'confirm',
				this.fpdInstance.container
			);

			const confirmBtn = confirmModal.querySelector('.fpd-confirm');
			confirmBtn.innerText = this.fpdInstance.translator.getTranslation(
				'actions',
				'reset_product'
			);

			addEvents(
				confirmBtn,
				['click'],
				() => {

					this.fpdInstance.loadProduct(this.fpdInstance.productViews);
					confirmModal.remove();

				}
			)

		}
		else if (action === 'undo') {

			this.fpdInstance.currentViewInstance.fabricCanvas.undo();

		}
		else if (action === 'redo') {

			this.fpdInstance.currentViewInstance.fabricCanvas.redo();

		}
		else if (action === 'info') {

			Modal(
				this.fpdInstance.translator.getTranslation('actions', 'info_content'),
				false,
				'',
				this.fpdInstance.container
			);

		}
		else if (action === 'preview-lightbox') {

			this.fpdInstance.getProductDataURL((dataURL) => {

				const image = new Image();
				image.src = dataURL;

				image.onload = () => {

					const previewModal = Modal(
						'<div style="background: url('+ image.src +'); height: 90vh; width:100%; background-size:contain; background-repeat:no-repeat; background-position:center;"></div>',
						true
					);

					/**
					 * Gets fired when an element is added.
					 *
					 * @event FancyProductDesigner#actionPreviewModalOpen
					 * @param {Event} event
					 */
					fireEvent(this.fpdInstance, 'actionPreviewModalOpen', {
						modal: previewModal
					})

				}

			});

		}
		else if (action === 'snap') {

			this.fpdInstance.currentViewInstance.fabricCanvas.snapToGrid = !this.fpdInstance.currentViewInstance.fabricCanvas.snapToGrid;
			this.fpdInstance.currentViewInstance.fabricCanvas.renderAll();

		}
		else if (action === 'zoom') {

			const existingZoomWrapper = this.fpdInstance.mainWrapper.container.querySelector('.fpd-zoom-wrapper');
			if (existingZoomWrapper) {
				existingZoomWrapper.remove();
				return;
			}

			const zoomWrapper = document.createElement('div');
			zoomWrapper.className = 'fpd-zoom-wrapper fpd-shadow-1';

			const startVal = this.fpdInstance.currentViewInstance.fabricCanvas.getZoom() / this.fpdInstance.currentViewInstance.fabricCanvas.responsiveScale;
			const zoomSlider = document.createElement('fpd-range-slider');
			zoomSlider.className = 'fpd-progress';
			zoomSlider.setAttribute('value', startVal);
			zoomSlider.setAttribute('step', 0.02);
			zoomSlider.setAttribute('min', 1);
			zoomSlider.setAttribute('max', 3);
			zoomSlider.onInput = (evt) => {

				this.fpdInstance.currentViewInstance.fabricCanvas.setResZoom(Number(evt.currentTarget.value));

			}
			zoomWrapper.append(zoomSlider);

			const panElem = document.createElement('div');
			panElem.className = "fpd-stage-pan fpd-toggle";
			panElem.innerHTML = '<span class="fpd-icon-drag"></span>';
			zoomWrapper.append(panElem);

			addEvents(
				panElem,
				'click',
				(evt) => {

					this.fpdInstance.currentViewInstance.fabricCanvas.panCanvas = !this.fpdInstance.currentViewInstance.fabricCanvas.panCanvas;

					toggleElemClasses(panElem, ['fpd-active'], this.fpdInstance.currentViewInstance.fabricCanvas.panCanvas);

				}
			)

			this.fpdInstance.mainWrapper.container.append(zoomWrapper);

		}
		else if (action === 'download') {

			const downloadHTML = `<div class="fpd-modal-download">
			<span data-value="jpeg">
				<span class="fpd-icon-jpg"></span>
			</span>
			<span data-value="png">
				<span class="fpd-icon-png"></span>
			</span>
			<span data-value="pdf">
				<span class="fpd-icon-pdf"></span>
			</span>
			<span data-value="svg">
				<span class="fpd-icon-svg"></span>
			</span>
			<div class="fpd-switch-wrapper">
				<input type="checkbox" class="fpd-switch" id="fpd-action-download-single-view" />
				<label for="fpd-action-download-single-view">${this.fpdInstance.translator.getTranslation('actions', 'download_current_view')}</label>
			</div>
		</div>`;

			const downloadModal = Modal(
				downloadHTML,
				false,
				'',
				this.fpdInstance.container
			);

			addEvents(
				downloadModal.querySelectorAll('span[data-value]'),
				'click',
				(evt) => {

					this.downloadFile(
						evt.currentTarget.dataset.value,
						downloadModal.querySelector('.fpd-switch').checked
					);

					downloadModal.remove();
				}
			)

		}
		else if (action === 'ruler') {

			this.fpdInstance.currentViewInstance.fabricCanvas.enableRuler = !this.fpdInstance.currentViewInstance.fabricCanvas.enableRuler;
			this.fpdInstance.currentViewInstance.fabricCanvas.renderAll();

		}
		else if (action === 'previous-view') {

			this.fpdInstance.selectView(this.fpdInstance.currentViewIndex - 1);

		}
		else if (action === 'next-view') {

			this.fpdInstance.selectView(this.fpdInstance.currentViewIndex + 1);

		}
		else if (action === 'guided-tour' && this.fpdInstance.guidedTour) {

			this.fpdInstance.guidedTour.start();

		}
		else if (action === 'qr-code') {

			const existingModal = this.fpdInstance.container.querySelector('.fpd-modal-internal');
			if(existingModal)
				existingModal.remove();
			
			const modal = Modal(
				'',
				false,
				'',
				this.fpdInstance.container
			);
			
			const qrCodeModule = new QRCodeModule(
				this.fpdInstance,
				modal.querySelector('.fpd-modal-content') 
			)

			this.fpdInstance.translator.translateArea(modal);

			addEvents(
				qrCodeModule,
				'qrCodeModuleBtnClick',
				() => {

					modal.remove();
					
				}
			)

			
		}
		else if (action === 'save-load') {

			const existingModal = this.fpdInstance.container.querySelector('.fpd-modal-internal');
			if(existingModal)
				existingModal.remove();
			
			const modal = Modal(
				'',
				false,
				'',
				this.fpdInstance.container
			);
			
			new SaveLoadModule(
				this.fpdInstance,
				modal.querySelector('.fpd-modal-content') 
			)

			this.fpdInstance.translator.translateArea(modal);
			
		}

		/**
		 * Gets fired when an element is added.
		 *
		 * @event FancyProductDesigner#actionClick
		 * @param {Event} event
		 * @param {String} event.detail.action - The action type.
		 */
		fireEvent(this.fpdInstance, 'actionClick', {
            action: action,
        })

	}

	//download png, jpeg or pdf
	downloadFile(type, onlyCurrentView = false) {

		if (!this.fpdInstance.currentViewInstance) { return; }

		const downloadFilename = this.fpdInstance.mainOptions.downloadFilename;

		if (type === 'jpeg' || type === 'png') {

			var a = document.createElement('a'),
				bgColor = type === 'jpeg' ? '#fff' : 'transparent';

			if (onlyCurrentView) {

				this.fpdInstance.currentViewInstance.toDataURL((dataURL) => {

					download(dataURL, downloadFilename + '.' + type, 'image/' + type);

				}, { format: type, backgroundColor: bgColor, watermarkImg: this.fpdInstance.watermarkImg });

			}
			else {

				this.fpdInstance.getProductDataURL((dataURL) => {

					download(dataURL, downloadFilename + '.' + type, 'image/' + type);

				}, { format: type, backgroundColor: bgColor });

			}

		}
		else if (type === 'svg') {

			download(
				this.fpdInstance.currentViewInstance.toSVG({ suppressPreamble: false, watermarkImg: this.fpdInstance.watermarkImg }),
				'Product_' + this.fpdInstance.currentViewIndex + '.svg',
				'image/svg+xml'
			);

		}
		else {

			getScript(
				'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
			).then(() => {

				const _createPDF = (dataURLs) => {

					dataURLs = typeof dataURLs === 'string' ? [dataURLs] : dataURLs;

					let doc;
					for (let i = 0; i < dataURLs.length; ++i) {

						const index = onlyCurrentView ? this.fpdInstance.currentViewIndex : i;
						let viewWidth = this.fpdInstance.viewInstances[index].options.stageWidth,
							viewHeight = this.fpdInstance.viewInstances[index].options.stageHeight,
							orien = viewWidth > viewHeight ? 'l' : 'p';

						if (i != 0) { //non-first pages
							doc.addPage([viewWidth, viewHeight], orien);
						}
						else { //first page
							doc = new jspdf.jsPDF({ orientation: orien, unit: 'px', format: [viewWidth, viewHeight] })
						}

						doc.addImage(dataURLs[i], 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());

					}

					doc.save(downloadFilename + '.pdf');

				};
				
				if (jspdf)
					onlyCurrentView ?
						this.fpdInstance.currentViewInstance.toDataURL(_createPDF, { format: 'png', watermarkImg: this.fpdInstance.watermarkImg})
						:
						this.fpdInstance.getViewsDataURL(_createPDF, { format: 'png' });

			})

		}

	}

	reset() {
		
		//uncheck all switches
		const switchElems = this.container.querySelectorAll('.fpd-switch');
		if (switchElems) {

			switchElems.forEach(switchElem => {
				switchElem.checked = false;

			});

		}

		//remove and reset zoom
		const zoomWrapper = this.fpdInstance.mainWrapper.container.querySelector('.fpd-zoom-wrapper');
		if (zoomWrapper)
			zoomWrapper.remove();

		if (this.fpdInstance.currentViewInstance)
			this.fpdInstance.currentViewInstance.fabricCanvas.setResZoom(1);

	}

	setup(actions = {}) {

		this.currentActions = actions;

		if (typeof actions === 'object') {

			this.container.querySelectorAll('fpd-actions-menu').forEach(actionMenu => {

				actionMenu.items = [];
				
			})

			for (const pos in actions) {

				this.#setPosActions(pos, actions[pos])

			}

		}

		this.fpdInstance.translator.translateArea(this.container);

	}

}

window.FPDActions = ActionsBar;
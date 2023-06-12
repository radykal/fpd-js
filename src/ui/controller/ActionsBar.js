import '/src/ui/view/ActionsBar.js';
import Modal from '/src/ui/view/comps/Modal';

import {
    addEvents,
    toggleElemClasses,
	removeElemClasses,
	getScript
} from '/src/helpers/utils';

export default class ActionsBar extends EventTarget {

	static availableActions = {
        'print': 'fpd-icon-print',
        'reset-product': 'fpd-icon-reset',
        'undo': 'fpd-icon-undo',
        'redo': 'fpd-icon-redo',
        'info': 'fpd-icon-info-outline',
        'snap': 'fpd-icon-magnet',
        'zoom': 'fpd-icon-zoom-in',
        'download': 'fpd-icon-cloud-download',
        'preview-lightbox': ' fpd-icon-preview-lightbox',
        'ruler': 'fpd-icon-ruler',
        'previous-view': 'fpd-icon-back',
        'next-view': 'fpd-icon-forward',
        'guided-tour': 'fpd-icon-guided-tour'
	};

	static toggleActions = [
		'snap',
		'ruler',
		'zoom'
	];

    currentActions = {};

    constructor(fpdInstance) {
        
        super();

        this.fpdInstance = fpdInstance;
        
        this.container = document.createElement("fpd-actions-bar");
        fpdInstance.container.append(this.container);
        
        addEvents(
            fpdInstance.container.querySelectorAll('.fpd-dropdown-btn'),
            'click',
            (evt) => {

                const menu = evt.currentTarget.querySelector('.fpd-dropdown-menu');
                toggleElemClasses(
                    menu, 
                    ['fpd-show'],
                    !menu.classList.contains('fpd-show')
                )

            }
        )
		
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

				this.reset();

			}
		)

        this.setup(fpdInstance.mainOptions.actions)

    }

    #setPosActions(pos, actions) {
            
        if(actions) {

            actions.forEach(action => {

                let wrapper;
                if(pos == 'left') {

                    wrapper = this.container.querySelector('[data-pos="left"] .fpd-actions-wrapper');
                
                }
                else if(pos == 'center') {
					
					if(this.container.querySelectorAll('[data-pos="center"].fpd-actions-wrapper > .fpd-btn').length > 1) {
						return;
					}
                    
                    wrapper = this.container.querySelector('[data-pos="'+pos+'"].fpd-actions-wrapper')
    
                }
				else if(pos == 'right') {

                    wrapper = this.container.querySelector('[data-pos="right"] .fpd-actions-wrapper');
                
                }

                if(wrapper)
                    this.#addActionBtn(wrapper, action);

            })  

        }

    }

    #addActionBtn(wrapper, action) {
        
        if(ActionsBar.availableActions.hasOwnProperty(action)) {
			
            const label = this.fpdInstance.translator.getTranslation('actions', action.replace(/-/g, '_'));
            const actionBtn = document.createElement('div');
            actionBtn.className = 'fpd-btn fpd-tooltip';
			actionBtn.setAttribute('aria-label', label);
            actionBtn.dataset.action = action;
            actionBtn.innerHTML = `<i class="${ActionsBar.availableActions[action]}"></i><span>${label}</span>`;

			if(ActionsBar.toggleActions.includes(action)) {
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
					if(switchElem && !evt.target.classList.contains('fpd-switch')) {
						switchElem.checked = !switchElem.checked;
					}

					this.doAction(evt.currentTarget.dataset.action)
				}
            )
            
        }

    }

    doAction(action) {

		if(!this.fpdInstance.currentViewInstance) { return; }

		this.fpdInstance.deselectElement();

		if(action === 'print') {

			this.fpdInstance.print();

		}
		else if(action === 'reset-product') {

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
		else if(action === 'undo') {

			this.fpdInstance.currentViewInstance.fabricCanvas.undo();

		}
		else if(action === 'redo') {

			this.fpdInstance.currentViewInstance.fabricCanvas.redo();

		}
		else if(action === 'info') {

            Modal(
                this.fpdInstance.translator.getTranslation('actions', 'info_content'),
                false,
                '',
                this.fpdInstance.container
            );

		}
		else if(action === 'preview-lightbox') {

			this.fpdInstance.getProductDataURL((dataURL) => {

				const image = new Image();
				image.src = dataURL;

				image.onload = () => {

					Modal(
						'<div style="text-align: center;"><img src="'+image.src+'" download="product.png" /></div>',
						true
					);

				}

			});

		}
		else if(action === 'snap') {

			this.fpdInstance.currentViewInstance.fabricCanvas.snapToGrid = !this.fpdInstance.currentViewInstance.fabricCanvas.snapToGrid;
			this.fpdInstance.currentViewInstance.fabricCanvas.renderAll();

		}
		else if(action === 'zoom') {

			const existingZoomWrapper = this.fpdInstance.mainWrapper.container.querySelector('.fpd-zoom-wrapper');
			if(existingZoomWrapper) {
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
		else if(action === 'download') {

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
		else if(action === 'ruler') {

			this.fpdInstance.currentViewInstance.fabricCanvas.enableRuler = !this.fpdInstance.currentViewInstance.fabricCanvas.enableRuler;
			this.fpdInstance.currentViewInstance.fabricCanvas.renderAll();

		}
		else if(action === 'previous-view') {

			this.fpdInstance.selectView(this.fpdInstance.currentViewIndex - 1);

		}
		else if(action === 'next-view') {

			this.fpdInstance.selectView(this.fpdInstance.currentViewIndex + 1);

		}
		else if(action === 'guided-tour' && this.fpdInstance.guidedTour) {

			this.fpdInstance.guidedTour.start();

		}

        /**
         * Gets fired when an element is added.
         *
         * @event FancyProductDesigner#actionClick
         * @param {Event} event
         * @param {fabric.Object} element
         */
        this.dispatchEvent(
            new CustomEvent('actionClick', {
                detail: {
                    action: action
                }
            })
        );

	}

	//download png, jpeg or pdf
	downloadFile(type, onlyCurrentView=false) {

		if(!this.fpdInstance.currentViewInstance) { return; }

		const downloadFilename = this.fpdInstance.mainOptions.downloadFilename;

		if(type === 'jpeg' || type === 'png') {

			var a = document.createElement('a'),
				bgColor = type === 'jpeg' ? '#fff' : 'transparent';

			if(onlyCurrentView) {

				this.fpdInstance.currentViewInstance.toDataURL((dataURL) => {

					download(dataURL, downloadFilename+'.'+type, 'image/'+type);

				}, {format: type, backgroundColor: bgColor, watermarkImg:  this.fpdInstance.watermarkImg});

			}
			else {

				this.fpdInstance.getProductDataURL((dataURL) => {

					download(dataURL, downloadFilename+'.'+type, 'image/'+type);

				}, {format: type, backgroundColor: bgColor});

			}

		}
		else if(type === 'svg') {

			download(
				this.fpdInstance.currentViewInstance.toSVG({suppressPreamble: false, watermarkImg: this.fpdInstance.watermarkImg}),
				'Product_'+this.fpdInstance.currentViewIndex+'.svg',
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
					for(let i=0; i < dataURLs.length; ++i) {
						
						const index = onlyCurrentView ? this.fpdInstance.currentViewIndex : i;
						let viewWidth = this.fpdInstance.viewInstances[index].options.stageWidth,
							viewHeight = this.fpdInstance.viewInstances[index].options.stageHeight,
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
				
				if(jspdf)
					onlyCurrentView ? 
						this.fpdInstance.currentViewInstance.toDataURL(_createPDF, 'transparent', {format: 'png'}, this.fpdInstance.watermarkImg) 
					: 
						this.fpdInstance.getViewsDataURL(_createPDF, 'transparent', {format: 'png'});

			})

		}

	}

	reset() {

		//uncheck all switches
		const switchElems = this.container.querySelectorAll('.fpd-actions-wrapper .fpd-switch');
		if(switchElems) {

			switchElems.forEach(switchElem => {
				switchElem.checked = false;
				
			});

		}

		//remove and reset zoom
		const zoomWrapper = this.fpdInstance.mainWrapper.container.querySelector('.fpd-zoom-wrapper');
		if(zoomWrapper)
			zoomWrapper.remove();

		if(this.fpdInstance.currentViewInstance)
			this.fpdInstance.currentViewInstance.fabricCanvas.setResZoom(1);

	}

    setup(actions={}) {

        this.currentActions = actions;

        if(typeof actions === 'object') {
                        
            this.container.querySelectorAll('.fpd-actions-wrapper').forEach(wrapper => {

                wrapper.innerHTML = '';

            })

            for(const pos in actions) {

                this.#setPosActions(pos, actions[pos])
                
            }

        }

    }

}

window.FPDActions = ActionsBar;
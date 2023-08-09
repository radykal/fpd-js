import { 
    addEvents,
    addElemClasses,
    removeElemClasses,
    isEmpty
} from '../../../helpers/utils.js';

import Snackbar from '../../../ui/view/comps/Snackbar.js';

/**
 * The class to create the Bulk Variations that is related to FancyProductDesigner class.
 * <h5>Example</h5><pre>fpdInstance.bulkVariations.getOrderVariations();</pre>
 * But you can just use the getOrder() method of FancyProductDesigner class, this will also include the order variations object. <pre>fpdInstance.getOrder();</pre>
 *
 * @class FPDBulkVariations
 * @constructor
 * @param {FancyProductDesigner} fpdInstance - An instance of FancyProductDesigner class.
 * @extends EventTarget
 */
export default class BulkVariations extends EventTarget {

    enabled = false;

    constructor(fpdInstance) {

        super();

        this.fpdInstance = fpdInstance;
        this.variations = fpdInstance.mainOptions.bulkVariations;

        if(fpdInstance.mainOptions.bulkVariationsPlacement && typeof this.variations === 'object') {

            this.container = document.querySelector(fpdInstance.mainOptions.bulkVariationsPlacement);
            if(this.container) {

                this.enabled = true;

                const headElem = document.createElement('div');
                headElem.className = 'fpd-head';
                this.container.append(headElem);

                const headline = document.createElement('div');
                headline.className = 'fpd-headline';
                headline.innerText = fpdInstance.translator.getTranslation('misc', 'bulk_add_variations_title', 'Bulk Order');
                headElem.append(headline);

                const addBtn = document.createElement('span');
                addBtn.className = 'fpd-btn';
                addBtn.innerText = fpdInstance.translator.getTranslation('misc', 'bulk_add_variations_add', 'Add');
                headElem.append(addBtn);

                addEvents(
                    addBtn,
                    'click',
                    (evt) => {

                        this.#createRow();

                    }
                )

                this.listElem = document.createElement('div');
                this.listElem.className = 'fpd-variations-list';
                this.container.append(this.listElem);                

                addElemClasses(this.container, ['fpd-bulk-variations', 'fpd-container']);
                this.#createRow();

                addEvents(
                    fpdInstance,
                    'getOrder',
                    () => {
        
                        fpdInstance._order.bulkVariations = this.getOrderVariations();
        
                    }
                )

            }

        }

    }

    #createRow(rowData={}) {

        const rowElem = document.createElement('div');
        rowElem.className = 'fpd-row';
        this.listElem.append(rowElem);

        const variationData = rowData.variation || {};
        for (const varKey in this.variations) {

            const selectElem = document.createElement('select');
            selectElem.name = varKey;            
            selectElem.innerHTML = `<option value='' disabled selected>${varKey}</option>`;
            rowElem.append(selectElem);

            const variationAttrs = this.variations[varKey];
            variationAttrs.forEach(attr => {

                const optionElem = document.createElement('option');
                optionElem.value = attr;
                optionElem.innerText = attr;

                if(variationData[varKey] == attr)
                    optionElem.selected = true;

                selectElem.append(optionElem);

            })

            addEvents(
                selectElem,
                ['change'],
                (evt) => {

                    removeElemClasses(selectElem, ['fpd-error']);

                }
            )

        }
        
        const inputElem = document.createElement('input');
        inputElem.className = 'fpd-quantity';
        inputElem.type = 'number';
        inputElem.min = 1;
        inputElem.step = 1;
        inputElem.value = rowData.quantity || 1;
        rowElem.append(inputElem);

        addEvents(
            inputElem,
            'change',
            (evt) => {

                if( inputElem.value < Number(inputElem.min) ) {
                    inputElem.value = Number(inputElem.min);
                }
                if(inputElem.inputElem == '') {
                    inputElem.value = 1;
                }

                this.#setTotalQuantity();
                
            }
        )

        const deleteElem = document.createElement('span');
        deleteElem.className = 'fpd-icon-close';
        rowElem.append(deleteElem);

        addEvents(
            deleteElem,
            'click',
            (evt) => {
                
                rowElem.remove();
                this.#setTotalQuantity();
                
            }
        )

        this.#setTotalQuantity();

    }

    #setTotalQuantity() {

		let totalQuantity = 0;
		this.listElem.querySelectorAll('.fpd-quantity').forEach((input) => {
			totalQuantity += parseInt(input.value);
		});
        

		this.fpdInstance.setOrderQuantity(parseInt(totalQuantity));

	}

    /**
	 * Gets the variation(s) from the UI.
	 *
	 * @method getOrderVariations
	 * @return {Array|Boolean} An array containing objects with variation and quantity properties. If a variation in the UI is not set, it will return false.
	 */
    getOrderVariations() {

        if(!this.listElem) return false;

        let variations = [];
		this.listElem.querySelectorAll('.fpd-row').forEach(row => {

			var variation = {};
            
			row.querySelectorAll('select').forEach(select => {
                
				if(isEmpty(select.value)) {

					variations = false;

                    addElemClasses(
                        select,
                        ['fpd-error']
                    )

				}

				variation[select.name] = select.value;

			});

			if(variations !== false) {

				variations.push({
                    variation: variation, 
                    quantity: parseInt(row.querySelector('.fpd-quantity').value) 
                });

			}
            else {
                Snackbar(this.fpdInstance.translator.getTranslation('misc', 'bulk_add_variations_term'))
            }


		});

		return variations;

    }

    /**
	 * Loads variation(s) in the UI.
	 *
	 * @method setup
	 * @param {Array} variations An array containing objects with variation and quantity properties.
	 */
    setup(data) {

        if(Array.isArray(data)) {

			this.listElem.innerHTML = '';
			data.forEach(rowData => {
                
                this.#createRow(rowData); 

			});

		}

		this.#setTotalQuantity();

    }

}
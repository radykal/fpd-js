import '../../../ui/view/modules/NamesNumbers.js';

import { 
    addEvents,
    addElemClasses,
    removeElemClasses
} from '../../../helpers/utils.js';
    
export default class NamesNumbersModule extends EventTarget {
        
    constructor(fpdInstance, wrapper) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        
        this.container = document.createElement("fpd-module-names-numbers");
        wrapper.append(this.container);

        this.listElem = this.container.querySelector('.fpd-list');

        addEvents(
            fpdInstance,
            'viewSelect',
            (evt) => {

                this.#updateList();

            }
        )

        addEvents(
            this.container.querySelector('.fpd-btn'),
            'click',
            (evt) => {

                const rowElem = this.#addRow();
			    this.#selectRow(rowElem);
                
			    fpdInstance.currentViewInstance.names_numbers = this.getViewNamesNumbers();

                if(fpdInstance.mainOptions.namesNumbersEntryPrice) {

                    fpdInstance.currentViewInstance.changePrice(
                        fpdInstance.mainOptions.namesNumbersEntryPrice, 
                        '+'
                    );
        
                }

            }
        )

    }

    #selectRow(rowElem) {

        rowElem.querySelector('input').focus();
        
        const numberCol = rowElem.querySelector('.fpd-number-col');
        if(numberCol) {
            this.#setPlaceholderText(
                numberCol.querySelector('input').value || numberCol.querySelector('input').placeholder
            );
        }

        const nameCol = rowElem.querySelector('.fpd-name-col');
        if(nameCol) {
            this.#setPlaceholderText(
                null,
                nameCol.querySelector('input').value || nameCol.querySelector('input').placeholder
            );
        }

    }

    #updateList() {

        this.listElem.innerHTML = '';

        const viewInst = this.fpdInstance.currentViewInstance;

        if(viewInst.fabricCanvas.textPlaceholder || viewInst.fabricCanvas.numberPlaceholder) {
                        
			if(viewInst.names_numbers && Array.isArray(viewInst.names_numbers)) {

                viewInst.names_numbers.forEach(nnData => {

                    this.#addRow(nnData.number, nnData.name, nnData.select);

                })

			}
			else {
				this.#addRow();
			}

            removeElemClasses(this.container, ['fpd-disabled'])

		}
        else {
            addElemClasses(this.container, ['fpd-disabled'])
        }

    }

    #addRow(number='', name='', selectVal) {

        const viewInst = this.fpdInstance.currentViewInstance;
        const fCanvas = viewInst.fabricCanvas;

        const rowElem = document.createElement('div');
        rowElem.className = 'fpd-row';

        const removeColumn = document.createElement('div');
        removeColumn.className = 'fpd-remove-col';

        const removeElem = document.createElement('span');
        removeElem.innerText = this.fpdInstance.translator.getTranslation('modules', 'names_numbers_remove', 'Remove');
        removeColumn.append(removeElem);

        addEvents(
            removeElem,
            'click',
            (evt) => {

                rowElem.remove();
                
                this.#selectRow(this.container.querySelector('.fpd-row:first-child'));

                this.fpdInstance.currentViewInstance.names_numbers = this.getViewNamesNumbers();
                
				if(this.fpdInstance.mainOptions.namesNumbersEntryPrice) {

                    this.fpdInstance.currentViewInstance.changePrice(
                        this.fpdInstance.mainOptions.namesNumbersEntryPrice, 
                        '-'
                    );
        
                }

            }
        )

        rowElem.append(removeColumn);

        if(fCanvas.numberPlaceholder)
            rowElem.append(this.#createNumberCol(number))

        if(fCanvas.textPlaceholder)
            rowElem.append(this.#createNameCol(name));

        if((this.fpdInstance.mainOptions.namesNumbersDropdown 
            && this.fpdInstance.mainOptions.namesNumbersDropdown.length > 0) 
            || selectVal
        ) {
            rowElem.append(this.#createDropdown(selectVal));
        }

        this.listElem.append(rowElem);
                
        return rowElem;

    }

    #createNumberCol(defaultValue='') {

        const viewInst = this.fpdInstance.currentViewInstance;
        const fCanvas = viewInst.fabricCanvas;

        const column = document.createElement('div');
        column.className = 'fpd-number-col fpd-input-col';

        const inputElem = document.createElement('input');
        inputElem.type = 'number';
        column.append(inputElem);
        
        if(Array.isArray(fCanvas.numberPlaceholder.numberPlaceholder)) {
            inputElem.setAttribute('min', Number(fCanvas.numberPlaceholder.numberPlaceholder[0]));
            inputElem.setAttribute('max', Number(fCanvas.numberPlaceholder.numberPlaceholder[1]));
        }

        inputElem.setAttribute('placeholder', fCanvas.numberPlaceholder.originParams.text);
        inputElem.value = defaultValue;

        addEvents(
            inputElem,
            ['mouseup', 'keyup'],
            (evt) => {
                
                //check if min/max limits are set and apply
                if(Array.isArray(fCanvas.numberPlaceholder.numberPlaceholder)) {

                    if( inputElem.value > Number(inputElem.max) ) {
                        inputElem.value = Number(inputElem.max);
                    }

                    if( inputElem.value < Number(inputElem.min) ) {
                        inputElem.value = Number(inputElem.min);
                    }

                }      

                inputElem.value = this.#setPlaceholderText(inputElem.value);
                this.fpdInstance.currentViewInstance.names_numbers = this.getViewNamesNumbers();                

            }
        )

        return column;
    }

    #createNameCol(defaultValue='') {

        const viewInst = this.fpdInstance.currentViewInstance;
        const fCanvas = viewInst.fabricCanvas;

        const column = document.createElement('div');
        column.className = 'fpd-name-col fpd-input-col';

        const inputElem = document.createElement('input');
        inputElem.type = 'text';
        column.append(inputElem);

        inputElem.setAttribute('placeholder', fCanvas.textPlaceholder.originParams.text);
        inputElem.value = defaultValue;

        addEvents(
            inputElem,
            ['mouseup', 'keyup'],
            (evt) => {

                inputElem.value = this.#setPlaceholderText(null, inputElem.value);
                this.fpdInstance.currentViewInstance.names_numbers = this.getViewNamesNumbers();
                

            }
        )

        return column;
    }

    #createDropdown(selectVal='') {

        const column = document.createElement('div');
        column.className = 'fpd-select-col fpd-input-col';

        const selectElem = document.createElement('select');
        column.append(selectElem);

        let selectValArr = [selectVal],
            dropdownProps = this.fpdInstance.mainOptions.namesNumbersDropdown.length > 0 ? this.fpdInstance.mainOptions.namesNumbersDropdown : selectValArr;

        dropdownProps.forEach(prop => {
            
            const optionElem = document.createElement('option');
            optionElem.value = prop;
            optionElem.selected = selectVal === prop;
            optionElem.innerText = prop;
            selectElem.append(optionElem);

        })

        addEvents(
            selectElem,
            'change',
            (evt) => {

                this.fpdInstance.currentViewInstance.names_numbers = this.getViewNamesNumbers();
                

            }
        )

        return column;
    }

    #setPlaceholderText(number=null, name=null) {

        const viewInst = this.fpdInstance.currentViewInstance;
        const fCanvas = viewInst.fabricCanvas;
        const fElem = typeof number == 'string' ? fCanvas.numberPlaceholder : fCanvas.textPlaceholder;
        let value = typeof number == 'string' ? number : name;

        const targetMaxLength = fElem.maxLength;

        if(targetMaxLength != 0 && value.length > targetMaxLength) {
            value = value.substr(0, targetMaxLength);
        }

        value = value.replace(FancyProductDesigner.forbiddenTextChars, '');
            
        //remove emojis
        if(this.fpdInstance.mainOptions.disableTextEmojis) {
            value = value.replace(FPDEmojisRegex, '');
            value = value.replace(String.fromCharCode(65039), ""); //fix: some emojis left a symbol with char code 65039
        }

        fCanvas.setElementOptions({text: value}, fElem);
        
        return value;

    }

    getViewNamesNumbers() {

		let nnArr = [];

		this.container.querySelectorAll('.fpd-list .fpd-row').forEach((row) => {

			let rowObj = {};

            const numberCol = row.querySelector('.fpd-number-col');
			if(numberCol) {
				rowObj.number = numberCol.querySelector('input').value;
			}

            const nameCol = row.querySelector('.fpd-name-col');
			if(nameCol) {
				rowObj.name = nameCol.querySelector('input').value;
			}

            const selectCol = row.querySelector('.fpd-select-col');
			if(selectCol) {
				rowObj.select = selectCol.querySelector('select').value;
			}

			nnArr.push(rowObj);

		});

		return nnArr;

	}

}

window.FPDNamesNumbersModule = NamesNumbersModule;
    
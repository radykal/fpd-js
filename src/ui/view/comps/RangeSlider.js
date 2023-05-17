
class FPD_RangeSlider extends HTMLElement {

    min = 0;
    max = 10;
    value = 0;
    step = 1;
    inputElem = null;
    
    constructor() {
        
        super();
    
    }
    
    connectedCallback() {

        this.inputElem = document.createElement('input');
        this.inputElem.type = 'range';
        this.inputElem.value = this.value;
        this.inputElem.min = this.min;
        this.inputElem.max = this.max;
        this.inputElem.step = this.step;

        this.append(this.inputElem);
        this.inputElem.addEventListener('input', this.#onInput.bind(this));
        
    }

    static get observedAttributes() {
        
        return ['value', 'step', 'min', 'max']
        
    }

    #onInput(evt) {
        
        this.inputElem.style.setProperty('--value', this.inputElem.value);
        this.inputElem.style.setProperty('--min', this.inputElem.min);
        this.inputElem.style.setProperty('--max', this.inputElem.max);

        if(this.onInput)
            this.onInput(evt);
        
    }

}

customElements.define( 'fpd-range-slider', FPD_RangeSlider );
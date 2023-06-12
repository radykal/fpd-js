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
        this.inputElem.value = this.getAttribute('value');
        this.inputElem.min = this.getAttribute('min');
        this.inputElem.max = this.getAttribute('max');
        this.inputElem.step = this.getAttribute('step');

        this.append(this.inputElem);
        this.inputElem.addEventListener('input', this.#onInput.bind(this));

        this.#update();
        
    }

    static get observedAttributes() {
        
        return ['value', 'step', 'min', 'max']
        
    }

    attributeChangedCallback(name, oldValue, newValue) {
        
        if(this.inputElem) {
            this.inputElem[name] = newValue; 
            this.#update();
        }    

    }

    #onInput(evt) {
        
        this.#update();

        if(this.onInput)
            this.onInput(evt);
                
        const event = new CustomEvent("onInput", { detail: Number(this.inputElem.value) });
        this.dispatchEvent(event);
        
    }

    #update() {

        this.inputElem.style.setProperty('--value', this.inputElem.value);
        this.inputElem.style.setProperty('--min', this.inputElem.min);
        this.inputElem.style.setProperty('--max', this.inputElem.max);

    }

}

customElements.define( 'fpd-range-slider', FPD_RangeSlider );
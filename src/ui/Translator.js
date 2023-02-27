export default class Translator extends EventTarget {
    
    langJSON = null;
    
    constructor() {
        
        super();
        
    }
    
    /**
     * Loads the languages JSON.
     *
     * @method loadLangJSON
     * @param {JSON|String} langJSON The language data. Can be URL string to the location of the JSON file or a JSON directly.
     * @param {Function} callback The function that will be invoked when the language data is set.
     */
    loadLangJSON(langJSON=null, callback=()=>{}) {
        
        //load language JSON
        if(langJSON !== false) {
        
            if(typeof langJSON === 'object') {
        
                this.langJSON = langJSON;
                callback.call(this);
        
            }
            else {
        
                fetch(langJSON)
                .then(response => response.json())
                .then(data => {
                    this.langJSON = data;
                    callback.call(this);
        
                })
                .catch((error) => {
        
                    //todo
                    //FPDUtil.showModal('Language JSON "'+instance.mainOptions.langJSON+'" could not be loaded or is not valid. Make sure you set the correct URL in the options and the JSON is valid!');
                    
                    callback.call(this);
                    
                });
        
            }
            
        }
        else {
            callback.call(this);
        }
        
    }
    
    /**
     * Translates a HTML element.
     *
     * @method translateElement
     * @param {HTMLElement} htmlElem The HTML element to be translated.
     */
    translateElement(htmlElem) {
    
        let label = '';
        if(this.langJSON) {
    
            let objString = '';
    
            if(htmlElem.getAttribute('placeholder')) {
                objString = htmlElem.getAttribute('placeholder');
            }
            else if(htmlElem.getAttribute('title')) {
                objString = htmlElem.getAttribute('title');
            }
            else if(htmlElem.dataset.title) {
                objString = htmlElem.dataset.title;
            }
            else {
                objString = htmlElem.innerText;
            }
    
            var keys = objString.split('.'),
                firstObject = this.langJSON[keys[0]];
    
            if(firstObject) { //check if object exists
    
                label = firstObject[keys[1]];
    
                if(label === undefined) { //if label does not exist in JSON, take default text
                    label = htmlElem.dataset.defaulttext;
                }
    
            }
            else {
                label = htmlElem.dataset.defaulttext;
            }
    
        }
        else {
            label = htmlElem.dataset.defaulttext;
        }
    
        if(htmlElem.getAttribute('placeholder')) {
            htmlElem.setAttribute('placeholder', label);
            htmlElem.innerText = '';
        }
        else if(htmlElem.getAttribute('title')) {
            htmlElem.setAttribute('title', label);
        }
        else if(htmlElem.dataset.title) {
            htmlElem.dataset.title = label;
        }
        else {
            htmlElem.innerText = label;
        }
    
        return label;
    
    };
    
    /**
     * Get the translation of a label.
     *
     * @method getTranslation
     * @param {String} section The section key you want - toolbar, actions, modules or misc.
     * @param {String} label The label key.
     */
    getTranslation(section, label, defaulText='') {
        
        if(this.langJSON) {
    
            section = this.langJSON[section];
    
            if(section) {
                return section[label] ? section[label] : defaulText;
            }
    
        }
    
        return defaulText;
    
    };
    
}
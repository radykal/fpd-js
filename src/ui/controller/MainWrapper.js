import '../view/MainWrapper.js';

export default class MainWrapper {
    

    constructor(fpdInstance) {
        
        this.container = document.createElement("fpd-main-wrapper");
        fpdInstance.container.append(this.container);
        
    }

}
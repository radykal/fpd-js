import MainbarView from '../view/MainWrapper.js';

export default class Mainbar {
    

    constructor(fpdInstance) {
        
        this.mainWrapperView = document.createElement("fpd-main-wrapper");
        fpdInstance.container.append(this.mainWrapperView);
        
    }

}
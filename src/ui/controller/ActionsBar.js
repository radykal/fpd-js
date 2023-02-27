import ActionsBar from '../view/ActionsBar.js';

export default class Mainbar {
    

    constructor(fpdInstance) {
        
        this.actionsBar = document.createElement("fpd-actions-bar");
        fpdInstance.container.append(this.actionsBar);
        
    }

}
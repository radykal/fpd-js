import ActionsBarView from '../view/ActionsBar.js';

export default class ActionsBar extends EventTarget {
    

    constructor(fpdInstance) {
        
        super();
        
        this.container = document.createElement("fpd-actions-bar");
        fpdInstance.container.append(this.container);
                
    }

}
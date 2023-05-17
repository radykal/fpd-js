import '../view/ViewsWrapper.js';

export default class ViewsWrapper extends EventTarget {
    
    constructor(fpdInstance) {
        
        super();
        
        this.container = document.createElement("fpd-views-wrapper");
        
        if(fpdInstance.container.classList.contains('fpd-views-outside') && !fpdInstance.mainOptions.modalMode) {
            fpdInstance.container.after(this.container);
        }
        else {
            fpdInstance.mainWrapper.container.append(this.container);
        }
          
    }

}
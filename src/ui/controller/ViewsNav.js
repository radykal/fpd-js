import '../../ui/view/ViewsNav.js';

import { 
    addEvents,
    toggleElemClasses
} from '../../helpers/utils';
import Snackbar from '../view/comps/Snackbar.js';

export default class ViewsNav extends EventTarget {
    
    constructor(fpdInstance) {
        
        super();
        
        this.container = document.createElement("fpd-views-nav");

        fpdInstance.mainWrapper.container.append(this.container);

        addEvents(
            fpdInstance,
            ['viewCreate', 'viewRemove'],
            (evt) => {

                this.container.querySelector('.fpd-total-views').innerText = fpdInstance.viewInstances.length;

            }
        )

        addEvents(
            fpdInstance,
            ['viewSelect'],
            (evt) => {

                toggleElemClasses(
                    this.container.querySelector('.fpd-view-locker'),
                    ['fpd-hidden'],
                    !fpdInstance.currentViewInstance.options.optionalView
                )

                this.container.querySelector('.fpd-current-view').innerText = fpdInstance.currentViewIndex + 1; 

                this.#toggleViewLock(fpdInstance.currentViewInstance);

            }
        )

        addEvents(
            this.container.querySelector('.fpd-view-prev'),
            'click',
            (evt) => {

                fpdInstance.selectView(fpdInstance.currentViewIndex - 1);

            } 
        )

        addEvents(
            this.container.querySelector('.fpd-view-next'),
            'click',
            (evt) => {

                fpdInstance.selectView(fpdInstance.currentViewIndex + 1);

            } 
        )

        addEvents(
            this.container.querySelector('.fpd-show-views-grid'),
            'click',
            (evt) => {

                fpdInstance.deselectElement();

                toggleElemClasses(
                    fpdInstance.viewsGrid.container,
                    ['fpd-show'],
                    true
                )

            } 
        )
        
        addEvents(
            this.container.querySelector('.fpd-view-locker'),
            'click',
            (evt) => {

                if(fpdInstance.currentViewInstance) {

                    fpdInstance.deselectElement();
                    fpdInstance.currentViewInstance.toggleLock(!fpdInstance.currentViewInstance.locked);  
                    this.#toggleViewLock(fpdInstance.currentViewInstance);  
                    
                    if(!fpdInstance.currentViewInstance.locked) {

                        Snackbar(
                            fpdInstance.translator.getTranslation(
                                'misc', 
                                'view_unlocked_info', 
                                'The view is unlocked'
                            )
                        );

                    }
                    

                }        

            } 
        )
        
    }

    #toggleViewLock(viewInstance) {

        const viewLocker = this.container.querySelector('.fpd-view-locker');

        toggleElemClasses(
            viewLocker.querySelector('.fpd-icon-locked'),
            ['fpd-hidden'],
            !viewInstance.locked
        )

        toggleElemClasses(
            viewLocker.querySelector('.fpd-icon-unlocked'),
            ['fpd-hidden'],
            viewInstance.locked
        )

    }

}
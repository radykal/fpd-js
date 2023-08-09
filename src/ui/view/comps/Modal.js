import { 
    addEvents, 
} from '../../../helpers/utils.js';

const Modal = (htmlContent='', fullscreen=false, type='', container=document.body) => {
    
    if(container === document.body) {
        container.classList.add('fpd-overflow-hidden');
    }
    
    if(type === 'prompt') {
        htmlContent = `
            <input type="text" placeholder="${htmlContent}" />
            <span class="fpd-btn"></span>
        `;
    }
    else if(type === 'confirm') {
        htmlContent = `
            <div class="fpd-confirm-msg">${htmlContent}</div>
            <span class="fpd-btn fpd-confirm"></span>
        `;
    }
    
    let html = `
        <div class="fpd-modal-inner fpd-shadow-3">
            <div class="fpd-modal-close">
                <span class="fpd-icon-close"></span>
            </div>
            <div class="fpd-modal-content">${htmlContent}</div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = `fpd-modal-internal fpd-modal-overlay fpd-container ${fullscreen ? 'fpd-fullscreen' : ''}`;
    modal.innerHTML = html;
    modal.dataset.type = type;
    
    container.append(modal);
    
    addEvents(
        modal.querySelector('.fpd-modal-close'),
        ['click'],
        (evt) => {
            container.classList.remove('fpd-overflow-hidden');
            modal.remove();
        }
    ) 
    
    return modal;   
}

export default Modal;

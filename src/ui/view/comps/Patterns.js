import { 
    addEvents
} from '../../../helpers/utils.js';

const Patterns = (props) => {
    
    const scrollArea = document.createElement('div');
    scrollArea.className = 'fpd-scroll-area';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'fpd-patterns-wrapper';
    scrollArea.append(wrapper);
    
    if(props.images && Array.isArray(props.images)) {
        
        props.images.forEach((img, index) => {
            
            const title = img.replace(/^.*[\\\/]/, '')
                                .replace(/\.[^/.]+$/, "")
                                .replace('_', ' ')
                                .toUpperCase();
            
            const item = document.createElement('span');
            item.className = 'fpd-item fpd-tooltip';
            item.style.backgroundImage = `url("${img}")`;
            item.setAttribute('aria-label', title);
            wrapper.append(item);
            
            addEvents(
                item,
                'click',
                (evt) => {
                    
                    if(props.onChange)
                        props.onChange(img);
                    
                }
            )
            
        });
           
    }
    
    return scrollArea;
    
}

export default Patterns;
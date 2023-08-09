import ColorPicker from './ColorPicker.js';
import { 
    addEvents,
    addElemClasses,
    removeElemClasses
} from '../../../helpers/utils.js';

const ColorPalette = (props) => {
    
    const scrollArea = document.createElement('div');
    scrollArea.className = 'fpd-scroll-area';
    
    if(props.enablePicker || props.subPalette)
        addElemClasses(scrollArea, ['fpd-has-subpanel']);
    
    const wrapper = document.createElement('div');
    wrapper.className = 'fpd-color-palette';
    scrollArea.append(wrapper);
    
    let currentSubPanel;    
    if(props.colors && Array.isArray(props.colors)) {
                
        props.colors.forEach((color, index) => {
            
            let tooltipTxt = color;
            
            //set color name
            if(props.colorNames) {
                
                const colorName = props.colorNames[color.replace('#', '').toLowerCase()];
                if(colorName)
                    tooltipTxt = colorName.toUpperCase();

            }
            
            const colorItem = document.createElement('span');
            colorItem.className = 'fpd-item';
            colorItem.style.backgroundColor = color;
            colorItem.setAttribute('aria-label', tooltipTxt);
            colorItem.dataset.hex = color;
            wrapper.append(colorItem);
            
            if(!props.enablePicker && !props.subPalette)
                addElemClasses(colorItem, ['fpd-tooltip']);
            
            addEvents(
                colorItem,
                'click',
                (evt) => {
                    
                    evt.stopPropagation();
                    
                    if(props.enablePicker || props.subPalette) {
                        
                        if(currentSubPanel) {
                            currentSubPanel.remove();
                            currentSubPanel = null;
                        }
                        
                        const activeClicked = colorItem.classList.contains('fpd-active');
                        
                        if(!activeClicked) {
                            
                            if(props.enablePicker) {
                                
                                currentSubPanel = ColorPicker({
                                    initialColor: color,
                                    colorNames: props.colorNames,
                                    palette: props.palette,
                                    onMove: (hexColor) => {
                                        
                                        if(props.onMove)
                                            props.onMove(hexColor, index);
                                        
                                    },
                                    onChange: (hexColor) => {
                                        
                                        colorItem.style.backgroundColor = hexColor;
                                        
                                        if(props.onChange)
                                            props.onChange(hexColor, index);
                                        
                                    }
                                });
                                
                            }
                            else {
                                
                                currentSubPanel = ColorPalette({
                                    colors: props.palette, 
                                    colorNames: props.colorNames,
                                    onChange: (hexColor) => {
                                        
                                        colorItem.style.backgroundColor = hexColor;
                                        
                                        if(props.onChange)
                                            props.onChange(hexColor, index);
                                        
                                    }
                                });
                                
                            }
                            
                            wrapper.append(currentSubPanel);
                            
                        }
                        
                        removeElemClasses(wrapper, ['fpd-sub-show']);
                        removeElemClasses(wrapper.querySelectorAll('.fpd-item'), ['fpd-active']);
                        
                        if(!activeClicked) {
                            
                            addElemClasses(wrapper, ['fpd-sub-show']);
                            addElemClasses(colorItem, ['fpd-active']);
                            
                        }
                        
                    }
                    else {
                        
                        if(props.onChange)
                            props.onChange(color);
                        
                    }
                    
                }
            )
            
        })
        
    }
    
    return scrollArea;
    
}

export default ColorPalette;
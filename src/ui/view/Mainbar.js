import MainBarHTML from '../html/mainbar.html';

class Mainbar extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        const templateElem = document.createElement("template");
        templateElem.innerHTML = MainBarHTML;
        
        this.append(templateElem.content.cloneNode(true));  
        
        
        
        // Add touch events for mobile devices
        // draggableDialog.addEventListener("touchstart", function(event) {
        //   // Save the initial touch position
        //   this.touchStartX = event.touches[0].clientX - this.offsetLeft;
        //   this.touchStartY = event.touches[0].clientY - this.offsetTop;
        // });
        // 
        // draggableDialog.addEventListener("touchmove", function(event) {
        //   // Calculate the new position based on the touch movement
        //   var newPosX = event.touches[0].clientX - this.touchStartX;
        //   var newPosY = event.touches[0].clientY - this.touchStartY;
        // 
        //   // Update the element's position
        //   this.style.left = newPosX + "px";
        //   this.style.top = newPosY + "px";
        // 
        //   // Prevent the default scrolling behavior
        //   event.preventDefault();
        // });

    }

}

customElements.define( 'fpd-main-bar', Mainbar );
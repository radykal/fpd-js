import { addEvents, fireEvent, removeElemClasses, toggleElemClasses } from "../../helpers/utils";
import Snackbar from "../view/comps/Snackbar";

export default class AdvancedImageEditor extends EventTarget {

    constructor(fpdInstance) {

        super();

        this.fpdInstance = fpdInstance;
        this.container = fpdInstance.mainWrapper.container.querySelector('.fpd-advanced-image-editor');
        this.currentElement = null;
        this.fImg = null;
        this.mask = null;
       
        this.fabricCanvas = new fabric.Canvas(this.container.querySelector('canvas'), {
            containerClass: 'fpd-aie-canvas',
            selection: false
        });

        this.fabricCanvas.setBackgroundColor('#fff', this.fabricCanvas.renderAll.bind(this.fabricCanvas));
        
        addEvents(
            this.container.querySelector('.fpd-close'),
            'click',
            () => {

                this.fabricCanvas.clear();
                this.toggle(false);

            }
        )

        addEvents(
            this.container.querySelector('.fpd-done'),
            'click',
            () => {
                
                this.mask.set('fill', 'transparent');
                this.fabricCanvas.clipPath = this.mask;

                let opts = {
                    format: 'png',
                    top: this.fImg.top,
                    left: this.fImg.left,
                    width: this.fImg.getScaledWidth(),
                    height: this.fImg.getScaledHeight(),
                    multiplier: this.fImg.width / this.fabricCanvas.width
                };
                                
                const dataURL = this.fabricCanvas.toDataURL(opts);

                fpdInstance._downloadRemoteImage(
                    dataURL,
                    'mask',
                    {},
                    (data) => {

                        if(data.url) {

                            this.currentElement.setSrc(data.url, () => {

                                this.currentElement.source = data.url;
                                this.currentElement.canvas.renderAll();
                                
                                fireEvent(fpdInstance, 'viewCanvasUpdate', {
                                    viewInstance: fpdInstance.currentViewInstance
                                })
                                
                            }, {crossOrigin: 'anonymous'})

                        }
                        else if(data.error) {
                            Snackbar(data.error);
                        }

                        removeElemClasses(
                            fpdInstance.viewsNav.container,
                            ['fpd-disabled']
                        );

                        fpdInstance.loadingCustomImage = false;
                        fpdInstance.toggleSpinner(false);        

                    }
                )

                this.toggle(false);
                
            }
        )

    }

    toggle(state=true) {

        this.fabricCanvas.clipPath = null;
        this.fabricCanvas.clear();

        toggleElemClasses(
            this.container,
            ['fpd-hidden'],
            !state
        )

        toggleElemClasses(
            this.fpdInstance.container,
            ['fpd-aie-visible'],
            state
        )

    }

    loadImage(targetElement, maskURL) {

        this.mask = null;
        this.currentElement = targetElement;
        this.toggle();

        //set canvas size to available space
        this.fabricCanvas.setDimensions({
            width: this.container.offsetWidth,
            height: this.container.offsetHeight
        })

        //load target image to canvas        
        fabric.Image.fromURL(targetElement.originParams.source, (fImg) => {

            this.fImg = fImg;
            fImg.evented = false;

            if(fImg.width > fImg.height) {
                fImg.scaleToWidth(this.fabricCanvas.width);
            }
            else {
                fImg.scaleToHeight(this.fabricCanvas.height);
            }
            
            this.fabricCanvas.add(fImg);
            fImg.center();

            //load mask object
            fabric.loadSVGFromURL(maskURL, (objects, options) => {            

                if(objects) {
    
                    this.mask = objects ? fabric.util.groupSVGElements(objects, options) : null;
    
                    this.mask.setOptions({
                        selectable: true,
                        evented: true,
                        resizable: true,
                        rotatable: true,
                        lockUniScaling: false,
                        lockRotation: false,
                        borderColor: 'transparent',
                        fill: 'rgba(184,233,134,0.4)',
                        centeredScaling: true,
                        transparentCorners: true,
                        absolutePositioned: false, 
                        cornerSize: 24,
                        objectCaching: false,
                    })
                    
                    if(this.fabricCanvas.width < this.fabricCanvas.height) {
                        
                        this.mask.scaleToWidth(this.fabricCanvas.width-100);
                    }
                    else {
                        this.mask.scaleToHeight(this.fabricCanvas.height-100);
                    }                    
                    
                    this.fabricCanvas.add(this.mask);
                    this.mask.center();
                    this.fabricCanvas.setActiveObject(this.mask);
    
                }
    
            });

        }, {crossOrigin: "anonymous"});

    }

}
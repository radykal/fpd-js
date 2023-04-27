import '/src/ui/view/modules/QRCode';
import { 
    addEvents 
} from '../../../helpers/utils';

export default class QRCodeModule extends EventTarget {

    constructor(fpdInstance, wrapper) {

        super();

        this.fpdInstance = fpdInstance;
        this.darkColor = '#000';
        this.lightColor = '#fff';

        this.container = document.createElement("fpd-module-qr-code");
        wrapper.append(this.container);

        const colorDarkElem = this.container.querySelector('.fpd-qr-code-color-dark');
        colorDarkElem.style.backgroundColor = '#000';
        new Picker({
            parent: colorDarkElem,
            popup: 'bottom',
            alpha: false,
            color: this.darkColor,
            onChange: (color) => {
                
                this.darkColor = tinycolor(color.rgbaString).toHexString();                
                colorDarkElem.style.backgroundColor = this.darkColor;
                
                
    
            }
        });

        const colorLightElem = this.container.querySelector('.fpd-qr-code-color-light');
        colorLightElem.style.backgroundColor = this.lightColor;
        new Picker({
            parent: colorLightElem,
            popup: 'bottom',
            alpha: false,
            color: this.lightColor,
            onChange: (color) => {
                
                this.lightColor = tinycolor(color.rgbaString).toHexString();
                colorLightElem.style.backgroundColor = this.lightColor;
                
                
    
            }
        });

        const qrCodeWrapper = this.container.querySelector('.fpd-qr-code-wrapper');
        addEvents(
            this.container.querySelector('.fpd-btn'),
            'click',
            (evt) => {

                qrCodeWrapper.innerHTML = '';

                const text = this.container.querySelector('input[type="text"]').value;
                if(text && text.length > 0) {

                    new QRCode(qrCodeWrapper, {
                        text: this.container.querySelector('input[type="text"]').value,
                        width: 256,
                        height: 256,
                        colorDark : this.darkColor,
                        colorLight : this.lightColor,
                        correctLevel : QRCode.CorrectLevel.H
                    });
                    
                    qrCodeWrapper.querySelector('img').onload = ((evt) => {

                        const options = {
                            _addToUZ: fpdInstance.currentViewInstance.currentUploadZone
                        };

                        fpdInstance._addCanvasImage(
                            evt.currentTarget.src,
                            'QR-Code: ' + text,
                            options
                        )

                        this.container.querySelector('input[type="text"]').value = '';
                        
                    })

                }
                
                

            }
        )

    }

}
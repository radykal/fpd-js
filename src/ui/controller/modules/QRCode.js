import '../../../ui/view/modules/QRCode.js';
import { 
    addEvents,
    deepMerge,
    fireEvent
} from '../../../helpers/utils.js';
import tinycolor from "tinycolor2";
import Picker from 'vanilla-picker/csp';
import QRious from 'qrious';

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

        addEvents(
            this.container.querySelector('.fpd-btn'),
            'click',
            (evt) => {

                fireEvent(this, 'qrCodeModuleBtnClick');                

                const text = this.container.querySelector('input[type="text"]').value;
                
                if(text && text.length > 0) {
                    
                    const qr = new QRious({
                        background: this.lightColor,
                        backgroundAlpha: 1,
                        foreground: this.darkColor,
                        foregroundAlpha: 1,
                        size: 500,
                        value: this.container.querySelector('input[type="text"]').value
                    });

                    const options = deepMerge(
                        fpdInstance.mainOptions.qrCodeProps,
                        {
                            _addToUZ: fpdInstance.currentViewInstance.currentUploadZone,
                            _isQrCode: true
                        }
                    );

                    fpdInstance._addCanvasImage(
                        qr.toDataURL(),
                        'QR-Code: ' + text,
                        options
                    )                        

                }

            }
        )

    }

}
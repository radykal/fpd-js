import {
    drawCirclePath
} from '../utils';

fabric.IText.prototype.initialize = (function(originalFn) {
    return function(...args) {
        originalFn.call(this, ...args);
        this._ITextInit();
        return this;
    };
})(fabric.IText.prototype.initialize);

fabric.IText.prototype._ITextInit = function() {
    
    this.on({
        'added': () => {

            this.setCurvedTextPath();

        },
        'editing:entered': () => {
        
            //prevent text editing in canvas, useful to make text editing only possible via external input
            if(!this.canvas.viewOptions.inCanvasTextEditing)
                this.exitEditing();

            if(this.curved)
                this.exitEditing();

        },
        'scaling': () => {

        },
        'changed': () => {
                             
            //max. lines
            if(this.maxLines != 0 && this.textLines.length > this.maxLines) {

                let textLines = this.textLines.slice(0, this.maxLines);
                this.set('text', textLines.join('\n'));
                this.exitEditing();
                               
            }

            //max. characters            
            if(this.maxLength != 0 && this.text.length > this.maxLength) {

                this.set('text', this.text.substr(0, this.maxLength));
                this.exitEditing();
                
            }

            //remove emojis            
            if(this.canvas.viewOptions.disableTextEmojis) {

                let text = this.text.replace(FPDEmojisRegex, '');                
                text = text.replace(String.fromCharCode(65039), ''); //fix: some emojis left a symbol with char code 65039
                this.set('text', text);

            }

        }
    });
    
}

fabric.IText.prototype.setCurvedTextPath = function() {

    if(this.curved) {

        const path = new fabric.Path(drawCirclePath(0, 0, this.curveRadius), {
            fill: 'transparent',
            strokeWidth: 2,
            stroke: 'rgba(0,0,0, 0.5)',
            visible: false,
        });

        this.set('path', path);
        this.setCurvedTextPosition();

    }

}

fabric.IText.prototype.setCurvedTextPosition = function() {

    if(this.curved && this.path) {

        this.pathSide = this.curveReverse ? 'left' : 'right';
        const offset = this.curveReverse ? (Math.PI * this.curveRadius * 2) * 0.25 : (Math.PI * this.curveRadius) / 2;
        this.pathStartOffset = offset - (this.calcTextWidth() / 2);
        this.pathAlign = 'center';

    }

}


// fabric.IText.prototype.setCurvedTextPathScale = function() {

//     if(this.curved && this.path) {
//         this.path.set({
//             scaleX: this.scaleX,
//             scaleY: this.scaleY
//         });
//         this.scaleX = 1;
//         this.scaleY = 1;

//         this.path.set(
//             'path', 
//             fabric.util.transformPath(this.path.path, this.path.calcTransformMatrix())
//         );

//         const dims = this.path._calcDimensions();        
//         this.path.set({
//             width: dims.width,
//             height: dims.height,
//             pathOffset: {
//                 x: dims.width / 2 + dims.left,
//                 y: dims.height / 2 + dims.top
//             },
//             dirty: true,
//             scaleX: 1,
//             scaleY: 1,
//             angle: 0
//         });
//         this.path.setCoords();
//         this.set('path', this.path);
        
//     }

// }
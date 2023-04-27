fabric.Text.prototype.initialize = (function(originalFn) {
    return function(...args) {
        originalFn.call(this, ...args);
        this._TextInit();
        return this;
    };
})(fabric.Text.prototype.initialize);


fabric.Text.prototype._TextInit = function() {

    const _updateFontSize = (elem) => {
        
        if(!elem.curved && !elem.uniScalingUnlockable) {
            
            let newFontSize = elem.fontSize * elem.scaleX;  
            newFontSize = parseFloat(Number(newFontSize).toFixed(0));

            elem.scaleX = 1;
            elem.scaleY = 1;
            elem._clearCache();
            elem.set('fontSize', newFontSize);
        
        }
    }

    this.on({
        'modified': (opts) => {
                        
            _updateFontSize(this);
            
        },
    })    

}
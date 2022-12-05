'use strict';


fabric.RemoveWhiteDP = fabric.Image.filters.RemoveWhiteDP =  fabric.util.createClass(fabric.Image.filters.BaseFilter,{
    type: 'RemoveWhiteDP',
    initialize: function(options) {
        if(options)delete options.type;
        this.options = fabric.util.defaults(options || {},{
                fromCorners : true,
                blurRadius: 2,
                colorThreshold: 32
            });
        this.pathfinder = new fabric.Pathfinder(this.options);
    },
    applyTo: function(canvasEl) {

        var pathfinder = this.pathfinder;

        pathfinder.colorThreshold = this.options.colorThreshold;
        pathfinder.setPicture(canvasEl);
        pathfinder.selectBackground(this.options.fromCorners);
        if(pathfinder.mask.count ) {
          pathfinder._fill([0, 0, 0, 0]);
          pathfinder.mask = fabric.MagicWand.invertMask(pathfinder.mask);
          //todo inverting mask

          if(pathfinder.mask.count){
            var _width = pathfinder.mask.bounds.maxX - pathfinder.mask.bounds.minX + 1;
            var _height = pathfinder.mask.bounds.maxY - pathfinder.mask.bounds.minY + 1;
            var ctx = canvasEl.getContext('2d');
            var imageData = pathfinder.editedImageCanvas.getContext('2d').getImageData(pathfinder.mask.bounds.minX, pathfinder.mask.bounds.minY, _width, _height);
            canvasEl.width  = _width;
            canvasEl.height = _height;
            ctx.putImageData(imageData, 0, 0);
            this.bounds = pathfinder.mask.bounds;
          }else{
            var ctx = canvasEl.getContext('2d');
            canvasEl.width  = 1;
            canvasEl.height = 1;
            ctx.clearRect(0,0,1,1);
            this.bounds = {
              maxX: 0,
              maxY: 0,
              minX: 0,
              minY: 0
            }
          }
        }



            //clip the image
        pathfinder.clearMemory();

    },
    toObject: function() {
        return Object.assign(this.callSuper('toObject'), this.options);
    }
});

fabric.Image.filters.RemoveWhiteDP.fromObject = function(object) {
    return new fabric.Image.filters.RemoveWhiteDP(object);
};

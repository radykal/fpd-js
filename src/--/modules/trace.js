import ImageTracer from "../../plugins/imagetracer.js";
import {tracePath, traceSvg} from "../../plugins/potrace.js";
import './../shapes/clipart.js'
console.log("trace imported")



export default {
	name: "trace",
	prototypes: {
		Object: {
			_getTraceCanvas(){
				let dims = this._getTransformedDimensions();
				let canvas = fabric.util.createCanvasElement({
					width: dims.x,
					height: dims.y,
				});
				let ctx = canvas.getContext('2d');
				ctx.translate(this.width / 2, this.height / 2)
				this.drawObject(ctx)
				return canvas;
			},
			potrace() {
				let canvas = this.getThumbnail({scale: 5});
				// let canvas = this._getTraceCanvas();

				let path = tracePath(canvas , {
					// turnpolicy: "white",
					// turnpolicy: "white",
					// turdsize: 1,
					// alphamax: 1,
					// opttolerance: 0.001
				})

				let clipart = new fabric.Path({
					path: path,
					left: this.left,
					top: this.top,
					width: this.width,
					height: this.height
				})
				this.canvas.add(clipart)
				return clipart;
			},
			trace() {
				let canvas = this._getTraceCanvas();

				let ctx = canvas.getContext('2d');

				let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
				let svg = ImageTracer.imagedataToSVG(imageData, 'posterized2')

				// ImageTracer.imageToSVG(
				// 	'panda.png',
				// 	function(svgstr){ ImageTracer.appendSVGString( svgstr, 'svgcontainer' ); },
				// 	'posterized2'
				// );





				let clipart = new fabric.Clipart({
					svg: svg,
					left: this.left,
					top: this.top,
					width: this.width,
					height: this.height
				})
				this.canvas.add(clipart)
			}
		}
	}
}


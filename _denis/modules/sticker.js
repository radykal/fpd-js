// import './../fabric/filters/2d_backend.class.js'
// import './../fabric/filters/base_filter.class.js'
// import './../fabric/filters/blur_filter.class.js'
import {traceContour} from '../../plugins/potrace.js'

// SVG PATH OUTLINE
//https://www.npmjs.com/package/svg-path-outline

//smoothing algorithm
//https://css-tricks.com/	shape-blobbing-css/

/**
 *
 * @param  {fabric.Object} target
 * @param scale
 * @returns {CanvasElement}
 * @private
 */
function _getObjectImageForSticker(target,scale = 1){

	let dims = target._getTransformedDimensions()

	let _sticker = target.sticker;
	//render object without sticker
	target.sticker = false
	let canvas = fabric.util.createCanvasElement( dims.x * scale + target.padding* 2,  dims.y * scale + target.padding* 2)
	let ctx = canvas.getContext('2d')
	if(target.shadow){
		target._setShadow(ctx, target)
	}
	ctx.translate( target.padding, target.padding)
	ctx.scale( scale, scale)
	ctx.translate( dims.x/2, dims.y/2 )
	ctx.scale( target.scaleX, target.scaleY )
	target.drawObject(ctx)
	target.sticker = _sticker
	return canvas
}

/**
 *
 * @param {HTMLImageElement | HTMLCanvasElement} image
 * @param options
 * @param scale
 */
export function getStickerPath(image, options = fabric.Object.prototype ,scale = 1 )  {

	//almost completely smooth to avoid sharp corner artifacts. exception: rectangle shapes
	let alphamax = 1.3;
	//accept colors ad shodow parts using alpha channel
	let colorMatch = [ 0, 0, 0, options.stickerAlpha];
	// remove paths less then 10 px,
	let turdsize = 10;

	//get image contour path ,completely smooth
	let originalObjectContourPath = traceContour(image,{turdsize, colorMatch, alphamax })


	//when svg path is ready. creating a fabric. Path object with strokeWidth for padding and shadow for blurring
	let stickerShape = new fabric.Path({
		cropPath: false,
		path: originalObjectContourPath,
		width: image.width,
		height: image.height,
		strokeWidth: options.stickerPadding * scale,
		stroke: "white",
		strokeLineCap: 'round',
		strokeLineJoin: 'miter',
		fill: "white",
		scaleX: 1 / scale,
		scaleY: 1 / scale,
		padding: options.stickerPadding,
		shadow: options.stickerRenderMode === "shadow" && {
			affectStroke: true,
			color: 'white',
			blur: options.stickerBlur * scale
		}
	})

	//then make a raster image of new shape
	let stickerShapeImage = _getObjectImageForSticker( stickerShape)

	//todo do not working correctly. blurring works weird
	if(options.stickerRenderMode === "blur"){
		//use shadow
		let filters = [new fabric.Image.filters.Blur({blur: 0.2})]
		let blurredStickerShapeImage = fabric.util.createCanvasElement({width: stickerShapeImage.width , height: stickerShapeImage.height})
		let filterBackend = new fabric.Canvas2dFilterBackend()
		filterBackend.applyFilters(filters, stickerShapeImage, blurredStickerShapeImage.width, blurredStickerShapeImage.height, blurredStickerShapeImage)
		stickerShapeImage = blurredStickerShapeImage;
	}

	// getextended image contour path almost completely smooth to avoid sharp corner artifacts. exception: rectangle shapes
	let stickerPath = traceContour(stickerShapeImage,{colorMatch, alphamax})

	return new fabric.Path(Object.assign({
		cropPath: false,
		width: stickerShapeImage.width,//+ this.stickerPadding * 2,
		height: stickerShapeImage.height,// + this.stickerPadding * 2,
		strokeLineCap: 'round',
		strokeLineJoin: 'miter',
		path: stickerPath,
		originX: 'center',
		originY: 'center',
		left: 0,
		top: 0
	},options.stickerOptions))

}

export default {
	name: "sticker",
	prototypes: {
		Object: {
			sticker: false,
			stickerTracingScale: 4,
			stickerPadding: 25,
			stickerBlur: 20,
			stickerAlpha: 0.8,
			stickerRenderMode: "shadow",
			stickerOptions: {
				fill: "white",
				strokeWidth: 0,
				shadow: {
					offsetX: 0.5,
					offsetY: 0.5,
					blur: 3,
					color: "#00000077"
				}
			},
			"+beforeRender": ["renderSticker"],
			renderSticker(ctx,forClipping) {
				if(this.loaded && this.sticker) {
					if(!this._stickerEl){
						this.updateSticker()
					}
					this._stickerEl.render(ctx,forClipping)
				}
			},
			updateSticker(){

				//render object without sticker, scale original image for better tracing
				let originalObjectImage = _getObjectImageForSticker(this, this.stickerTracingScale)

				this._stickerEl = getStickerPath(originalObjectImage,this, this.stickerTracingScale);

				//todo padding property doesnt work with Controls module
				// this.padding = this.stickerPadding
			},
			setSticker(value) {
				delete this._stickerEl
				this.sticker = value

				if(this.sticker){
					this.on({"resized modified": "updateSticker"})
				}else{
					this.off({"resized modified": "updateSticker"})
				}
			}
		}
	}
}

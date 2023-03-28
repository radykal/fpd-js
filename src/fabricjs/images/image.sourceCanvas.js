
export const SourceCanvas = {
	name: "source-canvas",
	prototypes: {
		Image: {
			sourceCanvasZoom: 1,
			updateElementFromSourceCanvas() {
				let w = this.width * fabric.util.qrDecompose(this.calcTransformMatrix()).scaleX * this.canvas.getZoom()
				let h = this.height * fabric.util.qrDecompose(this.calcTransformMatrix()).scaleY * this.canvas.getZoom()
				let zoom = Math.max(w / this.sourceCanvas.originalWidth, h / this.sourceCanvas.originalHeight);
				let element = this.sourceCanvas.getThumbnail({zoom: zoom * this.sourceCanvasZoom});
				this._originalElement = element;
				this.dirty = true;
				//todo for Warp object
				if (this.webgl) {
					let gl = this.webgl.context
					fabric.util.gl.setTextureImage(gl, this.webgl.texture, element)
				}
			},
			setSourceCanvas(canvas) {

				this.setState("sourceCanvas", canvas)
				this.updateElementFromSourceCanvas()

				// elementCanvas.modified
				this.on({
					"canvas.export:viewport:scaled canvas.viewport:scaled modified": "updateElementFromSourceCanvas"
				})
				this.updateState()
			}
		}
	}
}

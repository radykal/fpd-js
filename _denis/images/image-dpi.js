import {Relative} from "../modules/relative.js";


export default {
	name: "image-dpi",
	deps: [Relative],
	prototypes: {
		Object: {
			setMinDpi(value){
				this.minDpi = value

				if(value){
					this.on({
						"removed group:removed": "removeDpiWarningSign",
						"scaling moving modified loaded added crop:modified" : "checkDpi"
					})
				}else{
					this.off({
						"removed group:removed": "removeDpiWarningSign",
						"scaling moving modified loaded added crop:modified" : "checkDpi"
					})
				}
			},
			minDpi: 0,
			warningSign: {
				type: "group",
				snappable: false,
				objects: [
					{
						type: "text",
						text: "",
						originX: "center",
						fill: "#EBBF57",
						height: 20,
						fontSize: 24,
						left: 0,
						shadow: {
							color: "#fff",
							blur: 1
						},
						fontFamily: "Font Awesome 5 Pro",
						textAlign: "center"
					},
					{
						type: "text",
						id:"image-dpi-text",
						originX: "center",
						text: "",
						fontFamily: "Roboto",
						fill: "#EBBF57",
						fontSize: 16,
						fontWeight: "bold",
						shadow: {
							color: "#fff",
							blur: 1
						},
						strokeWidth: 0.8,
						height: 5,
						top: 30,
						left: 0,
						textAlign: "center"
					}
				]
			},
			removeDpiWarningSign () {

				if(this._warningSign){
					this._warningSign.removeFromCanvas()
					delete this._warningSign
				}
			},
			createDpiWarningSign () {

				this._warningSign = this.canvas.createObject(Object.assign({}, this.warningSign,{
					statefullCache: true,
					originX: "center",
					originY: "center",
					stored: false,
					selectable: false,
					layer: "interface",
					evented: false,
					hasControls: false
				}))

				this._warningSign.set({
					relative: this,
					relativeCoordinates: {
						left: 15,
						top: 30
					}
				});
			},
			checkDpi () {
				if (!this.minDpi || !this.canvas || this.group)return;
				let effectiveDpi = this.editor.dpi * this.getDPI();
				if (effectiveDpi && effectiveDpi < this.minDpi) {

					if(!this._warningSign){
						this.createDpiWarningSign()
					}

					for (let o of this._warningSign._objects) {
						if (o.id === "image-dpi-text") {
							o.setText(Math.floor(effectiveDpi).toString() + " DPI")
						}
					}
					let zoom = this.canvas.getZoom();

					this._warningSign.set({
						scaleY: 1  / zoom,
						scaleX: 1  / zoom
					})

					// this._warningSign.dirty = true;
				} else {
					this.removeDpiWarningSign()
				}
			},
			getDPI () {
				return 0;
			}
		},
		Group: {
			getDPI () {
				let minDpi = Infinity;
				for(let i in this._objects){
					let dpi = this._objects[i].getDPI();
					if(dpi && dpi < minDpi){
						minDpi = dpi;
					}
				}
				return  minDpi;
			}
		},
		Image: {
			// "+afterRender": ["renderDpiWarning"],
			minDpi: 0,
			//size of original high resolution image on the server
			originalSize: {
				width: 0,
				height: 0,
			},
			getDPI () {
				let imageWidth = this.originalSize && this.originalSize.width || this._originalElement && this._originalElement.width || 0;
				let imageHeight = this.originalSize && this.originalSize.height || this._originalElement && this._originalElement.height || 0;
				if(!imageWidth || !imageHeight)return 0;
				let matrix = this.crop ? this.cropEl.calcTransformMatrix() : this.calcTransformMatrix();
				let options = fabric.util.qrDecompose(matrix);

				//todo this._getParentScaleX() should be removeed everywhere?
				let pixelsPerDotX = imageWidth / Math.abs(this.width * options.scaleX)
				let pixelsPerDotY = imageHeight / Math.abs(this.height * options.scaleY)
				return  Math.min(pixelsPerDotX,pixelsPerDotY);
			}
		}
	}
}

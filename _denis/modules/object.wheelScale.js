
export default {
	name: "object-wheel-scale",
	prototypes: {
		Object: {
			"+actions": {

				scale: {
					className: "fi fi-resize",
					title: "scale",
					subMenuClassName: "fiera-scale-menu",
					menu: ["scaleOut","scaleRange","scaleIn"]
				},
				scaleOut: {
					itemClassName: "fiera-tool-range-minus",
					className: "fa fa-minus",
					title: "zoom out"
				},
				scaleRange: {
					itemClassName: "fiera-tool-range",
					showButton: false,
					type: "range",
					variable: "scale",
					observe: "modified",
					title: "scale",
					//todo bug. should use values from Object.prototype
					min: 0.1,
					max: 10,
					fixed: 2
				},
				scaleIn: {
					itemClassName: "fiera-tool-range-plus",
					title: "zoom in",
					className: "fa fa-plus"
				}
			},
			maxScale: 10,
			minScale: 0.5,
			getScale() {
				return Math.max(this.scaleX, this.scaleY)
			},
			_scale(value) {

				let shouldCenterOrigin = (this.originX !== 'center' || this.originY !== 'center') && this.centeredRotation;
				if (shouldCenterOrigin) {
					this._setOriginToCenter();
				}
				this.set({
					scaleX: Math.min(this.maxScale, Math.max(this.scaleX * value, this.minScale)),
					scaleY: Math.min(this.maxScale, Math.max(this.scaleY * value, this.minScale))
				});
				if (shouldCenterOrigin) {
					this._resetOrigin();
				}
				//todo should be changed
				this.fire('modified');
			},
			setScale(value) {
				let old = this.getScale();
				let diff = value / old;
				this._scale(diff)
			},
			wheelScale(e){
				if (e.e.deltaY < 0) {
					this.scaleIn();
				} else {
					this.scaleOut();
				}
				e.e.stopPropagation();
				e.e.preventDefault();
			},
			setMouseWheelScale(value) {
				if(!this.mouseWheelScale && value){
					this.on("mousewheel", "wheelScale")
				}
				if(this.mouseWheelScale && !value){
					this.off("mousewheel", "wheelScale")
				}
				this.mouseWheelScale = value;
			},
			scaleOut() {
				this._scale(0.9)
			},
			scaleIn() {
				this._scale(1.11)
			}
		}
	}
}

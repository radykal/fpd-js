export default {
	name: "deco",
	prototypes: {
		Object: {
			"+beforeRender": ["renderDecoBackground"],
			"+afterRender": ["renderDecoOverlay"],
			renderDecoBackground(ctx, forClipping) {
				if (this.deco && this.deco.bottom) {
					this._decoEl.render(ctx, forClipping);
				}
			},
			renderDecoOverlay(ctx, forClipping) {
				if (this.deco && !this.deco.bottom) {
					this._decoEl.render(ctx, forClipping);
				}
			},
			setDeco(options, callback) {
				if (!options) {
					options = false;
				} else if (options.constructor === Object) {
				} else if (options.constructor === String) {
					options = {src: options};
				} else {
					options = {element: options};
				}
				if (!options) {
					delete this.deco;
					delete this._decoEl;
					return;
				}
				this.deco = options;
				this._decoEl = fabric.util.createObject(fabric.util.object.extend({
					editor: this.editor,
					type: "image-border",
					width: this.width,
					height: this.height,
					left: -this.width / 2,
					top: -this.height / 2
				}, options), () => {
					this.updateDeco();
					this.canvas && this.canvas.renderAll();
					callback && callback();
				});

				this.on({"resized scaling": "updateDeco"})
			},
			updateDeco() {
				if (this._decoEl) {
					this._decoEl.set({
						width: this.width,
						height: this.height,
						left: -this.width / 2,
						top: -this.height / 2
					});
					this.dirty = true;
				}
			},
			store_deco() {
				if (this.frame || !this._decoEl) return;
				let image = this._decoEl.storeObject();
				delete image.type;
				delete image.left;
				delete image.top;
				delete image.width;
				delete image.height;
				if (Object.keys(image).length === 1) return image.src;
				return image;
			}
		}
	}
}

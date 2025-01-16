import { fabric } from "fabric";
fabric.Textbox.prototype.initialize = (function (originalFn) {
	return function (...args) {
		originalFn.call(this, ...args);
		this._TextboxInit();
		return this;
	};
})(fabric.Textbox.prototype.initialize);

fabric.Textbox.prototype._TextboxInit = function () {
	this.on({
		added: () => {
			//calc the longest line width
			if (this._calcWidth) {
				//set temp width in order to calc the longest line width
				this.set("width", 1000);

				const longestLineWidth = this.calcTextWidth();
				this.set("width", longestLineWidth);

				delete this._calcWidth;
			}
		},
	});
};

import { fabric } from "fabric";

fabric.IText.prototype.initialize = (function (originalFn) {
	return function (...args) {
		originalFn.call(this, ...args);
		this._ITextInit();
		return this;
	};
})(fabric.IText.prototype.initialize);

fabric.IText.prototype._ITextInit = function () {
	this.on({
		added: () => {
			if (this.setTextPath) this.setTextPath();
		},
		"editing:entered": () => {
			//prevent text editing in canvas, useful to make text editing only possible via external input
			if (!this.canvas.viewOptions.inCanvasTextEditing) this.exitEditing();

			if (this.curved) this.exitEditing();
		},
		changed: () => {
			//max. lines
			if (this.maxLines != 0 && this.textLines.length > this.maxLines) {
				let textLines = this.textLines.slice(0, this.maxLines);
				this.set("text", textLines.join("\n"));
				this.exitEditing();
			}

			//max. characters
			if (this.maxLength != 0 && this.text.length > this.maxLength) {
				this.set("text", this.text.substr(0, this.maxLength));
				this.exitEditing();
			}

			//remove emojis
			if (this.canvas.viewOptions.disableTextEmojis) {
				let text = this.text.replace(FPDEmojisRegex, "");
				text = text.replace(String.fromCharCode(65039), ""); //fix: some emojis left a symbol with char code 65039
				this.set("text", text);
			}

			if (this.widthFontSize) {
				let resizedFontSize;
				if (this.width > this.widthFontSize) {
					resizedFontSize = this.fontSize * (this.widthFontSize / (this.width + 1)); //decrease font size
				} else {
					resizedFontSize = this.fontSize * (this.widthFontSize / (this.width - 1)); //increase font size
				}

				if (resizedFontSize < this.minFontSize) {
					resizedFontSize = this.minFontSize;
				} else if (resizedFontSize > this.maxFontSize) {
					resizedFontSize = this.maxFontSize;
				}

				resizedFontSize = parseInt(resizedFontSize);
				this.set("fontSize", resizedFontSize);
			}
		},
	});
};

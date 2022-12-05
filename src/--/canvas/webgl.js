let a = {
	_initContextContainer: function () {
		let gl = this.contextContainer = this.lowerCanvasEl.getContext('webgl');

		this.webgl = {
			shaderProgram : fabric.util.gl.standartShaderProgram(gl)
		}
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		gl.useProgram(this.webgl.shaderProgram);
	},
	renderCanvasLayers (gl) {
		let resolutionUniformLocation = gl.getUniformLocation(this.webgl.shaderProgram, "uResolution");
		gl.uniform2f(resolutionUniformLocation, this.width, this.height);

	}
}

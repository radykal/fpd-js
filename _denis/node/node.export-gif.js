
fabric.response.gif = function sendAsGIF(response,editor) {
		let canvas = editor.slides[0];//todo
		let GIFEncoder = require('gifencoder');
		let encoder = new GIFEncoder(canvas.width * 32, canvas.height * 32);
		let stream = encoder.createReadStream();
		response.type("gif");
		stream.pipe(response);
		encoder.start();
		encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
		encoder.setDelay(150);  // frame delay in ms
		encoder.setQuality(15); // image quality. 10 is default.

		let context = canvas.getContext("2d");
		// Add 3 frames
		encoder.addFrame(context);
		encoder.addFrame(context);
		encoder.addFrame(context);
		encoder.finish();
	}

fabric.response.webp = function sendAsWEBP(response, editor) {
	let Whammy = require('whammy');
	let encoder = new Whammy.Video(7);
	let currentId = 0,
		time = 0,
		timeout = 20000,
		delay = 20,
		addedFrame = -1,
		totalFrames = 3,
		tmpFrames = Array.apply(null, Array(totalFrames));

	let addFrame = function addFrame(context) {
		let id = currentId++;
		canvasToWebp(context.canvas, function(webmData) {
			tmpFrames[id] = webmData;
			for(let i = addedFrame + 1; i < totalFrames; ++i) {
				if(tmpFrames[i] !== undefined) {
					encoder.add(tmpFrames[i]);
					addedFrame = i;
				}
				else {
					break;
				}
			}
		});
	};

	let checkReady = function checkReady() {
		if(totalFrames <= addedFrame + 1) {
			try {
				let output = encoder.compile(true);
				response.type('webm');
				response.send(new Buffer(output));
				console.log('Webm compilation: ' + time + 'ms');
			}
			catch(err) {
				response.send(err.toString());
			}
		}
		else if((time += delay) < timeout) {
			setTimeout(checkReady, delay);
		}
		else {
			response.send('Timeout of ' + timeout + 'ms exceed');
		}
	};


	let canvas = editor.slides[0];//todo
	let context = canvas.getContext("2d");

	// Add 3 frames
	addFrame(context);
	addFrame(context);
	addFrame(context);

	setTimeout(checkReady, delay);

}

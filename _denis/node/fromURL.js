
import canvas from 'canvas'
import request from 'request'
import fs from 'fs'

fabric.util.loadImagePromise = function(url,crossOrigin){
	return new Promise((resolve, reject) => {
		let img = new canvas.Image();

		function onLoadCallback(data) {
			if (data) {
				fabric.util.fImageRegistry[url] = data;
				img.src = data;
				resolve(img)
			} else {
				img.src = fabric.media.error;
				reject();
			}
		}
		//loading from dataURL
		if (url.startsWith('data:')) {
			onLoadCallback(url);
		}
		//loading from remote
		else if (!url.startsWith('http')) {
			fs.readFile(url, function (err, buffer) {
				if (err) {
					console.error(err);
					onLoadCallback(null);
				}else{
					onLoadCallback(buffer);
				}
			});
		}
		//loading from remote
		else {
			request.get({url: url, encoding: null}, (err, res, buffer) => {
				if (err) {
					console.error(err);
					onLoadCallback(null);
				}else{
					onLoadCallback(buffer);
				}
			});
		}

	}).catch(e => {
		console.error(e);
	})
}

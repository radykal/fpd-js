
export function readFile(file,method){
	return new Promise((resolve,reject)=> {
		let reader = new FileReader();
		reader.addEventListener("load", async () => {
			resolve(reader.result);
		})
		reader.readAsArrayBuffer(file);
	})
}

export function blobToArrayBuffer(blob){
	if(Blob.prototype.arrayBuffer){
		return blob.arrayBuffer()
	}
	return new Promise((resolve,reject) => {
		// Blob -> ArrayBuffer
		var fileReader = new FileReader();
		fileReader.onload = function (event) {
			var arrayBuffer = event.target.result;
			resolve(arrayBuffer);

			// warn if read values are not the same as the original values
			// arrayEqual from: http://stackoverflow.com/questions/3115982/how-to-check-javascript-array-equals
			// function arrayEqual(a, b) {
			//   return !(a < b || b < a);
			// }
			// if (arrayBufferNew.byteLength !== arrayBuffer.byteLength) // should be 3
			//   reject("ArrayBuffer byteLength does not match");
			// if (arrayEqual(uint8ArrayNew, uint8Array) !== true) // should be [1,2,3]
			//   reject("Uint8Array does not match");
		};
		fileReader.readAsArrayBuffer(blob);
		fileReader.result; // also accessible this way once the blob has been read
	})
}
export function readAsBlob(url){
	return new Promise((resolve, reject) => {

		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'blob';
		xhr.onload = function(e) {
			if (this.status === 200) {
				resolve(this.response);
				// myBlob is now the blob that the object URL pointed to.
			}else{
				reject(this.response);
			}
		};
		xhr.send();
	})
};


export function readFileAsDataURL(file){
	return new Promise((resolve, reject) => {
		let fr = new FileReader();
		fr.onload = function () {
			resolve(fr.result)
		}
		fr.readAsDataURL(file);
	})
}


export function readFileAsText(file){
	return new Promise((resolve, reject) => {
		let fr = new FileReader();
		fr.onload = function () {
			resolve(fr.result)
		}
		fr.readAsText(file);
	})
}


export function bufferToArrayBuffer (buffer){
	// const isArrayBufferSupported = (new Buffer(0)).buffer instanceof ArrayBuffer;
	// if(isArrayBufferSupported) {
	return bufferToArrayBufferSlice (buffer)
	// }
	// else{
	// 	return bufferToArrayBufferCycle(buffer)
	// }
}

export function bufferToArrayBufferSlice(buffer) {
	return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

export function bufferToArrayBufferCycle(buffer) {
	var ab = new ArrayBuffer(buffer.length);
	var view = new Uint8Array(ab);
	for (var i = 0; i < buffer.length; ++i) {
		view[i] = buffer[i];
	}
	return ab;
}

export const btoa = (typeof window !== "undefined" && typeof window.btoa === "function") ? window.btoa : function (input) {
	var output = "";
	var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	var i = 0;
	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	while (i < input.length) {

		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}

		output = output +
			keyStr.charAt(enc1) + keyStr.charAt(enc2) +
			keyStr.charAt(enc3) + keyStr.charAt(enc4);

	}

	return output;
}

export const atob = (typeof window !== "undefined" && typeof window.atob === "function") ? window.atob : function (input) {
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;
	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	while (i < input.length) {

		enc1 = keyStr.indexOf(input.charAt(i++));
		enc2 = keyStr.indexOf(input.charAt(i++));
		enc3 = keyStr.indexOf(input.charAt(i++));
		enc4 = keyStr.indexOf(input.charAt(i++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		output = output + String.fromCharCode(chr1);

		if (enc3 != 64) {
			output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
			output = output + String.fromCharCode(chr3);
		}

	}
	return output;
}

export function base64toDataArray(base64) {
	var binaryString =  window.atob(base64);
	// var len = binaryString.length;
	// var bytes = new Uint8Array( len );
	// for (var i = 0; i < len; i++)        {
	//   bytes[i] = binary_string.charCodeAt(i);
	// }
	// return bytes;
	return Uint8Array.from(binaryString, c => c.charCodeAt(0))
}

export function dataURItoBlob (dataURI) {
	var matches = dataURI.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
	return new Blob([base64toDataArray(matches[2])], {type: matches[1]});
}

export function bufferToBase64( buffer ) {
	var binary = '';
	var bytes = new Uint8Array( buffer );
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode( bytes[ i ] );
	}
	return btoa( binary );
}

export function dataArrayToString (array) {
	let out, i, len, c;
	let char2, char3;

	out = "";
	len = array.length;
	i = 0;
	while(i < len) {
		c = array[i++];
		switch(c >> 4)
		{
			case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
			// 0xxxxxxx
			out += String.fromCharCode(c);
			break;
			case 12: case 13:
			// 110x xxxx   10xx xxxx
			char2 = array[i++];
			out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
			break;
			case 14:
				// 1110 xxxx  10xx xxxx  10xx xxxx
				char2 = array[i++];
				char3 = array[i++];
				out += String.fromCharCode(((c & 0x0F) << 12) |
					((char2 & 0x3F) << 6) |
					((char3 & 0x3F) << 0));
				break;
		}
	}
	return out;
}

export function blobToBuffer(blob, cb) {
	return new Promise(function (resolve, fail) {
		if (typeof Blob === 'undefined' || !(blob instanceof Blob)) {
			throw new Error('first argument must be a Blob')
		}
		const reader = new FileReader()
		reader.onload = function (e) {
			if (e.error) {
				cb(e.error)
				reject(e.error)
			}
			else {
				let buffer = Buffer.from(reader.result);
				cb(null, buffer)
				resolve(buffer)
			}
		}

		reader.addEventListener('loadend', onLoadEnd, false)
		reader.readAsArrayBuffer(blob)
	})
}

export function blobToDataURL(blob, callback) {
	return new Promise(function (resolve, fail) {
		if (typeof Blob === 'undefined' || !(blob instanceof Blob)) {
			throw new Error('first argument must be a Blob')
		}
		const reader = new FileReader()
		reader.onload = function (e) {
			callback && callback();
			resolve(e.target.result);
		};
		reader.readAsDataURL(blob);
	})
}
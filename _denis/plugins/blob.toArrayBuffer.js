if(!Blob.prototype.arrayBuffer){
	Blob.prototype.arrayBuffer = function(){
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
			fileReader.readAsArrayBuffer(this);
			fileReader.result; // also accessible this way once the blob has been read
		})
	}
}


if(typeof document !== "undefined"){


    if(document.fonts.check(`50px '$$Not Existed Font$$'`)){

        let testString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
        let _etalonMeasurements;
        {
            let _testEl = fabric.document.createElement("canvas")
            let ctx = _testEl.getContext("2d")
            ctx.font = "50px serif"
            let size = ctx.measureText(testString)
            ctx.fillStyle = "black"
            _testEl.width = size.width
            _testEl.height = 50
            ctx.font = "50px serif"
            ctx.fillText(testString, 0, 50)
            _etalonMeasurements = {
                width: size.width,
                url: _testEl.toDataURL()
            }
        }


        document.fonts.check = function(font){

            let parsed = /(\d+)px (.*)/.exec(font)

            let fontSize = 50
            let fontFamily = parsed[2]

            //Times New Roman is standart serif font
            if (fontFamily === "Times New Roman") {
                return true
            }
            let _testEl = fabric.document.createElement("canvas")
            let ctx = _testEl.getContext("2d")
            ctx.font = fontSize + "px " + fontFamily
            let size = ctx.measureText(testString)
            _testEl.width = size.width
            _testEl.height = 50
            ctx.font = fontSize + "px " + fontFamily
            if(_etalonMeasurements.width !== size.width){
                return true;
            }

            ctx.fillStyle = "black"
            ctx.fillText(testString, 0, 50)
            let dataURL2 = _testEl.toDataURL()
            return dataURL2 !== _etalonMeasurements.url
        }
    }
}


/*
Probably etter compare using getimageData

  const firstCharData = new Uint32Array(
    context.getImageData(0, 0, width, fontSize).data.buffer
  );

  const wholeWordData = new Uint32Array(
    context.getImageData(0, 0, width, fontSize).data.buffer
  );

  // we only want to know when a pixel has changed so can ignore
  // the value at the pixel and only look to see if they were both
  // turned on or off
  const difference = firstCharData.reduce((diff, pixel, i) => {
    if (pixel === 0 && wholeWordData[i] === 0) return diff;
    if (pixel !== 0 && wholeWordData[i] !== 0) return diff;
    return ++diff;
  }, 0);

  percent = (difference / firstCharData.length).toFixed(2);
  percents.push(percent);
 */
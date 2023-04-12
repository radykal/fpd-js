import fs from 'fs'
import path from 'path'

fabric.request = function(type,req, res) {
  try {
    let data = fabric.node.getData(req.body);
    fabric.node.createEditor(data).then(editor => {
      if (req.body.file) {
        fabric.save[type](editor, req.body.file).then(pdf => {
          res.status(200).json({url: pdf});
        });
      }else{
        fabric.response[type](res, editor)
      }
    })
  }
  catch (e) {
    console.trace(e.message);
    res.status(400).json({message: e.message, stack: e.stack});
  }
};



fabric.StaticCanvas.prototype.saveAsPNG = function(filename){
  let pstream = this.createPNGStream(),
      pngOutputStream =  fs.createWriteStream(filename);

  pstream.on('data', (data) => {
    pngOutputStream.write(data);
  });

  pstream.on('end',  () => {
    pngOutputStream.end();
  });
};

fabric.save = {
  _getFileName (pattern, index = ""){
    let prefix = fabric.util.exportDirectoryURL || fabric.util.exportDirectory;
    return prefix + ((pattern.includes("*") ? pattern.replace("*",index) : pattern + index));
  },
  svg: function saveSVG(editor,filesPattern){

    let promises = [];

    fabric.util.svgMediaRoot = "./public/";
    let filesUrls = [];

    editor.slides.forEach((slide,index)  => {
      let svgData = slide.toSVG();
      let filename = this._getFileName(filesPattern,index);

      let buffer = Buffer.from(svgData);
      if(filename.toLowerCase().startsWith("s3:")){
        promises.push(fabric.node.uploadToS3(filename.substr(3),buffer));
      }
      else{
        promises.push(new Promise(resolve => {
          filesUrls.push(filename);
          let svgStream = fs.createWriteStream(path.resolve(filename));
          svgStream.write(buffer);
          svgStream.end();
          resolve(path.resolve(filename));
        }));
      }
    });
    fabric.util.svgMediaRoot = "";

    return Promise.all(promises);
  },
  png: function savePNG(editor,filesPattern){
    let promises = [];
    editor.slides.forEach((slide,index) => {
      slide.setElement(true);
      slide.renderAll();


      if(filesPattern){
        let filename = this._getFileName(filesPattern,index);
        if(filename.toLowerCase().startsWith("s3:")) {

          let canvas = fabric.util.getNodeCanvas(slide.lowerCanvasEl);
          // Default: buf contains a PNG-encoded image
          const buffer = canvas.toBuffer();
          // PNG-encoded, zlib compression level 3 for faster compression but bigger files, no filtering
          const buf2 = canvas.toBuffer('image/png', { compressionLevel: 3, filters: canvas.PNG_FILTER_NONE });
          // JPEG-encoded, 50% quality
          const buf3 = canvas.toBuffer('image/jpeg', { quality: 0.5 });

          promises.push(fabric.node.uploadToS3(filename.substr(3), buffer));
        }
        else{
          promises.push(new Promise(resolve => {
            slide.saveAsPNG(filename);
            resolve(path.resolve(filename));
          }));
        }

      }else{
        //if url is not definedm then return base64 encoded image
        promises.push(new Promise(resolve => {
          resolve(slide.canvas.toDataURL());
        }));
      }
    });

    return Promise.all(promises);
  },
  pdf: function savePDF(editor,file){
      let document = editor.makeDocument();
      let filename = this._getFileName(file);

      if(filename.toLowerCase().startsWith("s3:")) {
        return document.toBuffer()
          .then(buffer => {
            return fabric.node.uploadToS3(file.substr(3), buffer);
          })
      }else{
        return document.toFile(filename);
      }
  }
};

fabric.response = {
  pdf:  function sendAsPDF(response,editor){

    let document = editor.makeDocument();
    response.status(200);
    response.header('Content-type', 'application/pdf');
    response.header('Content-disposition', 'attachment; filename=Untitled.pdf');

    document.pipe(response);
  },
  svg:  function sendAsSVG(response,editor,pageIndex = 0){
    fabric.util.svgMediaRoot = "./public/";
    let svgData = editor.toSVG();
    fabric.util.svgMediaRoot = "";

    response.status(200).type("svg").end(svgData);
  },
  png:  function sendAsPNG(response,editor,pageIndex){
    if(pageIndex === undefined)pageIndex = 0;
    editor.slides[pageIndex].setElement(true);
    editor.slides[pageIndex].renderAll();
    let stream = editor.slides[pageIndex].createPNGStream();
    response.type("png");
    stream.pipe(response);
  },
  jpg:  function sendAsJPG(response,editor,pageIndex){
    if(pageIndex === undefined)pageIndex = 0;
    let stream = editor.slides[pageIndex].createJPEGStream();
    response.type("jpg");
    stream.pipe(response);
  },
};

function downloadDocumentWorker(data, options,  res){
  let worker = require('child_process').fork("server/worker.js", {execArgv: [],  stdio: ['pipe','pipe','pipe', 'ipc']});
  // var options = { stdio: ['pipe','pipe','pipe','pipe'] };  // first three are stdin/out/err
  // var pipe = proc.stdio[3];
  // pipe.write(Buffer('hello'));
  ///The child can open the pipe like this:
  // var pipe = new net.Socket({ fd: 3 });
  // pipe.on('data', function(buf) {
  //   // do whatever
  // });
  worker.stdout.on('data', (data) => {process.stdout.write(`⚙${worker.pid}: ${data.toString()}`);});
  worker.stderr.on('data', (data) => {process.stdout.write(`⚙${worker.pid}: ${data.toString()}`);});
  worker.on('message', message => {
    pdfResponse(message);
  });
  worker.on('exit', (code) => {
    console.log(`Child exited with code ${code}`);
  });
  worker.send({
    data: data,
    options: options
  });
}

/**
 * обработка данных от родительского процесса
 */
function checkParentProcess(){
  let messageFromParent = null;
  if (process.send) {
    process.on('message', options => {
      messageFromParent = options;
      let data = fabric.node.getData(options.data);
      fabric.node.createEditor(data)
    });
    setTimeout(function(){
      if(!messageFromParent){
        console.log("no message from parent");
        process.exit();
      }
    },5000)
  }
}





/*canvas to MP4
https://www.npmjs.com/package/ffmpeg
https://scwu.io/rendering-canvas-to-mp4-using-nodejs/
var recorder = child_process.spawn("ffmpeg.exe", [
  "-y", "-f", "image2pipe",
  "-vcodec", "png", "-r", "60",
  "-i", "-", "-vcodec", "h264",
  "-r", "60", "output.mp4"
]);
Next, for each frame grab the canvas data and convert to a binary string.

  var url = canvas.toDataURL();
var data = atob( url.substring(url.indexOf("base64") + 7) );
Finally, we can write the data to stdin.

recorder.stdin.write(data, "binary");
When finished, we can close the stream.

recorder.stdin.end();


*/


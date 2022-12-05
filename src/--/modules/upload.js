import {getExifOrientation, resetOrientation } from "../util/image-rotation.js";
import fileDialog from './../../plugins/file-dialog.js'
// const loadImage = require('./../../tools/javascript-load-image/js/index');

fabric.Uploader = function(options){
  fabric.util.object.extend(this,options);
};
fabric.Uploader.prototype = {
  imageMaxSize: {
    width: 400,
    height: 400
  },
  imageMinSize: {
    width: 100,
    height: 100
  },
  multiple: false,
  accept: "image/*",
  validateIndividually: true,
  validation: null,
  onInvalid (file){
    console.log("file is not valid");
  },
  validateFiles(files,options){
    let filesArray = [];
    files.forEach(file => {
      if (this.validation && this.validation(file, options.data) === false) {
        this.onInvalid(file,options);
      }else{
        filesArray.push(file)
      }
    });
    return filesArray;
  },
  resizeUploadedImage (img, callback) {
    if (img.type === "svg+xml") {
      callback(img);
      return;
    }
    //Here we can put a restriction to upload a minim sized logo
    if (img.width < this.imageMinSize.width || img.height < this.imageMinSize.height) {
      alert("Logo is too small. MInimum size is " + this.imageMinSize.width + "x" + this.imageMinSize.height);
      callback(false);
      return;
    }

    if (img.width > this.imageMaxSize.width || img.height > this.imageMaxSize.height) {
      let size = fabric.util.getProportions(img, this.imageMaxSize, "contain");
      let filter = new fabric.Image.filters.ResizeDP();
      let canvas = fabric.util.createCanvasElement(img);
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      filter.applyTo(canvas, size.width, size.height);
      callback(canvas);
    } else {
      callback(img);
    }
  },
  url: false,// "/upload",=
  onProgress (ev) {
    let percentComplete = parseInt((ev.loaded / ev.total) * 100);
    console.log(percentComplete);
  },
  fileParameter: "file",
  filesParameter: "files",
  uploadClass: 'image',
  multipleUpload: null,
  onUploadAll: function (imagesArray, data, canvas) {},
  onUpload: function (image, data, canvas) {},
  onRead: null,
  _uploadToServer: function (files, options) {
    return new Promise((resolve, reject)=>{

      if (this.multipleUpload) {
        this.uploadToServer({
          files,
          data: options.data,
          onProgress: this.onProgress,
          onSuccess: (loaded)=> {
            resolve(loaded)
          }
        });
      }
      else {

        let loader = new fabric.util.Loader({
          elements: files,
          complete: ()=> {
            resolve()
          }
        });

        for (let file of files) {

          this.uploadToServer({
            file,
            data: options.data,
            onProgress: this.onProgress,
            onSuccess: (response) => {
              this.onUpload(response, options.data);
              loader.shift(file);
            }
          });
        }
      }
    })
  },
  // https://stackoverflow.com/questions/20600800/js-client-side-exif-orientation-rotate-and-mirror-jpeg-images/20600801
  fixOrientation:  function (files) {
    let promises = [];
    for(let i in files){
      let file = files[i];
      let promise = new Promise(resolve=> {

        // loadImage.parseMetaData(file, function(data) {
        //   if(data.exif){
        //     var orientation = data.exif.get("Orientation");
        //   }
        //   console.log(orientation);
          // resolve();
        // }, { meta: true });
          getExifOrientation(file, function (orientation) {
            // -2 is not jpeg
            // -1 is not defined
            // 1 is top-left
            if (orientation < 2) {
              resolve();
            }
            else
            {
              resetOrientation(URL.createObjectURL(file), orientation, function (blob) {
                files[i] = new File( [blob], file.name, {type: blob.type});
                resolve();
              });
            }
          });
      });
      promises.push(promise);
    }
    return Promise.all(promises);
  },
  async upload (cOptions = {}) {
    let options = Object.assign({}, cOptions);
    if(cOptions.data){
      options.data = Object.assign({},this.data, cOptions.data);
    }
    let files = await fileDialog({multiple:this.multiple,  accept: this.accept })
    console.log("upload:files",files)
    let filesArray= [];
    for(var i = 0; i< files.length ; i++){
      filesArray.push(files[i])
    }
    let validFiles = this.validateFiles(filesArray,options);
    console.log("upload:valid",validFiles)
    if(!validFiles.length) {
      return false;
    }

    await this.fixOrientation(validFiles);
    console.log("upload:fixed",validFiles)

    if(this.onRead){
      for(let file of validFiles){
        fabric.util.readImage(file, img => {
          if(this.target){
            this.onRead.call(this.target, img, options.data);
          }
          else{
            this.onRead(img, options.data);
          }
        });
      }
    }

    if(this.beforeUpload){
      let result = this.beforeUpload(validFiles,options);
      if(!result){
        return false;
      }
    }

    if(this.url){
      let loaded = await this._uploadToServer(validFiles,options);
      this.onUploadAll(loaded, options.data);
    }
  }
};
// uploadFilesToServer
fabric.util.post = function({
  url = "/upload",
  data = {},
  onProgress = function(event){},
  onError = function(error){},
  onSuccess = function(response){}
}){
  let formData = new FormData();
  for (let dataProperty in data) {
    let value = data[dataProperty];
    if(typeof value === "undefined")continue;
    if(value.constructor === Array){
      for (let i in value) {
        formData.append(dataProperty +"[]", value[i]);
      }
    }
    else{
      formData.append(dataProperty, value);
    }
  }

  return $.ajax({
    type: "POST",
    url: url,
    data: formData,
    contentType: false,
    processData: false,
    // Tell jQuery not to process data or worry about content-type
    // You *must* include these options!
    cache: false,
    // Custom XMLHttpRequest
    xhr: () => {
      let xhr = $.ajaxSettings.xhr();
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onProgress(event);
        }
      }, false);
      return xhr;
    }
  })
  .fail(onError)
  .done(onSuccess);
};

fabric.util.readImage = function(file, callback) {
  return new Promise((resolve,reject) => {

    let reader = new FileReader();
    reader.onload = function (e) {
      let result = e.target.result;
      let type = result.substr(11, result.indexOf(";") - 11);

      if (type === "svg+xml") {
        let xml = jQuery.parseXML(atob(result.substr(26)));
        fabric.parseSVGDocument(xml.documentElement, function (results, _options, elements, allElements) {
          let groupElement = new fabric.Group(results);

          let canvas = fabric.util.createCanvasElement();
          canvas.width = groupElement.width;
          canvas.height = groupElement.height;
          let ctx = canvas.getContext("2d");
          for (let object of results) {
            object.render(ctx);
          }
          canvas.src = result;
          canvas.type = type;
          canvas.name = file.name;
          callback && callback(canvas, e);
          resolve(canvas)
        })
      } else {

        let img = new Image();
        img.type = type;
        img.name = file.name;
        img.onload = function () {
          callback && callback(img, e)
          resolve(img)
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  })
}

fabric.util.uploadDialog = function(options,target){
  let uploader = new fabric.Uploader(options);
  uploader.target = target ;
  uploader.upload();
  return uploader;

}

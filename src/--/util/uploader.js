// import {fixOrientation } from "./../../plugins/image-rotation.js"
import fileDialog from './../../plugins/file-dialog.js'
import LoaderQueue from "../../util/loader.js"
import {getProportions} from "../../util/size.js"
import {readFileAsText} from "../../plugins/blob-buffers-utils.js";
// import {collectJpgMetaData, collectPngMetaData} from "../../plugins/metadata.js";
// import {collectJpgMetaData, collectPngMetaData} from "../../plugins/metadata.js";

export class Uploader {
    constructor (options) {
        fabric.util.object.extend(this,options);
    }
}

Object.assign(Uploader.prototype,{
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
            alert("Logo is too small. Minimum size is " + this.imageMinSize.width + "x" + this.imageMinSize.height);
            callback(false);
            return;
        }

        if (img.width > this.imageMaxSize.width || img.height > this.imageMaxSize.height) {
            let size = getProportions(img, this.imageMaxSize, "contain");
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
    url: false,
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
                this.uploadToServer(files, resolve,options.data,this.onProgress);
            }
            else {

                let loader = new LoaderQueue({
                    elements: files,
                    complete: ()=> {
                        resolve()
                    }
                });

                for (let file of files) {

                    this.uploadToServer(file,
                       (response) => {//function onSuccess
                            this.onUpload(response, options.data);
                            loader.shift(file);
                        },
                        options.data,
                         this.onProgress
                    )
                }
            }
        })
    },
    loadImagePromise(url){
        let image = new Image();

        return new Promise((resolve, reject) => {
            image.onload = function () {
                resolve(image)
            };
            image.src = url;
        })
    },
    async upload (cOptions = {}) {
        let options = Object.assign({}, cOptions);
        if(cOptions.data){
            options.data = Object.assign({},this.data, cOptions.data);
        }
        let files = await fileDialog({multiple:this.multiple,  accept: this.accept })
        // console.time("xxx")
        let filesArray= [];
        for(let i = 0; i < files.length ; i++){
            filesArray.push(files[i])
        }

        let validFiles = this.validateFiles(filesArray,options);
        if(!validFiles.length) {
            return false;
        }

        //read metadata
        for(let file of validFiles){
            let image, metadata;
            //curently SVG loaded in the same way as raster images

            // }
            // else{

                // if (file.type === "image/png") {
                //     // console.time("png")
                //     metadata = await collectPngMetaData(file);
                //     // console.timeEnd("png")
                // }
                //
                // if (file.type === "image/jpeg") {
                //     // console.time("jpeg")
                //     metadata = await collectJpgMetaData(file)
                //
                //     // if(metadata.exif.orientation)
                //     file = await fixOrientation(file);
                //     // console.timeEnd("jpeg")
                // }

            // }
            let url = window.URL.createObjectURL(file);
            image = await this.loadImagePromise(url)
            image.type = file.type;
            image.title = file.name;

            this.onRead && this.onRead.call(this.target || this, image, file,  metadata, options.data)
        }
        // console.timeEnd("xxx")

        if(this.beforeUpload){
            let result = this.beforeUpload(validFiles,options);
            if(!result){
                return false;
            }
        }

        if(this.uploadToServer){
            let loaded = await this._uploadToServer(validFiles,options);
            this.onUploadAll(loaded, options.data);
        }
        // if(this.url){
        //     let loaded = await this._uploadToServer(validFiles,options);
        //     this.onUploadAll(loaded, options.data);
        // }
    }
})


export function uploadDialog(options,target) {
    let uploader = new Uploader(options);
    uploader.target = target ;
    uploader.upload();
    return uploader;
}
//
// export async function importDialog(editor) {
//     return new Promise(resolve => {
//         fileDialog({multiple: false, accept: "image/svg+xml"}).then(files => {
//             readFileAsText(files[0]).then(text => {
//                 editor.canvas.loadFromSvg(text).then(data => {
//                     resolve(data)
//                 })
//             })
//         })
//     });
// }
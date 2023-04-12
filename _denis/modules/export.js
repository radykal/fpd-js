
import {writeMetadataB} from "./../../plugins/png-chunks.js";
import {canvasToBlobPromise} from "./../util/util.js";

fabric.util.object.extend(fabric.util,{
  exportCanvas: function(canvas,format,options){
    switch(format){
      case "data-url":
        return canvas.toDataURL(options);
      case "blob":
        return new Promise(resolve => {
          canvas.toBlob(function (blob) {
            resolve(blob);
          })
        });
      case "blob-url":
        return new Promise(resolve => {
          canvas.toBlob(function(blob){
            let url = window.URL.createObjectURL(blob);
            resolve(url);
          });
        });
      case "svg":
        return canvas.toSVG();
      case "svg-url":

      function b64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
          return String.fromCharCode(parseInt(p1, 16))
        }))
      }
        return "data:image/svg+xml;base64," + b64EncodeUnicode(canvas.toSVG());
    }
    return canvas;
  },
  Utf8ArrayToStr: function(array) {
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
  },
  dataURItoBlob: function (dataURI, dataTYPE) {
    let binary = atob(dataURI.split(',')[1]), array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: dataTYPE});
  },
  blobToDataURL: function (blob, callback) {
    return new Promise(function (resolve, fail) {
      let a = new FileReader();
      a.onload = function (e) {
        callback && callback();
        resolve(e.target.result);
      };
      a.readAsDataURL(blob);
    })
  }
});


Object.assign(fabric.Canvas.prototype, {
  exportPNG(){
    let imageBlob = this.getThumbnail({
      format: "blob",
      zoom: this.dotsPerUnit,
      clipped_area_only: false,
      draw_background: true
    });
    this.exportBlob(imageBlob);
  },
  exportSVG() {
    let svgData = "," + window.btoa(this.toSVG());
    this.exportBlob(fabric.util.dataURItoBlob(svgData, 'image/svg+xml'));
  },
  exportJSON(){
    let jsonData = "," + window.btoa(JSON.stringify(this.toObject()));
    this.exportBlob(fabric.util.dataURItoBlob(jsonData, 'application/json'));
  }
});

import saveAs from "./../../plugins/saveAs.js";

fabric.Editor.prototype.exportURL = "";

fabric.util.object.extend(fabric.Editor.prototype,{

  exportAction: "file",
  exportContainer: "export-container",
  getExportContainer(method){
    return document.getElementById(this.previewContainer);
  },
  async exportBlob(blob,method){
    let url = URL.createObjectURL(blob);
    switch(this.exportAction){
      case "preview":
        let elements;
        if(blob.type === 'image/svg+xml'){
          elements = await this._renderSvg(blob);
        }
        if(blob.type === 'image/png'){
          elements = await this._renderImage(url);
        }
        if(blob.type === 'application/pdf'){
          elements = await this._renderPDF(url);
        }

        let container = this.getExportContainer(method);
        while(container.firstChild){
          container.removeChild(container.firstChild);
        }
        for(let element of elements){
          container.appendChild(element);
        }
        break;
      case "file":
        saveAs(blob, this.title);
        break;
      case "window":
        window.open(url, '_blank');
        break;
    }
    this.fire("export", {method, url , blob});
    this._exportReady[method] = {url,blob};
  },
  pdfURL: "",
  svg_request: "/svg", /*location.origin + ":1337" */
  createFileOnServer: false,
  getExportData: function(){
    return this.storeObject();
  },
  beforeExport(method){
    return true;
  },
  _beforeExport(method){
    this.fire("before:export",{method: method});
    if(this.beforeExport(method) === false){
      return false;
    }
    let data = this._exportReady[method];
    if(data){
      this.fire("export", {url: data.url, blob: data.blob} );
      // this.onExport(method);
      return false;
    }
    return true;
  },
  async _renderSvg (blob) {
    let elements = [];
    let text = await blob.text();
    let svg = $(text);
    let pageSet = svg[0].getElementsByTagName("pageset")[0];
    if(pageSet){
      for(let i =0 ; i < pageSet.children.length;i++){
        let page = $(text)[0];
        let pageSet2 = page.getElementsByTagName("pageset")[0];
        pageSet2.replaceWith(...pageSet.children[i].children);

        elements.push(page);
      }
    }else{
      elements.push( $(text)[0]);
    }
    return elements;
  },
  async _renderImage (file) {
    let elements = [];
    return new  Promise ((resolve ) => {
      let image = new Image();
      image.src = file;
      elements.push(image);
      image.onload = function () {
        resolve(elements);
      };
    });
  },
  async _renderPDF (file) {
    let elements = [];
    await this.loadPdfPreviewModules();
    let pdf = await pdfjsLib.getDocument(file).promise;
    return new  Promise ((resolve ) => {
      for(let pageNum = 1; pageNum  <= pdf.numPages; pageNum ++){
        pdf.getPage(pageNum).then((page)=>{
          // let desiredWidth = demo.editor.canvas.width;
          let viewport = page.getViewport({scale: 1,});
          // let scale = desiredWidth / viewport.width;
          // let scaledViewport = page.getViewport({scale: scale,});
          let pdfcanvas = fabric.util.createCanvasElement();
          pdfcanvas.height = viewport.height;// scaledViewport.height;
          pdfcanvas.width = viewport.width;//scaledViewport.width;
          let pdfcontext = pdfcanvas.getContext('2d');
          elements.push(pdfcanvas);

          page.render({
            canvasContext: pdfcontext,
            viewport: viewport//scaledViewport
          }).promise.then(function () {
            resolve(elements);
          })
        });
      }
    });
    // if (e.name === "MissingPDFException") {
    //   console.error(e);
    // }
  },
  async getExportEditor(){

    let data = Object.assign({
      virtual: true,
      slides: [{}],
      prototypes: this.prototypes ,
      frames: this.frames
    },this.storeObject());

    return new fabric.Editor(data).promise
  },
  async exportSvgClient(){
    let method = 'client-svg';
    if(!this._beforeExport(method))return;
    let editor = await this.getExportEditor();

    fabric.util.svgMediaRoot = "./public/media/";
    let svg = editor.toSVG();
    fabric.util.svgMediaRoot = "";
    const blob = new Blob([svg], {type: 'image/svg+xml'});
    this.exportBlob(blob, method);
  },
  async exportPngClient(){
    let method = 'client-png';
    if(!this._beforeExport(method))return;
    // let editor = await this.getExportEditor();

    let thumbnail = this.canvas.getThumbnail({});
    thumbnail.toBlob(blob => {
      this.exportBlob(blob ,method);
    })
  },
  async export({ format, dpi , output, quality, background, meta = null}){

    switch(format){
      // case "server-svg": return this.exportSvgServer();
      // case "client-svg": return this.exportSvgClient();
      // case "server-png": return this.exportPngServer();
      // case "client-png": return this.exportPngClient();
      // case "client-pdf": return this.exportPdfClient();
      // case "server-pdf": return this.exportPdfServer();
      case "jpeg": {

        if(dpi){
          this.canvas.dotsPerUnit = dpi / fabric.DPI;
        }
        let thumbnail = this.canvas.getThumbnail({});

        //extra background, independable of blend modes
        if(background){
          let canvas2 = fabric.util.createCanvasElement(thumbnail);
          let ctx = canvas2.getContext("2d");
          ctx.fillStyle = background;
          ctx.fillRect(0,0,canvas2.width,canvas2.height);
          ctx.drawImage(thumbnail,0,0);
          thumbnail = canvas2
        }
        if(!output.endsWith(".jpg")){
          output += ".jpg";
        }

        let blob = await canvasToBlobPromise(thumbnail,'image/jpeg', quality)
        saveAs(blob,output)
        break
      }
      case "png": {
        let metadata;
        if(meta || dpi){
          metadata = {}
        }
        if(dpi){
          //converting DPi to "dots per meters", Photoshop do not support inches
          metadata.pHYs = {
            x: Math.round(dpi / 0.0254),
            y: Math.round(dpi / 0.0254),
            units: 1
          };
        }
        if(meta){
          metadata.tEXt = meta;
          /*{
            Title:            "projectData.title",
            Author:           "Ponomarev Denis",
            Description:      "",
            Copyright:        "Nymbl ©" + new Date().getFullYear(),
            Software:         "Fiera.js",
            Comment:          ""
          }*/
        }
        if(dpi){
          this.canvas.dotsPerUnit = dpi / fabric.DPI;
        }
        let thumbnail = this.canvas.getThumbnail({});
        let blob = await canvasToBlobPromise(thumbnail)
        if(metadata){
          blob = await writeMetadataB(blob, metadata);
        }
        if(!output.endsWith(".png")){
          output += ".png";
        }
        saveAs(blob, output)
        break
      }
    }


  },
  exportSvgServer () {
    let method = 'server-svg';
    if(!this._beforeExport(method))return;

    $.ajax({
      url: '/svg',
      type: 'post',
      contentType: 'application/json',
      cache: false,
      dataType: "xml",
      data: JSON.stringify(this.getExportData()),
      success:  (svgXmlDoc) =>{
        const blob = new Blob([svgXmlDoc.documentElement.outerHTML], {type: 'image/svg+xml'});
        this.exportBlob(blob, method)
      },
      error: function (error) {
        console.log(error);
      }
    });
  },
  exportPngServer () {
    let method = 'server-png';
    if(!this._beforeExport(method))return;

    let editor = this;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/png', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.responseType = 'blob';
    xhr.onload = function() {
      if (this.status === 200) {
        let blob = new Blob([this.response], {type: 'image/png'});
        editor.exportBlob(blob,method )
      }
    };
    xhr.send(JSON.stringify(this.getExportData()));
  },
  async loadPdfPreviewModules(){
    if(typeof pdfjsLib === "undefined"){
      await fabric.util.loadScript("lib/pdf.js");
      await fabric.util.loadScript("lib/pdf.worker.js");
    }
  },
  async loadPdfExportModules(){
    if(!fabric.PDFDocument){
      await fabric.util.loadScript("lib/fiera-pdf.js");
      fabric.PDFDocument = PDFDocument;
    }
  },
  async exportPdfClient(){
    let method = 'client-pdf';
    if(!this._beforeExport(method))return;
    let editor = await this.getExportEditor();

    await this.loadPdfExportModules();
    let fonts = editor.getUsedFonts();
    fabric.fonts.loadBinaryFonts(fonts).then(()=> {
      editor.makeDocument().toBlob(blob => {
        this.exportBlob(blob, method);
      })
    });
    fabric.Text.prototype.replaceIncompatibleSymbolsEnabled = false;
  },
  exportPdfServer () {
    let method = 'server-pdf';
    if(!this._beforeExport(method))return;

    let editor = this;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/pdf', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.responseType = 'blob';
    xhr.onload = function() {
      if (this.status === 200) {
        let blob = new Blob([this.response], {type: 'application/pdf'});
        editor.exportBlob(blob,method )
      }
    };
    xhr.send(JSON.stringify(this.getExportData()));
  },
  downloadPDF: function(){
    saveAs(this.pdfURL, this.title);
    return;
    // demo.chooseView("loading");
    // document.getElementById("iframe").src = demo.pdfURL;

    if(this.pdfURL.startsWith("blob:")){
      window.open(this.pdfURL, '_blank');
    }else{
      window.open("/" + this.pdfURL, '_blank');
    }


    let form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", "/pdf");
    form.setAttribute("style", "display: none;");

    let hiddenField = document.createElement("input");
    hiddenField.setAttribute("name", "slides[0]");
    hiddenField.setAttribute("value", JSON.stringify(data));
    form.appendChild(hiddenField);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    // demo.chooseView('iframe');
  },
  _exportReady: {},
  eventListeners: fabric.util.merge(fabric.Editor.prototype.eventListeners, {
    "modified": function () {
      this._exportReady = {};
    }
  })
});


/*
function downloadUsingPostRequestSaveAs(){
  let data = {slides: []};
  for(let i in canvasArray){
    data.slides.push(canvasArray[i].toObject(["width","height"]));
  }
  $.ajax({
    url: "/pdf",
    contentType: 'application/json',
    data: JSON.stringify(data),
    type: "POST",
    dataType: "binary",
    processData: false,
    success: function(result){
      saveAs(result, "new file.pdf");
    },
    error: function (error) {
      alert('There was an error! Error:' + error.name + ':' + error.status)
    }
  });
}

function downloadUsingGetRequest(){
  let data = {slides: []};
  for(let i in canvasArray){
    data.slides.push(canvasArray[i].toObject(["width","height"]));
  }
  window.open(`/pdf?data=${btoa(JSON.stringify(data))}`);
}

function downloadUsingFormSubmit(){
  let form = document.createElement("form");
  form.setAttribute("method", "post");
  form.setAttribute("action", "/pdf");
  form.setAttribute("style", "display: none;");

  for(let i in canvasArray){
    let hiddenField = document.createElement("input");
    hiddenField.setAttribute("name", canvasArray[i].canvasKey);
    hiddenField.setAttribute("value", JSON.stringify(canvasArray[i].toObject(["width","height"])));
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
*/

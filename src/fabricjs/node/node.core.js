import fs from 'fs'
import path from 'path'
import request from 'request'

fabric.util.load = function(url,dataType = "json"){
  return new Promise((resolve,reject) => {
    try {
      if(!url){
        throw "url is not defined";
      }

      if (url.startsWith('http')) {
        request.get(url, {encoding: "utf8"}, (err, res, rawText) => {
          if(err){
            throw err.message;
          }
          resolve(fabric.util.parsers[dataType](rawText));
        });
      }
      else {
        url = path.resolve(fabric.util.resolvePath(url));


        // macOS, Linux, and Windows
        fs.readFile(url, 'utf8',(err, data) => {
          if(err){
            throw err.message;
          }
          resolve(fabric.util.parsers[dataType](data))
        });
      }

    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log(e.message);
      }
      reject(e);
    }
  })
}

fabric.node = {
  /**
   * create NodeJS FabricJS Editor
   * @param {*} data
   */
  async createEditor(data) {
    console.time("total time");
    return new fabric.Editor({
      frames: this.frames,
      prototypes: data.prototypes,
      slide: data.slide,
      slides: data.slides
    }).promise.then(editor => {
      console.timeEnd("total time");
      return editor;
    });
  },

  getData: function(data){
    if (data.constructor === String) {
      data = fabric.util.load(data);
    }
    return fabric.util.formatEditorData(data);
  },

  initialize: function (config) {

    fabric.node.home = fs.realpathSync(config.home || ".") + "\\";
    process.chdir(fabric.node.home);


    fabric.Text.prototype.replaceIncompatibleSymbolsEnabled = true;

    let promises = [];

    for(let option in config){
      if(fabric.node.setters [option]){
        let result = fabric.node.setters [option].call(this,config [option]);
        if(result){
          promises.push(result);
        }
      }
    }
    return Promise.all(promises);
  },
  setters: {
    dpi (value) {
      fabric.DPI = value;
    },
    directories (dirs) {
      this.directories = dirs;
      fabric.mediaRoot = dirs.media;
      fabric.util.mediaRootUrl = dirs.mediaURL;
      fabric.util.exportDirectory = dirs.export;
      fabric.util.exportDirectoryURL = dirs.exportURL;
      fabric.fonts.fontsSourceRoot = dirs.fonts;
      fabric.fonts.fontsSourceRootURL = dirs.fontsURL;
    },
    debug (value) {
      for (let option of value) {
        switch (option) {
          case "pdf":
            fabric.pdf.debug = true;
            break;
          case "node-canvas":
            fabric.util.nodeCanvasDebug = true;
            break;
          case "images":
            fabric.util.timeDebug = true;
            break;
          case "loader":
            fabric.util.loaderDebug = true;
            break;
        }
      }
    },
    frames (value) {
      return fabric.util.load(value).then(response => this.frames = response)

    },
    fontsList (value) {
      return fabric.util.load(value).then(response => this.fontsList = response)
    },
    prototypes (value) {
      return fabric.util.load(value).then(response => this.prototypes = response)
    },
    lang (value) {
      return fabric.util.load(value).then(response => this.lang = response)
    },
    galleries (value) {
      return fabric.util.load(value).then(response => this.galleries = response)
    },
    fonts (value){
      return fabric.fonts.loadLocalFonts(value);
    }
  },
  processArguments: function (args) {
    if (!args) args = process.argv.slice(2);
    const argv = require('minimist')(args);
    if (argv._.length > 0) {
      let argData = argv._[0] === "{" ? JSON.parse(argv._[0]) : argv._[0];

      let output = argv._.splice(1);

      let data = fabric.node.getData(argData);

      return fabric.node.createEditor(data).then(editor => {
        let promises = [];
        let result = {};
        for (let file of output) {
          let extension = /\.(\w+$)/.exec(file)[1];
          switch (extension) {
            case "pdf":
              promises.push(fabric.save.pdf(editor, file).then(pdf => result.pdf = pdf));
              break;
            case "svg":
              promises.push(fabric.save.svg(editor, file).then(svg => result.svg = svg));
              break;
            case "png":
              promises.push(fabric.save.png(editor, file).then(png => result.png = png));
              break;
          }
        }
        return Promise.all(promises).then(() => {
          console.log(result);
        });
      });
    }
  }
};

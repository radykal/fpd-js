import path from 'path'
import fs from 'fs'
import express from 'express'
import request from 'request'
import bodyParser from 'body-parser'
import fontkit from "fontkit"
import imageSize from 'image-size'
import https from 'https'
import http from 'http'
import beautyStringify from "./../util/beautyStringify.js"
import multer from 'multer'

import compression from 'compression';
import os from "os"
import dns from "dns"
// const formidable  = require('formidable');

fabric.express = {
  setters: {
    fontsStyles(value) {
      this.app.get(value, (req, res) => {
        let styles = "/* Fiera.js Fonts */";
        if (req.query.families) {
          styles = fabric.fonts.getFontsStyles(req.query.families.split("|"));
        }
        res.status(200).type("css").end(styles);
      });
    },
    fontsList(value) {
      this.app.get(value, (req, res) => {
        if (fabric.node.fontsList) {
          res.status(200).json(fabric.node.fontsList);
        } else {
          let fonts = Object.keys(fabric.fonts.info.locals);
          res.status(200).json(fonts);
        }
      });
    },
    fontsDetails(value) {
      this.app.get(value, (req, res) => {
        let fonts = {}
        for (let fontFamily in fabric.fonts.registry) {
          let font = fabric.fonts.registry[fontFamily];
          let range = font.range.toString();
          fonts[fontFamily] = {
            range: range.substr(2, range.length - 4),
            variations: {}
          };
          for (let fvName in font.variations) {
            fonts[fontFamily].variations[fvName] = font.variations[fvName].src;
          }
        }
        res.status(200).json(fonts);
      });
    },
    lang(value) {
      this.app.get(value, (req, res) => {
        let lang;
        if (req.query.language) {
          lang = fabric.node.lang[req.query.language];
        } else {
          lang = fabric.node.lang;
        }
        res.status(200).json(lang);
      });
    },
    gallery(value) {
      this.app.get(value, (req, res) => {

        let galleryPath = req.params[0];
        if(!galleryPath.endsWith("/")){
          galleryPath +=  "/";
        }

        let filesAndFolders = fs.readdirSync(fabric.node.directories.media + galleryPath);
        let files = filesAndFolders.filter(file => /(\.\w+$)/igm.test(file));
        let folders = filesAndFolders.filter(file => !/(\.\w+$)/igm.test(file));

        let responseData = {
          url: galleryPath,
          folders: folders.map(folder => {

            let subFolderPath = galleryPath + folder + "/";
            let subFolderFilesAndFolders = fs.readdirSync(fabric.node.directories.media + subFolderPath);
            let subFolderFiles = subFolderFilesAndFolders.filter(file => /(\.\w+$)/igm.test(file));
            let thumbnailURL = subFolderPath + subFolderFiles[0];

            return {
              url: subFolderPath,
              image: thumbnailURL,
              type: /(\.\w+$)/igm.exec(thumbnailURL)[0].substr(1),
              title: folder
            }
          }),
          files: files.map(file => fabric.express.fileMapper(fabric.node.directories.media , galleryPath + file))
        };

        res.status(200).json(responseData);
      });
    },
    create(value) {
      this.app.post(value, (req, res) => {
        let file = req.body.file;
        fs.writeFile(`${fabric.node.directories.data}${file}.json`, '', (err) => {
          if (err) throw err;
          let data = JSON.parse(fs.readFileSync(`${fabric.node.directories.data}${file}.json`).toString());
          res.status(200).json(data);
        });
      });
    },
    list(value) {
      this.app.get(value, (req, res) => {
        fs.readdir(fabric.node.directories.data, (err, files) => {
          files = files
            .filter(file => !file.startsWith("__"))
            .map(file => {
              let data = fabric.node.getData(fabric.node.directories.data + file);
              return {
                title: data.title || file.replace(/.json$/, ""),
                file: file.replace(/.json$/, "")
              }
            });
          res.status(200).json(files);
        });
      });
    },
    data(value) {
      this.app.get(value, (req, res) => {
        let file = req.query.file;
        let fName = path.resolve(`${fabric.node.directories.data}${file}.json`);
        let data;
        try {
          if (fs.existsSync(fName)) {
            data = fabric.node.getData(fName);
          } else {
            data = {};
          }
          res.status(200).json(data);
        } catch (e) {
          console.trace(e.message);
          res.status(400).json({message: e.message, stack: e.stack});
        }
      });
    },
    save(value) {
      this.app.post(value, (req, res) => {
        let file = req.body.file;
        let fName = `${fabric.node.directories.data}${file}.json`;
        let data = req.body.data || "{}";
        let beautyData = beautyStringify(JSON.parse(data), true);
        fs.writeFile(fName, beautyData, function (err) {
          if (err) throw err;
          res.status(200).json({message: "saved"});
        });
      });
    },
    proxy(value) {
      this.app.get(value, (req, res) => {
        let url = req.url.substr(7);
        request.get(url).pipe(res);
      });
    },
    instagramRedirect(value) {
      this.app.use(value, (req, res) => {
        res.set('Content-Type', 'text/html');
        resres.send(new Buffer.from('<script src="lib/instagram-redirect.js"></script>'));
      });
    },
    routes(value) {
      for (let route in value) {
        this.app.use(route, express.static(value[route]));
      }

      //todo match no extension files
      this.app.get("*",(req,res) => {
        res.sendFile(path.resolve(fabric.node.home, 'public','index.html'))
      });
    },
    prototypes(value) {
      this.app.get(value, function frames(req, res) {
        res.status(200).json(fabric.node.prototypes);
      });
    },
    frames(value) {
      this.app.get(value, function frames(req, res) {
        res.status(200).json(fabric.node.frames);
      });
    },
    uploadDirectoryURL(value) {
      this.app.use(value, express.static(fabric.node.directories.upload));
    },
    exportDirectoryURL(value) {
      this.app.use(value, express.static(fabric.node.directories.export));
    },
    mediaDirectoryURL(value) {
      this.app.use(value, express.static(fabric.node.directories.media));
    },
    fontsDirectoryURL(value) {
      this.app.use(value, express.static(fabric.node.directories.fonts));
    },
    filesThubmnails(value) {
      this.app.use(value + "/*", async (req, res) =>  {
        let file = req.params[0];
        let inputFile = path.resolve(`${fabric.node.directories.data}${file}.json`);
        let data;
        try{
          if(fs.existsSync(inputFile)){
            data = fabric.node.getData(inputFile);
          }else{
            res.sendStatus(404);
          }
        }catch(e) {
          res.sendStatus(400).json({message: e.message})
        }
        let outputFile = path.resolve(fabric.node.directories.media + "thumbnails/files/" + file + ".png");

        if(fs.existsSync(outputFile)){
          res.sendFile(outputFile);
          return;
        }

        let index = (req.query.slide ? +req.query.slide  - 1: 0);
        let width = (req.query.w && /^\d+$/.test(req.query.w)) ? +req.query.w : 150;
        let height = (req.query.h && /^\d+$/.test(req.query.h)) ? +req.query.h : 150;
        fabric.express.ensureDirectoryExistence(outputFile);

        let editor = await fabric.node.createEditor(data);
        let out = fs.createWriteStream(outputFile);
        let slide = editor.slides[index];
        slide.setElement(true);
        slide.renderAll();

        let thumbnailCanvas = slide.getThumbnail({width,height});
        let stream = fabric.util.getNodeCanvas(thumbnailCanvas).createPNGStream();
        stream.pipe(out);
        out.on('finish', () => {
          res.sendFile(outputFile);
        })
      });
    },
    svg(value) {
      this.app.post(value, fabric.request.bind(this,"svg"));
    },
    pdf(value) {
      this.app.post(value,fabric.request.bind(this,"pdf"));
    },
    png(value) {
      this.app.post(value,fabric.request.bind(this,"png"));
    },
    uploadFont(value) {
      this.app.post(value, (req, res) => {

        let fontMimeTypes = {
          "application/octet-stream":     "ttf",
          "application/x-font-ttf":       "ttf",
          "application/x-font-truetype":  "ttf",
          "application/x-font-opentype":  "otf",
          "application/font-woff":        "woff",
          "application/font-woff2":       "woff2"
        };

        let form = new formidable.IncomingForm();
        //Formidable uploads to operating systems tmp dir by default
        form.uploadDir = "./media/uploads/";       //set upload directory
        form.keepExtensions = true;     //keep file extension

        form.parse(req, function(err, fields, files) {
          let file = files.file;

          if(file.size > 1000000){
            throw new Error("File is too big");
          }
          if (!file.type in Object.keys(fontMimeTypes)) {
            return callback(new Error(`type '${file.type}' is unsupported.`));
          }
          let font = fontkit.openSync(file.path);
          let filename =   font.familyName;// + "." + fontMimeTypes[file.type];

          fs.rename(file.path, './media/uploads/' + filename, function(err) {
            if (err) throw err;

            res.status(200).json({
              name: font.familyName,
              key: filename
            });
          });
        });
      })
    },
    uploadImage(value) {


      let storage = multer.diskStorage({
          destination: (req, file, callback)=> {
            callback(null, fabric.node.directories.upload);
          },
          filename: (req, file, callback) => {
            let filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
            console.log("uploading " + filename);
            callback(null, filename);
          }
        }),
        upload = multer({
          storage: storage,
          fileFilter: (req, file, callback) => {
            // console.log(file.mimetype);
            if (!file.mimetype.startsWith('image/')) {
              return callback('Only images are allowed', null);
            }
            callback(null, true);
          }
        }).single('file');

      this.app.post(value, upload, (req, res)  =>{
        res.status(200).json(fabric.express.fileMapper(fabric.node.directories.upload, res.req.file.filename))
      });
    },
    removeImage(value) {
      this.app.post(value, (req, res)=>{
        let src = req.body.key;
        if(fs.existsSync(fabric.node.directories.media + src)){
          fs.unlinkSync(fabric.node.directories.media + src);

          let thumbnailFile = path.resolve(fabric.node.directories.media + "thumbnails/" + src.substring(0, src.lastIndexOf('.')) + ".png");

          if(fs.existsSync(thumbnailFile)) {
            fs.unlinkSync(thumbnailFile);
          }
          res.status(200).json( {message: "File removed"});
        }else{
          res.status(400).json( {message: "File is not exists"});
        }
      });
    }
  },


  initialize: async function(config){

    let app = this.app = express();

    app.use(compression())




    this.app.use(bodyParser.json({limit: config.dataLimit || "10mb", extended: true}));
    this.app.use(bodyParser.urlencoded({limit: config.dataLimit || "10mb", extended: true}));

    app.all('/*', function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      next();
    });

    for(let option in config){
      if(fabric.express.setters [option]){
        await fabric.express.setters [option].call(this,config [option]);
      }
    }








    const devServerEnabled = false;
    if (devServerEnabled) {
      //instruction to make hot reloading: https://dev.to/riversun/how-to-run-webpack-dev-server-on-express-5ei9
      const webpack = require('webpack');
      const webpackDevMiddleware = require('webpack-dev-middleware');
      const webpackHotMiddleware = require('webpack-hot-middleware');
      const webpackConfig = require('../../webpack.config.js');

      //reload=true:Enable auto reloading when changing JS files or content
      //timeout=1000:Time from disconnecting from server to reconnecting
      webpackConfig.entry.app.unshift('webpack-hot-middleware/client?reload=true&timeout=1000');

      //Add HMR plugin
      webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

      const compiler = webpack(webpackConfig);

      //Enable "webpack-dev-middleware"
      app.use(webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath
      }));

      //Enable "webpack-hot-middleware"
      app.use(webpackHotMiddleware(compiler));
    }

    let port = process.env.PORT ? process.env.PORT : config.port;
    let credentials;
    let server;

    if(config.credentials){
      credentials = {
        key: fs.readFileSync(config.credentials.key),
        cert: fs.readFileSync(config.credentials.cert)
      };
        server = https.createServer(credentials, app);
      if(!port)port = 443;
    }
    else{
      server = http.createServer(app);
      if(!port)port = 80;
    }

    server.listen(port, function () {
      dns.lookup(os.hostname(), (err, hostname, fam)=> {
          let url = `listening at https://${hostname}:${port}`;
          console.log(url);
          // var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
          // require('child_process').exec(start + ' ' + url);

        })
        // res.writeHead(200);
        // res.end("hello world\n");
      });

    return app;
  },

  fileMapper (path, file) {
    let imageStats = imageSize(path + file);
    const stats = fs.statSync(path + file);
    return ({
      size: stats.size,
      width: imageStats.width,
      height: imageStats.height,
      orientation: imageStats.orientation,
      type: imageStats.type,
      src: file,
      title: file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'))
    })
  },

  ensureDirectoryExistence(filePath) {
    let dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    fabric.express.ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  },



};

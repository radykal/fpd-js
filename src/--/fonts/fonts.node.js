import fs from 'fs'
import request from 'request'
import https from 'https'
import path from 'path'
import WritableBufferStream from './../../plugins/WritableBufferStream.js'
import nodeCanvas from 'canvas'
import fontkit from 'fontkit'
import googleFontsList from './google.js'


import beautyStringify from './../util/beautyStringify.js'

// function collectFallbacksFontsRegistryInfo(){
//   fabric.fonts.info = fabric.util.object.data.load(`./fonts.json`, 'json');
//   fabric.fonts.loadCustomFonts(Object.keys(fabric.fonts.info.fallbacks)).then(data=>{
//     fs.writeFileSync('./cache/fallbacks.json', fabric.util.data.beautyStringify(data, true));
//   });
// }


fabric.util.object.extend(fabric.Text.prototype, {

  getCompatibleFallback(symbol){
    for(let ff in fabric.fonts.info.locals){
      if(fabric.fonts.registry[ff].range.test(symbol)){
        return ff;
      }
    }
    console.warn(`no fallback font for symbol '${symbol}`);
    return Object.keys(fabric.fonts.info.locals)[0];
  },
  checkIncompatibleSymbols(){
    // this._styleMap = this._generateStyleMap(this._splitText());

    let value = this.text;
    let _incompatibleStringStart = -1, _incompatibleStringEnd = -1;
    let lastFallback = false;
    let specialCharacters = '\t\n\r';
    for(let i = 0 ;i < value.length; i ++ ){
      let style = this.getStyleAtPosition(i);
      let ff = style.fontFamily || this.fontFamily;

      let symbol = value[i];
      if(specialCharacters.includes(symbol))continue;
      if(!fabric.fonts.registry[ff] || !fabric.fonts.registry[ff].range.test(symbol)){
        //если уже найден шрифт замена то попробуем его в первую очередь
        if(lastFallback){
          if(!fabric.fonts.registry[lastFallback].range.test(symbol)){
            //если страая замена не работает, то меняем символы и начинаем заново
            this.setSelectionStyles({fontFamily: lastFallback}, _incompatibleStringStart, i);
            _incompatibleStringStart = -1;
            lastFallback = false;
          }else{
            continue;
          }
        }
        lastFallback = this.getCompatibleFallback(symbol);

        //incomatible char
        if(_incompatibleStringStart === -1){
          _incompatibleStringStart = i;
        }
      }
      else{
        if(_incompatibleStringStart !== -1){
          this.setSelectionStyles({fontFamily: lastFallback}, _incompatibleStringStart, i);
          _incompatibleStringStart = -1;
          lastFallback = false;
        }
      }
    }
    if(lastFallback){
      this.setSelectionStyles({fontFamily: lastFallback}, _incompatibleStringStart, value.length);
      _incompatibleStringStart = -1;
    }

    this.editor.addUsedFonts(fabric.fonts.getUsedFonts(this.styles));
    this.editor.addUsedFont(this.fontFamily);
  }
});

fabric.util.object.extend(fabric.fonts,{
  readFontDirectory(filename){
    let variations;
    let fs = require('fs');
    if(filename.indexOf('*') === -1){
      if(fs.existsSync(fabric.fonts.fontsSourceRoot + filename)){
        variations = {'400': filename};
      }
    }else{
      let variations = {};
      let fvSuffixes = {'400': ['','r','400'], '400i' : ['i','400i'], '700': ['b','bd','700'],  '700i': ['bi','z','700i']};
      for(let fvName in fvSuffixes){
        for(let suffix of fvSuffixes[fvName]){
          let fvFilename = filename.replace('*',suffix);
          if(fs.existsSync(fabric.fonts.fontsSourceRoot + fvFilename)){
            variations[fvName] = fvFilename;
            break;
          }
        }
      }
    }
    return variations;
  },
  loadFontFileAsBuffer_Node(url){
    /* Using Promises so that we can use the ASYNC AWAIT syntax */
    return new Promise((resolve, reject) => {

      let stream = new WritableBufferStream();

      request({
          uri: url,
          headers: {
            // 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            // 'Accept-Encoding': 'gzip, deflate, br',
            // 'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
            // 'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
          },
          /* GZIP true for most of the websites now, disable it if you don't need it */
          // gzip: true
        })
        .pipe(stream)
        .on('finish', () => {
          resolve(stream.toBuffer())
        })
        .on('error', (error) => {
          reject(error);
        })
    });
  },
  uploadFile(url,src){
    return new Promise((resolve, reject) => {
      /* Create an empty file where we can save data */
      const stream = fs.createWriteStream(src);

      /* Using Promises so that we can use the ASYNC AWAIT syntax */
      request({
        uri: url,
        headers: {
          // 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          // 'Accept-Encoding': 'gzip, deflate, br',
          // 'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
          // 'Cache-Control': 'max-age=0',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
        },
        /* GZIP true for most of the websites now, disable it if you don't need it */
        // gzip: true
      })
        .pipe(stream)
        .on('finish', () => {
          stream.close(() => {
            resolve(src);
          });
        })
        .on('error', (error) => {
          reject(error);
        })
    });
  },
  GOOGLE_API_KEY: 'AIzaSyAlip_fWGbMRdBhwsT615uPE5X0Rqzoc9k',
  googleFontsCdnURL: 'https://fonts.gstatic.com/s/',
  googleFontsApiURL: 'https://www.googleapis.com/webfonts/v1/webfonts?key=',


  /**
   *
   * @param googleFontsDetailedFile
   * @param {Object <String,FontObject>} callback
   */
  getGoogleFontsList(googleFontsDetailedFile , callback){
    return new Promise( (resolve)=> {

      if(fabric.fonts.info.google){
        resolve(fabric.fonts.info.google);
      }else if (fs.existsSync(googleFontsDetailedFile)) {
        let fonts = fabric.util.load(googleFontsDetailedFile);
        fabric.fonts.info.google = fonts;
        resolve(fonts);
      }
      else {

        let url = this.googleFontsApiURL + this.GOOGLE_API_KEY;
        request.get(url, {
            headers: {
              //to load ttf files
              'User-Agent': 'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; GT-I9500 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko)Version/4.0 MQQBrowser/5.0 QQ-URL-Manager Mobile Safari/537.36'
              //to load woff files
              // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
            },
            json: true,
            encoding: 'utf8'
          }, (_error, _response, styles) => {
          let stylesParsed = {};

          styles.items.forEach(item => {
            let newFiles = {};
            for (let fvName in item.files) {
              let newFVName = fvName;
              if (fvName === 'regular') {
                newFVName = '400';
              }
              if (fvName === 'italic') {
                newFVName = '400italic';
              }
              newFVName = newFVName.replace('italic', 'i');

              newFiles[newFVName] = item.files[fvName].replace(this.googleFontsCdnURL, '');
            }
            stylesParsed[item.family] = {
              // subsets: item.subsets,
              // category: item.category,
              // family: item.family,
              variations: newFiles
            }
          });
          fs.writeFileSync(googleFontsDetailedFile, beautyStringify(stylesParsed, true));
          resolve(stylesParsed);
        });
      }
    })
  },
  getGoogleFontStyles(googFontsArray,callback){
    //
    // let fName = `./cache/${googFontsArray.join('%7C').replace(/\s/g,'+')}.css`;
    // if(false && fs.existsSync(fName)){
    //   let styles = fs.readFileSync(fName).toString();
    //   callback(styles);
    // }
    // else {
    // let url = fabric.fonts.buildGoogleUrl(googFontsArray,fabric.fonts.subsets);
    /*
    request.get(url, {
        headers: {
          //to load ttf files
          'User-Agent': 'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; GT-I9500 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko)Version/4.0 MQQBrowser/5.0 QQ-URL-Manager Mobile Safari/537.36'
          //to load woff files
          // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
        },
        encoding: 'utf8'
      },
      (_error, _response, styles) => {

        fs.writeFileSync(fName,styles);
        callback(styles);
      });*/
    // }
  },
  googleFontsPrefix: 'google/',
  registry: {},
  /**
   * load standart fonts info. fontFamilies fallbacks for different languages, files and ranges.
   */
  loadLocalFonts({list, detailed}){


    let fonts = {};
    if(detailed && fs.existsSync(detailed)) {
      fonts = fabric.util.load(detailed);
      fabric.fonts.info.locals = detailed;
    }else{
      fabric.fonts.info.locals = fabric.util.load(list);
      for(let familyName in fabric.fonts.info.locals){
        let font = fonts[familyName] = {variations: {}};
        fabric.fonts.readNotation(fabric.fonts.info.locals[familyName],(_,style,weight,file)=>{
          font.variations[weight + (style === 'italic' ? 'i' : '')] = file
        });
        font.range = fabric.fonts.getFontUnicodeRange(fabric.fonts.fontsSourceRoot + font.variations['400']);
      }
      if(detailed){
        fs.writeFileSync(detailed, beautyStringify(fonts, true));
      }
    }

    for (let ff in fonts) {
      fabric.fonts.registry[ff] = this._formatFontVariations(fonts[ff]);
    }

    return fonts;
  },
  cacheFonts: true,
  loadExternalFonts(families) {
    let parsedFonts = {};

    return new Promise( resolve => {
      let promises = [];
      let ffig = fabric.fonts.info.google;

      families.forEach(family => {
        if(fabric.fonts.registry[family]){
          return;
        }

        if(ffig[family]){
          let files = {};
          for(let fvName in ffig[family].variations){
            let sourceURL = 'https://fonts.gstatic.com/s/' + ffig[family].variations[fvName],
              extension =  /(\.\w+$)/.exec(sourceURL)[1],
              filename = `${family.replace(/ /g,'-')}${fvName}${extension}`,
              destinationPath = path.resolve(fabric.fonts.fontsSourceRoot +  fabric.fonts.googleFontsPrefix + filename);

            files[fvName] = {
              src: fabric.fonts.googleFontsPrefix + filename,
              active: false
            };

            if (!fs.existsSync(destinationPath)) {
              if(fabric.fonts.cacheFonts){
                promises.push(fabric.fonts.uploadFile(sourceURL, destinationPath));
              }
              else{
                promises.push(fabric.fonts.loadFontFileAsBuffer_Node(sourceURL, destinationPath).then(buf => {
                  files[fvName].buffer = buf;
                }))
              }
            }
          }
          fabric.fonts.registry[family] = parsedFonts[family] = {variations: files};
        }
        else{
          console.log(`font '${family}' was not found`);
        }
      });

      if(promises.length){
        Promise.all(promises).then(() => resolve());
      }else{
        resolve();
      }
    }).then(() =>{
      for(let ff in parsedFonts){
        parsedFonts[ff].range = fabric.fonts.getFontUnicodeRange(parsedFonts[ff].variations['400']);
        this._formatFontVariations(parsedFonts[ff]);
      }
    })
  },
  nodeCanvasFontWeightSupported: [400,700],
  registerNodeCanvasFonts(fonts){
    return fabric.fonts.loadExternalFonts(fonts).then(() => {
      for (let ff of fonts) {
        for(let fvName in fabric.fonts.registry[ff].variations){
          let fv = fabric.fonts.registry[ff].variations[fvName];
          if (!fv.active) {
            let src = require('path').resolve(fabric.fonts.fontsSourceRoot + fv.src);
            let fvOptions = this._readFontVariantName(fvName);

            if(this.nodeCanvasFontWeightSupported.includes(+fvOptions.weight)){
              // fvOptions.weight = (+fvOptions.weight === 400) ? 'normal':'bold';

              if(fabric.util.nodeCanvasDebug) {
                console.log(`node-canvas: register font '${ff} ${fvOptions.style} ${fvOptions.weight}'`);
              }

              //fv.variation.buffer
              nodeCanvas.registerFont(src, {family: ff, style: fvOptions.style, weight: fvOptions.weight});
              fv.active = true;
            }
          }

        }
      }
    })
  },
  getFontUnicodeRange: function(fontVariation){
    let font;
    if(fontVariation.constructor === Buffer || fontVariation.buffer){
      font = fontkit.create(fontVariation.buffer || fontVariation);
    }
    else{
      let src = fontVariation.src || fontVariation;
      font = fontkit.openSync(path.resolve(fabric.fonts.fontsSourceRoot + src));
    }

    let excluded = /[\u0000\r]/;
    // let format = /[ !@#$%^&*()_+\-=\[\]{};':'\\|,.<>\/?]/;
    let format = /[\-\[\]\\]/;
    let set = font.characterSet;
    let intervals = [];

    let _start_seq_index = 0;
    for (let i = 1; i++ < set.length;) {
      if (set[i] > set[i - 1] + 1) {

        let char = String.fromCodePoint(set[_start_seq_index]);
        if(excluded.test(char)){
          _start_seq_index = i;
          continue;
        }
        if(format.test(char))char = '\\' + char;

        if (i === _start_seq_index + 1) {
          // intervals.push(`\\u${set[_start_seq_index].toString(16)}`);
          if(intervals.indexOf(char) !== -1){
            console.log(char)
          }
          intervals.push(char);
        }
        else if (i === _start_seq_index + 2) {
          let char2 = String.fromCodePoint(set[i - 1]);
          if(format.test(char2))char2 = '\\' + char2;
          intervals.push(char + char2);
        }
        else if (i === _start_seq_index + 3) {
          let char2 = String.fromCodePoint(set[i - 1]);
          if(format.test(char2))char2 = '\\' + char2;
          let char3 = String.fromCodePoint(set[i - 2]);
          if(format.test(char3))char3 = '\\' + char3;
          intervals.push(char + char3 + char2);
        }
        else {
          // intervals.push(`\\u${set[_start_seq_index].toString(16)}-\\u${set[i - 1].toString(16)}`);
          let char2 = String.fromCodePoint(set[i - 1]);
          if(format.test(char2))char2 = '\\' + char2;
          intervals.push(char + '-' + char2);
        }
        _start_seq_index = i;
      }
    }
    return intervals.join('');
  }
});

/**
 * alternate to
 */
// fabric.fonts.getGoogleFontsList(`./google.json`);
fabric.fonts.info.google = googleFontsList;
// fabric.fonts.info.google = JSON.parse(fs.readFileSync(path.resolve('./google.json')))


// let fontConverter = require('font-converter');
// fontConverter('path/to/sourceFontFile.ttf', 'path/to/destinationFontFile.woff', function (err) {
//   if(err) {
//     // There was an error
//   } else {
//     // All good, path/to/destinationFontFile.woff contains the transformed font file
//   }
// })



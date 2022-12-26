/**
 * @name FontNotation
 * @property name {string} default file
 * @property d {string} file for bold font style
 * @property i {string} file for italic font styleset
 * @property z {string} file for bold italic font style
 */

//https://en.wikipedia.org/wiki/List_of_typographic_features

//https://developer.apple.com/fonts/TrueType-Reference-Manual/RM06/Chap6.html
//can check font features here https://fontdrop.info/#/

//find glyphs her: https://photopea.github.io/Typr.js/

import FontFaceObserver from "./../../plugins/fontfaceobserver.js"


import recoursive from "../../util/recoursive.js"
import standartFontsList from './fontsdetails-default.js'
import "../../polyfills/fonts.check.js"



function getUsedFonts(){
  let fonts = []
  for(let object of this._objects){
    let oFonts = object.getUsedFonts()
    if(oFonts){
      for(let font of oFonts){
        if(!fonts.includes(font))fonts.push(font)
      }
    }
  }
  return fonts
}

// fontTables: {
//   "CBDT/CBLC": false, //Google’s PNG images
//       "SBIX": false, //Standard Bitmap Graphics Table
//       "COLR/CPAL": false, //Microsoft’s overlapped glyphs
//       "SVG": true,  // Mozilla and Adobe’s SVG
// },

export const FmFonts = {
  name: "fonts",
  install (){

    if(fabric.fontsRoot === undefined){
      fabric.fontsRoot = "/fonts/"
    }

    let baseloader = {
      _info: standartFontsList,
      _list: Object.keys(standartFontsList),
      async getFontInfo(ff) {
        if (!this._list.includes(ff)) {
          return false
        }
        let info = this._info[ff]

        let freg = fabric.fonts.registry[ff] = {
          active: !info.features && !info.format && fabric.fonts.isFontAvailable(ff),
          format: info.format,
          features: info.features,
          variations: {}
        }
        for (let i in info.src) {

          let url = info.src[i]
          // not a BlobURL (blob:*), DataURL (data:*), Remote url (http|s,ftp...://*), Absolute Windows URL (C:/*)
          // not a relative URL (./*) or absolute URL (/*)
          let relToFontsRoot = !url.includes(':') && !url.startsWith('./') && !url.startsWith('/');
          freg.variations[i] = {
            src:  relToFontsRoot ? fabric.fontsRoot + url : url,
            active: freg.active
          }
        }

        let observers = []
        if (!freg.active) {

          if(fabric.isLikelyNode){
            observers.push(fabric.fonts.loadNodeFont(ff),fabric.fonts.remoteFontsPrefix)
          }
          else if (freg.variations) {
            //todo should ue different loading method for simple fonts
            if (freg.format === "svg" || fabric.fonts.calcCharBound) {
              observers.push(fabric.fonts.loadFontUsingFontFaceApi(ff))
            } else {
              observers.push(fabric.fonts.loadFontUsingStyles(ff))
            }
          } else {
            observers.push(fabric.fonts.loadFontWithCallback(ff))
          }
        }
        await Promise.all(observers)
        return freg;
      }
    }

    fabric.fonts = {
      calcCharBound: false,
      commonFontFeatures:  {
        liga: ["fi","fl","ffl","ffi"]
      },
      getTextFeatures(text, ff, features){
        let registry = fabric.fonts.registry[ff]

        let availableFs = registry && registry.features || this.commonFontFeatures
        if(!availableFs){
          return []
        }

        let availEnabledFeatures = {}
        let detectedFeatures = []


        for(let enabledFName in features){
          if(features[enabledFName] === false)continue;
          if(availableFs[enabledFName]){
            if(availableFs[enabledFName].constructor === Array){
              for(let components of availableFs[enabledFName]){
                availEnabledFeatures[components] = true;
              }
            }
            else{
              Object.assign(availEnabledFeatures,availableFs[enabledFName])
            }
          }
        }

        let featuresIndex = Object.keys(availEnabledFeatures).sort((a, b) => a.length > b.length ? -1 : 1)
        if(!featuresIndex.length){
          return []
        }

        for(let i= 0 ;i < text.length; i++){
          let cFeature;

          for(let feature of featuresIndex){
            if(text.substr(i,feature.length) === feature){

              let disabled = false
              if(detectedFeatures.length){
                for(let j = detectedFeatures.length;j--;){
                  let df = detectedFeatures[j]
                  //overlapping text features
                  if(df.position + df.components.length  > i){
                    if(df.components.length <= feature.length){
                      df.disabled = true;
                    }
                    if(df.components.length >= feature.length){
                      disabled = true;
                    }
                  }
                  else{
                    break;
                  }
                }
              }


              cFeature = {position: i, components: feature, code: availEnabledFeatures[feature]};
              if(disabled){
                cFeature.disabled = true;
              }
              detectedFeatures.push(cFeature)
            }
          }
        }

        for(let i= detectedFeatures.length; i--;){
          if(detectedFeatures[i].disabled){
            detectedFeatures.splice(i,1)
          }
        }
        return detectedFeatures;
      },
      nodeCanvasFontWeightSupported: ["n4","n7","i4","i7"],
      baseloader: baseloader,
      loaders: [
        baseloader
      ],
      fallbacks: [
        "Times New Roman",  //Latin and Cyrillic
        "SimHei",           //Chinese and Japanese
        "Malgun Gothic",    //Korean
        "Segoe UI Symbol",  //Symbol
        "Segoe UI Historic",//Historic
        // "Segoe UI Emoji",   //Emojis
        "Kartika",          //malayalam
        "Kokila",           //Devanagiri
        "Latha",            //Tamil
        "Raavi",            //Gurmukhi
        "Shonar Bangla",    //bengali
        "Nirmala UI",       //Nirmala UI
        "Shruti",           //Gujarathi
        "Tunga",            //Kannada
        "Vani",             //Telugu
      ],
      isFontAvailable: function (fontFamily) {
        if(fabric.isLikelyNode){
          return false
        }
        return document.fonts.check(`50px '${fontFamily}'`)
      },
      registerFonts: function(fonts){
        for(let ff in fonts){
          if(fonts[ff].src && fonts[ff].src.constructor === String){
            fonts[ff].src = {n4: fonts[ff].src}
          }
          // else{
          //   fonts[ff].src = fonts[ff].src
          //   delete fonts[ff].src
          // }
          baseloader._info[ff] = fonts[ff]
          baseloader._list.push(ff)
        }

        // fabric.fonts.loadFontsDeclarations(Object.keys(fonts))
        // for(let ff in fonts ){
        //   fabric.fonts.registry[ff] = this._formatFontVariations(fonts[ff],ff)
        // }
      },
      _variationOnloadCallback(ff, ffRegistry, fvName ){
        if(fvName){
          let variation = ffRegistry.variations[fvName]
          variation.active = true
          delete variation.observer
        }
        if (fabric.fonts.debug) {
          console.log(`Font loaded: ${ff} ${fvName}`)
        }
        fabric.util.clearFabricFontCache(ff)

        if(ffRegistry.variations){
          for (let fvName2 in ffRegistry.variations) {
            let variation2 = ffRegistry.variations[fvName2]
            if (!variation2.active) break
          }
        }
        ffRegistry.active = true
      },
      loadFontWithCallback(ff, fvName){
        let fvOptions = fvName ? fabric.fonts._readFontVariantName(fvName): {style: "normal", weight: "normal"}
        let freg = fabric.fonts.registry[ff]
        let testString = freg.range && fabric.fonts._getTestStringByUnicodeRange(freg.range) || "ABC"

        return new FontFaceObserver(ff,fvOptions)
            .load(testString)
            .then(()=> {
              return new Promise(function (resolve, reject) {
                let check = function () {
                  let avail = fabric.fonts.isFontAvailable(ff)
                  if(avail) {
                    resolve()
                  }else{
                    setTimeout(check, 25)
                  }
                }
                check()
              })
            })
            .then(() => {
              this._variationOnloadCallback(ff, freg, fvName)
            })
            .catch(err => {
              console.log(err, `font ${ff} slow loading`)
              this._variationOnloadCallback(ff, freg, fvName)
            })
      },
      loadFontUsingStyles(ff) {
        let freg = fabric.fonts.registry[ff]

        let stylesCSS = ``
        let observers = []
        for (let fvName in freg.variations) {
          let variation = freg.variations[fvName]
          if (variation.active) continue
          if (!variation.observer) {
            let fvOptions = fabric.fonts._readFontVariantName(fvName)

            let styleName = this.getFontWeightName(fvOptions.weight)

            if (fvOptions.style === "italic") {
              if (fvOptions.weight === 400) {
                styleName = "Italic"
              } else {
                styleName += " Italic"
              }
            }

            // this.addStyleRule(`
            //   @font-face {
            //     font-family: '${ff}'
            //     font-style: ${fvOptions.style}
            //     font-weight: ${fvOptions.weight}
            //     src:  local('${ff} ${styleName}'), local('${ff.replace(/ /g, "")}-${styleName.replace(/ /g, "")}'), url(${variation.src}) format('truetype')"
            //   }`
            // )

            //todo check fontfamilies
            let localNames = [ff,`${ff} ${styleName}`, `${ff.replace(/ /g, "")}-${styleName.replace(/ /g, "")}`]


            variation.observer = new FontFace(ff, `url('${variation.src}')`, fvOptions)
              .load()
              .then(loaded_face => {
                document.fonts.add(loaded_face);
                this._variationOnloadCallback(ff, freg, fvName)
              }).catch(error => {
                console.log(error, `font ${ff} slow loading`)
                this._variationOnloadCallback(ff, freg, fvName)
              })



          //   "/* cyrillic-ext */
          // @font-face {
          //     font-family: 'Roboto';
          //     font-style: normal;
          //     font-weight: 400;
          //     src: local('Roboto'), local('Roboto-Regular'), url(https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu72xKOzY.woff2) format('woff2');
          //     unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
          //   }

            // variation.observer = this.loadFontWithCallback(ff,fvName)
          }
          observers.push(variation.observer)
        }
        // if(stylesCSS){
        //   this.addStyleRule(stylesCSS)
        // }

        return Promise.all(observers)
      },
      loadFontUsingFontFaceApi(ff){
        let observers = []
        let reg = fabric.fonts.registry[ff]
        for(let fvName in reg.variations ) {
          let variation = reg.variations[fvName]
          if(!this.nodeCanvasFontWeightSupported.includes(fvName))continue

          if (variation.active) continue
          if (variation.buffer) continue
          if (!variation.observer) {

            //use buffer loading
            variation.observer = this.loadFontFileAsBuffer(variation.src)
                .then((buffer) => {
                  variation.buffer = buffer
                  let fvOptions = fabric.fonts._readFontVariantName(fvName)
                  new FontFace(ff, buffer,{
                      // family: Family
                      style: fvOptions.style,
                      weight: fvOptions.weight
                      // stretch: Stretch
                      // unicodeRange: Unicode range
                      // variant: variant
                      // featureSettings: Feature settings
                    })
                    .load()
                    .then((loadedFontFace) => {
                      document.fonts.add(loadedFontFace)
                      this._variationOnloadCallback(ff, reg, fvName)
                    })
                    .catch((error) => {
                      console.log(error)
                    })
                })
                .catch(err => {
                  console.log(err)
                })
          }
          observers.push(variation.observer)
        }
        return Promise.all(observers)
      },
      async waitForWebfontsTobeLoaded (fontFamilies, callback) {

        let fontsToCheck = fontFamilies.slice()
        for(let i = fontsToCheck.length; i--;){
          if(fontsToCheck[i].includes(",")){
            fontsToCheck.splice(i,1,...fontsToCheck[i].split(",").map(i => i.trim()))
          }
        }
        for(let i = fontsToCheck.length; i--;) {
          if (fabric.Text.genericFonts.includes(fontsToCheck[i])) {
            fontsToCheck.splice(i,1)
          }
        }

        try {
          await this.loadFontsDeclarations (fontsToCheck)

          callback && callback(true)
          return true
        }catch(err) {
          console.warn('Some font are not available:', err)
          callback && callback(false)
          return false
        }
      },

      /**
       * грузит стили шрифтов из списка fontsToCheck
       * грузит с помозщью нескольких методов.
       * если  указаны данные о шрифтах fabric.fonts.info.locals
       * то будет использовать этот объект для построения стилей самостоятельно.
       * далее стили для остальных шрифтов попробует загрузить с сервера.
       * По умолчанию - сервер Google fonts.
       * Но так же можно указать  локальный сервер, со скриптом из fiera.express.js в виде /fonts?families=family1|family2
       */
      async loadFontsDeclarations (fontsToCheck) {


        //todo create promise in fonts registry on first load.
        let promises = []

        for (let ff of fontsToCheck) {
          let promise;
          let registry = fabric.fonts.registry;
          if(registry[ff]){
            if(!registry[ff].loading) {
              continue
            }
            else{
              promise = registry[ff].loading
            }
          }
          else{
            promise = new Promise(async (resolve,reject) => {
              let fontInfo = null

              for (let loader of fabric.fonts.loaders) {
                try {
                  fontInfo = await loader.getFontInfo(ff)
                  if(fontInfo){
                    return resolve()
                  }
                }
                catch(e) {
                  console.error(e)
                  registry[ff] = {
                    error: true
                  }
                  reject()
                  break;
                }
              }
              if(!fontInfo) {
                console.warn(`unknown fontfamily: ${ff}`)
                reject()
              }
            })
          }
          promises.push(promise)

          if(fabric.fonts.debug){
            console.log(`${ff} will be loaded`)
          }
        }

        return Promise.all(promises)
      },

      addStyleRule (css){

        if(!this.fieraStyleTag){
          let head = document.head || document.getElementsByTagName('head')[0]
          let styleTag = document.createElement('style')
          head.appendChild(styleTag)
          this.fieraStyleTag = document.styleSheets[document.styleSheets.length- 1]
        }
        this.fieraStyleTag.insertRule(css, this.fieraStyleTag.cssRules.length);
      },
      addStyleTag (css){
        let head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style')

        head.appendChild(style)
        style.appendChild(document.createTextNode(css))
        // document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`)
      },
      // fontsURL: "https://fonts.googleapis.com/css?family=",
      uploadedFontsSourceRoot: "/fonts/",

//       getFontsStyles (families, noWarnings) {
//         let stylesCSS = ''
//
//         families.forEach(family => {
//           // if (fabric.fonts.info.locals && fabric.fonts.info.locals[family]) {
//
//
//
//           // return
//           // }
// //           if (fabric.fonts.info.google && fabric.fonts.info.google[family]) {
// //             fabric.fonts.readNotation(fabric.fonts.info.google[family], (_, style, weight, file) => {
// //               let fontURL = `${fabric.fonts.googleFontsCdnURL}${file}`
// //               let styleName = this.getFontWeightName(weight)
// //               if(style === "italic"){
// //                 if(weight === 400){
// //                   styleName = "Italic"
// //                 }else{
// //                   styleName += " Italic"
// //                 }
// //               }
// //
// //               stylesCSS += `/* google */
// // @font-face {
// //   font-family: '${family}'
// //   font-style: ${style}
// //   font-weight: ${weight}
// //   src:  local('${family} ${styleName}'), local('${family.replace(/ /g, "")}-${styleName.replace(/ /g, "")}'), url(${fontURL}) format('truetype')
// // }\n`
// //             })
// //           }
// //           else if(!noWarnings){
// //             console.warn(`font family ${family} was not found`)
// //           }
//         })
//         return stylesCSS
//       },
      debug: false,
      getPreloadUsedFonts(data) {
        if (!data) return []
        let usedFonts = []
        recoursive(data, (propertyName, valueName, object) => {
          if (propertyName === "fontFamily") {

            valueName.split(",").map(item => {
              let ff = item.trim()
              if(!usedFonts.includes(ff)){
                usedFonts.push(ff)
              }
            })
          }
        })
        return usedFonts
      },
      registry: {},
      getFontVariation(family, weight, style){
        let regFont = fabric.fonts.registry[family]
        if(!regFont)return null
        let variation = regFont.variations[weight + (style === "italic" ? "i" : "")]
        if(variation){
          return {style: style, weight: weight, variation: variation}
        }

        if(style !== "normal"){
          return fabric.fonts.getFontVariation(family, weight, "normal")
        }
        else if(weight !== 400){
          return fabric.fonts.getFontVariation(family, 400, "normal")
        }
        else{
          variation = regFont.variations[Object.keys(regFont.variations)[0]]
          return {style: style, weight: weight, variation: variation}
        }
      },
      _getTestStringByUnicodeRange(s){
        let re = /u([0-9A-Fa-f]+)/g
        let test = ""
        let m
        do {
          m = re.exec(s)
          if (m) {
            test += String.fromCodePoint(parseInt(m[1], 16)) ;  ///String.fromCodePoint ;.toString(16)
          }
        } while (m)
        return test
      },
      definitions : {
        Thin: 100,
        ExtraLight:200,
        Light: 300,
        Regular: 400,
        Normal: 400,
        Medium: 500,
        SemiBold:  600,
        Bold: 700,
        ExtraBold:  800,
        Black: 900
      },
      getFontWeightName (number){
        for(let name in this.definitions){
          if(this.definitions[name] === +number){
            return name
          }
        }
        return number
      },
      _readFontVariantName(key){
        let style = key[0].toLowerCase() === "i" ? "italic" : "normal"
        let weight = key[1] ? key[1] + "00" : "400"
        key = key.toLowerCase()
        // weight = key || "normal"
        // if(fabric.fonts.definitions[weight]){
        //   weight = "" + fabric.fonts.definitions[weight]
        // }
        return {style: style, weight: weight}
      },
      // readNotation (fontNotation, callback) {
      //   let variations = {}
      //   if(fontNotation.constructor === String){
      //     variations = fabric.fonts.readFontDirectory(fontNotation)
      //     fontNotation = {}
      //   }else if(fontNotation.variations){
      //     variations = fontNotation.variations
      //   }else{
      //     if(fontNotation.r)variations["400"] = fontNotation.r
      //     if(fontNotation.b)variations["700"] = fontNotation.b
      //     if(fontNotation.i)variations["400i"] = fontNotation.i
      //     if(fontNotation.bi)variations["700i"] = fontNotation.bi
      //   }
      //
      //   for(let fvName in variations){
      //     let fvOptions = fabric.fonts._readFontVariantName(fvName)
      //     let src = variations[fvName].src || variations[fvName]
      //     if (!/(\.\w+$)/.test(src)) {
      //       src += ".ttf"
      //     }
      //     callback(fontNotation.name, fvOptions.style, fvOptions.weight, src)
      //   }
      // },

      /**
       * For loading TTF/WOFF
       * @param url  <http:location_of_your_ttf_file>
       */
      loadFontFileAsBuffer: function(url) {
        return new Promise( (resolve, fail)=> {
          let progressObject =  {
            type: "font",
            progress: 0,
            loaded: 0,
            total: 0,
            data: {
              url: url
            }
          }

          let type
          let match = (/[.]/.exec(url)) ? /[^.]+$/.exec(url) : undefined
          type = match && match[0] || "ttf"
          let xhr = new XMLHttpRequest()

          xhr.addEventListener('loadstart', event => {
            // this.addProgress(progressObject)
            progressObject.total = event.total
          });
          xhr.addEventListener('load', event => {
            resolve(xhr.response)
            // if(type === "ttf"){
            //   resolve(xhr.response)
            // }
            // if(type === 'woff' || type === 'woff2' ) {
            //   // let WORF = require("./../../plugins/worf")
            //   //   buf =_base64ToArrayBuffer(btoa(WORF.Converter.woffToSfnt(xhr.responseText)))
            //   // }
            // }
          });
          xhr.addEventListener('error', event => {
            fail(event)
          });
          xhr.addEventListener('loadend', event => {
            // this.removeProgress(progressObject)
          });
          xhr.addEventListener('progress', event => {
            progressObject.loaded = event.loaded
          });
          xhr.addEventListener('abort', event => {
            console.log(event)
          });

          xhr.open('GET', url, true)
          // if (type === 'woff' || type === 'woff2') {
          //   xhr.overrideMimeType('text/plain; charset=x-user-defined')
          // }
          xhr.responseType = "arraybuffer"
          xhr.send(null)
        })
      },
      loadBinaryFonts (fontFamilies) {
        let promises = []
        for(let ff of fontFamilies){
          let font = fabric.fonts.registry[ff]

          if(!font){
            console.error(`${ff} is not registered!`)
            continue
          }

          for(let fvName in font.variations){
            let fv = font.variations[fvName]
            if(!fv.buffer){
              let promise = fabric.fonts.loadFontFileAsBuffer(fv.src)

              promise.then(buf => {
                fv.buffer = buf
              }).catch(err => {
                console.error(err)
              })
              promises.push(promise)
            }
          }
        }
        return Promise.all(promises).catch((err)=> {
          console.warn('Some font are not available:', err)
        })
      },
      // linkCustomFonts(fonts){
      //   if (fonts) {
      //     if (fonts.length) {
      //       let newStyle = document.createElement('style')
      //       for (let fontNotation of fonts) {
      //         fabric.fonts.readNotation(fontNotation, (family, style, weight, file) => {
      //           newStyle.appendChild(document.createTextNode(`
      //       @font-face {
      //         font-family: '${family}'
      //         font-style: ${style}
      //         font-weight: ${weight}
      //         src: url('${fabric.fontsRoot}${file}') format('truetype')
      //       }`
      //           ))
      //         })
      //       }
      //       document.head.appendChild(newStyle)
      //     }
      //   }
      // },


      /**
       * @typedef {String} FontVariationsString
       * relative to FontsDirectory.
       * possible values: "subDirectory/fontFamily.ttf" //path to single varitaion fonts
       * possible values: "subDirectory/fontFamily*.ttf" // to multiple varitaions fonts
       * font Files could have names :
       *  fontFamily.ttf or fontFamilyr.ttf for regular font
       *  fontFamilyb.ttf for bold font
       *  fontFamilyi.ttf for italic font
       *  fontFamilybi.ttf for bold italic font
       *  fontFamily[fontWeight][i].ttf for fontswith specified weight and stylefor example, fontFamily-100.ttf or fontFamily-700i.ttf
       */

      /**
       * @typedef {object | FontVariationsString} FontNotation
       * @property {String} family
       * @property {String} category  Category from Google Fonts "handwriting" etc
       * @property {Object<String,String>} variations. keys - 100-900[i], values - url to .TTF font.
       *
       * @property b {string} file for bold font style
       * @property i {string} file for italic font styleset
       * @property bi {string} file for bold italic font style
       *
       */


      /**
       * @name FontNotation
       * @property name {string} default file
       *
       **/
      getFontsFamilyList (fontNotationsArray) {
        let _families = []
        for (let fontNotation of fontNotationsArray) {
          if (fontNotation.constructor === String) {
            _families.push(fontNotation)
          }
          else {
            _families.push(fontNotation.name)
          }
        }
        return _families
      }
    }


    // for(let ff in standartFontsList){
    //   let fd = fabric.fonts.registry[ff] = fabric.fonts._formatFontVariations(standartFontsList[ff])
    //   if(!fd.color && !fd.ligatures && fabric.fonts.isFontAvailable(ff)){
    //     fd.active = true
    //     for(let i in fd.variations){
    //       fd.variations[i].active = true
    //     }
    //   }
    // }

    // fabric.fonts.loadFontsDeclarations(fabric.fonts.fallbacks)

  },
  prototypes: {
    Text: {
      renderOnFontsLoaded: function (fonts,callback) {
        if(!fabric.isLikelyNode){
          fabric.fonts.waitForWebfontsTobeLoaded(fonts,()=>{
            this._forceClearCache = true
            this.dirty = true
            this.initDimensions()
            this.canvas && this.canvas.requestRenderAll()
            callback && callback()
          })
        }
        else{
          callback && callback()
        }
      },
      setText: function (value,callback) {
        if (this.replaceIncompatibleSymbolsEnabled) {
          let fonts = this.replaceIncompatibleSymbols()
          //preload fonts

          if(!fabric.isLikelyNode){
            fabric.fonts.waitForWebfontsTobeLoaded(fonts).then(() => {
              this.setProperty('text', "" + value)
              this.canvas && this.canvas.requestRenderAll()
              callback && callback()
            })
          }
          else{
            this.canvas && this.canvas.requestRenderAll()
            callback && callback()
          }

        }
        else{
          this.setProperty('text', "" + value)
          callback && callback()
        }
      },
      getUsedFonts (){
        if(this.exportAsPath)return false
        let fonts = []

        for(let row in this.styles) {
          for (let index in this.styles[row]) {
            let fontFamily = this.styles[row][index].fontFamily
            if(fontFamily){
              fontFamily.split(",").map(item => {
                let ff = item.trim()
                if(!fonts.includes(ff))fonts.push(ff)
              })
            }
          }
        }

        this.fontFamily.split(",").map(item => {
          let ff = item.trim()
          if(!fonts.includes(ff))fonts.push(ff)
        })
        return fonts
      },
      replaceIncompatibleSymbolsEnabled: false,
      specialCharacters: "\t\n\r\uFE0E\uFE0F",
      replaceIncompatibleSymbols (onlyColorFonts = true){
        let usedFonts = []

        if (!this._textLines || !this._styleMap) {
          if(this._generateStyleMap){
            this._styleMap = this._generateStyleMap(this._splitText())
          }
          else{
            this._splitText()
          }
        }

        let objectFonts = this.fontFamily.split(",").map(fi => fi.trim());
        let fallbackFonts = objectFonts.concat(fabric.fonts.fallbacks.filter(fi => !objectFonts.includes(fi)))

        let mainFont = objectFonts[0]
        if(objectFonts.length > 1){
          if(fabric.isLikelyNode){
            this.fontFamily = objectFonts[0]
          }
        }

        for (let lineIndex = 0; lineIndex < this._unwrappedTextLines.length; lineIndex++) {
          if (!this._getLineStyle(lineIndex)) this._setLineStyle(lineIndex);
          for (let charIndex = 0; charIndex < this._unwrappedTextLines[lineIndex].length; charIndex++) {
            if (this._specialArray && this._specialArray[lineIndex] && this._specialArray[lineIndex][charIndex]) continue
            let symbol = this._unwrappedTextLines[lineIndex][charIndex]
            if (this.specialCharacters.includes(symbol)) continue

            let styleFonts = this.styles && this.styles[lineIndex] && this.styles[lineIndex][charIndex] && this.styles[lineIndex][charIndex] && this.styles[lineIndex][charIndex].fontFamily ?
                this.styles[lineIndex][charIndex].fontFamily.split(",").map(fi => fi.trim()) : []

            let fontsList = styleFonts.concat(fallbackFonts.filter(fi => !styleFonts.includes(fi)))

            if(onlyColorFonts && !fabric.fonts.registry[fontsList[0]] || !fabric.fonts.registry[fontsList[0]].color){
              continue;
            }
            let compatibleFont = fontsList.find(fi => fabric.fonts.fontIncludes({fontFamily: fi},symbol))

            if(compatibleFont){
              // if(compatibleFont !== this.fontFamily){
              //   if (!this._getStyleDeclaration(lineIndex, charIndex)) this._setStyleDeclaration(lineIndex, charIndex, {});
              //   this._getStyleDeclaration(lineIndex, charIndex).fontFamily = compatibleFont
              // }

              let decl = this._getStyleDeclaration(lineIndex, charIndex)
              let declFontFamily = decl && decl.fontFamily || mainFont
              if(compatibleFont !== declFontFamily){
                this._setStyleDeclaration(lineIndex, charIndex, Object.assign({},decl,{fontFamily: compatibleFont }));//todo fontFamilyFallback
              }

              if (!usedFonts.includes(compatibleFont)) usedFonts.push(compatibleFont)
            }
            else{
              console.warn(`no fallback font for symbol "${symbol}`)
            }
          }
        }

        return usedFonts
      },

      /**
       * Returns 2d representation (lineIndex and charIndex) of cursor (or selection start)
       * @param {Number} [selectionStart] Optional index. When not given, current selectionStart is used.
       * @param {Boolean} [skipWrapping] consider the location for unwrapped lines. usefull to manage styles.
       */
      get1DCursorLocation: function() {
        let x, y, skipWrapping
        if(arguments.length === 0){
          let position = this.get2DCursorLocation()
          x = position.charIndex
          y = position.lineIndex
          skipWrapping = false
        }
        else if(arguments[0].constructor === Object){
          x = arguments[0].charIndex
          y = arguments[0].lineIndex
          skipWrapping = arguments[1] !== undefined ? arguments[1] : false
        }
        else{
          y = arguments[0]
          x = arguments[1]
          skipWrapping = arguments[2] !== undefined ? arguments[2] : false;
        }

        let lines = skipWrapping ? this._unwrappedTextLines : this._textLines;
        let position = x;
        for (let i = 0; i < y; i++) {
          position += lines[i].length + 1
        }
        return position
      },
    },
    Object: {
      getUsedFonts: function(){
        return false
      }
    },
    StaticCanvas: {
      updateTextObjects (){
        let els = this.find({type: "text"})
            .concat(this.find({type: "textbox"}))
            .concat(this.find({type: "i-text"}))

        for (let el of els) {
          el._forceClearCache = true
          el.dirty = true
          el.initDimensions()
        }
        this.renderAll()
      },
      getUsedFonts
    },
    Group: {
      getUsedFonts
    },
    Editor: {
      fonts: [
        // "serif",
        // "sans-serif"
      ],
      // ///todo
      // eventListeners: {
      //   "loading:before": "preloadFonts"
      // },
      uiFonts: [
      //"Font Awesome"
      ],
      "+preloaders": [
        function(options,callback) {

          let appFonts = fabric.isLikelyNode ? fabric.fonts.fallbacks : ( options.fonts || this.fonts)

          let slidesFonts = fabric.fonts.getPreloadUsedFonts(options.slides )
          let slideFonts = fabric.fonts.getPreloadUsedFonts( options.slide)
          // let prototypesFonts = fabric.fonts.getPreloadUsedFonts(options.prototypes )
          let objectsFonts =  fabric.fonts.getPreloadUsedFonts(options.objects)

          let fonts = appFonts;
          if(slidesFonts)fonts = fonts.concat(slidesFonts.filter(fi => !fonts.includes(fi)))
          if(slideFonts)fonts = fonts.concat(slideFonts.filter(fi => !fonts.includes(fi)))
          // if(prototypesFonts)fonts = fonts.concat(prototypesFonts.filter(fi => !fonts.includes(fi)))
          if(objectsFonts)fonts = fonts.concat(objectsFonts.filter(fi => !fonts.includes(fi)))
          if(options.uiFonts)fonts = fonts.concat(options.uiFonts.filter(fi => !fonts.includes(fi)))

          // if(fabric.isLikelyNode){
          //   fabric.fonts.registerNodeCanvasFonts(fonts).then(callback)
          // }
          // else{
            fabric.fonts.waitForWebfontsTobeLoaded(fonts).then(callback)
          // }
        }
      ],
      setFonts (fonts) {
        this.fonts = [].concat(fonts)
      },
      updateFontsOnSlides () {
        fabric.util.clearFabricFontCache()
        if (this.slides) {
          for (let slide of this.slides) {
            slide.updateTextObjects()
          }
        }
        else if(this.canvas){
          this.canvas.updateTextObjects()
        }
      },
      uploadFont(options) {
        let uploader = this.fontsUploader || this.uploader || {}
        options = options || {}
        options.accept = "font/ttf"

        if (!uploader.callback && !options.callback) {
          options.callback = function (image, data, canvas) {
            console.log(image, data, canvas)
          }.bind(this)
        }
        if (!uploader.upload && !options.upload) {
          options.upload = function (file, data, callback) {
            fabric.util.readImageFile(file, img => {
              callback(img, options.data, options.canvas)
            })
          }
        }
        this.uploadFiles(Object.assign({}, uploader, options))
      },
      getUsedFonts (inludeAppFonts){
        let fonts = inludeAppFonts ? this.fonts : []
        if(this.slides){
          for(let slide of this.slides){
            let oFonts = slide.getUsedFonts()
            if(oFonts) {
              for (let font of oFonts) {
                if (!fonts.includes(font)) fonts.push(font)
              }
            }
          }
          return fonts
        }else if(this.canvas){
          return this.canvas.getUsedFonts()
        }
        else{
          return []
        }
      }
    }
  }
}

//https://fontdrop.info/


// fabric.fonts.registerFonts(fabric.fonts.info.locals)

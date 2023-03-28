import {FmFonts} from "./fonts.js";
import CSSJSON  from "./../../plugins/cssjson.js"

export const FmGoogleFonts = {
    name: "google-fonts",
    deps: [FmFonts],
    install() {


        let googleLoader  = {
            GOOGLE_API_KEY: 'AIzaSyAlip_fWGbMRdBhwsT615uPE5X0Rqzoc9k',
            googleFontsApiURL: 'https://www.googleapis.com/webfonts/v1/webfonts?key=',
            googleFontsCdnURL: 'https://fonts.gstatic.com/s/',
            fontsCssURL: "https://fonts.googleapis.com/css?family=",
            async getFullGoogleFontsList(){
                let info = await this.getFullGoogleFontsInfo();
                return Object.keys(info)
            },
            async getFontInfo(ff){
                if (this._list && !this._list.includes(ff)) {
                    return false
                }

                if(this._info){

                    let freg = fabric.fonts.registry[ff] = {variations: {}}
                    for (let fvName in this._info[ff].src) {
                        if(!fabric.fonts.nodeCanvasFontWeightSupported.includes(fvName))continue
                        freg.variations[fvName] = {
                            active: false,
                            src: this.googleFontsCdnURL + this._info[ff].src[fvName]
                        }
                    }
                    return fabric.fonts.loadNodeFont(ff, this.googleFontsPrefix)

                }


                let fontsArray = ff.constructor === String ?  [ff] : ff
                let url = `${this.fontsCssURL}${fontsArray.join("%7C").replace(/\s/g, "+")}`
                let response = await fetch(url)
                let styles = await response.text()

                let json = CSSJSON.toJSON(styles,{ordered: true, comments: true})
                let comment = ""
                let parsed = {}
                Object.values(json).forEach(el => {
                    if(!el.value){
                        comment = el.replace(/^\/\*/,"").replace(/\*\/$/,"").trim()
                        return
                    }
                    let obj = {}
                    Object.values(el.value).forEach(prop => {
                        obj[prop.name] = prop.value
                    })

                    let ff = obj["font-family"].replace(/'/g,"")
                    if(!parsed[ff]){
                        parsed[ff] = []
                    }
                    el = {
                        comment: comment,
                        style: obj["font-style"],
                        weight:  obj["font-weight"],
                        src: /url\(([^\)]+)/.exec(obj["src"])[1],
                    }
                    if(obj["unicode-range"]){
                        el.range = obj["unicode-range"].replace(/\s/g,"").replace(/U\+([0-F]+)\-([0-F]+)/g,"U+$1-U+$2").replace(/U\+/g,"\\u")
                    }
                    parsed[ff].push(el)
                })


                fabric.fonts.addStyleTag(styles)

                let freg = fabric.fonts.registry[ff] = {
                    variations: {}
                };

                parsed[ff].forEach(obj => {
                    let fvName = (obj.style === "italic" ? "i" : "n") + obj.weight[0]
                    freg.variations[fvName] = {
                        src: obj.src
                    }
                })

                if(fabric.fonts.calcCharBound){
                    console.log("!")
                }

                let observers = []
                for (let fvName in freg.variations) {
                    let variation = freg.variations[fvName]
                    if (!variation.observer) {
                        variation.observer = fabric.fonts.loadFontWithCallback(ff,fvName)
                    }
                    observers.push(variation.observer)
                }

                return Promise.all(observers)
            },
            getFullGoogleFontsInfo(){
                return new Promise( (resolve)=> {
                    let url = this.googleFontsApiURL + this.GOOGLE_API_KEY;
                    let xhr = new XMLHttpRequest()
                    xhr.open('GET', url, true);
                    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    xhr.responseType = 'json';
                    xhr.onload = function() {
                        let styles = this.response
                        let stylesParsed = {};

                        styles.items.forEach(item => {

                            let newFiles = {};
                            for (let fvName in item.files) {
                                let data = /(\d+)?(\w+)?/.exec(fvName)
                                let newFVName = (data[2] === "italic" ? "i":"n") +(data[1] ? data[1][0] : "4")
                                newFiles[newFVName] = item.files[fvName].replace(this.googleFontsCdnURL, '');
                            }
                            stylesParsed[item.family] = {
                                // subsets: item.subsets,
                                // category: item.category,
                                // family: item.family,
                                src: newFiles
                            }
                        });
                        resolve(stylesParsed)

                    };
                    xhr.send(null);
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
        }
        fabric.GoogleFontsLoader = googleLoader
        fabric.fonts.loaders.push(googleLoader)
    }
}



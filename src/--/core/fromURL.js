// import LoaderQueue from "../../util/loader.js";
import {readAsBlob} from "../../plugins/blob-buffers-utils.js";

fabric.mediaRoot = "";

fabric.addNoCache = false;

fabric.loadImageAsBuffer = false; //used to create PDF images Cache

fabric.util.loadingTime = 0;

fabric.resources = {};

fabric.util.trustedDomains = [];

fabric.util.proxyURL = "";

fabric.util.getURL = function (url, sourceRoot) {
  if (fabric.util.proxyURL && /^(http|https)\:\/\//.test(url)) {
    if(fabric.util.trustedDomains.indexOf(new URL(url).hostname) === -1){
      url = fabric.util.proxyURL + url;
    }
  }
  if (url.match(/^(?!.\/|\/|\w+:).*/)) {
    if(sourceRoot !== false && sourceRoot !== undefined){
      url = sourceRoot + url
      if (url.match(/^(?!.\/|\/|\w+:).*/)) {
        url = fabric.mediaRoot + url;
      }
    }else{
      url = fabric.mediaRoot + url;
    }
  }

  if (fabric.addNoCache){//} && /^(http|https)\:\/\//.test(url)) {
    if(!url.includes("no-cache=")){
      let time = new Date().getTime();
      if(url.includes("?")){
        url += 'no-cache=' + time
      }
      else{
        url += '?no-cache=' + time
      }
    }
  }
  return url;
};

// fabric.util.loadResources = function (resources, callback, context, crossOrigin) {
//   let loadedResources = {};
//   let loader = new LoaderQueue({elements:Object.keys(resources).length, complete:function () {
//     callback(loadedResources);
//   }});
//   for (let i in resources) {
//     (function (i) {
//       fabric.util.loadImage(resources[i], function (image) {
//         loadedResources[i] = image;
//         loader();
//       }, context, crossOrigin);
//     }(i));
//   }
// };

fabric.util.loadImage = async function (originalUrl, callback, context, crossOrigin = 'anonymous') {
  // let time = new Date().getTime();
  let img  = await fabric.util.loadImagePromise(originalUrl, crossOrigin, context);
  if(img){
    img._src = originalUrl;
  }


  if(!img){
    if(fabric.nopic){
      img = await fabric.util.loadImagePromise(fabric.nopic, crossOrigin,context);
    }
    else {
      img = null;
    }
  }
  // let loadingTime = new Date().getTime() - time;
  // fabric.util.loadingTime += loadingTime;
  // fabric.util.timeDebug && console.log(`loading ${originalUrl}: ${loadingTime} ms`);

  callback && callback.call(context, img);
  return img;
};

fabric.util.loadSvg = function(originalUrl){
  let time = new Date().getTime();
  let url = fabric.util.getURL(originalUrl);

  return new Promise((resolve, reject) => {
    fabric.loadSVGFromURL(url,  (results, options) => {
      if (!results) {
        let xml = jQuery.parseXML(fabric.media.wanted);
        fabric.parseSVGDocument(xml.documentElement,  (results2, options2) => {
          resolve({objects: results2, options2});
        });
      }
      resolve({objects: results, options});
    },function(original, element){
      if(element.clipPath){
        if(element.clipPath.clipPath && element.clipPath.clipPath.constructor === String){
          delete element.clipPath.clipPath
        }
      }
    })

  }).then((data)=>{
    let loadingTime = new Date().getTime() - time;
    fabric.util.loadingTime += loadingTime;
    fabric.util.timeDebug && console.log(`loading ${originalUrl}: ${loadingTime} ms`);
    return data;
  })
};

fabric.util.loadImagePromise = function(originalUrl,crossOrigin = 'anonymous',context){
  let url = fabric.util.getURL(originalUrl);
  return new Promise((resolve, reject) => {
    let img = fabric.util.createImage();

    let timeout, rejected, resolved
    if(context && context.timeout){
      timeout = setTimeout(() => {
        if(resolved){
          onLoadCallback()
        }else{
          rejected = true
        }
      },context.timeout)
    }

    function onLoadCallback(){
      if ( context && context.timeout){
        // timeout && clearTimeout(timeout)
        if(resolved){

        }
        else if(rejected){
          console.warn("timeout rejected" + originalUrl)
        }
        else{
          resolved = true
          return;
        }
      }

      if(img.complete && img.naturalWidth !== 0 && img.naturalHeight !== 0 ){

        img.onload = img.onerror = null;

        if(fabric.debugTimeout){
          setTimeout(()=>{
            resolve(img)
          },fabric.debugTimeout)
        }else{
          resolve(img)
        }
      }
      else{
        console.log("WTF",img)
      }

    }

    if (url.indexOf('data') !== 0 && crossOrigin) {
      img.crossOrigin = crossOrigin;
    }

    if (url.startsWith('data:image/svg')) {
      img.onload = null;
      fabric.util.loadImageInDom(img, onLoadCallback);
    }
    else{
      img.onload = onLoadCallback;
    }

    img.onerror = function(){
      img.onload = img.onerror = null;
      reject();
    } ;

    if(fabric.loadImageAsBuffer){//fabric.pdf

      let resource = fabric.resources[originalUrl] = {
        observer: null,
        image: img,
        counter: 0,
        buffer: null,
        url: null
      }

      resource.promise = new Promise(async ()=>{
        try{
          let blob = await readAsBlob(url)
          let arrayBuffer = blob.arrayBuffer()

          let blobUrl = window.URL.createObjectURL(blob);
          img.src = blobUrl

          resource.buffer = arrayBuffer;
          resource.url = blobUrl;

          onLoadCallback()
          // fabric.util.fImageRegistry[url] = arrayBuffer;
          // img.src = window.URL.createObjectURL(blob);
          // if (img.naturalHeight) {
          //   setTimeout(onLoadCallback,0);
          // }
        } catch(e){
          console.error(e);
        }
      })

    }
    else{
      img.src = url;
      if (img.complete && img.naturalWidth !== 0 && img.naturalHeight !== 0) {
        setTimeout(onLoadCallback,0);
      }
    }
  })
  .catch(e => {
    console.error(e);
    return null
  })
};


fabric.util.loadVideo = function (sources, callback, context, crossOrigin = 'anonymous') {
  function loadIt(url) {
    video.src = fabric.util.getURL(url);
    video.addEventListener("loadeddata", function () {
      callback(video);
    }, true);
    video.load();
  }

  let video = document.createElement('video');

  //trying to find the most suitable source for current browser
  for (let type in sources) {
    if (video.canPlayType(type) === "yes") {
      this.mediaType = type;
      loadIt(sources[type]);
      return;
    }
  }
  for (let type in sources) {
    if (video.canPlayType(type) === "maybe") {
      this.mediaType = type;
      loadIt(sources[type]);
      return;
    }
  }
  console.warn("video sources formats is not supported")
}
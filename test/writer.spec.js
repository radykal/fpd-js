const path = require("path");
const fs = require("fs");
const fabric = require('../../src/fiera.js').fabric;
let request = require("request");
const { Image } = require('canvas');


function resolve(file){
  return "./media/samples/" + file;
}

describe("Images", function() {

  it("Buffer Remote test", done => {

    const img = new Image();
    request.get({url: "https://images-s3-dev.simplysay.sg/photo/5cfe57af30ccb.jpg", encoding: null}, (err, res, buffer) => {
      if (err) return done.fail("Buffer Remote test failed");
      img.src = buffer;
      expect(img.width).not.toBe(0);;
      done();
    });
  });

  it("Buffer test Local", done => {
    const img = new Image();

    fs.readFile(resolve("1.jpg"), (err, buffer) => {
      if (err) {
        return done.fail("Buffer Local test failed");
      }
      // img.onload = () => {
      //   expect(img.width).not.toBe(0);
      //   done();
      // };
      // img.onerror = () => {
      //   done.fail("Buffer Local test image error");
      // };
      img.src = buffer;
      expect(img.width).not.toBe(0);;
      done();
    });
  });

});

describe("Images", function() {

  it("JSDOM", done => {

    let jsdom = require('jsdom');
    let virtualWindow = new jsdom.JSDOM(decodeURIComponent('%3C!DOCTYPE%20html%3E%3Chtml%3E%3Chead%3E%3C%2Fhead%3E%3Cbody%3E%3C%2Fbody%3E%3C%2Fhtml%3E'), {features: {FetchExternalResources: ['img']}, resources: 'usable'}).window;
    let document = virtualWindow.document;
    let jsdomImplForWrapper = require('jsdom/lib/jsdom/living/generated/utils').implForWrapper;
    let nodeCanvas = require('jsdom/lib/jsdom/utils').Canvas;
    let DOMParser = virtualWindow.DOMParser;

    let canvas1  = document.createElement('canvas'),
        img1     = document.createElement('img'),
        context1 = canvas1.getContext("2d");

    img1.onload = function () {
      canvas1.width = img1.width;
      canvas1.height = img1.height;
      context1.drawImage(img1,0,0);
      let imgData = context1.getImageData(0,0,1,1);
      expect(imgData.data[0]).toBe(107);
      done();
    };
    img1.onerror = function() {
      done.fail('JSDOM Image Error');
    };

    img1.src =  resolve("1.jpg");
  });


  it("CreateImage test", done => {
    let img1     = fabric.util.createImage();

    img1.onload = function () {
      expect(img1).toBeRgb(107);
      done();
    };
    img1.onerror = function() {
      console.log('img1 Error ' + img1.src);
      done.fail("Image Loading Error");
    };
    img1.src = resolve("1.jpg");
  });

  it("JPG LOCAL", done => {
    fabric.util.loadImage(resolve("1.jpg"), image => {
      if(!image)done.fail("JPG was not loaded");
      image && expect(image.width).not.toBe(0);
      done();
    });
  });

  it("PNG LOCAL", done => {
    fabric.util.loadImage(resolve("5.png"), image => {
      if(!image)done.fail("JPG was not loaded");
      image && expect(image.width).not.toBe(0);
      done();
    });
  });

  it("WEBP LOCAL", done => {
    fabric.util.loadImage(resolve("5_webp_a.png"), image => {
      if(!image)done.fail("JPG was not loaded");
      image && expect(image.width).not.toBe(0);
      done();
    });
  });


  it("JPG images-s3-dev", done => {
    fabric.util.loadImage("https://images-s3-dev.simplysay.sg/photo/5cfe57af30ccb.jpg", image => {
      if(!image)done.fail("REMOTE JPG was not loaded");
      image && expect(image.width).not.toBe(0);
      done();
    });
  });

  it("PNG images-s3-dev", done => {
    fabric.util.loadImage("https://images-s3-dev.simplysay.sg/overlays/1552711764.png", image => {
      if(!image)done.fail("REMOTE PNG was not loaded");
      image && expect(image.width).not.toBe(0);
      done();
    });
  });

  /*it("should display single phase", function (done) {
    let expected = new Image();
    expected.src= "base/test/img/canvas.png";
    expected.onload(function(){
      let canvas = $('.canvas').get(0);
      let actual = canvas.getContext('2d').getImageData(0,0,canvas.width, canvas.height);
      expect(actual).toImageDiffEqual(expected, 2);
      done();
    });
  });*/

});




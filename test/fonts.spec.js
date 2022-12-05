const fs = require("fs");
const fabric = require('../../src/fiera.js').fabric;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

describe("Fonts", function() {

  it("Fonts test", done => {

    let fonts = {
      "Lucida Console"  : {  r: "lucon.ttf"},
      "Tahoma"          : {  r: "tahoma.ttf", b: "tahomabd.ttf"},
      "Arial"           : {  r: "arial.ttf", i: "ariali.ttf", b: "arialbd.ttf", bi: "arialbi.ttf"},
      "Arial Black"     : {  r: "ariblk.ttf"},
      "Times New Roman" : {  r: "times.ttf", i: "timesi.ttf", b: "timesbd.ttf", bi: "timesbi.ttf"},
      "Comic Sans MS"   : {  r: "comic.ttf", i: "comici.ttf", b: "comicbd.ttf", bi: "comicbi.ttf"},
      "Courier New"     : {  r: "cour.ttf", i: "couri.ttf", b: "courbd.ttf", bi: "courbi.ttf"},
      "Georgia"         : {  r: "georgia.ttf", i: "georgiai.ttf", b: "georgiab.ttf", bi: "georgiaz.ttf"},
      "Impact"          : {  r: "impact.ttf"},
      "SimSun"          : {  r: "simsun.ttf"}
    };

    let fontkit = require('fontkit');
    let ranges = {};
    for(var i in fonts){
      ranges[i] = getRange("./../fonts/standart/"+fonts[i].r)
    }
    let rangesStr = JSON.stringify(ranges);
    console.log(ranges);

    function getRange(fontFile){
      let format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
      let font = fontkit.openSync(fontFile);
      let set = font.characterSet;
      let intervals = [];

      let _start_seq_index = 0;
      for (let i = 1; i++ < set.length;) {
        if (set[i] > set[i - 1] + 1) {

          let char = String.fromCharCode(set[_start_seq_index]);
          if(format.test(char))char = "\\" + char;

          if (i === _start_seq_index + 1) {
            // intervals.push(`\\u${set[_start_seq_index].toString(16)}`);
            intervals.push(char);
          }
          else if (i === _start_seq_index + 2) {
            let char2 = String.fromCharCode(set[i - 1]);
            if(format.test(char2))char2 = "\\" + char2;
            let char3 = String.fromCharCode(set[i - 2]);
            if(format.test(char3))char3 = "\\" + char3;
            intervals.push(char + char3 + char2);
          }
          else {
            // intervals.push(`\\u${set[_start_seq_index].toString(16)}-\\u${set[i - 1].toString(16)}`);
            let char2 = String.fromCharCode(set[i - 1]);
            if(format.test(char2))char2 = "\\" + char2;
            intervals.push(char + "-" + char2);
          }
          _start_seq_index = i;
        }
      }
      return intervals.join("");
    }
  })
});
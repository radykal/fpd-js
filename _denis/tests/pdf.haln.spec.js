const PDFDocument = require('./../../src/pdf/pdfkit.node');
const Fontkit = require('./../../src/pdf/fontkit/index.js');
import OTLayoutEngine from './../../src/pdf/fontkit/src/opentype/OTLayoutEngine';
require('./../../src/plugins/debugObjects');


//https://stackoverflow.com/questions/45854169/how-can-i-use-an-es6-import-in-node
//node -r esm index.js

describe("Pdf", function() {

  it("PDFDocument", done => {

    let doc = new PDFDocument({compress: false, size : [642, 889]});

    doc.registerFont('Baloo Chettan', './../fonts/google/Baloo-Chettan 400.ttf');
    doc.registerFont('Kartika',       './../fonts/indic/kartika.ttf');
    // draw some text
    //  let pos = getTextPos(currentElem._font.font, currentElem._font.size, words[w]); разделяет на символы. потом пишет их по одному

    // doc.fontSize(40);


    doc.font('Kartika');

    let font1 = doc._font.font;
    let glyphs1 = font1.glyphsForString("യ്");
    let glyphRun1 = new Fontkit.GlyphRun(glyphs1, undefined, ["mlm2","mlym"], undefined, undefined);
    let engine1 = new OTLayoutEngine(font1);
    engine1.setup(glyphRun1);
    engine1.debugArray("glyphInfos");
    engine1.GSUBProcessor.applyFeatures(["haln"], engine1.glyphInfos, undefined);

    // engine1.substitute(glyphRun1);

    doc.font('Baloo Chettan');
    let font2 = doc._font.font;
    let glyphs2 = font2.glyphsForString("യ്");
    let glyphRun2 = new Fontkit.GlyphRun(glyphs2, undefined, ["mlm2","mlym"], undefined, undefined);
    let engine2 = new OTLayoutEngine(font2);
    engine2.setup(glyphRun2);
    engine2.debugArray("glyphInfos");
    // engine2.GSUBProcessor.applyFeatures(["pres","abvs","blws","psts","haln","dist","abvm","blwm","calt","clig","init","rlig","mark","mkmk","liga","rclt","curs","kern"], engine2.glyphInfos, undefined);
    engine2.GSUBProcessor.applyFeatures(["haln"], engine2.glyphInfos, undefined);
    expect(engine1.glyphInfos.length).toEqual(engine2.glyphInfos.length);
    done();
    return;



    // doc.font('Kartika');
    // doc.text('യ്', 200, 80);
    // doc.svg('<text font-family="Kartika"       font-size="40">യ്</text>', 200, 180,{assumePt: true});
    // doc.svg('<text font-family="Baloo Chettan"       font-size="40">യ്</text>', 200, 180,{assumePt: true});

    // doc.font('Baloo Chettan');
    // // doc.text('യ' + "്", 140, 80);
    // doc.svg('<text font-family="Baloo Chettan" font-size="40">യ്</text>', 100, 180,{assumePt: true});
    // let lengthBaloo = doc._font.encode("യ്")[0].length;
    // console.log(lengthBaloo);


    // let lengthKartika = doc._font.encode("യ്")[0].length;
    // console.log(lengthKartika);

    //this.addContent(`[${commands.join(' ')}] TJ`);g
    //[<00010002> 0] TJ
    // doc.text('യ്', 100, 80);

    //docWriteGlyph(pos[j].glyph);
    //doc.addContent('<' + glyph + '> Tj');

    if(false) {
      // some vector graphics
      doc.save().moveTo(100, 150).lineTo(100, 250).lineTo(200, 250).fill('#FF3300');
      doc.circle(280, 200, 50).fill('#6600FF');
      doc.scale(0.6).translate(470, 130).path('M 250,75 L 323,301 131,161 369,161 177,301 z').fill('red', 'even-odd').restore();


      // and some justified text wrapped into columns
      doc
        .text('And here is some wrapped text...', 100, 300)
        .fontSize(13)
        .moveDown()
        .text("Lorem ipsum dolor sit amet, consectetur adipiscing", {
          width: 412,
          align: 'justify',
          indent: 30,
          columns: 2,
          height: 300,
          ellipsis: true
        });

      doc.addPage();

      doc
        .fontSize(25)
        .text('And an image...')
        .image('./../media/1.jpg');

    }

    // end and display the document in the iframe to the right
    doc.end();

    let fs = require("fs");
    let file = fs.createWriteStream("xxx.pdf");
    file.on("finish", () => {
      done();
    });
    file.on("error", e => console.error(e));
    doc.pipe(file);

  });
});




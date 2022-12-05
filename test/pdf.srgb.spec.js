const PDFDocument = require('./../../src/pdf/pdfkit.node');
require('./../../src/plugins/debugObjects');
let fs = require("fs");


//https://stackoverflow.com/questions/45854169/how-can-i-use-an-es6-import-in-node
//node -r esm index.js

describe("Pdf", function() {

  it("32Bit", done => {
    let doc = new PDFDocument({compress: false, size : [642, 889]});
    doc.image('./media/Bitmap.png');
    doc.end();

    let file = fs.createWriteStream("export/Bitmap.pdf")
      .on("finish", () => {
        done();
      }).on("error", e => {
        console.error(e)
      });

    doc.pipe(file);
  });


  it("32Bit Interlaced", done => {
    let doc = new PDFDocument({compress: false, size : [642, 889]});
    doc.image('./media/Bitmap2.png');
    doc.end();

    let file = fs.createWriteStream("export/Bitmap2.pdf")
      .on("finish", () => {
        done();
      }).on("error", e => {
        console.error(e)
      });

    doc.pipe(file);
  });

  it("32Bit non-interlaced", done => {
    let doc = new PDFDocument({compress: false, size : [642, 889]});
    doc.image('./media/Bitmap3.png');
    doc.end();

    let file = fs.createWriteStream("export/Bitmap3.pdf")
      .on("finish", () => {
        done();
      }).on("error", e => {
        console.error(e)
      });

    doc.pipe(file);
  });

  it("SRGB JEWELL", done => {
    let doc = new PDFDocument({compress: false, size : [642, 889]});
    doc.image('./media/SRGB_TRANSPARENT.png');
    doc.end();

    let file = fs.createWriteStream("export/SRGB.pdf")
      .on("finish", () => {
        done();
      }).on("error", e => {
        console.error(e)
      });

    doc.pipe(file);
  });
  it("PNG32 JEWELL", done => {
    let doc = new PDFDocument({compress: false, size : [642, 889]});
    doc.image('./media/PNG32_TRANSPARENT.png');
    doc.end();

    let file = fs.createWriteStream("export/PNG32.pdf")
      .on("finish", () => {
        done();
      }).on("error", e => {
        console.error(e)
      });

    doc.pipe(file);
  });
});




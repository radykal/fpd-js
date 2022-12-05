const PDFDocument = require('./../../src/pdf/pdfkit.node').PDFDocument;
require('./../../src/plugins/debugObjects');
let fs = require("fs");

describe("Pdf", function() {

  it("Simple", done => {
    let doc = new PDFDocument({compress: false, size : [642, 889]});

    let grad = doc.linearGradient(50, 0, 150, 100);
    grad.stop(0, 'green');
    grad.stop(1, 'red');

    doc.rect(50, 0, 100, 100);
    doc.fill(grad);


    grad = doc.linearGradient(150, 0, 250, 100);
    grad.stop(0, 'green');
    grad.stop(0.5, 'yellow');
    grad.stop(1, 'red');
    grad.stop(1, 'red');
    doc.rect(150, 0, 100, 100);
    doc.fill(grad);


    grad = doc.linearGradient(0, 150, 150, 250);
    grad.stop(0, "red");
    grad.stop(0.2, "orange");
    grad.stop(0.4, "yellow");
    grad.stop(0.6, "green");
    grad.stop(0.8, "blue");
    grad.stop(1, "purple");
    doc.rect(150, 150, 100, 100);
    doc.fill(grad);



    grad = doc.linearGradient(150, 150, 250, 250);
    grad.stop(0, "red");
    grad.stop(0.2, "orange");
    grad.stop(0.4, "yellow");
    grad.stop(0.6, "green");
    grad.stop(0.8, "blue");
    grad.stop(1, "purple");
    grad.stop(1, "purple");
    doc.rect(150, 150, 100, 100);
    doc.fill(grad);



    grad = doc.linearGradient(250, 150, 350, 250);
    grad.stop(0, "red",1);
    grad.stop(0.5, "green",0.5);
    grad.stop(1, "blue",1);
    grad.stop(1, "blue",1);
    doc.rect(250, 150, 100, 100);
    doc.fill(grad);


// Create a radial gradient
    grad = doc.radialGradient(300, 50, 0, 300, 50, 50);
    grad.stop(0, 'orange', 0);
    grad.stop(1, 'orange', 1);

    doc.circle(300, 50, 50);
    doc.fill(grad);
    doc.end();

    let file = fs.createWriteStream("./../demo/export/gradients-test.pdf")
      .on("finish", () => {
        done();
      }).on("error", e => {
        console.error(e)
      });

    doc.pipe(file);
  });
});




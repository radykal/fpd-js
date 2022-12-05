// var sharp = require('sharp');
import jimp from 'jimp'
import fs from 'fs'
import path from 'path'

fabric.express.imageResizeWithJimp = function (inputFile, outputFile, width, height, res) {

    jimp.read(inputFile)
        .then(lenna => {
            return lenna
                .resize(width, height) // resize
                .quality(60) // set JPEG quality
                .write(outputFile); // save]
        })
        .then(() => {
            res.sendFile(outputFile);
        })
        .catch(err => {
            if (err) {
                res.status(400).json({message: err.message});
            }
        });
};

fabric.express.imageResizeWithSharp = function (inputFile, outputFile, width, height, res) {
    sharp(inputFile)
        .resize(width, height)
        .toFile(outputFile, function (err) {
            if (err) {
                res.status(400).json({message: err.message});
                return;
            }
            res.sendFile(outputFile);
        });
};

fabric.express.setters.imageThubmnails = function (value) {
    this.app.use(value + "/*", (req, res) => {
        let src = req.params[0];
        let inputFile = path.resolve(fabric.node.directories.media + src);
        let outputFile = path.resolve(fabric.node.directories.media + "thumbnails/" + src.substring(0, src.lastIndexOf('.')) + ".png");

        if (fs.existsSync(outputFile)) {
            res.sendFile(outputFile);
            return;
        }
        if (!fs.existsSync(inputFile)) {
            res.sendStatus(404);
            return;
        }

        let width = (req.query.w && /^\d+$/.test(req.query.w)) ? +req.query.w : 150;
        let height = (req.query.h && /^\d+$/.test(req.query.h)) ? +req.query.h : 150;
        fabric.express.ensureDirectoryExistence(outputFile);
        fabric.express.imageResizeWithJimp(inputFile, outputFile, width, height, res)
    });
};

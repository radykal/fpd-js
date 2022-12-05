import fabric from './fabric/main.js'
import './node/document.js'
import './fiera.js'

import PDFDocument from './../plugins/pdfkit-node.js'
fabric.PDFDocument = PDFDocument;

import './node/fromURL.js'
import './fonts/fonts.node.js'
import './node/node.core.js'
import './node/node.export.js'
import './node/node.express.js'
import './node/node.thumbnails.js'
import './node/node.shutterstock.js'
import './node/node.s3.js'
export default fabric;

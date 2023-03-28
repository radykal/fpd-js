// https://github.com/Fingertips/Worf/blob/master/dist/convert.js
var WORF = {
  VERSION: "0.1.0",

  font_face: function() {
    if (WORF.worfable()) {
      var length = arguments.length / 2;
      var url, rules;
      while(length--) {
        url = arguments[length*2];
        rules = arguments[length*2+1];
        WORF._font_face(url, rules);
      }
      WORF.Caching.cleanup();
    }
  },

  _font_face: function(url, rules) {
    var sfnt = WORF.Caching.get(url);
    if (!sfnt) {
      WORF.Converter.woffToSfntAsBase64(url, function(base64, flavor) {
        WORF.define_font_face(flavor, base64, rules);
        WORF.Caching.set(url, flavor, base64);
      });
    } else {
      sfnt.push(rules);
      WORF.define_font_face.apply(this, sfnt);
    }
  },

  define_font_face: function(flavor, base64, rules) {
    var declaration = WORF.Converter.fontFaceDeclaration(flavor, base64, rules);
    var style = document.createElement('style');
    style.innerHTML = declaration;
    document.head.appendChild(style);
  },

  worfable: function() {
    var ua = navigator.userAgent, version;
    if (version = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)) {
      return version[1] >= '4.0.249.4' && version[1] < '5.0';
    }
    if (version = ua.match(/Safari\/(\d+\.\d+)/)) {
      if (ua.indexOf('(iPhone') > -1 || ua.indexOf('(iPad') > -1 || ua.indexOf('(iPod') > -1) {
        return version[1] >= '533.17.9';
      } else {
        return version[1] >= '525.13';
      }
    }
    if (/Opera/.test({}.toString.call(window.opera))) {
      return opera.version() >= '10.00' && opera.version() < '11.00';
    }
    if (version = ua.match(/rv:(\d+\.\d+\.\d+)[^b].*Gecko\//)) {
      return parsed[1] >= '1.9.1';
    }
    return false;
  }
}

WORF.Converter = {
  fontFaceDeclaration: function(flavor, data, rules) {
    return("@font-face {                                                                                         \
      src: url(//:) format('no404'), url(data:font/"+flavor+";charset=utf-8;base64,"+data+") format("+flavor+"); \
      "+rules+"                                                                                                  \
    }");
  },

  load: function(url, callback) {
    var request = new XMLHttpRequest();
    request.overrideMimeType('text/plain; charset=x-user-defined');
    request.onreadystatechange = function() {
      if (request.readyState == 4) {
        callback(request.responseText);
      }
    };
    request.open('GET', url, true);
    request.send(null);
  },

  fromUint16: function(data) {
    return (data[0] << 8) + data[1];
  },

  fromUint32: function(data) {
    return (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];
  },

  toUint16: function(value) {
    return [(value & 0xff00) >> 8, value & 0xff]
  },

  toUint32: function(value) {
    return [(value & 0xff000000) >> 24, (value & 0xff0000) >> 16, (value & 0xff00) >> 8, value & 0xff]
  },

  woffToSfntAsBase64: function(src, callback) {
    this.load(src, function(woff) {
      callback(btoa(WORF.Converter.woffToSfnt(woff)), WORF.Converter.woffFlavor(woff));
    });
  },

  lowestPower: function(entries) {
    var lowestPower = entries;
    lowestPower |= (lowestPower >> 1);
    lowestPower |= (lowestPower >> 2);
    lowestPower |= (lowestPower >> 4);
    lowestPower |= (lowestPower >> 8);
    lowestPower &= ~(lowestPower >> 1);
    return lowestPower;
  },

  stringToByteArray: function(data) {
    var index  = 0;
    var buffer = [];
    while(index < data.length)
      buffer[index] = data.charCodeAt(index++) & 0xff;
    return buffer;
  },

  cleanup: function(data) {
    return String.fromCharCode.apply(this, this.stringToByteArray(data));
  },

  woffFlavor: function(data) {
    var flavor = this.fromUint32(this.stringToByteArray(data.slice(4, 8)));
    switch(flavor) {
      case 0x00010000:
        return 'truetype';
      case 0x4f54544f:
        return 'opentype';
      default:
        throw "Unknown font type";
    }
  },

  woffToSfnt: function(data) {
    var sfntHeader = [];
    var sfntData = '';
    var woffDirectory = {};
    var entries = this.fromUint16(this.stringToByteArray(data.slice(12, 14)));
    var lowestPower = this.lowestPower(entries);
    var woffHeader = this.stringToByteArray(data.slice(0,44));

    sfntHeader = sfntHeader.concat(woffHeader.slice(4, 8)); // version
    sfntHeader = sfntHeader.concat(woffHeader.slice(12, 14)); // numTables
    sfntHeader = sfntHeader.concat(this.toUint16(lowestPower*16)); // searchRange;
    sfntHeader = sfntHeader.concat(this.toUint16(Math.log(lowestPower) / Math.LN2)) // entrySelector
    sfntHeader = sfntHeader.concat(this.toUint16((entries * 16) - (lowestPower * 16))); // rangeShift

    var sfntDataOffset = 12 + (entries * 16);
    var sfntTag, rawSfntTag, woffEntryOffset, sfntTableSize, sfntTablePadding;
    var directoryKeys = [];
    var woffEntry;

    for (var entryIndex = 0; entryIndex < entries; entryIndex++) {

      woffEntryOffset = 44 + (entryIndex * 20);
      woffEntry = this.stringToByteArray(data.slice(woffEntryOffset, woffEntryOffset+20));

      sfntTableSize = this.fromUint32(woffEntry.slice(12, 16)); // size
      rawSfntTag = woffEntry.slice(0, 4)
      sfntTag = this.fromUint32(rawSfntTag);

      woffDirectory[sfntTag] = {};
      woffDirectory[sfntTag].rawTag = rawSfntTag;
      woffDirectory[sfntTag].woffEntryOffset = woffEntryOffset;
      woffDirectory[sfntTag].checksum = woffEntry.slice(16, 20); // checksum
      woffDirectory[sfntTag].offset = sfntDataOffset;
      woffDirectory[sfntTag].length = sfntTableSize;
      directoryKeys.push(sfntTag);

      sfntTablePadding = (Math.ceil(sfntTableSize / 4.0) * 4) - sfntTableSize;
      sfntDataOffset += sfntTableSize + sfntTablePadding;

      var woffDataOffset = this.fromUint32(woffEntry.slice(4, 8)); // offset
      var woffDataCompressedSize = this.fromUint32(woffEntry.slice(8, 12)); // compSize

      if (sfntTableSize > woffDataCompressedSize) {
        var unpacked = (new WORF.Util.Unzip(this.stringToByteArray(data.slice(woffDataOffset, woffDataOffset + woffDataCompressedSize)))).unzip();
        sfntData += unpacked[0][0]; // Bad data breaks at this line
      } else {
        sfntData += this.cleanup(data.slice(woffDataOffset, woffDataOffset + woffDataCompressedSize));
      }
      for (var index = 0; index < sfntTablePadding; index++) { sfntData += String.fromCharCode(0); };
    }

    var entry;
    directoryKeys = directoryKeys.sort();
    for (var entryIndex = 0; entryIndex < directoryKeys.length; entryIndex++) {
      entry = woffDirectory[directoryKeys[entryIndex]];
      sfntHeader = sfntHeader.concat(entry.rawTag); // tag
      sfntHeader = sfntHeader.concat(entry.checksum); // checksum
      sfntHeader = sfntHeader.concat(this.toUint32(entry.offset)); // offset
      sfntHeader = sfntHeader.concat(this.toUint32(entry.length)); // length
    }

    return(String.fromCharCode.apply(this, sfntHeader) + sfntData);
  }
};

WORF.Caching = {
  baseKey: function(url) {
    return('worf.' + url);
  },

  get: function(url) {
    var baseKey = WORF.Caching.baseKey(url);
    if (localStorage[baseKey + '.timestamp']) {
      return([
        localStorage[baseKey + '.flavor'],
        localStorage[baseKey + '.base64']
      ]);
    }
  },

  set: function(url, flavor, base64) {
    var baseKey = WORF.Caching.baseKey(url);
    localStorage[baseKey + '.timestamp'] = (new Date()).getTime();
    localStorage[baseKey + '.flavor'] = flavor;
    localStorage[baseKey + '.base64'] = base64;
  },

  maxAge: 3600*24*1000,

  cleanup: function() {
    var match, now, timestamp, baseKey;
    for (key in localStorage) {
      if (match = key.match(/^worf\.(.*)\.timestamp$/)) {
        now = (new Date()).getTime();
        timestamp = parseInt(localStorage[key]);
        if (now - timestamp > WORF.Caching.maxAge) {
          baseKey = 'worf.'+match[1];
          localStorage.removeItem(baseKey+'.timestamp');
          localStorage.removeItem(baseKey+'.flavor');
          localStorage.removeItem(baseKey+'.base64');
        }
      }
    }
  }
}

WORF.Util = {};
WORF.Util.Unzip = function (barray){
    var outputArr = [],
        output = "",
        debug = false,
        gpflags,
        files = 0,
        unzipped = [],
        crc,
        buf32k = new Array(32768),
        bIdx = 0,
        modeZIP=false,

        CRC, SIZE,

        bitReverse = [
        0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0,
        0x10, 0x90, 0x50, 0xd0, 0x30, 0xb0, 0x70, 0xf0,
        0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8,
        0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8,
        0x04, 0x84, 0x44, 0xc4, 0x24, 0xa4, 0x64, 0xe4,
        0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4,
        0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec,
        0x1c, 0x9c, 0x5c, 0xdc, 0x3c, 0xbc, 0x7c, 0xfc,
        0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2,
        0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2,
        0x0a, 0x8a, 0x4a, 0xca, 0x2a, 0xaa, 0x6a, 0xea,
        0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa,
        0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6,
        0x16, 0x96, 0x56, 0xd6, 0x36, 0xb6, 0x76, 0xf6,
        0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee,
        0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe,
        0x01, 0x81, 0x41, 0xc1, 0x21, 0xa1, 0x61, 0xe1,
        0x11, 0x91, 0x51, 0xd1, 0x31, 0xb1, 0x71, 0xf1,
        0x09, 0x89, 0x49, 0xc9, 0x29, 0xa9, 0x69, 0xe9,
        0x19, 0x99, 0x59, 0xd9, 0x39, 0xb9, 0x79, 0xf9,
        0x05, 0x85, 0x45, 0xc5, 0x25, 0xa5, 0x65, 0xe5,
        0x15, 0x95, 0x55, 0xd5, 0x35, 0xb5, 0x75, 0xf5,
        0x0d, 0x8d, 0x4d, 0xcd, 0x2d, 0xad, 0x6d, 0xed,
        0x1d, 0x9d, 0x5d, 0xdd, 0x3d, 0xbd, 0x7d, 0xfd,
        0x03, 0x83, 0x43, 0xc3, 0x23, 0xa3, 0x63, 0xe3,
        0x13, 0x93, 0x53, 0xd3, 0x33, 0xb3, 0x73, 0xf3,
        0x0b, 0x8b, 0x4b, 0xcb, 0x2b, 0xab, 0x6b, 0xeb,
        0x1b, 0x9b, 0x5b, 0xdb, 0x3b, 0xbb, 0x7b, 0xfb,
        0x07, 0x87, 0x47, 0xc7, 0x27, 0xa7, 0x67, 0xe7,
        0x17, 0x97, 0x57, 0xd7, 0x37, 0xb7, 0x77, 0xf7,
        0x0f, 0x8f, 0x4f, 0xcf, 0x2f, 0xaf, 0x6f, 0xef,
        0x1f, 0x9f, 0x5f, 0xdf, 0x3f, 0xbf, 0x7f, 0xff
    ],

    cplens = [
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
        35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
    ],

    cplext = [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
        3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99
    ], /* 99==invalid */

    cpdist = [
        0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d,
        0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1,
        0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01,
        0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001
    ],

    cpdext = [
        0,  0,  0,  0,  1,  1,  2,  2,
        3,  3,  4,  4,  5,  5,  6,  6,
        7,  7,  8,  8,  9,  9, 10, 10,
        11, 11, 12, 12, 13, 13
    ],

    border = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],

    bA = barray,

    bytepos=0,
    bitpos=0,
    bb = 1,
    bits=0,

    NAMEMAX = 256,

    nameBuf = [],

    fileout;

    function readByte(){
        bits+=8;
        if (bytepos<bA.length){
            return bA[bytepos++];
        } else
            return -1;
    };

    function byteAlign(){
        bb = 1;
    };

    function readBit(){
        var carry;
        bits++;
        carry = (bb & 1);
        bb >>= 1;
        if (bb==0){
            bb = readByte();
            carry = (bb & 1);
            bb = (bb>>1) | 0x80;
        }
        return carry;
    };

    function readBits(a) {
        var res = 0,
            i = a;

        while(i--) {
            res = (res<<1) | readBit();
        }
        if(a) {
            res = bitReverse[res]>>(8-a);
        }
        return res;
    };

    function flushBuffer(){
        bIdx = 0;
    };
    function addBuffer(a){
        SIZE++;
        buf32k[bIdx++] = a;
        outputArr.push(String.fromCharCode(a));
        if(bIdx==0x8000){
            bIdx=0;
        }
    };

    function HufNode() {
        this.b0=0;
        this.b1=0;
        this.jump = null;
        this.jumppos = -1;
    };

    var LITERALS = 288;

    var literalTree = new Array(LITERALS);
    var distanceTree = new Array(32);
    var treepos=0;
    var Places = null;
    var Places2 = null;

    var impDistanceTree = new Array(64);
    var impLengthTree = new Array(64);

    var len = 0;
    var fpos = new Array(17);
    fpos[0]=0;
    var flens;
    var fmax;

    function IsPat() {
      while (1) {
        if (fpos[len] >= fmax)
          return -1;
        if (flens[fpos[len]] == len)
          return fpos[len]++;
        fpos[len]++;
      }
    };

    function Rec() {
        var curplace = Places[treepos];
        var tmp;
        if(len==17) { //war 17
            return -1;
        }
        treepos++;
        len++;

        tmp = IsPat();
        if(tmp >= 0) {
            curplace.b0 = tmp;    /* leaf cell for 0-bit */
        } else {
        /* Not a Leaf cell */
        curplace.b0 = 0x8000;
        if(Rec())
            return -1;
        }
        tmp = IsPat();
        if(tmp >= 0) {
            curplace.b1 = tmp;    /* leaf cell for 1-bit */
            curplace.jump = null;    /* Just for the display routine */
        } else {
            /* Not a Leaf cell */
            curplace.b1 = 0x8000;
            curplace.jump = Places[treepos];
            curplace.jumppos = treepos;
            if(Rec())
                return -1;
        }
        len--;
        return 0;
    };

    function CreateTree(currentTree, numval, lengths, show) {
      var i;
      /* Create the Huffman decode tree/table */
      Places = currentTree;
      treepos=0;
      flens = lengths;
      fmax  = numval;
      for (i=0;i<17;i++)
          fpos[i] = 0;
      len = 0;
      if(Rec()) {
          return -1;
      }
      return 0;
    };

    function DecodeValue(currentTree) {
        var len, i,
            xtreepos=0,
            X = currentTree[xtreepos],
            b;

        /* decode one symbol of the data */
        while(1) {
            b=readBit();
            if(b) {
                if(!(X.b1 & 0x8000)){
                    return X.b1;    /* If leaf node, return data */
                }
                X = X.jump;
                len = currentTree.length;
                for (i=0;i<len;i++){
                    if (currentTree[i]===X){
                        xtreepos=i;
                        break;
                    }
                }
            } else {
                if(!(X.b0 & 0x8000)){
                    return X.b0;    /* If leaf node, return data */
                }
                xtreepos++;
                X = currentTree[xtreepos];
            }
        }
        return -1;
    };

    function DeflateLoop() {
    var last, c, type, i, len;

    do {
        last = readBit();
        type = readBits(2);
        if(type==0) {
            var blockLen, cSum;

            byteAlign();
            blockLen = readByte();
            blockLen |= (readByte()<<8);

            cSum = readByte();
            cSum |= (readByte()<<8);

            if(((blockLen ^ ~cSum) & 0xffff)) {
                console.log("BlockLen checksum mismatch");
            }
            while(blockLen--) {
                c = readByte();
                addBuffer(c);
            }
        } else if(type==1) {
            var j;

            /* Fixed Huffman tables -- fixed decode routine */
            while(1) {
            /*
                256    0000000        0
                :   :     :
                279    0010111        23
                0   00110000    48
                :    :      :
                143    10111111    191
                280 11000000    192
                :    :      :
                287 11000111    199
                144    110010000    400
                :    :       :
                255    111111111    511

                Note the bit order!
                */

            j = (bitReverse[readBits(7)]>>1);
            if(j > 23) {
                j = (j<<1) | readBit();    /* 48..255 */

                if(j > 199) {    /* 200..255 */
                    j -= 128;    /*  72..127 */
                    j = (j<<1) | readBit();        /* 144..255 << */
                } else {        /*  48..199 */
                    j -= 48;    /*   0..151 */
                    if(j > 143) {
                        j = j+136;    /* 280..287 << */
                        /*   0..143 << */
                    }
                }
            } else {    /*   0..23 */
                j += 256;    /* 256..279 << */
            }
            if(j < 256) {
                addBuffer(j);
            } else if(j == 256) {
                /* EOF */
                break;
            } else {
                var len, dist;

                j -= 256 + 1;    /* bytes + EOF */
                len = readBits(cplext[j]) + cplens[j];

                j = bitReverse[readBits(5)]>>3;
                if(cpdext[j] > 8) {
                    dist = readBits(8);
                    dist |= (readBits(cpdext[j]-8)<<8);
                } else {
                    dist = readBits(cpdext[j]);
                }
                dist += cpdist[j];

                for(j=0;j<len;j++) {
                    var c = buf32k[(bIdx - dist) & 0x7fff];
                    addBuffer(c);
                }
            }
            } // while
        } else if(type==2) {
            var j, n, literalCodes, distCodes, lenCodes;
            var ll = new Array(288+32);    // "static" just to preserve stack


            literalCodes = 257 + readBits(5);
            distCodes = 1 + readBits(5);
            lenCodes = 4 + readBits(4);
            for(j=0; j<19; j++) {
                ll[j] = 0;
            }

            for(j=0; j<lenCodes; j++) {
                ll[border[j]] = readBits(3);
            }
            len = distanceTree.length;
            for (i=0; i<len; i++)
                distanceTree[i]=new HufNode();
            if(CreateTree(distanceTree, 19, ll, 0)) {
                flushBuffer();
                return 1;
            }

            n = literalCodes + distCodes;
            i = 0;
            var z=-1;
            while(i < n) {
                z++;
                j = DecodeValue(distanceTree);
                if(j<16) {    // length of code in bits (0..15)
                       ll[i++] = j;
                } else if(j==16) {    // repeat last length 3 to 6 times
                       var l;
                    j = 3 + readBits(2);
                    if(i+j > n) {
                        flushBuffer();
                        return 1;
                    }
                    l = i ? ll[i-1] : 0;
                    while(j--) {
                        ll[i++] = l;
                    }
                } else {
                    if(j==17) {        // 3 to 10 zero length codes
                        j = 3 + readBits(3);
                    } else {        // j == 18: 11 to 138 zero length codes
                        j = 11 + readBits(7);
                    }
                    if(i+j > n) {
                        flushBuffer();
                        return 1;
                    }
                    while(j--) {
                        ll[i++] = 0;
                    }
                }
            }
            len = literalTree.length;
            for (i=0; i<len; i++)
                literalTree[i]=new HufNode();
            if(CreateTree(literalTree, literalCodes, ll, 0)) {
                flushBuffer();
                return 1;
            }
            len = literalTree.length;
            for (i=0; i<len; i++)
                distanceTree[i]=new HufNode();
            var ll2 = new Array();
            for (i=literalCodes; i <ll.length; i++){
                ll2[i-literalCodes]=ll[i];
            }
            if(CreateTree(distanceTree, distCodes, ll2, 0)) {
                flushBuffer();
                return 1;
            }
            while(1) {
                j = DecodeValue(literalTree);
                if(j >= 256) {        // In C64: if carry set
                    var len, dist;
                    j -= 256;
                    if(j == 0) {
                        break;
                    }
                    j--;
                    len = readBits(cplext[j]) + cplens[j];

                    j = DecodeValue(distanceTree);
                    if(cpdext[j] > 8) {
                        dist = readBits(8);
                        dist |= (readBits(cpdext[j]-8)<<8);
                    } else {
                        dist = readBits(cpdext[j]);
                    }
                    dist += cpdist[j];
                    while(len--) {
                        var c = buf32k[(bIdx - dist) & 0x7fff];
                        addBuffer(c);
                    }
                } else {
                    addBuffer(j);
                }
            }
        }
    } while(!last);
    flushBuffer();

    byteAlign();
    return 0;
};

WORF.Util.Unzip.prototype.unzip = function() {
    nextFile();
    return unzipped;
};

function nextFile(){
  outputArr = [];
  var tmp = [];
  modeZIP = false;
  tmp[0] = readByte();
  tmp[1] = readByte();
  if (tmp[0] == parseInt("78",16) && tmp[1] == parseInt("da",16)){ //GZIP
    DeflateLoop();
    unzipped[files] = new Array(2);
      unzipped[files][0] = outputArr.join('');
      unzipped[files][1] = "geonext.gxt";
      files++;
  }
  if (tmp[0] == parseInt("1f",16) && tmp[1] == parseInt("8b",16)){ //GZIP
    skipdir();
    unzipped[files] = new Array(2);
      unzipped[files][0] = outputArr.join('');
      unzipped[files][1] = "file";
      files++;
  }
  if (tmp[0] == parseInt("50",16) && tmp[1] == parseInt("4b",16)){ //ZIP
    modeZIP = true;
    tmp[2] = readByte();
    tmp[3] = readByte();
    if (tmp[2] == parseInt("3",16) && tmp[3] == parseInt("4",16)){
      tmp[0] = readByte();
      tmp[1] = readByte();

      gpflags = readByte();
      gpflags |= (readByte()<<8);

      var method = readByte();
      method |= (readByte()<<8);

      readByte();
      readByte();
      readByte();
      readByte();

      var crc = readByte();
      crc |= (readByte()<<8);
      crc |= (readByte()<<16);
      crc |= (readByte()<<24);

      var compSize = readByte();
      compSize |= (readByte()<<8);
      compSize |= (readByte()<<16);
      compSize |= (readByte()<<24);

      var size = readByte();
      size |= (readByte()<<8);
      size |= (readByte()<<16);
      size |= (readByte()<<24);

      var filelen = readByte();
      filelen |= (readByte()<<8);

      var extralen = readByte();
      extralen |= (readByte()<<8);

      i = 0;
      nameBuf = [];
      while (filelen--){
        var c = readByte();
        if (c == "/" | c ==":"){
          i = 0;
        } else if (i < NAMEMAX-1)
          nameBuf[i++] = String.fromCharCode(c);
      }

      if (!fileout)
        fileout = nameBuf;

      var i = 0;
      while (i < extralen){
        c = readByte();
        i++;
      }

      CRC = 0xffffffff;
      SIZE = 0;

      if (method == 8){
        DeflateLoop();
        unzipped[files] = new Array(2);
        unzipped[files][0] = outputArr.join('');
        unzipped[files][1] = nameBuf.join('');
        files++;
      }
      skipdir();
    }
  }
 };

function skipdir(){
    var crc,
        tmp = [],
        compSize, size, os, i, c;

  if ((gpflags & 8)) {
    tmp[0] = readByte();
    tmp[1] = readByte();
    tmp[2] = readByte();
    tmp[3] = readByte();

    if (tmp[0] == parseInt("50",16) &&
            tmp[1] == parseInt("4b",16) &&
            tmp[2] == parseInt("07",16) &&
            tmp[3] == parseInt("08",16))
        {
            crc = readByte();
            crc |= (readByte()<<8);
            crc |= (readByte()<<16);
            crc |= (readByte()<<24);
    } else {
      crc = tmp[0] | (tmp[1]<<8) | (tmp[2]<<16) | (tmp[3]<<24);
    }

    compSize = readByte();
    compSize |= (readByte()<<8);
    compSize |= (readByte()<<16);
    compSize |= (readByte()<<24);

    size = readByte();
    size |= (readByte()<<8);
    size |= (readByte()<<16);
    size |= (readByte()<<24);
  }

  if (modeZIP)
    nextFile();

  tmp[0] = readByte();
  if (tmp[0] != 8) {
    return 0;
  }

  gpflags = readByte();

  readByte();
  readByte();
  readByte();
  readByte();

  readByte();
  os = readByte();

  if ((gpflags & 4)){
    tmp[0] = readByte();
    tmp[2] = readByte();
    len = tmp[0] + 256*tmp[1];
    for (i=0;i<len;i++)
      readByte();
  }

  if ((gpflags & 8)){
    i=0;
    nameBuf=[];
    while (c=readByte()){
      if(c == "7" || c == ":")
        i=0;
      if (i<NAMEMAX-1)
        nameBuf[i++] = c;
    }
  }

  if ((gpflags & 16)) {
    while (c=readByte()) {}
  }

  if ((gpflags & 2)){
    readByte();
    readByte();
  }

  DeflateLoop();

  crc = readByte();
  crc |= (readByte()<<8);
  crc |= (readByte()<<16);
  crc |= (readByte()<<24);

  size = readByte();
  size |= (readByte()<<8);
  size |= (readByte()<<16);
  size |= (readByte()<<24);

  if (modeZIP)
    nextFile();

};

};

/**
*  Base64 encoding / decoding
*  @see <a href="http://www.webtoolkit.info/">http://www.webtoolkit.info/</A>
*/
WORF.Util.Base64 = {
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  encode : function (input) {
    var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output.push([this._keyStr.charAt(enc1),
                   this._keyStr.charAt(enc2),
                   this._keyStr.charAt(enc3),
                   this._keyStr.charAt(enc4)].join(''));
    }
    return output.join('');
  }
};

module.exports = WORF;
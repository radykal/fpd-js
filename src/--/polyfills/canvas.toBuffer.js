// var toBuffer = require('typedarray-to-buffer')

/**
 * Convert a typed array to a Buffer without a copy
 *
 * Author:   Feross Aboukhadijeh <https://feross.org>
 * License:  MIT
 *
 * `npm install typedarray-to-buffer`
 */

var toString = Object.prototype.toString
var names = {
    '[object Int8Array]': true
    , '[object Int16Array]': true
    , '[object Int32Array]': true
    , '[object Uint8Array]': true
    , '[object Uint8ClampedArray]': true
    , '[object Uint16Array]': true
    , '[object Uint32Array]': true
    , '[object Float32Array]': true
    , '[object Float64Array]': true
}

function isTypedArray(arr) {
    return (
        isStrictTypedArray(arr)
        || isLooseTypedArray(arr)
    )
}

function isStrictTypedArray(arr) {
    return (
        arr instanceof Int8Array
        || arr instanceof Int16Array
        || arr instanceof Int32Array
        || arr instanceof Uint8Array
        || arr instanceof Uint8ClampedArray
        || arr instanceof Uint16Array
        || arr instanceof Uint32Array
        || arr instanceof Float32Array
        || arr instanceof Float64Array
    )
}

function isLooseTypedArray(arr) {
    return names[toString.call(arr)]
}


// var isTypedArray = require('is-typedarray').strict
function typedArrayToBuffer (arr) {
    if (isTypedArray(arr)) {
        // To avoid a copy, use the typed array's underlying ArrayBuffer to back new Buffer
        var buf = Buffer.from(arr.buffer)
        if (arr.byteLength !== arr.buffer.byteLength) {
            // Respect the "view", i.e. byteOffset and byteLength, without doing a copy
            buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)
        }
        return buf
    } else {
        // Pass through all other types to `Buffer.from`
        return Buffer.from(arr)
    }
}

//
// module.exports      = isTypedArray
// isTypedArray.strict = isStrictTypedArray
// isTypedArray.loose  = isLooseTypedArray
var atob = function atob(str) {
    return new Buffer(str, 'base64').toString('binary');
}

var isBrowser = typeof document !== 'undefined' && typeof document.createElement === 'function';

// cached, used only once for browser environments
var verifiedImageType

export default function canvasToBuffer (canvas, options) {
    var self = this

    options = options || {}
    options.image = options.image ? options.image : {}
    options.image.types = options.image.types ? options.image.types : []

    // validate some options this class needs
    if (options.image.types.length > 2) {
        throw new Error('Too many image types are specified!')
    } else if (options.image.types.length < 1) {
        // Set a default image type, just to be robust
        options.image.types = isBrowser ? ['webp', 'jpeg'] : ['png']
    }

    if (!options.image.quality) {
        options.image.quality = 0.5 // default
    }

    var quality = parseFloat(options.image.quality)

    function composeImageType (index) {
        var imageType

        if (options.image.types[index]) {
            imageType = 'image/' + options.image.types[index]
        }

        return imageType
    }

    function isMatch (uri, imageType) {
        var match = uri && uri.match(imageType)

        match && options.debug && options.debug('Image type %s verified', imageType)

        return match
    }

    // Performance tweak, we do not need a big canvas for finding out the supported image type
    function getTestCanvas () {
        var testCanvas

        if (isBrowser) {
            testCanvas = document.createElement('canvas')
            testCanvas.width = testCanvas.height = 1
        } else {
            testCanvas = canvas
        }

        return testCanvas
    }

    function canvasSupportsImageTypeAsync (imageType, cb) {
        try {
            getTestCanvas().toDataURL(imageType, function (err, uri) {
                if (err) {
                    cb(err)
                } else {
                    cb(null, isMatch(uri, imageType))
                }
            })
        } catch (exc) {
            cb(null, false)
        }
    }

    function canvasSupportsImageTypeSync (imageType) {
        var match

        try {
            var testCanvas = getTestCanvas()
            var uri = testCanvas.toDataURL && testCanvas.toDataURL(imageType)

            match = isMatch(uri, imageType)
        } catch (exc) {
            // Can happen when i.E. a spider is coming. Just be robust here and continue.
            options.debug &&
            options.logger.debug('Failed to call toDataURL() on canvas for image type %s', imageType)
        }

        return match
    }

    function verifyImageTypeAsync (imageType, cb) {
        canvasSupportsImageTypeAsync(imageType, function (err, match) {
            if (err) {
                cb(err)
            } else {
                if (match) {
                    cb(null, imageType)
                } else {
                    imageType = composeImageType(1)

                    canvasSupportsImageTypeAsync(imageType, function (err, match) {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null, match ? imageType : null)
                        }
                    })
                }
            }
        })
    }

    function verifyImageTypeSync (imageType) {
        if (!canvasSupportsImageTypeSync(imageType)) {
            if (options.image.types[1]) {
                imageType = composeImageType(1)

                if (!canvasSupportsImageTypeSync(imageType)) {
                    imageType = null
                }
            } else {
                imageType = null
            }
        }

        !imageType && options.debug && options.logger.debug('Unable to verify image type')

        return imageType
    }

    // callbacks are needed for server side tests
    function verifyImageType (cb) {
        var imageType = composeImageType(0)

        if (cb) {
            verifyImageTypeAsync(imageType, cb)
        } else {
            return verifyImageTypeSync(imageType)
        }
    }

    // this method is proven to be fast, see
    // http://jsperf.com/data-uri-to-buffer-performance/3
    function uriToBuffer (uri) {
        var uriSplitted = uri.split(',')[1]
        var bytes

        // Beware that the atob function might be a static one for server side tests
        if (typeof (atob) === 'function') {
            bytes = atob(uriSplitted)
        } else if (typeof (self.constructor.atob) === 'function') {
            bytes = self.constructor.atob(uriSplitted)
        } else {
            throw new Error('atob function is missing')
        }

        var arr = new Uint8Array(bytes.length)

        // http://mrale.ph/blog/2014/12/24/array-length-caching.html
        for (var i = 0, l = bytes.length; i < l; i++) {
            arr[i] = bytes.charCodeAt(i)
        }

        return typedArrayToBuffer(arr)
    }

    function toBufferSync () {
        var imageType = self.getImageType()
        var buffer

        if (imageType) {
            var uri = canvas.toDataURL(imageType, quality)
            buffer = uriToBuffer(uri)
        }

        return buffer
    }

    function toBufferAsync (cb) {
        self.getImageType(function (err, imageType) {
            if (err) {
                cb(err)
            } else if (!imageType) {
                cb()
            } else {
                canvas.toDataURL(imageType, function (err, uri) {
                    if (err) {
                        cb(err)
                    } else {
                        cb(null, uriToBuffer(uri))
                    }
                })
            }
        })
    }

    this.toBuffer = function (cb) {
        if (cb) {
            toBufferAsync(cb)
        } else {
            return toBufferSync()
        }
    }

    // browsers do not need a callback, but tests do
    this.getImageType = function (cb) {
        // only run for the first time this constructor is called and
        // cache result for the next calls
        if (cb) {
            if (!verifiedImageType || !isBrowser) {
                verifyImageType(function (err, newVerifiedImageType) {
                    if (err) {
                        cb(err)
                    } else {
                        verifiedImageType = newVerifiedImageType
                        cb(null, verifiedImageType)
                    }
                })
            } else {
                cb(null, verifiedImageType)
            }
        } else {
            // on the browser side we do cache it for speed
            if (!verifiedImageType || !isBrowser) {
                verifiedImageType = verifyImageType()
            }

            return verifiedImageType
        }
    }
}

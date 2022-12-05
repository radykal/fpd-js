// const { Writable } = require('stream');
import Writable       from 'stream'
/**
 * Simple writable buffer stream
 * @docs: https://nodejs.org/api/stream.html#stream_writable_streams
 */
export default class WritableBufferStream extends Writable {

  constructor(options) {
    super(options);
    this._chunks = [];
  }

  _write(chunk, enc, callback) {
    this._chunks.push(chunk);
    return callback(null);
  }

  _destroy(err, callback) {
    this._chunks = null;
    return callback(null);
  }

  toBuffer() {
    return Buffer.concat(this._chunks);
  }
}

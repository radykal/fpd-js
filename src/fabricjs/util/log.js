/**
 * Wrapper around `console.log` (when available)
 * @param {*} [values] Values to log
 */
fabric.error = function() {
  console.error.apply(console, arguments);
};

/**
 * Wrapper around `console.log` (when available)
 * @param {*} [values] Values to log
 */
fabric.log = function() {
  console.log.apply(console, arguments);
};

/**
 * Wrapper around `console.warn` (when available)
 * @param {*} [values] Values to log as a warning
 */
fabric.warn = function() {
  console.warn.apply(console, arguments);
};


fabric.traceError = function(e) {
  let stack = e.stack.split("\n");
  stack.shift();
  fabric.error("Error:", e.message, stack);
};


// /* eslint-disable */
// if (typeof console !== 'undefined') {
//
//   ['log', 'warn'].forEach(function(methodName) {
//
//     if (typeof console[methodName] !== 'undefined' &&
//         typeof console[methodName].apply === 'function') {
//
//       fabric[methodName] = function() {
//         return console[methodName].apply(console, arguments);
//       };
//     }
//   });
// }
/* eslint-enable */

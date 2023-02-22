/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/ui/less/main.less":
/*!************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/ui/less/main.less ***!
  \************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "body {\n  background: blue;\n}\n", "",{"version":3,"sources":["webpack://./src/ui/less/main.less"],"names":[],"mappings":"AAAA;EACI,gBAAA;AACJ","sourcesContent":["body {\n    background: blue;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./src/ui/less/main.less":
/*!*******************************!*\
  !*** ./src/ui/less/main.less ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_main_less__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../../node_modules/css-loader/dist/cjs.js!../../../node_modules/less-loader/dist/cjs.js!./main.less */ "./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/ui/less/main.less");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_main_less__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_main_less__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_main_less__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_main_less__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {



var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {



var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "./src/classes/FancyProductDesigner.js":
/*!*********************************************!*\
  !*** ./src/classes/FancyProductDesigner.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ FancyProductDesigner)
/* harmony export */ });
/* harmony import */ var _Options_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Options.js */ "./src/classes/Options.js");
/* harmony import */ var _ui_UIManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ui/UIManager */ "./src/ui/UIManager.js");



class FancyProductDesigner {
    
    constructor(elem, opts={}) {
        
        console.log(elem, opts);
        
        this.optionsInstance = new _Options_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
        this.mainOptions = this.optionsInstance.merge(this.optionsInstance.defaults, opts);
        
        this.uiManager = new _ui_UIManager__WEBPACK_IMPORTED_MODULE_1__["default"](this.mainOptions);
        
        this.#initUI();
        
    }
    
    #initUI() {
        
    }
}

window.FancyProductDesigner = FancyProductDesigner;



/***/ }),

/***/ "./src/classes/Options.js":
/*!********************************!*\
  !*** ./src/classes/Options.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Options)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.js");


/**
 * The class defining the default options for Fancy Product Designer.
 *
 * @class Options
 */
class Options {

	/**
	 * The default options. See: {{#crossLink "Options.defaults"}}{{/crossLink}}
	 *
	 * @property defaults
	 * @for Options
	 * @type {Object}
	 */
	defaults = {
		imageLoadTimestamp: false,
	    /**
		* The stage(canvas) width for the product designer.
		*
		* @property stageWidth
		* @for Options.defaults
		* @type {Number}
		* @default "900"
		*/
		stageWidth: 900,
		/**
		* The stage(canvas) height for the product designer.
		*
		* @property stageHeight
		* @for Options.defaults
		* @type {Number}
		* @default "600"
		*/
		stageHeight: 600,
		/**
		* Enables the editor mode, which will add a helper box underneath the product designer with some options of the current selected element.
		*
		* @property editorMode
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		editorMode: false,
		/**
		* The properties that will be displayed in the editor box when an element is selected.
		*
		* @property editorBoxParameters
		* @for Options.defaults
		* @type {Array}
		* @default ['left', 'top', 'angle', 'fill', 'width', 'height', 'fontSize', 'price']
		*/
		editorBoxParameters: ['left', 'top', 'angle', 'fill', 'width', 'height', 'fontSize', 'price'],
		/**
		* An array containing all available fonts.<br/>Since V4.3 you can use TrueType fonts (ttf), which is also recommend. TrueType fonts are required to include the font in the PDF for Fancy Product Designer - Admin, see example.
		*
		* @property fonts
		* @for Options.defaults
		* @type {Aarray}
		* @default [{name: 'Arial'}, {name: 'Lobster', url: 'google'}]
		* @example <br />[{name: "Lobster", url: "google"}, {name: 'Custom', url: 'https://yourdomain.com/fonts/custom.ttf"}, {name: 'Aller', url: 'path/Aller.ttf', variants: {'n7': 'path/Aller__bold.ttf','i4': 'path/Aller__italic.ttf','i7': 'path/Aller__bolditalic.ttf'}}]
		*/
		fonts: [{name: 'Arial'}, {name: 'Lobster', url: 'google'}],
		/**
		* The directory path that contains the templates.
		*
		* @property templatesDirectory
		* @for Options.defaults
		* @type {String}
		* @default 'templates/'
		*/
		templatesDirectory: 'html/',
		/**
		* To add photos from Facebook, you have to set your own Facebook API key.
		*
		* @property facebookAppId
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		facebookAppId: '',
		/**
		* To add photos from Instagram, you have to set an <a href="http://instagram.com/developer/" target="_blank">Instagram client ID</a>.
		*
		* @property instagramClientId
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		instagramClientId: '', //the instagram client ID
		/**
		* This URI to the html/instagram_auth.html. You have to update this option if you are using a different folder structure.
		*
		* @property instagramRedirectUri
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		instagramRedirectUri: '',
		/**
		* The URI to the script that get the access token from Instagram. You need the enter the Instagram Secret ID.
		*
		* @property instagramTokenUri
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		instagramTokenUri: '',
		/**
		* The zoom step when using the UI slider to change the zoom level.
		*
		* @property zoomStep
		* @for Options.defaults
		* @type {Number}
		* @default 0.2
		*/
		zoomStep: 0.2,
		/**
		* The maximal zoom factor. Set it to 1 to hide the zoom feature in the user interface.
		*
		* @property maxZoom
		* @for Options.defaults
		* @type {Number}
		* @default 3
		*/
		maxZoom: 3,
		/**
		* Set custom names for your hexdecimal colors. key=hexcode without #, value: name of the color.
		*
		* @property hexNames
		* @for Options.defaults
		* @type {Object}
		* @default {}
		* @example hexNames: {000000: 'dark',ffffff: 'white'}
		*/
		hexNames: {},
		/**
		* The border color of the selected element.
		*
		* @property selectedColor
		* @for Options.defaults
		* @type {String}
		* @default '#d5d5d5'
		*/
		selectedColor: '#f5f5f5',
		/**
		* The border color of the bounding box.
		*
		* @property boundingBoxColor
		* @for Options.defaults
		* @type {String}
		* @default '#005ede'
		*/
		boundingBoxColor: '#2185d0',
		/**
		* The border color of the element when its outside of his bounding box.
		*
		* @property outOfBoundaryColor
		* @for Options.defaults
		* @type {String}
		* @default '#990000'
		*/
		outOfBoundaryColor: '#990000',
		/**
		* If true only the initial elements will be replaced when changing the product. Custom added elements will not be removed.
		*
		* @property replaceInitialElements
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		replaceInitialElements: false,
		/**
		* If true lazy load will be used for the images in the "Designs" module and "Change Product" module.
		*
		* @property lazyLoad
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		lazyLoad: true,
		/**
		* Defines the file type used for the templates. E.g. if you want to convert all template files (productdesigner.html and canvaserror.html) into PHP files, you need to change this option to 'php'.
		*
		* @property templatesType
		* @for Options.defaults
		* @type {String}
		* @default 'html'
		*/
		templatesType: 'html',
		/**
		* An object that contains the settings for the AJAX post when a custom added image is added to the canvas (Uploaded Images, Facebook/Instagram Photos). This allows to send the URL of the image to a custom-built script, that returns the data URI of the image or uploads the image to your server and returns the new URL on your server. By default the URL is send to php/custom-image-handler.php. See the <a href="http://api.jquery.com/jquery.ajax/" target="_blank">official jQuery.ajax documentation</a> for more information. The data object has a reserved property called url, which is the image URL that will send to the script. The success function is also reserved.
		*
		* @property customImageAjaxSettings
		* @for Options.defaults
		* @type {Object}
		* @example
		* <pre> customImageAjaxSettings: {<br />  url: 'src/php/custom-image-handler.php',<br />  data: {<br/>   saveOnServer: 1, //image is uploaded to your server <br/>   uploadsDir: '/path/to/uploads_dir', //into this directory <br/>   uploadsDirURL: 'http://yourdomain.com/uploads_dir' //and returns the new URL from this location <br />}}</pre>
		*/
		customImageAjaxSettings: {
			/**
			* The URL to the custom-image-handler.php
			*
			* @property url
			* @type {String}
			* @for Options.defaults.customImageAjaxSettings
			* @default 'php/custom-image-handler.php'
			*/
			url: 'php/custom-image-handler.php',
			/**
			* The HTTP method to use for the request.
			*
			* @property method
			* @type {String}
			* @for Options.defaults.customImageAjaxSettings
			* @default 'POST'
			*/
			method: 'POST',
			/**
			* The type of data that you're expecting back from the server.
			*
			* @property dataType
			* @type {String}
			* @for Options.defaults.customImageAjaxSettings
			* @default 'json'
			*/
			dataType: 'json',
			/**
			* The data object sent to the server.
			*
			* @property data
			* @type {Object}
			* @for Options.defaults.customImageAjaxSettings
			* @default {
				saveOnServer: 0, - use integer as boolean value. 0=false, 1=true
				uploadsDir: './uploads', - if saveOnServer is 1, you need to specify the directory path where the images are saved
				uploadsDirURL: 'http://yourdomain.com/uploads' - if saveOnServer is 1, you need to specify the directory URL where the images are saved
			}
			*/
			data: {
				saveOnServer: 0, //use integer as boolean value. 0=false, 1=true
				uploadsDir: './uploads', //if saveOnServer is true, you need to specify the directory path where the images are saved
				uploadsDirURL: 'http://yourdomain.com/uploads' //if saveOnServer is true, you need to specify the directory URL where the images are saved
			}
		},
		/**
		* Enable an improved resize filter, that may improve the image quality when its resized.
		*
		* @property improvedResizeQuality
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		improvedResizeQuality: false,
		/**
		* Make the canvas and the elements in the canvas responsive.
		*
		* @property responsive
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		responsive: true,
		/**
		* Hex color value defining the color for the corner icon controls.
		*
		* @property cornerIconColor
		* @for Options.defaults
		* @type {String}
		* @default '#000000'
		*/
		cornerIconColor: '#000000', //hex
		/**
		* The URL to the JSON file or an object containing all content from the JSON file. Set to false, if you do not need it.
		*
		* @property langJSON
		* @for Options.defaults
		* @type {String | Object | Boolean}
		* @default 'lang/default.json'
		*/
		langJSON: 'lang/default.json',
		/**
		* The color palette when the color wheel is displayed.
		*
		* @property colorPickerPalette
		* @for Options.defaults
		* @type {Array}
		* @default []
		* @example ['#000', '#fff']
		*/
		colorPickerPalette: [], //when colorpicker is enabled, you can define a default palette
		/**
		* An object defining the available actions in the different zones.
		*
		* @property actions
		* @for Options.defaults
		* @type {Object}
		* @default {'top': [], 'right': [], 'bottom': [], 'left': []}
		* @example {'top': ['manage-layers'], 'right': ['info'], 'bottom': ['undo', 'redo'], 'left': []}
		*/
		actions:  {
			'top': [],
			'right': [],
			'bottom': [],
			'left': []
		},
		/**
		* An array defining the available modules in the main bar. Possible values: 'products', 'images', 'text', 'designs'. 'names-numbers', 'drawing' requires Fancy Product Designer Plus Add-On.
		*
		* @property mainBarModules
		* @for Options.defaults
		* @type {Array}
		* @default ['products', 'images', 'text', 'designs']
		*/
		mainBarModules: ['products', 'images', 'text', 'designs', 'manage-layers'],
		/**
		* Set the initial active module.
		*
		* @property initialActiveModule
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		initialActiveModule: '',
		/**
		* An object defining the maximum values for input elements in the toolbar.
		*
		* @property maxValues
		* @for Options.defaults
		* @type {String}
		* @default {}
		*/
		maxValues: {},
		/**
		* Set a watermark image when the user downloads/prints the product via the actions. To pass a watermark, just enter a string with an image URL.
		*
		* @property watermark
		* @for Options.defaults
		* @type {Boolean | String}
		* @default false
		*/
		watermark: false,
		/**
		* The number of columns used for the grid images in the images and designs module.
		*
		* @property gridColumns
		* @for Options.defaults
		* @type {Number}
		* @default 2
		*/
		gridColumns: 2,
		/**
		* An object containing the currency string(use %d as placeholder for price), decimal separator and thousand separator.
		*
		* @property priceFormat
		* @for Options.defaults
		* @type {Object}
		* @default {currency: '&#36;%d', decimalSep: '.', thousandSep: ','}
		*/
		priceFormat: {currency: '&#36;%d', decimalSep: '.', thousandSep: ','},
		/**
		* The ID of an element that will be used as container for the main bar.
		*
		* @property mainBarContainer
		* @for Options.defaults
		* @type {Boolean | String}
		* @default false
		* @example #customMainBarContainer
		*/
		mainBarContainer: false,
		/**
		* The ID of an element that will be used to open the modal, in which the designer is included.
		*
		* @property modalMode
		* @for Options.defaults
		* @type {Boolean | String}
		* @default false
		* @example #modalButton
		*/
		modalMode: false,
		/**
		* Enable keyboard control. Use arrow keys to move and backspace key to delete selected element.
		*
		* @property keyboardControl
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		keyboardControl: true,
		/**
		* Deselect active element when clicking outside of the product designer.
		*
		* @property deselectActiveOnOutside
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		deselectActiveOnOutside: true,
		/**
		* All upload zones will be always on top of all elements.
		*
		* @property uploadZonesTopped
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		uploadZonesTopped: true,
		/**
		* Loads the first initial product into stage.
		*
		* @property loadFirstProductInStage
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		loadFirstProductInStage: true,
		/**
		* If the user leaves the page without saving the product or the getProduct() method is not, a alert window will pop up.
		*
		* @property unsavedProductAlert
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		unsavedProductAlert: false,
		/**
		* If the user adds something and off-canvas panel or dialog is opened, it will be closed.
		*
		* @property hideDialogOnAdd
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		hideDialogOnAdd: true,
		/**
		* Set the placement of the toolbar. For smartphones the toolbar will be fixed at the bottom of the page. Possible values:'smart', 'inside-bottom', 'inside-top'
		*
		* @property toolbarPlacement
		* @for Options.defaults
		* @type {String}
		* @default 'smart'
		*/
		toolbarPlacement: 'smart',
		/**
		* The grid size for snap action. First value defines the width on the a-axis, the second on the y-axis.
		*
		* @property snapGridSize
		* @for Options.defaults
		* @type {Array}
		* @default [50, 50]
		*/
		snapGridSize: [50, 50],
		/**
		* An object containing <a href="http://fabricjs.com/docs/fabric.Canvas.html" target="_blank">options for the fabricjs canvas</a>.
		*
		* @property fabricCanvasOptions
		* @for Options.defaults
		* @type {Object}
		* @default {}
		*/
		fabricCanvasOptions: {},
		/**
		* Defines the values for the select element in the names & numbers module. Requires Fancy Product Designer Plus Add-On.
		*
		* @property namesNumbersDropdown
		* @for Options.defaults
		* @type {Array}
		* @default []
		*/
		namesNumbersDropdown: [],
		/**
		* Sets price for any extra entry in the names & numbers module. Requires Fancy Product Designer Plus Add-On.
		*
		* @property namesNumbersEntryPrice
		* @for Options.defaults
		* @type {Number}
		* @default 0
		*/
		namesNumbersEntryPrice: 0,
		/**
		* Sets the placement for the color selection, possible values: 'inside-tl', 'inside-tc', 'inside-tr', 'inside-bl', 'inside-bc', 'inside-br' or ID of another element(#my-color-selection). Requires Fancy Product Designer Plus Add-On.
		*
		* @property colorSelectionPlacement
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		colorSelectionPlacement: '',
		/**
		* Sets the display type for the color selection. By default the color items will be shown in a grid. You can also enable a dropdown for the color selection, but this is only working when using a custom element in colorSelectionPlacement. Possible values: grid, dropdown. Requires Fancy Product Designer Plus Add-On.
		*
		* @property colorSelectionDisplayType
		* @for Options.defaults
		* @type {String}
		* @default 'grid'
		* @version PLUS 1.1.1
		*/
		colorSelectionDisplayType: 'grid',
		/**
		* Sets the placement for the Bulk-Add Variations Form. Just enter ID or class of another element(#my-color-selection). Requires Fancy Product Designer Plus Add-On.
		*
		* @property bulkVariationsPlacement
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		bulkVariationsPlacement: '',
		/**
		* The available variations for the Bulk-Add Variations Form, e.g.: {'Size': ['XL', 'L', 'M', 'S'], 'Color': ['Red', 'Blue']}. Requires Fancy Product Designer Plus Add-On.
		*
		* @property bulkVariations
		* @for Options.defaults
		* @type {Object}
		* @default {}
		*/
		bulkVariations: {},
		/**
		* The element where the toolbar will be appended when toolbarPlacement='smart'.
		*
		* @property toolbarDynamicContext
		* @for Options.defaults
		* @type {String}
		* @default 'body'
		*/
		toolbarDynamicContext: 'body',
		/**
		* Addtional properties for the bounding box. Can be used to set the stroke width etc.. See http://fabricjs.com/docs/fabric.Rect.html
		*
		* @property boundingBoxProps
		* @for Options.defaults
		* @type {Object}
		* @default {strokeWidth: 1}
		*/
		boundingBoxProps: {strokeWidth: 1},
		/**
		* If the image (custom uploaded or design) is larger than the canvas, it will be scaled down to fit into the canvas.
		*
		* @property fitImagesInCanvas
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		fitImagesInCanvas: false,
		/**
		* Set a maximum price for all products or for specific views. -1 disables the max. price.
		*
		* @property maxPrice
		* @for Options.defaults
		* @type {Number}
		* @default -1
		*/
		maxPrice: -1,
		/**
		* The text can be edited in the canvas by double click/tap.
		*
		* @property inCanvasTextEditing
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		inCanvasTextEditing: true,
		/**
		* The text input in the toolbar when be opened when an editable text is selected.
		*
		* @property openTextInputOnSelect
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		openTextInputOnSelect: false,
		/**
		* An array of design category titles (only top-level categories) to enable particular design categories for an upload zone or for the view. An empty array will enable all design categories.
		*
		* @property designCategories
		* @type {Array}
		* @for Options.defaults
		* @default []
		*/
		designCategories: [],
		/**
		* Will make the view(s) optional, so the user have to unlock it. The price for the elements in the view will be added to the total product price as soon as the view is unlocked.
		*
		* @property optionalView
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		optionalView: false,
		/**
		* When using the save/load actions, store the product in user's browser storage.
		*
		* @property saveActionBrowserStorage
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		saveActionBrowserStorage: true,
		/**
		* An array containing the pricing rules groups. Use the <a href="http://fancyproductdesigner.com/addon-pricing-rules/" target="_blank" style="text-decoration: underline;">online tool to generate pricing rules</a>. Requires Fancy Product Designer Pricing Add-On.
		*
		* @property pricingRules
		* @for Options.defaults
		* @type {Array}
		* @default []
		*/
		pricingRules: [],
		/**
		* Enables an agreement modal that needs to be confirmed before uploaded images can be used in the product designer. The text in the agreement modal can be set through the language JSON.
		*
		* @property uploadAgreementModal
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		uploadAgreementModal: false,
		/**
		* An object containing the settings for the image editor.
		*
		* @property imageEditorSettings
		* @for Options.defaults
		* @type {Object}
		* @default {masks: []}
		*/
		imageEditorSettings: {
			/**
			* An array containing the SVG urls for custom mask shapes. Use only one path per SVG, only the first path will be used as mask shape.
			*
			* @property masks
			* @type {Array}
			* @for Options.defaults.imageEditorSettings
			* @default []
			*/
			masks: []
		},
		/**
		* An object containing left, top, width and height properties that represents a printing box. A printing box is a rectangle which is always visible in the canvas and represents the printing area. It is used in the ADMIN solution to create a PDF with a specific printing area.
		*
		* @propert printingBox
		* @for Options.defaults
		* @type {Object}
		* @default null
		*/
		printingBox: null,
		/**
		* Open the Info modal when product designer is loaded. The Info action needs to be added to show the modal.
		*
		* @property autoOpenInfo
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		autoOpenInfo: false,
		/**
		* Create a custom guided tour by definifing an object with a key/css selector for the target element and the value for the text in the guided tour step. The first part of the key string defines the target type (module or action) followed by a a colon and the name of the module/action or just enter a custom CSS selector string, e.g. module:products, action:manage-layers or #any-element.
		*
		* @property guidedTour
		* @for Options.defaults
		* @type {Null | Object}
		* @default null
		* @example guidedTour: {
"module:products": "This is the text for first step.",
"action:manage-layers": "This is the text for second step.",
"#any-element": "Pointer on a custom HTML element"
}
		*/
		guidedTour: null,
		/**
		* As soon as an element with a color link group is added, the colours of this element will be used for the color group. If false, the colours of all element in the color group will be concatenated.
		*
		* @property replaceColorsInColorGroup
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		replaceColorsInColorGroup: false,
		/**
		* Defines the image types in lowercase that can be uploaded. Currently the designer supports jpg, svg, png images and PDF files.
		*
		* @property allowedImageTypes
		* @for Options.defaults
		* @type {Array}
		* @default ['jpeg', 'png', 'svg', 'pdf']
		*/
		allowedImageTypes: ['jpeg', 'png', 'svg', 'pdf'],
		/**
		* To add photos from Pixabay, you have to set an <a href="https://pixabay.com/api/docs/" target="_blank">Pixabay API key</a>.
		*
		* @property pixabayApiKey
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		pixabayApiKey: '',
		/**
		* If you want to access high-resolution images, enable this option and you have to ask Pixabay for permission. <a href="https://pixabay.com/api/docs/#hires_image_search_response" target="_blank">You can easily do that here, next to the headline</a>.
		*
		* @property pixabayHighResImages
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		pixabayHighResImages: false,
		/**
		* Language code of the language to be searched in. Accepted values: cs, da, de, en, es, fr, id, it, hu, nl, no, pl, pt, ro, sk, fi, sv, tr, vi, th, bg, ru, el, ja, ko, zh.
		*
		* @property pixabayLang
		* @for Options.defaults
		* @type {String}
		* @default ''
		* @version 4.7.5
		*/
		pixabayLang: 'en',
		/**
		* Display the internal modals (info, qr-code etc.) in the product designer instead in the whole page.
		*
		* @property openModalInDesigner
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		openModalInDesigner: false,
		/**
		* Shows the current image size in pixels in a tooltip above the image element when its selected.
		*
		* @property imageSizeTooltip
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		imageSizeTooltip: false,
		/**
		* To add photos from DepositPhotos, you have to set an <a href="https://pixabay.com/api/docs/" target="_blank">Pixabay API key</a>.
		*
		* @property depositphotosApiKey
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		depositphotosApiKey: '',
		/**
		* The language shortcut that defines the language for the category titles. Available language shortcuts: en,de,fr,sp,ru,it,pt,es,pl,nl,jp,cz,se,zh,tr,mx,gr,ko,br,hu,uk,ro,id,th.
		*
		* @property depositphotosLang
		* @for Options.defaults
		* @type {String}
		* @default 'en'
		*/
		depositphotosLang: 'en',
		/**
		* The price that is charged when adding an image from depositphotos.com.
		*
		* @property depositphotosPrice
		* @for Options.defaults
		* @type {Number}
		* @default 0
		*/
		depositphotosPrice: 0,
		/**
		* Highlight objects (editable texts and upload zones) with a dashed border. To enable this just define a hexadecimal color value.
		*
		* @property highlightEditableObjects
		* @for Options.defaults
		* @type {String}
		* @default ''
		* @version 3.7.2
		*/
		highlightEditableObjects: '',
		/**
		* When an element is replaced, apply fill(color) from replaced element to added element.
		*
		* @property applyFillWhenReplacing
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		* @version 3.7.2
		*/
		applyFillWhenReplacing: true,
		/**
		* An array containing layouts. A layout is technically a view that will replace all elements in a view when selected.
		*
		* @property layouts
		* @for Options.defaults
		* @type {Array}
		* @default []
		* @version 4.7.0
		*/
		layouts: [],
		/**
		* Options for the Dynamic Views modul. Requires Fancy Product Designer Plus Add-On.
		*
		* @property dynamicViewsOptions
		* @for Options.defaults
		* @type {Object}
		* @default {}
		* @version 4.7.0
		*/
		dynamicViewsOptions: {
			/**
			* Set the length unit that you would like to set the canvas site: 'mm', 'cm', 'inch'
			*
			* @property unit
			* @type {String}
			* @for Options.defaults.dynamicViewsOptions
			* @default 'mm'
			*/
			unit: 'mm',
			/**
			* An array will all available formats when adding a new view.
			*
			* @property formats
			* @type {Array}
			* @for Options.defaults.dynamicViewsOptions
			* @default []
			*@example [
	[100, 100],
	[500, 500],
	[1000, 1000]
]
			*/
			formats: [],
			/**
			* Charge price per area in centimeter. For example if you want to charge a price of 1 per 10cm2, you have to enter 0.1.
			*
			* @property pricePerArea
			* @type {Number}
			* @for Options.defaults.dynamicViewsOptions
			* @default 0
			*/
			pricePerArea: 0,
			/**
			* Minimum width that the user can enter as view width.
			*
			* @property minWidth
			* @type {Number}
			* @for Options.defaults.dynamicViewsOptions
			* @default 0
			*/
			minWidth: 0,
			/**
			* Minimum height that the user can enter as view height.
			*
			* @property minHeight
			* @type {Number}
			* @for Options.defaults.dynamicViewsOptions
			* @default 0
			*/
			minHeight: 0,
			/**
			* Maximum width that the user can enter as view width.
			*
			* @property maxWidth
			* @type {Number}
			* @for Options.defaults.dynamicViewsOptions
			* @default 10000
			*/
			maxWidth: 10000,
			/**
			* Maximum height that the user can enter as view height.
			*
			* @property maxHeight
			* @type {Number}
			* @for Options.defaults.dynamicViewsOptions
			* @default 10000
			*/
			maxHeight: 10000
		},
		/**
		* Emojis in text elements will be removed when changing or adding text.
		*
		* @property disableTextEmojis
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 4.7.4
		*/
		disableTextEmojis: false,
		/**
		* Enable guide lines to align the selected object to the edges of the other objects.
		*
		* @property smartGuides
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 4.7.7
		*/
		smartGuides: false,
		/**
		* Set the toolbar theme. Possible values: white, dark.
		*
		* @property toolbarTheme
		* @for Options.defaults
		* @type {String}
		* @default 'white'
		* @version 4.7.7
		*/
		toolbarTheme: 'white',
		/**
		* If a printing box has been defined for a view and the element has no individual bounding box, the printing box will be used as bounding box.
		*
		* @property usePrintingBoxAsBounding
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 4.8.0
		*/
		usePrintingBoxAsBounding: false,
		/**
		* An object defining the printing area when exporting the product as SVG. {top: Number, left: Number, width: Number, height: Number, visibility: Boolean}. The visibility property shows the printing box to the customers.
		*
		* @property printingBox
		* @for Options.defaults
		* @type {Object}
		* @default {}
		* @version 4.7.0
		* @example {top: 100, left: 100, width: 400, height: 500, visibility: true}
		*/
		printingBox: {},
		/**
		* A JSON object or URL to a JSON file that stores all initial products. These products will be displayed in the Products module.
		*
		* @property productsJSON
		* @for Options.defaults
		* @type {String}
		* @default null
		* @version 4.9.0
		*/
		productsJSON: null,
		/**
		* A JSON object or URL to a JSON file that stores all designs. These designs will be displayed in the Designs module.
		*
		* @property designsJSON
		* @for Options.defaults
		* @type {String}
		* @default null
		* @version 4.9.0
		*/
		designsJSON: null,
		/**
		* When the customizationRequired argument in the getProduct is set to true, you can control if any view needs to be customized or all. Possible values: any, all.
		*
		* @property customizationRequiredRule
		* @for Options.defaults
		* @type {String}
		* @default 'any'
		* @version 4.9.4
		*/
		customizationRequiredRule: 'any',
		/**
		* Display the notification that the product is going to be changed when clicking on a product item in the Products module.
		*
		* @property swapProductConfirmation
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 4.9.5
		*/
		swapProductConfirmation: false,
		/**
		* The position of the textarea in the toolbar. Possible values: sub, top (Only possible when toolbarPlacement = smart).
		*
		* @property toolbarTextareaPosition
		* @for Options.defaults
		* @type {String}
		* @default 'sub'
		* @version 4.9.6
		*/
		toolbarTextareaPosition: 'sub',
		/**
		* The width of a textbox can set via the "Texts" module or changed via the corner controls of the selected textbox.
		*
		* @property setTextboxWidth
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 5.0.1
		*/
		setTextboxWidth: false,
		/**
		* Define additional properties that will be applied to all text elements in the same textLinkGroup. E.g.: ['fontFamily', 'fontSize', 'fontStyle']
		*
		* @property textLinkGroupProps
		* @for Options.defaults
		* @type {Array}
		* @default []
		* @version 5.0.3
		*/
		textLinkGroupProps: [],
		/**
		* Text Templates that will appear in the Text module.
		*
		* @property textTemplates
		* @for Options.defaults
		* @type {Array}
		* @default []
		* @example [{text: 'Hello World', properties: {fontFamily: 'Arial', textSize: 35}}]
		* @version 5.1.0
		*/
		textTemplates: [],
		/**
		* Multiple objects can be selected and moved at the same time.
		*
		* @property multiSelection
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 5.1.0
		*/
		multiSelection: false,
		/**
		* The UI theme that you would like to use. Choose between 'flat' or 'doyle'.
		*
		* @property uiTheme
		* @for Options.defaults
		* @type {String}
		* @default 'flat'
		* @version 5.1.0
		*/
		uiTheme: 'flat',
		/**
		* The maximum canvas height related to the window height. A number between 0 and 1, e.g. 0.8 will set a maximum canvas height of 80% of the window height. A value of 1 will disable a calculation of a max. height.
		*
		* @property maxCanvasHeight
		* @for Options.defaults
		* @type {Number}
		* @default 1
		* @version 5.1.1
		*/
		maxCanvasHeight: 1,
		/**
		* Set the behaviour for mobile gestures. Possible values:  <ul><li>'none': No behaviour</li><li>'pinchPanCanvas': Zoom in/out and pan canvas</li><li> 'pinchImageScale': Scale selected image with pinch</li></ul> .
		*
		* @property mobileGesturesBehaviour
		* @for Options.defaults
		* @type {String}
		* @default 'none'
		* @version 5.1.3
		*/
		mobileGesturesBehaviour: 'none',
		/**
		* Enable image quality ratings for uploaded images. Therefore you can define low, mid and high quality steps. The object receives low, mid and high keys. The values of these keys are arrays, where the first entry defines the width and the second entry defines the height.
		*
		* @property imageQualityRatings
		* @for Options.defaults
		* @type {Object}
		* @default null
		* @example {low: [100, 200], mid: [500, 600], high: [1000, 1200]}
		* @version 5.1.4
		*/
		imageQualityRatings: null,
		/**
		* Displays the paths of a SVG in the advanced image editor.
		*
		* @property splitMultiSVG
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 5.1.4
		*/
		splitMultiSVG: false,
		/**
		* Set corner controls style: Basic (Rescale and Rotate), Advanced (Rescale, Rotate, Delete, Duplicate).
		*
		* @property cornerControlsStyle
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 5.1.4
		*/
		cornerControlsStyle: 'advanced',
		/**
		* The filename when the user downloads the product design as image or PDF.
		*
		* @property downloadFilename
		* @for Options.defaults
		* @type {String}
		* @default 'Product'
		* @version 5.1.5
		*/
		downloadFilename: 'Product',
		/**
		* Fill all upload zones with the first uploaded images.
		*
		* @property autoFillUploadZones
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 5.2.7
		*/
		autoFillUploadZones: false,
		/**
		* Drag & Drop images from the images and designs module into upload zones or on canvas.
		*
		* @property dragDropImagesToUploadZones
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 5.2.7
		*/
		dragDropImagesToUploadZones: false,
		/**
		* An object containing the default element parameters in addition to the <a href="http://fabricjs.com/docs/fabric.Object.html" target="_blank">default Fabric Object properties</a>. See <a href="./Options.defaults.elementParameters.html">Options.defaults.elementParameters</a>.
		*
		* @property elementParameters
		* @for Options.defaults
		* @type {Object}
		*/
		elementParameters: {
			objectCaching: false,
			/**
			* Allows to set the z-index of an element, -1 means it will be added on the stack of layers
			*
			* @property z
			* @type {Number}
			* @for Options.defaults.elementParameters
			* @default -1
			*/
			z: -1,
			/**
			* The price for the element.
			*
			* @property price
			* @type {Number}
			* @for Options.defaults.elementParameters
			* @default 0
			*/
			price: 0, //how much does the element cost
			/**
			* <ul><li>If false, no colorization for the element is possible.</li><li>One hexadecimal color will enable the colorpicker</li><li>Mulitple hexadecimal colors separated by commmas will show a range of colors the user can choose from.</li></ul>
			*
			* @property colors
			* @type {Boolean | String}
			* @for Options.defaults.elementParameters
			* @default false
			* @example colors: "#000000" => Colorpicker, colors: "#000000,#ffffff" => Range of colors
			*/
			colors: false,
			/**
			* If true the user can remove the element.
			*
			* @property removable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			removable: false,
			/**
			* If true the user can drag the element.
			*
			* @property draggable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			draggable: false,
			/**
			* If true the user can rotate the element.
			*
			* @property rotatable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			rotatable: false,
			/**
			* If true the user can resize the element.
			*
			* @property resizable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			resizable: false,
			/**
			* If true the user can copy non-initial elements. Copyable property is enabled for designs and custom added elements automatically.
			*
			* @property copyable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			copyable: false,
			/**
			* If true the user can change the z-position the element.
			*
			* @property zChangeable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			zChangeable: false,
			/**
			* Defines a bounding box (printing area) for the element.<ul>If false no bounding box</li><li>The title of an element in the same view, then the boundary of the target element will be used as bounding box.</li><li>An object with x,y,width and height defines the bounding box</li></ul>
			*
			* @property boundingBox
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			boundingBox: false,
			/**
			* Set the mode for the bounding box. Possible values: 'none', 'clipping', 'limitModify', 'inside'
			*
			* @property boundingBoxMode
			* @type {String}
			* @for Options.defaults.elementParameters
			* @default 'clipping'
			*/
			boundingBoxMode: 'clipping',
			/**
			* Centers the element in the canvas or when it has a bounding box in the bounding box.
			*
			* @property autoCenter
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			autoCenter: false,
			/**
			* Replaces an element with the same type and replace value.
			*
			* @property replace
			* @type {String}
			* @for Options.defaults.elementParameters
			* @default ''
			*/
			replace: '',
			/**
			* If a replace value is set, you can decide if the element replaces the elements with the same replace value in all views or only in the current showing view.
			*
			* @property replaceInAllViews
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default ''
			*/
			replaceInAllViews: false,
			/**
			* Selects the element when its added to stage.
			*
			* @property autoSelect
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			autoSelect: false,
			/**
			* Sets the element always on top.
			*
			* @property topped
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			topped: false,
			/**
			* You can define different prices when using a range of colors, set through the colors option.
			*
			* @property colorPrices
			* @type {Object}
			* @for Options.defaults.elementParameters
			* @default {}
			* @example colorPrices: {"000000": 2, "ffffff: "3.5"}
			*/
			colorPrices: {},
			/**
			* Include the element in a color link group. So elements with the same color link group are changing to same color as soon as one element in the group is changing the color.
			*
			* @property colorLinkGroup
			* @type {Boolean | String}
			* @for Options.defaults.elementParameters
			* @default false
			* @example 'my-color-group'
			*/
			colorLinkGroup: false,
			/**
			* An array of URLs to pattern image - onyl for SVG images or text elements.
			*
			* @property patterns
			* @type {Array}
			* @for Options.defaults.elementParameters
			* @default []
			* @example patterns: ['patterns/pattern_1.png', 'patterns/pattern_2.png',]
			*/
			patterns: [],
			/**
			* An unique identifier for the element.
			*
			* @property sku
			* @type {String}
			* @for Options.defaults.elementParameters
			* @default ''
			*/
			sku: '',
			/**
			* When true the element is not exported in SVG. If you are going to use one of the data URL methods (e.g. <a href="./FancyProductDesigner.html#method_getProductDataURL">getProductDataURL()</a>), you need to set onlyExportable=true in the options, so the element is not exported in the data URL.
			*
			* @property excludeFromExport
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			excludeFromExport: false,
			/**
			* Shows the element colors in color selection panel. Requires Fancy Product Designer Plus Add-On.
			*
			* @property showInColorSelection
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			showInColorSelection: false,
			/**
			* By the default the element will be locked and needs to be unlocked by the user via the "Manage Layers" module.
			*
			* @property locked
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			locked: false,
			/**
			* Allow user to unlock proportional scaling in the toolbar. After that the user scale the element unproportional via toolbar or element boundary controls.
			*
			* @property uniScalingUnlockable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			uniScalingUnlockable: false,
			/**
			* The layer is fixed and will stay on the canvas when changing the product.
			*
			* @property fixed
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			fixed: false,
			originX: 'center',
			originY: 'center',
			cornerSize: 24,
			fill: false,
			lockUniScaling: true,
			pattern: false,
			top: 0,
			left: 0,
			angle: 0,
			flipX: false,
			flipY: false,
			opacity: 1,
			scaleX: 1,
			scaleY: 1,
		},
		/**
		* An object containing the default text element parameters in addition to the <a href="http://fabricjs.com/docs/fabric.IText.html" target="_blank">default Fabric IText properties</a>. See <a href="./Options.defaults.textParameters.html">Options.defaults.textParameters</a>. The properties in the object will merge with the properties in the elementParameters.
		*
		* @property textParameters
		* @for Options.defaults
		* @type {Object}
		*/
		textParameters: {
			/**
			* The maximal allowed characters. 0 means unlimited characters.
			*
			* @property maxLength
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			maxLength: 0,
			/**
			* If true the text will be curved.
			*
			* @property curved
			* @type {Boolean}
			* @for Options.defaults.textParameters
			* @default false
			*/
			curved: false,
			/**
			* If true the the user can switch between curved and normal text.
			*
			* @property curvable
			* @type {Boolean}
			* @for Options.defaults.textParameters
			* @default false
			*/
			curvable: false,
			/**
			* The letter spacing when the text is curved.
			*
			* @property curveSpacing
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 10
			*/
			curveSpacing: 10,
			/**
			* The radius when the text is curved.
			*
			* @property curveRadius
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 80
			*/
			curveRadius: 80,
			/**
			* Reverses the curved text.
			*
			* @property curveReverse
			* @type {Boolean}
			* @for Options.defaults.textParameters
			* @default false
			*/
			curveReverse: false,
			/**
			* The maximal allowed lines. 0 means unlimited characters.
			*
			* @property maxLines
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			maxLines: 0,
			/**
			* Enables the text element as a text box. A text box has a fixed width and not be resized.
			*
			* @property textBox
			* @type {Boolean}
			* @for Options.defaults.textParameters
			* @default false
			*/
			textBox: false,
			/**
			* Enables the text element as a placeholder for the Names & Numbers module. You can enable this parameter for one text element in a view.
			*
			* @property textPlaceholder
			* @type {Boolean | Array}
			* @for Options.defaults.textParameters
			* @default false
			*/
			textPlaceholder: false,
			/**
			* Enables the text element as a number placeholder for the Names & Numbers module. You can enable this parameter for one text element in a view. If you want to define a range of allowed numbers, just use an array. The first value in the array defines the minimum value, the second value defines the maximum value, e.g. [0, 10].
			*
			* @property numberPlaceholder
			* @type {Boolean}
			* @for Options.defaults.textParameters
			* @default false
			*/
			numberPlaceholder: false,
			/**
			* Addtional space between letters.
			*
			* @property letterSpacing
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			letterSpacing: 0,
			/**
			* The price will be charged first after the text has been edited.
			*
			* @property chargeAfterEditing
			* @type {Boolean}
			* @for Options.defaults.textParameters
			* @default false
			*/
			chargeAfterEditing: false,
			/**
			* The minimum font size.
			*
			* @property minFontSize
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 1
			*/
			minFontSize: 1,
			/**
			* Set the text transform - none, lowercase, uppercase.
			*
			* @property textTransform
			* @type {String}
			* @for Options.defaults.textParameters
			* @default 'none'
			*/
			textTransform: 'none',
			/**
			* Set a width for the text, so the text will be scaled up/down to the given area.
			*
			* @property widthFontSize
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			widthFontSize: 0,
			/**
			* The maximum font size. Using a value higher than 200 can cause performance issues with text boxes.
			*
			* @property maxFontSize
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 1
			*/
			maxFontSize: 200,
			/**
			* The color of the shadow.
			*
			* @property shadowColor
			* @type {String}
			* @for Options.defaults.textParameters
			* @default ''
			*/
			shadowColor: '',
			/**
			* Shadow Blur.
			*
			* @property shadowBlur
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			shadowBlur: 0,
			/**
			* Shadow horizontal offset.
			*
			* @property shadowOffsetX
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			shadowOffsetX: 0,
			/**
			* Shadow vertical offset.
			*
			* @property shadowOffsetY
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			shadowOffsetY: 0,
			/**
			* Link the text of different text elements, changing the text of one element will also change the text of text elements with the same textLinkGroup value.
			*
			* @property textLinkGroup
			* @type {String}
			* @for Options.defaults.textParameters
			* @default ""
			*/
			textLinkGroup: "",
			/**
			* The colors for the stroke. If empty, the color wheel will be displayed.
			*
			* @property strokeColors
			* @type {Array}
			* @for Options.defaults.textParameters
			* @default []
			*/
			strokeColors: [],
			editable: true,
			fontFamily: "Arial",
			fontSize: 18,
			lineHeight: 1,
			fontWeight: 'normal', //set the font weight - bold or normal
			fontStyle: 'normal', //'normal', 'italic'
			textDecoration: 'normal', //'normal' or 'underline'
			padding: 10,
			textAlign: 'left',
			stroke: null,
			strokeWidth: 0,
			charSpacing: 0,
		},
		/**
		* An object containing the default image element parameters in addition to the <a href="http://fabricjs.com/docs/fabric.Image.html" target="_blank">default Fabric Image properties</a>. See <a href="./Options.defaults.imageParameters.html">Options.defaults.imageParameters</a>. The properties in the object will merge with the properties in the elementParameters.
		*
		* @property imageParameters
		* @for Options.defaults
		* @type {Object}
		*/
		imageParameters: {
			/**
			* If true the image will be used as upload zone. That means the image is a clickable area in which the user can add different media types.
			*
			* @property uploadZone
			* @type {Boolean}
			* @for Options.defaults.imageParameters
			* @default false
			*/
			uploadZone: false,
			/**
			* Sets a filter on the image. Possible values: 'grayscale', 'sepia', 'sepia2' or any filter name from FPDFilters class.
			*
			* @property filter
			* @type {Boolean}
			* @for Options.defaults.imageParameters
			* @default null
			*/
			filter: null,
			/**
			* Set the scale mode when image is added into an upload zone or resizeToW/resizeToH properties are set. Possible values: 'fit', 'cover'
			*
			* @property scaleMode
			* @type {String}
			* @for Options.defaults.imageParameters
			* @default 'fit'
			*/
			scaleMode: 'fit',
			/**
			* Resizes the uploaded image to this width. 0 means it will not be resized.
			*
			* @property resizeToW
			* @type {Number}
			* @for Options.defaults.imageParameters
			* @default 0
			*/
			resizeToW: 0,
			/**
			* Resizes the uploaded image to this height. 0 means it will not be resized.
			*
			* @property resizeToH
			* @type {Number}
			* @for Options.defaults.imageParameters
			* @default 0
			*/
			resizeToH: 0,
			/**
			* Enables advanced editing, the user can crop, set filters and manipulate the color of the image. This works only for png or jpeg images. If the original image has been edited via the image editor, the original image will be replaced by a PNG with 72DPI!
			*
			* @property advancedEditing
			* @type {Boolean}
			* @for Options.defaults.imageParameters
			* @default false
			*/
			advancedEditing: false,
			/**
			* If true the upload zone can be moved by the user.
			*
			* @property uploadZoneMovable
			* @type {Boolean}
			* @for Options.defaults.imageParameters
			* @default false
			* version 4.8.2
			*/
			uploadZoneMovable: false,
			/**
			* If true the upload zone can be removed by the user.
			*
			* @property uploadZoneRemovable
			* @type {Boolean}
			* @for Options.defaults.imageParameters
			* @default false
			* version 5.0.0
			*/
			uploadZoneRemovable: false,
			padding: 0,
			minScaleLimit: 0.01
		},
		/**
		* An object containing the default parameters for custom added images. See <a href="./Options.defaults.customImageParameters.html">Options.defaults.customImageParameters</a>. The properties in the object will merge with the properties in the elementParameters and imageParameters.
		*
		* @property customImageParameters
		* @for Options.defaults
		* @type {Object}
		*/
		customImageParameters: {
			/**
			* The minimum upload size width.
			*
			* @property minW
			* @type {Number}
			* @for Options.defaults.customImageParameters
			* @default 100
			*/
			minW: 100,
			/**
			* The minimum upload size height.
			*
			* @property minH
			* @type {Number}
			* @for Options.defaults.customImageParameters
			* @default 100
			*/
			minH: 100,
			/**
			* The maximum upload size width.
			*
			* @property maxW
			* @type {Number}
			* @for Options.defaults.customImageParameters
			* @default 1500
			*/
			maxW: 1500,
			/**
			* The maximum upload size height.
			*
			* @property maxH
			* @type {Number}
			* @for Options.defaults.customImageParameters
			* @default 1500
			*/
			maxH: 1500,
			/**
			* The minimum allowed DPI for uploaded images. Works only with JPEG images.
			*
			* @property minDPI
			* @type {Number}
			* @for Options.defaults.customImageParameters
			* @default 72
			*/
			minDPI: 72,
			/**
			* The maxiumum image size in MB.
			*
			* @property maxSize
			* @type {Number}
			* @for Options.defaults.customImageParameters
			* @default 10
			*/
			maxSize: 10
		},
		/**
		* An object containing additional parameters for custom added text.The properties in the object will merge with the properties in the elementParameters and textParameters.
		*
		* @property customTextParameters
		* @for Options.defaults
		* @type {Object}
		*/
		customTextParameters: {},
		/**
		* An object containing the supported media types the user can add in the product designer.
		*
		* @property customAdds
		* @for Options.defaults
		* @type {Object}
		*/
		customAdds: {
			/**
			* If true the user can add images from the designs library.
			*
			* @property designs
			* @type {Boolean}
			* @for Options.defaults.customAdds
			* @default true
			*/
			designs: true,
			/**
			* If true the user can add an own image.
			*
			* @property uploads
			* @type {Boolean}
			* @for Options.defaults.customAdds
			* @default true
			*/
			uploads: true,
			/**
			* If true the user can add own text.
			*
			* @property texts
			* @type {Boolean}
			* @for Options.defaults.customAdds
			* @default true
			*/
			texts: true,
			/**
			* If true the user can add own drawings.
			*
			* @property drawing
			* @type {Boolean}
			* @for Options.defaults.customAdds
			* @default true
			*/
			drawing: true
		},
		/**
		* An object containing the properties (parameters) for the QR code.
		*
		* @property qrCodeProps
		* @for Options.defaults
		* @type {Object}
		*/
		qrCodeProps: {
			/**
			* @property autoCenter
			* @type {Boolean}
			* @for Options.defaults.qrCodeProps
			* @default true
			*/
			autoCenter: true,
			/**
			* @property draggable
			* @type {Boolean}
			* @for Options.defaults.qrCodeProps
			* @default true
			*/
			draggable: true,
			/**
			* @property removable
			* @type {Boolean}
			* @for Options.defaults.qrCodeProps
			* @default true
			*/
			removable: true,
			/**
			* @property resizable
			* @type {Boolean}
			* @for Options.defaults.qrCodeProps
			* @default true
			*/
			resizable: true
		},
	};

	/**
	 * Merges the default options with custom options.
	 *
	 * @method merge
	 * @for Options
	 * @param {Object} defaults The default object.
	 * @param {Object} [merge] The merged object, that will be merged into the defaults.
	 * @return {Object} The new options object.
	 */
	merge(defaults, merge) {

		typeof merge === 'undefined' ? {} : merge;
        
        //todo: do deep merge here instead of multiple extends
		var options = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.deepMerge)(defaults, merge);
		// options.elementParameters = jQuery.extend({}, defaults.elementParameters, options.elementParameters);
		// options.textParameters = jQuery.extend({}, defaults.textParameters, options.textParameters);
		// options.imageParameters = jQuery.extend({}, defaults.imageParameters, options.imageParameters);
		// options.customTextParameters = jQuery.extend({}, defaults.customTextParameters, options.customTextParameters);
		// options.customImageParameters = jQuery.extend({}, defaults.customImageParameters, options.customImageParameters);
		// options.customAdds = jQuery.extend({}, defaults.customAdds, options.customAdds);
		// options.customImageAjaxSettings = jQuery.extend({}, defaults.customImageAjaxSettings, options.customImageAjaxSettings);
		// options.qrCodeProps = jQuery.extend({}, defaults.qrCodeProps, options.qrCodeProps);
		// options.imageEditorSettings = jQuery.extend({}, defaults.imageEditorSettings, options.imageEditorSettings);
		// options.dynamicViewsOptions = jQuery.extend({}, defaults.dynamicViewsOptions, options.dynamicViewsOptions);
		// options.priceFormat = jQuery.extend({}, defaults.priceFormat, options.priceFormat);
		// options.printingBox = jQuery.extend({}, defaults.printingBox, options.printingBox);

		return options;

	};

	/**
	 * Returns all element parameter keys.
	 *
	 * @method getParameterKeys
	 * @for Options
	 * @return {Array} An array containing all element parameter keys.
	 */
	getParameterKeys() {
        
		var elementParametersKeys = Object.keys(this.defaults.elementParameters),
			imageParametersKeys = Object.keys(this.defaults.imageParameters),
			textParametersKeys = Object.keys(this.defaults.textParameters);

		elementParametersKeys = elementParametersKeys.concat(imageParametersKeys);
		elementParametersKeys = elementParametersKeys.concat(textParametersKeys);

		return elementParametersKeys;

	};

};

/***/ }),

/***/ "./src/ui/UIManager.js":
/*!*****************************!*\
  !*** ./src/ui/UIManager.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ UIManager)
/* harmony export */ });
class UIManager {
    
    constructor(mainOptions = {}) {
        
        this.mainOptions = mainOptions;
        console.log(fetch, mainOptions);
        
        this.#loadTemplate();
        
    }
    
    #loadTemplate() {
        
        fetch(this.mainOptions.templatesDirectory+'productdesigner.html')
        .then(stream => stream.text())
        .then(text => {
            console.log(text);
        })
        
    }
    
    //translates a HTML element
    translateElement(htmlElem) {
    
        let label = '';
        if(this.mainOptions.langJson) {
    
            let objString = '';
    
            if(htmlElem.getAttribute('placeholder')) {
                objString = htmlElem.getAttribute('placeholder');
            }
            else if(htmlElem.getAttribute('title')) {
                objString = htmlElem.getAttribute('title');
            }
            else if(htmlElem.dataset.title) {
                objString = htmlElem.dataset.title;
            }
            else {
                objString = htmlElem.innerText;
            }
    
            var keys = objString.split('.'),
                firstObject = this.mainOptions.langJson[keys[0]];
    
            if(firstObject) { //check if object exists
    
                label = firstObject[keys[1]];
    
                if(label === undefined) { //if label does not exist in JSON, take default text
                    label = htmlElem.dataset.defaulttext;
                }
    
            }
            else {
                label = htmlElem.dataset.defaulttext;
            }
    
        }
        else {
            label = htmlElem.dataset.defaulttext;
        }
    
        if(htmlElem.getAttribute('placeholder')) {
            htmlElem.setAttribute('placeholder', label);
            htmlElem.innerText = '';
        }
        else if(htmlElem.getAttribute('title')) {
            htmlElem.setAttribute('title', label);
        }
        else if(htmlElem.dataset.title) {
            htmlElem.dataset.title = label;
        }
        else {
            htmlElem.innerText = label;
        }
    
        return label;
    
    };
    
}

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "deepMerge": () => (/* binding */ deepMerge)
/* harmony export */ });
const deepMerge = (obj1, obj2) => {
   
    // Create a new object that combines the properties of both input objects
    const merged = {
        ...obj1,
        ...obj2
    };
    
    if(Object.keys(obj2).length) {
        
        // Loop through the properties of the merged object
        for (const key of Object.keys(merged)) {
            // Check if the property is an object
            if (typeof merged[key] === 'object' && merged[key] !== null) {
                // If the property is an object, recursively merge the objects
                if(obj2[key]) {
                    merged[key] = deepMerge(obj1[key], obj2[key]);
                }
                
            }
        }
        
    }
    
    return merged;
}



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ui_less_main_less__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ui/less/main.less */ "./src/ui/less/main.less");
/* harmony import */ var _classes_FancyProductDesigner_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./classes/FancyProductDesigner.js */ "./src/classes/FancyProductDesigner.js");


})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWCxjQUFjLGdCQUFnQjtBQUM5QjtBQUNBLGdCQUFnQixnQkFBZ0IsdUNBQXVDO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNFQUFzRSx3REFBd0Q7QUFDOUg7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYLGNBQWM7QUFDZDtBQUNBLHFCQUFxQixlQUFlO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyS0FBMks7QUFDM0s7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWCxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2RUFBNkUsOEVBQThFO0FBQzNKO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0EsZUFBZSxrQ0FBa0MsbUNBQW1DO0FBQ3BGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0EsMEJBQTBCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FB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L2ZwZC1qcy8uL3NyYy91aS9sZXNzL21haW4ubGVzcyIsIndlYnBhY2s6Ly9mcGQtanMvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2ZwZC1qcy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2ZwZC1qcy8uL3NyYy91aS9sZXNzL21haW4ubGVzcz85NDUxIiwid2VicGFjazovL2ZwZC1qcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9mcGQtanMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL2ZwZC1qcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9mcGQtanMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vZnBkLWpzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vZnBkLWpzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vZnBkLWpzLy4vc3JjL2NsYXNzZXMvRmFuY3lQcm9kdWN0RGVzaWduZXIuanMiLCJ3ZWJwYWNrOi8vZnBkLWpzLy4vc3JjL2NsYXNzZXMvT3B0aW9ucy5qcyIsIndlYnBhY2s6Ly9mcGQtanMvLi9zcmMvdWkvVUlNYW5hZ2VyLmpzIiwid2VicGFjazovL2ZwZC1qcy8uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly9mcGQtanMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZnBkLWpzL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2ZwZC1qcy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZnBkLWpzL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZnBkLWpzL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZnBkLWpzL3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly9mcGQtanMvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJib2R5IHtcXG4gIGJhY2tncm91bmQ6IGJsdWU7XFxufVxcblwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy91aS9sZXNzL21haW4ubGVzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQTtFQUNJLGdCQUFBO0FBQ0pcIixcInNvdXJjZXNDb250ZW50XCI6W1wiYm9keSB7XFxuICAgIGJhY2tncm91bmQ6IGJsdWU7XFxufVwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi8uLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9tYWluLmxlc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi8uLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9tYWluLmxlc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcblxuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdXBkYXRlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cblxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcblxuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cblxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuXG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cblxuICBjc3MgKz0gb2JqLmNzcztcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiaW1wb3J0IE9wdGlvbnMgZnJvbSAnLi9PcHRpb25zLmpzJztcbmltcG9ydCBVSU1hbmFnZXIgZnJvbSAnLi4vdWkvVUlNYW5hZ2VyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmFuY3lQcm9kdWN0RGVzaWduZXIge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKGVsZW0sIG9wdHM9e30pIHtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKGVsZW0sIG9wdHMpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5vcHRpb25zSW5zdGFuY2UgPSBuZXcgT3B0aW9ucygpO1xuICAgICAgICB0aGlzLm1haW5PcHRpb25zID0gdGhpcy5vcHRpb25zSW5zdGFuY2UubWVyZ2UodGhpcy5vcHRpb25zSW5zdGFuY2UuZGVmYXVsdHMsIG9wdHMpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy51aU1hbmFnZXIgPSBuZXcgVUlNYW5hZ2VyKHRoaXMubWFpbk9wdGlvbnMpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy4jaW5pdFVJKCk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAjaW5pdFVJKCkge1xuICAgICAgICBcbiAgICB9XG59XG5cbndpbmRvdy5GYW5jeVByb2R1Y3REZXNpZ25lciA9IEZhbmN5UHJvZHVjdERlc2lnbmVyO1xuXG4iLCJpbXBvcnQgeyBkZWVwTWVyZ2UgfSBmcm9tICcuLi91dGlscyc7XG5cbi8qKlxuICogVGhlIGNsYXNzIGRlZmluaW5nIHRoZSBkZWZhdWx0IG9wdGlvbnMgZm9yIEZhbmN5IFByb2R1Y3QgRGVzaWduZXIuXG4gKlxuICogQGNsYXNzIE9wdGlvbnNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3B0aW9ucyB7XG5cblx0LyoqXG5cdCAqIFRoZSBkZWZhdWx0IG9wdGlvbnMuIFNlZToge3sjY3Jvc3NMaW5rIFwiT3B0aW9ucy5kZWZhdWx0c1wifX17ey9jcm9zc0xpbmt9fVxuXHQgKlxuXHQgKiBAcHJvcGVydHkgZGVmYXVsdHNcblx0ICogQGZvciBPcHRpb25zXG5cdCAqIEB0eXBlIHtPYmplY3R9XG5cdCAqL1xuXHRkZWZhdWx0cyA9IHtcblx0XHRpbWFnZUxvYWRUaW1lc3RhbXA6IGZhbHNlLFxuXHQgICAgLyoqXG5cdFx0KiBUaGUgc3RhZ2UoY2FudmFzKSB3aWR0aCBmb3IgdGhlIHByb2R1Y3QgZGVzaWduZXIuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHN0YWdlV2lkdGhcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge051bWJlcn1cblx0XHQqIEBkZWZhdWx0IFwiOTAwXCJcblx0XHQqL1xuXHRcdHN0YWdlV2lkdGg6IDkwMCxcblx0XHQvKipcblx0XHQqIFRoZSBzdGFnZShjYW52YXMpIGhlaWdodCBmb3IgdGhlIHByb2R1Y3QgZGVzaWduZXIuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHN0YWdlSGVpZ2h0XG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtOdW1iZXJ9XG5cdFx0KiBAZGVmYXVsdCBcIjYwMFwiXG5cdFx0Ki9cblx0XHRzdGFnZUhlaWdodDogNjAwLFxuXHRcdC8qKlxuXHRcdCogRW5hYmxlcyB0aGUgZWRpdG9yIG1vZGUsIHdoaWNoIHdpbGwgYWRkIGEgaGVscGVyIGJveCB1bmRlcm5lYXRoIHRoZSBwcm9kdWN0IGRlc2lnbmVyIHdpdGggc29tZSBvcHRpb25zIG9mIHRoZSBjdXJyZW50IHNlbGVjdGVkIGVsZW1lbnQuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGVkaXRvck1vZGVcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdCovXG5cdFx0ZWRpdG9yTW9kZTogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBUaGUgcHJvcGVydGllcyB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBlZGl0b3IgYm94IHdoZW4gYW4gZWxlbWVudCBpcyBzZWxlY3RlZC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgZWRpdG9yQm94UGFyYW1ldGVyc1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7QXJyYXl9XG5cdFx0KiBAZGVmYXVsdCBbJ2xlZnQnLCAndG9wJywgJ2FuZ2xlJywgJ2ZpbGwnLCAnd2lkdGgnLCAnaGVpZ2h0JywgJ2ZvbnRTaXplJywgJ3ByaWNlJ11cblx0XHQqL1xuXHRcdGVkaXRvckJveFBhcmFtZXRlcnM6IFsnbGVmdCcsICd0b3AnLCAnYW5nbGUnLCAnZmlsbCcsICd3aWR0aCcsICdoZWlnaHQnLCAnZm9udFNpemUnLCAncHJpY2UnXSxcblx0XHQvKipcblx0XHQqIEFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIGF2YWlsYWJsZSBmb250cy48YnIvPlNpbmNlIFY0LjMgeW91IGNhbiB1c2UgVHJ1ZVR5cGUgZm9udHMgKHR0ZiksIHdoaWNoIGlzIGFsc28gcmVjb21tZW5kLiBUcnVlVHlwZSBmb250cyBhcmUgcmVxdWlyZWQgdG8gaW5jbHVkZSB0aGUgZm9udCBpbiB0aGUgUERGIGZvciBGYW5jeSBQcm9kdWN0IERlc2lnbmVyIC0gQWRtaW4sIHNlZSBleGFtcGxlLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBmb250c1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7QWFycmF5fVxuXHRcdCogQGRlZmF1bHQgW3tuYW1lOiAnQXJpYWwnfSwge25hbWU6ICdMb2JzdGVyJywgdXJsOiAnZ29vZ2xlJ31dXG5cdFx0KiBAZXhhbXBsZSA8YnIgLz5be25hbWU6IFwiTG9ic3RlclwiLCB1cmw6IFwiZ29vZ2xlXCJ9LCB7bmFtZTogJ0N1c3RvbScsIHVybDogJ2h0dHBzOi8veW91cmRvbWFpbi5jb20vZm9udHMvY3VzdG9tLnR0ZlwifSwge25hbWU6ICdBbGxlcicsIHVybDogJ3BhdGgvQWxsZXIudHRmJywgdmFyaWFudHM6IHsnbjcnOiAncGF0aC9BbGxlcl9fYm9sZC50dGYnLCdpNCc6ICdwYXRoL0FsbGVyX19pdGFsaWMudHRmJywnaTcnOiAncGF0aC9BbGxlcl9fYm9sZGl0YWxpYy50dGYnfX1dXG5cdFx0Ki9cblx0XHRmb250czogW3tuYW1lOiAnQXJpYWwnfSwge25hbWU6ICdMb2JzdGVyJywgdXJsOiAnZ29vZ2xlJ31dLFxuXHRcdC8qKlxuXHRcdCogVGhlIGRpcmVjdG9yeSBwYXRoIHRoYXQgY29udGFpbnMgdGhlIHRlbXBsYXRlcy5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgdGVtcGxhdGVzRGlyZWN0b3J5XG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0KiBAZGVmYXVsdCAndGVtcGxhdGVzLydcblx0XHQqL1xuXHRcdHRlbXBsYXRlc0RpcmVjdG9yeTogJ2h0bWwvJyxcblx0XHQvKipcblx0XHQqIFRvIGFkZCBwaG90b3MgZnJvbSBGYWNlYm9vaywgeW91IGhhdmUgdG8gc2V0IHlvdXIgb3duIEZhY2Vib29rIEFQSSBrZXkuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGZhY2Vib29rQXBwSWRcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge1N0cmluZ31cblx0XHQqIEBkZWZhdWx0ICcnXG5cdFx0Ki9cblx0XHRmYWNlYm9va0FwcElkOiAnJyxcblx0XHQvKipcblx0XHQqIFRvIGFkZCBwaG90b3MgZnJvbSBJbnN0YWdyYW0sIHlvdSBoYXZlIHRvIHNldCBhbiA8YSBocmVmPVwiaHR0cDovL2luc3RhZ3JhbS5jb20vZGV2ZWxvcGVyL1wiIHRhcmdldD1cIl9ibGFua1wiPkluc3RhZ3JhbSBjbGllbnQgSUQ8L2E+LlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBpbnN0YWdyYW1DbGllbnRJZFxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdCogQGRlZmF1bHQgJydcblx0XHQqL1xuXHRcdGluc3RhZ3JhbUNsaWVudElkOiAnJywgLy90aGUgaW5zdGFncmFtIGNsaWVudCBJRFxuXHRcdC8qKlxuXHRcdCogVGhpcyBVUkkgdG8gdGhlIGh0bWwvaW5zdGFncmFtX2F1dGguaHRtbC4gWW91IGhhdmUgdG8gdXBkYXRlIHRoaXMgb3B0aW9uIGlmIHlvdSBhcmUgdXNpbmcgYSBkaWZmZXJlbnQgZm9sZGVyIHN0cnVjdHVyZS5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgaW5zdGFncmFtUmVkaXJlY3RVcmlcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge1N0cmluZ31cblx0XHQqIEBkZWZhdWx0ICcnXG5cdFx0Ki9cblx0XHRpbnN0YWdyYW1SZWRpcmVjdFVyaTogJycsXG5cdFx0LyoqXG5cdFx0KiBUaGUgVVJJIHRvIHRoZSBzY3JpcHQgdGhhdCBnZXQgdGhlIGFjY2VzcyB0b2tlbiBmcm9tIEluc3RhZ3JhbS4gWW91IG5lZWQgdGhlIGVudGVyIHRoZSBJbnN0YWdyYW0gU2VjcmV0IElELlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBpbnN0YWdyYW1Ub2tlblVyaVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdCogQGRlZmF1bHQgJydcblx0XHQqL1xuXHRcdGluc3RhZ3JhbVRva2VuVXJpOiAnJyxcblx0XHQvKipcblx0XHQqIFRoZSB6b29tIHN0ZXAgd2hlbiB1c2luZyB0aGUgVUkgc2xpZGVyIHRvIGNoYW5nZSB0aGUgem9vbSBsZXZlbC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgem9vbVN0ZXBcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge051bWJlcn1cblx0XHQqIEBkZWZhdWx0IDAuMlxuXHRcdCovXG5cdFx0em9vbVN0ZXA6IDAuMixcblx0XHQvKipcblx0XHQqIFRoZSBtYXhpbWFsIHpvb20gZmFjdG9yLiBTZXQgaXQgdG8gMSB0byBoaWRlIHRoZSB6b29tIGZlYXR1cmUgaW4gdGhlIHVzZXIgaW50ZXJmYWNlLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBtYXhab29tXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtOdW1iZXJ9XG5cdFx0KiBAZGVmYXVsdCAzXG5cdFx0Ki9cblx0XHRtYXhab29tOiAzLFxuXHRcdC8qKlxuXHRcdCogU2V0IGN1c3RvbSBuYW1lcyBmb3IgeW91ciBoZXhkZWNpbWFsIGNvbG9ycy4ga2V5PWhleGNvZGUgd2l0aG91dCAjLCB2YWx1ZTogbmFtZSBvZiB0aGUgY29sb3IuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGhleE5hbWVzXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtPYmplY3R9XG5cdFx0KiBAZGVmYXVsdCB7fVxuXHRcdCogQGV4YW1wbGUgaGV4TmFtZXM6IHswMDAwMDA6ICdkYXJrJyxmZmZmZmY6ICd3aGl0ZSd9XG5cdFx0Ki9cblx0XHRoZXhOYW1lczoge30sXG5cdFx0LyoqXG5cdFx0KiBUaGUgYm9yZGVyIGNvbG9yIG9mIHRoZSBzZWxlY3RlZCBlbGVtZW50LlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBzZWxlY3RlZENvbG9yXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0KiBAZGVmYXVsdCAnI2Q1ZDVkNSdcblx0XHQqL1xuXHRcdHNlbGVjdGVkQ29sb3I6ICcjZjVmNWY1Jyxcblx0XHQvKipcblx0XHQqIFRoZSBib3JkZXIgY29sb3Igb2YgdGhlIGJvdW5kaW5nIGJveC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgYm91bmRpbmdCb3hDb2xvclxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdCogQGRlZmF1bHQgJyMwMDVlZGUnXG5cdFx0Ki9cblx0XHRib3VuZGluZ0JveENvbG9yOiAnIzIxODVkMCcsXG5cdFx0LyoqXG5cdFx0KiBUaGUgYm9yZGVyIGNvbG9yIG9mIHRoZSBlbGVtZW50IHdoZW4gaXRzIG91dHNpZGUgb2YgaGlzIGJvdW5kaW5nIGJveC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgb3V0T2ZCb3VuZGFyeUNvbG9yXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0KiBAZGVmYXVsdCAnIzk5MDAwMCdcblx0XHQqL1xuXHRcdG91dE9mQm91bmRhcnlDb2xvcjogJyM5OTAwMDAnLFxuXHRcdC8qKlxuXHRcdCogSWYgdHJ1ZSBvbmx5IHRoZSBpbml0aWFsIGVsZW1lbnRzIHdpbGwgYmUgcmVwbGFjZWQgd2hlbiBjaGFuZ2luZyB0aGUgcHJvZHVjdC4gQ3VzdG9tIGFkZGVkIGVsZW1lbnRzIHdpbGwgbm90IGJlIHJlbW92ZWQuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHJlcGxhY2VJbml0aWFsRWxlbWVudHNcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdCovXG5cdFx0cmVwbGFjZUluaXRpYWxFbGVtZW50czogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBJZiB0cnVlIGxhenkgbG9hZCB3aWxsIGJlIHVzZWQgZm9yIHRoZSBpbWFnZXMgaW4gdGhlIFwiRGVzaWduc1wiIG1vZHVsZSBhbmQgXCJDaGFuZ2UgUHJvZHVjdFwiIG1vZHVsZS5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgbGF6eUxvYWRcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0KiBAZGVmYXVsdCB0cnVlXG5cdFx0Ki9cblx0XHRsYXp5TG9hZDogdHJ1ZSxcblx0XHQvKipcblx0XHQqIERlZmluZXMgdGhlIGZpbGUgdHlwZSB1c2VkIGZvciB0aGUgdGVtcGxhdGVzLiBFLmcuIGlmIHlvdSB3YW50IHRvIGNvbnZlcnQgYWxsIHRlbXBsYXRlIGZpbGVzIChwcm9kdWN0ZGVzaWduZXIuaHRtbCBhbmQgY2FudmFzZXJyb3IuaHRtbCkgaW50byBQSFAgZmlsZXMsIHlvdSBuZWVkIHRvIGNoYW5nZSB0aGlzIG9wdGlvbiB0byAncGhwJy5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgdGVtcGxhdGVzVHlwZVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdCogQGRlZmF1bHQgJ2h0bWwnXG5cdFx0Ki9cblx0XHR0ZW1wbGF0ZXNUeXBlOiAnaHRtbCcsXG5cdFx0LyoqXG5cdFx0KiBBbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgc2V0dGluZ3MgZm9yIHRoZSBBSkFYIHBvc3Qgd2hlbiBhIGN1c3RvbSBhZGRlZCBpbWFnZSBpcyBhZGRlZCB0byB0aGUgY2FudmFzIChVcGxvYWRlZCBJbWFnZXMsIEZhY2Vib29rL0luc3RhZ3JhbSBQaG90b3MpLiBUaGlzIGFsbG93cyB0byBzZW5kIHRoZSBVUkwgb2YgdGhlIGltYWdlIHRvIGEgY3VzdG9tLWJ1aWx0IHNjcmlwdCwgdGhhdCByZXR1cm5zIHRoZSBkYXRhIFVSSSBvZiB0aGUgaW1hZ2Ugb3IgdXBsb2FkcyB0aGUgaW1hZ2UgdG8geW91ciBzZXJ2ZXIgYW5kIHJldHVybnMgdGhlIG5ldyBVUkwgb24geW91ciBzZXJ2ZXIuIEJ5IGRlZmF1bHQgdGhlIFVSTCBpcyBzZW5kIHRvIHBocC9jdXN0b20taW1hZ2UtaGFuZGxlci5waHAuIFNlZSB0aGUgPGEgaHJlZj1cImh0dHA6Ly9hcGkuanF1ZXJ5LmNvbS9qcXVlcnkuYWpheC9cIiB0YXJnZXQ9XCJfYmxhbmtcIj5vZmZpY2lhbCBqUXVlcnkuYWpheCBkb2N1bWVudGF0aW9uPC9hPiBmb3IgbW9yZSBpbmZvcm1hdGlvbi4gVGhlIGRhdGEgb2JqZWN0IGhhcyBhIHJlc2VydmVkIHByb3BlcnR5IGNhbGxlZCB1cmwsIHdoaWNoIGlzIHRoZSBpbWFnZSBVUkwgdGhhdCB3aWxsIHNlbmQgdG8gdGhlIHNjcmlwdC4gVGhlIHN1Y2Nlc3MgZnVuY3Rpb24gaXMgYWxzbyByZXNlcnZlZC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgY3VzdG9tSW1hZ2VBamF4U2V0dGluZ3Ncblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge09iamVjdH1cblx0XHQqIEBleGFtcGxlXG5cdFx0KiA8cHJlPiBjdXN0b21JbWFnZUFqYXhTZXR0aW5nczogezxiciAvPiAgdXJsOiAnc3JjL3BocC9jdXN0b20taW1hZ2UtaGFuZGxlci5waHAnLDxiciAvPiAgZGF0YTogezxici8+ICAgc2F2ZU9uU2VydmVyOiAxLCAvL2ltYWdlIGlzIHVwbG9hZGVkIHRvIHlvdXIgc2VydmVyIDxici8+ICAgdXBsb2Fkc0RpcjogJy9wYXRoL3RvL3VwbG9hZHNfZGlyJywgLy9pbnRvIHRoaXMgZGlyZWN0b3J5IDxici8+ICAgdXBsb2Fkc0RpclVSTDogJ2h0dHA6Ly95b3VyZG9tYWluLmNvbS91cGxvYWRzX2RpcicgLy9hbmQgcmV0dXJucyB0aGUgbmV3IFVSTCBmcm9tIHRoaXMgbG9jYXRpb24gPGJyIC8+fX08L3ByZT5cblx0XHQqL1xuXHRcdGN1c3RvbUltYWdlQWpheFNldHRpbmdzOiB7XG5cdFx0XHQvKipcblx0XHRcdCogVGhlIFVSTCB0byB0aGUgY3VzdG9tLWltYWdlLWhhbmRsZXIucGhwXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSB1cmxcblx0XHRcdCogQHR5cGUge1N0cmluZ31cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmN1c3RvbUltYWdlQWpheFNldHRpbmdzXG5cdFx0XHQqIEBkZWZhdWx0ICdwaHAvY3VzdG9tLWltYWdlLWhhbmRsZXIucGhwJ1xuXHRcdFx0Ki9cblx0XHRcdHVybDogJ3BocC9jdXN0b20taW1hZ2UtaGFuZGxlci5waHAnLFxuXHRcdFx0LyoqXG5cdFx0XHQqIFRoZSBIVFRQIG1ldGhvZCB0byB1c2UgZm9yIHRoZSByZXF1ZXN0LlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgbWV0aG9kXG5cdFx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5jdXN0b21JbWFnZUFqYXhTZXR0aW5nc1xuXHRcdFx0KiBAZGVmYXVsdCAnUE9TVCdcblx0XHRcdCovXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdC8qKlxuXHRcdFx0KiBUaGUgdHlwZSBvZiBkYXRhIHRoYXQgeW91J3JlIGV4cGVjdGluZyBiYWNrIGZyb20gdGhlIHNlcnZlci5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IGRhdGFUeXBlXG5cdFx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5jdXN0b21JbWFnZUFqYXhTZXR0aW5nc1xuXHRcdFx0KiBAZGVmYXVsdCAnanNvbidcblx0XHRcdCovXG5cdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0LyoqXG5cdFx0XHQqIFRoZSBkYXRhIG9iamVjdCBzZW50IHRvIHRoZSBzZXJ2ZXIuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBkYXRhXG5cdFx0XHQqIEB0eXBlIHtPYmplY3R9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5jdXN0b21JbWFnZUFqYXhTZXR0aW5nc1xuXHRcdFx0KiBAZGVmYXVsdCB7XG5cdFx0XHRcdHNhdmVPblNlcnZlcjogMCwgLSB1c2UgaW50ZWdlciBhcyBib29sZWFuIHZhbHVlLiAwPWZhbHNlLCAxPXRydWVcblx0XHRcdFx0dXBsb2Fkc0RpcjogJy4vdXBsb2FkcycsIC0gaWYgc2F2ZU9uU2VydmVyIGlzIDEsIHlvdSBuZWVkIHRvIHNwZWNpZnkgdGhlIGRpcmVjdG9yeSBwYXRoIHdoZXJlIHRoZSBpbWFnZXMgYXJlIHNhdmVkXG5cdFx0XHRcdHVwbG9hZHNEaXJVUkw6ICdodHRwOi8veW91cmRvbWFpbi5jb20vdXBsb2FkcycgLSBpZiBzYXZlT25TZXJ2ZXIgaXMgMSwgeW91IG5lZWQgdG8gc3BlY2lmeSB0aGUgZGlyZWN0b3J5IFVSTCB3aGVyZSB0aGUgaW1hZ2VzIGFyZSBzYXZlZFxuXHRcdFx0fVxuXHRcdFx0Ki9cblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0c2F2ZU9uU2VydmVyOiAwLCAvL3VzZSBpbnRlZ2VyIGFzIGJvb2xlYW4gdmFsdWUuIDA9ZmFsc2UsIDE9dHJ1ZVxuXHRcdFx0XHR1cGxvYWRzRGlyOiAnLi91cGxvYWRzJywgLy9pZiBzYXZlT25TZXJ2ZXIgaXMgdHJ1ZSwgeW91IG5lZWQgdG8gc3BlY2lmeSB0aGUgZGlyZWN0b3J5IHBhdGggd2hlcmUgdGhlIGltYWdlcyBhcmUgc2F2ZWRcblx0XHRcdFx0dXBsb2Fkc0RpclVSTDogJ2h0dHA6Ly95b3VyZG9tYWluLmNvbS91cGxvYWRzJyAvL2lmIHNhdmVPblNlcnZlciBpcyB0cnVlLCB5b3UgbmVlZCB0byBzcGVjaWZ5IHRoZSBkaXJlY3RvcnkgVVJMIHdoZXJlIHRoZSBpbWFnZXMgYXJlIHNhdmVkXG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvKipcblx0XHQqIEVuYWJsZSBhbiBpbXByb3ZlZCByZXNpemUgZmlsdGVyLCB0aGF0IG1heSBpbXByb3ZlIHRoZSBpbWFnZSBxdWFsaXR5IHdoZW4gaXRzIHJlc2l6ZWQuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGltcHJvdmVkUmVzaXplUXVhbGl0eVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0Ki9cblx0XHRpbXByb3ZlZFJlc2l6ZVF1YWxpdHk6IGZhbHNlLFxuXHRcdC8qKlxuXHRcdCogTWFrZSB0aGUgY2FudmFzIGFuZCB0aGUgZWxlbWVudHMgaW4gdGhlIGNhbnZhcyByZXNwb25zaXZlLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSByZXNwb25zaXZlXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgdHJ1ZVxuXHRcdCovXG5cdFx0cmVzcG9uc2l2ZTogdHJ1ZSxcblx0XHQvKipcblx0XHQqIEhleCBjb2xvciB2YWx1ZSBkZWZpbmluZyB0aGUgY29sb3IgZm9yIHRoZSBjb3JuZXIgaWNvbiBjb250cm9scy5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgY29ybmVySWNvbkNvbG9yXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0KiBAZGVmYXVsdCAnIzAwMDAwMCdcblx0XHQqL1xuXHRcdGNvcm5lckljb25Db2xvcjogJyMwMDAwMDAnLCAvL2hleFxuXHRcdC8qKlxuXHRcdCogVGhlIFVSTCB0byB0aGUgSlNPTiBmaWxlIG9yIGFuIG9iamVjdCBjb250YWluaW5nIGFsbCBjb250ZW50IGZyb20gdGhlIEpTT04gZmlsZS4gU2V0IHRvIGZhbHNlLCBpZiB5b3UgZG8gbm90IG5lZWQgaXQuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGxhbmdKU09OXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmcgfCBPYmplY3QgfCBCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgJ2xhbmcvZGVmYXVsdC5qc29uJ1xuXHRcdCovXG5cdFx0bGFuZ0pTT046ICdsYW5nL2RlZmF1bHQuanNvbicsXG5cdFx0LyoqXG5cdFx0KiBUaGUgY29sb3IgcGFsZXR0ZSB3aGVuIHRoZSBjb2xvciB3aGVlbCBpcyBkaXNwbGF5ZWQuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGNvbG9yUGlja2VyUGFsZXR0ZVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7QXJyYXl9XG5cdFx0KiBAZGVmYXVsdCBbXVxuXHRcdCogQGV4YW1wbGUgWycjMDAwJywgJyNmZmYnXVxuXHRcdCovXG5cdFx0Y29sb3JQaWNrZXJQYWxldHRlOiBbXSwgLy93aGVuIGNvbG9ycGlja2VyIGlzIGVuYWJsZWQsIHlvdSBjYW4gZGVmaW5lIGEgZGVmYXVsdCBwYWxldHRlXG5cdFx0LyoqXG5cdFx0KiBBbiBvYmplY3QgZGVmaW5pbmcgdGhlIGF2YWlsYWJsZSBhY3Rpb25zIGluIHRoZSBkaWZmZXJlbnQgem9uZXMuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGFjdGlvbnNcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge09iamVjdH1cblx0XHQqIEBkZWZhdWx0IHsndG9wJzogW10sICdyaWdodCc6IFtdLCAnYm90dG9tJzogW10sICdsZWZ0JzogW119XG5cdFx0KiBAZXhhbXBsZSB7J3RvcCc6IFsnbWFuYWdlLWxheWVycyddLCAncmlnaHQnOiBbJ2luZm8nXSwgJ2JvdHRvbSc6IFsndW5kbycsICdyZWRvJ10sICdsZWZ0JzogW119XG5cdFx0Ki9cblx0XHRhY3Rpb25zOiAge1xuXHRcdFx0J3RvcCc6IFtdLFxuXHRcdFx0J3JpZ2h0JzogW10sXG5cdFx0XHQnYm90dG9tJzogW10sXG5cdFx0XHQnbGVmdCc6IFtdXG5cdFx0fSxcblx0XHQvKipcblx0XHQqIEFuIGFycmF5IGRlZmluaW5nIHRoZSBhdmFpbGFibGUgbW9kdWxlcyBpbiB0aGUgbWFpbiBiYXIuIFBvc3NpYmxlIHZhbHVlczogJ3Byb2R1Y3RzJywgJ2ltYWdlcycsICd0ZXh0JywgJ2Rlc2lnbnMnLiAnbmFtZXMtbnVtYmVycycsICdkcmF3aW5nJyByZXF1aXJlcyBGYW5jeSBQcm9kdWN0IERlc2lnbmVyIFBsdXMgQWRkLU9uLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBtYWluQmFyTW9kdWxlc1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7QXJyYXl9XG5cdFx0KiBAZGVmYXVsdCBbJ3Byb2R1Y3RzJywgJ2ltYWdlcycsICd0ZXh0JywgJ2Rlc2lnbnMnXVxuXHRcdCovXG5cdFx0bWFpbkJhck1vZHVsZXM6IFsncHJvZHVjdHMnLCAnaW1hZ2VzJywgJ3RleHQnLCAnZGVzaWducycsICdtYW5hZ2UtbGF5ZXJzJ10sXG5cdFx0LyoqXG5cdFx0KiBTZXQgdGhlIGluaXRpYWwgYWN0aXZlIG1vZHVsZS5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgaW5pdGlhbEFjdGl2ZU1vZHVsZVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdCogQGRlZmF1bHQgJydcblx0XHQqL1xuXHRcdGluaXRpYWxBY3RpdmVNb2R1bGU6ICcnLFxuXHRcdC8qKlxuXHRcdCogQW4gb2JqZWN0IGRlZmluaW5nIHRoZSBtYXhpbXVtIHZhbHVlcyBmb3IgaW5wdXQgZWxlbWVudHMgaW4gdGhlIHRvb2xiYXIuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IG1heFZhbHVlc1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdCogQGRlZmF1bHQge31cblx0XHQqL1xuXHRcdG1heFZhbHVlczoge30sXG5cdFx0LyoqXG5cdFx0KiBTZXQgYSB3YXRlcm1hcmsgaW1hZ2Ugd2hlbiB0aGUgdXNlciBkb3dubG9hZHMvcHJpbnRzIHRoZSBwcm9kdWN0IHZpYSB0aGUgYWN0aW9ucy4gVG8gcGFzcyBhIHdhdGVybWFyaywganVzdCBlbnRlciBhIHN0cmluZyB3aXRoIGFuIGltYWdlIFVSTC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgd2F0ZXJtYXJrXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFuIHwgU3RyaW5nfVxuXHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHQqL1xuXHRcdHdhdGVybWFyazogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBUaGUgbnVtYmVyIG9mIGNvbHVtbnMgdXNlZCBmb3IgdGhlIGdyaWQgaW1hZ2VzIGluIHRoZSBpbWFnZXMgYW5kIGRlc2lnbnMgbW9kdWxlLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBncmlkQ29sdW1uc1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7TnVtYmVyfVxuXHRcdCogQGRlZmF1bHQgMlxuXHRcdCovXG5cdFx0Z3JpZENvbHVtbnM6IDIsXG5cdFx0LyoqXG5cdFx0KiBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgY3VycmVuY3kgc3RyaW5nKHVzZSAlZCBhcyBwbGFjZWhvbGRlciBmb3IgcHJpY2UpLCBkZWNpbWFsIHNlcGFyYXRvciBhbmQgdGhvdXNhbmQgc2VwYXJhdG9yLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBwcmljZUZvcm1hdFxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7T2JqZWN0fVxuXHRcdCogQGRlZmF1bHQge2N1cnJlbmN5OiAnJiMzNjslZCcsIGRlY2ltYWxTZXA6ICcuJywgdGhvdXNhbmRTZXA6ICcsJ31cblx0XHQqL1xuXHRcdHByaWNlRm9ybWF0OiB7Y3VycmVuY3k6ICcmIzM2OyVkJywgZGVjaW1hbFNlcDogJy4nLCB0aG91c2FuZFNlcDogJywnfSxcblx0XHQvKipcblx0XHQqIFRoZSBJRCBvZiBhbiBlbGVtZW50IHRoYXQgd2lsbCBiZSB1c2VkIGFzIGNvbnRhaW5lciBmb3IgdGhlIG1haW4gYmFyLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBtYWluQmFyQ29udGFpbmVyXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFuIHwgU3RyaW5nfVxuXHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHQqIEBleGFtcGxlICNjdXN0b21NYWluQmFyQ29udGFpbmVyXG5cdFx0Ki9cblx0XHRtYWluQmFyQ29udGFpbmVyOiBmYWxzZSxcblx0XHQvKipcblx0XHQqIFRoZSBJRCBvZiBhbiBlbGVtZW50IHRoYXQgd2lsbCBiZSB1c2VkIHRvIG9wZW4gdGhlIG1vZGFsLCBpbiB3aGljaCB0aGUgZGVzaWduZXIgaXMgaW5jbHVkZWQuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IG1vZGFsTW9kZVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7Qm9vbGVhbiB8IFN0cmluZ31cblx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0KiBAZXhhbXBsZSAjbW9kYWxCdXR0b25cblx0XHQqL1xuXHRcdG1vZGFsTW9kZTogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBFbmFibGUga2V5Ym9hcmQgY29udHJvbC4gVXNlIGFycm93IGtleXMgdG8gbW92ZSBhbmQgYmFja3NwYWNlIGtleSB0byBkZWxldGUgc2VsZWN0ZWQgZWxlbWVudC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkga2V5Ym9hcmRDb250cm9sXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgdHJ1ZVxuXHRcdCovXG5cdFx0a2V5Ym9hcmRDb250cm9sOiB0cnVlLFxuXHRcdC8qKlxuXHRcdCogRGVzZWxlY3QgYWN0aXZlIGVsZW1lbnQgd2hlbiBjbGlja2luZyBvdXRzaWRlIG9mIHRoZSBwcm9kdWN0IGRlc2lnbmVyLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBkZXNlbGVjdEFjdGl2ZU9uT3V0c2lkZVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHQqIEBkZWZhdWx0IHRydWVcblx0XHQqL1xuXHRcdGRlc2VsZWN0QWN0aXZlT25PdXRzaWRlOiB0cnVlLFxuXHRcdC8qKlxuXHRcdCogQWxsIHVwbG9hZCB6b25lcyB3aWxsIGJlIGFsd2F5cyBvbiB0b3Agb2YgYWxsIGVsZW1lbnRzLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSB1cGxvYWRab25lc1RvcHBlZFxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHQqIEBkZWZhdWx0IHRydWVcblx0XHQqL1xuXHRcdHVwbG9hZFpvbmVzVG9wcGVkOiB0cnVlLFxuXHRcdC8qKlxuXHRcdCogTG9hZHMgdGhlIGZpcnN0IGluaXRpYWwgcHJvZHVjdCBpbnRvIHN0YWdlLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBsb2FkRmlyc3RQcm9kdWN0SW5TdGFnZVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHQqIEBkZWZhdWx0IHRydWVcblx0XHQqL1xuXHRcdGxvYWRGaXJzdFByb2R1Y3RJblN0YWdlOiB0cnVlLFxuXHRcdC8qKlxuXHRcdCogSWYgdGhlIHVzZXIgbGVhdmVzIHRoZSBwYWdlIHdpdGhvdXQgc2F2aW5nIHRoZSBwcm9kdWN0IG9yIHRoZSBnZXRQcm9kdWN0KCkgbWV0aG9kIGlzIG5vdCwgYSBhbGVydCB3aW5kb3cgd2lsbCBwb3AgdXAuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHVuc2F2ZWRQcm9kdWN0QWxlcnRcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdCovXG5cdFx0dW5zYXZlZFByb2R1Y3RBbGVydDogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBJZiB0aGUgdXNlciBhZGRzIHNvbWV0aGluZyBhbmQgb2ZmLWNhbnZhcyBwYW5lbCBvciBkaWFsb2cgaXMgb3BlbmVkLCBpdCB3aWxsIGJlIGNsb3NlZC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgaGlkZURpYWxvZ09uQWRkXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgdHJ1ZVxuXHRcdCovXG5cdFx0aGlkZURpYWxvZ09uQWRkOiB0cnVlLFxuXHRcdC8qKlxuXHRcdCogU2V0IHRoZSBwbGFjZW1lbnQgb2YgdGhlIHRvb2xiYXIuIEZvciBzbWFydHBob25lcyB0aGUgdG9vbGJhciB3aWxsIGJlIGZpeGVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHBhZ2UuIFBvc3NpYmxlIHZhbHVlczonc21hcnQnLCAnaW5zaWRlLWJvdHRvbScsICdpbnNpZGUtdG9wJ1xuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSB0b29sYmFyUGxhY2VtZW50XG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0KiBAZGVmYXVsdCAnc21hcnQnXG5cdFx0Ki9cblx0XHR0b29sYmFyUGxhY2VtZW50OiAnc21hcnQnLFxuXHRcdC8qKlxuXHRcdCogVGhlIGdyaWQgc2l6ZSBmb3Igc25hcCBhY3Rpb24uIEZpcnN0IHZhbHVlIGRlZmluZXMgdGhlIHdpZHRoIG9uIHRoZSBhLWF4aXMsIHRoZSBzZWNvbmQgb24gdGhlIHktYXhpcy5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgc25hcEdyaWRTaXplXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtBcnJheX1cblx0XHQqIEBkZWZhdWx0IFs1MCwgNTBdXG5cdFx0Ki9cblx0XHRzbmFwR3JpZFNpemU6IFs1MCwgNTBdLFxuXHRcdC8qKlxuXHRcdCogQW4gb2JqZWN0IGNvbnRhaW5pbmcgPGEgaHJlZj1cImh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuQ2FudmFzLmh0bWxcIiB0YXJnZXQ9XCJfYmxhbmtcIj5vcHRpb25zIGZvciB0aGUgZmFicmljanMgY2FudmFzPC9hPi5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgZmFicmljQ2FudmFzT3B0aW9uc1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7T2JqZWN0fVxuXHRcdCogQGRlZmF1bHQge31cblx0XHQqL1xuXHRcdGZhYnJpY0NhbnZhc09wdGlvbnM6IHt9LFxuXHRcdC8qKlxuXHRcdCogRGVmaW5lcyB0aGUgdmFsdWVzIGZvciB0aGUgc2VsZWN0IGVsZW1lbnQgaW4gdGhlIG5hbWVzICYgbnVtYmVycyBtb2R1bGUuIFJlcXVpcmVzIEZhbmN5IFByb2R1Y3QgRGVzaWduZXIgUGx1cyBBZGQtT24uXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IG5hbWVzTnVtYmVyc0Ryb3Bkb3duXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtBcnJheX1cblx0XHQqIEBkZWZhdWx0IFtdXG5cdFx0Ki9cblx0XHRuYW1lc051bWJlcnNEcm9wZG93bjogW10sXG5cdFx0LyoqXG5cdFx0KiBTZXRzIHByaWNlIGZvciBhbnkgZXh0cmEgZW50cnkgaW4gdGhlIG5hbWVzICYgbnVtYmVycyBtb2R1bGUuIFJlcXVpcmVzIEZhbmN5IFByb2R1Y3QgRGVzaWduZXIgUGx1cyBBZGQtT24uXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IG5hbWVzTnVtYmVyc0VudHJ5UHJpY2Vcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge051bWJlcn1cblx0XHQqIEBkZWZhdWx0IDBcblx0XHQqL1xuXHRcdG5hbWVzTnVtYmVyc0VudHJ5UHJpY2U6IDAsXG5cdFx0LyoqXG5cdFx0KiBTZXRzIHRoZSBwbGFjZW1lbnQgZm9yIHRoZSBjb2xvciBzZWxlY3Rpb24sIHBvc3NpYmxlIHZhbHVlczogJ2luc2lkZS10bCcsICdpbnNpZGUtdGMnLCAnaW5zaWRlLXRyJywgJ2luc2lkZS1ibCcsICdpbnNpZGUtYmMnLCAnaW5zaWRlLWJyJyBvciBJRCBvZiBhbm90aGVyIGVsZW1lbnQoI215LWNvbG9yLXNlbGVjdGlvbikuIFJlcXVpcmVzIEZhbmN5IFByb2R1Y3QgRGVzaWduZXIgUGx1cyBBZGQtT24uXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGNvbG9yU2VsZWN0aW9uUGxhY2VtZW50XG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0KiBAZGVmYXVsdCAnJ1xuXHRcdCovXG5cdFx0Y29sb3JTZWxlY3Rpb25QbGFjZW1lbnQ6ICcnLFxuXHRcdC8qKlxuXHRcdCogU2V0cyB0aGUgZGlzcGxheSB0eXBlIGZvciB0aGUgY29sb3Igc2VsZWN0aW9uLiBCeSBkZWZhdWx0IHRoZSBjb2xvciBpdGVtcyB3aWxsIGJlIHNob3duIGluIGEgZ3JpZC4gWW91IGNhbiBhbHNvIGVuYWJsZSBhIGRyb3Bkb3duIGZvciB0aGUgY29sb3Igc2VsZWN0aW9uLCBidXQgdGhpcyBpcyBvbmx5IHdvcmtpbmcgd2hlbiB1c2luZyBhIGN1c3RvbSBlbGVtZW50IGluIGNvbG9yU2VsZWN0aW9uUGxhY2VtZW50LiBQb3NzaWJsZSB2YWx1ZXM6IGdyaWQsIGRyb3Bkb3duLiBSZXF1aXJlcyBGYW5jeSBQcm9kdWN0IERlc2lnbmVyIFBsdXMgQWRkLU9uLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBjb2xvclNlbGVjdGlvbkRpc3BsYXlUeXBlXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0KiBAZGVmYXVsdCAnZ3JpZCdcblx0XHQqIEB2ZXJzaW9uIFBMVVMgMS4xLjFcblx0XHQqL1xuXHRcdGNvbG9yU2VsZWN0aW9uRGlzcGxheVR5cGU6ICdncmlkJyxcblx0XHQvKipcblx0XHQqIFNldHMgdGhlIHBsYWNlbWVudCBmb3IgdGhlIEJ1bGstQWRkIFZhcmlhdGlvbnMgRm9ybS4gSnVzdCBlbnRlciBJRCBvciBjbGFzcyBvZiBhbm90aGVyIGVsZW1lbnQoI215LWNvbG9yLXNlbGVjdGlvbikuIFJlcXVpcmVzIEZhbmN5IFByb2R1Y3QgRGVzaWduZXIgUGx1cyBBZGQtT24uXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGJ1bGtWYXJpYXRpb25zUGxhY2VtZW50XG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0KiBAZGVmYXVsdCAnJ1xuXHRcdCovXG5cdFx0YnVsa1ZhcmlhdGlvbnNQbGFjZW1lbnQ6ICcnLFxuXHRcdC8qKlxuXHRcdCogVGhlIGF2YWlsYWJsZSB2YXJpYXRpb25zIGZvciB0aGUgQnVsay1BZGQgVmFyaWF0aW9ucyBGb3JtLCBlLmcuOiB7J1NpemUnOiBbJ1hMJywgJ0wnLCAnTScsICdTJ10sICdDb2xvcic6IFsnUmVkJywgJ0JsdWUnXX0uIFJlcXVpcmVzIEZhbmN5IFByb2R1Y3QgRGVzaWduZXIgUGx1cyBBZGQtT24uXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGJ1bGtWYXJpYXRpb25zXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtPYmplY3R9XG5cdFx0KiBAZGVmYXVsdCB7fVxuXHRcdCovXG5cdFx0YnVsa1ZhcmlhdGlvbnM6IHt9LFxuXHRcdC8qKlxuXHRcdCogVGhlIGVsZW1lbnQgd2hlcmUgdGhlIHRvb2xiYXIgd2lsbCBiZSBhcHBlbmRlZCB3aGVuIHRvb2xiYXJQbGFjZW1lbnQ9J3NtYXJ0Jy5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgdG9vbGJhckR5bmFtaWNDb250ZXh0XG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0KiBAZGVmYXVsdCAnYm9keSdcblx0XHQqL1xuXHRcdHRvb2xiYXJEeW5hbWljQ29udGV4dDogJ2JvZHknLFxuXHRcdC8qKlxuXHRcdCogQWRkdGlvbmFsIHByb3BlcnRpZXMgZm9yIHRoZSBib3VuZGluZyBib3guIENhbiBiZSB1c2VkIHRvIHNldCB0aGUgc3Ryb2tlIHdpZHRoIGV0Yy4uIFNlZSBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLlJlY3QuaHRtbFxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBib3VuZGluZ0JveFByb3BzXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtPYmplY3R9XG5cdFx0KiBAZGVmYXVsdCB7c3Ryb2tlV2lkdGg6IDF9XG5cdFx0Ki9cblx0XHRib3VuZGluZ0JveFByb3BzOiB7c3Ryb2tlV2lkdGg6IDF9LFxuXHRcdC8qKlxuXHRcdCogSWYgdGhlIGltYWdlIChjdXN0b20gdXBsb2FkZWQgb3IgZGVzaWduKSBpcyBsYXJnZXIgdGhhbiB0aGUgY2FudmFzLCBpdCB3aWxsIGJlIHNjYWxlZCBkb3duIHRvIGZpdCBpbnRvIHRoZSBjYW52YXMuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGZpdEltYWdlc0luQ2FudmFzXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHQqL1xuXHRcdGZpdEltYWdlc0luQ2FudmFzOiBmYWxzZSxcblx0XHQvKipcblx0XHQqIFNldCBhIG1heGltdW0gcHJpY2UgZm9yIGFsbCBwcm9kdWN0cyBvciBmb3Igc3BlY2lmaWMgdmlld3MuIC0xIGRpc2FibGVzIHRoZSBtYXguIHByaWNlLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBtYXhQcmljZVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7TnVtYmVyfVxuXHRcdCogQGRlZmF1bHQgLTFcblx0XHQqL1xuXHRcdG1heFByaWNlOiAtMSxcblx0XHQvKipcblx0XHQqIFRoZSB0ZXh0IGNhbiBiZSBlZGl0ZWQgaW4gdGhlIGNhbnZhcyBieSBkb3VibGUgY2xpY2svdGFwLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBpbkNhbnZhc1RleHRFZGl0aW5nXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgdHJ1ZVxuXHRcdCovXG5cdFx0aW5DYW52YXNUZXh0RWRpdGluZzogdHJ1ZSxcblx0XHQvKipcblx0XHQqIFRoZSB0ZXh0IGlucHV0IGluIHRoZSB0b29sYmFyIHdoZW4gYmUgb3BlbmVkIHdoZW4gYW4gZWRpdGFibGUgdGV4dCBpcyBzZWxlY3RlZC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgb3BlblRleHRJbnB1dE9uU2VsZWN0XG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHQqL1xuXHRcdG9wZW5UZXh0SW5wdXRPblNlbGVjdDogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBBbiBhcnJheSBvZiBkZXNpZ24gY2F0ZWdvcnkgdGl0bGVzIChvbmx5IHRvcC1sZXZlbCBjYXRlZ29yaWVzKSB0byBlbmFibGUgcGFydGljdWxhciBkZXNpZ24gY2F0ZWdvcmllcyBmb3IgYW4gdXBsb2FkIHpvbmUgb3IgZm9yIHRoZSB2aWV3LiBBbiBlbXB0eSBhcnJheSB3aWxsIGVuYWJsZSBhbGwgZGVzaWduIGNhdGVnb3JpZXMuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGRlc2lnbkNhdGVnb3JpZXNcblx0XHQqIEB0eXBlIHtBcnJheX1cblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQGRlZmF1bHQgW11cblx0XHQqL1xuXHRcdGRlc2lnbkNhdGVnb3JpZXM6IFtdLFxuXHRcdC8qKlxuXHRcdCogV2lsbCBtYWtlIHRoZSB2aWV3KHMpIG9wdGlvbmFsLCBzbyB0aGUgdXNlciBoYXZlIHRvIHVubG9jayBpdC4gVGhlIHByaWNlIGZvciB0aGUgZWxlbWVudHMgaW4gdGhlIHZpZXcgd2lsbCBiZSBhZGRlZCB0byB0aGUgdG90YWwgcHJvZHVjdCBwcmljZSBhcyBzb29uIGFzIHRoZSB2aWV3IGlzIHVubG9ja2VkLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBvcHRpb25hbFZpZXdcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdCovXG5cdFx0b3B0aW9uYWxWaWV3OiBmYWxzZSxcblx0XHQvKipcblx0XHQqIFdoZW4gdXNpbmcgdGhlIHNhdmUvbG9hZCBhY3Rpb25zLCBzdG9yZSB0aGUgcHJvZHVjdCBpbiB1c2VyJ3MgYnJvd3NlciBzdG9yYWdlLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBzYXZlQWN0aW9uQnJvd3NlclN0b3JhZ2Vcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0KiBAZGVmYXVsdCB0cnVlXG5cdFx0Ki9cblx0XHRzYXZlQWN0aW9uQnJvd3NlclN0b3JhZ2U6IHRydWUsXG5cdFx0LyoqXG5cdFx0KiBBbiBhcnJheSBjb250YWluaW5nIHRoZSBwcmljaW5nIHJ1bGVzIGdyb3Vwcy4gVXNlIHRoZSA8YSBocmVmPVwiaHR0cDovL2ZhbmN5cHJvZHVjdGRlc2lnbmVyLmNvbS9hZGRvbi1wcmljaW5nLXJ1bGVzL1wiIHRhcmdldD1cIl9ibGFua1wiIHN0eWxlPVwidGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XCI+b25saW5lIHRvb2wgdG8gZ2VuZXJhdGUgcHJpY2luZyBydWxlczwvYT4uIFJlcXVpcmVzIEZhbmN5IFByb2R1Y3QgRGVzaWduZXIgUHJpY2luZyBBZGQtT24uXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHByaWNpbmdSdWxlc1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7QXJyYXl9XG5cdFx0KiBAZGVmYXVsdCBbXVxuXHRcdCovXG5cdFx0cHJpY2luZ1J1bGVzOiBbXSxcblx0XHQvKipcblx0XHQqIEVuYWJsZXMgYW4gYWdyZWVtZW50IG1vZGFsIHRoYXQgbmVlZHMgdG8gYmUgY29uZmlybWVkIGJlZm9yZSB1cGxvYWRlZCBpbWFnZXMgY2FuIGJlIHVzZWQgaW4gdGhlIHByb2R1Y3QgZGVzaWduZXIuIFRoZSB0ZXh0IGluIHRoZSBhZ3JlZW1lbnQgbW9kYWwgY2FuIGJlIHNldCB0aHJvdWdoIHRoZSBsYW5ndWFnZSBKU09OLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSB1cGxvYWRBZ3JlZW1lbnRNb2RhbFxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0Ki9cblx0XHR1cGxvYWRBZ3JlZW1lbnRNb2RhbDogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgc2V0dGluZ3MgZm9yIHRoZSBpbWFnZSBlZGl0b3IuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGltYWdlRWRpdG9yU2V0dGluZ3Ncblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge09iamVjdH1cblx0XHQqIEBkZWZhdWx0IHttYXNrczogW119XG5cdFx0Ki9cblx0XHRpbWFnZUVkaXRvclNldHRpbmdzOiB7XG5cdFx0XHQvKipcblx0XHRcdCogQW4gYXJyYXkgY29udGFpbmluZyB0aGUgU1ZHIHVybHMgZm9yIGN1c3RvbSBtYXNrIHNoYXBlcy4gVXNlIG9ubHkgb25lIHBhdGggcGVyIFNWRywgb25seSB0aGUgZmlyc3QgcGF0aCB3aWxsIGJlIHVzZWQgYXMgbWFzayBzaGFwZS5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IG1hc2tzXG5cdFx0XHQqIEB0eXBlIHtBcnJheX1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmltYWdlRWRpdG9yU2V0dGluZ3Ncblx0XHRcdCogQGRlZmF1bHQgW11cblx0XHRcdCovXG5cdFx0XHRtYXNrczogW11cblx0XHR9LFxuXHRcdC8qKlxuXHRcdCogQW4gb2JqZWN0IGNvbnRhaW5pbmcgbGVmdCwgdG9wLCB3aWR0aCBhbmQgaGVpZ2h0IHByb3BlcnRpZXMgdGhhdCByZXByZXNlbnRzIGEgcHJpbnRpbmcgYm94LiBBIHByaW50aW5nIGJveCBpcyBhIHJlY3RhbmdsZSB3aGljaCBpcyBhbHdheXMgdmlzaWJsZSBpbiB0aGUgY2FudmFzIGFuZCByZXByZXNlbnRzIHRoZSBwcmludGluZyBhcmVhLiBJdCBpcyB1c2VkIGluIHRoZSBBRE1JTiBzb2x1dGlvbiB0byBjcmVhdGUgYSBQREYgd2l0aCBhIHNwZWNpZmljIHByaW50aW5nIGFyZWEuXG5cdFx0KlxuXHRcdCogQHByb3BlcnQgcHJpbnRpbmdCb3hcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge09iamVjdH1cblx0XHQqIEBkZWZhdWx0IG51bGxcblx0XHQqL1xuXHRcdHByaW50aW5nQm94OiBudWxsLFxuXHRcdC8qKlxuXHRcdCogT3BlbiB0aGUgSW5mbyBtb2RhbCB3aGVuIHByb2R1Y3QgZGVzaWduZXIgaXMgbG9hZGVkLiBUaGUgSW5mbyBhY3Rpb24gbmVlZHMgdG8gYmUgYWRkZWQgdG8gc2hvdyB0aGUgbW9kYWwuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGF1dG9PcGVuSW5mb1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0Ki9cblx0XHRhdXRvT3BlbkluZm86IGZhbHNlLFxuXHRcdC8qKlxuXHRcdCogQ3JlYXRlIGEgY3VzdG9tIGd1aWRlZCB0b3VyIGJ5IGRlZmluaWZpbmcgYW4gb2JqZWN0IHdpdGggYSBrZXkvY3NzIHNlbGVjdG9yIGZvciB0aGUgdGFyZ2V0IGVsZW1lbnQgYW5kIHRoZSB2YWx1ZSBmb3IgdGhlIHRleHQgaW4gdGhlIGd1aWRlZCB0b3VyIHN0ZXAuIFRoZSBmaXJzdCBwYXJ0IG9mIHRoZSBrZXkgc3RyaW5nIGRlZmluZXMgdGhlIHRhcmdldCB0eXBlIChtb2R1bGUgb3IgYWN0aW9uKSBmb2xsb3dlZCBieSBhIGEgY29sb24gYW5kIHRoZSBuYW1lIG9mIHRoZSBtb2R1bGUvYWN0aW9uIG9yIGp1c3QgZW50ZXIgYSBjdXN0b20gQ1NTIHNlbGVjdG9yIHN0cmluZywgZS5nLiBtb2R1bGU6cHJvZHVjdHMsIGFjdGlvbjptYW5hZ2UtbGF5ZXJzIG9yICNhbnktZWxlbWVudC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgZ3VpZGVkVG91clxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7TnVsbCB8IE9iamVjdH1cblx0XHQqIEBkZWZhdWx0IG51bGxcblx0XHQqIEBleGFtcGxlIGd1aWRlZFRvdXI6IHtcblwibW9kdWxlOnByb2R1Y3RzXCI6IFwiVGhpcyBpcyB0aGUgdGV4dCBmb3IgZmlyc3Qgc3RlcC5cIixcblwiYWN0aW9uOm1hbmFnZS1sYXllcnNcIjogXCJUaGlzIGlzIHRoZSB0ZXh0IGZvciBzZWNvbmQgc3RlcC5cIixcblwiI2FueS1lbGVtZW50XCI6IFwiUG9pbnRlciBvbiBhIGN1c3RvbSBIVE1MIGVsZW1lbnRcIlxufVxuXHRcdCovXG5cdFx0Z3VpZGVkVG91cjogbnVsbCxcblx0XHQvKipcblx0XHQqIEFzIHNvb24gYXMgYW4gZWxlbWVudCB3aXRoIGEgY29sb3IgbGluayBncm91cCBpcyBhZGRlZCwgdGhlIGNvbG91cnMgb2YgdGhpcyBlbGVtZW50IHdpbGwgYmUgdXNlZCBmb3IgdGhlIGNvbG9yIGdyb3VwLiBJZiBmYWxzZSwgdGhlIGNvbG91cnMgb2YgYWxsIGVsZW1lbnQgaW4gdGhlIGNvbG9yIGdyb3VwIHdpbGwgYmUgY29uY2F0ZW5hdGVkLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSByZXBsYWNlQ29sb3JzSW5Db2xvckdyb3VwXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHQqL1xuXHRcdHJlcGxhY2VDb2xvcnNJbkNvbG9yR3JvdXA6IGZhbHNlLFxuXHRcdC8qKlxuXHRcdCogRGVmaW5lcyB0aGUgaW1hZ2UgdHlwZXMgaW4gbG93ZXJjYXNlIHRoYXQgY2FuIGJlIHVwbG9hZGVkLiBDdXJyZW50bHkgdGhlIGRlc2lnbmVyIHN1cHBvcnRzIGpwZywgc3ZnLCBwbmcgaW1hZ2VzIGFuZCBQREYgZmlsZXMuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGFsbG93ZWRJbWFnZVR5cGVzXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtBcnJheX1cblx0XHQqIEBkZWZhdWx0IFsnanBlZycsICdwbmcnLCAnc3ZnJywgJ3BkZiddXG5cdFx0Ki9cblx0XHRhbGxvd2VkSW1hZ2VUeXBlczogWydqcGVnJywgJ3BuZycsICdzdmcnLCAncGRmJ10sXG5cdFx0LyoqXG5cdFx0KiBUbyBhZGQgcGhvdG9zIGZyb20gUGl4YWJheSwgeW91IGhhdmUgdG8gc2V0IGFuIDxhIGhyZWY9XCJodHRwczovL3BpeGFiYXkuY29tL2FwaS9kb2NzL1wiIHRhcmdldD1cIl9ibGFua1wiPlBpeGFiYXkgQVBJIGtleTwvYT4uXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHBpeGFiYXlBcGlLZXlcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge1N0cmluZ31cblx0XHQqIEBkZWZhdWx0ICcnXG5cdFx0Ki9cblx0XHRwaXhhYmF5QXBpS2V5OiAnJyxcblx0XHQvKipcblx0XHQqIElmIHlvdSB3YW50IHRvIGFjY2VzcyBoaWdoLXJlc29sdXRpb24gaW1hZ2VzLCBlbmFibGUgdGhpcyBvcHRpb24gYW5kIHlvdSBoYXZlIHRvIGFzayBQaXhhYmF5IGZvciBwZXJtaXNzaW9uLiA8YSBocmVmPVwiaHR0cHM6Ly9waXhhYmF5LmNvbS9hcGkvZG9jcy8jaGlyZXNfaW1hZ2Vfc2VhcmNoX3Jlc3BvbnNlXCIgdGFyZ2V0PVwiX2JsYW5rXCI+WW91IGNhbiBlYXNpbHkgZG8gdGhhdCBoZXJlLCBuZXh0IHRvIHRoZSBoZWFkbGluZTwvYT4uXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHBpeGFiYXlIaWdoUmVzSW1hZ2VzXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHQqL1xuXHRcdHBpeGFiYXlIaWdoUmVzSW1hZ2VzOiBmYWxzZSxcblx0XHQvKipcblx0XHQqIExhbmd1YWdlIGNvZGUgb2YgdGhlIGxhbmd1YWdlIHRvIGJlIHNlYXJjaGVkIGluLiBBY2NlcHRlZCB2YWx1ZXM6IGNzLCBkYSwgZGUsIGVuLCBlcywgZnIsIGlkLCBpdCwgaHUsIG5sLCBubywgcGwsIHB0LCBybywgc2ssIGZpLCBzdiwgdHIsIHZpLCB0aCwgYmcsIHJ1LCBlbCwgamEsIGtvLCB6aC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgcGl4YWJheUxhbmdcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge1N0cmluZ31cblx0XHQqIEBkZWZhdWx0ICcnXG5cdFx0KiBAdmVyc2lvbiA0LjcuNVxuXHRcdCovXG5cdFx0cGl4YWJheUxhbmc6ICdlbicsXG5cdFx0LyoqXG5cdFx0KiBEaXNwbGF5IHRoZSBpbnRlcm5hbCBtb2RhbHMgKGluZm8sIHFyLWNvZGUgZXRjLikgaW4gdGhlIHByb2R1Y3QgZGVzaWduZXIgaW5zdGVhZCBpbiB0aGUgd2hvbGUgcGFnZS5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgb3Blbk1vZGFsSW5EZXNpZ25lclxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0Ki9cblx0XHRvcGVuTW9kYWxJbkRlc2lnbmVyOiBmYWxzZSxcblx0XHQvKipcblx0XHQqIFNob3dzIHRoZSBjdXJyZW50IGltYWdlIHNpemUgaW4gcGl4ZWxzIGluIGEgdG9vbHRpcCBhYm92ZSB0aGUgaW1hZ2UgZWxlbWVudCB3aGVuIGl0cyBzZWxlY3RlZC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgaW1hZ2VTaXplVG9vbHRpcFxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0Ki9cblx0XHRpbWFnZVNpemVUb29sdGlwOiBmYWxzZSxcblx0XHQvKipcblx0XHQqIFRvIGFkZCBwaG90b3MgZnJvbSBEZXBvc2l0UGhvdG9zLCB5b3UgaGF2ZSB0byBzZXQgYW4gPGEgaHJlZj1cImh0dHBzOi8vcGl4YWJheS5jb20vYXBpL2RvY3MvXCIgdGFyZ2V0PVwiX2JsYW5rXCI+UGl4YWJheSBBUEkga2V5PC9hPi5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgZGVwb3NpdHBob3Rvc0FwaUtleVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdCogQGRlZmF1bHQgJydcblx0XHQqL1xuXHRcdGRlcG9zaXRwaG90b3NBcGlLZXk6ICcnLFxuXHRcdC8qKlxuXHRcdCogVGhlIGxhbmd1YWdlIHNob3J0Y3V0IHRoYXQgZGVmaW5lcyB0aGUgbGFuZ3VhZ2UgZm9yIHRoZSBjYXRlZ29yeSB0aXRsZXMuIEF2YWlsYWJsZSBsYW5ndWFnZSBzaG9ydGN1dHM6IGVuLGRlLGZyLHNwLHJ1LGl0LHB0LGVzLHBsLG5sLGpwLGN6LHNlLHpoLHRyLG14LGdyLGtvLGJyLGh1LHVrLHJvLGlkLHRoLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBkZXBvc2l0cGhvdG9zTGFuZ1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdCogQGRlZmF1bHQgJ2VuJ1xuXHRcdCovXG5cdFx0ZGVwb3NpdHBob3Rvc0xhbmc6ICdlbicsXG5cdFx0LyoqXG5cdFx0KiBUaGUgcHJpY2UgdGhhdCBpcyBjaGFyZ2VkIHdoZW4gYWRkaW5nIGFuIGltYWdlIGZyb20gZGVwb3NpdHBob3Rvcy5jb20uXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGRlcG9zaXRwaG90b3NQcmljZVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7TnVtYmVyfVxuXHRcdCogQGRlZmF1bHQgMFxuXHRcdCovXG5cdFx0ZGVwb3NpdHBob3Rvc1ByaWNlOiAwLFxuXHRcdC8qKlxuXHRcdCogSGlnaGxpZ2h0IG9iamVjdHMgKGVkaXRhYmxlIHRleHRzIGFuZCB1cGxvYWQgem9uZXMpIHdpdGggYSBkYXNoZWQgYm9yZGVyLiBUbyBlbmFibGUgdGhpcyBqdXN0IGRlZmluZSBhIGhleGFkZWNpbWFsIGNvbG9yIHZhbHVlLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBoaWdobGlnaHRFZGl0YWJsZU9iamVjdHNcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge1N0cmluZ31cblx0XHQqIEBkZWZhdWx0ICcnXG5cdFx0KiBAdmVyc2lvbiAzLjcuMlxuXHRcdCovXG5cdFx0aGlnaGxpZ2h0RWRpdGFibGVPYmplY3RzOiAnJyxcblx0XHQvKipcblx0XHQqIFdoZW4gYW4gZWxlbWVudCBpcyByZXBsYWNlZCwgYXBwbHkgZmlsbChjb2xvcikgZnJvbSByZXBsYWNlZCBlbGVtZW50IHRvIGFkZGVkIGVsZW1lbnQuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGFwcGx5RmlsbFdoZW5SZXBsYWNpbmdcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0KiBAZGVmYXVsdCB0cnVlXG5cdFx0KiBAdmVyc2lvbiAzLjcuMlxuXHRcdCovXG5cdFx0YXBwbHlGaWxsV2hlblJlcGxhY2luZzogdHJ1ZSxcblx0XHQvKipcblx0XHQqIEFuIGFycmF5IGNvbnRhaW5pbmcgbGF5b3V0cy4gQSBsYXlvdXQgaXMgdGVjaG5pY2FsbHkgYSB2aWV3IHRoYXQgd2lsbCByZXBsYWNlIGFsbCBlbGVtZW50cyBpbiBhIHZpZXcgd2hlbiBzZWxlY3RlZC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgbGF5b3V0c1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7QXJyYXl9XG5cdFx0KiBAZGVmYXVsdCBbXVxuXHRcdCogQHZlcnNpb24gNC43LjBcblx0XHQqL1xuXHRcdGxheW91dHM6IFtdLFxuXHRcdC8qKlxuXHRcdCogT3B0aW9ucyBmb3IgdGhlIER5bmFtaWMgVmlld3MgbW9kdWwuIFJlcXVpcmVzIEZhbmN5IFByb2R1Y3QgRGVzaWduZXIgUGx1cyBBZGQtT24uXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGR5bmFtaWNWaWV3c09wdGlvbnNcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge09iamVjdH1cblx0XHQqIEBkZWZhdWx0IHt9XG5cdFx0KiBAdmVyc2lvbiA0LjcuMFxuXHRcdCovXG5cdFx0ZHluYW1pY1ZpZXdzT3B0aW9uczoge1xuXHRcdFx0LyoqXG5cdFx0XHQqIFNldCB0aGUgbGVuZ3RoIHVuaXQgdGhhdCB5b3Ugd291bGQgbGlrZSB0byBzZXQgdGhlIGNhbnZhcyBzaXRlOiAnbW0nLCAnY20nLCAnaW5jaCdcblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IHVuaXRcblx0XHRcdCogQHR5cGUge1N0cmluZ31cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmR5bmFtaWNWaWV3c09wdGlvbnNcblx0XHRcdCogQGRlZmF1bHQgJ21tJ1xuXHRcdFx0Ki9cblx0XHRcdHVuaXQ6ICdtbScsXG5cdFx0XHQvKipcblx0XHRcdCogQW4gYXJyYXkgd2lsbCBhbGwgYXZhaWxhYmxlIGZvcm1hdHMgd2hlbiBhZGRpbmcgYSBuZXcgdmlldy5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IGZvcm1hdHNcblx0XHRcdCogQHR5cGUge0FycmF5fVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuZHluYW1pY1ZpZXdzT3B0aW9uc1xuXHRcdFx0KiBAZGVmYXVsdCBbXVxuXHRcdFx0KkBleGFtcGxlIFtcblx0WzEwMCwgMTAwXSxcblx0WzUwMCwgNTAwXSxcblx0WzEwMDAsIDEwMDBdXG5dXG5cdFx0XHQqL1xuXHRcdFx0Zm9ybWF0czogW10sXG5cdFx0XHQvKipcblx0XHRcdCogQ2hhcmdlIHByaWNlIHBlciBhcmVhIGluIGNlbnRpbWV0ZXIuIEZvciBleGFtcGxlIGlmIHlvdSB3YW50IHRvIGNoYXJnZSBhIHByaWNlIG9mIDEgcGVyIDEwY20yLCB5b3UgaGF2ZSB0byBlbnRlciAwLjEuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBwcmljZVBlckFyZWFcblx0XHRcdCogQHR5cGUge051bWJlcn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmR5bmFtaWNWaWV3c09wdGlvbnNcblx0XHRcdCogQGRlZmF1bHQgMFxuXHRcdFx0Ki9cblx0XHRcdHByaWNlUGVyQXJlYTogMCxcblx0XHRcdC8qKlxuXHRcdFx0KiBNaW5pbXVtIHdpZHRoIHRoYXQgdGhlIHVzZXIgY2FuIGVudGVyIGFzIHZpZXcgd2lkdGguXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBtaW5XaWR0aFxuXHRcdFx0KiBAdHlwZSB7TnVtYmVyfVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuZHluYW1pY1ZpZXdzT3B0aW9uc1xuXHRcdFx0KiBAZGVmYXVsdCAwXG5cdFx0XHQqL1xuXHRcdFx0bWluV2lkdGg6IDAsXG5cdFx0XHQvKipcblx0XHRcdCogTWluaW11bSBoZWlnaHQgdGhhdCB0aGUgdXNlciBjYW4gZW50ZXIgYXMgdmlldyBoZWlnaHQuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBtaW5IZWlnaHRcblx0XHRcdCogQHR5cGUge051bWJlcn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmR5bmFtaWNWaWV3c09wdGlvbnNcblx0XHRcdCogQGRlZmF1bHQgMFxuXHRcdFx0Ki9cblx0XHRcdG1pbkhlaWdodDogMCxcblx0XHRcdC8qKlxuXHRcdFx0KiBNYXhpbXVtIHdpZHRoIHRoYXQgdGhlIHVzZXIgY2FuIGVudGVyIGFzIHZpZXcgd2lkdGguXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBtYXhXaWR0aFxuXHRcdFx0KiBAdHlwZSB7TnVtYmVyfVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuZHluYW1pY1ZpZXdzT3B0aW9uc1xuXHRcdFx0KiBAZGVmYXVsdCAxMDAwMFxuXHRcdFx0Ki9cblx0XHRcdG1heFdpZHRoOiAxMDAwMCxcblx0XHRcdC8qKlxuXHRcdFx0KiBNYXhpbXVtIGhlaWdodCB0aGF0IHRoZSB1c2VyIGNhbiBlbnRlciBhcyB2aWV3IGhlaWdodC5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IG1heEhlaWdodFxuXHRcdFx0KiBAdHlwZSB7TnVtYmVyfVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuZHluYW1pY1ZpZXdzT3B0aW9uc1xuXHRcdFx0KiBAZGVmYXVsdCAxMDAwMFxuXHRcdFx0Ki9cblx0XHRcdG1heEhlaWdodDogMTAwMDBcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCogRW1vamlzIGluIHRleHQgZWxlbWVudHMgd2lsbCBiZSByZW1vdmVkIHdoZW4gY2hhbmdpbmcgb3IgYWRkaW5nIHRleHQuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGRpc2FibGVUZXh0RW1vamlzXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHQqIEB2ZXJzaW9uIDQuNy40XG5cdFx0Ki9cblx0XHRkaXNhYmxlVGV4dEVtb2ppczogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBFbmFibGUgZ3VpZGUgbGluZXMgdG8gYWxpZ24gdGhlIHNlbGVjdGVkIG9iamVjdCB0byB0aGUgZWRnZXMgb2YgdGhlIG90aGVyIG9iamVjdHMuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHNtYXJ0R3VpZGVzXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHQqIEB2ZXJzaW9uIDQuNy43XG5cdFx0Ki9cblx0XHRzbWFydEd1aWRlczogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBTZXQgdGhlIHRvb2xiYXIgdGhlbWUuIFBvc3NpYmxlIHZhbHVlczogd2hpdGUsIGRhcmsuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHRvb2xiYXJUaGVtZVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdCogQGRlZmF1bHQgJ3doaXRlJ1xuXHRcdCogQHZlcnNpb24gNC43Ljdcblx0XHQqL1xuXHRcdHRvb2xiYXJUaGVtZTogJ3doaXRlJyxcblx0XHQvKipcblx0XHQqIElmIGEgcHJpbnRpbmcgYm94IGhhcyBiZWVuIGRlZmluZWQgZm9yIGEgdmlldyBhbmQgdGhlIGVsZW1lbnQgaGFzIG5vIGluZGl2aWR1YWwgYm91bmRpbmcgYm94LCB0aGUgcHJpbnRpbmcgYm94IHdpbGwgYmUgdXNlZCBhcyBib3VuZGluZyBib3guXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHVzZVByaW50aW5nQm94QXNCb3VuZGluZ1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0KiBAdmVyc2lvbiA0LjguMFxuXHRcdCovXG5cdFx0dXNlUHJpbnRpbmdCb3hBc0JvdW5kaW5nOiBmYWxzZSxcblx0XHQvKipcblx0XHQqIEFuIG9iamVjdCBkZWZpbmluZyB0aGUgcHJpbnRpbmcgYXJlYSB3aGVuIGV4cG9ydGluZyB0aGUgcHJvZHVjdCBhcyBTVkcuIHt0b3A6IE51bWJlciwgbGVmdDogTnVtYmVyLCB3aWR0aDogTnVtYmVyLCBoZWlnaHQ6IE51bWJlciwgdmlzaWJpbGl0eTogQm9vbGVhbn0uIFRoZSB2aXNpYmlsaXR5IHByb3BlcnR5IHNob3dzIHRoZSBwcmludGluZyBib3ggdG8gdGhlIGN1c3RvbWVycy5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgcHJpbnRpbmdCb3hcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge09iamVjdH1cblx0XHQqIEBkZWZhdWx0IHt9XG5cdFx0KiBAdmVyc2lvbiA0LjcuMFxuXHRcdCogQGV4YW1wbGUge3RvcDogMTAwLCBsZWZ0OiAxMDAsIHdpZHRoOiA0MDAsIGhlaWdodDogNTAwLCB2aXNpYmlsaXR5OiB0cnVlfVxuXHRcdCovXG5cdFx0cHJpbnRpbmdCb3g6IHt9LFxuXHRcdC8qKlxuXHRcdCogQSBKU09OIG9iamVjdCBvciBVUkwgdG8gYSBKU09OIGZpbGUgdGhhdCBzdG9yZXMgYWxsIGluaXRpYWwgcHJvZHVjdHMuIFRoZXNlIHByb2R1Y3RzIHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBQcm9kdWN0cyBtb2R1bGUuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHByb2R1Y3RzSlNPTlxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdCogQGRlZmF1bHQgbnVsbFxuXHRcdCogQHZlcnNpb24gNC45LjBcblx0XHQqL1xuXHRcdHByb2R1Y3RzSlNPTjogbnVsbCxcblx0XHQvKipcblx0XHQqIEEgSlNPTiBvYmplY3Qgb3IgVVJMIHRvIGEgSlNPTiBmaWxlIHRoYXQgc3RvcmVzIGFsbCBkZXNpZ25zLiBUaGVzZSBkZXNpZ25zIHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBEZXNpZ25zIG1vZHVsZS5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgZGVzaWduc0pTT05cblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge1N0cmluZ31cblx0XHQqIEBkZWZhdWx0IG51bGxcblx0XHQqIEB2ZXJzaW9uIDQuOS4wXG5cdFx0Ki9cblx0XHRkZXNpZ25zSlNPTjogbnVsbCxcblx0XHQvKipcblx0XHQqIFdoZW4gdGhlIGN1c3RvbWl6YXRpb25SZXF1aXJlZCBhcmd1bWVudCBpbiB0aGUgZ2V0UHJvZHVjdCBpcyBzZXQgdG8gdHJ1ZSwgeW91IGNhbiBjb250cm9sIGlmIGFueSB2aWV3IG5lZWRzIHRvIGJlIGN1c3RvbWl6ZWQgb3IgYWxsLiBQb3NzaWJsZSB2YWx1ZXM6IGFueSwgYWxsLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBjdXN0b21pemF0aW9uUmVxdWlyZWRSdWxlXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0KiBAZGVmYXVsdCAnYW55J1xuXHRcdCogQHZlcnNpb24gNC45LjRcblx0XHQqL1xuXHRcdGN1c3RvbWl6YXRpb25SZXF1aXJlZFJ1bGU6ICdhbnknLFxuXHRcdC8qKlxuXHRcdCogRGlzcGxheSB0aGUgbm90aWZpY2F0aW9uIHRoYXQgdGhlIHByb2R1Y3QgaXMgZ29pbmcgdG8gYmUgY2hhbmdlZCB3aGVuIGNsaWNraW5nIG9uIGEgcHJvZHVjdCBpdGVtIGluIHRoZSBQcm9kdWN0cyBtb2R1bGUuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHN3YXBQcm9kdWN0Q29uZmlybWF0aW9uXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHQqIEB2ZXJzaW9uIDQuOS41XG5cdFx0Ki9cblx0XHRzd2FwUHJvZHVjdENvbmZpcm1hdGlvbjogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBUaGUgcG9zaXRpb24gb2YgdGhlIHRleHRhcmVhIGluIHRoZSB0b29sYmFyLiBQb3NzaWJsZSB2YWx1ZXM6IHN1YiwgdG9wIChPbmx5IHBvc3NpYmxlIHdoZW4gdG9vbGJhclBsYWNlbWVudCA9IHNtYXJ0KS5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgdG9vbGJhclRleHRhcmVhUG9zaXRpb25cblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge1N0cmluZ31cblx0XHQqIEBkZWZhdWx0ICdzdWInXG5cdFx0KiBAdmVyc2lvbiA0LjkuNlxuXHRcdCovXG5cdFx0dG9vbGJhclRleHRhcmVhUG9zaXRpb246ICdzdWInLFxuXHRcdC8qKlxuXHRcdCogVGhlIHdpZHRoIG9mIGEgdGV4dGJveCBjYW4gc2V0IHZpYSB0aGUgXCJUZXh0c1wiIG1vZHVsZSBvciBjaGFuZ2VkIHZpYSB0aGUgY29ybmVyIGNvbnRyb2xzIG9mIHRoZSBzZWxlY3RlZCB0ZXh0Ym94LlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBzZXRUZXh0Ym94V2lkdGhcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdCogQHZlcnNpb24gNS4wLjFcblx0XHQqL1xuXHRcdHNldFRleHRib3hXaWR0aDogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBEZWZpbmUgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIGFsbCB0ZXh0IGVsZW1lbnRzIGluIHRoZSBzYW1lIHRleHRMaW5rR3JvdXAuIEUuZy46IFsnZm9udEZhbWlseScsICdmb250U2l6ZScsICdmb250U3R5bGUnXVxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSB0ZXh0TGlua0dyb3VwUHJvcHNcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge0FycmF5fVxuXHRcdCogQGRlZmF1bHQgW11cblx0XHQqIEB2ZXJzaW9uIDUuMC4zXG5cdFx0Ki9cblx0XHR0ZXh0TGlua0dyb3VwUHJvcHM6IFtdLFxuXHRcdC8qKlxuXHRcdCogVGV4dCBUZW1wbGF0ZXMgdGhhdCB3aWxsIGFwcGVhciBpbiB0aGUgVGV4dCBtb2R1bGUuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHRleHRUZW1wbGF0ZXNcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge0FycmF5fVxuXHRcdCogQGRlZmF1bHQgW11cblx0XHQqIEBleGFtcGxlIFt7dGV4dDogJ0hlbGxvIFdvcmxkJywgcHJvcGVydGllczoge2ZvbnRGYW1pbHk6ICdBcmlhbCcsIHRleHRTaXplOiAzNX19XVxuXHRcdCogQHZlcnNpb24gNS4xLjBcblx0XHQqL1xuXHRcdHRleHRUZW1wbGF0ZXM6IFtdLFxuXHRcdC8qKlxuXHRcdCogTXVsdGlwbGUgb2JqZWN0cyBjYW4gYmUgc2VsZWN0ZWQgYW5kIG1vdmVkIGF0IHRoZSBzYW1lIHRpbWUuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IG11bHRpU2VsZWN0aW9uXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHQqIEB2ZXJzaW9uIDUuMS4wXG5cdFx0Ki9cblx0XHRtdWx0aVNlbGVjdGlvbjogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBUaGUgVUkgdGhlbWUgdGhhdCB5b3Ugd291bGQgbGlrZSB0byB1c2UuIENob29zZSBiZXR3ZWVuICdmbGF0JyBvciAnZG95bGUnLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSB1aVRoZW1lXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0KiBAZGVmYXVsdCAnZmxhdCdcblx0XHQqIEB2ZXJzaW9uIDUuMS4wXG5cdFx0Ki9cblx0XHR1aVRoZW1lOiAnZmxhdCcsXG5cdFx0LyoqXG5cdFx0KiBUaGUgbWF4aW11bSBjYW52YXMgaGVpZ2h0IHJlbGF0ZWQgdG8gdGhlIHdpbmRvdyBoZWlnaHQuIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMSwgZS5nLiAwLjggd2lsbCBzZXQgYSBtYXhpbXVtIGNhbnZhcyBoZWlnaHQgb2YgODAlIG9mIHRoZSB3aW5kb3cgaGVpZ2h0LiBBIHZhbHVlIG9mIDEgd2lsbCBkaXNhYmxlIGEgY2FsY3VsYXRpb24gb2YgYSBtYXguIGhlaWdodC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgbWF4Q2FudmFzSGVpZ2h0XG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtOdW1iZXJ9XG5cdFx0KiBAZGVmYXVsdCAxXG5cdFx0KiBAdmVyc2lvbiA1LjEuMVxuXHRcdCovXG5cdFx0bWF4Q2FudmFzSGVpZ2h0OiAxLFxuXHRcdC8qKlxuXHRcdCogU2V0IHRoZSBiZWhhdmlvdXIgZm9yIG1vYmlsZSBnZXN0dXJlcy4gUG9zc2libGUgdmFsdWVzOiAgPHVsPjxsaT4nbm9uZSc6IE5vIGJlaGF2aW91cjwvbGk+PGxpPidwaW5jaFBhbkNhbnZhcyc6IFpvb20gaW4vb3V0IGFuZCBwYW4gY2FudmFzPC9saT48bGk+ICdwaW5jaEltYWdlU2NhbGUnOiBTY2FsZSBzZWxlY3RlZCBpbWFnZSB3aXRoIHBpbmNoPC9saT48L3VsPiAuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IG1vYmlsZUdlc3R1cmVzQmVoYXZpb3VyXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0KiBAZGVmYXVsdCAnbm9uZSdcblx0XHQqIEB2ZXJzaW9uIDUuMS4zXG5cdFx0Ki9cblx0XHRtb2JpbGVHZXN0dXJlc0JlaGF2aW91cjogJ25vbmUnLFxuXHRcdC8qKlxuXHRcdCogRW5hYmxlIGltYWdlIHF1YWxpdHkgcmF0aW5ncyBmb3IgdXBsb2FkZWQgaW1hZ2VzLiBUaGVyZWZvcmUgeW91IGNhbiBkZWZpbmUgbG93LCBtaWQgYW5kIGhpZ2ggcXVhbGl0eSBzdGVwcy4gVGhlIG9iamVjdCByZWNlaXZlcyBsb3csIG1pZCBhbmQgaGlnaCBrZXlzLiBUaGUgdmFsdWVzIG9mIHRoZXNlIGtleXMgYXJlIGFycmF5cywgd2hlcmUgdGhlIGZpcnN0IGVudHJ5IGRlZmluZXMgdGhlIHdpZHRoIGFuZCB0aGUgc2Vjb25kIGVudHJ5IGRlZmluZXMgdGhlIGhlaWdodC5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgaW1hZ2VRdWFsaXR5UmF0aW5nc1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7T2JqZWN0fVxuXHRcdCogQGRlZmF1bHQgbnVsbFxuXHRcdCogQGV4YW1wbGUge2xvdzogWzEwMCwgMjAwXSwgbWlkOiBbNTAwLCA2MDBdLCBoaWdoOiBbMTAwMCwgMTIwMF19XG5cdFx0KiBAdmVyc2lvbiA1LjEuNFxuXHRcdCovXG5cdFx0aW1hZ2VRdWFsaXR5UmF0aW5nczogbnVsbCxcblx0XHQvKipcblx0XHQqIERpc3BsYXlzIHRoZSBwYXRocyBvZiBhIFNWRyBpbiB0aGUgYWR2YW5jZWQgaW1hZ2UgZWRpdG9yLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBzcGxpdE11bHRpU1ZHXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHQqIEB2ZXJzaW9uIDUuMS40XG5cdFx0Ki9cblx0XHRzcGxpdE11bHRpU1ZHOiBmYWxzZSxcblx0XHQvKipcblx0XHQqIFNldCBjb3JuZXIgY29udHJvbHMgc3R5bGU6IEJhc2ljIChSZXNjYWxlIGFuZCBSb3RhdGUpLCBBZHZhbmNlZCAoUmVzY2FsZSwgUm90YXRlLCBEZWxldGUsIER1cGxpY2F0ZSkuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGNvcm5lckNvbnRyb2xzU3R5bGVcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdCogQHZlcnNpb24gNS4xLjRcblx0XHQqL1xuXHRcdGNvcm5lckNvbnRyb2xzU3R5bGU6ICdhZHZhbmNlZCcsXG5cdFx0LyoqXG5cdFx0KiBUaGUgZmlsZW5hbWUgd2hlbiB0aGUgdXNlciBkb3dubG9hZHMgdGhlIHByb2R1Y3QgZGVzaWduIGFzIGltYWdlIG9yIFBERi5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgZG93bmxvYWRGaWxlbmFtZVxuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdCogQGRlZmF1bHQgJ1Byb2R1Y3QnXG5cdFx0KiBAdmVyc2lvbiA1LjEuNVxuXHRcdCovXG5cdFx0ZG93bmxvYWRGaWxlbmFtZTogJ1Byb2R1Y3QnLFxuXHRcdC8qKlxuXHRcdCogRmlsbCBhbGwgdXBsb2FkIHpvbmVzIHdpdGggdGhlIGZpcnN0IHVwbG9hZGVkIGltYWdlcy5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgYXV0b0ZpbGxVcGxvYWRab25lc1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0KiBAdmVyc2lvbiA1LjIuN1xuXHRcdCovXG5cdFx0YXV0b0ZpbGxVcGxvYWRab25lczogZmFsc2UsXG5cdFx0LyoqXG5cdFx0KiBEcmFnICYgRHJvcCBpbWFnZXMgZnJvbSB0aGUgaW1hZ2VzIGFuZCBkZXNpZ25zIG1vZHVsZSBpbnRvIHVwbG9hZCB6b25lcyBvciBvbiBjYW52YXMuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGRyYWdEcm9wSW1hZ2VzVG9VcGxvYWRab25lc1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0KiBAdmVyc2lvbiA1LjIuN1xuXHRcdCovXG5cdFx0ZHJhZ0Ryb3BJbWFnZXNUb1VwbG9hZFpvbmVzOiBmYWxzZSxcblx0XHQvKipcblx0XHQqIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBkZWZhdWx0IGVsZW1lbnQgcGFyYW1ldGVycyBpbiBhZGRpdGlvbiB0byB0aGUgPGEgaHJlZj1cImh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuT2JqZWN0Lmh0bWxcIiB0YXJnZXQ9XCJfYmxhbmtcIj5kZWZhdWx0IEZhYnJpYyBPYmplY3QgcHJvcGVydGllczwvYT4uIFNlZSA8YSBocmVmPVwiLi9PcHRpb25zLmRlZmF1bHRzLmVsZW1lbnRQYXJhbWV0ZXJzLmh0bWxcIj5PcHRpb25zLmRlZmF1bHRzLmVsZW1lbnRQYXJhbWV0ZXJzPC9hPi5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgZWxlbWVudFBhcmFtZXRlcnNcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge09iamVjdH1cblx0XHQqL1xuXHRcdGVsZW1lbnRQYXJhbWV0ZXJzOiB7XG5cdFx0XHRvYmplY3RDYWNoaW5nOiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBBbGxvd3MgdG8gc2V0IHRoZSB6LWluZGV4IG9mIGFuIGVsZW1lbnQsIC0xIG1lYW5zIGl0IHdpbGwgYmUgYWRkZWQgb24gdGhlIHN0YWNrIG9mIGxheWVyc1xuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgelxuXHRcdFx0KiBAdHlwZSB7TnVtYmVyfVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuZWxlbWVudFBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgLTFcblx0XHRcdCovXG5cdFx0XHR6OiAtMSxcblx0XHRcdC8qKlxuXHRcdFx0KiBUaGUgcHJpY2UgZm9yIHRoZSBlbGVtZW50LlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgcHJpY2Vcblx0XHRcdCogQHR5cGUge051bWJlcn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmVsZW1lbnRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IDBcblx0XHRcdCovXG5cdFx0XHRwcmljZTogMCwgLy9ob3cgbXVjaCBkb2VzIHRoZSBlbGVtZW50IGNvc3Rcblx0XHRcdC8qKlxuXHRcdFx0KiA8dWw+PGxpPklmIGZhbHNlLCBubyBjb2xvcml6YXRpb24gZm9yIHRoZSBlbGVtZW50IGlzIHBvc3NpYmxlLjwvbGk+PGxpPk9uZSBoZXhhZGVjaW1hbCBjb2xvciB3aWxsIGVuYWJsZSB0aGUgY29sb3JwaWNrZXI8L2xpPjxsaT5NdWxpdHBsZSBoZXhhZGVjaW1hbCBjb2xvcnMgc2VwYXJhdGVkIGJ5IGNvbW1tYXMgd2lsbCBzaG93IGEgcmFuZ2Ugb2YgY29sb3JzIHRoZSB1c2VyIGNhbiBjaG9vc2UgZnJvbS48L2xpPjwvdWw+XG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBjb2xvcnNcblx0XHRcdCogQHR5cGUge0Jvb2xlYW4gfCBTdHJpbmd9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5lbGVtZW50UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdFx0KiBAZXhhbXBsZSBjb2xvcnM6IFwiIzAwMDAwMFwiID0+IENvbG9ycGlja2VyLCBjb2xvcnM6IFwiIzAwMDAwMCwjZmZmZmZmXCIgPT4gUmFuZ2Ugb2YgY29sb3JzXG5cdFx0XHQqL1xuXHRcdFx0Y29sb3JzOiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBJZiB0cnVlIHRoZSB1c2VyIGNhbiByZW1vdmUgdGhlIGVsZW1lbnQuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSByZW1vdmFibGVcblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5lbGVtZW50UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdFx0Ki9cblx0XHRcdHJlbW92YWJsZTogZmFsc2UsXG5cdFx0XHQvKipcblx0XHRcdCogSWYgdHJ1ZSB0aGUgdXNlciBjYW4gZHJhZyB0aGUgZWxlbWVudC5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IGRyYWdnYWJsZVxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmVsZW1lbnRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0XHQqL1xuXHRcdFx0ZHJhZ2dhYmxlOiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBJZiB0cnVlIHRoZSB1c2VyIGNhbiByb3RhdGUgdGhlIGVsZW1lbnQuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSByb3RhdGFibGVcblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5lbGVtZW50UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdFx0Ki9cblx0XHRcdHJvdGF0YWJsZTogZmFsc2UsXG5cdFx0XHQvKipcblx0XHRcdCogSWYgdHJ1ZSB0aGUgdXNlciBjYW4gcmVzaXplIHRoZSBlbGVtZW50LlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgcmVzaXphYmxlXG5cdFx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuZWxlbWVudFBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHRcdCovXG5cdFx0XHRyZXNpemFibGU6IGZhbHNlLFxuXHRcdFx0LyoqXG5cdFx0XHQqIElmIHRydWUgdGhlIHVzZXIgY2FuIGNvcHkgbm9uLWluaXRpYWwgZWxlbWVudHMuIENvcHlhYmxlIHByb3BlcnR5IGlzIGVuYWJsZWQgZm9yIGRlc2lnbnMgYW5kIGN1c3RvbSBhZGRlZCBlbGVtZW50cyBhdXRvbWF0aWNhbGx5LlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgY29weWFibGVcblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5lbGVtZW50UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdFx0Ki9cblx0XHRcdGNvcHlhYmxlOiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBJZiB0cnVlIHRoZSB1c2VyIGNhbiBjaGFuZ2UgdGhlIHotcG9zaXRpb24gdGhlIGVsZW1lbnQuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSB6Q2hhbmdlYWJsZVxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmVsZW1lbnRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0XHQqL1xuXHRcdFx0ekNoYW5nZWFibGU6IGZhbHNlLFxuXHRcdFx0LyoqXG5cdFx0XHQqIERlZmluZXMgYSBib3VuZGluZyBib3ggKHByaW50aW5nIGFyZWEpIGZvciB0aGUgZWxlbWVudC48dWw+SWYgZmFsc2Ugbm8gYm91bmRpbmcgYm94PC9saT48bGk+VGhlIHRpdGxlIG9mIGFuIGVsZW1lbnQgaW4gdGhlIHNhbWUgdmlldywgdGhlbiB0aGUgYm91bmRhcnkgb2YgdGhlIHRhcmdldCBlbGVtZW50IHdpbGwgYmUgdXNlZCBhcyBib3VuZGluZyBib3guPC9saT48bGk+QW4gb2JqZWN0IHdpdGggeCx5LHdpZHRoIGFuZCBoZWlnaHQgZGVmaW5lcyB0aGUgYm91bmRpbmcgYm94PC9saT48L3VsPlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgYm91bmRpbmdCb3hcblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5lbGVtZW50UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdFx0Ki9cblx0XHRcdGJvdW5kaW5nQm94OiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBTZXQgdGhlIG1vZGUgZm9yIHRoZSBib3VuZGluZyBib3guIFBvc3NpYmxlIHZhbHVlczogJ25vbmUnLCAnY2xpcHBpbmcnLCAnbGltaXRNb2RpZnknLCAnaW5zaWRlJ1xuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgYm91bmRpbmdCb3hNb2RlXG5cdFx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5lbGVtZW50UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCAnY2xpcHBpbmcnXG5cdFx0XHQqL1xuXHRcdFx0Ym91bmRpbmdCb3hNb2RlOiAnY2xpcHBpbmcnLFxuXHRcdFx0LyoqXG5cdFx0XHQqIENlbnRlcnMgdGhlIGVsZW1lbnQgaW4gdGhlIGNhbnZhcyBvciB3aGVuIGl0IGhhcyBhIGJvdW5kaW5nIGJveCBpbiB0aGUgYm91bmRpbmcgYm94LlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgYXV0b0NlbnRlclxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmVsZW1lbnRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0XHQqL1xuXHRcdFx0YXV0b0NlbnRlcjogZmFsc2UsXG5cdFx0XHQvKipcblx0XHRcdCogUmVwbGFjZXMgYW4gZWxlbWVudCB3aXRoIHRoZSBzYW1lIHR5cGUgYW5kIHJlcGxhY2UgdmFsdWUuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSByZXBsYWNlXG5cdFx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5lbGVtZW50UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCAnJ1xuXHRcdFx0Ki9cblx0XHRcdHJlcGxhY2U6ICcnLFxuXHRcdFx0LyoqXG5cdFx0XHQqIElmIGEgcmVwbGFjZSB2YWx1ZSBpcyBzZXQsIHlvdSBjYW4gZGVjaWRlIGlmIHRoZSBlbGVtZW50IHJlcGxhY2VzIHRoZSBlbGVtZW50cyB3aXRoIHRoZSBzYW1lIHJlcGxhY2UgdmFsdWUgaW4gYWxsIHZpZXdzIG9yIG9ubHkgaW4gdGhlIGN1cnJlbnQgc2hvd2luZyB2aWV3LlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgcmVwbGFjZUluQWxsVmlld3Ncblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5lbGVtZW50UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCAnJ1xuXHRcdFx0Ki9cblx0XHRcdHJlcGxhY2VJbkFsbFZpZXdzOiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBTZWxlY3RzIHRoZSBlbGVtZW50IHdoZW4gaXRzIGFkZGVkIHRvIHN0YWdlLlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgYXV0b1NlbGVjdFxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmVsZW1lbnRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0XHQqL1xuXHRcdFx0YXV0b1NlbGVjdDogZmFsc2UsXG5cdFx0XHQvKipcblx0XHRcdCogU2V0cyB0aGUgZWxlbWVudCBhbHdheXMgb24gdG9wLlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgdG9wcGVkXG5cdFx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuZWxlbWVudFBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHRcdCovXG5cdFx0XHR0b3BwZWQ6IGZhbHNlLFxuXHRcdFx0LyoqXG5cdFx0XHQqIFlvdSBjYW4gZGVmaW5lIGRpZmZlcmVudCBwcmljZXMgd2hlbiB1c2luZyBhIHJhbmdlIG9mIGNvbG9ycywgc2V0IHRocm91Z2ggdGhlIGNvbG9ycyBvcHRpb24uXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBjb2xvclByaWNlc1xuXHRcdFx0KiBAdHlwZSB7T2JqZWN0fVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuZWxlbWVudFBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQge31cblx0XHRcdCogQGV4YW1wbGUgY29sb3JQcmljZXM6IHtcIjAwMDAwMFwiOiAyLCBcImZmZmZmZjogXCIzLjVcIn1cblx0XHRcdCovXG5cdFx0XHRjb2xvclByaWNlczoge30sXG5cdFx0XHQvKipcblx0XHRcdCogSW5jbHVkZSB0aGUgZWxlbWVudCBpbiBhIGNvbG9yIGxpbmsgZ3JvdXAuIFNvIGVsZW1lbnRzIHdpdGggdGhlIHNhbWUgY29sb3IgbGluayBncm91cCBhcmUgY2hhbmdpbmcgdG8gc2FtZSBjb2xvciBhcyBzb29uIGFzIG9uZSBlbGVtZW50IGluIHRoZSBncm91cCBpcyBjaGFuZ2luZyB0aGUgY29sb3IuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBjb2xvckxpbmtHcm91cFxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbiB8IFN0cmluZ31cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmVsZW1lbnRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0XHQqIEBleGFtcGxlICdteS1jb2xvci1ncm91cCdcblx0XHRcdCovXG5cdFx0XHRjb2xvckxpbmtHcm91cDogZmFsc2UsXG5cdFx0XHQvKipcblx0XHRcdCogQW4gYXJyYXkgb2YgVVJMcyB0byBwYXR0ZXJuIGltYWdlIC0gb255bCBmb3IgU1ZHIGltYWdlcyBvciB0ZXh0IGVsZW1lbnRzLlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgcGF0dGVybnNcblx0XHRcdCogQHR5cGUge0FycmF5fVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuZWxlbWVudFBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgW11cblx0XHRcdCogQGV4YW1wbGUgcGF0dGVybnM6IFsncGF0dGVybnMvcGF0dGVybl8xLnBuZycsICdwYXR0ZXJucy9wYXR0ZXJuXzIucG5nJyxdXG5cdFx0XHQqL1xuXHRcdFx0cGF0dGVybnM6IFtdLFxuXHRcdFx0LyoqXG5cdFx0XHQqIEFuIHVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgZWxlbWVudC5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IHNrdVxuXHRcdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuZWxlbWVudFBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgJydcblx0XHRcdCovXG5cdFx0XHRza3U6ICcnLFxuXHRcdFx0LyoqXG5cdFx0XHQqIFdoZW4gdHJ1ZSB0aGUgZWxlbWVudCBpcyBub3QgZXhwb3J0ZWQgaW4gU1ZHLiBJZiB5b3UgYXJlIGdvaW5nIHRvIHVzZSBvbmUgb2YgdGhlIGRhdGEgVVJMIG1ldGhvZHMgKGUuZy4gPGEgaHJlZj1cIi4vRmFuY3lQcm9kdWN0RGVzaWduZXIuaHRtbCNtZXRob2RfZ2V0UHJvZHVjdERhdGFVUkxcIj5nZXRQcm9kdWN0RGF0YVVSTCgpPC9hPiksIHlvdSBuZWVkIHRvIHNldCBvbmx5RXhwb3J0YWJsZT10cnVlIGluIHRoZSBvcHRpb25zLCBzbyB0aGUgZWxlbWVudCBpcyBub3QgZXhwb3J0ZWQgaW4gdGhlIGRhdGEgVVJMLlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgZXhjbHVkZUZyb21FeHBvcnRcblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5lbGVtZW50UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdFx0Ki9cblx0XHRcdGV4Y2x1ZGVGcm9tRXhwb3J0OiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBTaG93cyB0aGUgZWxlbWVudCBjb2xvcnMgaW4gY29sb3Igc2VsZWN0aW9uIHBhbmVsLiBSZXF1aXJlcyBGYW5jeSBQcm9kdWN0IERlc2lnbmVyIFBsdXMgQWRkLU9uLlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgc2hvd0luQ29sb3JTZWxlY3Rpb25cblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5lbGVtZW50UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdFx0Ki9cblx0XHRcdHNob3dJbkNvbG9yU2VsZWN0aW9uOiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBCeSB0aGUgZGVmYXVsdCB0aGUgZWxlbWVudCB3aWxsIGJlIGxvY2tlZCBhbmQgbmVlZHMgdG8gYmUgdW5sb2NrZWQgYnkgdGhlIHVzZXIgdmlhIHRoZSBcIk1hbmFnZSBMYXllcnNcIiBtb2R1bGUuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBsb2NrZWRcblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5lbGVtZW50UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdFx0Ki9cblx0XHRcdGxvY2tlZDogZmFsc2UsXG5cdFx0XHQvKipcblx0XHRcdCogQWxsb3cgdXNlciB0byB1bmxvY2sgcHJvcG9ydGlvbmFsIHNjYWxpbmcgaW4gdGhlIHRvb2xiYXIuIEFmdGVyIHRoYXQgdGhlIHVzZXIgc2NhbGUgdGhlIGVsZW1lbnQgdW5wcm9wb3J0aW9uYWwgdmlhIHRvb2xiYXIgb3IgZWxlbWVudCBib3VuZGFyeSBjb250cm9scy5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IHVuaVNjYWxpbmdVbmxvY2thYmxlXG5cdFx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuZWxlbWVudFBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHRcdCovXG5cdFx0XHR1bmlTY2FsaW5nVW5sb2NrYWJsZTogZmFsc2UsXG5cdFx0XHQvKipcblx0XHRcdCogVGhlIGxheWVyIGlzIGZpeGVkIGFuZCB3aWxsIHN0YXkgb24gdGhlIGNhbnZhcyB3aGVuIGNoYW5naW5nIHRoZSBwcm9kdWN0LlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgZml4ZWRcblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5lbGVtZW50UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdFx0Ki9cblx0XHRcdGZpeGVkOiBmYWxzZSxcblx0XHRcdG9yaWdpblg6ICdjZW50ZXInLFxuXHRcdFx0b3JpZ2luWTogJ2NlbnRlcicsXG5cdFx0XHRjb3JuZXJTaXplOiAyNCxcblx0XHRcdGZpbGw6IGZhbHNlLFxuXHRcdFx0bG9ja1VuaVNjYWxpbmc6IHRydWUsXG5cdFx0XHRwYXR0ZXJuOiBmYWxzZSxcblx0XHRcdHRvcDogMCxcblx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRhbmdsZTogMCxcblx0XHRcdGZsaXBYOiBmYWxzZSxcblx0XHRcdGZsaXBZOiBmYWxzZSxcblx0XHRcdG9wYWNpdHk6IDEsXG5cdFx0XHRzY2FsZVg6IDEsXG5cdFx0XHRzY2FsZVk6IDEsXG5cdFx0fSxcblx0XHQvKipcblx0XHQqIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBkZWZhdWx0IHRleHQgZWxlbWVudCBwYXJhbWV0ZXJzIGluIGFkZGl0aW9uIHRvIHRoZSA8YSBocmVmPVwiaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5JVGV4dC5odG1sXCIgdGFyZ2V0PVwiX2JsYW5rXCI+ZGVmYXVsdCBGYWJyaWMgSVRleHQgcHJvcGVydGllczwvYT4uIFNlZSA8YSBocmVmPVwiLi9PcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzLmh0bWxcIj5PcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzPC9hPi4gVGhlIHByb3BlcnRpZXMgaW4gdGhlIG9iamVjdCB3aWxsIG1lcmdlIHdpdGggdGhlIHByb3BlcnRpZXMgaW4gdGhlIGVsZW1lbnRQYXJhbWV0ZXJzLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSB0ZXh0UGFyYW1ldGVyc1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7T2JqZWN0fVxuXHRcdCovXG5cdFx0dGV4dFBhcmFtZXRlcnM6IHtcblx0XHRcdC8qKlxuXHRcdFx0KiBUaGUgbWF4aW1hbCBhbGxvd2VkIGNoYXJhY3RlcnMuIDAgbWVhbnMgdW5saW1pdGVkIGNoYXJhY3RlcnMuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBtYXhMZW5ndGhcblx0XHRcdCogQHR5cGUge051bWJlcn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IDBcblx0XHRcdCovXG5cdFx0XHRtYXhMZW5ndGg6IDAsXG5cdFx0XHQvKipcblx0XHRcdCogSWYgdHJ1ZSB0aGUgdGV4dCB3aWxsIGJlIGN1cnZlZC5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IGN1cnZlZFxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0XHQqL1xuXHRcdFx0Y3VydmVkOiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBJZiB0cnVlIHRoZSB0aGUgdXNlciBjYW4gc3dpdGNoIGJldHdlZW4gY3VydmVkIGFuZCBub3JtYWwgdGV4dC5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IGN1cnZhYmxlXG5cdFx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMudGV4dFBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHRcdCovXG5cdFx0XHRjdXJ2YWJsZTogZmFsc2UsXG5cdFx0XHQvKipcblx0XHRcdCogVGhlIGxldHRlciBzcGFjaW5nIHdoZW4gdGhlIHRleHQgaXMgY3VydmVkLlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgY3VydmVTcGFjaW5nXG5cdFx0XHQqIEB0eXBlIHtOdW1iZXJ9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy50ZXh0UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCAxMFxuXHRcdFx0Ki9cblx0XHRcdGN1cnZlU3BhY2luZzogMTAsXG5cdFx0XHQvKipcblx0XHRcdCogVGhlIHJhZGl1cyB3aGVuIHRoZSB0ZXh0IGlzIGN1cnZlZC5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IGN1cnZlUmFkaXVzXG5cdFx0XHQqIEB0eXBlIHtOdW1iZXJ9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy50ZXh0UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCA4MFxuXHRcdFx0Ki9cblx0XHRcdGN1cnZlUmFkaXVzOiA4MCxcblx0XHRcdC8qKlxuXHRcdFx0KiBSZXZlcnNlcyB0aGUgY3VydmVkIHRleHQuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBjdXJ2ZVJldmVyc2Vcblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy50ZXh0UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdFx0Ki9cblx0XHRcdGN1cnZlUmV2ZXJzZTogZmFsc2UsXG5cdFx0XHQvKipcblx0XHRcdCogVGhlIG1heGltYWwgYWxsb3dlZCBsaW5lcy4gMCBtZWFucyB1bmxpbWl0ZWQgY2hhcmFjdGVycy5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IG1heExpbmVzXG5cdFx0XHQqIEB0eXBlIHtOdW1iZXJ9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy50ZXh0UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCAwXG5cdFx0XHQqL1xuXHRcdFx0bWF4TGluZXM6IDAsXG5cdFx0XHQvKipcblx0XHRcdCogRW5hYmxlcyB0aGUgdGV4dCBlbGVtZW50IGFzIGEgdGV4dCBib3guIEEgdGV4dCBib3ggaGFzIGEgZml4ZWQgd2lkdGggYW5kIG5vdCBiZSByZXNpemVkLlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgdGV4dEJveFxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0XHQqL1xuXHRcdFx0dGV4dEJveDogZmFsc2UsXG5cdFx0XHQvKipcblx0XHRcdCogRW5hYmxlcyB0aGUgdGV4dCBlbGVtZW50IGFzIGEgcGxhY2Vob2xkZXIgZm9yIHRoZSBOYW1lcyAmIE51bWJlcnMgbW9kdWxlLiBZb3UgY2FuIGVuYWJsZSB0aGlzIHBhcmFtZXRlciBmb3Igb25lIHRleHQgZWxlbWVudCBpbiBhIHZpZXcuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSB0ZXh0UGxhY2Vob2xkZXJcblx0XHRcdCogQHR5cGUge0Jvb2xlYW4gfCBBcnJheX1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0XHQqL1xuXHRcdFx0dGV4dFBsYWNlaG9sZGVyOiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBFbmFibGVzIHRoZSB0ZXh0IGVsZW1lbnQgYXMgYSBudW1iZXIgcGxhY2Vob2xkZXIgZm9yIHRoZSBOYW1lcyAmIE51bWJlcnMgbW9kdWxlLiBZb3UgY2FuIGVuYWJsZSB0aGlzIHBhcmFtZXRlciBmb3Igb25lIHRleHQgZWxlbWVudCBpbiBhIHZpZXcuIElmIHlvdSB3YW50IHRvIGRlZmluZSBhIHJhbmdlIG9mIGFsbG93ZWQgbnVtYmVycywganVzdCB1c2UgYW4gYXJyYXkuIFRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgYXJyYXkgZGVmaW5lcyB0aGUgbWluaW11bSB2YWx1ZSwgdGhlIHNlY29uZCB2YWx1ZSBkZWZpbmVzIHRoZSBtYXhpbXVtIHZhbHVlLCBlLmcuIFswLCAxMF0uXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBudW1iZXJQbGFjZWhvbGRlclxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0XHQqL1xuXHRcdFx0bnVtYmVyUGxhY2Vob2xkZXI6IGZhbHNlLFxuXHRcdFx0LyoqXG5cdFx0XHQqIEFkZHRpb25hbCBzcGFjZSBiZXR3ZWVuIGxldHRlcnMuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBsZXR0ZXJTcGFjaW5nXG5cdFx0XHQqIEB0eXBlIHtOdW1iZXJ9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy50ZXh0UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCAwXG5cdFx0XHQqL1xuXHRcdFx0bGV0dGVyU3BhY2luZzogMCxcblx0XHRcdC8qKlxuXHRcdFx0KiBUaGUgcHJpY2Ugd2lsbCBiZSBjaGFyZ2VkIGZpcnN0IGFmdGVyIHRoZSB0ZXh0IGhhcyBiZWVuIGVkaXRlZC5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IGNoYXJnZUFmdGVyRWRpdGluZ1xuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0XHQqL1xuXHRcdFx0Y2hhcmdlQWZ0ZXJFZGl0aW5nOiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBUaGUgbWluaW11bSBmb250IHNpemUuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBtaW5Gb250U2l6ZVxuXHRcdFx0KiBAdHlwZSB7TnVtYmVyfVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMudGV4dFBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgMVxuXHRcdFx0Ki9cblx0XHRcdG1pbkZvbnRTaXplOiAxLFxuXHRcdFx0LyoqXG5cdFx0XHQqIFNldCB0aGUgdGV4dCB0cmFuc2Zvcm0gLSBub25lLCBsb3dlcmNhc2UsIHVwcGVyY2FzZS5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IHRleHRUcmFuc2Zvcm1cblx0XHRcdCogQHR5cGUge1N0cmluZ31cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0ICdub25lJ1xuXHRcdFx0Ki9cblx0XHRcdHRleHRUcmFuc2Zvcm06ICdub25lJyxcblx0XHRcdC8qKlxuXHRcdFx0KiBTZXQgYSB3aWR0aCBmb3IgdGhlIHRleHQsIHNvIHRoZSB0ZXh0IHdpbGwgYmUgc2NhbGVkIHVwL2Rvd24gdG8gdGhlIGdpdmVuIGFyZWEuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSB3aWR0aEZvbnRTaXplXG5cdFx0XHQqIEB0eXBlIHtOdW1iZXJ9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy50ZXh0UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCAwXG5cdFx0XHQqL1xuXHRcdFx0d2lkdGhGb250U2l6ZTogMCxcblx0XHRcdC8qKlxuXHRcdFx0KiBUaGUgbWF4aW11bSBmb250IHNpemUuIFVzaW5nIGEgdmFsdWUgaGlnaGVyIHRoYW4gMjAwIGNhbiBjYXVzZSBwZXJmb3JtYW5jZSBpc3N1ZXMgd2l0aCB0ZXh0IGJveGVzLlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgbWF4Rm9udFNpemVcblx0XHRcdCogQHR5cGUge051bWJlcn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IDFcblx0XHRcdCovXG5cdFx0XHRtYXhGb250U2l6ZTogMjAwLFxuXHRcdFx0LyoqXG5cdFx0XHQqIFRoZSBjb2xvciBvZiB0aGUgc2hhZG93LlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgc2hhZG93Q29sb3Jcblx0XHRcdCogQHR5cGUge1N0cmluZ31cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0ICcnXG5cdFx0XHQqL1xuXHRcdFx0c2hhZG93Q29sb3I6ICcnLFxuXHRcdFx0LyoqXG5cdFx0XHQqIFNoYWRvdyBCbHVyLlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgc2hhZG93Qmx1clxuXHRcdFx0KiBAdHlwZSB7TnVtYmVyfVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMudGV4dFBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgMFxuXHRcdFx0Ki9cblx0XHRcdHNoYWRvd0JsdXI6IDAsXG5cdFx0XHQvKipcblx0XHRcdCogU2hhZG93IGhvcml6b250YWwgb2Zmc2V0LlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgc2hhZG93T2Zmc2V0WFxuXHRcdFx0KiBAdHlwZSB7TnVtYmVyfVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMudGV4dFBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgMFxuXHRcdFx0Ki9cblx0XHRcdHNoYWRvd09mZnNldFg6IDAsXG5cdFx0XHQvKipcblx0XHRcdCogU2hhZG93IHZlcnRpY2FsIG9mZnNldC5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IHNoYWRvd09mZnNldFlcblx0XHRcdCogQHR5cGUge051bWJlcn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IDBcblx0XHRcdCovXG5cdFx0XHRzaGFkb3dPZmZzZXRZOiAwLFxuXHRcdFx0LyoqXG5cdFx0XHQqIExpbmsgdGhlIHRleHQgb2YgZGlmZmVyZW50IHRleHQgZWxlbWVudHMsIGNoYW5naW5nIHRoZSB0ZXh0IG9mIG9uZSBlbGVtZW50IHdpbGwgYWxzbyBjaGFuZ2UgdGhlIHRleHQgb2YgdGV4dCBlbGVtZW50cyB3aXRoIHRoZSBzYW1lIHRleHRMaW5rR3JvdXAgdmFsdWUuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSB0ZXh0TGlua0dyb3VwXG5cdFx0XHQqIEB0eXBlIHtTdHJpbmd9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy50ZXh0UGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBcIlwiXG5cdFx0XHQqL1xuXHRcdFx0dGV4dExpbmtHcm91cDogXCJcIixcblx0XHRcdC8qKlxuXHRcdFx0KiBUaGUgY29sb3JzIGZvciB0aGUgc3Ryb2tlLiBJZiBlbXB0eSwgdGhlIGNvbG9yIHdoZWVsIHdpbGwgYmUgZGlzcGxheWVkLlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgc3Ryb2tlQ29sb3JzXG5cdFx0XHQqIEB0eXBlIHtBcnJheX1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnRleHRQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IFtdXG5cdFx0XHQqL1xuXHRcdFx0c3Ryb2tlQ29sb3JzOiBbXSxcblx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0Zm9udEZhbWlseTogXCJBcmlhbFwiLFxuXHRcdFx0Zm9udFNpemU6IDE4LFxuXHRcdFx0bGluZUhlaWdodDogMSxcblx0XHRcdGZvbnRXZWlnaHQ6ICdub3JtYWwnLCAvL3NldCB0aGUgZm9udCB3ZWlnaHQgLSBib2xkIG9yIG5vcm1hbFxuXHRcdFx0Zm9udFN0eWxlOiAnbm9ybWFsJywgLy8nbm9ybWFsJywgJ2l0YWxpYydcblx0XHRcdHRleHREZWNvcmF0aW9uOiAnbm9ybWFsJywgLy8nbm9ybWFsJyBvciAndW5kZXJsaW5lJ1xuXHRcdFx0cGFkZGluZzogMTAsXG5cdFx0XHR0ZXh0QWxpZ246ICdsZWZ0Jyxcblx0XHRcdHN0cm9rZTogbnVsbCxcblx0XHRcdHN0cm9rZVdpZHRoOiAwLFxuXHRcdFx0Y2hhclNwYWNpbmc6IDAsXG5cdFx0fSxcblx0XHQvKipcblx0XHQqIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBkZWZhdWx0IGltYWdlIGVsZW1lbnQgcGFyYW1ldGVycyBpbiBhZGRpdGlvbiB0byB0aGUgPGEgaHJlZj1cImh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuSW1hZ2UuaHRtbFwiIHRhcmdldD1cIl9ibGFua1wiPmRlZmF1bHQgRmFicmljIEltYWdlIHByb3BlcnRpZXM8L2E+LiBTZWUgPGEgaHJlZj1cIi4vT3B0aW9ucy5kZWZhdWx0cy5pbWFnZVBhcmFtZXRlcnMuaHRtbFwiPk9wdGlvbnMuZGVmYXVsdHMuaW1hZ2VQYXJhbWV0ZXJzPC9hPi4gVGhlIHByb3BlcnRpZXMgaW4gdGhlIG9iamVjdCB3aWxsIG1lcmdlIHdpdGggdGhlIHByb3BlcnRpZXMgaW4gdGhlIGVsZW1lbnRQYXJhbWV0ZXJzLlxuXHRcdCpcblx0XHQqIEBwcm9wZXJ0eSBpbWFnZVBhcmFtZXRlcnNcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge09iamVjdH1cblx0XHQqL1xuXHRcdGltYWdlUGFyYW1ldGVyczoge1xuXHRcdFx0LyoqXG5cdFx0XHQqIElmIHRydWUgdGhlIGltYWdlIHdpbGwgYmUgdXNlZCBhcyB1cGxvYWQgem9uZS4gVGhhdCBtZWFucyB0aGUgaW1hZ2UgaXMgYSBjbGlja2FibGUgYXJlYSBpbiB3aGljaCB0aGUgdXNlciBjYW4gYWRkIGRpZmZlcmVudCBtZWRpYSB0eXBlcy5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IHVwbG9hZFpvbmVcblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5pbWFnZVBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgZmFsc2Vcblx0XHRcdCovXG5cdFx0XHR1cGxvYWRab25lOiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBTZXRzIGEgZmlsdGVyIG9uIHRoZSBpbWFnZS4gUG9zc2libGUgdmFsdWVzOiAnZ3JheXNjYWxlJywgJ3NlcGlhJywgJ3NlcGlhMicgb3IgYW55IGZpbHRlciBuYW1lIGZyb20gRlBERmlsdGVycyBjbGFzcy5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IGZpbHRlclxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmltYWdlUGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBudWxsXG5cdFx0XHQqL1xuXHRcdFx0ZmlsdGVyOiBudWxsLFxuXHRcdFx0LyoqXG5cdFx0XHQqIFNldCB0aGUgc2NhbGUgbW9kZSB3aGVuIGltYWdlIGlzIGFkZGVkIGludG8gYW4gdXBsb2FkIHpvbmUgb3IgcmVzaXplVG9XL3Jlc2l6ZVRvSCBwcm9wZXJ0aWVzIGFyZSBzZXQuIFBvc3NpYmxlIHZhbHVlczogJ2ZpdCcsICdjb3Zlcidcblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IHNjYWxlTW9kZVxuXHRcdFx0KiBAdHlwZSB7U3RyaW5nfVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuaW1hZ2VQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0ICdmaXQnXG5cdFx0XHQqL1xuXHRcdFx0c2NhbGVNb2RlOiAnZml0Jyxcblx0XHRcdC8qKlxuXHRcdFx0KiBSZXNpemVzIHRoZSB1cGxvYWRlZCBpbWFnZSB0byB0aGlzIHdpZHRoLiAwIG1lYW5zIGl0IHdpbGwgbm90IGJlIHJlc2l6ZWQuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSByZXNpemVUb1dcblx0XHRcdCogQHR5cGUge051bWJlcn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmltYWdlUGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCAwXG5cdFx0XHQqL1xuXHRcdFx0cmVzaXplVG9XOiAwLFxuXHRcdFx0LyoqXG5cdFx0XHQqIFJlc2l6ZXMgdGhlIHVwbG9hZGVkIGltYWdlIHRvIHRoaXMgaGVpZ2h0LiAwIG1lYW5zIGl0IHdpbGwgbm90IGJlIHJlc2l6ZWQuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSByZXNpemVUb0hcblx0XHRcdCogQHR5cGUge051bWJlcn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmltYWdlUGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCAwXG5cdFx0XHQqL1xuXHRcdFx0cmVzaXplVG9IOiAwLFxuXHRcdFx0LyoqXG5cdFx0XHQqIEVuYWJsZXMgYWR2YW5jZWQgZWRpdGluZywgdGhlIHVzZXIgY2FuIGNyb3AsIHNldCBmaWx0ZXJzIGFuZCBtYW5pcHVsYXRlIHRoZSBjb2xvciBvZiB0aGUgaW1hZ2UuIFRoaXMgd29ya3Mgb25seSBmb3IgcG5nIG9yIGpwZWcgaW1hZ2VzLiBJZiB0aGUgb3JpZ2luYWwgaW1hZ2UgaGFzIGJlZW4gZWRpdGVkIHZpYSB0aGUgaW1hZ2UgZWRpdG9yLCB0aGUgb3JpZ2luYWwgaW1hZ2Ugd2lsbCBiZSByZXBsYWNlZCBieSBhIFBORyB3aXRoIDcyRFBJIVxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgYWR2YW5jZWRFZGl0aW5nXG5cdFx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuaW1hZ2VQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IGZhbHNlXG5cdFx0XHQqL1xuXHRcdFx0YWR2YW5jZWRFZGl0aW5nOiBmYWxzZSxcblx0XHRcdC8qKlxuXHRcdFx0KiBJZiB0cnVlIHRoZSB1cGxvYWQgem9uZSBjYW4gYmUgbW92ZWQgYnkgdGhlIHVzZXIuXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSB1cGxvYWRab25lTW92YWJsZVxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmltYWdlUGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdFx0KiB2ZXJzaW9uIDQuOC4yXG5cdFx0XHQqL1xuXHRcdFx0dXBsb2FkWm9uZU1vdmFibGU6IGZhbHNlLFxuXHRcdFx0LyoqXG5cdFx0XHQqIElmIHRydWUgdGhlIHVwbG9hZCB6b25lIGNhbiBiZSByZW1vdmVkIGJ5IHRoZSB1c2VyLlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgdXBsb2FkWm9uZVJlbW92YWJsZVxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmltYWdlUGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCBmYWxzZVxuXHRcdFx0KiB2ZXJzaW9uIDUuMC4wXG5cdFx0XHQqL1xuXHRcdFx0dXBsb2FkWm9uZVJlbW92YWJsZTogZmFsc2UsXG5cdFx0XHRwYWRkaW5nOiAwLFxuXHRcdFx0bWluU2NhbGVMaW1pdDogMC4wMVxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0KiBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgZGVmYXVsdCBwYXJhbWV0ZXJzIGZvciBjdXN0b20gYWRkZWQgaW1hZ2VzLiBTZWUgPGEgaHJlZj1cIi4vT3B0aW9ucy5kZWZhdWx0cy5jdXN0b21JbWFnZVBhcmFtZXRlcnMuaHRtbFwiPk9wdGlvbnMuZGVmYXVsdHMuY3VzdG9tSW1hZ2VQYXJhbWV0ZXJzPC9hPi4gVGhlIHByb3BlcnRpZXMgaW4gdGhlIG9iamVjdCB3aWxsIG1lcmdlIHdpdGggdGhlIHByb3BlcnRpZXMgaW4gdGhlIGVsZW1lbnRQYXJhbWV0ZXJzIGFuZCBpbWFnZVBhcmFtZXRlcnMuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IGN1c3RvbUltYWdlUGFyYW1ldGVyc1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7T2JqZWN0fVxuXHRcdCovXG5cdFx0Y3VzdG9tSW1hZ2VQYXJhbWV0ZXJzOiB7XG5cdFx0XHQvKipcblx0XHRcdCogVGhlIG1pbmltdW0gdXBsb2FkIHNpemUgd2lkdGguXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBtaW5XXG5cdFx0XHQqIEB0eXBlIHtOdW1iZXJ9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5jdXN0b21JbWFnZVBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgMTAwXG5cdFx0XHQqL1xuXHRcdFx0bWluVzogMTAwLFxuXHRcdFx0LyoqXG5cdFx0XHQqIFRoZSBtaW5pbXVtIHVwbG9hZCBzaXplIGhlaWdodC5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IG1pbkhcblx0XHRcdCogQHR5cGUge051bWJlcn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmN1c3RvbUltYWdlUGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCAxMDBcblx0XHRcdCovXG5cdFx0XHRtaW5IOiAxMDAsXG5cdFx0XHQvKipcblx0XHRcdCogVGhlIG1heGltdW0gdXBsb2FkIHNpemUgd2lkdGguXG5cdFx0XHQqXG5cdFx0XHQqIEBwcm9wZXJ0eSBtYXhXXG5cdFx0XHQqIEB0eXBlIHtOdW1iZXJ9XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5jdXN0b21JbWFnZVBhcmFtZXRlcnNcblx0XHRcdCogQGRlZmF1bHQgMTUwMFxuXHRcdFx0Ki9cblx0XHRcdG1heFc6IDE1MDAsXG5cdFx0XHQvKipcblx0XHRcdCogVGhlIG1heGltdW0gdXBsb2FkIHNpemUgaGVpZ2h0LlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgbWF4SFxuXHRcdFx0KiBAdHlwZSB7TnVtYmVyfVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuY3VzdG9tSW1hZ2VQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IDE1MDBcblx0XHRcdCovXG5cdFx0XHRtYXhIOiAxNTAwLFxuXHRcdFx0LyoqXG5cdFx0XHQqIFRoZSBtaW5pbXVtIGFsbG93ZWQgRFBJIGZvciB1cGxvYWRlZCBpbWFnZXMuIFdvcmtzIG9ubHkgd2l0aCBKUEVHIGltYWdlcy5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IG1pbkRQSVxuXHRcdFx0KiBAdHlwZSB7TnVtYmVyfVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuY3VzdG9tSW1hZ2VQYXJhbWV0ZXJzXG5cdFx0XHQqIEBkZWZhdWx0IDcyXG5cdFx0XHQqL1xuXHRcdFx0bWluRFBJOiA3Mixcblx0XHRcdC8qKlxuXHRcdFx0KiBUaGUgbWF4aXVtdW0gaW1hZ2Ugc2l6ZSBpbiBNQi5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IG1heFNpemVcblx0XHRcdCogQHR5cGUge051bWJlcn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmN1c3RvbUltYWdlUGFyYW1ldGVyc1xuXHRcdFx0KiBAZGVmYXVsdCAxMFxuXHRcdFx0Ki9cblx0XHRcdG1heFNpemU6IDEwXG5cdFx0fSxcblx0XHQvKipcblx0XHQqIEFuIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgcGFyYW1ldGVycyBmb3IgY3VzdG9tIGFkZGVkIHRleHQuVGhlIHByb3BlcnRpZXMgaW4gdGhlIG9iamVjdCB3aWxsIG1lcmdlIHdpdGggdGhlIHByb3BlcnRpZXMgaW4gdGhlIGVsZW1lbnRQYXJhbWV0ZXJzIGFuZCB0ZXh0UGFyYW1ldGVycy5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgY3VzdG9tVGV4dFBhcmFtZXRlcnNcblx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0c1xuXHRcdCogQHR5cGUge09iamVjdH1cblx0XHQqL1xuXHRcdGN1c3RvbVRleHRQYXJhbWV0ZXJzOiB7fSxcblx0XHQvKipcblx0XHQqIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBzdXBwb3J0ZWQgbWVkaWEgdHlwZXMgdGhlIHVzZXIgY2FuIGFkZCBpbiB0aGUgcHJvZHVjdCBkZXNpZ25lci5cblx0XHQqXG5cdFx0KiBAcHJvcGVydHkgY3VzdG9tQWRkc1xuXHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzXG5cdFx0KiBAdHlwZSB7T2JqZWN0fVxuXHRcdCovXG5cdFx0Y3VzdG9tQWRkczoge1xuXHRcdFx0LyoqXG5cdFx0XHQqIElmIHRydWUgdGhlIHVzZXIgY2FuIGFkZCBpbWFnZXMgZnJvbSB0aGUgZGVzaWducyBsaWJyYXJ5LlxuXHRcdFx0KlxuXHRcdFx0KiBAcHJvcGVydHkgZGVzaWduc1xuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLmN1c3RvbUFkZHNcblx0XHRcdCogQGRlZmF1bHQgdHJ1ZVxuXHRcdFx0Ki9cblx0XHRcdGRlc2lnbnM6IHRydWUsXG5cdFx0XHQvKipcblx0XHRcdCogSWYgdHJ1ZSB0aGUgdXNlciBjYW4gYWRkIGFuIG93biBpbWFnZS5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IHVwbG9hZHNcblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5jdXN0b21BZGRzXG5cdFx0XHQqIEBkZWZhdWx0IHRydWVcblx0XHRcdCovXG5cdFx0XHR1cGxvYWRzOiB0cnVlLFxuXHRcdFx0LyoqXG5cdFx0XHQqIElmIHRydWUgdGhlIHVzZXIgY2FuIGFkZCBvd24gdGV4dC5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IHRleHRzXG5cdFx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMuY3VzdG9tQWRkc1xuXHRcdFx0KiBAZGVmYXVsdCB0cnVlXG5cdFx0XHQqL1xuXHRcdFx0dGV4dHM6IHRydWUsXG5cdFx0XHQvKipcblx0XHRcdCogSWYgdHJ1ZSB0aGUgdXNlciBjYW4gYWRkIG93biBkcmF3aW5ncy5cblx0XHRcdCpcblx0XHRcdCogQHByb3BlcnR5IGRyYXdpbmdcblx0XHRcdCogQHR5cGUge0Jvb2xlYW59XG5cdFx0XHQqIEBmb3IgT3B0aW9ucy5kZWZhdWx0cy5jdXN0b21BZGRzXG5cdFx0XHQqIEBkZWZhdWx0IHRydWVcblx0XHRcdCovXG5cdFx0XHRkcmF3aW5nOiB0cnVlXG5cdFx0fSxcblx0XHQvKipcblx0XHQqIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBwcm9wZXJ0aWVzIChwYXJhbWV0ZXJzKSBmb3IgdGhlIFFSIGNvZGUuXG5cdFx0KlxuXHRcdCogQHByb3BlcnR5IHFyQ29kZVByb3BzXG5cdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHNcblx0XHQqIEB0eXBlIHtPYmplY3R9XG5cdFx0Ki9cblx0XHRxckNvZGVQcm9wczoge1xuXHRcdFx0LyoqXG5cdFx0XHQqIEBwcm9wZXJ0eSBhdXRvQ2VudGVyXG5cdFx0XHQqIEB0eXBlIHtCb29sZWFufVxuXHRcdFx0KiBAZm9yIE9wdGlvbnMuZGVmYXVsdHMucXJDb2RlUHJvcHNcblx0XHRcdCogQGRlZmF1bHQgdHJ1ZVxuXHRcdFx0Ki9cblx0XHRcdGF1dG9DZW50ZXI6IHRydWUsXG5cdFx0XHQvKipcblx0XHRcdCogQHByb3BlcnR5IGRyYWdnYWJsZVxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnFyQ29kZVByb3BzXG5cdFx0XHQqIEBkZWZhdWx0IHRydWVcblx0XHRcdCovXG5cdFx0XHRkcmFnZ2FibGU6IHRydWUsXG5cdFx0XHQvKipcblx0XHRcdCogQHByb3BlcnR5IHJlbW92YWJsZVxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnFyQ29kZVByb3BzXG5cdFx0XHQqIEBkZWZhdWx0IHRydWVcblx0XHRcdCovXG5cdFx0XHRyZW1vdmFibGU6IHRydWUsXG5cdFx0XHQvKipcblx0XHRcdCogQHByb3BlcnR5IHJlc2l6YWJsZVxuXHRcdFx0KiBAdHlwZSB7Qm9vbGVhbn1cblx0XHRcdCogQGZvciBPcHRpb25zLmRlZmF1bHRzLnFyQ29kZVByb3BzXG5cdFx0XHQqIEBkZWZhdWx0IHRydWVcblx0XHRcdCovXG5cdFx0XHRyZXNpemFibGU6IHRydWVcblx0XHR9LFxuXHR9O1xuXG5cdC8qKlxuXHQgKiBNZXJnZXMgdGhlIGRlZmF1bHQgb3B0aW9ucyB3aXRoIGN1c3RvbSBvcHRpb25zLlxuXHQgKlxuXHQgKiBAbWV0aG9kIG1lcmdlXG5cdCAqIEBmb3IgT3B0aW9uc1xuXHQgKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdHMgVGhlIGRlZmF1bHQgb2JqZWN0LlxuXHQgKiBAcGFyYW0ge09iamVjdH0gW21lcmdlXSBUaGUgbWVyZ2VkIG9iamVjdCwgdGhhdCB3aWxsIGJlIG1lcmdlZCBpbnRvIHRoZSBkZWZhdWx0cy5cblx0ICogQHJldHVybiB7T2JqZWN0fSBUaGUgbmV3IG9wdGlvbnMgb2JqZWN0LlxuXHQgKi9cblx0bWVyZ2UoZGVmYXVsdHMsIG1lcmdlKSB7XG5cblx0XHR0eXBlb2YgbWVyZ2UgPT09ICd1bmRlZmluZWQnID8ge30gOiBtZXJnZTtcbiAgICAgICAgXG4gICAgICAgIC8vdG9kbzogZG8gZGVlcCBtZXJnZSBoZXJlIGluc3RlYWQgb2YgbXVsdGlwbGUgZXh0ZW5kc1xuXHRcdHZhciBvcHRpb25zID0gZGVlcE1lcmdlKGRlZmF1bHRzLCBtZXJnZSk7XG5cdFx0Ly8gb3B0aW9ucy5lbGVtZW50UGFyYW1ldGVycyA9IGpRdWVyeS5leHRlbmQoe30sIGRlZmF1bHRzLmVsZW1lbnRQYXJhbWV0ZXJzLCBvcHRpb25zLmVsZW1lbnRQYXJhbWV0ZXJzKTtcblx0XHQvLyBvcHRpb25zLnRleHRQYXJhbWV0ZXJzID0galF1ZXJ5LmV4dGVuZCh7fSwgZGVmYXVsdHMudGV4dFBhcmFtZXRlcnMsIG9wdGlvbnMudGV4dFBhcmFtZXRlcnMpO1xuXHRcdC8vIG9wdGlvbnMuaW1hZ2VQYXJhbWV0ZXJzID0galF1ZXJ5LmV4dGVuZCh7fSwgZGVmYXVsdHMuaW1hZ2VQYXJhbWV0ZXJzLCBvcHRpb25zLmltYWdlUGFyYW1ldGVycyk7XG5cdFx0Ly8gb3B0aW9ucy5jdXN0b21UZXh0UGFyYW1ldGVycyA9IGpRdWVyeS5leHRlbmQoe30sIGRlZmF1bHRzLmN1c3RvbVRleHRQYXJhbWV0ZXJzLCBvcHRpb25zLmN1c3RvbVRleHRQYXJhbWV0ZXJzKTtcblx0XHQvLyBvcHRpb25zLmN1c3RvbUltYWdlUGFyYW1ldGVycyA9IGpRdWVyeS5leHRlbmQoe30sIGRlZmF1bHRzLmN1c3RvbUltYWdlUGFyYW1ldGVycywgb3B0aW9ucy5jdXN0b21JbWFnZVBhcmFtZXRlcnMpO1xuXHRcdC8vIG9wdGlvbnMuY3VzdG9tQWRkcyA9IGpRdWVyeS5leHRlbmQoe30sIGRlZmF1bHRzLmN1c3RvbUFkZHMsIG9wdGlvbnMuY3VzdG9tQWRkcyk7XG5cdFx0Ly8gb3B0aW9ucy5jdXN0b21JbWFnZUFqYXhTZXR0aW5ncyA9IGpRdWVyeS5leHRlbmQoe30sIGRlZmF1bHRzLmN1c3RvbUltYWdlQWpheFNldHRpbmdzLCBvcHRpb25zLmN1c3RvbUltYWdlQWpheFNldHRpbmdzKTtcblx0XHQvLyBvcHRpb25zLnFyQ29kZVByb3BzID0galF1ZXJ5LmV4dGVuZCh7fSwgZGVmYXVsdHMucXJDb2RlUHJvcHMsIG9wdGlvbnMucXJDb2RlUHJvcHMpO1xuXHRcdC8vIG9wdGlvbnMuaW1hZ2VFZGl0b3JTZXR0aW5ncyA9IGpRdWVyeS5leHRlbmQoe30sIGRlZmF1bHRzLmltYWdlRWRpdG9yU2V0dGluZ3MsIG9wdGlvbnMuaW1hZ2VFZGl0b3JTZXR0aW5ncyk7XG5cdFx0Ly8gb3B0aW9ucy5keW5hbWljVmlld3NPcHRpb25zID0galF1ZXJ5LmV4dGVuZCh7fSwgZGVmYXVsdHMuZHluYW1pY1ZpZXdzT3B0aW9ucywgb3B0aW9ucy5keW5hbWljVmlld3NPcHRpb25zKTtcblx0XHQvLyBvcHRpb25zLnByaWNlRm9ybWF0ID0galF1ZXJ5LmV4dGVuZCh7fSwgZGVmYXVsdHMucHJpY2VGb3JtYXQsIG9wdGlvbnMucHJpY2VGb3JtYXQpO1xuXHRcdC8vIG9wdGlvbnMucHJpbnRpbmdCb3ggPSBqUXVlcnkuZXh0ZW5kKHt9LCBkZWZhdWx0cy5wcmludGluZ0JveCwgb3B0aW9ucy5wcmludGluZ0JveCk7XG5cblx0XHRyZXR1cm4gb3B0aW9ucztcblxuXHR9O1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFsbCBlbGVtZW50IHBhcmFtZXRlciBrZXlzLlxuXHQgKlxuXHQgKiBAbWV0aG9kIGdldFBhcmFtZXRlcktleXNcblx0ICogQGZvciBPcHRpb25zXG5cdCAqIEByZXR1cm4ge0FycmF5fSBBbiBhcnJheSBjb250YWluaW5nIGFsbCBlbGVtZW50IHBhcmFtZXRlciBrZXlzLlxuXHQgKi9cblx0Z2V0UGFyYW1ldGVyS2V5cygpIHtcbiAgICAgICAgXG5cdFx0dmFyIGVsZW1lbnRQYXJhbWV0ZXJzS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuZGVmYXVsdHMuZWxlbWVudFBhcmFtZXRlcnMpLFxuXHRcdFx0aW1hZ2VQYXJhbWV0ZXJzS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuZGVmYXVsdHMuaW1hZ2VQYXJhbWV0ZXJzKSxcblx0XHRcdHRleHRQYXJhbWV0ZXJzS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuZGVmYXVsdHMudGV4dFBhcmFtZXRlcnMpO1xuXG5cdFx0ZWxlbWVudFBhcmFtZXRlcnNLZXlzID0gZWxlbWVudFBhcmFtZXRlcnNLZXlzLmNvbmNhdChpbWFnZVBhcmFtZXRlcnNLZXlzKTtcblx0XHRlbGVtZW50UGFyYW1ldGVyc0tleXMgPSBlbGVtZW50UGFyYW1ldGVyc0tleXMuY29uY2F0KHRleHRQYXJhbWV0ZXJzS2V5cyk7XG5cblx0XHRyZXR1cm4gZWxlbWVudFBhcmFtZXRlcnNLZXlzO1xuXG5cdH07XG5cbn07IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVUlNYW5hZ2VyIHtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihtYWluT3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIFxuICAgICAgICB0aGlzLm1haW5PcHRpb25zID0gbWFpbk9wdGlvbnM7XG4gICAgICAgIGNvbnNvbGUubG9nKGZldGNoLCBtYWluT3B0aW9ucyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLiNsb2FkVGVtcGxhdGUoKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgICNsb2FkVGVtcGxhdGUoKSB7XG4gICAgICAgIFxuICAgICAgICBmZXRjaCh0aGlzLm1haW5PcHRpb25zLnRlbXBsYXRlc0RpcmVjdG9yeSsncHJvZHVjdGRlc2lnbmVyLmh0bWwnKVxuICAgICAgICAudGhlbihzdHJlYW0gPT4gc3RyZWFtLnRleHQoKSlcbiAgICAgICAgLnRoZW4odGV4dCA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8vdHJhbnNsYXRlcyBhIEhUTUwgZWxlbWVudFxuICAgIHRyYW5zbGF0ZUVsZW1lbnQoaHRtbEVsZW0pIHtcbiAgICBcbiAgICAgICAgbGV0IGxhYmVsID0gJyc7XG4gICAgICAgIGlmKHRoaXMubWFpbk9wdGlvbnMubGFuZ0pzb24pIHtcbiAgICBcbiAgICAgICAgICAgIGxldCBvYmpTdHJpbmcgPSAnJztcbiAgICBcbiAgICAgICAgICAgIGlmKGh0bWxFbGVtLmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgICAgICAgIG9ialN0cmluZyA9IGh0bWxFbGVtLmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoaHRtbEVsZW0uZ2V0QXR0cmlidXRlKCd0aXRsZScpKSB7XG4gICAgICAgICAgICAgICAgb2JqU3RyaW5nID0gaHRtbEVsZW0uZ2V0QXR0cmlidXRlKCd0aXRsZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihodG1sRWxlbS5kYXRhc2V0LnRpdGxlKSB7XG4gICAgICAgICAgICAgICAgb2JqU3RyaW5nID0gaHRtbEVsZW0uZGF0YXNldC50aXRsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG9ialN0cmluZyA9IGh0bWxFbGVtLmlubmVyVGV4dDtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIHZhciBrZXlzID0gb2JqU3RyaW5nLnNwbGl0KCcuJyksXG4gICAgICAgICAgICAgICAgZmlyc3RPYmplY3QgPSB0aGlzLm1haW5PcHRpb25zLmxhbmdKc29uW2tleXNbMF1dO1xuICAgIFxuICAgICAgICAgICAgaWYoZmlyc3RPYmplY3QpIHsgLy9jaGVjayBpZiBvYmplY3QgZXhpc3RzXG4gICAgXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBmaXJzdE9iamVjdFtrZXlzWzFdXTtcbiAgICBcbiAgICAgICAgICAgICAgICBpZihsYWJlbCA9PT0gdW5kZWZpbmVkKSB7IC8vaWYgbGFiZWwgZG9lcyBub3QgZXhpc3QgaW4gSlNPTiwgdGFrZSBkZWZhdWx0IHRleHRcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBodG1sRWxlbS5kYXRhc2V0LmRlZmF1bHR0ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhYmVsID0gaHRtbEVsZW0uZGF0YXNldC5kZWZhdWx0dGV4dDtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxhYmVsID0gaHRtbEVsZW0uZGF0YXNldC5kZWZhdWx0dGV4dDtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBpZihodG1sRWxlbS5nZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJykpIHtcbiAgICAgICAgICAgIGh0bWxFbGVtLnNldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInLCBsYWJlbCk7XG4gICAgICAgICAgICBodG1sRWxlbS5pbm5lclRleHQgPSAnJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGh0bWxFbGVtLmdldEF0dHJpYnV0ZSgndGl0bGUnKSkge1xuICAgICAgICAgICAgaHRtbEVsZW0uc2V0QXR0cmlidXRlKCd0aXRsZScsIGxhYmVsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGh0bWxFbGVtLmRhdGFzZXQudGl0bGUpIHtcbiAgICAgICAgICAgIGh0bWxFbGVtLmRhdGFzZXQudGl0bGUgPSBsYWJlbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGh0bWxFbGVtLmlubmVyVGV4dCA9IGxhYmVsO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHJldHVybiBsYWJlbDtcbiAgICBcbiAgICB9O1xuICAgIFxufSIsImNvbnN0IGRlZXBNZXJnZSA9IChvYmoxLCBvYmoyKSA9PiB7XG4gICBcbiAgICAvLyBDcmVhdGUgYSBuZXcgb2JqZWN0IHRoYXQgY29tYmluZXMgdGhlIHByb3BlcnRpZXMgb2YgYm90aCBpbnB1dCBvYmplY3RzXG4gICAgY29uc3QgbWVyZ2VkID0ge1xuICAgICAgICAuLi5vYmoxLFxuICAgICAgICAuLi5vYmoyXG4gICAgfTtcbiAgICBcbiAgICBpZihPYmplY3Qua2V5cyhvYmoyKS5sZW5ndGgpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCB0aGUgcHJvcGVydGllcyBvZiB0aGUgbWVyZ2VkIG9iamVjdFxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhtZXJnZWQpKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgcHJvcGVydHkgaXMgYW4gb2JqZWN0XG4gICAgICAgICAgICBpZiAodHlwZW9mIG1lcmdlZFtrZXldID09PSAnb2JqZWN0JyAmJiBtZXJnZWRba2V5XSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBwcm9wZXJ0eSBpcyBhbiBvYmplY3QsIHJlY3Vyc2l2ZWx5IG1lcmdlIHRoZSBvYmplY3RzXG4gICAgICAgICAgICAgICAgaWYob2JqMltrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZFtrZXldID0gZGVlcE1lcmdlKG9iajFba2V5XSwgb2JqMltrZXldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBtZXJnZWQ7XG59XG5cbmV4cG9ydCB7IGRlZXBNZXJnZSB9OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsImltcG9ydCAnLi91aS9sZXNzL21haW4ubGVzcyc7XG5pbXBvcnQgJy4vY2xhc3Nlcy9GYW5jeVByb2R1Y3REZXNpZ25lci5qcyc7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
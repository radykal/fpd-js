// https://emojipedia.org/apple/

// import LoaderQueue from "../../util/loader.js";
import {getElementSvgSrc} from "../canvas/svg.js";
import emojisMappingsString from "./emojis-unicode13.js"
import {getCharCode} from "../../util/string.ext.js";
import {FmFonts} from "../fonts/fonts.js";

// fe0f in the enf of the mapping means that text or individual emojis repressentation is used by default.
// if no fe0f then emoji or ZWJ sequence is used by default

//zero with joiner <‍‍> \u200D
// U+FE0F letiation Selector-16
// this symbol is used as An invisible codepoint which specifies that the preceding character should be displayed with emoji presentation.
// Only required if the preceding character defaults to text presentation. this is really good to know about this specification if working with emojis


//check next characte until text is in emoji mappings.
//if ef0f


const VS15 = "\uFE0E" //force text! <︎>
const VS16 = "\uFE0F"
const ZWJ = "\u200D"

let emojisMappingArray = emojisMappingsString.split(",");
// let zwjSequenses = emojisMappingArray.filter(item => item.includes(ZWJ))
// let simpleEmojis = emojisMappingArray.filter(item => !item.includes(ZWJ))


//todo problem with textlines on initial rendering
export const FmEmoji = {
	name: "emojis",
	deps: [FmFonts],//todo better make it standalone
	prototypes: {
		Textbox:{
			"+storeProperties": ["emojisPath", "colorFont","specialMappings","emojisPath"],
			"^optionsOrder": ["emojisType", "emojisPath"],
			eventListeners: {
				"resized": "_updateEmojis"
			}
		},
		IText: {
			"+storeProperties": ["emojisPath", "colorFont","specialMappings","emojisPath"],
			"^optionsOrder": ["emojisType","emojisMapping", "emojisPath"],
			/**
			 * @private
			 */
			updateFromTextArea: function() {
				if (!this.hiddenTextarea) {
					return;
				}
				this.cursorOffsetCache = { };
				this.text = this.hiddenTextarea.value;
				this.findEmojis();//added
				if (this._shouldClearDimensionCache()) {
					this.initDimensions();
					this.setCoords();
				}
				let newSelection = this.fromStringToGraphemeSelection(
					this.hiddenTextarea.selectionStart, this.hiddenTextarea.selectionEnd, this.hiddenTextarea.value);
				this.selectionEnd = this.selectionStart = newSelection.selectionEnd;
				if (!this.inCompositionMode) {
					this.selectionStart = newSelection.selectionStart;
				}
				this.updateTextareaPosition();
			},
			eventListeners: {
				"resized": "_updateEmojis"
			}
		},
		Text: {
			"+storeProperties": ["emojisPath", "colorFont","specialMappings","emojisPath"],
			_updateEmojis(){
				this.findEmojis()
			},
			specialMappings: emojisMappingArray,
			// emojisMapping: emojisMappingsString.split(","),
			"^optionsOrder": ["emojisType", "emojisPath"],
			//todo can be overwritten by fonts.js
			setText: function (value,callback) {
				this.setProperty('text', "" + value)
				this.findEmojis(()=>{
					// if (this.replaceIncompatibleSymbolsEnabled) {
					this.replaceIncompatibleSymbols()
					// }
					callback && callback()
				})
			},
			// emojisType: "png",
			emojisPath: "",
			_emojiCache: {},
			/**
			 * @private
			 * @param {Number} textTopOffset Text top offset
			 * @param {Number} textLeftOffset Text left offset
			 * @return {Object}
			 */
			_getSVGTextAndBg: function(textTopOffset, textLeftOffset) {
				let textElements = {textSpans: [], special: []},
					textBgRects = [],
					height = textTopOffset, lineOffset;
				// bounding-box background
				this._setSVGBg(textBgRects);

				// text and text-background
				for (let i = 0, len = this._textLines.length; i < len; i++) {
					lineOffset = this._getLineLeftOffset(i);
					if (this.textBackgroundColor || this.styleHas('textBackgroundColor', i)) {
						this._setSVGTextLineBg(textBgRects, i, textLeftOffset + lineOffset, height);
					}
					this._setSVGTextLineText(textElements, i, textLeftOffset + lineOffset, height);
					height += this.getHeightOfLine(i);
				}

				return {
					special: textElements.special,
					textSpans: textElements.textSpans,
					textBgRects: textBgRects
				};
			},


			_setSVGTextLineText: function (textElements, lineIndex, textLeftOffset, textTopOffset) {
				// set proper line offset
				let lineHeight = this.getHeightOfLine(lineIndex),
					isJustify = this.textAlign.indexOf('justify') !== -1,
					actualStyle,
					nextStyle,
					charsToRender = '',
					charBox, style,
					boxWidth = 0,
					line = this._textLines[lineIndex],
					timeToRender;

				textTopOffset += lineHeight * (1 - this._fontSizeFraction) / this.lineHeight;
				for (let i = 0, len = line.length - 1; i <= len; i++) {
					timeToRender = i === len || this.charSpacing;
					charsToRender += line[i];
					charBox = this.__charBounds[lineIndex][i];
					if (boxWidth === 0) {
						textLeftOffset += charBox.kernedWidth - charBox.width;
						boxWidth += charBox.width;
					} else {
						boxWidth += charBox.kernedWidth;
					}
					if (isJustify && !timeToRender) {
						if (this._reSpaceAndTab.test(line[i])) {
							timeToRender = true;
						}
					}
					if (!timeToRender) {
						// if we have charSpacing, we render char by char
							actualStyle = actualStyle || this.getCompleteStyleDeclaration(lineIndex, i);
						nextStyle = this.getCompleteStyleDeclaration(lineIndex, i + 1);
						// timeToRender = this._hasStyleChangedForSvg(actualStyle, nextStyle)
						timeToRender =
							(this._specialArray && this._specialArray[lineIndex] && this._specialArray[lineIndex][i] !== this._specialArray[lineIndex][i + 1]) ||
							this._hasStyleChangedForSvg(actualStyle, nextStyle)
					}
					if (timeToRender) {
						style = this._getStyleDeclaration(lineIndex, i) || {};


						let emojiObject = this._specialArray && this._specialArray[lineIndex] && this._specialArray[lineIndex][i];

						if(this.emojisPath && emojiObject){


							let href;

							let url = this.emojisPath.replace("*", emojiObject.code)

							if(fabric.resources && fabric.resources[url]){
								href = fabric.resources[url].url;
							}
							else{
								let cache = this._emojiCache[this.emojisPath] [emojiObject.code];
								href = getElementSvgSrc(cache)
							}

							let fullDecl = this.getCompleteStyleDeclaration(lineIndex, i);
							let y =  textTopOffset - this.fontSize * (1- this._fontSizeFraction)

							textElements.special.push(
								`<image  href="${href}" `
								+ `x="${fabric.util.toFixed(textLeftOffset, fabric.Object.NUM_FRACTION_DIGITS)}" `
								+ `y="${fabric.util.toFixed(y, fabric.Object.NUM_FRACTION_DIGITS)}" `
								+ `width="${fullDecl.fontSize}" height="${fullDecl.fontSize}"/>`);
						}
						else{

							textElements.textSpans.push(this._createTextCharSpan(charsToRender, style, textLeftOffset, textTopOffset));
						}

						charsToRender = '';
						actualStyle = nextStyle;
						textLeftOffset += boxWidth;
						boxWidth = 0;
					}
				}
			},

			getUnicodeValuesArray(string){
				let array = []
				for(let i=0 ; i < string.length ; i++){
					if(string[i] !== VS16){
						array.push(getCharCode(string[i]).toString(16))
					}
				}
				return array;
			},
			/*checkForEmoji(line){
				let currentChars = []
				let currentEmoji = null
				let specials = []
				let sequence = null;

				for (let i = 0; i < line.length; i++) {
					let char = line[i]
					currentChars.push(char)
					let cText = currentChars.join("")

					if (simpleEmojis.includes(cText)) {
						if (currentEmoji) {
							currentEmoji.chars = currentChars.slice()
						} else {
							currentEmoji = {position: i, chars: currentChars.slice()}
							specials.push(currentEmoji)
							if(sequence){
								sequence.joined = currentEmoji;
							}
						}
					} else {
						if (char === ZWJ) {
							if(currentEmoji) {
								sequence = currentEmoji
							}
						}
						else{
							//force text
							if (char === VS15) {
								if (currentEmoji) {
									specials.splice(specials.indexOf(currentEmoji),1)
								}
							}
							else if (char === VS16) {
								if (currentEmoji) {
									currentEmoji.chars = currentChars.slice()
								}
							}
							sequence = null;
						}

						currentChars = []
						currentEmoji = null
					}
				}


				//zwj squences
				for(let special of specials){

					if(special.joined){
						let current = special;
						let joinedChars = current.chars.slice()
						while(current && current.joined){
							joinedChars.push(ZWJ)
							joinedChars = joinedChars.concat(current.joined.chars)

							let joinedText = joinedChars.join("").replace(VS16,"")
							//remove next emoji if could be replaced with szwj sequence
							if(zwjSequenses.includes(joinedText)){
								special.chars = joinedChars;

								let removingCurrent = special.joined
								do{
									specials.splice(specials.indexOf(removingCurrent),1)
									if(removingCurrent === current.joined)break;
								}while(removingCurrent = removingCurrent.joined)

								special.joined = current.joined.joined
							}
							current = current.joined;
						}
					}

				}
				return specials;
			},*/
			checkForEmoji(line, index){

				let currentChars = []
				let cText = currentChars.join("")

				let filtered = this.specialMappings;
				let result = null;

				for(let i = index; i < line.length;i ++){
					let char = line[i]
					currentChars.push(char)

					cText = currentChars.join("").replace(VS16,"")

					if (this.specialMappings.includes(cText)) {
						result = currentChars.slice()
					}

					filtered = filtered.filter(item => item.startsWith(cText))

					if(!filtered.length){
						break;
					}
				}
				if(result){
					if(line[index + result.length] === VS16){
						result.push(VS16)
					}
					else if(line[index + result.length] === VS15){
						result.push(VS15)
					}
				}
				return result;

				// if (simpleEmojis.includes(cText)) {
				// 	if (currentEmoji) {
				// 		currentEmoji.chars = currentChars.slice()
				// 	} else {
				// 		currentEmoji = {position: i, chars: currentChars.slice()}
				// 		specials.push(currentEmoji)
				// 		if(sequence){
				// 			sequence.joined = currentEmoji;
				// 		}
				// 	}
				// } else {
				// 	if (char === ZWJ) {
				// 		if(currentEmoji) {
				// 			sequence = currentEmoji
				// 		}
				// 	}
				// 	else{
				// 		//force text
				// 		if (char === VS15) {
				// 			if (currentEmoji) {
				// 				specials.splice(specials.indexOf(currentEmoji),1)
				// 			}
				// 		}
				// 		else if (char === VS16) {
				// 			if (currentEmoji) {
				// 				currentEmoji.chars = currentChars.slice()
				// 			}
				// 		}
				// 		sequence = null;
				// 	}
				//
				// 	currentChars = []
				// 	currentEmoji = null
				// }

			},
			findEmojis(callback){
				if(!this.__lineHeights){
					this._clearCache();
				}
				this._splitText();
				this._specialArray = [];

				// if (!this.emojisMapping) {
				// 	callback && callback()
				// 	return;
				// }
				let _emojis = [];

				// let loader = new LoaderQueue({
				// 	elements: [],
				// 	active: false,
				// 	complete: callback
				// });
				let promises = []

				for (let lineIndex = 0, len = this._textLines.length; lineIndex < len; lineIndex++) {
					let line = this._textLines[lineIndex];
					for (let charIndex = 0; charIndex < line.length; charIndex++) {
						let result = this.checkForEmoji(line,charIndex);
						if(result){
							if(result[result.length - 1] !== VS15){
								if(!this._specialArray[lineIndex]){
									this._specialArray[lineIndex] = []
								}

								let emojiComboCode = this.getUnicodeValuesArray(result).join("-")
								let emojiObject = {type: "emoji", index: _emojis.length + 1, code: emojiComboCode}
								_emojis.push(emojiObject)
								for (let i = charIndex; i < charIndex + result.length; i++) {
									this._specialArray[lineIndex][i] = emojiObject
								}
								if(this.emojisPath){
									if(!this._emojiCache[this.emojisPath]) {
										this._emojiCache[this.emojisPath] = {};
									}
									let cache = this._emojiCache[this.emojisPath] [emojiObject.code];

									//loaded cache
									if(cache && (cache.constructor.name === "HTMLImageElement"
										|| cache.constructor.name === "Image") && cache.complete && cache.naturalWidth){
										emojiObject.loaded = true;
										//aready loaded
									}
									else {

										//already in cache, but not loaded
										// loader.push(emojiObject)


										let promise;
										if(cache) {
											promise = cache;
										}
										else{
											promise = this._emojiCache[this.emojisPath][emojiObject.code] = new Promise((resolve , reject) => {
												fabric.util.loadImage(this.emojisPath.replace("*", emojiObject.code),(image) => {

													if(image){
														this._emojiCache[this.emojisPath][emojiObject.code] = image
														resolve(image)
													}
													else{
														reject()
													}
												})
											})
										}

										promise
											.then(()=>{
												emojiObject.loaded = true;
												// loader.shift(emojiObject)
												this.dirty = true;
												this.canvas && this.canvas.requestRenderAll();
											})
											.catch(()=>{
												emojiObject.error = true;
												// loader.shift(emojiObject)
												this.dirty = true;
												this.canvas && this.canvas.requestRenderAll();
											})

										promises.push(promise)


										// if(!cache) {
										//
										// 	image = this._emojiCache[this.emojisPath][emojiObject.code] = fabric.util.createImage()
										//
										// 	// if(fabric.loadImageAsBuffer){//fabric.pdf
										// 	// 	fabric.util.loadFileAsBlob(url)
										// 	// 		.then(blob => {
										// 	// 			blob.arrayBuffer().then(arrayBuffer => {
										// 	// 				fabric.util.fImageRegistry[url] = arrayBuffer;
										// 	// 				img.src = window.URL.createObjectURL(blob);
										// 	// 				if (img.naturalHeight) {
										// 	// 					setTimeout(onLoadCallback,0);
										// 	// 				}
										// 	// 			});
										// 	// 		})
										// 	// 		.catch(e => {
										// 	// 			console.error(e);
										// 	// 		})
										// 	// }
									}
								}
							}
							charIndex += result.length -1
						}
					}
				}

				Promise.all(promises).then(callback)
			},
			/**
			 * measure every grapheme of a line, populating __charBounds
			 * @param {Number} lineIndex
			 * @return {Object} object.width total width of characters
			 * @return {Object} object.widthOfSpaces length of chars that match this._reSpacesAndTabs
			 */
			_measureLine: function(lineIndex) {

				let width = 0,charIndex, grapheme, line = this._textLines[lineIndex], prevGrapheme,
					graphemeInfo, numOfSpaces = 0, lineBounds = new Array(line.length);

				let renderedLeft = 0;
				let renderedWidth = 0;
				let renderedBottom = -Infinity;
				let renderedTop = -Infinity

				this.__charBounds[lineIndex] = lineBounds;
				for (charIndex = 0; charIndex < line.length; charIndex++) {
					grapheme = line[charIndex];

					let specialObject = this._specialArray && this._specialArray[lineIndex] && this._specialArray[lineIndex][charIndex]
					if (specialObject && specialObject.type === "void") {
						grapheme = line[charIndex];
						graphemeInfo = {width: 0, left: 0, height: 0, kernedWidth: 0, deltaY: 0,}
						lineBounds[charIndex] = graphemeInfo;
						prevGrapheme = grapheme;
					}
					let style = this.getCompleteStyleDeclaration(lineIndex, charIndex);
					if (specialObject && specialObject.type === "emoji") {
						//add emoji symbol
						if(this.emojisPath ) {
							graphemeInfo = {
								width: style.fontSize,
								left: 0,
								height: style.fontSize,
								kernedWidth: style.fontSize,
								deltaY: 0,
							}
							if (charIndex > 0) {
								let previousBox = this.__charBounds[lineIndex][charIndex - 1];
								graphemeInfo.left = previousBox.left + previousBox.width
							}
						}
						else{
							let index = charIndex;
							while(this._specialArray[lineIndex][++index] === specialObject){}
							let grapheme = line.slice(charIndex,index).join("");
							graphemeInfo = this._getGraphemeBox(grapheme, lineIndex, charIndex, prevGrapheme);
						}

						lineBounds[charIndex] = graphemeInfo;
						width += graphemeInfo.kernedWidth;
						prevGrapheme = grapheme;

						//add Invisible-Symbols
						let index = charIndex;
						while(this._specialArray[lineIndex][++index] === specialObject){
							grapheme = line[index];
							graphemeInfo = {width: 0, left: 0, height: 0, kernedWidth: 0, deltaY: 0,}
							lineBounds[index] = graphemeInfo;
							prevGrapheme = grapheme;
							let previousBox = this.__charBounds[lineIndex][index - 1];
							graphemeInfo.left = previousBox.left + previousBox.width
						}
						charIndex = index - 1
					}else{
						//normal text
						graphemeInfo = this._getGraphemeBox(grapheme, lineIndex, charIndex, prevGrapheme);

						lineBounds[charIndex] = graphemeInfo;
						width += graphemeInfo.kernedWidth;
						prevGrapheme = grapheme;

						let contourX,contourW,contourH,contourY
						if (this.useRenderBoundingBoxes && graphemeInfo.contour) {
							contourX = graphemeInfo.contour.x  * style.fontSize
							contourW = graphemeInfo.contour.w  * style.fontSize
							contourH = graphemeInfo.contour.h  * style.fontSize
							contourY = this._getBaseLine(style.fontSize) + graphemeInfo.contour.y  * style.fontSize
							renderedLeft = Math.max(renderedLeft,  -(graphemeInfo.left + contourX))
							renderedWidth = Math.max(renderedWidth,contourW + contourX + graphemeInfo.left)
							renderedBottom = Math.max(renderedBottom, -contourY)
							renderedTop = Math.max(renderedTop,  contourY + contourH )
						}
					}

				}
				// this latest bound box represent the last character of the line
				// to simplify cursor handling in interactive mode.
				lineBounds[charIndex] = {
					left: graphemeInfo ? graphemeInfo.left + graphemeInfo.width : 0,
					width: 0,
					kernedWidth: 0,
					height: this.fontSize
				};

				let renderedRight = Math.max(0,renderedWidth - width)


				return { width, numOfSpaces,
					renderedLeft,
					renderedBottom,
					renderedRight,
					renderedTop
				};
			},
			"^textRenders": ["emojisTextRender"],
			emojisTextRender: function(method, ctx, _char, decl, alignment, left, top, angle) {
				let special = decl.special;
				if(!this.emojisPath || !special || special.type !== "emoji") {
					return false;
				}
				if(special.error) {
					return false;
				}
				if(decl.special.loaded) {
					let x = alignment === "center" ?  -decl.fontSize / 2 : 0
					ctx && ctx.drawImage(this._emojiCache[this.emojisPath][special.code], x, -0.9 * decl.fontSize , decl.fontSize, decl.fontSize)
				}
				return true;
			},
			eventListeners: {
				"resized": "_updateEmojis"
			}
		}
	}
}

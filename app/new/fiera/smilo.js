import './src/core/plugins.js'
import './src/core/base.js'
import './src/core/fromURL.js'
import './src/core/text.ext.js'
// import './src/core/states.js'
// import './src/core/event-listeners.js'

import {createTools}		from './tools.js'
import {FmInitialize}		from './src/core/object.initialize.js'
import {FmSetters} 			from './src/core/object.options.js'
import {FmTarget} 			from './src/core/target.js';
import {FmArcText}      	from './src/text/ArcText.js'
import {FmTyprRender}   	from './src/fonts/typrRender.js'
// import {FmFontkitRender}   	from './src/fonts/fontkitRender.js'
import {FmEmoji}	    	from './src/text/emojis.js'
import {FmOuterCanvas}  	from './src/canvas/outer-canvas.js'
import {FmGoogleFonts} 		from './src/fonts/googleFonts.js'
import {FmStates} 			from './src/core/states.js';
import {FmObservable} 		from './src/core/event-listeners.js';
// import {uploadDialog} from "./src/util/uploader.js";
// import {readFileAsText} from "./plugins/blob-buffers-utils.js";
import {FmCrop} from "./src/images/image-crop.js";
import {FmActivate} from "./src/core/activate.js";
import {FmControls} from "./src/canvas/controls.js";
import {FmTransformations} from "./src/modules/transformations.js";

// import {FmTransformations}  from './src/modules/transformations.js';

//Setting Up Fonts and  Emojis Paths
let baseUrl = ''
fabric.initialize({
	plugins: [
		// FmSpacing,
		FmInitialize,
		FmSetters,
		FmControls,
		// FmRelative,
		FmTarget,
		FmArcText,
		FmStates,
		FmTyprRender,
		// FmFontkitRender,
		FmEmoji,
		FmTransformations,
		FmOuterCanvas,
		FmObservable,
		FmActivate,
		FmGoogleFonts,
		FmCrop,
		// FmTransformations
	],
	mediaRoot: baseUrl,
	fontsRoot: baseUrl + 'fonts/'
})
fabric.fonts.calcCharBound = true;

fabric.extendPrototypes({
	Canvas: {
		stateful: true
	},
	Object: {
		mouseWheelScale: true,
		borderColor: 'rgb(0 142 122)',
		cornerColor: 'rgb(0 142 122)'
	},
	IText: {
		editingBorderColor: 'rgb(0 142 122)'
	},
	Text: {
		emojisPath: baseUrl + 'emoji/*.svg'
	},
	Image:{
		sourceRoot: fabric.mediaRoot,
		// fitting: "cover",
		eventListeners: {
			"mousedblclick": "cropPhotoStart"
		},
	}
})

// fabric.fonts.loadFontsDeclarations(fabric.fonts.fallbacks)
fabric.fonts.registerFonts({
	"Mr Dafoe": {
		// format: 'svg',
		src: "https://fonts.gstatic.com/s/mrdafoe/v9/lJwE-pIzkS5NXuMMrGiqg7MCxz_C.ttf"
	},
	"Sacramento": {
		// format: 'svg',
		src: "https://fonts.gstatic.com/s/sacramento/v8/buEzpo6gcdjy0EiZMBUG0CoV_NxLeiw.ttf"
	},
	"Faster One": {
		// format: 'svg',
		src: "https://fonts.gstatic.com/s/fasterone/v12/H4ciBXCHmdfClFb-vWhfyLuShq63czE.ttf"
	},
	'Gilbert Color': {
		format: 'svg',
		src: 'color/GilbertColor.otf'
	},
	'Bungee Color': {
		format: 'svg',
		src: 'color/BungeeColor.ttf'
	},
	'Abelone': {
		format: 'svg',
		src: 'color/Abelone.otf'
	},
	'NTBixa': {
		format: 'svg',
		src: 'color/NTBixaColor.otf'
	},
	'Playbox': {
		format: 'svg',
		src: 'color/PlayboxColor.otf'
	},
	'Papyrus': {
		src: 'custom/Papyrus.ttf'
	},
	'JetBrainsMono': {
		features: {
			calt: ['--', '---', '==', '===', '!=', '!==', '=!=', '=:=', '=/=', '<=', '>=', '&&', '&&&', '&=', '++', '+++', '***', ';;', '!!', '??', '?:', '?.', '?=', '<:', ':<', ':>', '>:', '<>', '<<<', '>>>', '<<', '>>', '||', '-|', '_|_', '|-', '||-', '|=', '||=', '##', '###', '####', '#{', '#[', ']#', '#(', '#?', '#_', '#_(', '#:', '#!', '#=', '^=', '<$>', '<$', '$>', '<+>', '<+', '+>', '<*>', '<*', '*>', '</', '</>', '/>', '<!--', '<#--', '-->', '->', '->>', '<<-', '<-', '<=<', '=<<', '<<=', '<==', '<=>', '<==>', '==>', '=>', '=>>', '>=>', '>>=', '>>-', '>-', '>--', '-<', '-<<', '>->', '<-<', '<-|', '<=|', '|=>', '|->', '<->', '<~~', '<~', '<~>', '~~', '~~>', '~>', '~-', '-~', '~@', '[||]', '|]', '[|', '|}', '{|', '[<', '>]', '|>', '<|', '||>', '<||', '|||>', '<|||', '<|>', '...', '..', '.=', '.-', '..<', '.?', '::', ':::', ':=', '::=', ':?', ':?>', '//', '///', '/*', '*/', '/=', '//=', '/==', '@_', '__']
		},
		src: {
			n7: 'custom/JetBrainsMono/JetBrainsMono-Bold.ttf',
			i7: 'custom/JetBrainsMono/JetBrainsMono-Bold-Italic.ttf',
			i4: 'custom/JetBrainsMono/JetBrainsMono-Italic.ttf',
			n4: 'custom/JetBrainsMono/JetBrainsMono-Regular.ttf',
		}
	}
})

//Setting Up Canvas and Objects controls overflow
const canvas =  new fabric.Canvas('canvas')
canvas.setDimensions({width: document.body.clientWidth - 100, height: document.body.clientHeight - 110})
canvas.setOuterCanvasContainer('fiera-area')
canvas.setOuterCanvasOpacity(0.1)
canvas.initEventListeners()


//active object observer
canvas.$activeobject = function(callback){
	this.on('target:changed',({selected,deselected})=>{
		callback(selected, deselected && deselected[0])
	})
}

window.canvas = canvas;
window.target = null;

canvas.on('target:changed',({selected})=> window.target = selected)

function setStyles(...intervals){
	let style = {};
	for(let interval of intervals){
		for(let i = interval.end; i >= interval.start;i--) {
			style[i] = interval.styles
		}
	}
	return style;
}

let greyStyle = {fill: 'grey',fontSize: 14}

let styles = {
	0: setStyles(
		{start: 0, end: 13, styles: greyStyle},
		{start: 32, end: 33, styles:  {fontFamily: 'Segoe UI Symbol'}},
	),
	1: setStyles(
		{start: 0, end: 10, styles: greyStyle},
		{start: 11, end: 14, styles:  {'fontSize': 50}},
		{start: 16, end: 25, styles:  {'underline': true, 'overline': true, 'linethrough': true}},
		{start: 27, end: 36, styles:  {'textBackgroundColor': 'red'}}
	),
	2: setStyles(
		{start: 0, end: 10, styles:greyStyle},
		{start: 12, end: 21, styles:  {fontFamily: 'Playbox'}},
	),
	3:  setStyles(
		{start: 0, end: 20, styles: greyStyle},
		{start: 20, end: 46, styles:  {fontFamily: 'Roboto'}},
	),
	4:  setStyles(
		{start: 0, end: 19, styles: greyStyle},
		{start: 20, end: 81, styles:  {fontFamily: 'JetBrainsMono',fontSize: 14}},
	)
}

let testText =[
	'1. Diacritics: Ẫ L͡orem ipsum',
	'2. Styled: Size Decoration Background',
	'3. Renders: Playbox ❤ 😀 👨‍👨‍👧‍👧  7⃣ ',
	'4. Common Ligatures: Roboto fl fi ffl ffi',
	'5. Other Ligatures: JBMono ==>> =>> >><< <<= <<== !=== !!== !== == === ==== ===!='
].join('\n')

let fallbacksTest = [
	'',
	'🇬🇧 Simply',
	'🇷🇺 Просто',
	'🇨🇳 简单地说',
	'🇰🇵 간단히말',
	'🇯🇵 単に言う'
].join('\n')

let languagesTest =  [
	'English ff ffi fl fi',
	'CN 简单地说 KP 간단히말',
	'Russian Здрасте Kyrgyz жөнөкөй Greek Απλά',
	'Arabian مرحبا Iran به سادگی sindhi سادو  pashto په ساده ډول ',
	'Gurmukhī ਗੁਰਮੁਖੀ Tamil தேவநாகரி punjabi ਬਸ',
	'Gujarati ગુજરાતી Oriya ଦେବନାଗ',
	'Telugu దేవనాగరి Kannada ದೇವನಾಗರಿ',
	'Malayalam ദേവനാഗരിSinhala දේවානගරි',
	'Armenian Պարզապես',
	'Azerbaijani Sadəcə',
	'Gujarati ખાલી',
	'🇮🇱 Hebrew בפשטות',
	'🇮🇳 केवल',
	'🇧🇩 কেবল',
	'Khmer ជា​ធម្មតា',
	'Lao ງ່າຍໆ',
	'Amharic ዴቫንጋሪ',
	'myanmar ရိုးရိုးလေးပါ	',
	'thai ง่ายดาย`'
].join('\n')

let emojisTest =[
	'Simple: ❤ 🧡 💛 💚 💙 💜 🖤 💔 ✅ ❎ ❤ 💛 ✊ ✊🏼',
	'Force Text Symbol: 7⃣\uFE0E 7⃣ ®\uFE0E ®\uFE0F ©\uFE0E ©\uFE0F 😀\uFE0E 😀',
	'ZWJ Sequences, Fitzpatrick: 👨‍👨‍👧‍👧 👩🏾‍🤝‍👨🏿 🏇🏼 🤹🏽‍♀️',
	'Unicode11: 🚆 🚇 🛤 🌄 🌇 🌆 🏙 🌃 🌌 🌉 🌁',
	'Unicode12: 🧏‍♂\uFE0F 🧏‍♀\uFE0F 🟥 🟧 🟨 🟩 🟦 🟪 🟫	',
	'Unicode13: 🐈‍⬛ 🐻‍❄\uFE0F 👩🏼‍🍼'
].join('\n')

let colorTest = [
	'Default',
	'Gilbert Color',
	'Bungee Color',
	'Abelone',
	'NTBixa',
	'PlayBox ПлейBox'
].join('\n')

let fontsArray = [
	'Abelone',
	'Arial',
	'Bungee Color',
	'Gilbert Color',
	'JetBrainsMono',
	'Papyrus',
	'Monoton',
	'NTBixa',
	'Pacifico',
	'Playbox',
	'Mr Dafoe',
	'Faster One',
	'Roboto',
	'Segoe UI Symbol',
	'Times New Roman'
]

const boundingBoxTest = {
		detectCollisions: true,
		contourStrokeWidth: 0.5,
		contourStroke: "blue",
		backgroundColor: "rgba(0,0,255,0.05)",
		backgroundStroke: {
			stroke: "blue",
			strokeWidth: 0.5
		},
		scaleX: 2,
		scaleY: 2,
		type: 'i-text',
		text: "Mr Dafoe",
		fontFamily: 'Mr Dafoe',
		textBackgroundColor: '#ee7dff44',
		top: 200,
		radius: 66,
		left: 100,
		fontSize: 50
	}

const boundingBoxTestObjects = {
	Roboto: {
		backgroundColor: "yellow",
		type: 'i-text',
		text: "Roboto",
		fontFamily: 'Roboto',
		textBackgroundColor: '#ee7dff44',
		movementLimits: "canvas",
		top: 0,
		scaleX: 1,
		scaleY: 1,
		left: 100,
		fontSize: 50
	},
	Sacrament: {
		backgroundColor: "yellow",
		type: 'i-text',
		text: "Sacrament",
		fontFamily: 'Sacramento',
		textBackgroundColor: '#ee7dff44',
		movementLimits: "canvas",
		top: 300,
		scaleX: 1,
		scaleY: 1,
		left: 100,
		fontSize: 50
	},
	FasterOne: {
		backgroundColor: "yellow",
		type: 'i-text',
		text: "Faster One",
		fontFamily: 'Faster One',
		textBackgroundColor: '#ee7dff44',
		top: 400,
		left: 100,
		fontSize: 50
	},
	MrDafoe: {
		backgroundColor: "yellow",
		type: 'i-text',
		text: "Mr Dafoe",
		fontFamily: 'Mr Dafoe',
		textBackgroundColor: '#ee7dff44',
		top: 200,
		left: 100,
		fontSize: 50
	},
	Playbox: {
		backgroundColor: "yellow",
		type: 'i-text',
		text: "Playbox",
		fontFamily: 'Playbox',
		textBackgroundColor: '#ee7dff44',
		top: 500,
		left: 100,
		fontSize: 50
	},
	Papyrus: {
		backgroundColor: "yellow",
		type: 'i-text',
		text: "fff Papyrus fff\nfff  Papyrus  fff",
		fontFamily: 'Arial',
		// textBackgroundColor: '#ee7dff44',
		styles: {
			0: setStyles(
				{start: 0, end: 2, styles: {fontFamily: 'Mr Dafoe', textBackgroundColor: 'rgba(255,26,26,0.27)'}},
				{start: 4, end: 10, styles: {fontFamily: 'Papyrus', textBackgroundColor: 'rgba(51,255,42,0.27)'}},
				{start: 12, end: 15, styles: {fontFamily: 'Mr Dafoe', textBackgroundColor: 'rgba(255,26,26,0.27)'}},
			),
			1: setStyles(
				{start: 0, end: 2, styles: {fontFamily: 'Mr Dafoe', textBackgroundColor: 'rgba(255,26,26,0.27)'}},
				{start: 5, end: 11, styles: {fontFamily: 'Papyrus', textBackgroundColor: 'rgba(51,255,42,0.27)'}},
				{start: 14, end: 16, styles: {fontFamily: 'Mr Dafoe', textBackgroundColor: 'rgba(255,26,26,0.27)'}},
			)
		},
		top: 600,
		left: 100,
		fontSize: 50
	},
	ArialGradientEmoji: {
		backgroundColor: "yellow",
		type: 'i-text',
		text: "Arial Gradient ❤ 🧡 💛",
		fontFamily: 'Arial',
		fill: new fabric.Gradient({
			coords: {
				x1: 0,
				y1: 0,
				x2: 100,
				y2: 100,
			},
			colorStops: [
				{offset: 0, color: "red", opacity: 1},
				{offset: 1, color: "blue", opacity: 1}
			]
		}),
		textBackgroundColor: '#ee7dff44',
		top: 100,
		left: 100,
		fontSize: 50
	}
}

const fontsTestObjects= {
	colorFonts: {
		type: 'textbox',
		text: colorTest,
		styles: {
			0: setStyles({start: 0, end: 13, styles: {strokeWidth: 1, stroke: 'red'}}),
			1: setStyles({start: 0, end: 13, styles: {fontFamily: 'Gilbert Color', strokeWidth: 1, stroke: 'red'}}),
			2: setStyles({start: 0, end: 12, styles: {fontFamily: 'Bungee Color'}}),
			3: setStyles({start: 0, end: 7, styles: {fontFamily: 'Abelone'}}),
			4: setStyles({start: 0, end: 6, styles: {fontFamily: 'NTBixa'}}),
			5: setStyles({start: 0, end: 20, styles: {fontFamily: 'Playbox'}})
		},
		fontFamily: 'Arial',
		paintFirst: 'fill',
		fontSize: 30,
		top: 200,
		left: 800,
		lineHeight: 1,
		width: 300
	},
	emojisTest: {
		type: 'textbox',
		text: emojisTest,
		fontFamily: 'Segoe UI Symbol',
		top: 600,
		left: 800,
		width: 700,
		fontSize: 25
	},
	languages: {
		text: languagesTest,
		type: 'textbox',
		top: 0,
		left: 1200,
		width: 300,
		fontFamily: 'Roboto',
		fontSize: 20
	},
	serifFallbacks: {
		type: 'textbox',
		text: 'serif' + fallbacksTest,
		fontFamily: 'Times New Roman, SimSun, Nanum Myeongjo, serif',
		top: 0,
		lineHeight: 1,
		left: 800,
		width: 200,
		fontSize: 18
	},
	saerifFallbacks: {
		type: 'textbox',
		text: 'sans-serif' + fallbacksTest,
		fontFamily: 'Arial, sans-serif', //sans-serif fonts used by default. dont need to specify SimHei and Malgun Gothic
		top: 0,
		lineHeight: 1,
		left: 900,
		width: 200,
		fontSize: 18
	},
	cursiveFallbacks: {
		type: 'textbox',
		text: 'cursive' + fallbacksTest,
		fontFamily: 'Lobster, Ma Shan Zheng, Sawarabi Mincho, Stylish, cursive',
		top: 0,
		lineHeight: 1,
		left: 1000,
		width: 200,
		fontSize: 18
	}
}

const curvedObjects = {
	curvedText1:{
		type: "i-text",
		text: testText,
		styles,
		fontFamily: 'Arial',
		curvature: 20,
		fontSize: 25,
		textAlign: 'center',
		top: 50,
		left: 300,
		originX : 'center',
		width: 400
	},
	curvedText2 :{
		type: "i-text",
		text: testText,
		styles,
		fontFamily: 'Arial',
		fontSize: 25,
		textAlign: 'center',
		top: 350,
		left: 300,
		originX : 'center',
		width: 400
	},
	curvedText3: {
		type: "i-text",
		text: testText,
		styles,
		fontFamily: 'Arial',
		curvature: -20,
		fontSize: 25,
		textAlign: 'center',
		top: 650,
		left: 300,
		originX : 'center',
		width: 400
	}
}


let style = {
	"fill": "#3c3c40",
	"fontSize": 185.50700378,
	"fontFamily": "Bungee Inline",
	"fontWeight": 400
}


const MrDafoeTest = [
	boundingBoxTestObjects.MrDafoe,
	 {
		 backgroundColor: "yellow",
		 type: 'i-text',
		 text: "Mr Dafoe",
		 fontFamily: 'Mr Dafoe',
		 textBackgroundColor: '#ee7dff44',
		 top: 200,
		 left: 400,
		 fontSize: 50,
		 styles: {
			 0: setStyles(
				 {start: 3, end: 8, styles: {fontSize: 100}},
			 )
		 }
	 },
	{
		backgroundColor: "yellow",
		type: 'i-text',
		text: "Mr Dafoe",
		fontFamily: 'Mr Dafoe',
		fontSize: 50,
		textBackgroundColor: '#ee7dff44',
		top: 500,
		left: 400,
		styles: {
			0: setStyles(
				{start: 3, end: 8, styles: {fontSize: 25}},
			)
		}
	}
]

const elementsList = [
	{label: "❌Advanced BBox Test",value: boundingBoxTest},
	{label: "❌FontSize Test",value: MrDafoeTest},
	{label: "Various BBox",value:Object.values(boundingBoxTestObjects)},
	{label: "❌Curving",value: Object.values(curvedObjects)},
	{label: "Fonts",value: Object.values(fontsTestObjects)},
	{
		label: "Images", value: [
			{
				src: "photos/metup.png",
				type: "image",
				width: 500,
				height: 750
			}
		]
	},
	{label: "❌Kerning",value: [
			{
				type: 'i-text',
				fontSize: 25,
				renderer: "typr",
				text: "TYPR renderer: \n1111111111",
				styles: {
					1: setStyles({start: 0, end: 10, styles: {fontFamily: 'Mr Dafoe',textBackgroundColor: '#ee7dff44',fontSize: 50}})
				},
				top: 100,
				left: 100
			},
			{
				type: 'i-text',
				fontSize: 25,
				renderer: "default",
				text: "default renderer: \n1111111111",
				styles: {
					1: setStyles({start: 0, end: 10, styles: {fontFamily: 'Mr Dafoe',textBackgroundColor: '#ee7dff44',fontSize: 50}})
				},
				top: 200,
				left: 100,

			}
		]},
]

const tools = {






	textBackgroundColor: {
		caption: 'TextBgColor',
		type: 'color',
		change: (value) => target.setStyle('textBackgroundColor', value),
		value: () => target.getStyle('textBackgroundColor'),
		enabled: () => target && target.isText,
		observe: cb => canvas.on('target:changed target:modified $activeobject.mouseup', cb)
	},
	textFill: {
		caption: 'TextFill',
		type: 'color',
		change: (value) => target.setStyle('fill', value),
		value: () => target.getStyle('fill'),
		enabled: () => target && target.isText,
		observe: cb => canvas.on('target:changed target:modified $activeobject.mouseup', cb)
	},
	fontFamily: {
		caption: 'Font Family',
		type: 'select',
		options: fontsArray,
		change: (value) => target.setStyle('fontFamily', value),
		value: () => target.getStyle('fontFamily'),
		enabled: () => target && target.isText,
		observe: cb => canvas.on('target:changed target:modified $activeobject.mouseup', cb)
	},
	fontSize: {
		caption: 'Font Size',
		type: 'number',
		change: (value) => target.setStyle('fontSize', value),
		value: () => target.getStyle('fontSize'),
		enabled: () => target && target.isText,
		observe: cb => canvas.on('target:changed target:modified $activeobject.mouseup', cb)
	}
}

function createObjects(value){
	if(value.constructor === Array){
		for(let element of value){
			canvas.createObject(element)
		}
	}
	else{
		canvas.createObject(value)
	}
}

createTools({
	container: 'tools',
	tools: [
		tools.fontFamily,
		tools.textFill,
		tools.textBackgroundColor,
		tools.fontSize,
		{
			caption: 'Curvature',
			type: 'group',
			tools: [
				{
					type: 'checkbox',
					lblClass: "tool-button-icon fas fa-eye",
					change: (value) => {canvas.showControlsGuidlines = value;canvas.renderAll()},
					value: () => canvas.showControlsGuidlines
				},
				{
					type: 'number',
					min: -500,
					max: 500,
					change: (value) => target.setRadius(value),
					value: () => target.radius,
					enabled: () => target && target.isText,
					observe: cb => canvas.on('target:changed target:modified', cb)
				},
				{
					type: 'crange',
					min: -150,
					max: 150,
					on: () => target._lastCurvature || fabric.ArcText.prototype.curvature,
					off: () => {target._lastCurvature = target.curvature;return 0},
					change: (value) => target.setCurvature(value),
					value: () => target.curvature,
					enabled: () => target?.isText,
					observe: cb => canvas.on('target:changed target:modified', cb)
				}
			],
		},
		{
			caption: 'Text Style',
			type: 'group',
			tools: [
				{
					type: 'checkbox',
					lblClass: "tool-button-icon fa fa-underline",
					change: (value) => target.setStyle("underline",value),
					value: () => target.getStyle("underline"),
					enabled: () => target?.isText,
					observe: cb => canvas.on('mouse:up target:changed target:modified', cb)
				},
				{
					type: 'checkbox',
					lblClass: "tool-button-icon fa fa-bold",
					change: (value) => target.setStyle("fontWeight",value ? "bold" : "normal"),
					value: () => target.getStyle("fontWeight") === "bold",
					enabled: () => target?.isText,
					observe: cb => canvas.on('mouse:up target:changed target:modified', cb)
				},
				{
					type: 'checkbox',
					lblClass: "tool-button-icon fa fa-italic",
					change: (value) => target.setStyle("fontStyle",value ? "italic" : "normal"),
					value: () => target.getStyle("fontStyle") === "italic",
					enabled: () => target?.isText,
					observe: cb => canvas.on('mouse:up target:changed target:modified', cb)
				}
			],
		},
		{
			caption: 'Text Align',
			type: 'options',
			change: (value) => target.setTextAlign(value),
			value: () => target.textAlign,
			enabled: () => target && target.isText,
			options: [
				{value: "left", lblClass: "tool-button-icon fa fa-align-left"},
				{value: "center", lblClass: "tool-button-icon fa fa-align-center"},
				{value: "right", lblClass: "tool-button-icon fa fa-align-right"},
				{value: "justify", lblClass: "tool-button-icon fa fa-align-justify"}
			],
			observe: cb => canvas.on('target:changed', cb)
		},
		{
			caption: 'Elements',
			type: 'group',
			tools: [
				{
					type: 'dropdown',
					placeholder: "Add Element",
					options: elementsList,
					change: createObjects
				},
				{
					label: 'Clear',
					type: 'button',
					click: () => {
						canvas.clear()
					}
				}
			]
		},
		{
			caption: 'Crop',
			type: 'group',
			tools: [
				{
					type: 'button',
					label: 'Start',
					click: () => target.cropPhotoStart(),
					enabled: () => target?.isImage,
					observe: cb => canvas.on('target:modified', cb)
				},
				{
					type: 'button',
					label: 'End',
					click: () => target.cropEnd(),
					enabled: () => target?.isImage,
					observe: cb => canvas.on('target:modified', cb)
				}
			]
		}
	]
})

createObjects({
	type: "image",
	width: 500,
	height: 500,
	scaleX: 0.4,
	scaleY: 0.4,
	src: 'png/tribal/Fox.png'
})

createObjects({
	src: "photos/metup.png",
	type: "image",
	top: 100,
	left: 900,
	width: 500,
	height: 750,
	scaleX: 0.4,
	scaleY: 0.4,
	clipPath: {
		type: "image",
		width: 500,
		height: 750,
		src: 'png/tribal/Fox.png'
	}
})

createObjects({
	src: "photos/metup.png",
	type: "image",
	width: 500,
	height: 500,
	scaleX: 0.4,
	scaleY: 0.4,
	left: 300,
	top: 100,
	shadow: {offsetX: 3, offsetY: 3, blur: 10},
	strokeWidth:2,
	strokeDashArray : [5,5,2,5],
	stroke: "red",
})

createObjects({
	src: "photos/metup.png",
	type: "image",
	width: 500,
	height: 500,
	scaleX: 0.4,
	scaleY: 0.4,
	left: 500,
	top: 100,
	shadow: {offsetX: 3, offsetY: 3, blur: 10},
	strokeWidth:2,
	strokeDashArray : [5,5,2,5],
	stroke: "red",
	clipPath: {type: "circle",radius: 50, scaleY: 1.5}
})

// createObjects({
// 	id: "text-pattern",
// 	text: "Text Filled With Pattern",
// 	type: "i-text",
// 	top: 300, left: 50, fontSize: 90, scaleX: 0.46, fontWeight: "bold", fontFamily: "Tahoma",
// 	fill: {
// 		type: "pattern",
// 		source: "photos/metup.png",
// 		repeat: "repeat"
// 	}
// })
//
// canvas.getObjectByID('text-pattern').set('fill', new fabric.Pattern({
// 	source: "photos/metup.png",
// 	repeat: "repeat"
// }));
//
// createObjects({
// 	src: "photos/metup.png",
// 	type: "image",
// 	width: 500,
// 	height: 750,
// 	scaleX: 0.2,
// 	scaleY: 0.2,
// 	left: 700,
// 	top: 100,
// 	shadow: {offsetX: 3, offsetY: 3, blur: 10},
// 	strokeWidth:2,
// 	strokeDashArray : [5,5,2,5],
// 	stroke: "red",
// 	clipPath: {
// 		type: "text",
// 		fontSize: 90, scaleX: 0.65, fontWeight: "bold", fontFamily: "Tahoma"
// 	}
// })
//


canvas.on("$activeobject.moving $activeobject.rotating $activeobject.scaling $activeobject.changed", (event) => {
	if(target.detectCollisions){
		let bbox = target.getBoundingRect()
		if(bbox.left < 0 || bbox.top < 0 || bbox.left + bbox.width > canvas.width || bbox.top + bbox.height > canvas.height){

			let finalMatrix = target.calcOwnMatrix()

			let intersections = false
			for(let i =0; i< target._charTransformations.length; i++) {
				let row = target._charTransformations[i]
				for (let j =0; j < row.length - 1; j++) {
					let oX = target._contentOffsetX, oY = target._contentOffsetY
					let cc = row[j].contour
					if(cc){
						let tl = fabric.util.transformPoint({x: cc.tl.x - oX, y: cc.tl.y - oY}, finalMatrix),
							tr = fabric.util.transformPoint({x: cc.tr.x - oX, y: cc.tr.y - oY}, finalMatrix),
							bl = fabric.util.transformPoint({x: cc.bl.x - oX, y: cc.bl.y - oY}, finalMatrix),
							br = fabric.util.transformPoint({x: cc.br.x - oX, y: cc.br.y - oY}, finalMatrix)

						if (tl.x < 0 || tr.x < 0 || br.x < 0 || bl.x < 0 ||
							tl.y < 0 || tr.y < 0 || br.y < 0 || bl.y < 0 ||
							tl.x > canvas.width || tr.x > canvas.width || br.x > canvas.width || bl.x > canvas.width ||
							tl.y > canvas.height || tr.y > canvas.height || br.y > canvas.height || bl.y > canvas.height) {
							intersections = true
							if(target.styles?.[i]?.[j]?.contourStroke !== "red"){
								let pos = target.get1DCursorLocation(i,j)
								target.setStyleInterval("contourStroke","red",pos,pos+1)
							}
						}
						else{
							if(target.styles?.[i]?.[j]?.contourStroke !== "blue"){
								let pos = target.get1DCursorLocation(i,j)
								target.setStyleInterval("contourStroke","blue",pos,pos+1)
							}
						}
					}
				}
			}

			target.__outside = true
			target.backgroundStroke = {stroke : intersections ? "red" : "yellow", strokeWidth: 1}
			target.dirty = true;

		}
		else{
			if(target.__outside) {
				target.__outside = false
				target.backgroundStroke = {stroke: "blue", strokeWidth: 1}
				target.dirty = true;
				target.setStyle("contourStroke","blue")
			}
		}
	}
})
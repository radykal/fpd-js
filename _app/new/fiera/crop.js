import './src/core/base.js'
import './src/core/plugins.js'
import './src/core/object.initialize.js'
import './src/core/image.ext.js'
// import './src/core/canvas.ext.js'
import './src/core/states.js'
import './src/core/fromURL.js'
import './src/core/activate.js'
import './src/core/interactivity.js'

import {FmCrop}    from './src/images/image-crop.js'
import {FmInitialize}		from './src/core/object.initialize.js'
import {FmSetters} 			from './src/core/object.options.js'
import {FmTarget} 			from './src/core/target.js';
import {FmOuterCanvas}  from './src/canvas/outer-canvas.js'
import {FmObservable} 		from './src/core/event-listeners.js';
import {FmStates} from "./src/core/states.js";


//Setting Up Fonts and  Emojis Paths
let baseUrl = "http://cdn.hometlt.ru/"
fabric.initialize({
	plugins: [
		FmInitialize,
		FmSetters,
		FmTarget,
		FmStates,
		FmOuterCanvas,
		FmObservable,
		FmCrop
	],
	mediaRoot: baseUrl,
	fontsRoot: baseUrl + 'fonts/'
})



//Setting Up Canvas and Objects controls overflow
const canvas =  new fabric.Canvas('canvas')
canvas.setDimensions({width: document.body.clientWidth - 100, height: document.body.clientHeight - 110})
canvas.setOuterCanvasContainer('fiera-area')
canvas.setOuterCanvasOpacity(0.1)
canvas.initEventListeners()

//this could be enabled to work with Text ClipPath
canvas.preserveObjectStacking = true;
fabric.util.createAccessors && fabric.util.createAccessors(fabric.Object);

let loaded = 0;
function run(){
	if(++loaded < 4)return;

	//various tests
	var objPath = new fabric.Path('M 0 0 L 300 100 L 200 300 z',{left: 300, top: 650, fill: 'red', stroke: 'green', opacity: 0.5}),
			objGroup = new fabric.Group([
				new fabric.Circle({radius: 100, fill: '#eef', scaleY: 0.5, originX: 'center', originY: 'center'}),
				new fabric.Text('hello world', {fontSize: 30, originX: 'center', originY: 'center'})
			], {left: 400, top: 400, angle: -10}),
			objFoxImg = new fabric.Image(foxImg, {stroke: "red",strokeWidth:1,left: 100, top: 300,width: foxImg.width, height: foxImg.height}),
			objFoxSvg = fabric.util.groupSVGElements(foxSvg.objects, {left: 100, top: 300, width: foxSvg.width, height: foxSvg.height});

	//Apply cropping by dblclick and image resizing
	function applyCropping(obj){
		obj.on("mousedblclick", () => {
			obj.cropPhotoStart()
			obj.activeCrop.initEventListeners()
		})
		obj.initEventListeners()
		obj.setFitting("cover");
	}


	//Cropped Image Without Mask
	let masked1 = new fabric.Image(ydhImg,{top: 110, left: 710, width: 180,height: 180})
	applyCropping(masked1)
	// masked1.filters.push(new fabric.Image.filters.Grayscale({value: 0.5}));
	// masked1.applyFilters();
	masked1.shadow = new fabric.Shadow({offsetX: 3, offsetY: 3, blur: 10})
	masked1.opacity = 0.75;
	masked1.strokeWidth = 2
	masked1.strokeDashArray = [5,5,2,5]
	masked1.stroke = "red"


	//Cropped Image with SVG as a Mask
	let masked2 = new fabric.Image(ydhImg,{top: 310, left: 710, width: 180,height: 180})
	applyCropping(masked2)
	let objFoxSvg2 = fabric.util.groupSVGElements(foxSvg2.objects, {
		width: foxSvg2.width,
		height: foxSvg2.height
	});
	masked2.setClipPath(objFoxSvg2);

	//Cropped Image with Circle as a Mask
	let masked3 = new fabric.Image(ydhImg,{top: 510, left: 710, width: 180,height: 180})
	applyCropping(masked3)
	// masked3.setClipPath({
	// 	radius: 0.5
	// })
	masked3.setClipPath({type: "circle",radius: 50})


	//Cropped Image with Text as a Mask
	let maskedText = new fabric.Image(ydhImg,{top: 200, left: 50, width: 500,height: 100})
	applyCropping(maskedText)
	let textMask = new fabric.IText('Text As Mask', {top: 100, left: 50, type: 'text', fontSize: 100, fontWeight: "bold", fontFamily: "Tahoma"});
	maskedText.setClipPath(textMask)

	//Text Filled With Pattern
	let textPattern = new fabric.IText('Text Filled With Pattern', {top: 300, left: 50, type: 'text', fontSize: 90, scaleX: 0.46, fontWeight: "bold", fontFamily: "Tahoma"});


	//Text As Clip Path
	let textClipPath = new fabric.IText('Text As Clip Path', {top: 400, left: 50, type: 'text',  absolutePositioned: true, fontSize: 90, scaleX: 0.65, fontWeight: "bold", fontFamily: "Tahoma"});
	let coverImage = new fabric.Image(ydhImg,{top: 300, left: 0, width: 800,height: 600, clipPath: textClipPath, evented: false, selectable:false});

	canvas.add(
		masked1,
		masked2,
		masked3,
		maskedText,
		textPattern,
		textClipPath,
		coverImage
	);
}

var ydhImg = new Image();
ydhImg.onload = img => run()
ydhImg.src = fabric.mediaRoot + 'backgrounds/abstract/BG178.jpg'

var foxImg = new Image();
foxImg.onload = img => run()
foxImg.src = fabric.mediaRoot + 'svg-shapes/others/fox.svg'

let foxSvg;
fabric.loadSVGFromURL(fabric.mediaRoot + 'svg-shapes/others/fox.svg', (objects, options)=> {
	foxSvg = options
	foxSvg.objects = objects
	run()
})

let foxSvg2;
fabric.loadSVGFromURL(fabric.mediaRoot + 'svg-shapes/others/fox.svg', (objects, options)=> {
	foxSvg2 = options
	foxSvg2.objects = objects
	run()
})



import MagicWand from "../../plugins/magicwand.js";

/**
 * Pathfinder (Pathfinder) Interface for MagicWand selection tool
 * @param options
 * @constructor
 */
export default function Pathfinder(options) {
	this.initialize(options);
}

Pathfinder.prototype = {
	type: 'pathfinder',
	keepOldSelection: true,
	alphaChannel: true,
	pathfinderMode: 'new',
	selectionTool: 'magic',
	adjacentPixels: true,
	async: false,
	pathfinderTools: false,
	blurRadius: 0,
	hatchLength: 4,
	colorThreshold: 15,
	simplifyTolerant: 0,
	simplifyCount: 30,
	hatchOffset: 0,
	imageInfo: null,
	mask: null,
	downPoint: null,
	allowDraw: false,
	shapeSelectionTools: false,
	initialize: function (options) {
		for (var i in options) {
			this[i] = options[i];
		}
	},
	asyncronous: function (cb) {
		if (this.async) {
			setTimeout(cb);
		} else {
			cb();
		}
	},
	fillWithCurrentColor: function () {
		this.fill(this.color);
	},
	clearMemory: function () {
		delete this.resultCanvas;
		delete this.editedImageCanvas;
		delete this.test_picture;
		delete this.mask;
	},
	hide: function () {
		if (this.editedImageCanvas) {
			this.editedImageCanvas.remove();
			this.resultCanvas.remove();
			clearInterval(this.interval);
			this.clearMemory();
			this.fire('hidden');
		}
	},
	setContainer: function (container) {
		if (container.constructor === String) {
			container = document.getElementById(container);
		}
		this.container = container;

		this.test_picture = new Image();
		this.test_picture.onload = this.initCanvas.bind(this);
		return this;
	},
	getSelectionTool: function () {
		return this.selectionTool;
	},
	setSelectionTool: function (tool) {
		this.selectionTool = tool;
		this.downPoint = false ;
		// this.fire('tool:changed', tool);
	},
	getThreshold: function () {
		return this.colorThreshold;
	},
	setThreshold: function (thres) {
		if(thres !== undefined){
			this.colorThreshold = thres;
		}
		if (this.downPoint) {
			this.drawMask(this.downPoint.x, this.downPoint.y, this.adjacentPixels);
		}
		// this.fire('threshold:changed', {threshold: this.colorThreshold});
	},
	setPicture: function (img) {
		this.setImage(img);
		var cvs = fabric.util.createCanvasElement();

		cvs.onmouseup = this.onMouseUp.bind(this);
		cvs.onmousedown = this.onMouseDown.bind(this);
		cvs.onmousemove = this.onMouseMove.bind(this);
		cvs.oncontextmenu = function () {
			return false;
		};
		this.initCanvas(cvs);
	},
	load: function (file) {
		if (!file)return;

		if (file.constructor === String) {
			Pathfinder.test_picture.setAttribute('src',file);
		} else {
			var reader = new FileReader();
			reader.onload = function (e) {
				this.test_picture.setAttribute('src', e.target.result);
			}.bind(this);
			reader.readAsDataURL(file);
		}
	},
	initCanvas: function (cvs) {
		var img = this.editedImageCanvas;
		if(this.resultCanvas){
			$(this.resultCanvas).remove()
		}
		this.resultCanvas = cvs;
		this.createSelectionDrawCanvas();


		this.context = cvs.getContext('2d');
		cvs.width = img.width;
		cvs.height = img.height;
		//this.setImage(img);
	},
	setImage: function (img) {
		this._test_todo_img = img;
		//this.mask = null;//MagicWand.createMask(img.width,img.height);
		this.editedImageCanvas = fabric.util.createCanvasElement();
		this.editedImageCanvas.width = img.width;
		this.editedImageCanvas.height = img.height;
		this.editedImageCanvas.getContext('2d').drawImage(img, 0, 0);
		this.initCanvas(fabric.util.createCanvasElement())
	},
	getInfo: function () {

		var ctx = this.editedImageCanvas.getContext('2d');
		var imageInfo = ctx.getImageData(0, 0, this.editedImageCanvas.width, this.editedImageCanvas.height);
		imageInfo.bytes = 4;
		return imageInfo;
	},
	getMousePosition: function (e) {
		var scale = this.resultCanvas.width / $(this.resultCanvas).width();
		var target = e.target || e.srcElement,
			rect = target.getBoundingClientRect(),
			offsetX = e.clientX - rect.left,
			offsetY = e.clientY - rect.top;
		return {x: Math.round(offsetX * scale), y: Math.round(offsetY * scale)};
	},
	radius: 20,
	resetSelectionDrawCanvas: function () {
		this.selectionDrawContext.fillStyle = "black";
		//this.selectionDrawContext(0, 0, canvas.width, canvas.height);
		this.selectionDrawContext.fillRect(0,0,this.selectionDrawCanvas.width,this.selectionDrawCanvas.height);
		this.selectionDrawContext.fillStyle = "white";
		this.selectionDrawContext.strokeStyle = "white";
	},
	createSelectionDrawCanvas: function () {

		if(this.selectionDrawCanvas ){
			$(this.selectionDrawCanvas ).remove();
		}
		this.selectionDrawCanvas = fabric.util.createCanvasElement();
		this.selectionDrawCanvas.width  = this.resultCanvas.width;
		this.selectionDrawCanvas.height = this.resultCanvas.height;
		this.selectionDrawContext = this.selectionDrawCanvas.getContext("2d");
		this.resetSelectionDrawCanvas();
	},
	_onMouseDown: function (point) {
		point.x = Math.min(Math.max(0, parseInt(point.x)), this.resultCanvas.width - 1);
		point.y = Math.min(Math.max(0, parseInt(point.y)), this.resultCanvas.height - 1);
		this.allowDraw = true;
		this.drawingTools[this.selectionTool].mouseDown.call(this,point);
	},
	onMouseDown: function (e) {
		e.preventDefault();
		e.stopPropagation();
		this._onMouseDown(this.getMousePosition(e));

	},
	_onMouseMove: function (p) {
		p.x = Math.min(Math.max(0, parseInt(p.x)), this.resultCanvas.width - 1);
		p.y = Math.min(Math.max(0, parseInt(p.y)), this.resultCanvas.height - 1);
		this.drawingTools[this.selectionTool].mouseMove.call(this,p);
	},
	onMouseMove: function (e) {
		var p = this.getMousePosition(e);
		this._onMouseMove(p);
	},
	color: [255, 0, 0, 255],
	onMouseUp: function (e) {
		this.allowDraw = false;
		this.drawingTools[this.selectionTool].mouseUp.call(this,e);
	},
	applyMask: function (canvas, left, top) {
		if (canvas.width === 0 || canvas.height === 0) {
			delete this.mask;
			this.render();
			return;
		}
		var info = this.getInfo(),
			mask = MagicWand.maskSelection(canvas,left,top) ;

		this.mask = mask;
		// this.fire('selection:changed', {mask: mask, target: this.target});
	},
	setPathfinderMode: function (value) {
		this.pathfinderMode = value;
	},
	getPathfinderMode: function () {
		return this.pathfinderMode;
	},
	modifySelection: function (mask, pathfinderMode) {
		this.shouldModify = false;
		if(this.selectionObject){
			this.selectionObject.remove();
		}
		this.downPoint = false;
		if (mask === undefined) {
			mask = this.mask;
		}
		if (pathfinderMode === undefined) {
			pathfinderMode = this.pathfinderMode;
		}
		if (pathfinderMode !== 'new' && this.oldMask) {
			mask = MagicWand[pathfinderMode](mask, this.oldMask);
		}
		if (this.blurRadius) {
			mask = MagicWand.gaussBlurOnlyBorder(mask, this.blurRadius);
		}
		//if (pathfinderMode !== 'new' && this.oldMask || this.blurRadius) {
		//  mask.cacheInd = MagicWand.getBorderIndices(mask);
		//}

		if(mask && mask.count && this.keepOldSelection){
			mask.makeCache();
			this.oldMask = mask;
		}else{
			delete this.oldMask ;
		}


		this.mask = MagicWand.createMask(this.editedImageCanvas.width, this.editedImageCanvas.height);
		// if (!noEvents) {
		// 	this.fire('selection:changed', {mask: mask, target: this.target});
		// }
		this.render();
	},
	createSelection: function (mask) {
		if (this.shouldModify) {
			this.modifySelection();
		}

		this.mask = mask || MagicWand.createMask(this.editedImageCanvas.width, this.editedImageCanvas.height);
		this.render();
	},
	setSelection: function (mask) {
		this.mask = mask;
		this.render();
		// this.fire('selection:changed', {mask: mask, target: this.target});
	},
	fill: function (color, callback) {
		this.asyncronous(function () {
			this._fill(color, false);
			callback && callback.call(this);
		}.bind(this), 0);
	},
	_fill: function (color, invert, canvas) {


		if (!this.mask) return;


		canvas = canvas || this.editedImageCanvas;
		var ctx = canvas.getContext('2d');//b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);

		MagicWand.fillMask(ctx, this.mask, color);

		// this.fire('image:changed', this.editedImageCanvas);
	},
	hatchTick: function () {
		this.hatchOffset = (this.hatchOffset + 1) % (this.hatchLength * 2);
		this.render(true);
	},
	show: function () {
		while (this.container.lastChild) {
			this.container.removeChild(this.container.lastChild);
		}
		this.container.appendChild(this.editedImageCanvas);
		this.container.appendChild(this.resultCanvas);
		this.interval = setInterval(this.hatchTick.bind(this), 300);

		// this.fire('show');
	},
	clear: function (invert, canvas, callback) {
		this.asyncronous(function () {
			this._fill([0, 0, 0, 0], invert, canvas);
			callback && callback.call(this);
		}.bind(this), 0);
	},
	render: function (noBorder) {
		if (!this.context || !this.mask)return;

		var ctx = this.context;
		if (!noBorder) {
			this.mask.cacheInd = MagicWand.getBorderIndices(this.mask);
		}
		ctx.clearRect(0, 0, this.mask.width, this.mask.height);

		var _new_color = (!this.oldMask || this.pathfinderMode === "new" || this.pathfinderMode === "add"|| this.pathfinderMode === "exclude")
			? this.newMaskColor : this.removedMaskColor;

		var _intersection_color;
		if(this.pathfinderMode === "add" || this.pathfinderMode === "new"|| this.pathfinderMode === "intersect"){
			_intersection_color = this.newMaskColor;
		}else{
			_intersection_color = this.removedMaskColor ;//intersectionRemovedMaskColor;
		}
		var _old_color;
		if(this.pathfinderMode === "exclude" || this.pathfinderMode === "substract"|| this.pathfinderMode === "add"){
			_old_color = this.newMaskColor;
		}else{
			_old_color = this.removedMaskColor;
		}

		this.oldMask && this.oldMask.render(ctx,{
			fill: _old_color
		});


		this.mask.render(ctx,{
			fill: _new_color,
			intersectionColor : _intersection_color,
			outerIntersectionColor : _old_color,
			// outerFill : "rgba(0,0,0,0.5)"
		});

		if(this.renderBorder){
			this.oldMask && this.oldMask.renderBorder(ctx,{});

			this.mask.renderBorder(ctx,{
				hatchOffset: this.hatchOffset
			});
		}

	},
	renderBorder: true,
	intersectionRemovedMaskColor: '#ffaaaa',
	removedMaskColor: '#aaaaff',
	newMaskColor:  '#aaFFaa' ,
	renderMask: function (ctx, mask, color, left, top) {
		mask = mask || this.mask;
		mask && mask.render(ctx,{
			intersectionColor: '#fff',
			outerIntersectionColor: '#000',
			fill :color || '#fff',
			left : left,
			top : top
		})
	},
	getContours: function () {
		if (!this.__cs) {
			this.__cs = MagicWand.traceContours(this.mask);
			this.__cs = MagicWand.simplifyContours(this.__cs, this.simplifyTolerant, this.simplifyCount);
		}
		return this.__cs;
	},
	traceInner: function (ctx) {

		var cs = this.getContours();
		var ctx = ctx || this.context;
		ctx.beginPath();
		for (var i = 0; i < cs.length; i++) {
			if (!cs[i].inner) continue;
			var ps = cs[i].points;
			ctx.moveTo(ps[0].x, ps[0].y);
			for (var j = 1; j < ps.length; j++) {
				ctx.lineTo(ps[j].x, ps[j].y);
			}
		}
		ctx.stroke();
	},
	getColor: function () {
		return 'rgba(' + this.color.join(', ') + ')';
	},
	setColor: function (color) {
		var _arr = color.substring(color.indexOf('(') + 1, color.length - 1).split(', ');
		for (var i in _arr) {
			_arr[i] = parseFloat(_arr[i]);
		}
		_arr[3] = Math.round(_arr[3] * 255);
		this.color = _arr;
	},
	trace: function (ctx) {
		var info = this.getInfo();
		var cs = MagicWand.traceContours(this.mask);
		cs = MagicWand.simplifyContours(cs, this.simplifyTolerant, this.simplifyCount);

		// draw contours
		var ctx = ctx || this.context;
		ctx.clearRect(0, 0, info.width, info.height);
		//inner
		ctx.beginPath();
		for (var i = 0; i < cs.length; i++) {
			if (!cs[i].inner) continue;
			var ps = cs[i].points;
			ctx.moveTo(ps[0].x, ps[0].y);
			for (var j = 1; j < ps.length; j++) {
				ctx.lineTo(ps[j].x, ps[j].y);
			}
		}
		ctx.strokeStyle = 'red';
		ctx.stroke();
		//outer
		ctx.beginPath();
		for (var i = 0; i < cs.length; i++) {
			if (cs[i].inner) continue;
			var ps = cs[i].points;
			ctx.moveTo(ps[0].x, ps[0].y);
			for (var j = 1; j < ps.length; j++) {
				ctx.lineTo(ps[j].x, ps[j].y);
			}
		}
		ctx.strokeStyle = 'blue';
		ctx.stroke();
	},
	removeNoise: function (threshold) {

		if(!this.mask || !this.mask.count)return;
		this.createSelectionDrawCanvas();
		//this.renderMask(this.selectionDrawContext, this.mask);

		var cs = MagicWand.traceContours(this.mask);
		cs = MagicWand.simplifyContours(cs, this.simplifyTolerant, this.simplifyCount);

		var ctx = this.selectionDrawContext, v = this.canvas.viewportTransform;

		//  cs = MagicWand.simplifyContours(cs, this.simplifyTolerant, this.simplifyCount);

		ctx.save();
		ctx.translate(0.5,0.5);
		ctx.fillStyle= "#fff";
		//ctx.fillStyle= "#0f0";
		ctx.strokeStyle= "#fff";
		for (var i = 0; i < cs.length; i++) {
			if (!cs[i].inner && cs[i].points.length > threshold) {
				var ps = cs[i].points;
				ctx.beginPath();
				ctx.moveTo(ps[0].x, ps[0].y);
				for (var j = 1; j < ps.length; j++) {
					ctx.lineTo(ps[j].x, ps[j].y);
				}
				ctx.closePath();
				ctx.fill();
			}

		}
		this.mask = MagicWand.maskSelection( this.selectionDrawCanvas);
		this.setSelection(this.mask);

		ctx.restore();
	},

	selectBackground: function (fromCorners) {
		var info = this.getInfo(), mask;

		if (fromCorners) {
			var mask1 = MagicWand.selectBackground(info, [255, 255, 255, false], this.colorThreshold);
			var mask2 = MagicWand.selectBackground(info, [false, false, false, 0], this.colorThreshold);
			mask = MagicWand.add(mask1, mask2);
		} else {
			mask = MagicWand.selectAllByColor(info, [255, 255, 255, 255], this.colorThreshold);
		}

		if (this.blurRadius) {
			mask = MagicWand.gaussBlurOnlyBorder(mask, this.blurRadius);
		}
		this.setSelection(mask);
	},
	colorSelection: function (colors, threshold) {
		var info = this.getInfo(), mask2,
			mask = MagicWand.createMask(info.width, info.height);
		for (var i in colors) {
			var _color = new fabric.Color(colors[i])._source;
			_color[3] = Math.round(_color[3] * 255);
			mask2 = MagicWand.selectAllByColor(info, _color, threshold[i])
			mask = MagicWand.add(mask, mask2);
		}
		delete this.oldMask;
		this.modifySelection(mask);
	},
	smartSelection: function (threshold) {
		var info = this.getInfo(), mask;
		mask = MagicWand.selectBackground(info, null, threshold || this.colorThreshold);
		mask = MagicWand.invertMask(mask);
		delete this.oldMask;
		this.modifySelection(mask);
	}
};

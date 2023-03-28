// bug: shpuld be included before image crop. afterrender overrides
/**
 * puzzle
 *  {
		spacingX: 0,
		spacingY: 0,
		marginLeft: 0,
		marginRight: 0,
		marginTop: 0,
		marginBottom: 0,
		overflow: true,
		rows: 0,
		columns: 0,
		offsetX: 0,
		offsetY: 0,
		data: {}
	},
 */

// Object.assign(fabric.Object.prototype, )
//
// Object.assign(fabric.Group.prototype,)

let properties = ["puzzle","puzzleAlpha","puzzleOverflow","puzzleSpacing","puzzleTransform"]

export default {
	name: "puzzle",
	prototypes: {
		Object: {
			"+actions": {
				puzzleNone: {
					observe: "modified",
					title: "none",
					option: "none",
					variable: "puzzlePreset",
					className: "fa fa-undo"
				},
				puzzleCustom: {
					enabled: "puzzlePreset === 'custom'",
					observe: "modified",
					title: "custom",
					option: "custom",
					variable: "puzzlePreset",
					className: "fi fi-tiles-custom"
				},
				puzzleBasic: {
					observe: "modified",
					title: "basic",
					option: "basic",
					variable: "puzzlePreset",
					className: "fi fi-tiles-basic fi-large"
				},
				puzzleHalfBrick: {
					observe: "modified",
					title: "half-brick",
					option: "halfBrick",
					variable: "puzzlePreset",
					className: "fi fi-tiles-bricks fi-large"
				},
				puzzleHalfDrop: {
					observe: "modified",
					title: "half-drop",
					option: "halfDrop",
					variable: "puzzlePreset",
					className: "fi fi-tiles-drop fi-large"
				},
				puzzle: {
					className: "fi fi-patterns fi-large",
					title: "tiling",
					variable: "puzzlePreset",
					observe: "modified",
					popupWidth: 160,
					subMenuClassName: "fiera-puzzle-menu",
					menu: [
						"puzzleBasic","puzzleHalfBrick","puzzleHalfDrop", "puzzleNone",
						"puzzleSpacingRange",
						"puzzleSpacingNumber"
					]
				},
				puzzleSpacingRange: {
					width: 118,
					visible: "puzzle",
					showLabel: true,
					showButton: false,
					itemClassName: "fiera-tool-range",
					className: "fi fi-tiles-padding",
					title: "Spacing",
					variable: "puzzleSpacing",
					observe: "modified",
					type: "range",
					min: 0,
					max: 500,
					step: 1,
				},
				puzzleSpacingNumber: {
					width: 38,
					visible: "puzzle",
					showButton: false,
					itemClassName: "fiera-tool-range-number",
					title: "tiling spacing",
					variable: "puzzleSpacing",
					observe: "modified",
					type: "number",
					min: 0,
					max: 500,
					step: 1,
				},
			},
			"+storeProperties": ["puzzle","puzzleAlpha","puzzleOverflow","puzzleSpacing","puzzleTransform"],
			"+cacheProperties": ["puzzle","puzzleAlpha","puzzleOverflow","puzzleSpacing","puzzleTransform"],
			// beforeRender: fabric.Object.prototype.beforeRender.concat("renderPuzzle"),
			puzzle: null,
			puzzleAlpha: 1,
			puzzleSize: false,
			puzzleTransform: null,
			puzzleOverflow: "visible",
			puzzlePresets: {
				none: false,
				basic: {},
				halfBrick: {
					offsetsY: [{x: 0.5, y: 1},{x: -0.5, y: 1}]
				},
				halfDrop: {
					offsetsX: [{x: 1, y: 0.5},{x: 1, y: -0.5}]
				}
			},
			maxPuzzleSpacing: 2,
			minPuzzleSpacing: 0,
			puzzleSpacing: 0,
			setPuzzleSpacing(value) {
				this.puzzleSpacing = value;
				this._update_puzzle();
			},
			// getPuzzlePreset(){
			// 	if(!this._puzzleOptions){
			// 		return "none";
			// 	}
			// 	for(let presetName in this.puzzlePresets){
			// 		if(JSON.stringify(this.puzzlePresets[presetName]) === JSON.stringify(this._puzzleOptions)){
			// 			return presetName;
			// 		}
			// 	}
			// 	return "custom";
			// },
			setPuzzlePreset(value){

				this.puzzlePreset = value;
				this._puzzleOptions = this.puzzlePresets[value]
				this._update_puzzle();
			},
			_update_puzzle(){
				delete this._puzzles;
				// this.dirty = true;
				this.saveState(["puzzle"])
				let value = fabric.util.deepClone(this._puzzleOptions);
				if(value){
					if(!value.offsetsY){
						value.offsetsY = [{x: 0, y: 1}]
					}
					if(!value.offsetsX){
						value.offsetsX = [{x: 1, y: 0}]
					}

					let sizeX = this.puzzleSize && this.puzzleSize.width || this.width
					let sizeY = this.puzzleSize && this.puzzleSize.height || this.height

					let spacingX = this.puzzleSpacing / (sizeX * this.scaleX)
					let spacingY = this.puzzleSpacing / (sizeY * this.scaleY)

					if(this.puzzleSpacing){
						for(let i = 0 ;i < value.offsetsY.length; i ++){
							value.offsetsY[i].y += spacingY
							value.offsetsY[i].x  *= 1 + spacingX
						}
						for(let i = 0 ;i < value.offsetsX.length; i ++){
							value.offsetsX[i].x += spacingX
							value.offsetsX[i].y *= 1 + spacingY
							// value.offsetsX[i].X += spacingX/2
						}
					}
				}

				this._set("puzzle",value)
				// this.fire("modified", {});
				// if (this.canvas) {
				// 	this.canvas.fire("object:modified", {target: this});
				// 	// this.canvas.renderAll();
				// }
			},
			setPuzzle(value){
				if(!value){
					this.puzzlePreset = "none"
				}
				else{
					this.puzzlePreset = "custom"
				}
				this._puzzleOptions = value;
				this._update_puzzle();
			},
			render_overwritten: fabric.Object.prototype.render,
			isPuzzleOnScreen (x = 0, y = 0) {
				let br = this._calc.br, tl = this._calc.tl


				let points = this._calc.points.map(point => {
					let offset = this._getPuzzleOffset(x,y,true)
					return {x: point.x + offset.x, y:  point.y + offset.y }
				})
				if(this.puzzleOverflow === 'hidden'){
					for (let point of points) {
						if (point.x > br.x || point.x <= tl.x || point.y > br.y || point.y < tl.y) {
							return false
						}
					}
					return true
				}

				for (let point of points) {
					if (point.x <= br.x && point.x >= tl.x && point.y <= br.y && point.y >= tl.y) {
						return true
					}
				}

				// no points on screen, check intersection with absolute coordinates
				let intersection = fabric.Intersection.intersectPolygonRectangle(points, tl, br)

				if(intersection.status === 'Intersection'){
					return true
				}

				// worst case scenario the object is so big that contains the screen
				let point = { x: (tl.x + br.x) / 2, y: (tl.y + br.y) / 2 }

				//this.containsPoint
				let lines = this._getImageLines({tl: points[0],tr: points[1],br: points[2],bl: points[3]})
				let	xPoints = this._findCrossPoints(point, lines)
				// if xPoints is odd then point is inside the object
				let areaCenterpointIsInsidePuzzle = (xPoints !== 0 && xPoints % 2 === 1)
				return areaCenterpointIsInsidePuzzle
			},
			_getPuzzleOffset( px, py , absolute ){
				let x = 0, y = 0
				let xv = absolute? this._calc.xvectorsAbs: this._calc.xvectorsRel
				let yv = absolute? this._calc.yvectorsAbs: this._calc.yvectorsRel
				if(xv.length === 1){
					x += xv[0].x * px
					y += xv[0].y * px
				}
				else{
					if(px > 0) {
						for (let i = 0; i < px; i++) {
							x += xv[i % xv.length].x
							y += xv[i % xv.length].y
						}
					}else{
						for (let i = 0; i < -px; i++) {
							x -= xv[i % xv.length].x
							y -= xv[i % xv.length].y
						}
					}
				}
				if(yv.length === 1){
					x += yv[0].x * py
					y += yv[0].y * py
				}
				else{
					if(py > 0){
						for(let i = 0; i < py; i++){
							x += yv[i % yv.length].x
							y += yv[i % yv.length].y
						}
					}
					else{
						for(let i = 0; i < -py; i++){
							x -= yv[i % yv.length].x
							y -= yv[i % yv.length].y
						}
					}
				}

				return {x,y}
			},
			renderRow(startX, y){
				let puzzles = []
				let x = startX - 1
				let missed = 0
				while(missed < this.puzzle.offsetsX.length + 1){
					if(this.isPuzzleOnScreen(x, y)){
						puzzles.push({x: x})
					}
					else{
						missed++
					}
					x--
				}
				x = startX
				missed = 0
				while(missed < this.puzzle.offsetsY.length + 1){
					if(this.isPuzzleOnScreen(x, y)){
						puzzles.push({x: x})
					}
					else{
						missed++
					}
					x++
				}
				return puzzles
			},
			/**
			 * Renders an object on a specified context
			 * @param {CanvasRenderingContext2D} ctx Context to render on
			 */
			render (ctx) {
				if(!this.puzzle) {
					this.render_overwritten(ctx)
					return
				}
				// do not render if width/height are zeros or object is not visible
				if (this.isNotVisible()) return

				ctx.save()
				this._setupCompositeOperation(ctx)
				this.drawSelectionBackground(ctx)
				this.transform(ctx)
				this._setOpacity(ctx)
				this._setShadow(ctx, this)
				if (this.transformMatrix) {
					ctx.transform.apply(ctx, this.transformMatrix)
				}
				// this.clipTo && fabric.util.clipContext(this, ctx)

				this._renderBackground(ctx)
				this._setStrokeStyles(ctx, this)
				this._setFillStyles(ctx, this)

				let points = this.getCoords(true, true)
				let dxAbs = {x: points[1].x - points[0].x, y: points[1].y - points[0].y }
				let dyAbs = {x: points[3].x - points[0].x, y: points[3].y - points[0].y }

				let sizeX = this.puzzleSize && this.puzzleSize.width || this.width ;//* this.scaleX
				let sizeY = this.puzzleSize && this.puzzleSize.height || this.height;// * this.scaleY

				let dxRel = {x: sizeX, y: 0}
				let dyRel = {x:0, y: sizeY }

				let xvectorsAbs = []
				let yvectorsAbs = []
				let xvectorsRel = []
				let yvectorsRel = []

				this.puzzle.offsetsX.forEach(offset => {
					xvectorsAbs.push({
						x: dxAbs.x * offset.x,
						y: dxAbs.y + dyAbs.y * offset.y
					})
					xvectorsRel.push({
						x: dxRel.x * offset.x,
						y: dxRel.y + dyRel.y * offset.y
					})
				})

				this.puzzle.offsetsY.forEach(offset => {
					yvectorsAbs.push({
						x: dyAbs.x + dxAbs.x * offset.x,
						y:  dyAbs.y * offset.y
					})
					yvectorsRel.push({
						x: dyRel.x + dxRel.x * offset.x,
						y: dyRel.y * offset.y
					})
				})


				// fabric.Intersection.intersectPolygonPolygon

				let w = this.canvas.getOriginalWidth(), h = this.canvas.getOriginalHeight();

				this._calc = {
					// tl: this.canvas.vptCoords.tl,
					// br: this.canvas.vptCoords.br,
					// tr: this.canvas.vptCoords.tr,
					// bl: this.canvas.vptCoords.bl,
					tl: new fabric.Point(0, 0),
					br: new fabric.Point(w, h),
					tr: new fabric.Point(w, 0),
					bl: new fabric.Point(0, h),
					points: points,
					xvectorsAbs,
					yvectorsAbs,
					xvectorsRel,
					yvectorsRel,
				}

				if(!this.isPuzzleOnScreen()){
					ctx.restore()
					return
				}

				let y = 0;
				let puzzles = []

				let renderNext = true

				puzzles.push({y: 0 , items: this.renderRow(0, 0)})

				y = 1
				do {
					renderNext = false
					if (puzzles[y - 1].items.length) {
						for (let x = puzzles[y - 1].items[0].x - 1; x <= puzzles[y - 1].items.slice(-1)[0].x; x++) {
							if (this.isPuzzleOnScreen(x, y )) {

								puzzles.push({y: y , items: this.renderRow(x, y)})
								y ++
								renderNext = true
								break
							}
						}
					}
				}while(renderNext)

				y = -1
				do {
					renderNext = false
					if (puzzles[0].items.length) {
						for (let x = puzzles[0].items[0].x - 1; x < puzzles[0].items.slice(-1)[0].x; x++) {
							if (this.isPuzzleOnScreen(x, y )) {
								puzzles.unshift({y: y , items: this.renderRow(x, y)})
								y --
								renderNext = true
								break
							}
						}
					}
				}while(renderNext)

				let originalText = this.text

				let _alpha = ctx.globalAlpha
				ctx.globalAlpha *= this.puzzleAlpha;
				let index = 0;

				this._tile = this.cloneSync();

				for(let row of puzzles) {

					for (let item of row.items) {
						let offset = this._getPuzzleOffset(item.x,row.y,false)

						ctx.translate(offset.x,offset.y)
						if(item.x === 0 && row.y === 0 ){
							ctx.globalAlpha  = _alpha
						}
						if(this.puzzleTransform){
							let data = this.puzzleTransform(item.x, row.y, index, this._tile)
							if(data){
								this._tile.set(data)
							}
							this._tile.drawObject(ctx)
						}
						else{
							//render without puzzle option
							let _puzzle = this.puzzle;
							this.puzzle = false;
							this.drawObject(ctx)
							this.puzzle = _puzzle;
						}
						if(item.x === 0 && row.y === 0 ){
							ctx.globalAlpha *= this.puzzleAlpha;
						}

						ctx.translate(-offset.x,-offset.y)
						index++
					}
				}

				this._puzzles = puzzles


				// if (this.shouldCache()) {
				// 	this.renderCache()
				// 	this.drawCacheOnCanvas(ctx)
				// }
				// else {
				// 	this._removeCacheCanvas()
				// 	this.dirty = false
				// 	this.drawObject(ctx)
				// 	if (this.objectCaching && this.statefullCache) {
				// 		this.saveState({ propertySet: 'cacheProperties' })
				// 	}
				// }
				// this.clipTo && ctx.restore()
				ctx.restore()
			}
		},
		Image: {
			storeProperties: fabric.Image.prototype.storeProperties.concat(properties)
		},
		Text: {
			storeProperties: fabric.Text.prototype.storeProperties.concat(properties)
		},
		Group: {
			cacheProperties : fabric.Group.prototype.cacheProperties.concat(properties)
		}
	}
}

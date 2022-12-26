// import LoaderQueue from "../../util/loader.js";
//
// const _transformProperties = ["left","top","width","height","scaleX","scaleY","skewX","skewY"]

function _getSetterName(key){
	return "set" + fabric.util.string.capitalize(key, true)
}

function _isAsyncSetter(target, key){
	let setter = _getSetterName(key)
	// if(this[_fooName] && this[_fooName].name && this[_fooName].name !== "anonymous"){
	return target[setter] && (target[setter].constructor === Function || target[setter].constructor.name === "AsyncFunction" ) && target[setter].length >= 2
}

function getTransformStoredProperties(){
	return null
}

function setOptions() {
	if (typeof arguments[0] === 'object') {
		let options = {};
		let callback = arguments[1];
		for(let property in arguments[0]){
			if(arguments[0][property] !== undefined){
				options[property] = arguments[0][property]
			}
		}

		let keys = Object.keys(options)
		if(this.optionsOrder && this.optionsOrder.length){
			let middleIndex = this.optionsOrder.indexOf("*") || -1
			let i = middleIndex, key , keyIndex
			while((key = this.optionsOrder[--i])){
				if((keyIndex = keys.indexOf(key)) !== -1){
					keys.splice(keyIndex, 1)
					if(options[key] !== undefined ){
						keys.unshift(key)
					}
				}
			}
			i = middleIndex
			while(key = this.optionsOrder[++i]){
				if((keyIndex = keys.indexOf(key)) !== -1){
					keys.splice(keyIndex, 1)
					if(options[key] !== undefined ) {
						keys.push(key)
					}
				}
			}
		}

		let promises = [];
		if(keys.length) {
			// this.beforeSet()
			this._setProcessing = true;
			// let queue
			for (let key of keys) {
				if (_isAsyncSetter(this, key)) {
					promises.push(new Promise(resolve => {
						this.set(key, options[key], () => {
							// queue.shift(key)
							resolve()
						})
					}))

					// if(!queue){
					// 	queue = new LoaderQueue({
					// 		complete: callback
					// 		// progress: (loaded, total, el) => console.log(`${this.id}: ${loaded}/${total} . ${el} loaded`),
					// 		// added: (loaded, total, el) => console.log(`${this.id}: ${loaded}/${total} . ${el} loaded`)
					// 	})
					// }
					// queue.push(key)
				} else {
					this.set(key, options[key])
				}
			}
			delete this._setProcessing;
			// this.afterSet()
		}

		if(promises.length){
			Promise.all(promises).then(callback)
		}
		else{
			callback && callback()
		}

		//
		// if(queue){
		// 	queue.activate()
		// }else if(callback ){
		// 	callback()
		// }
		return this
	}
	else {
		let key = arguments[0], value = arguments[1], callback = arguments[2]
		let _fooName = _getSetterName(key)
		//check if setter is custom setter function
		if(this[_fooName]  && this[_fooName].name && this[_fooName].name !== "anonymous"){
			this[_fooName](value,callback);
		}else{
			this._set(key, value);
			callback && callback()
		}
		// this.afterSet()
	}
	return this
}

export const FmSetters = {
	name: "setters",
	prototypes: {
		Object: {
			getTransformStoredProperties,
			get: fabric.Object.prototype.get,
			set: setOptions,
			_set(key, value) {
				let origValue = this[key];
				let isChanged = origValue !== value, groupNeedsUpdate = false
				if (isChanged) {
					this[key] = value

					if(!this.processing){
						groupNeedsUpdate = this.group && this.group.isOnACache()
						let isCurrentTramsform = this.canvas && this.canvas._currentTransform && this.canvas._currentTransform.target === this
						if (this.cacheProperties.indexOf(key) > -1) {
							this.dirty = true
							if (groupNeedsUpdate) {
								this.group.setDirty(true)
								if(this.canvas && this.canvas.processing)return this
								if(!isCurrentTramsform){
									this.group.fire("modified")
								}
							}
						} else if (groupNeedsUpdate && this.stateProperties.indexOf(key) > -1) {
							this.group.setDirty(true)
							if(this.canvas && this.canvas.processing)return this
							if(!isCurrentTramsform) {
								this.group.fire("modified")
							}
						}
						if (this.canvas) {
							if(this.canvas && this.canvas.processing)return this
							if(!isCurrentTramsform) {
								this.fire("modified", {target: this, original: origValue, modified: value})
							}
							// this.canvas.requestRenderAll()
							this.canvas.renderAll()
						}
					}
				}
				return this
			}
		},
		Editor:{
			get: fabric.Object.prototype.get,
			set: setOptions,
			_set(property,value){
				this[property] = value;
			}
		},
		StaticCanvas:{
			get: fabric.Object.prototype.get,
			set: setOptions
		}
	}
}
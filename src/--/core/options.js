
const Options = {
	_doNotRemoveValues: ["fontFamily"],
	_removeDefaultStoredValues: function(object) {
		let app = this.type === "editor" ? this : this.editor
		let prototype = this.__proto__, editorPrototypes = {}
		if(app){
			editorPrototypes = app.getDefaultProperties(prototype) || {}
		}

		for (let prop in object){
			if(this._doNotRemoveValues.indexOf(prop)!== -1)continue

			if(typeof object[prop]  === "undefined"){
				delete object[prop]
				continue
			}

			if(["type","width","height","left","top"].includes(prop))continue
			let _protoValue = editorPrototypes[prop] !== undefined ? editorPrototypes[prop] : prototype[prop]

			if (object[prop] === _protoValue) {
				delete object[prop]
			}
			let isArray = Object.prototype.toString.call(object[prop]) === '[object Array]' &&
				Object.prototype.toString.call(_protoValue) === '[object Array]'

			if (isArray && object[prop].length === 0 && _protoValue.length === 0) {
				delete object[prop]
			}
		}
		return object
	},
	get: fabric.Object.prototype.get,
	storeDefaultValues: false,
	getProperty(property) {
		let store_foo = "store_" + property
		let getFoo = "get" + fabric.util.string.capitalize(property)

		if(this[store_foo]){
			return this[store_foo]()
		}
		else if(this[getFoo]){
			return this[getFoo]()
		}
		else{
			return this[property]
		}
	},
	getProperties(properties) {
		let object = {}
		for (let prop of properties){
			object[prop] = this.getProperty(prop)
		}
		return object
	},
	getStoreProperties(){
		if(!this.useSuperClassStoreProperties || !this.__proto__.getStoreProperties){
			return this.storeProperties
		}

		let properties = this.__proto__.getStoreProperties()

		if(this.storeProperties !== this.__proto__.storeProperties){
			properties = properties
				.concat(this.storeProperties)
				.filter((v, i, a) => a.indexOf(v) === i); // onlyUnique filter
		}
		return properties
	},
	storeObject (propertiesToInclude) {
		let storeProperties = this.getStoreProperties()

		let properties = (propertiesToInclude || [])
				.concat(storeProperties)
				.concat(this.stateProperties || [])

		let object = this.getProperties(properties)

		if (!this.storeDefaultValues) {
			this._removeDefaultStoredValues(object)
		}

		this.fire("before:object", {object: object})
		return object
	},
	_transformProperties : ["left","top","width","height","scaleX","scaleY","skewX","skewY"],
	_saveStateOverwritten: fabric.Object.prototype.saveState,
	getTransformStoredProperties(){
		return null
	},
	/**
	 * Saves state of an object
	 * @param {Object} [options] Object with additional `stateProperties` array to include when saving state
	 * @return {fabric.Object} thisArg
	 */
	saveState(options) {
		let history = this.editor ? this.editor.history : this.history
		if(history && history.processing)return
		if(!options){
			options = this.getTransformStoredProperties()
		}
		if(!options){
			this.storeDefaultValues = true
			this.originalState = this.storeObject()
			this.storeDefaultValues = false
		}else if(options.length) {
			this.originalState = this.getProperties(options)
		}else{

			//START _saveState ORIGINAL
			let propertySet = options && options.propertySet || originalSet,
				destination = '_' + propertySet
			if (!this[destination]) {
				return this.setupState(options)
			}
			function saveProps(origin, destination, props) {
				let tmpObj = { }, deep = true
				props.forEach(function(prop) {
					tmpObj[prop] = origin[prop]
				})
				fabric.util.object.extend(origin[destination], tmpObj, deep)
			}

			saveProps(this, destination, this[propertySet])
			if (options && options.stateProperties) {
				saveProps(this, destination, options.stateProperties)
			}
			return this
			//END _saveState ORIGINAL
		}
		return this
	},
	// getModifiedStates() {
	//
	// 	let original = this.originalState
	// 	let modified = this.getProperties(Object.keys(this.originalState))
	//
	// 	let _counter = 0
	// 	let states = {
	// 		original: {},
	// 		modified: {}
	// 	}
	//
	// 	for (let prop in original) {
	// 		if (original[prop] !== modified[prop]) {
	// 			if (original[prop] instanceof Object) {
	// 				if (JSON.stringify(original[prop]) === JSON.stringify(modified[prop])) {
	// 					continue
	// 				}
	// 			}
	// 			states.original[prop] = original[prop]
	// 			states.modified[prop] = modified[prop]
	// 			_counter++
	// 		}
	// 	}
	// 	return _counter && states
	// },
	setStates(options) {
		for(let property in options){
			this.setState(property,options[property])
		}
	},
	setState(property, newValue) {
		if ((newValue.constructor === Object || newValue.constructor === Array) &&
				JSON.singify(this[property]) === JSON.stringify(newValue)){
			return
		}
		else if(this[property] === newValue){
			return
		}

		if(!this.processing ){
			if(!this.originalState)this.originalState = {};
			this.originalState[property] = this[property]
		}
		this[property] = newValue
	},
	set () {
		if (typeof arguments[0] === 'object') {
			let options = {};
			let callback = arguments[1];
			for(let property in arguments[0]){
				if(arguments[0][property] !== undefined){
					options[property] = arguments[0][property]
				}
			}
			let keys = this._getOptionsProcessingOrder(options)
			if(!keys.length){
				callback && callback()
				return;
			}

			//todo keys
			// this.beforeSet()
			this._setProcessing = true;

			let queue
			for (let key of keys) {
				if(this._isAsyncSetter(key)){
					if(!queue){
						queue = new fabric.util.Loader({
							complete: callback
							// progress: (loaded, total, el) => console.log(`${this.id}: ${loaded}/${total} . ${el} loaded`),
							// added: (loaded, total, el) => console.log(`${this.id}: ${loaded}/${total} . ${el} loaded`)
						})
					}
					queue.push(key)
					this.set(key, options[key], ()=> {
						queue.shift(key)
					})
				}
				else {
					this.set(key, options[key])
				}
			}
			delete this._setProcessing;
			// this.afterSet()

			if(queue){
				queue.activate()
			}else if(callback ){
				callback()
			}
			return this
		}
		else {
			let key = arguments[0], value = arguments[1], callback = arguments[2]
			let _fooName = this._getSetterName(key)
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
	},
	_isAsyncSetter(key){
		let setter = this._getSetterName(key)
		// if(this[_fooName] && this[_fooName].name && this[_fooName].name !== "anonymous"){
		return this[setter] && this[setter].constructor === Function && this[setter].length >= 2
	},
	_getSetterName(key){
		return "set" + fabric.util.string.capitalize(key, true)
	},
	_getOptionsProcessingOrder(options){
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
		return keys
	},
}


Object.assign(fabric.Object.prototype, Options,{

	_set(key, value) {
		let isChanged = this[key] !== value, groupNeedsUpdate = false
	  this[key] = value
		if (isChanged) {
			groupNeedsUpdate = this.group && this.group.isOnACache()
			if (this.cacheProperties.indexOf(key) > -1) {
				this.dirty = true
				if(groupNeedsUpdate) {
				  this.group.setDirty(true)
	        this.group.fire("modified")
	      }
			}
			else if (groupNeedsUpdate && this.stateProperties.indexOf(key) > -1) {
				this.group.setDirty(true)
	      this.group.fire("modified")
			}
			if(this.canvas){
				this.canvas.requestRenderAll()
			}
		}
		return this
	},
	updateState(){
		if(this._setProcessing)return
		if(this.processing ) return
		if(!this.originalState)return

		let isModified = Object.keys(this.originalState).length > 0;

		if(!isModified){
			this.originalState = null
			return;
		}

		let target = this;
		let canvas = this.canvas;
		let original = this.originalState
		let modified = this.getProperties(Object.keys(this.originalState))

		this.originalState = null

		this.fire("modified", {target, original, modified})

		let groupNeedsUpdate = this.group && this.group.isOnACache();
		let cachePropertiesIncludes = false
		let statePropertiesIncludes = false
		for(let property in original) {
			if (this.stateProperties.includes(property)) {
				statePropertiesIncludes = true;
			}
			if (this.cacheProperties.includes(property)) {
				cachePropertiesIncludes = true;
				break;
			}
		}

		if(cachePropertiesIncludes){
			this.dirty = true;
			if(groupNeedsUpdate) {
				this.group.setDirty(true);
				this.group.fire("modified")
			}
		}
		else if (groupNeedsUpdate && statePropertiesIncludes) {
			this.group.setDirty(true);
			this.group.fire("modified")
		}
		if(canvas){
			if(!canvas.processing){
				canvas.fire("object:modified", {target, canvas, original, modified});
			}
			this.canvas.requestRenderAll();
		}

		if(this.editor){
			if((!canvas || !canvas.processing) && !this.editor.processing) {
				this.editor.fire("object:modified", {target, original, modified})
			}
		}
	}
})

Object.assign(fabric.StaticCanvas.prototype, Options,{
	updateState(){
		if(this._setProcessing)return
		if(this.processing)return
		if(!this.originalState)return
		let isModified = Object.keys(this.originalState).length > 0;
		if(!isModified){
			this.originalState = null;
			return;
		}

		let target = this;
		let original = this.originalState
		let modified = this.getProperties(Object.keys(this.originalState))
		this.originalState = null;

		this.fire("modified", {target, original, modified});
	},
})

Object.assign(fabric.Editor.prototype, Options,{

	_set(property,value){
		this[property] = value;
	},
	updateState(){
		if(this._setProcessing)return
		if(this.processing ) return
		if(!this.originalState)return
		let isModified = Object.keys(this.originalState).length > 0;
		if(!isModified){
			this.originalState = null;
			return;
		}
		let target = this;
		let original = this.originalState
		let modified = this.getProperties(Object.keys(this.originalState))
		this.originalState = null;

		this.fire("modified", {target, original, modified});
	}
})

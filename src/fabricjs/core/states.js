let common = {

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
	includeDefaultValues: false,
	_getStoreProperties(){
		if(!this.useSuperClassStoreProperties || !this.__proto__._getStoreProperties){
			return this.storeProperties
		}

		let properties = this.__proto__._getStoreProperties()

		if(this.storeProperties !== this.__proto__.storeProperties){
			properties = properties
				.concat(this.storeProperties)
				.filter((v, i, a) => a.indexOf(v) === i); // onlyUnique filter
		}
		return properties
	},
	getState (propertiesToInclude,propertiesToExclude) {
		fabric.TODO_GET_STATE_INITIATED_GETOBJECTS_BUG = true
		let storeProperties = this._getStoreProperties()

		let properties = (propertiesToInclude || [])
			.concat(storeProperties)
			.concat(this.stateProperties || [])

		if(propertiesToExclude){
			properties = properties.filter(n => !propertiesToExclude.includes(n))
		}

		let object = this.getProperties(properties)

		if (!this.includeDefaultValues) {
			this._removeDefaultStoredValues(object)
		}

		this.fire("before:object", {object: object})
		delete fabric.TODO_GET_STATE_INITIATED_GETOBJECTS_BUG
		return object
	},
	getProperty(property) {
		// let store_foo = "store_" + property
		// let store_foo = "get" + property
		let getFoo = "get" + fabric.util.string.capitalize(property,true)


		// if(this[store_foo]){
		// 	return this[store_foo]()
		// }
		if (this[getFoo]) {
			return this[getFoo]()
		} else {
			return this[property]
		}
	},
	getProperties(properties) {
		let object = {}
		for (let prop of properties) {
			object[prop] = this.getProperty(prop)
		}
		return object
	},
	/**
	 * Saves state of an object
	 * @param {Object} [options] Object with additional `stateProperties` array to include when saving state
	 * @return {fabric.Object} thisArg
	 */
	saveStates(options) {
		let history = this.editor ? this.editor.history : this.history
		if (history && history.processing) return
		if (!options) {
			options = this.getTransformStoredProperties()
		}
		if (!options) {
			this.storeDefaultValues = true
			this.originalState = this.getState()
			this.storeDefaultValues = false
		} else if (options.length) {
			this.originalState = this.getProperties(options)
		} else {

			//START _saveState ORIGINAL
			let propertySet = options && options.propertySet || originalSet,
				destination = '_' + propertySet
			if (!this[destination]) {
				return this.setupState(options)
			}

			function saveProps(origin, destination, props) {
				let tmpObj = {}, deep = true
				props.forEach(function (prop) {
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
	setStates(options) {
		for (let property in options) {
			this.setState(property, options[property])
		}
	},
	setState(property, newValue) {
		if (newValue && (newValue.constructor === Object || newValue.constructor === Array) &&
			JSON.stringify(this[property]) === JSON.stringify(newValue)) {
			return
		} else if (this[property] === newValue) {
			return
		}

		if (!this.processing) {
			if (!this.originalState) this.originalState = {};
			this.originalState[property] = this[property]
		}
		this[property] = newValue
	}
}

export const FmStates = {
	name: "states",
	prototypes: {
		Object: [common, {
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

				if (this._shouldClearDimensionCache && this._shouldClearDimensionCache()) {
					this.initDimensions();
					this.setCoords();
				}

				this.fire("modified", {target, original, modified})

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
					// this.canvas.renderAll()
				}

				if(this.editor){
					if((!canvas || !canvas.processing) && !this.editor.processing) {
						this.editor.fire("object:modified", {target, original, modified})
						this.editor.fire("modified")
					}
				}
			}
		}],
		StaticCanvas: [common, {
			getObjects: function (type) {
				if(!fabric.TODO_GET_STATE_INITIATED_GETOBJECTS_BUG){
					if (typeof type === 'undefined') {
						return this._objects.concat();
					}
					return this._objects.filter(function(o) {
						return o.type === type;
					});
				}

				let _objs = this._objects.filter(el => (el.stored !== false));
				if (!_objs.length) return null;
				return _objs.map(instance => {
					return instance.getState();
				});
			},
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
			}
		}],
		Group: {
			getObjects: function () {
				let _objs = this._objects.filter(el => (el.stored !== false));
				if (!_objs.length)return;
				return _objs.map(instance => {
					return instance.getState();
				});
			}
		},
		Editor: [common, {
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
		}]
	}
}

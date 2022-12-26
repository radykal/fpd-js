import {toDashed} from '../../util/string.ext.js'

/**
 * Create new array and concat all values with value from second array
 * @param arr
 * @param arr2
 * @returns {{}}
 * @example
 *    x = {a: 1 ,b: 1, c: [1,2]}
 *    y = {a: 2 ,  c : 3 , d : 1}
 *    merge(x,y) = {a: [1,2] b : [1] c : [1,2,3], d [1] }
 * @example 2
 *
 * eventListeners: fabric.util.merge(fabric.Canvas.prototype.eventListeners, {
 *  "modified" : function(e){...},
 *  "object:modified" : function(){...}
 *})
 *
 */
export function merge(arr, arr2) {
	let newArray = {};
	for (let i in arr) {
		if (arr[i].constructor === Array) {
			newArray[i] = [].concat(arr[i]);
		} else {
			newArray[i] = [arr[i]];
		}
	}
	for (let i in arr2) {
		if (newArray[i]) {
			newArray[i].push(arr2[i]);
		} else {
			newArray[i] = [arr2[i]];
		}
	}
	return newArray;
}

fabric.installedPlugins = [];

fabric.globallyInstalledPlugins = [];

fabric.plugins = {};

fabric.util.getKlass = function (type, namespace){
	let klassName = fabric.util.string.camelize(fabric.util.string.capitalize(type,true));
	return (namespace && namespace[klassName]) || fabric[klassName]
}

fabric.util.evalPrototypes = function(prototypes,namespace) {
	let evaluated = {}

	for (let klassName in prototypes) {

		let _proto = {};
		if(prototypes[klassName].constructor === Array){
			_proto = {};
			for (let protoItem of prototypes[klassName]){
				Object.assign(_proto,protoItem)
			}
		}
		else{
			Object.assign(_proto,prototypes[klassName])
		}


		let evaluatedPrototype = Object.assign({},_proto)

		if(_proto["prototype"]){

			let superklass
			let mixins = []
			if(_proto["prototype"].constructor === String){
				superklass = fabric.util.getKlass(_proto["prototype"], namespace)
				if(!superklass){
					console.warn(`class ${_proto["prototype"]} doent exists `)
					continue
				}
			}
			else if(_proto["prototype"].constructor === Array){
				superklass = _proto["prototype"][0]
				mixins = _proto["prototype"].slice(1)
			}
			else{
				superklass = _proto["prototype"]
			}

			delete evaluatedPrototype["prototype"]
			delete evaluatedPrototype["type"]
			delete evaluatedPrototype["fromObject"]

			namespace[klassName] = fabric.util.createClass( superklass, ...mixins, {
				type: toDashed(klassName)
			})
		}
		//   if (value && value["$extend"]) {
		//     let _extend = value["$extend"]
		//     let protoValue = fabric[klassName].prototype[prop]
		//     if( _extend === "array"){
		//       evaluatedPrototype[prop] = fabric.util.merge(protoValue,value)
		//     } else if( _extend === "deep"){
		//       evaluatedPrototype[prop] = fabric.util.deepExtend(protoValue,value)
		//     }else{
		//       evaluatedPrototype[prop] = Object.assign(protoValue,value)
		//     }
		//     delete value["$extend"]
		//   }
		// }
		evaluated[klassName] = evaluatedPrototype
	}
	return evaluated
}

function extendPrototype(dest, source) {
	for (let property in source) {
		let sourceValue = source[property]

		// proposal ˄˅
		/*


			  "˄optionsOrder*": ["emojisMapping", "emojisPath"]
			  "+renderOrder˄controls": ["snap"],
			  "+layers": {
				snap: {
				  render() {
					if (this.renderSnappingHelperLines && this.snapTo) {
					  this.renderSnapping(this.snapTo, "#ffaaaa")
					}
				  }
				}
			  },



		 */
		if (property[0] === "+" || property[0] === "^") {

			let insetBefore = property[0] === "^";

			property = property.substring(1)

			//weird case:
			//"+renderOrder{^controls}"
			if(property.includes("{")) {
				let quality = property.substring(property.indexOf("{")+ 1,property.indexOf("}"));
				property = property.replace(/\{.*\}/g,"")

				//add before
				if(quality[0] === "^"){
					let search = quality.substring(1);
					let protoValue = dest[property]

					protoValue.splice(protoValue.indexOf(search),0,...sourceValue)
				}
				//add after
				if(quality[quality.length - 1] === "^"){
					let search = quality.substring(0,quality.length -1);
					let protoValue = dest[property]

					protoValue.splice(protoValue.indexOf(search)+1,0,...sourceValue)
				}
			}
			else{
				let protoValue = dest[property]

				if (protoValue === undefined) {
					dest[property] = sourceValue
				}
				else if (protoValue.constructor === Object) {
					Object.assign(dest[property] ,sourceValue)
				}
				else if (protoValue.constructor === Array) {
					if(insetBefore){
						dest[property] = protoValue.slice()
						dest[property].splice(0,0,...sourceValue) ;
					}
					else{
						dest[property] = protoValue.concat(sourceValue)
					}
				}
			}
		}
		else{
				// console.log(property)
			// 	dest[property] = merge(dest.controls || {}, sourceValue)
			// 	console.log(1)
			// 	// dest[property] = fabric.Object.prototype.parseControls(sourceValue)
			//
			// }
			// else
			if (property === "optionsOrder") {
				let destValue = dest.optionsOrder || ["*"]

				sourceValue = sourceValue.slice()

				if (destValue && sourceValue.includes("*")) {
					Array.prototype.splice.apply(sourceValue, [sourceValue.indexOf("*"), 1].concat(destValue))
				}
				dest[property] = sourceValue
			}

			else if (property === "eventListeners") {
				dest[property] = merge(dest.eventListeners || {}, sourceValue)
			} else {
				dest[property] = sourceValue
			}
		}

	}
}

fabric.extendPrototypes = function (pluginPrototypes, namespace){
	if(!namespace){
		namespace = fabric
	}
	if(pluginPrototypes.constructor === Function) {
		pluginPrototypes = pluginPrototypes(namespace)
	}

	let evaluatedPrototypes = fabric.util.evalPrototypes(pluginPrototypes,namespace)

	for (let klassName in evaluatedPrototypes) {
		if(fabric[klassName]){
			extendPrototype(fabric[klassName].prototype, evaluatedPrototypes[klassName])
		}
	}
}

fabric.installPlugins = function (plugins,editor,prototypes){
	for(let plugin of plugins){
		fabric.installPlugin(plugin,editor,prototypes);
	}
}

function installPlugin(plugin,editor, prototypes){
	if(plugin.deps){
		fabric.installPlugins(plugin.deps, editor, prototypes)
	}
	if(plugin.install){
		//run install function once
		if(!fabric.globallyInstalledPlugins.includes(plugin.name)) {
			plugin.install(editor);
			fabric.globallyInstalledPlugins.push(plugin.name)
		}
	}
	if(plugin.prototypes){
		if(editor){
			for (let klassName in plugin.prototypes) {
				if(prototypes[klassName]) {
					extendPrototype(plugin.prototypes[klassName], prototypes[klassName])
				}else{
					prototypes[klassName] = plugin.prototypes[klassName];
				}
			}
		}
		else{
			fabric.extendPrototypes(plugin.prototypes)
		}
	}
}

fabric.installPlugin = function (plugin,editor,prototypes){
	let pluginName = plugin.name || plugin;
	if(fabric.installedPlugins.includes(pluginName))return;
	if(editor && editor.installedPlugins.includes(pluginName))return;

	let destination = editor || fabric;
	if(plugin.constructor === String){
		plugin = fabric.plugins[plugin];
	}

	installPlugin(plugin,editor,prototypes)

	if (plugin.versions) {
		function isVersionMatched(versionString){
			let currentVersion = fabric.version.split(".")
			let version = versionString.split(".")
			for (let i in version){
				if(version[i].toLowerCase() === "x"){
					return true
				}
				if(currentVersion[i] !== version[i]){
					return false
				}
			}
			return true
		}
		for(let versionString in plugin.versions){
			if(isVersionMatched(versionString)) {
				installPlugin(plugin.versions[versionString],editor,prototypes)
			}
		}
	}

	destination.installedPlugins.push(pluginName)
	if(fabric.isLikelyNode && plugin.node){
		fabric.installPlugin(plugin.node, editor, prototypes)
	}
}

fabric.initialize = function(config) {
	if(fabric.plugins){
		fabric.installPlugins(config.plugins);
	}
	for(let option in config){
		if(option !== "plugins"){
			fabric[option] = config[option];
		}
	}
}





/**
 * # Prototypes

 Prototypes allows to define **prototypes** property in editor configuration.

 ```javascript
 editor ({
  prototypes: {
    ClassName: options
  }
 })
 ```

 If prototype is defined every new Object created by editor will have this properties by default.

 ```javascript
 NewClass: {
    $super: "ParentClass",
    type: "new-class",
    \/*other properties and methods*\/
   }
 ```

 if property **type** of Object class is defined then every object be default will have this type.

 ```javascript
 Object: {
    type: "rectangle"
   }
 ...
 //rectangle will be created
 fabric.createObject({width:100, height: 100})
 ```
 */
import {getSyncKlass} from "../util/util.js"

Object.assign(fabric.Editor.prototype, {
  /**
   * default prototypes propertes for objects
   */
  /*prototypes: {
    Object: {
      includeDefaultValues: false
    },
    Canvas: {
      includeDefaultValues: false
    }
  },*/
  getDefaultProperties: function(stringTypeOrPrototype){
    let klassname, proto
    if(stringTypeOrPrototype.constructor === String){
      klassname = fabric.util.string.capitalize(fabric.util.string.camelize(stringTypeOrPrototype),true)
      let _klass = this.getKlass(klassname)
      proto = _klass && _klass.prototype || {}
    }else{
      proto = stringTypeOrPrototype
      klassname = fabric.util.string.capitalize(fabric.util.string.camelize(proto.type),true)
    }
    let _protoProperties = proto && proto.__proto__ && proto.__proto__.type && this.getDefaultProperties(proto.__proto__) || {}
    let _defaultProperties =  klassname && this.prototypes && fabric.util.clone(this.prototypes[klassname]) || {}

    Object.assign(_protoProperties,_defaultProperties)
    return _protoProperties
  },

  getKlass: function(type){
    let klassName = fabric.util.string.camelize(type.charAt(0).toUpperCase() + type.slice(1))
    return /*this.klasses["S" + klassName]|| fabric["S" + klassName]  ||*/ this.klasses[klassName] || fabric[klassName]
  },
  store_prototypes () {
    if(!this._prototypes)return
    return this._prototypes
  },
  setPrototypes: function (prototypes) {
    this._prototypes = prototypes

    this.prototypes = fabric.util.evalPrototypes(prototypes,this.klasses)

    if (this.prototypes.Editor) {
      fabric.util.deepExtend(this, this.prototypes.Editor)
    }
    if (this.actions && this.actions.constructor === Function) {
      this.actions = this.actions.call(this)
    }
  },
  _populateWithDefaultProperties: function(target,options){
    if(!target.disableDefaultProperties){
      fabric.util.defaults(options, this.getDefaultProperties(target, options))
      for (let key in options) {
        let value = options[key]
        if (key[0] === "+") {
          let _key = key.substr(1)
          let _arr = target.get(_key)
          if (_arr instanceof Array) {
            _arr = _arr.slice().concat(value)
          } else {
            _arr = Object.assign({}, _arr, value)
          }
          options[_key] = _arr
          delete options[key]
        }
      }
    }
  },
  eventListeners: fabric.util.merge(fabric.Editor.prototype.eventListeners, {
    "created": function (e) {
      if(e.options.prototypes && e.options.prototypes.Editor){
        fabric.util.defaults(e.options,e.options.prototypes.Editor)
      }
    },
    "entity:load": function (e) {
      fabric.util.defaults(e.options,this.getDefaultProperties(e.options.type))
    }
  })
})

fabric.on({
  "entity:created": function (e) {
    if (e.target.editor) {
      e.target.editor._populateWithDefaultProperties(e.target, e.options)
      delete e.options.editor
    }
  }
})




fabric.util.evalPrototypes = function(prototypes,namespace) {
  let evaluated = {}

  for (let klassName in prototypes) {
    let _proto = prototypes[klassName]

    let evaluatedPrototype = Object.assign({},_proto)

    if(_proto["prototype"]){

      let superklass
      let mixins = []
      if(_proto["prototype"].constructor === String){
        superklass = getSyncKlass(_proto["prototype"], namespace)
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
        type: fabric.util.string.toDashed(klassName)
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
  return prototypes
}

  function extendPrototype(dest, source) {
  for (let property in source) {
    let sourceValue = source[property]

    if (property[0] === "+") {
      property = property.substr(1)
      let protoValue = dest[property]

      if (protoValue === undefined) {
        dest[property] = protoValue
      }
      else if (protoValue.constructor === Object) {
        Object.assign(dest[property] ,sourceValue)
      }
      else if (protoValue.constructor === Array) {
        dest[property] = protoValue.concat(sourceValue)
      }
    }
    else{
      if (property === "optionsOrder") {
        let destValue = dest.optionsOrder || ["*"]

        sourceValue = sourceValue.slice()

        if (destValue && sourceValue.includes("*")) {
          Array.prototype.splice.apply(sourceValue, [sourceValue.indexOf("*"), 1].concat(destValue))
        }
        dest[property] = sourceValue
      }

      if (property === "eventListeners") {
        dest[property] = fabric.util.merge(dest.eventListeners || {}, sourceValue)
      } else {
        dest[property] = sourceValue
      }
    }

  }
}

fabric.installPlugins = function (plugins){
  for(let plugin of plugins){
    fabric.util.extendPrototypes(plugin.prototypes, fabric)
  }
}

fabric.util.extendPrototypes = function(pluginPrototypes, namespace){
  if(!namespace){
    namespace = fabric
  }
  if(pluginPrototypes.constructor === Function) {
    pluginPrototypes = pluginPrototypes(namespace)
  }

  let evaluatedPrototypes = fabric.util.evalPrototypes(pluginPrototypes,namespace)

  for (let klassName in evaluatedPrototypes) {
    extendPrototype(namespace[klassName].prototype, pluginPrototypes[klassName])
  }
}

Object.assign( fabric.Editor.prototype, {
  plugins: null,
  initPlugins(plugins, customPrototypes) {
    // if (plugins === "*") {
    //   plugins = Object.keys(fabric.plugins)
    // }
    // this.plugins = plugins

    let prototypes = {}

    for (let plugin of plugins) {
      fabric.util.extendPrototypes(plugin.prototypes,prototypes)
    }

    for (let klassName in customPrototypes) {
      if (!prototypes[klassName]) {
        prototypes[klassName] = {}
      }
      extendPrototype(prototypes[klassName], customPrototypes[klassName])
    }
    return prototypes

    // for (let klassName in prototypes) {
    //   customPrototypes[klassName] = prototypes[klassName]
    // }
  }
})

// fabric.plugins["actions"] = {
//   prototypes: {
//     Canvas: {
//       deafultText: "You can add some text here",
//       defaultTextType: "i-text",
//       selectAll() {
//         let selection = new fabric.ActiveSelection(this.getObjects(), {canvas: this})
//         this.setActiveObject(selection)
//         this.renderAll()
//       }
//     }
//   }
// }

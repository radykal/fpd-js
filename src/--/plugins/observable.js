function _getEventObject(eventName){
	let object = this;
	let objects = eventName.substring(0,eventName.lastIndexOf(".")).split(".");
	for(let i =0 ; i< objects.length;i ++){
		//обавим возможность поиска по iD
		if(objects[i][0] === "#"){

			let _app = this.canvas || this.parent && this.parent.canvas || this
			object = _app.getObjectByID(objects[i].substr(1))
		}
		else{

			object = object[objects[i]];
		}

		if(!object){
			break;
		}
	}
	if(!object){
		console.warn("wrong event listener " + eventName);
		return null;
	}
	return object;
}


const ObservableMixin = {
	on: function (eventName, handler, options) {
		let originalHandler = handler;

		if (eventName.constructor === Object) {
			for (let i in eventName) {
				this.on(i, eventName[i],options)
			}
			return this;
		}

		let events = eventName.split(" ");
		for (let event of events) {
			handler = originalHandler;
			let object = this;
			if(event.includes(".")){
				object = _getEventObject.call(this,event);
				event = event.substr(event.lastIndexOf(".")+1);
				//обавим возможность поиска по iD. вес ради прототипов вида:
				//eventListeners : {"canvas.viewport:scaled canvas.dimensions:modified": "stretchArea"}
				if(handler.constructor === String){
					if(!this.id){
						this.id = fabric.util.createID(this)
					}
					handler = `#${this.id}.${handler}`
				}
			}
			if(object.constructor === Function){
				object.call(this,(selected,deselected) => {
					if(deselected){
						deselected.off(event, handler, options)
					}
					if(selected) {
						selected.on(event, handler, options)
					}
				})
			}
			else{

				if (!object.__eventListeners) {
					object.__eventListeners = {};
				}

				if (!object.__eventListeners[event]) {
					object.__eventListeners[event] = [];
				}
				if(options && options.priority){
					if(handler.constructor === Array){
						object.__eventListeners[event].unshift(...handler);
					}else{
						object.__eventListeners[event].unshift(handler);
					}
				}else{
					if(handler.constructor === Array){
						object.__eventListeners[event].push(...handler);
					}else{
						object.__eventListeners[event].push(handler);
					}
				}
			}

		}
		return this;
	},
	off: function (eventName, handler) {
		//avoid errors if event was removed inside eveletlistener
		// setTimeout(()=> {
		if (!this.__eventListeners) {
			return;
		}
		// remove all key/value pairs (event name -> event handler)
		if (arguments.length === 0) {
			for (let event in this.__eventListeners) {
				this.__eventListeners[event].length = 0;
			}
			return this;
		}

		// one object with key/value pairs was passed
		if (eventName.constructor === Object) {
			for (let i in eventName) {
				this.off(i, eventName[i])
			}
			return this;
		}

		let events = eventName.split(" ");
		for (let event of events) {
			let object = this;
			let newHandler = handler;
			if(event.includes(".")){
				object = _getEventObject.call(this,event);
				event = event.substr(event.lastIndexOf(".")+1);
				if(handler.constructor === String){
					newHandler = "#" + this.id + "." + newHandler
				}
			}

			if(object.__eventListeners[event]){
				object.__eventListeners[event].splice(object.__eventListeners[event].indexOf(newHandler), 1)
			}
		}
		// })
		return this;
	},
	fire: function fire(eventName, options) {
		if (!this.__eventListeners) {
			return;
		}
		if(!options)options = {}
		if(!options.target)options.target = this;

		let listenersForEvent = this.__eventListeners[eventName];
		if (listenersForEvent) {
			for (let i = 0; i < listenersForEvent.length; i++) {
				let handler = listenersForEvent[i];
				if(handler.constructor === String){
					if(handler.includes(".")){
						let object = _getEventObject.call(this,handler);
						let newHandler = handler.substr(handler.lastIndexOf(".") + 1);
						object[newHandler](options);
					}
					else{
						this[handler](options);
					}
				}
				else{
					handler.call(this, options);
				}
			}
		}

		let listenersForEventAll = this.__eventListeners['*'];
		if (listenersForEventAll) {
			options.eventName = eventName;
			options.listeners = listenersForEventAll;
			for (let i = 0; i < listenersForEventAll.length; i++) {
				listenersForEventAll[i].call(this, options);
			}
		}
		return this;
	}
}
ObservableMixin.stopObserving = ObservableMixin.off;
ObservableMixin.observe = ObservableMixin.on;
ObservableMixin.trigger = ObservableMixin.fire;

export default ObservableMixin;

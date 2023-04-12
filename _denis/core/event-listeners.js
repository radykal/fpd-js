import Observable from "../../plugins/observable.js";

function initEventListeners(target,el){
    if(!el){
        el = getDefaultEventListeners(target)
    }
    if (el) {
        for (let eventName in el) {
            let _listeners = el[eventName];
            if (_listeners.constructor === Array) {
                for (let j in _listeners) {
                    target.on(eventName, _listeners[j]);
                }
            } else {
                target.on(eventName, _listeners);
            }
        }
    }
}

export const FmObservable = {
    name: "observable",
    install(){
        fabric.util.initEventListeners = initEventListeners
        Object.assign(fabric.util, Observable);
    },
    prototypes: {
        Editor: Observable,
        Object: [
            Observable,
            {
                initEventListeners(el) {
                    initEventListeners(this,el);
                }
            }
        ],
        IText: Observable,
        Textbox: Observable,
        Image: Observable,
        StaticCanvas: [
            Observable,
            {
                initEventListeners(el) {
                    initEventListeners(this,el);
                }
            }
        ],
        Canvas: Observable
    }
}

function getDefaultEventListeners(target){
    let _protoListerens = target && target.__proto__ && target.__proto__.type && getDefaultEventListeners(target.__proto__) || {}
    let _defaultListerens = target.eventListeners && fabric.util.object.clone(target.eventListeners) || {}

    Object.assign(_protoListerens,_defaultListerens)
    return _protoListerens
}

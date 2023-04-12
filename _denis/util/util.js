

export function clone(object, deep) {
	if (deep) {
		return deepClone(object);
	} else {
		return Object.assign({}, object);
	}
}

export function defaults(dest, source) {
	for (let key in source) {
		if (dest[key] === undefined) {
			dest[key] = source[key]
		}
	}
	return dest;
}

export function deepExtend(/*obj_1, [obj_2], [obj_N]*/) {
	if (arguments.length < 1 || typeof arguments[0] !== 'object') {
		return false;
	}
	if (arguments.length < 2) return arguments[0];

	let target = arguments[0];

	// convert arguments to array and cut off target object
	let args = Array.prototype.slice.call(arguments, 1);

	let key, val, src, clone, tmpBuf;

	args.forEach(function (obj) {
		if (typeof obj !== 'object') return;

		for (key in obj) {
			if (!(key in obj)) continue;

			src = target[key];
			val = deepClone(obj[key]);


			if (typeof src !== 'object' || src === null) {
				target[key] = val;
			} else if (Array.isArray(val)) {
				// clone = (Array.isArray(src)) ? src : [];
				//
				// val.forEach(function(item){
				//   clone.push(deepClone(item));
				// });
				target[key] = deepClone(val);
				//target[key] = deepExtend(clone, val);
			} else {
				clone = (!Array.isArray(src)) ? src : {};
				target[key] = deepExtend(clone, val);
			}

		}
	});

	return target;
}

export function deepClone(val) {
	if (typeof val === 'undefined') {
		return undefined;
	}

	if (val === null) {
		return null;
	} else if (val instanceof Date) {
		return new Date(val.getTime());
	} else if (val instanceof RegExp) {
		return new RegExp(val);
	}

	if (val.clone) {
		return val.clone();
	} else if (val.constructor === Object) {
		return deepExtend({}, val);
	} else if (val.constructor === Array) {
		let clone = [];
		for (let i = 0; i < val.length; i++) {
			clone.push(deepClone(val[i]));
		}
		return clone;
	} else {
		return val;
	}
}

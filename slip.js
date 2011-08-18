(function(window, undefined) {

var slip = window.slip = window.slip || {},
    basicTypes = { number: Number, boolean: Boolean, string: String, date: Date, array: Array },
    objToString = Object.prototype.toString,
    typeTest = /^\[object (Number|Boolean|String|Date|Array)\]$/;


/**
 * Returns one of 7 types for an object: "object", "number", "string",
 * "boolean", "date", "array", and "undefined". This is more general than
 * typeof, working correctly for instances of Number, String, and Boolean.
 * However, it doesn't detect functions, as there is currently no need in Slip.
 */
slip.typeOf = function(obj, t) {
    if (obj === undefined)
        return "undefined";

    t = typeof obj;
    if (basicTypes[t])
        return t;

    for (t in basicTypes)
        if (basicTypes.hasOwnProperty(t))
            if (obj instanceof basicTypes[t])
                return t;

    if (t = typeTest.exec(objToString.call(obj)))
        return t[1].toLowerCase();

    return "object";
};


/**
 * Wraps and returns the function fn, by "unpacking" the argIdx-th argument.
 * This assumes that the argument in the argIdx-th position is an array. It
 * will then replace that argument with the arrays elements as individual
 * arguments. So, for example,
 * 
 * slip.unpack(function(a,b,c) { return a + b + c }, 1)(1, [ 1, 1 ]) == 3
 * 
 * @param fn A function to wrap.
 * @param argIdx The position of the argument to unpack.
 * @return The wrapped function.
 */
slip.unpack = function(fn, argIdx) {
	return function() {
		var origargs = arguments,
			i = 0, len = origargs.length,
			args = [];
		for (argIdx = argIdx || 0; i < len; i++) {
			if (i == argIdx)
				args.push.apply(args, origargs[i]);
			else
				args.push(origargs[i]);
		}
		return fn.apply(this, args);
	}
};

})(this);

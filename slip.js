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
function typeOf(obj, t) {
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


slip.typeOf = typeOf;

})(this);

(function(global, undefined) {

var slip = global.slip = global.slip || {},
    Deferred = slip.Deferred,
    typeOf = slip.typeOf;


/**
 * A Context is just a generalized asynchronous object. While it is certainly
 * more complex than your average JSON object, it is also much more flexible.
 * Almost all of the methods on a context return another context. The only
 * exceptions are `.get()` (called without paramters) and `.forEach(...)`
 * which return `Promise`s instead.
 * 
 * The most notable limitation is that there is no way to synchronously access
 * the value stored in the context (because it may not be known yet). However,
 * Context comes with the standard battery of functional methods, like map,
 * flatMap, filter, reduce, and zip that can be chained together to let you
 * manipulate the values.
 * 
 * The constructor takes an optional value that can either be a regular JSON
 * value (list, string, object, array, boolean, etc) or it can be a `Deferred`
 * instead. Either way, how you access the context does not change. If `val`
 * is omitted or undefined, then an empty `Context` is created.
 */
function Context(val, parent) {
    var type = this.type = typeOf(val),
        def = slip.isDeferred(val) ? val : new slip.Deferred().set(val).promise;

    this.get = function(p) {
    	if (arguments.length) {
    		return this.flatMap(function(obj) { return obj[p] });
    		// return new Context(this.get().then(function(obj) { return obj[p] }), this);
    	} else {
    		return def.promise;
    	}
    };
}

/**
 * Iterates over the elements of this context, calling `fn` each time with 3
 * arguments: element, index, context. The argument `element` holds the current
 * element, `index` is the index, and context is this context. This can also
 * take an optional `self` parameter, which will the function will be bound to
 * when it is called (ie. `self` will becomes `this` in `fn`).
 * 
 * This returns a promise that will resolve to an undefined value when the
 * iteration has completed. This let's you chain your actions, even though
 * 
 */
Context.prototype.forEach = function(fn, self) {
    var ctx = this;

    return this.get().then(function(val) {
        var type = typeOf(val);

        if (type == "array") {
            for (var p in val) {
                if (val.hasOwnProperty(p))
                    fn.call(self, val[p], p, ctx);
            }
        } else if (type != "undefined") {
            fn.call(self, val, 0, ctx);
        }
    });
};


Context.prototype.flatMap = function(fn, self) {
    var defs = [],
        result = [],
        i = 0;
    this.forEach(function() {
        var ctx = fn.apply(self, arguments),
            pos = i++;
        ctx = ctx instanceof Context ? ctx : new Context(ctx);
        result[pos] = [];

        defs.push(ctx.forEach(function(x) {
            result[pos].push(x);
        }));
    });

    return new Context(slip.when.apply(slip, defs).then(function() {
        var x = [],
            i = 0,
            len = result.length;
        for (; i < len; i++)
            x.push.apply(x, result[i]);
        return x;
    }));
};

Context.prototype.map = function(fn, self) {
    var result = [],
        i = 0,
        defs = [];
    this.forEach(function() {
        var r = fn.apply(self, arguments),
            pos = i++;

        if (slip.isDeferred(r)) {
            defs.push(r.get(function(x) {
                result[pos] = x;
            }));
        } else {
            result[pos] = r;
        }
    });

    return new Context(slip.when.apply(slip, defs).then(function() { return result }));
};

Context.prototype.filter = function(fn, self) {
	/*
	Longer in characters, shorter in time.
	return this.reduce(function(acc, x, i, ctx) {
		if (fn.call(self, x, i, ctx))
			acc.push(x);
		return acc;
	}, []);
	*/
    return this.flatMap(function(x) {
        return fn.apply(self, arguments) ? x : undefined;
    });
};

Context.prototype.reduce = function(fn, acc, self) {
	return new Context(this.forEach(function(x, i, ctx) {
		acc = fn.call(self, acc, x, i, ctx);
	}).then(function() { return acc }).promise);
};

Context.prototype.zip = function(other) {
	var args = Array.prototype.slice.call(arguments),
		defs = [],
		i = 0, len = arguments.length;
	args.unshift(this);
	
	for (; i <= len; i++)
		defs.push(args[i].get().then(function(x) {
			return slip.typeOf(x) != "array" ? (x ? [ x ] : []) : x; 
		}));
		
	return new Context(slip.when.apply(slip, defs).then(function(pile) {
		var result = [],
			i = pile.length, j;
		while (i--)
			j = j < pile[i].length ? j : pile[i].length;
		while (j--) {
			result[j] = [];
			for (i = pile.length; i--;)
				result[j][i] = pile[i][j];
		}
		return result;
	}));
};

Context.prototype._log = function() { this.forEach(function(x) { console.log(x) }) };


slip.Context = Context;
slip.ctx = function(obj) { return new Context(obj) };

})(this);

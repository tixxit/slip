(function(global, undefined) {

var slip = global.slip = global.slip || {},
    Deferred = slip.Deferred,
    typeOf = slip.typeOf,
    transforms = {},
    transformOrder = [];


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
    	def = slip.deferred(val),
    	i = 0, len = transformOrder.length;
    
    this.get = function(p) {
    	if (arguments.length) {
    		return this.flatMap(function(obj) { return obj[p] });
    	} else {
    		return def.promise;
    	}
    };
    
    this.parent = parent = parent || slip.context.empty;
    
    for (; i < len; i++) (function(t) {
    	def = def.then(function(obj) {
    		var result;
    		
    		if (slip.typeOf(obj) == "array") {
    			result = []; 
    			for (var j = 0, len = obj.length; j < len; j++)
    				result[j] = slip.deferred(transforms[t].call(parent, obj[j]));
    			result = slip.when(result);
    		} else {
    			result = transforms[t].call(parent, obj);
    		}
    		return result;
    	});
    })(transformOrder[i]);
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
        i = 0,
        def = new slip.Deferred();
    
    this.forEach(function() {
        var ctx = fn.apply(self, arguments),
            pos = i++;
        ctx = ctx instanceof Context ? ctx : new Context(ctx, this);
        result[pos] = [];

        defs.push(ctx.forEach(function(x) {
            result[pos].push(x);
        }));
    }, this).get(function() {
    	slip.when(defs)
        	.get(function() {
		        var x = [],
		            i = 0,
		            len = result.length;
		        for (; i < len; i++)
		            x.push.apply(x, result[i]);
		        def.set(x);
		    })
		    .error(function() { def.reject(); })
    });

    return new Context(def.promise, this);
};

Context.prototype.map = function(fn, self) {
    var result = [],
        i = 0,
        defs = [];
    this.forEach(function() {
        var r = fn.apply(self, arguments),
            pos = i++;

        defs.push(slip.deferred(r).get(function(x) {
            result[pos] = x;
        }));
    });

    return new Context(slip.when.apply(slip, defs).then(function() { return result }), this);
};

Context.prototype.filter = function(fn, self) {
	return this.flatMap(function(x) {
        return fn.apply(self, arguments) ? x : undefined;
    });
};

Context.prototype.reduce = function(fn, acc, self) {
	return new Context(this.forEach(function(x, i, ctx) {
		acc = fn.call(self, acc, x, i, ctx);
	}).then(function() { return acc }).promise, this);
};

Context.prototype.zip = function(other) {
	var args = Array.prototype.slice.call(arguments),
		defs = [],
		i = 0, len = arguments.length;
	args.unshift(this);
	
	for (; i <= len; i++)
		defs.push(args[i].get().then(function(x) {
			return slip.typeOf(x) != "array" ? (x !== undefined ? [ x ] : []) : x; 
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
slip.context = function(obj) { return obj instanceof Context ? obj : new Context(obj) };

slip.context.empty = new Context();
slip.context.empty.parent = slip.context.empty;

slip.context.transform = function(name, t) {
	transforms[name] = t;
	transformOrder.push(name);
};

})(this);

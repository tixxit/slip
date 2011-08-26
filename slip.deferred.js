(function(global, undefined) {

var slip = global.slip = global.slip || {},
    bind = function(fn, self) {
        return function() { return fn.apply(self, arguments) }
    },
    method = function() { throw new Error("Not implemented.") };


function Promise() { };
Promise.prototype = {
    get: method,
    error: method,
    then: method,
    promise: null
};

/**
 * Provides an implementation of Deferreds/Futures/Promises/whatever the JS
 * community feels like calling them. The most important thing is that a
 * slip.Deferred will always provide at least 5 methods and 1 field.
 *  
 *  .get(cb): Adds a callback listener for when the value is set and returns
 *            the deferred (or promise). If this deferred has already been
 *            resolved, and hasn't failed, the cb will be called immediately
 *            with the value.
 *
 *  .set(val): Sets the value of this future. This can only be called if the
 *            Deferred has not been resolved, otherwise it is ignored.
 *
 *  .error(cb): Adds a callback listener for errors when resolving this
 *            deferred. If the deferred has already been resolved and failed
 *            then the callback will be called immediately.
 *
 *  .reject(msg): Sets the state of the future as failed and calls all
 *            subscribed error listeners with the given message (msg).
 *
 *  .then(getCb, errorCb): This calls get(getCb) and error(errorCb) on this
 *            Deferred, but returns a new promise whose value and error
 *            messages are those returned by getCb(val) and errorCb(msg).
 *            Thus, you can use this to chain deferreds.
 *
 *  .promise: This provides a read-only view of a Deferred. It only has subset
 *            the Deferred's methods/fields; namely, .get(), .error(), .then()
 *            and .promise.
 */
function Future() {
    var val,
        msg,
        resolved = false,
        failed = false,
        observers = [],
        sadists = [],
        promise = new Promise();

    this.get = function(fn, self) {
        if (fn) {
            if (resolved) {
                if (!failed)
                    fn.call(self, val);
            } else {
                observers.push({ cb: fn, self: self });
            }
        }
        return this;
    };

    this.error = function(fn, self) {
        if (fn) {
            if (resolved) {
                if (failed)
                    fn.call(self, msg);
            } else {
                sadists.push({ cb: fn, self: self });
            }
        }
        return this;
    };

    this.set = function(x) {
        if (!resolved) {
            val = x;
            resolved = true;
            
            for (var i = 0, len = observers.length, obs; i < len; i++) {
                obs = observers[i];
                obs.cb.call(obs.self, val);
            }

            observers = sadists = undefined;
        }
        return this;
    };

    this.reject = function(x) {
        if (!resolved) {
            msg = x;
            resolved = true;
            failed = true;

            for (var i = 0, len = sadists.length, obs; i < len; i++) {
                obs = sadists[i];
                obs.cb.call(obs.self, msg);
            }

            sadists = observers = undefined;
        }
        return this;
    };

    this.isResolved = function() { return resolved };
    this.isRejected = function() { return failed };

    this.promise = promise.promise = (function(f, proxy) {
            var props =  [ "then", "get", "error", "isResolved", "isRejected", "always" ],
                i = props.length;
            while (i--)
                proxy[props[i]] = bind(f[props[i]], proxy);
            return proxy;
        })(this, promise);
};

Future.prototype = new Promise();

Future.prototype.then = function(s, f, self) {
    var f = new Future();
    this.get(function(val) {
            f.set(s ? s.call(this, val) : val);
        }, self)
        .error(function(msg) {
            f.reject(f ? f.call(this, msg) : msg);
        }, self);
    return f.promise;
};
Future.prototype.always = function(fn) { return this.get(fn).error(fn) };


slip.Deferred = Future;
slip.isDeferred = function(d) { return d instanceof Promise };
slip.when = function() {
    var args = arguments,
        i = 0,
        len = args.length,
        errors = [],
        values = [],
        resolved = 0,
        def = new Future();

    for (; i < len; i++) (function(arg, i) {
        arg.get(function(val) {
                values[i] = val;
            })
            .error(function(msg) {
                errors[i] = msg;
            })
            .always(function() {
                resolved += 1;
                if (resolved == len) {
                    if (errors.length)
                        def.reject(errors);
                    else
                        def.set(values);
                }
            });
    })(args[i], i);

    if (len == 0)
        def.set(values);

    return def.promise;
};


var wrappers = slip.wrapDeferred = [
	(function(obj) { return slip.isDeferred(obj) && obj })
];

// Add a wrapper for jQuery deferreds.

if (global.jQuery) {
	wrappers.push(function(obj) {
		if (obj.then && obj.pipe) {
			var f = new Future();
			obj.then(bind(f.set, f), bind(f.error, f));
			return f.promise;
		}
	});
}


/**
 * This will map obj to a Deferred. First, if obj is already a Deferred, then
 * it is returned as-is. Otherwise, if obj is another type of deferred (ie.
 * from jQuery or Dojo), then it will return a slip.Deferred that is equivalent
 * to that deferred. Otherwise, obj is assumed to be a constant value and an
 * already-set Promise is returned whose value is obj.
 * 
 * @param A slip.Deferred, jQuery.Deferred, or any other value.
 * @return a slip.Deferred.
 */
slip.asDeferred = function(obj) {
	for (var i = 0, len = wrappers.length, def; i < len; i++)
		if (def = wrappers[i](obj))
			return def;
	
	return new Future().set(obj).promise;
};

})(this);

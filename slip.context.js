(function(global, undefined) {

var slip = global.slip = global.slip || {},
    Deferred = slip.Deferred,
    typeOf = slip.typeOf;


function Context(val, parent) {
    var type = this.type = typeOf(val),
        def = slip.isDeferred(val) ? val : new slip.Deferred().set(val).promise;
   
    this.get = function(cb) {
        return def.get(cb);
    };
}


Context.prototype.forEach = function(fn, self) {
    var ctx = this;

    return this.get().then(function(val) {
        var type = typeOf(val);

        if (type == "array" || type == "object") {
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
    return this.flatMap(function(x) {
        return fn.apply(self, arguments) ? x : undefined;
    });
};


slip.Context = Context;
slip.ctx = function(obj) { return new Context(obj) };

})(this);

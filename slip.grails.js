/**
 * Adds a simple transform that maps Grails' style "circular" references in
 * JSON correctly. That is, if an object has a property _ref, it will replace
 * that object with the object referred to by it. For example,
 * 
 * 	var ctx = { a: 1, b: { c: { _ref: "../.." } } };
 * 	slip.path.eval("b.c.a", ctx)._log();
 * 
 * Would print 1, as expected.
 */
(function(slip, undefined) {

slip.context.transform("grails-circ", function(obj) {
	if (obj && obj._ref && /^\.\.(\/\.\.)*$/.test(obj._ref)) {
		var ref = obj._ref.split("/"),
			i = ref.length - 1,
			ctx = this;
		while (i--)
			ctx = ctx.parent;
		return ctx.get();
	}
	return obj;
});

})(slip);
